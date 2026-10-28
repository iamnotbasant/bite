import type { MealCategory } from '../types';

// Snack tagging system (2026-10-28, his rule: snack ka pata KHANE se,
// time se NAHI). A food is a snack because of what it is, not when it
// is eaten — so a snack food logged at any hour is still Snacks.
//
// How to tag more foods as snacks, without code changes:
//  1. In the admin panel Foods list, set that food's Category to
//     "snack" (the field already exists there) — the web app now
//     respects that category instead of forcing everything to lunch.
//  2. Or tell Muse the food name — it gets added to SNACK_NAMES below.
//
// Initial tagged list = foods he actually logs as snacks. This list is
// deliberately short and certain; uncertain foods (sweets, drinks,
// namkeen chawal) are NOT guessed into it.

export const SNACK_NAMES: string[] = [
  'bhujia',
  'mixture',
  'sweet makhana',
  'makhana',
  'kurkure',
  'kurram',
];

function norm(s: string): string {
  return s.toLowerCase().replace(/\(.*?\)/g, ' ').replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
}

/** True when the food itself is a snack food, regardless of the hour. */
export function isSnackFood(name: string, category?: string | null): boolean {
  const cat = (category || '').toLowerCase().trim();
  if (cat === 'snack' || cat === 'snacks') return true;
  const n = norm(name);
  if (!n) return false;
  return SNACK_NAMES.some((s) => n.includes(s));
}

/** Map an admin-panel category string to a web MealCategory. */
export function categoryFromAdmin(cat?: string | null): MealCategory {
  const c = (cat || '').toLowerCase().trim();
  if (c === 'breakfast') return 'breakfast';
  if (c === 'dinner') return 'dinner';
  if (c === 'snack' || c === 'snacks') return 'snack';
  return 'lunch';
}

/** Logging category for a food: snack foods always go to Snacks. */
export function loggingCategoryForFood(
  food: { name: string; category: MealCategory },
  selected: MealCategory
): MealCategory {
  return isSnackFood(food.name, food.category) ? 'snack' : selected;
}
