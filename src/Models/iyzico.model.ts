import type { Database } from '../types/supabase';

type Payment = Database['public']['Tables']['payments']['Row'];
type Product = Database['public']['Tables']['products']['Row'] & { quantity: number };

export interface CreatePaymentParams {
  payment: Payment;
  products: Product[];
  sessionId: string;
}

export interface IyzicoInitRequest {
  locale: string;
  conversationId: string;
  price: string;
  paidPrice: string;
  currency: string;
  basketId: string;
  paymentGroup: string;
  callbackUrl: string;
  enabledInstallments: number[];
  buyer: {
    id: string;
    name: string;
    surname: string;
    gsmNumber: string;
    email: string;
    identityNumber: string;
    registrationAddress: string;
    city: string;
    country: string;
    zipCode: string;
    ip: string;
  };
  shippingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
    zipCode: string;
  };
  billingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
    zipCode: string;
  };
  basketItems: {
    id: string;
    name: string;
    category1: string;
    itemType: string;
    price: string;
  }[];
}

export interface IyzicoInitResponse {
  status: 'success' | 'failure';
  paymentPageUrl: string;
  conversationId: string;
  errorMessage?: string;
}

