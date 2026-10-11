import { useMemo, useState } from 'react';
import { ChevronRight, SlidersHorizontal, Zap } from 'lucide-react';
import { useBite } from '../store';
import { Card, MacroBar, SectionHeader, Segmented } from '../components/ui';
import { C } from '../theme';

function Ring({ consumed, target }: { consumed: number; target: number }) {
  const size = 190;
  const stroke = 16;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = target > 0 ? Math.min(1, consumed / target) : 0;
  // 240° arc, gap at bottom
  const arcLen = circ * 0.75;
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-[225deg]">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.track} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${arcLen} ${circ}`} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.blue} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${arcLen * pct} ${circ}`} className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[42px] font-extrabold text-white tnum leading-none">{Math.round(consumed)}</div>
        <div className="text-[13px] text-[#9A9AA5] mt-1">Consumed</div>
      </div>
    </div>
  );
}

function dayLabel(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();
}

export function DashboardScreen() {
  const { goals, dayTotals, todayStr, profileSet, setTab, weight } = useBite();
  const [mode, setMode] = useState<'consumed' | 'remaining'>('consumed');
  const [view, setView] = useState<'daily' | 'weekly'>('daily');
  const { logs } = useBite();

  const totals = useMemo(() => dayTotals(todayStr), [dayTotals, todayStr]);

  const weekTotals = useMemo(() => {
    const out = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    const now = new Date(todayStr + 'T12:00:00');
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const t = dayTotals(ds);
      out.calories += t.calories;
      out.protein += t.protein;
      out.carbs += t.carbs;
      out.fat += t.fat;
    }
    return out;
  }, [dayTotals, todayStr, logs]);

  const shown = view === 'daily' ? totals : weekTotals;
  const targetKcal = view === 'daily' ? goals.calorieGoal : goals.calorieGoal * 7;
  const remaining = Math.max(0, targetKcal - shown.calories);
  const latestWeight = weight.length > 0 ? weight[weight.length - 1] : null;

  return (
    <div className="px-4 pt-5 pb-32 md:px-8">
      <div className="text-[12px] tracking-[0.14em] text-[#9A9AA5] font-medium">{dayLabel(new Date())}</div>
      <div className="flex items-center justify-between mt-1 mb-4">
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

      <Card>
        <h3 className="text-[19px] font-bold text-white mb-4">Daily Nutrition</h3>
        <div className="flex items-center justify-between mb-2">
          <div className="text-center w-[70px]">
            <div className="text-[22px] font-extrabold text-white tnum">{view === 'daily' ? remaining : Math.round(remaining)}</div>
            <div className="text-[12px] text-[#9A9AA5]">Remaining</div>
          </div>
          <Ring consumed={shown.calories} target={targetKcal} />
          <div className="text-center w-[70px]">
            <div className="text-[22px] font-extrabold text-white tnum">{targetKcal}</div>
            <div className="text-[12px] text-[#9A9AA5]">Target</div>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <MacroBar label="Protein" value={shown.protein} goal={view === 'daily' ? goals.proteinGoal : goals.proteinGoal * 7} color={C.coral} mode={mode} />
          <MacroBar label="Fat" value={shown.fat} goal={view === 'daily' ? goals.fatGoal : goals.fatGoal * 7} color={C.yellow} mode={mode} />
          <MacroBar label="Carbs" value={shown.carbs} goal={view === 'daily' ? goals.carbsGoal : goals.carbsGoal * 7} color={C.green} mode={mode} />
        </div>
        <div className="mt-5">
          <Segmented options={[{ value: 'consumed', label: 'Consumed' }, { value: 'remaining', label: 'Remaining' }]} value={mode} onChange={setMode} />
        </div>
      </Card>

      <button
        type="button"
        onClick={() => setView(view === 'daily' ? 'weekly' : 'daily')}
        className="w-full flex items-center justify-center gap-2 mt-4 text-[13px] text-[#9A9AA5] cursor-pointer"
      >
        <span className="font-medium text-white">{view === 'daily' ? 'Daily Nutrition' : 'Weekly Nutrition'}</span>
        <span className="flex gap-1.5">
          <span className={`w-4 h-1.5 rounded-full ${view === 'daily' ? 'bg-white' : 'bg-[#3a3a48]'}`} />
          <span className={`w-4 h-1.5 rounded-full ${view === 'weekly' ? 'bg-white' : 'bg-[#3a3a48]'}`} />
        </span>
        <span>Swipe for {view === 'daily' ? 'Weekly' : 'Daily'} &gt;</span>
      </button>

      <div className="md:grid md:grid-cols-2 md:gap-x-4 md:mt-2">
      <div className="md:col-span-2"><SectionHeader title="Insights & Analytics" onClick={() => setTab('analytics')} /></div>

      <button type="button" onClick={() => setTab('analytics')} className="w-full text-left cursor-pointer">
        <Card className="!p-4 flex items-center gap-3 !rounded-[18px]">
          <div className="flex-1">
            <div className="text-[17px] font-bold text-white">Nutrition</div>
            <div className="text-[13px] text-[#9A9AA5] mt-0.5">7-day macro balance & micros</div>
          </div>
          <ChevronRight size={22} color={C.chevron} />
        </Card>
      </button>

      <button type="button" onClick={() => setTab('more')} className="w-full text-left cursor-pointer mt-3 md:mt-0">
        <Card className="!p-4 flex items-center gap-3 !rounded-[18px]">
          <div className="flex-1">
            <div className="text-[17px] font-bold text-white">Body Metrics</div>
            <div className="text-[13px] text-[#9A9AA5] mt-0.5">
              {latestWeight ? `${latestWeight.kg} kg · ${latestWeight.date}` : 'Weight, Waist, Body Fat'}
            </div>
          </div>
          <ChevronRight size={22} color={C.chevron} />
        </Card>
      </button>

      <div className="md:col-span-2"><SectionHeader title="Habits" onClick={() => setTab('analytics')} /></div>
      <button type="button" onClick={() => setTab('analytics')} className="w-full text-left cursor-pointer">
        <Card className="!p-4 flex items-center gap-3 !rounded-[18px]">
          <div className="flex-1">
            <div className="text-[17px] font-bold text-white">Logging streak</div>
            <div className="text-[13px] text-[#9A9AA5] mt-0.5">Roz log karo, streak banao — Sunday rest day</div>
          </div>
          <ChevronRight size={22} color={C.chevron} />
        </Card>
      </button>
      </div>
    </div>
  );
}
