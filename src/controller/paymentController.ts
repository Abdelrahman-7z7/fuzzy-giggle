import catchAsync from "../utils/catchAsync";
import AppError from "../utils/AppError";
import { NextFunction, Request, Response } from "express";
import { supabaseSecret } from "../config/supabaseConfig";
import {releaseLock, acquireLock} from '../utils/redisLock'
import {v4 as uuidv4} from 'uuid'
import * as emailService from '../utils/emailService'
import iyzicoService from "../utils/iyzicoService";

export const createPayment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const {
    client_name,
    client_email,
    client_phone,
    country,
    product_list,
    message,
    contribution_types
  } = req.body;

  // Basic validation
  if (!client_name || !client_email || !client_phone || !country || !Array.isArray(product_list) || product_list.length === 0) {
    return next(new AppError('Missing or invalid fields', 400));
  }

  // 🔐 Redis Lock (global lock per phone)
  const redisKey = `lock:payment:${client_phone}`;
//   const isLocked = await redis.set(redisKey, 'locked', 'NX', 'EX', 30); // 30s lock

  const isLocked = await acquireLock(redisKey, 30);

  if (!isLocked) {
    return next(new AppError('You have a pending payment request. Please wait.', 429));
  }

  try {
    const productIds = product_list.map((p: any) => p.product_id);

    const { data: products, error: fetchError } = await supabaseSecret
      .from('products')
      .select('*')
      .in('id', productIds);

    if (fetchError || !products || products.length !== productIds.length) {
      throw new AppError('One or more products are invalid', 400);
    }

    // Enrich product objects with quantity
    const enrichedProducts = products.map((product) => {
      const item = product_list.find((p: any) => p.product_id === product.id);
      return {
        ...product,
        quantity: item?.quantity || 1
      };
    });

    const total = enrichedProducts.reduce((sum, p) => sum + Number(p.price) * p.quantity, 0);

    // Step 1: Insert payment
    const { data: payment, error: paymentError } = await supabaseSecret
      .from('payments')
      .insert({
        client_name,
        client_email,
        client_phone,
        country,
        message,
        method: 'iyzico',
        total,
        currency: 'TRY',
        contribution_types,
        product_ids: productIds
      })
      .select('*')
      .single();

    if (paymentError || !payment) {
      throw new AppError('Failed to create payment record', 500);
    }

    // Step 2: Create payment session
    const sessionId = uuidv4();

    const { data: session, error: sessionError } = await supabaseSecret
      .from('payment_sessions')
      .insert({
        id: sessionId,
        payment_id: payment.id,
        status: 'pending'
      })
      .select('*')
      .single();

    if (sessionError || !session) {
      throw new AppError('Failed to create payment session', 500);
    }

    // Step 3: Trigger Iyzico session
    const { paymentPageUrl, conversationId } = await iyzicoService.createPayment({
      payment,
      products,
      sessionId
    });

    if (!paymentPageUrl || !conversationId) {
      await supabaseSecret
        .from('payment_sessions')
        .update({ status: 'failed', error_message: 'Failed to create iyzico session' })
        .eq('id', sessionId);

      throw new AppError('Payment session could not be started', 502);
    }

    // Step 4: Update session with provider ID
    await supabaseSecret
      .from('payment_sessions')
      .update({ provider_id: conversationId })
      .eq('id', sessionId);

    await supabaseSecret
      .from('payments')
      .update({ provider_id: conversationId })
      .eq('id', payment.id);

    // Success → return redirect URL
    res.status(200).json({
      status: 'success',
      redirect: paymentPageUrl
    });
  } finally {
    // 🧹 Release Redis Lock
    await releaseLock(redisKey);
  }
});


export const handleWebhook = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { token, conversationId } = req.body;

  if (!token || !conversationId) {
    return res.status(400).json({ message: 'Missing token or conversationId' });
  }

  const redisKey = `lock:webhook:${conversationId}`;
  const isLocked = await acquireLock(redisKey, 60);

  if (!isLocked) return res.status(429).send('Already processing');

  try {
    const verification = await iyzicoService.verifyPayment({ token, conversationId });

    const { data: session, error: sessionError } = await supabaseSecret
      .from('payment_sessions')
      .select('*, payments(*)')
      .eq('id', conversationId)
      .single();

    if (sessionError || !session || !session.payments) {
      return next(new AppError('session not found', 404))
    }

    if (verification.status === 'success') {
      await supabaseSecret
        .from('payment_sessions')
        .update({ status: 'succeeded' })
        .eq('id', conversationId);

      await supabaseSecret
        .from('payments')
        .update({ payment_status: 'paid', provider_id: token })
        .eq('id', session.payment_id);

      await emailService.sendClientThankYou(session.payments);
      await emailService.sendAdminNotification(session.payments);

      res.status(200).send('Webhook processed');
    } else {
      await supabaseSecret
        .from('payment_sessions')
        .update({ status: 'failed', error_message: 'Verification failed' })
        .eq('id', conversationId);

      await supabaseSecret
        .from('payments')
        .update({ payment_status: 'cancelled' })
        .eq('id', session.payment_id);

    //   res.status(400).send('Payment verification failed');
      return next(new AppError('Payment verification failed', 400))
    }
  } finally {
    await releaseLock(redisKey);
  }
});
