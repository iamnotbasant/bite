import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { FoodLibraryItem, MealItem } from '../types';

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

// ============================================================================
// Custom Foods Cloud Sync
// ============================================================================

export async function fetchCustomFoodsFromSupabase(): Promise<FoodLibraryItem[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('custom_foods')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch custom_foods error:', error.message);
      return null;
    }

    if (!data) return [];

    return data.map((row) => ({
      id: row.id,
      name: row.name,
      brand: row.brand || undefined,
      description: row.description || undefined,
      calories: Number(row.calories) || 0,
      protein: Number(row.protein) || 0,
      carbs: Number(row.carbs) || 0,
      fat: Number(row.fat) || 0,
      fiber: row.fiber ? Number(row.fiber) : undefined,
      saturatedFat: row.saturated_fat ? Number(row.saturated_fat) : undefined,
      transFat: row.trans_fat ? Number(row.trans_fat) : undefined,
      polyunsaturatedFat: row.polyunsaturated_fat ? Number(row.polyunsaturated_fat) : undefined,
      monounsaturatedFat: row.monounsaturated_fat ? Number(row.monounsaturated_fat) : undefined,
      cholesterol: row.cholesterol ? Number(row.cholesterol) : undefined,
      sodium: row.sodium ? Number(row.sodium) : undefined,
      sugar: row.sugar ? Number(row.sugar) : undefined,
      calcium: row.calcium ? Number(row.calcium) : undefined,
      iron: row.iron ? Number(row.iron) : undefined,
      potassium: row.potassium ? Number(row.potassium) : undefined,
      vitaminA: row.vitamin_a ? Number(row.vitamin_a) : undefined,
      vitaminC: row.vitamin_c ? Number(row.vitamin_c) : undefined,
      servingSizeQty: row.serving_size_qty ? Number(row.serving_size_qty) : 1,
      servingSizeUnit: row.serving_size_unit || 'serving',
      servingWeightGrams: row.serving_weight_grams ? Number(row.serving_weight_grams) : 100,
      servingEquivalentUnit: (row.serving_equivalent_unit as 'g' | 'ml') || 'g',
      servingsPerContainer: row.servings_per_container ? Number(row.servings_per_container) : 1,
      defaultPortion: row.default_portion || '1 serving',
      category: row.category || 'lunch',
      tagId: 'custom',
      imageUrl: row.image_url || undefined,
    }));
  } catch (err) {
    console.warn('Error reading from Supabase:', err);
    return null;
  }
}

export async function upsertCustomFoodToSupabase(food: FoodLibraryItem): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('custom_foods').upsert({
      id: food.id,
      name: food.name,
      brand: food.brand || null,
      description: food.description || null,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber ?? null,
      saturated_fat: food.saturatedFat ?? null,
      trans_fat: food.transFat ?? null,
      polyunsaturated_fat: food.polyunsaturatedFat ?? null,
      monounsaturated_fat: food.monounsaturatedFat ?? null,
      cholesterol: food.cholesterol ?? null,
      sodium: food.sodium ?? null,
      sugar: food.sugar ?? null,
      calcium: food.calcium ?? null,
      iron: food.iron ?? null,
      potassium: food.potassium ?? null,
      vitamin_a: food.vitaminA ?? null,
      vitamin_c: food.vitaminC ?? null,
      serving_size_qty: food.servingSizeQty ?? 1,
      serving_size_unit: food.servingSizeUnit ?? 'serving',
      serving_weight_grams: food.servingWeightGrams ?? 100,
      serving_equivalent_unit: food.servingEquivalentUnit ?? 'g',
      servings_per_container: food.servingsPerContainer ?? 1,
      default_portion: food.defaultPortion,
      category: food.category,
      image_url: food.imageUrl ?? null,
      updated_at: new Date().toISOString(),
    });

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
    const { error } = await supabase.from('custom_foods').delete().eq('id', id);
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
// Food Logs Cloud Sync
// ============================================================================

export async function insertFoodLogToSupabase(date: string, meal: MealItem): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('food_logs').upsert({
      id: meal.id,
      date,
      name: meal.name,
      brand: meal.brand || null,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      fiber: meal.fiber ?? null,
      saturated_fat: meal.saturatedFat ?? null,
      trans_fat: meal.transFat ?? null,
      sodium: meal.sodium ?? null,
      sugar: meal.sugar ?? null,
      portion: meal.portion,
      category: meal.category,
      timestamp: meal.timestamp,
      image_url: meal.imageUrl || null,
    });

    if (error) {
      console.warn('Supabase insert food_log failed:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Error logging meal to Supabase:', err);
    return false;
  }
}

export async function deleteFoodLogFromSupabase(mealId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('food_logs').delete().eq('id', mealId);
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
// User Goals Cloud Sync
// ============================================================================

export interface CloudUserGoals {
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  waterGoal: number;
  fiberGoal?: number;
  sugarGoal?: number;
  sodiumGoal?: number;
  potassiumGoal?: number;
  saturatedFatGoal?: number;
  cholesterolGoal?: number;
}

export async function fetchUserGoalsFromSupabase(): Promise<CloudUserGoals | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('user_goals')
      .select('*')
      .eq('id', 'default_user')
      .single();

    if (error || !data) return null;

    return {
      calorieGoal: data.calorie_goal,
      proteinGoal: data.protein_goal,
      carbsGoal: data.carbs_goal,
      fatGoal: data.fat_goal,
      waterGoal: data.water_goal,
      fiberGoal: data.fiber_goal,
      sugarGoal: data.sugar_goal,
      sodiumGoal: data.sodium_goal,
      potassiumGoal: data.potassium_goal,
      saturatedFatGoal: data.saturated_fat_goal,
      cholesterolGoal: data.cholesterol_goal,
    };
  } catch {
    return null;
  }
}

export async function saveUserGoalsToSupabase(goals: CloudUserGoals): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('user_goals').upsert({
      id: 'default_user',
      calorie_goal: goals.calorieGoal,
      protein_goal: goals.proteinGoal,
      carbs_goal: goals.carbsGoal,
      fat_goal: goals.fatGoal,
      water_goal: goals.waterGoal,
      fiber_goal: goals.fiberGoal ?? 30,
      sugar_goal: goals.sugarGoal ?? 50,
      sodium_goal: goals.sodiumGoal ?? 2300,
      potassium_goal: goals.potassiumGoal ?? 3500,
      saturated_fat_goal: goals.saturatedFatGoal ?? 20,
      cholesterol_goal: goals.cholesterolGoal ?? 300,
      updated_at: new Date().toISOString(),
    });

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
