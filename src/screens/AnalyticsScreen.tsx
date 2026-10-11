import { useMemo, useState } from 'react';
import { ChevronRight, Flame } from 'lucide-react';
import { useBite } from '../store';
import { Card, Segmented } from '../components/ui';
import { C } from '../theme';

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function toStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** consecutive logged days ending today/yesterday; Sundays never break the streak */
function computeStreak(logs: { date: string; meals: unknown[] }[], todayStr: string): number {
  const logged = new Set(logs.filter((l) => l.meals.length > 0).map((l) => l.date));
  let streak = 0;
  const d = new Date(todayStr + 'T12:00:00');
  if (!logged.has(toStr(d))) d.setDate(d.getDate() - 1); // allow today missing
  while (true) {
    const ds = toStr(d);
    if (d.getDay() === 0) {
      d.setDate(d.getDate() - 1);
      continue; // Sunday rest — neither counts nor breaks
    }
    if (logged.has(ds)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return streak;
}

export function AnalyticsScreen() {
  const { logs, dayTotals, todayStr, profileSet, profile } = useBite();
  const [topMode, setTopMode] = useState<'calories' | 'protein'>('calories');

  const streak = useMemo(() => computeStreak(logs, todayStr), [logs, todayStr]);

  const weekDays = useMemo(() => {
    const base = new Date(todayStr + 'T12:00:00');
    const dow = (base.getDay() + 6) % 7;
    const monday = new Date(base);
    monday.setDate(base.getDate() - dow);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, [todayStr]);

  const loggedSet = useMemo(() => new Set(logs.filter((l) => l.meals.length > 0).map((l) => l.date)), [logs]);

  const topFoods = useMemo(() => {
    const agg = new Map<string, { calories: number; protein: number; count: number }>();
    const cutoff = new Date(todayStr + 'T12:00:00');
    cutoff.setDate(cutoff.getDate() - 30);
    const cutoffStr = toStr(cutoff);
    for (const log of logs) {
      if (log.date < cutoffStr) continue;
      for (const m of log.meals) {
        const e = agg.get(m.name) || { calories: 0, protein: 0, count: 0 };
        e.calories += m.calories;
        e.protein += m.protein;
        e.count += 1;
        agg.set(m.name, e);
      }
    }
    return [...agg.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => (topMode === 'calories' ? b.calories - a.calories : b.protein - a.protein))
      .slice(0, 8);
  }, [logs, todayStr, topMode]);

  const today = dayTotals(todayStr);
  const estimatedTdee = profileSet
    ? Math.round((10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + 5) * profile.activityLevel)
    : 0;
  const balance = estimatedTdee > 0 ? Math.round(today.calories - estimatedTdee) : null;

  return (
    <div className="px-4 pt-6 pb-32 md:max-w-[600px] md:mx-auto">
      <h1 className="text-[30px] font-bold text-white mb-4">Analytics</h1>

      {/* streak hero */}
      <div className="rounded-[24px] p-6 text-center border border-[#F0714F]/20" style={{ background: 'linear-gradient(180deg, #241a18 0%, #1E1E26 100%)' }}>
        <div className="w-12 h-12 rounded-full bg-[#F0714F]/15 flex items-center justify-center mx-auto mb-3">
          <Flame size={24} className="text-[#FF6B4A]" />
        </div>
        <div className="text-[52px] font-extrabold text-white tnum leading-none">{streak}</div>
        <div className="text-[16px] font-bold text-[#FF6B4A] mt-1.5">Days Streak</div>
        <div className="flex justify-center gap-2.5 mt-5 bg-black/30 rounded-[16px] py-3.5 px-2">
          {weekDays.map((d) => {
            const ds = toStr(d);
            const isToday = ds === todayStr;
            const has = loggedSet.has(ds);
            return (
              <div key={ds} className="flex flex-col items-center gap-1.5">
                <span className={`text-[11px] font-semibold ${isToday ? 'text-white' : 'text-[#9A9AA5]'}`}>
                  {DAY_LETTERS[(d.getDay() + 6) % 7]}
                </span>
                <span
                  className={`w-8 h-8 rounded-full ${
                    has ? 'bg-[#3ECF8E]' : 'bg-[#282834]'
                  } ${isToday ? 'ring-2 ring-[#FF6B4A] ring-offset-2 ring-offset-transparent' : ''}`}
                />
              </div>
            );
          })}
        </div>
        <p className="text-[13.5px] text-[#9A9AA5] leading-relaxed mt-4">
          Your focus streak is growing — every log is a step closer to your goals.
        </p>
      </div>

      {/* steps / expenditure */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        <Card className="!rounded-[20px] !p-4">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[16px] font-bold text-white">Steps</span>
            <ChevronRight size={18} color={C.chevron} />
          </div>
          <div className="text-[12px] text-[#9A9AA5] text-center mb-2">Web par sensor nahi</div>
          <div className="text-[17px] font-bold text-white text-center">Not available</div>
          <div className="text-[12px] text-[#9A9AA5] text-center mt-1">Today</div>
        </Card>
        <Card className="!rounded-[20px] !p-4">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[16px] font-bold text-white">Expenditure</span>
            <ChevronRight size={18} color={C.chevron} />
          </div>
          <div className="text-[12px] text-[#9A9AA5] text-center mb-2">
            {estimatedTdee > 0 ? 'Profile se andaza' : 'Not enough data yet'}
          </div>
          <div className="text-[17px] font-bold text-white text-center tnum">
            {estimatedTdee > 0 ? `${estimatedTdee} kcal` : 'Not set'}
          </div>
          <div className="text-[12px] text-[#9A9AA5] text-center mt-1">Estimated</div>
        </Card>
      </div>

      {/* energy balance */}
      <Card className="!rounded-[20px] !p-4 mt-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[16px] font-bold text-white">Energy Balance</div>
            <div className="text-[22px] font-extrabold text-white tnum mt-2">
              {balance !== null ? `${balance >= 0 ? '+' : ''}${balance}` : '—'}
            </div>
            <div className="text-[12px] text-[#9A9AA5] mt-0.5">Difference</div>
          </div>
          <div className="text-right">
            <div className="text-[12px] text-[#9A9AA5]">
              {balance !== null ? 'Aaj khaya − andaza kharch' : 'Not enough data yet'}
            </div>
            <ChevronRight size={18} color={C.chevron} className="ml-auto mt-2" />
          </div>
        </div>
      </Card>

      {/* top foods */}
      <div className="flex items-center justify-between mt-7 mb-3">
        <h2 className="text-[20px] font-semibold text-white">Top Foods</h2>
        <div className="w-[210px]">
          <Segmented
            options={[
              { value: 'calories', label: 'By Calories' },
              { value: 'protein', label: 'By Protein' },
            ]}
            value={topMode}
            onChange={setTopMode}
          />
        </div>
      </div>
      {topFoods.length === 0 ? (
        <Card className="!p-6 text-center">
          <div className="text-[14px] text-[#9A9AA5]">Abhi koi data nahi — khana log karo to yahan top foods dikhenge.</div>
        </Card>
      ) : (
        <div className="space-y-2">
          {topFoods.map((f, i) => (
            <div key={f.name} className="bg-[#1E1E26] rounded-[16px] px-4 py-3 flex items-center gap-3">
              <span className="text-[13px] font-bold text-[#5E5E6C] w-5 tnum">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[14.5px] font-semibold text-white truncate">{f.name}</div>
                <div className="text-[11.5px] text-[#5E5E6C]">{f.count}× logged · 30 din</div>
              </div>
              <span className="text-[14px] font-bold text-white tnum">
                {topMode === 'calories' ? `${Math.round(f.calories)} kcal` : `${Math.round(f.protein)}g protein`}
              </span>
            </div>
          ))}
        </div>
      )}
      <div className="h-2" />
    </div>
  );
}
