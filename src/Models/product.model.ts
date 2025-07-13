export type ProductCategory =
  | 'camel'
  | 'sheep'
  | 'cow'
  | 'food_supplements'
  | 'meal';

export type HealthStatus = 'excellent' | 'good' | 'fair' | 'poor';

export interface Product {
  id: string; // uuid
  title: string;
  description?: string | null;
  price: number; // numeric(10, 2)
  size?: string | null;
  category: ProductCategory;
  age: number; // smallint
  health_status: HealthStatus;
  created_at?: string | null; // ISO 8601 string
  image_url: string;
  image_path: string;
}
