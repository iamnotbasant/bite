import { useMemo, useState } from 'react';
import { ChevronRight, Flame, Plus, Scale, SlidersHorizontal, TrendingUp, Zap } from 'lucide-react';
import { useBite } from '../store';
import { C } from '../theme';
import type { MealCategory } from '../types';

// Fresh dashboard rebuild (2026-10-28).
// Scope guard: ONLY this file changed. Admin panel (src/admin/*),
// App routing, store, Supabase sync and all other screens are untouched.
// Data comes from the same store hooks as before, so no data model change.

const MEALS: { key: MealCategory; label: string }[] = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'snack', label: 'Snacks' },
];

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dayLabel(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();
}

function Ring({ consumed, target }: { consumed: number; target: number }) {
  const size = 216;
  const stroke = 18;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = target > 0 ? Math.min(1, consumed / target) : 0;
  const arcLen = circ * 0.75;
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-[225deg]">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.track} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${arcLen} ${circ}`} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.blue} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${arcLen * pct} ${circ}`} className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        <Flame size={20} className="text-[#4F8FF7] mb-1" />
        <div className="text-[44px] font-extrabold text-white tnum leading-none">{Math.round(consumed)}</div>
        <div className="text-[13px] text-[#9A9AA5] mt-1.5">kcal eaten</div>
        <div className="text-[12px] text-[#5E5E6C] mt-0.5 tnum">of {Math.round(target)} target</div>
      </div>
    </div>
  );
}

