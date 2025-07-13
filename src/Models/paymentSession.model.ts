export type PaymentSessionStatus =
  | 'pending'
  | 'processing'
  | 'failed'
  | 'succeeded';

export interface PaymentSession {
  id: string; // uuid
  payment_id?: string | null; // fk to payments
  provider_session_id?: string | null;
  status?: PaymentSessionStatus; // optional, defaults to 'pending'
  error_message?: string | null;
  created_at?: string | null; // ISO date
}
