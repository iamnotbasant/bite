/**
 * Mifflin-St Jeor targets — ported EXACTLY from the native Android app
 * (fitpal-native/.../data/BiteFormulas.kt). Pure functions, unit-tested.
 */

export interface ProfileInput {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: string; // 'Male' | 'Female'
  goalType: string; // contains 'Gain' | 'Lose' | otherwise Maintain
  rateKgPerWeek: number;
  activityLevel: number;
}

export interface MacroTargets {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export const EMPTY_TARGETS: MacroTargets = { calories: 0, protein: 0, fat: 0, carbs: 0 };

export function computeBmr(weightKg: number, heightCm: number, age: number, sex: string): number {
  if (weightKg <= 0 || heightCm <= 0 || age <= 0) return 0;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return /female/i.test(sex) ? base - 161 : base + 5;
}

export function computeTdee(bmr: number, activityLevel: number): number {
  if (bmr <= 0) return 0;
  const mult = activityLevel >= 1.1 && activityLevel <= 2.5 ? activityLevel : 1.2;
  return bmr * mult;
}

function isValidProfile(p: ProfileInput): boolean {
  return p.weightKg > 0 && p.heightCm > 0 && p.age > 0;
}

export function computeTargetsFromProfile(p: ProfileInput): MacroTargets {
  if (!isValidProfile(p)) return { ...EMPTY_TARGETS };

  const bmr = computeBmr(p.weightKg, p.heightCm, p.age, p.sex);
  const tdee = computeTdee(bmr, p.activityLevel);
  const dailyAdjustment = (p.rateKgPerWeek * 7700) / 7;

  let kcal: number;
  if (/gain/i.test(p.goalType)) {
    kcal = Math.round(tdee + dailyAdjustment);
  } else if (/lose/i.test(p.goalType)) {
    kcal = Math.max(1200, Math.round(tdee - dailyAdjustment));
  } else {
    kcal = Math.round(tdee);
  }

  const proteinPerKg = /gain/i.test(p.goalType) ? 2.0 : /lose/i.test(p.goalType) ? 2.2 : 1.8;
  const protein = Math.round(proteinPerKg * p.weightKg);
  const fat = Math.round((kcal * 0.25) / 9);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));

  return { calories: kcal, protein, fat, carbs };
}
