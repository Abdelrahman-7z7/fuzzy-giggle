// src/services/emailService.ts
import { Database } from '../types/supabase'; // or wherever your types are
type Payment = Database['public']['Tables']['payments']['Row'];

import brevoClient, { SENDER, ADMIN_EMAIL } from '../config/brevoConfig';

export const sendClientThankYou = async (payment: Payment) => {
  const message = {
    sender: SENDER,
    to: [{ email: payment.client_email, name: payment.client_name }],
    subject: 'Thank you for your contribution!',
    htmlContent: `
      <p>Hello ${payment.client_name},</p>
      <p>We would like to thank you for your generous contribution of <strong>${payment.total} ${payment.currency}</strong>.</p>
      <p>We truly appreciate your support.</p>
      <br/>
      <p>Best regards,<br/>Tamkeen Organization<br/>Phone: +905423659852</p>
    `
  };

  await brevoClient.sendTransacEmail(message);
};

export const sendAdminNotification = async (payment: Payment) => {
  const message = {
    sender: SENDER,
    to: [{ email: ADMIN_EMAIL, name: 'Admin' }],
    subject: `New Order Received - ${payment.client_name}`,
    htmlContent: `
      <p>A new order has been completed.</p>
      <ul>
        <li><strong>Name:</strong> ${payment.client_name}</li>
        <li><strong>Phone:</strong> ${payment.client_phone}</li>
        <li><strong>Email:</strong> ${payment.client_email}</li>
        <li><strong>Country:</strong> ${payment.country}</li>
        <li><strong>Total:</strong> ${payment.total} ${payment.currency}</li>
        <li><strong>Message:</strong> ${payment.message || '-'}</li>
        <li><strong>Contribution Types:</strong> ${payment.contribution_types.join(', ')}</li>
        <li><strong>Iyzico Payment ID:</strong> ${payment.provider_id || 'N/A'}</li>
      </ul>
    `
  };

  await brevoClient.sendTransacEmail(message);
};

export default {
  sendClientThankYou,
  sendAdminNotification
};
