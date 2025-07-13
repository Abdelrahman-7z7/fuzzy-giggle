// src/services/iyzicoService.ts
import Iyzipay  from 'iyzipay';
import iyzipay from '../config/iyzipayConfig';
import type { CreatePaymentParams, IyzicoInitRequest, IyzicoInitResponse } from '../Models/iyzico.model';

const createPayment = async ({ payment, products, sessionId }: CreatePaymentParams) => {
  const totalPrice = products.reduce((sum, p) => sum + Number(p.price) * p.quantity, 0);

  const basketItems = products.map((product) => ({
    id: product.id,
    name: product.title,
    category1: product.category,
    itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
    price: (Number(product.price) * product.quantity).toFixed(2)
  }));

  const request: IyzicoInitRequest = {
    locale: Iyzipay.LOCALE.EN,
    conversationId: sessionId,
    price: totalPrice.toFixed(2),
    paidPrice: totalPrice.toFixed(2),
    currency: Iyzipay.CURRENCY.TRY,
    basketId: sessionId,
    paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
    callbackUrl: `${process.env.BASE_URL}/api/payments/webhook`, //update the base url to the render and then adjust the route to match your webhook
    enabledInstallments: [2, 3, 6, 9],
    buyer: {
      id: payment.client_phone,
      name: payment.client_name,
      surname: '-',
      gsmNumber: payment.client_phone,
      email: payment.client_email,
      identityNumber: '11111111111',
      registrationAddress: 'Unknown address',
      city: 'Istanbul',
      country: payment.country,
      zipCode: '34000',
      ip: '85.34.78.112'
    },
    shippingAddress: {
      contactName: payment.client_name,
      city: 'Istanbul',
      country: payment.country,
      address: 'No address',
      zipCode: '34000'
    },
    billingAddress: {
      contactName: payment.client_name,
      city: 'Istanbul',
      country: payment.country,
      address: 'No address',
      zipCode: '34000'
    },
    basketItems
  };

  return new Promise<{ paymentPageUrl: string | null; conversationId: string | null }>((resolve) => {
    iyzipay.checkoutFormInitialize.create(request as any, (err: unknown, result: unknown) => {
      const res = result as IyzicoInitResponse;
      if (err || res?.status !== 'success') {
        return resolve({ paymentPageUrl: null, conversationId: null });
      }
      resolve({ paymentPageUrl: res.paymentPageUrl, conversationId: res.conversationId });
    });
  });
};

const verifyPayment = async (callbackData: { token: string; conversationId: string }) => {
  const request = {
    locale: Iyzipay.LOCALE.EN,
    conversationId: callbackData.conversationId,
    token: callbackData.token
  };

  return new Promise<{ status: 'success' | 'fail'; conversationId?: string; paymentStatus?: string }>((resolve) => {
    iyzipay.checkoutForm.retrieve(request, (err, result) => {
      if (err || result?.status !== 'success') {
        return resolve({ status: 'fail' });
      }
      resolve({
        status: 'success',
        conversationId: result.conversationId,
        paymentStatus: result.paymentStatus
      });
    });
  });
};

export default {
  createPayment,
  verifyPayment
};

