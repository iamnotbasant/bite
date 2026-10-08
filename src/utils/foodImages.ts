export const DEFAULT_FOOD_IMAGES: Record<string, string> = {
  // Exactly matching media_1791299059562.jpg
  'oats': '/foods/oats_banana.jpg',
  'banana': '/foods/oats_banana.jpg',
  'egg': '/foods/boiled_eggs.jpg',
  'boiled': '/foods/boiled_eggs.jpg',
  'paneer': '/foods/paneer.jpg',
  'milk': '/foods/milk.jpg',

  // Common Indian & Fitness meals
  'roti': '/foods/roti.jpg',
  'chapati': '/foods/roti.jpg',
  'bread': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=240&h=240&q=80',
  'daal': '/foods/daal.jpg',
  'dal': '/foods/daal.jpg',
  'sabji': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=240&h=240&q=80',
  'curry': '/foods/daal.jpg',
  'chicken': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=240&h=240&q=80',
  'salmon': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=240&h=240&q=80',
  'fish': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=240&h=240&q=80',
  'shake': '/foods/whey_shake.jpg',
  'smoothie': '/foods/whey_shake.jpg',
  'whey': '/foods/whey_shake.jpg',
  'protein': '/foods/whey_shake.jpg',
  'avocado': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=240&h=240&q=80',
  'toast': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=240&h=240&q=80',
  'pancake': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=240&h=240&q=80',
  'salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=240&h=240&q=80',
  'rice': 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?auto=format&fit=crop&w=240&h=240&q=80',
  'steak': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=240&h=240&q=80',
  'beef': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=240&h=240&q=80',
  'yogurt': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=240&h=240&q=80',
  'curd': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=240&h=240&q=80',
  'almond': 'https://images.unsplash.com/photo-1508061252966-f72fbfa8263f?auto=format&fit=crop&w=240&h=240&q=80',
  'nuts': 'https://images.unsplash.com/photo-1508061252966-f72fbfa8263f?auto=format&fit=crop&w=240&h=240&q=80',
  'apple': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=240&h=240&q=80',
  'fruit': 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=240&h=240&q=80',
  'coffee': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=240&h=240&q=80',
  'tea': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=240&h=240&q=80',
};

export const FALLBACK_FOOD_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=240&h=240&q=80';

export function getFoodImage(foodName?: string, existingUrl?: string): string {
  if (existingUrl && existingUrl.trim().length > 0) return existingUrl;
  if (!foodName) return FALLBACK_FOOD_IMAGE;

  const lower = foodName.toLowerCase();
  for (const [key, url] of Object.entries(DEFAULT_FOOD_IMAGES)) {
    if (lower.includes(key)) {
      return url;
    }
  }

  return FALLBACK_FOOD_IMAGE;
}