function MacroRow({
  label, value, goal, color, mode,
}: {
  label: string; value: number; goal: number; color: string; mode: 'consumed' | 'remaining';
}) {
  const display = mode === 'consumed' ? value : Math.max(0, goal - value);
  const pct = goal > 0 ? Math.min(100, (value / goal) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-2 text-[14px] font-semibold text-white">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
          {label}
        </span>
        <span className="text-[14px] font-bold text-white tnum">
          {Math.round(display)}g <span className="font-medium text-[#9A9AA5]">/ {Math.round(goal)}g</span>
        </span>
      </div>
      <div className="h-[7px] rounded-full bg-[#282834] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export function DashboardScreen() {
  const { goals, dayTotals, todayStr, profileSet, setTab, weight, getDay } = useBite();
  const [mode, setMode] = useState<'consumed' | 'remaining'>('consumed');
  const [view, setView] = useState<'daily' | 'weekly'>('daily');

  const weekDays = useMemo(() => {
    const now = new Date(todayStr + 'T12:00:00');
    const days: { dateStr: string; short: string; calories: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const ds = toDateStr(d);
      days.push({
        dateStr: ds,
        short: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        calories: dayTotals(ds).calories,
      });
    }
    return days;
  }, [dayTotals, todayStr]);

  const totals = useMemo(() => dayTotals(todayStr), [dayTotals, todayStr]);
  const weekTotals = useMemo(() => {
    const out = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    for (const d of weekDays) {
      const t = dayTotals(d.dateStr);
      out.calories += t.calories;
      out.protein += t.protein;
      out.carbs += t.carbs;
      out.fat += t.fat;
    }
    return out;
  }, [dayTotals, weekDays]);

  const shown = view === 'daily' ? totals : weekTotals;
  const targetKcal = view === 'daily' ? goals.calorieGoal : goals.calorieGoal * 7;
  const targetProtein = view === 'daily' ? goals.proteinGoal : goals.proteinGoal * 7;
  const targetFat = view === 'daily' ? goals.fatGoal : goals.fatGoal * 7;
  const targetCarbs = view === 'daily' ? goals.carbsGoal : goals.carbsGoal * 7;
  const remaining = Math.max(0, targetKcal - shown.calories);
  const pctOfTarget = targetKcal > 0 ? Math.round((shown.calories / targetKcal) * 100) : 0;
  const latestWeight = weight.length > 0 ? weight[weight.length - 1] : null;
  const loggedDaysThisWeek = weekDays.filter((d) => d.calories > 0).length;
  const maxWeekCal = Math.max(targetKcal / (view === 'daily' ? 7 : 7), ...weekDays.map((d) => d.calories), 1);

  const todayMeals = useMemo(() => {
    const day = getDay(todayStr);
    return MEALS.map((m) => {
      const items = (day?.meals ?? []).filter((x) => x.category === m.key);
      return { ...m, count: items.length, kcal: items.reduce((s, x) => s + (x.calories || 0), 0) };
    });
  }, [getDay, todayStr]);

  return (
    <div className="px-4 pt-5 pb-32 md:px-8">
      <div className="text-[12px] tracking-[0.14em] text-[#9A9AA5] font-medium">{dayLabel(new Date())}</div>
      <div className="flex items-center justify-between mt-1 mb-5">
        <h1 className="text-[30px] font-bold text-white">Dashboard</h1>
        <button
          type="button"
          onClick={() => setTab('more')}
          className="w-11 h-11 rounded-full bg-[#1E1E26] flex items-center justify-center cursor-pointer"
          aria-label="Settings"
        >
          <SlidersHorizontal size={20} className="text-white" />
        </button>
      </div>

      {!profileSet && (
        <button
          type="button"
          onClick={() => setTab('more')}
          className="w-full flex items-center gap-2.5 bg-[#1E1E26] rounded-[16px] px-4 py-3.5 mb-4 text-left cursor-pointer"
        >
          <Zap size={18} className="text-[#F2C14E] shrink-0" />
          <span className="flex-1 text-[14.5px] font-semibold text-white">Set up your profile to get your targets</span>
          <ChevronRight size={20} color={C.chevron} />
        </button>
      )}

      {/* Daily / Weekly switch */}
      <div className="flex bg-[#141418] rounded-full p-1 mb-4">
        {(['daily', 'weekly'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`flex-1 py-2.5 rounded-full text-[15px] font-semibold capitalize cursor-pointer transition-colors ${
              view === v ? 'bg-white text-black' : 'text-[#9A9AA5]'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Hero: ring + stats + macros */}
      <div className="bg-[#1E1E26] rounded-[24px] p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[19px] font-bold text-white">{view === 'daily' ? 'Today' : 'This week'}</h3>
          <span className="text-[13px] font-semibold text-[#4F8FF7] tnum">{pctOfTarget}% of target</span>
        </div>
        <Ring consumed={shown.calories} target={targetKcal} />
        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="bg-[#141418] rounded-[16px] px-4 py-3 text-center">
            <div className="text-[20px] font-extrabold text-white tnum">{Math.round(remaining)}</div>
            <div className="text-[12px] text-[#9A9AA5]">Remaining</div>
          </div>
          <div className="bg-[#141418] rounded-[16px] px-4 py-3 text-center">
            <div className="text-[20px] font-extrabold text-white tnum">{Math.round(targetKcal)}</div>
            <div className="text-[12px] text-[#9A9AA5]">Target</div>
          </div>
        </div>
        <div className="flex flex-col gap-4 mt-5">
          <MacroRow label="Protein" value={shown.protein} goal={targetProtein} color={C.coral} mode={mode} />
          <MacroRow label="Fat" value={shown.fat} goal={targetFat} color={C.yellow} mode={mode} />
          <MacroRow label="Carbs" value={shown.carbs} goal={targetCarbs} color={C.green} mode={mode} />
        </div>
        <div className="flex bg-[#141418] rounded-full p-1 mt-5">
          {(['consumed', 'remaining'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 py-2.5 rounded-full text-[15px] font-semibold capitalize cursor-pointer transition-colors ${
                mode === m ? 'bg-white text-black' : 'text-[#9A9AA5]'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Today's meals — daily view only, real logged data */}
      {view === 'daily' && (
        <div className="bg-[#1E1E26] rounded-[24px] p-5 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[19px] font-bold text-white">Today's meals</h3>
            <button type="button" onClick={() => setTab('foodlog')} className="text-[13px] font-semibold text-[#4F8FF7] cursor-pointer">
              View log
            </button>
          </div>
          <div className="flex flex-col">
            {todayMeals.map((m, i) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setTab('foodlog')}
                className={`w-full flex items-center justify-between py-3 text-left cursor-pointer ${i > 0 ? 'border-t border-white/[0.07]' : ''}`}
              >
                <span className="text-[15px] font-semibold text-white">
                  {m.label}
                  <span className="block text-[12px] font-medium text-[#9A9AA5]">{m.count === 0 ? 'Nothing logged yet' : `${m.count} item${m.count > 1 ? 's' : ''}`}</span>
                </span>
                <span className="text-[15px] font-bold text-white tnum">{Math.round(m.kcal)} <span className="text-[12px] font-medium text-[#9A9AA5]">kcal</span></span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Week at a glance — last 7 days, real totals only */}
      <div className="bg-[#1E1E26] rounded-[24px] p-5 mt-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-[#3ECF8E]" />
          <h3 className="text-[19px] font-bold text-white">Last 7 days</h3>
        </div>
        <div className="flex items-end justify-between gap-2 h-[96px]">
          {weekDays.map((d) => {
            const isToday = d.dateStr === todayStr;
            const h = Math.max(6, Math.round((d.calories / maxWeekCal) * 84));
            return (
              <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[11px] font-semibold text-[#9A9AA5] tnum">{d.calories > 0 ? Math.round(d.calories) : ''}</span>
                <div
                  className={`w-full max-w-[28px] rounded-full ${isToday ? 'bg-[#4F8FF7]' : 'bg-[#282834]'}`}
                  style={{ height: `${h}px` }}
                />
                <span className={`text-[12px] font-semibold ${isToday ? 'text-white' : 'text-[#9A9AA5]'}`}>{d.short}</span>
              </div>
            );
          })}
        </div>
        <div className="text-[13px] text-[#9A9AA5] mt-3">
          {loggedDaysThisWeek}/7 days logged this week
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <button
          type="button"
          onClick={() => setTab('foodlog')}
          className="flex items-center justify-center gap-2 bg-[#4F8FF7] rounded-[18px] py-3.5 text-[15px] font-bold text-white cursor-pointer"
        >
          <Plus size={18} /> Log food
        </button>
        <button
          type="button"
          onClick={() => setTab('analytics')}
          className="flex items-center justify-center gap-2 bg-[#1E1E26] rounded-[18px] py-3.5 text-[15px] font-bold text-white cursor-pointer"
        >
          Analytics <ChevronRight size={18} color={C.chevron} />
        </button>
      </div>

      {/* Body metrics */}
      <button type="button" onClick={() => setTab('more')} className="w-full text-left cursor-pointer mt-4">
        <div className="bg-[#1E1E26] rounded-[18px] p-4 flex items-center gap-3">
          <Scale size={20} className="text-[#9B86EE] shrink-0" />
          <div className="flex-1">
            <div className="text-[17px] font-bold text-white">Body Metrics</div>
            <div className="text-[13px] text-[#9A9AA5] mt-0.5">
              {latestWeight ? `${latestWeight.kg} kg · ${latestWeight.date}` : 'Weight, Waist, Body Fat'}
            </div>
          </div>
          <ChevronRight size={22} color={C.chevron} />
        </div>
      </button>
    </div>
  );
}
