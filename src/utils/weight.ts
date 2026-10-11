/** Weight tracking — LOCAL ONLY, never synced (same as the native app). */

export interface WeightEntry {
  date: string; // yyyy-mm-dd
  kg: number;
}

const KEY = 'bite_weight_entries_v1';

export function loadWeightEntries(): WeightEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((e) => e && typeof e.kg === 'number' && typeof e.date === 'string')
          .sort((a, b) => (a.date < b.date ? -1 : 1));
      }
    }
  } catch {
    /* ignore */
  }
  return [];
}

export function saveWeightEntries(entries: WeightEntry[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    /* ignore */
  }
}

export function upsertWeightEntry(date: string, kg: number): WeightEntry[] {
  const entries = loadWeightEntries().filter((e) => e.date !== date);
  entries.push({ date, kg });
  entries.sort((a, b) => (a.date < b.date ? -1 : 1));
  saveWeightEntries(entries);
  return entries;
}

export function deleteWeightEntry(date: string): WeightEntry[] {
  const entries = loadWeightEntries().filter((e) => e.date !== date);
  saveWeightEntries(entries);
  return entries;
}
