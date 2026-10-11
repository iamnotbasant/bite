import { useMemo, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Menu, Plus, ScanLine, Search, SlidersHorizontal, Trash2, UtensilsCrossed } from 'lucide-react';
import { useBite } from '../store';
import { EmptyState } from '../components/ui';
import { AddFoodSheet } from './AddFoodSheet';
import type { MealCategory, MealItem } from '../types';

const MEALS: { key: MealCategory; label: string }[] = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'snack', label: 'Snacks' },
];

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function toStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function prettyDate(ds: string): string {
  const now = new Date();
  const today = toStr(now);
  if (ds === today) return 'Today';
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  if (ds === toStr(y)) return 'Yesterday';
  const d = new Date(ds + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function FoodLogScreen() {
  const { todayStr, getDay, dayTotals, goals, removeMeal, setTab } = useBite();
  const [date, setDate] = useState(todayStr);
  const [sheet, setSheet] = useState<null | { category: MealCategory }>(null);

  const weekDays = useMemo(() => {
    const base = new Date(date + 'T12:00:00');
    const dow = (base.getDay() + 6) % 7; // Monday-first
    const monday = new Date(base);
    monday.setDate(base.getDate() - dow);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, [date]);

  const day = getDay(date);
  const totals = dayTotals(date);

  const shiftDay = (delta: number) => {
    const d = new Date(date + 'T12:00:00');
    d.setDate(d.getDate() + delta);
    setDate(toStr(d));
  };

  const mealsByCat = useMemo(() => {
    const map = new Map<MealCategory, MealItem[]>();
    for (const m of day?.meals || []) {
      const arr = map.get(m.category) || [];
      arr.push(m);
      map.set(m.category, arr);
    }
    return map;
  }, [day]);

  const hasAny = (day?.meals.length || 0) > 0;

  return (
    <div className="pb-40">
      {/* top bar */}
      <div className="px-4 pt-5 flex items-center justify-between">
        <button type="button" onClick={() => setTab('more')} className="w-10 h-10 flex items-center justify-center cursor-pointer" aria-label="Menu">
          <Menu size={24} className="text-white" />
        </button>
        <div className="flex items-center gap-5">
          <button type="button" onClick={() => shiftDay(-1)} className="cursor-pointer" aria-label="Previous day">
            <ChevronLeft size={22} className="text-[#9A9AA5]" />
          </button>
          <span className="text-[16px] font-semibold text-white bg-[#1E1E26] px-5 py-2 rounded-full">{prettyDate(date)}</span>
          <button type="button" onClick={() => shiftDay(1)} className="cursor-pointer" aria-label="Next day">
            <ChevronRight size={22} className="text-[#9A9AA5]" />
          </button>
        </div>
        <button type="button" onClick={() => setTab('more')} className="w-10 h-10 flex items-center justify-center cursor-pointer" aria-label="Settings">
          <SlidersHorizontal size={22} className="text-white" />
        </button>
      </div>

      {/* day strip */}
      <div className="px-4 mt-4 flex justify-between">
        {weekDays.map((d) => {
          const ds = toStr(d);
          const selected = ds === date;
          const isToday = ds === todayStr;
          return (
            <button
              key={ds}
              type="button"
              onClick={() => setDate(ds)}
              className={`w-[46px] h-[68px] rounded-full flex flex-col items-center justify-center gap-1 cursor-pointer border-2 ${
                selected ? 'border-[#4F8FF7] bg-[#1E1E26]' : 'border-transparent bg-[#1E1E26]'
              }`}
            >
              <span className={`text-[11px] font-semibold ${isToday ? 'text-white' : 'text-[#9A9AA5]'}`}>{DAY_LETTERS[(d.getDay() + 6) % 7]}</span>
              <span className={`text-[16px] font-bold tnum ${isToday ? 'text-white' : 'text-[#c9c9d2]'}`}>{d.getDate()}</span>
              {isToday && <span className="w-1 h-1 rounded-full bg-[#4F8FF7]" />}
            </button>
          );
        })}
      </div>

      {/* calorie summary */}
      <div className="px-4 mt-4 flex gap-3">
        <div className="flex-1 bg-[#1E1E26] rounded-full py-3.5 text-center">
          <span className="text-[17px] font-bold text-white tnum">
            {Math.round(totals.calories)} <span className="text-[#9A9AA5] font-semibold">/ {goals.calorieGoal}</span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => setSheet({ category: 'snack' })}
          className="w-[52px] h-[52px] rounded-full bg-[#1E1E26] flex items-center justify-center cursor-pointer"
          aria-label="Add food"
        >
          <ChevronDown size={22} className="text-white" />
        </button>
      </div>

      {/* meal sections */}
      <div className="px-4 mt-4 space-y-3">
        {!hasAny && (
          <EmptyState
            icon={<UtensilsCrossed size={52} strokeWidth={1.4} />}
            title="No foods logged yet – tap + to add your first meal"
            actionLabel="+ Add First Meal"
            onAction={() => setSheet({ category: 'lunch' })}
          />
        )}
        {MEALS.map(({ key, label }) => {
          const items = mealsByCat.get(key) || [];
          if (items.length === 0) return null;
          const kcal = Math.round(items.reduce((a, m) => a + m.calories, 0));
          return (
            <div key={key} className="bg-[#1E1E26] rounded-[20px] p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[15px] font-bold text-white">
                  {label} <span className="text-[#9A9AA5] font-medium text-[13px]">· {kcal} kcal</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSheet({ category: key })}
                  className="w-8 h-8 rounded-full bg-[#2E2E3A] flex items-center justify-center cursor-pointer"
                  aria-label={`Add to ${label}`}
                >
                  <Plus size={17} className="text-white" />
                </button>
              </div>
              <div className="divide-y divide-white/[0.06]">
                {items.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 py-2.5">
                    <div className="flex-1 min-w-0">
                      <div className="text-[14.5px] font-semibold text-white truncate">{m.name}</div>
                      <div className="text-[12px] text-[#5E5E6C] truncate">
                        {m.portion} · P {Math.round(m.protein)}g · C {Math.round(m.carbs)}g · F {Math.round(m.fat)}g
                      </div>
                    </div>
                    <div className="text-[14px] font-bold text-white tnum">{Math.round(m.calories)}</div>
                    <button
                      type="button"
                      onClick={() => removeMeal(date, m.id)}
                      className="w-8 h-8 flex items-center justify-center cursor-pointer"
                      aria-label="Delete"
                    >
                      <Trash2 size={16} className="text-[#5E5E6C]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {hasAny && (
          <button
            type="button"
            onClick={() => setSheet({ category: 'snack' })}
            className="w-full py-3.5 rounded-[18px] border border-dashed border-[#3a3a48] text-[#9A9AA5] text-[14px] font-semibold cursor-pointer"
          >
            + Log more food
          </button>
        )}
      </div>

      {/* sticky search bar (native jaisa) */}
      <div className="fixed bottom-[92px] inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
        <div className="w-full max-w-[400px] flex gap-2.5 pointer-events-auto">
          <button
            type="button"
            onClick={() => setSheet({ category: 'lunch' })}
            className="flex-1 flex items-center gap-3 bg-[#1E1E26] rounded-full pl-5 pr-4 py-3.5 text-left cursor-pointer border border-white/[0.06]"
          >
            <Search size={20} className="text-[#9A9AA5] shrink-0" />
            <span className="flex-1 text-[15px] text-[#9A9AA5]">Search for a food</span>
            <ScanLine size={20} className="text-[#9A9AA5] shrink-0" />
          </button>
          <div className="w-[52px] h-[52px] rounded-full bg-[#1E1E26] border border-white/[0.06] flex items-center justify-center shrink-0">
            <div className="w-6 h-6 rounded-full border-2 border-[#9A9AA5]" />
          </div>
        </div>
      </div>

      <AddFoodSheet
        open={sheet !== null}
        initialCategory={sheet?.category || 'lunch'}
        date={date}
        onClose={() => setSheet(null)}
      />
    </div>
  );
}
