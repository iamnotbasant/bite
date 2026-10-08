export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type ThemeMode = 'pure-black' | 'emerald' | 'obsidian';

export type CardStyleMode = 'glow' | 'stealth';

export interface PillBadgeConfig {
  id: string;
  label: string;
  iconName: 'monitor' | 'briefcase' | 'feather' | 'zap' | 'shield' | 'droplets' | 'utensils' | 'flame';
  badgeStyle: {
    border: string;
    bg: string;
    text: string;
    iconBg: string;
    iconColor: string;
  };
}

export interface MealItem {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number; // in grams
  carbs: number;   // in grams
  fat: number;     // in grams
  fiber?: number;   // in grams
  saturatedFat?: number;
  transFat?: number;
  sodium?: number;
  sugar?: number;
  portion: string; // e.g. "1 bowl", "150g"
  category: MealCategory;
  tagId?: string;
  timestamp: string; // e.g. "08:30 AM"
  imageUrl?: string;
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  dayLabel: string; // "Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"
  displayDate: string; // "23 Aug"
  isToday: boolean;
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  waterGoal: number; // in ml
  waterIntake: number; // in ml
  burnedCalories: number;
  sugarLevel: number; // mg/dL for Ref 4 telemetry
  glucoseAverage: number;
  timeInRange: number; // percentage
  micronutrientGoals?: {
    fiber?: number;
    sugar?: number;
    sodium?: number;
    potassium?: number;
    saturatedFat?: number;
    cholesterol?: number;
    calcium?: number;
    iron?: number;
  };
  meals: MealItem[];
}

export interface FoodLibraryItem {
  id: string;
  name: string;
  brand?: string;
  description?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  saturatedFat?: number;
  transFat?: number;
  polyunsaturatedFat?: number;
  monounsaturatedFat?: number;
  cholesterol?: number;
  sodium?: number;
  sugar?: number;
  calcium?: number;
  iron?: number;
  potassium?: number;
  vitaminA?: number;
  vitaminC?: number;
  servingSizeQty?: number;
  servingSizeUnit?: string;
  servingWeightGrams?: number;
  servingEquivalentUnit?: 'g' | 'ml';
  servingsPerContainer?: number;
  defaultPortion: string;
  category: MealCategory;
  tagId: string;
  imageUrl?: string;
}
