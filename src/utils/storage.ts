import type { DayLog, MealItem, ThemeMode } from '../types';
import { getFoodImage } from './foodImages';
import { enqueueOp, enqueueTombstone } from './syncEngine';

const STORAGE_KEY_LOGS = 'fuel_app_week_logs_v7';
const STORAGE_KEY_THEME = 'fuel_app_theme_v1';

export function loadWeekLogs(): DayLog[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_LOGS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map((log: DayLog) => ({
          ...log,
          meals: (log.meals || []).map((m: MealItem) => ({
            ...m,
            imageUrl: m.imageUrl || getFoodImage(m.name),
          })),
        }));
      }
    }
  } catch (e) {
    console.error('Failed to parse logs from localStorage', e);
  }
  // No seed data — honest empty state (native app parity).
  return [];
}

export function saveWeekLogs(logs: DayLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save logs to localStorage', e);
  }
}

const STORAGE_KEY_CARD_STYLE = 'fuel_app_card_style_v1';

export function loadSavedTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    if (saved === 'pure-black' || saved === 'obsidian') {
      return saved;
    }
  } catch (e) {
    console.error('Failed to read theme', e);
  }
  return 'pure-black'; // Default to pure black requested by user
}

export function saveTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  } catch (e) {
    console.error('Failed to save theme', e);
  }
}

export function loadSavedCardStyle(): 'glow' | 'stealth' {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CARD_STYLE);
    if (saved === 'glow' || saved === 'stealth') {
      return saved;
    }
  } catch (e) {
    console.error('Failed to read card style', e);
  }
  return 'glow'; // Default to glow cards requested by user
}

export function saveCardStyle(style: 'glow' | 'stealth'): void {
  try {
    localStorage.setItem(STORAGE_KEY_CARD_STYLE, style);
  } catch (e) {
    console.error('Failed to save card style', e);
  }
}

