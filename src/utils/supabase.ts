import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { FoodLibraryItem, MealItem } from '../types';
import { getDeviceUuid } from './device';
import { categoryFromAdmin, isSnackFood } from './snackTags';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('your-project')
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/** The shared identity: this browser's persistent device UUID = user_id. */
export const deviceUserId = (): string => getDeviceUuid();

const nowIso = () => new Date().toISOString();

// ============================================================================
// Custom Foods
// ============================================================================

export interface RemoteCustomFoodRow {
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
  serving_size_qty?: number | null;
  serving_size_unit?: string | null;
  serving_weight_grams?: number | null;
  default_portion?: string | null;
  image_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export function customFoodToRow(food: FoodLibraryItem, userId: string): Record<string, unknown> {
  return {
    id: food.id,
    user_id: userId,
    name: food.name,
    brand: food.brand || null,
    description: food.description || null,
    calories: food.calories,
    protein: food.protein,
    carbs: food.carbs,
    fat: food.fat,
    fiber: food.fiber ?? null,
    sugar: food.sugar ?? null,
    sodium: food.sodium ?? null,
    serving_size_qty: food.servingSizeQty ?? 1,
    serving_size_unit: food.servingSizeUnit ?? 'serving',
    serving_weight_grams: food.servingWeightGrams ?? 100,
    default_portion: food.defaultPortion,
    image_url: food.imageUrl ?? null,
    updated_at: nowIso(),
  };
}

export function customFoodFromRow(row: RemoteCustomFoodRow): FoodLibraryItem {
  // Snack tagging: respect the food's stored category instead of forcing
  // everything to lunch (that bug made snack foods show as lunch).
  return {
    id: row.id,
    name: row.name,
    brand: row.brand || undefined,
    description: row.description || undefined,
    calories: Number(row.calories) || 0,
    protein: Number(row.protein) || 0,
    carbs: Number(row.carbs) || 0,
    fat: Number(row.fat) || 0,
    fiber: row.fiber ? Number(row.fiber) : undefined,
    sugar: row.sugar ? Number(row.sugar) : undefined,
    sodium: row.sodium ? Number(row.sodium) : undefined,
    servingSizeQty: row.serving_size_qty ? Number(row.serving_size_qty) : 1,
    servingSizeUnit: row.serving_size_unit || 'serving',
    servingWeightGrams: row.serving_weight_grams ? Number(row.serving_weight_grams) : 100,
    defaultPortion: row.default_portion || '1 serving',
    category: isSnackFood(row.name, (row as { category?: string | null }).category)
      ? 'snack'
      : categoryFromAdmin((row as { category?: string | null }).category),
    tagId: 'custom',
    imageUrl: row.image_url || undefined,
  };
}

export async function fetchCustomFoodsFromSupabase(): Promise<FoodLibraryItem[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('custom_foods')
      .select('*')
      .eq('user_id', deviceUserId())
      .order('updated_at', { ascending: false });
    if (error) {
      console.warn('Supabase fetch custom_foods error:', error.message);
      return null;
    }
    return (data || []).map(customFoodFromRow);
  } catch (err) {
    console.warn('Error reading from Supabase:', err);
    return null;
  }
}

export async function fetchCustomFoodRows(): Promise<RemoteCustomFoodRow[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('custom_foods')
      .select('*')
      .eq('user_id', deviceUserId());
    if (error) return null;
    return (data || []) as RemoteCustomFoodRow[];
  } catch {
    return null;
  }
}

export async function upsertCustomFoodToSupabase(food: FoodLibraryItem): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('custom_foods')
      .upsert(customFoodToRow(food, deviceUserId()), { onConflict: 'id' });
    if (error) {
      console.warn('Supabase upsert custom_food failed:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Error upserting custom food to Supabase:', err);
    return false;
  }
}

export async function deleteCustomFoodFromSupabase(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('custom_foods')
      .delete()
      .eq('id', id)
      .eq('user_id', deviceUserId());
    if (error) {
      console.warn('Supabase delete custom_food failed:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Error deleting custom food from Supabase:', err);
    return false;
  }
}

// ============================================================================
// Food Logs
// ============================================================================

