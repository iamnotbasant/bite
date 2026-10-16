export interface CustomFoodRow {
  id: string;
  user_id: string;
  name: string;
  brand?: string | null;
  description?: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number | null;
  sugar?: number | null;
  sodium?: number | null;
  saturated_fat?: number | null;
  trans_fat?: number | null;
  monounsaturated_fat?: number | null;
  polyunsaturated_fat?: number | null;
  cholesterol?: number | null;
  calcium?: number | null;
  iron?: number | null;
  potassium?: number | null;
  vitamin_a?: number | null;
  vitamin_c?: number | null;
  serving_size_qty?: number | null;
  serving_size_unit?: string | null;
  serving_weight_grams?: number | null;
  serving_equivalent_unit?: string | null;
  servings_per_container?: number | null;
  default_portion?: string | null;
  category?: string | null;
  image_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  micros_json?: string | Record<string, unknown> | null;
}

export interface FoodLogRow {
  id: string;
  user_id: string;
  date: string;
  name: string;
  brand?: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number | null;
  saturated_fat?: number | null;
  trans_fat?: number | null;
  sodium?: number | null;
  sugar?: number | null;
  portion: string;
  category: string;
  timestamp: string;
  image_url?: string | null;
  created_at?: string | null;
}
