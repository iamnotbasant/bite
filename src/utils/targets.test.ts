import { describe, it, expect } from 'vitest';
import { computeBmr, computeTdee, computeTargetsFromProfile } from './targets';

describe('computeBmr (Mifflin-St Jeor)', () => {
  it('male: 10w + 6.25h - 5a + 5', () => {
    // 50kg, 170cm, 20y male => 500 + 1062.5 - 100 + 5 = 1467.5
    expect(computeBmr(50, 170, 20, 'Male')).toBeCloseTo(1467.5, 1);
  });
  it('female: 10w + 6.25h - 5a - 161', () => {
    // 50kg, 160cm, 20y female => 500 + 1000 - 100 - 161 = 1239
    expect(computeBmr(50, 160, 20, 'Female')).toBeCloseTo(1239, 1);
  });
  it('returns 0 for invalid input', () => {
    expect(computeBmr(0, 170, 20, 'Male')).toBe(0);
    expect(computeBmr(50, 0, 20, 'Male')).toBe(0);
    expect(computeBmr(50, 170, 0, 'Male')).toBe(0);
  });
});

describe('computeTdee', () => {
  it('multiplies bmr by activity level', () => {
    expect(computeTdee(1500, 1.2)).toBeCloseTo(1800, 1);
  });
  it('falls back to 1.2 for out-of-range activity', () => {
    expect(computeTdee(1500, 9)).toBeCloseTo(1800, 1);
  });
  it('returns 0 for invalid bmr', () => {
    expect(computeTdee(0, 1.5)).toBe(0);
  });
});

describe('computeTargetsFromProfile', () => {
  const base = { weightKg: 50, heightCm: 170, age: 20, sex: 'Male', rateKgPerWeek: 0.5, activityLevel: 1.2 };

  it('maintain: kcal = tdee, protein 1.8g/kg', () => {
    const t = computeTargetsFromProfile({ ...base, goalType: 'Maintain' });
    // bmr 1467.5, tdee 1761 -> kcal 1761
    expect(t.calories).toBe(1761);
    expect(t.protein).toBe(90); // 1.8 * 50
    expect(t.fat).toBe(Math.round((1761 * 0.25) / 9));
    expect(t.protein * 4 + t.fat * 9 + t.carbs * 4).toBeLessThanOrEqual(t.calories + 4);
  });

  it('lose: kcal = tdee - rate*7700/7 with 1200 floor, protein 2.2g/kg', () => {
    const t = computeTargetsFromProfile({ ...base, goalType: 'Lose weight' });
    // 1761 - 550 = 1211
    expect(t.calories).toBe(1211);
    expect(t.protein).toBe(110); // 2.2 * 50
  });

  it('lose: never below 1200 kcal', () => {
    const t = computeTargetsFromProfile({
      ...base,
      goalType: 'Lose',
      rateKgPerWeek: 2,
      weightKg: 40,
      heightCm: 150,
      age: 30,
    });
    expect(t.calories).toBeGreaterThanOrEqual(1200);
  });

  it('gain: kcal = tdee + adjustment, protein 2.0g/kg', () => {
    const t = computeTargetsFromProfile({ ...base, goalType: 'Gain muscle' });
    // 1761 + 550 = 2311
    expect(t.calories).toBe(2311);
    expect(t.protein).toBe(100); // 2.0 * 50
  });

  it('incomplete profile -> zeros', () => {
    const t = computeTargetsFromProfile({ ...base, goalType: 'Maintain', weightKg: 0 });
    expect(t).toEqual({ calories: 0, protein: 0, fat: 0, carbs: 0 });
  });
});
