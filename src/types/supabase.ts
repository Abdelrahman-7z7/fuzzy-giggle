export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export type ProductCategory =
  | 'camel'
  | 'sheep'
  | 'cow'
  | 'food_supplements'
  | 'meal';

export type HealthStatus = 'excellent' | 'good' | 'fair' | 'poor';

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string; // uuid
          title: string;
          description: string | null;
          price: number;
          size: string;
          category: ProductCategory;
          age: number;
          health_status: HealthStatus;
          image_url: string;
          image_path: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          price: number;
          size?: string | null;
          category: ProductCategory;
          age: number;
          health_status?: HealthStatus;
          image_url: string;
          image_path: string;
          created_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };

      payments: {
        Row: {
          id: string;
          client_name: string;
          client_email: string;
          client_phone: string;
          country: string;
          product_ids: string[];
          contribution_types: ProductCategory[];
          method: 'iyzico';
          payment_status: 'pending' | 'paid' | 'cancelled' | 'refunded';
          provider_id: string | null;
          total: number;
          currency: 'TRY' | 'USD' | 'EUR';
          message: string | null;
          created_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_name: string;
          client_email: string;
          client_phone: string;
          country: string;
          product_ids: string[];
          contribution_types: ProductCategory[];
          method?: 'iyzico';
          payment_status?: 'pending' | 'paid' | 'cancelled' | 'refunded';
          provider_id?: string | null;
          total: number;
          currency?: 'TRY' | 'USD' | 'EUR' | 'JOD';
          message?: string | null;
          created_at?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['payments']['Insert']>;
      };

      payment_sessions: {
        Row: {
          id: string;
          payment_id: string | null;
          provider_session_id: string | null;
          status: 'pending' | 'processing' | 'failed' | 'succeeded';
          error_message: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          payment_id?: string | null;
          provider_session_id?: string | null;
          status?: 'pending' | 'processing' | 'failed' | 'succeeded';
          error_message?: string | null;
          created_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['payment_sessions']['Insert']>;
      };
    };
  };
}