export interface RemoteFoodLogRow {
  id: string;
  user_id: string;
  date: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number | null;
  sugar?: number | null;
  sodium?: number | null;
  portion?: string | null;
  category?: string | null;
  timestamp?: string | null;
  image_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export function foodLogToRow(date: string, meal: MealItem, userId: string): Record<string, unknown> {
  return {
    id: meal.id,
    user_id: userId,
    date,
    name: meal.name,
    calories: meal.calories,
    protein: meal.protein,
    carbs: meal.carbs,
    fat: meal.fat,
    fiber: meal.fiber ?? null,
    sugar: meal.sugar ?? null,
    sodium: meal.sodium ?? null,
    portion: meal.portion,
    category: meal.category,
    timestamp: meal.timestamp || nowIso(),
    image_url: meal.imageUrl || null,
    // NOTE: food_logs has no updated_at column — merge uses timestamp/created_at.
  };
}

export function foodLogFromRow(row: RemoteFoodLogRow): { date: string; meal: MealItem; updatedAt: string } {
  // Native app encodes portion as "qty|unit|grams|hour" — prettify it for the web UI.
  const rawPortion = row.portion || '1 serving';
  let portion = rawPortion;
  if (rawPortion.includes('|')) {
    const parts = rawPortion.split('|');
    const qty = parts[0] || '1';
    const unit = parts[1] || 'serving';
    portion = `${qty} ${unit}`.trim();
  }
  return {
    date: (row.date || '').slice(0, 10),
    meal: {
      id: row.id,
      name: row.name,
      calories: Number(row.calories) || 0,
      protein: Number(row.protein) || 0,
      carbs: Number(row.carbs) || 0,
      fat: Number(row.fat) || 0,
      fiber: row.fiber ? Number(row.fiber) : undefined,
      sugar: row.sugar ? Number(row.sugar) : undefined,
      sodium: row.sodium ? Number(row.sodium) : undefined,
      portion,
      category: (row.category as MealItem['category']) || 'lunch',
      timestamp: row.timestamp || '',
      imageUrl: row.image_url || undefined,
    },
    updatedAt: row.updated_at || row.timestamp || row.created_at || '',
  };
}

/** Pull this device's food logs (bounded to recent days). */
export async function fetchFoodLogRows(sinceDate: string): Promise<RemoteFoodLogRow[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', deviceUserId())
      .gte('date', sinceDate)
      .order('date', { ascending: true });
    if (error) {
      console.warn('Supabase fetch food_logs error:', error.message);
      return null;
    }
    return (data || []) as RemoteFoodLogRow[];
  } catch (err) {
    console.warn('Error reading food_logs from Supabase:', err);
    return null;
  }
}

export async function upsertFoodLogToSupabase(date: string, meal: MealItem): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('food_logs')
      .upsert(foodLogToRow(date, meal, deviceUserId()), { onConflict: 'id' });
    if (error) {
      console.warn('Supabase upsert food_log failed:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Error upserting food log to Supabase:', err);
    return false;
  }
}

/** Backwards-compatible alias used by older call sites. */
export const insertFoodLogToSupabase = upsertFoodLogToSupabase;

export async function deleteFoodLogFromSupabase(mealId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('food_logs')
      .delete()
      .eq('id', mealId)
      .eq('user_id', deviceUserId());
    if (error) {
      console.warn('Supabase delete food_log failed:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Error deleting meal log from Supabase:', err);
    return false;
  }
}

// ============================================================================
// User Goals (one row per device: id = goals_<uuid>)
// ============================================================================

export interface CloudUserGoals {
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  waterGoal: number;
}

export function goalsRowId(userId: string): string {
  return `goals_${userId}`;
}

export async function fetchUserGoalsRow(): Promise<(CloudUserGoals & { updated_at?: string }) | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('user_goals')
      .select('*')
      .eq('id', goalsRowId(deviceUserId()))
      .maybeSingle();
    if (error || !data) return null;
    return {
      calorieGoal: Number(data.calorie_goal) || 0,
      proteinGoal: Number(data.protein_goal) || 0,
      carbsGoal: Number(data.carbs_goal) || 0,
      fatGoal: Number(data.fat_goal) || 0,
      waterGoal: Number(data.water_goal) || 0,
      updated_at: data.updated_at,
    };
  } catch {
    return null;
  }
}

export async function saveUserGoalsToSupabase(goals: CloudUserGoals): Promise<boolean> {
  if (!supabase) return false;
  try {
    const userId = deviceUserId();
    const { error } = await supabase.from('user_goals').upsert(
      {
        id: goalsRowId(userId),
        user_id: userId,
        calorie_goal: goals.calorieGoal,
        protein_goal: goals.proteinGoal,
        carbs_goal: goals.carbsGoal,
        fat_goal: goals.fatGoal,
        water_goal: goals.waterGoal,
        updated_at: nowIso(),
      },
      { onConflict: 'id' }
    );
    if (error) {
      console.warn('Supabase save goals failed:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Error saving goals to Supabase:', err);
    return false;
  }
}
