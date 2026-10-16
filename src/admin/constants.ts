export const PHONE_USER_ID = '08597798-2045-4df7-98f9-e8b6be068bcb';

export const ADMIN_USERNAME = 'basant';

// SHA-256 hash of owner's password
export const EXPECTED_ADMIN_HASH = 'ff17ad9d395c21b8f975b3d55374c1fbbdfa94d0c1bdc5f706820f442e3e6a67';

export const STORAGE_BUCKET = 'food-images';
export const STORAGE_BASE_URL = 'https://ynocesxhfjzwonmyjpyo.supabase.co/storage/v1/object/public/food-images';

export const AUTH_STORAGE_KEY = 'bite_admin_auth';

export interface MicroFieldDef {
  key: string;
  label: string;
  unit: string;
  category: 'vitamins' | 'minerals' | 'lipids' | 'other';
}

/**
 * EXACT 34 keys expected by the Android app's SyncModels parser.
 * Any deviations will be silently ignored by the phone.
 */
export const MICROS_DEFS: MicroFieldDef[] = [
  // Vitamins
  { key: 'vitaminA', label: 'Vitamin A', unit: 'mcg', category: 'vitamins' },
  { key: 'vitaminC', label: 'Vitamin C', unit: 'mg', category: 'vitamins' },
  { key: 'vitaminD', label: 'Vitamin D', unit: 'IU', category: 'vitamins' },
  { key: 'vitaminE', label: 'Vitamin E', unit: 'mg', category: 'vitamins' },
  { key: 'vitaminK', label: 'Vitamin K', unit: 'mcg', category: 'vitamins' },
  { key: 'vitaminB1', label: 'Vitamin B1', unit: 'mg', category: 'vitamins' },
  { key: 'vitaminB2', label: 'Vitamin B2', unit: 'mg', category: 'vitamins' },
  { key: 'vitaminB3', label: 'Vitamin B3', unit: 'mg', category: 'vitamins' },
  { key: 'vitaminB5', label: 'Vitamin B5', unit: 'mg', category: 'vitamins' },
  { key: 'vitaminB6', label: 'Vitamin B6', unit: 'mg', category: 'vitamins' },
  { key: 'vitaminB9', label: 'Vitamin B9 (folate)', unit: 'mcg', category: 'vitamins' },
  { key: 'vitaminB12', label: 'Vitamin B12', unit: 'mcg', category: 'vitamins' },
  { key: 'choline', label: 'Choline', unit: 'mg', category: 'vitamins' },

  // Minerals
  { key: 'calcium', label: 'Calcium', unit: 'mg', category: 'minerals' },
  { key: 'iron', label: 'Iron', unit: 'mg', category: 'minerals' },
  { key: 'potassium', label: 'Potassium', unit: 'mg', category: 'minerals' },
  { key: 'sodiumMg', label: 'Sodium', unit: 'mg', category: 'minerals' },
  { key: 'magnesium', label: 'Magnesium', unit: 'mg', category: 'minerals' },
  { key: 'zinc', label: 'Zinc', unit: 'mg', category: 'minerals' },
  { key: 'selenium', label: 'Selenium', unit: 'mcg', category: 'minerals' },
  { key: 'copper', label: 'Copper', unit: 'mg', category: 'minerals' },
  { key: 'manganese', label: 'Manganese', unit: 'mg', category: 'minerals' },
  { key: 'phosphorus', label: 'Phosphorus', unit: 'mg', category: 'minerals' },
  { key: 'iodine', label: 'Iodine', unit: 'mcg', category: 'minerals' },

  // Lipids
  { key: 'saturatedFat', label: 'Saturated Fat', unit: 'g', category: 'lipids' },
  { key: 'transFat', label: 'Trans Fat', unit: 'g', category: 'lipids' },
  { key: 'monoFat', label: 'Monounsaturated Fat', unit: 'g', category: 'lipids' },
  { key: 'polyFat', label: 'Polyunsaturated Fat', unit: 'g', category: 'lipids' },
  { key: 'omega3', label: 'Omega-3', unit: 'g', category: 'lipids' },
  { key: 'omega6', label: 'Omega-6', unit: 'g', category: 'lipids' },
  { key: 'cholesterol', label: 'Cholesterol', unit: 'mg', category: 'lipids' },

  // Other & Hydration
  { key: 'fiber', label: 'Fiber', unit: 'g', category: 'other' },
  { key: 'sugar', label: 'Sugar', unit: 'g', category: 'other' },
  { key: 'water', label: 'Water', unit: 'g', category: 'other' },
];

/**
 * Rounds a number to at most 2 decimal places.
 * Avoids float32 artifacts like 0.8399999999.
 */
export function round2(val: number | null | undefined): number {
  if (val === null || val === undefined || isNaN(val)) return 0;
  return Math.round((Number(val) + Number.EPSILON) * 100) / 100;
}

export function optRound2(val: number | null | undefined): number | null {
  if (val === null || val === undefined || isNaN(val)) return null;
  return Math.round((Number(val) + Number.EPSILON) * 100) / 100;
}

/**
 * Derives a clean lowercase URL slug from food name.
 * e.g. "Poha (50g)" -> "poha-50g"
 */
export function toFoodSlug(name: string): string {
  const clean = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return clean || 'food';
}

/**
 * Generates food id in format: <slug>-08597798
 */
export function generateFoodId(name: string): string {
  const slug = toFoodSlug(name);
  return `${slug}-08597798`;
}

/**
 * Native app encodes portion as "qty|unit|grams|hour"
 */
export function encodePortion(qty: number, unit: string, grams: number, hour: number): string {
  const cleanUnit = (unit || 'serving').replace(/\|/g, '/').trim();
  return `${round2(qty)}|${cleanUnit}|${round2(grams)}|${Math.floor(hour)}`;
}

export interface DecodedPortion {
  qty: number;
  unit: string;
  grams: number;
  hour: number;
  display: string;
}

export function decodePortion(portionStr: string | null | undefined): DecodedPortion {
  if (!portionStr) {
    return { qty: 1, unit: 'serving', grams: 100, hour: 12, display: '1 serving' };
  }
  if (!portionStr.includes('|')) {
    return { qty: 1, unit: portionStr, grams: 100, hour: 12, display: portionStr };
  }
  const parts = portionStr.split('|');
  const qty = parseFloat(parts[0] || '1') || 1;
  const unit = parts[1] || 'serving';
  const grams = parseFloat(parts[2] || '0') || 0;
  const hour = parseInt(parts[3] || '12', 10) || 12;

  let display = `${round2(qty)} ${unit}`;
  if (grams > 0 && unit.toLowerCase() !== 'g') {
    display += ` (${round2(grams)}g)`;
  }
  return { qty: round2(qty), unit, grams: round2(grams), hour, display };
}

/**
 * SHA-256 hash using web crypto
 */
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
