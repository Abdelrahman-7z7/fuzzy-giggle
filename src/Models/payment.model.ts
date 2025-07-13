import { ProductCategory } from "./product.model";

export type Currency = 'TRY' | 'USD' | 'EUR';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'cancelled'
  | 'refunded';

export interface Payment {
  id: string; // uuid
  client_name: string;
  client_email: string;
  client_phone: string;
  country: string; // e.g. "TR", "JO", etc.

  product_ids: string[]; // uuid[]
  contribution_types: ProductCategory[]; // multiple categories

  method: 'iyzico'; // fixed for now
  payment_status: PaymentStatus;

  provider_id?: string | null;
  total: number; // numeric
  currency: Currency;
  message?: string | null;

  created_at?: string | null; // ISO date
  updated_at: string; // updated via trigger
}