export function calculateDayTotals(day: DayLog) {
  return day.meals.reduce(
    (acc, meal) => {
      acc.calories += meal.calories;
      acc.protein += meal.protein;
      acc.carbs += meal.carbs;
      acc.fat += meal.fat;
      acc.fiber += meal.fiber || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );
}

export function addMealToDay(
  logs: DayLog[],
  date: string,
  meal: Omit<MealItem, 'id' | 'timestamp'> & { timestamp?: string }
): DayLog[] {
  const newMeal: MealItem = {
    ...meal,
    id: `meal-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    imageUrl: meal.imageUrl || getFoodImage(meal.name),
    timestamp: meal.timestamp ?? '',
  };

  const dayExists = logs.some((log) => log.date === date);
  if (!dayExists) {
    const d = new Date(date + 'T12:00:00');
    const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const newDayLog: DayLog = {
      date,
      dayLabel: !isNaN(d.getTime()) ? dayLabels[d.getDay()] : 'Day',
      displayDate: !isNaN(d.getTime()) ? `${d.getDate()} ${months[d.getMonth()]}` : date,
      isToday: date === '2026-08-23',
      calorieGoal: 2000,
      proteinGoal: 150,
      carbsGoal: 200,
      fatGoal: 65,
      waterGoal: 3000,
      waterIntake: 0,
      burnedCalories: 0,
      sugarLevel: 100,
      glucoseAverage: 100,
      timeInRange: 100,
      meals: [newMeal],
    };
    return [...logs, newDayLog];
  }

  // Offline-first: enqueue cloud sync (sync engine flushes when online)
  enqueueOp({ kind: 'upsert-log', date, meal: newMeal });

  return logs.map((log) => {
    if (log.date === date) {
      return {
        ...log,
        meals: [newMeal, ...log.meals],
      };
    }
    return log;
  });
}

export function removeMealFromDay(logs: DayLog[], date: string, mealId: string): DayLog[] {
  // Offline-first: tombstone + enqueue cloud delete
  enqueueTombstone(mealId);
  enqueueOp({ kind: 'delete-log', id: mealId });

  return logs.map((log) => {
    if (log.date === date) {
      return {
        ...log,
        meals: log.meals.filter((m) => m.id !== mealId),
      };
    }
    return log;
  });
}

export function updateMealInDay(logs: DayLog[], date: string, updatedMeal: MealItem): DayLog[] {
  return logs.map((log) => {
    if (log.date === date) {
      return {
        ...log,
        meals: log.meals.map((m) => (m.id === updatedMeal.id ? updatedMeal : m)),
      };
    }
    return log;
  });
}

export function updateDayGoal(logs: DayLog[], date: string, newCalorieGoal: number): DayLog[] {
  return logs.map((log) => {
    if (log.date === date) {
      return {
        ...log,
        calorieGoal: newCalorieGoal,
      };
    }
    return log;
  });
}

export function adjustWaterIntake(logs: DayLog[], date: string, deltaMl: number): DayLog[] {
  return logs.map((log) => {
    if (log.date === date) {
      return {
        ...log,
        waterIntake: Math.max(0, log.waterIntake + deltaMl),
      };
    }
    return log;
  });
}

const STORAGE_KEY_CUSTOM_FOODS = 'fuel_app_custom_foods_v1';

export interface GlobalGoals {
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  waterGoal: number;
  updatedAt: string;
}

const STORAGE_KEY_GOALS = 'bite_goals_v1';

export const DEFAULT_GOALS: GlobalGoals = {
  calorieGoal: 2000,
  proteinGoal: 120,
  carbsGoal: 250,
  fatGoal: 55,
  waterGoal: 3000,
  updatedAt: '',
};

export function loadGoals(): GlobalGoals {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GOALS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_GOALS, ...parsed };
    }
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_GOALS };
}

export function saveGoals(g: GlobalGoals): void {
  try {
    localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(g));
  } catch {
    /* ignore */
  }
}

export function loadCustomFoods(): import('../types').FoodLibraryItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_FOODS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map((f: import('../types').FoodLibraryItem) => ({
          ...f,
          calories: Math.max(0, Number(f.calories) || 0),
          protein: Math.max(0, Number(f.protein) || 0),
          carbs: Math.max(0, Number(f.carbs) || 0),
          fat: Math.max(0, Number(f.fat) || 0),
        }));
      }
    }
  } catch (e) {
    console.error('Failed to parse custom foods from localStorage', e);
  }
  return [];
}

export function saveCustomFoods(foods: import('../types').FoodLibraryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_FOODS, JSON.stringify(foods));
  } catch (e) {
    console.error('Failed to save custom foods to localStorage', e);
  }
}

export function addCustomFood(food: Omit<import('../types').FoodLibraryItem, 'id'>): import('../types').FoodLibraryItem {
  const current = loadCustomFoods();
  const newItem: import('../types').FoodLibraryItem = {
    ...food,
    id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
  };
  const updated = [newItem, ...current];
  saveCustomFoods(updated);

  // Offline-first: enqueue cloud sync
  enqueueOp({ kind: 'upsert-food', food: newItem });

  return newItem;
}

export function updateCustomFood(updatedFood: import('../types').FoodLibraryItem): import('../types').FoodLibraryItem[] {
  const current = loadCustomFoods();
  const updated = current.map((f) => (f.id === updatedFood.id ? updatedFood : f));
  saveCustomFoods(updated);

  // Offline-first: enqueue cloud sync
  enqueueOp({ kind: 'upsert-food', food: updatedFood });

  return updated;
}

export function deleteCustomFood(id: string): import('../types').FoodLibraryItem[] {
  const current = loadCustomFoods();
  const updated = current.filter((f) => f.id !== id);
  saveCustomFoods(updated);

  // Offline-first: tombstone + enqueue cloud delete
  enqueueTombstone(id);
  enqueueOp({ kind: 'delete-food', id });

  return updated;
}


