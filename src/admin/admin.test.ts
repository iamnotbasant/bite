import { describe, it, expect } from 'vitest';
import {
  PHONE_USER_ID,
  EXPECTED_ADMIN_HASH,
  ADMIN_USERNAME,
  MICROS_DEFS,
  round2,
  optRound2,
  toFoodSlug,
  generateFoodId,
  encodePortion,
  decodePortion,
  sha256,
} from './constants';

describe('Admin Panel Constants and Helpers', () => {
  it('has exact required phone user_id', () => {
    expect(PHONE_USER_ID).toBe('08597798-2045-4df7-98f9-e8b6be068bcb');
  });

  it('has correct admin username and expected SHA-256 hash', () => {
    expect(ADMIN_USERNAME).toBe('basant');
    expect(EXPECTED_ADMIN_HASH).toBe('ff17ad9d395c21b8f975b3d55374c1fbbdfa94d0c1bdc5f706820f442e3e6a67');
  });

  it('computes sha256 accurately', async () => {
    const hash = await sha256('hello world');
    expect(hash).toBe('b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9');
  });

  it('rounds numbers to max 2 decimals avoiding float artifacts', () => {
    expect(round2(0.8399999)).toBe(0.84);
    expect(round2(1.2345)).toBe(1.23);
    expect(round2(1.235)).toBe(1.24);
    expect(round2(0)).toBe(0);
    expect(round2(null)).toBe(0);

    expect(optRound2(null)).toBeNull();
    expect(optRound2(undefined)).toBeNull();
    expect(optRound2(0.8399999)).toBe(0.84);
  });

  it('generates proper slugs and food IDs', () => {
    expect(toFoodSlug('Poha (50g)')).toBe('poha-50g');
    expect(toFoodSlug('Chana Dal')).toBe('chana-dal');
    expect(toFoodSlug('Aloo ki Sabzi')).toBe('aloo-ki-sabzi');
    expect(generateFoodId('Poha 50g')).toBe('poha-50g-08597798');
  });

  it('encodes and decodes portion correctly for native phone sync', () => {
    const encoded = encodePortion(1.5, 'serving', 75, 14);
    expect(encoded).toBe('1.5|serving|75|14');

    const decoded = decodePortion(encoded);
    expect(decoded.qty).toBe(1.5);
    expect(decoded.unit).toBe('serving');
    expect(decoded.grams).toBe(75);
    expect(decoded.hour).toBe(14);
    expect(decoded.display).toBe('1.5 serving (75g)');
  });

  it('contains the EXACT 34 micros keys required by native Android app', () => {
    const requiredKeys = [
      'vitaminA', 'vitaminC', 'vitaminD', 'vitaminE', 'vitaminK',
      'vitaminB1', 'vitaminB2', 'vitaminB3', 'vitaminB5', 'vitaminB6',
      'vitaminB9', 'vitaminB12', 'fiber', 'sugar', 'sodiumMg',
      'saturatedFat', 'transFat', 'monoFat', 'polyFat', 'omega3',
      'omega6', 'potassium', 'magnesium', 'iron', 'calcium',
      'zinc', 'selenium', 'copper', 'manganese', 'phosphorus',
      'iodine', 'choline', 'cholesterol', 'water',
    ];

    expect(MICROS_DEFS.length).toBe(34);
    const keys = MICROS_DEFS.map((d) => d.key);
    for (const reqKey of requiredKeys) {
      expect(keys).toContain(reqKey);
    }
  });
});
