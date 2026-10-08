import React, { useState } from 'react';
import { Flame, Check, Trophy, ShieldCheck } from 'lucide-react';
import type { DayLog } from '../types';

interface FuelStreakWidgetProps {
  currentDay: DayLog;
  weekLogs?: DayLog[];
}

export const FuelStreakWidget: React.FC<FuelStreakWidgetProps> = ({
  currentDay,
  weekLogs = [],
}) => {
  const [isFlameBouncing, setIsFlameBouncing] = useState<boolean>(false);
  const [selectedDayKey, setSelectedDayKey] = useState<string>('Thu');
  const [confettiBurst, setConfettiBurst] = useState<boolean>(false);

  // Compute live today values
  const todayKcal = currentDay?.meals?.reduce((sum, m) => sum + (m.calories || 0), 0) || 1360;
  const todayP = currentDay?.meals?.reduce((sum, m) => sum + (m.protein || 0), 0) || 100;
  const todayC = currentDay?.meals?.reduce((sum, m) => sum + (m.carbs || 0), 0) || 137;
  const todayF = currentDay?.meals?.reduce((sum, m) => sum + (m.fat || 0), 0) || 45;
  const todayMealsCount = currentDay?.meals?.length || 4;

  // Streak metrics
  const streakDays = 8;
  const bestStreak = 14;
  const nextMilestone = 10;
  const daysToMilestone = Math.max(0, nextMilestone - streakDays);
  const milestonePct = Math.min(100, Math.round((streakDays / nextMilestone) * 100));

  // Audio chime feedback
  const playPopSound = () => {
    try {
      const audioCtx = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      )();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.22);
    } catch {
      // AudioContext unavailable
    }
  };

  const triggerCelebration = () => {
    setIsFlameBouncing(true);
    setConfettiBurst(true);
    playPopSound();
    setTimeout(() => setIsFlameBouncing(false), 600);
    setTimeout(() => setConfettiBurst(false), 1200);
  };

  // 7-day week momentum data
  const daysChain = [
    {
      key: 'Mon',
      shortLabel: 'Mo',
      dateNum: '19',
      displayDate: 'Mon, 19 Aug',
      completed: true,
      kcal: 1540,
      goalKcal: 1600,
      protein: 124,
      carbs: 160,
      fat: 48,
      mealsCount: 4,
    },
    {
      key: 'Tue',
      shortLabel: 'Tu',
      dateNum: '20',
      displayDate: 'Tue, 20 Aug',
      completed: true,
      kcal: 1510,
      goalKcal: 1600,
      protein: 118,
      carbs: 155,
      fat: 46,
      mealsCount: 4,
    },
    {
      key: 'Wed',
      shortLabel: 'We',
      dateNum: '21',
      displayDate: 'Wed, 21 Aug',
      completed: true,
      kcal: 1480,
      goalKcal: 1600,
      protein: 122,
      carbs: 145,
      fat: 44,
      mealsCount: 3,
    },
    {
      key: 'Thu',
      shortLabel: 'Th',
      dateNum: '22',
      displayDate: 'Thu, 22 Aug (Today)',
      completed: true,
      kcal: todayKcal,
      goalKcal: currentDay?.calorieGoal || 1600,
      protein: todayP,
      carbs: todayC,
      fat: todayF,
      mealsCount: todayMealsCount,
      isToday: true,
    },
    {
      key: 'Fri',
      shortLabel: 'Fr',
      dateNum: '23',
      displayDate: 'Fri, 23 Aug',
      completed: false,
      kcal: 0,
      goalKcal: 1600,
      protein: 0,
      carbs: 0,
      fat: 0,
      mealsCount: 0,
    },
    {
      key: 'Sat',
      shortLabel: 'Sa',
      dateNum: '24',
      displayDate: 'Sat, 24 Aug',
      completed: false,
      kcal: 0,
      goalKcal: 1600,
      protein: 0,
      carbs: 0,
      fat: 0,
      mealsCount: 0,
    },
    {
      key: 'Sun',
      shortLabel: 'Su',
      dateNum: '25',
      displayDate: 'Sun, 25 Aug',
      completed: false,
      kcal: 0,
      goalKcal: 1600,
      protein: 0,
      carbs: 0,
      fat: 0,
      mealsCount: 0,
    },
  ];

  // Map with actual weekLogs if present
  if (weekLogs.length >= 7) {
    weekLogs.forEach((log, index) => {
      if (index < 7 && daysChain[index]) {
        const totalKcal = log.meals?.reduce((sum, m) => sum + (m.calories || 0), 0) || 0;
        const totalP = log.meals?.reduce((sum, m) => sum + (m.protein || 0), 0) || 0;
        const totalC = log.meals?.reduce((sum, m) => sum + (m.carbs || 0), 0) || 0;
        const totalF = log.meals?.reduce((sum, m) => sum + (m.fat || 0), 0) || 0;
        const completed = totalKcal >= (log.calorieGoal || 1600) * 0.75;

        daysChain[index] = {
          ...daysChain[index],
          kcal: totalKcal,
          protein: totalP,
          carbs: totalC,
          fat: totalF,
          completed: completed || log.isToday,
          mealsCount: log.meals?.length || 0,
          isToday: log.isToday,
        };
      }
    });
  }

  const activeDay = daysChain.find((d) => d.key === selectedDayKey) || daysChain[3];
  const totalWeeklyKcal = daysChain.reduce((sum, d) => sum + d.kcal, 0);

  return (
    <div className="w-full space-y-3.5 select-none">
      {/* Clean Single Heading */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-white/10 text-white border border-white/10 flex items-center justify-center shrink-0">
            <Flame size={16} />
          </span>
          <h3 className="text-base font-bold text-white tracking-tight">
            Streak Momentum
          </h3>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300">
            {streakDays}-Day Active Streak 🔥
          </span>
        </div>
      </div>

      {/* Hero Streak Card utilizing full desktop width */}
      <div className="relative overflow-hidden rounded-3xl bg-[radial-gradient(ellipse_65%_45%_at_50%_-5%,rgba(255,255,255,0.26)_0%,rgba(255,255,255,0.08)_25%,rgba(255,255,255,0.015)_50%,transparent_75%)] bg-[#050506] p-5 sm:p-7 md:p-8 shadow-[0_24px_60px_rgba(0,0,0,0.95),inset_0_1.2px_0.5px_rgba(255,255,255,0.55)] border border-white/[0.12] border-t-white/[0.48] text-white">
        {/* Subtle ambient glow */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-gradient-to-br from-[#CDFF50]/5 via-white/[0.02] to-transparent blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.05),transparent_70%)] pointer-events-none" />

        {/* Floating Confetti FX on click */}
        {confettiBurst && (
          <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
            <span className="absolute animate-ping text-3xl top-4 left-1/4">✨</span>
            <span className="absolute animate-bounce text-4xl top-1/3 left-1/3">🔥</span>
            <span className="absolute animate-pulse text-3xl bottom-4 right-1/4">⭐</span>
          </div>
        )}

        {/* Main Grid: Left = Streak Engine, Right = 7-Day Interactive Tracker */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          
          {/* ================= LEFT COLUMN: STREAK ENGINE ================= */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between gap-5 p-5 rounded-2xl bg-[#06070a] border border-white/[0.08] border-t-white/[0.25] shadow-[inset_0_1px_0.5px_rgba(255,255,255,0.20)]">
            
            {/* Top: Flame Orb & Huge Streak Counter */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl sm:text-6xl font-black tracking-tight text-white font-sans">
                    {streakDays}
                  </span>
                  <span className="text-xl sm:text-2xl font-extrabold text-zinc-200">
                    Days
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#CDFF50]/15 text-[#CDFF50] border border-[#CDFF50]/30 shadow-[0_0_12px_rgba(205,255,80,0.2)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#CDFF50] animate-pulse" />
                    On Fire Today
                  </span>
                </div>
              </div>

              {/* Glowing Interactive Flame Orb (subtle lime/white glow, preserved flame icon) */}
              <div
                onClick={triggerCelebration}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-b from-white/30 via-white/10 to-transparent p-0.5 border border-white/20 shadow-[0_0_20px_rgba(205,255,80,0.2),inset_0_1px_1px_rgba(255,255,255,0.4)] cursor-pointer transition-all duration-300 ${
                  isFlameBouncing ? 'scale-110 rotate-6' : 'hover:scale-105 active:scale-95'
                }`}
                title="Tap to celebrate streak!"
              >
                <div className="w-full h-full rounded-[14px] bg-[#08090d] flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#CDFF50]/10 to-transparent group-hover:opacity-100 transition-opacity" />
                  <Flame
                    size={34}
                    className="text-amber-400 drop-shadow-[0_0_10px_rgba(205,255,80,0.3)] group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Middle: Milestone Progress Tracker */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <Trophy size={14} className="text-[#CDFF50]" />
                  <span>Next Goal: {nextMilestone} Days</span>
                </div>
                <span className="font-mono text-zinc-400 font-bold">{milestonePct}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#CDFF50] to-[#bbf038] transition-all duration-500 shadow-[0_0_10px_rgba(205,255,80,0.35)]"
                  style={{ width: `${milestonePct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span>{daysToMilestone} days left to Level 3</span>
                <span className="font-mono text-zinc-500">Tier: Bronze 🏆</span>
              </div>
            </div>

            {/* Bottom: 3 Key Vital Metric Tickers */}
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="block text-[10px] text-zinc-400 font-medium">Best Record</span>
                <span className="text-sm sm:text-base font-extrabold text-white font-mono">{bestStreak}d</span>
              </div>
              <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="block text-[10px] text-zinc-400 font-medium">This Week</span>
                <span className="text-sm sm:text-base font-extrabold text-white font-mono">100%</span>
              </div>
              <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="block text-[10px] text-zinc-400 font-medium flex items-center justify-center gap-1">
                  <ShieldCheck size={11} className="text-emerald-400" /> Freeze
                </span>
                <span className="text-sm sm:text-base font-extrabold text-emerald-400 font-mono">1 Active</span>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: 7-DAY INTERACTIVE MOMENTUM ================= */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col justify-between gap-4 p-5 rounded-2xl bg-[#06070a] border border-white/[0.08]">
            
            {/* Header: Week label & total calories */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white" />
                <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  7-Day Momentum Calendar
                </span>
              </div>

              <span className="text-[11px] sm:text-xs font-mono text-zinc-400 font-bold self-start sm:self-auto">
                {totalWeeklyKcal.toLocaleString()} kcal logged
              </span>
            </div>

            {/* 7 Interactive Day Cards */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2.5">
              {daysChain.map((d) => {
                const isSelected = selectedDayKey === d.key;
                const hitRatio = d.kcal > 0 ? Math.min(100, Math.round((d.kcal / d.goalKcal) * 100)) : 0;

                return (
                  <div
                    key={d.key}
                    onClick={() => {
                      setSelectedDayKey(d.key);
                      playPopSound();
                    }}
                    className={`p-1.5 sm:p-3 rounded-xl sm:rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col items-center justify-between text-center gap-1.5 sm:gap-2 ${
                      isSelected
                        ? 'bg-[#1e202e] border-white/40 shadow-lg scale-[1.03]'
                        : d.completed
                        ? 'bg-[#151620] hover:bg-[#1a1b26] border-white/[0.08] hover:border-white/20'
                        : 'bg-[#0e0f14] border-white/[0.04] opacity-50 hover:opacity-80'
                    } ${d.isToday ? 'ring-2 ring-white/50' : ''}`}
                    title={`${d.displayDate}: ${d.completed ? `${d.kcal} kcal` : 'Pending'}`}
                  >
                    {/* Day short label & Date */}
                    <div>
                      <span className="block text-[10px] sm:text-xs font-bold text-zinc-400">
                        {d.shortLabel}
                      </span>
                      <span className="block text-xs sm:text-sm font-extrabold text-white font-mono">
                        {d.dateNum}
                      </span>
                    </div>

                    {/* Status Node */}
                    <div
                      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                        d.completed
                          ? 'bg-white text-black shadow-sm'
                          : 'bg-white/5 border border-white/10 text-zinc-600'
                      }`}
                    >
                      {d.completed ? (
                        d.isToday ? (
                          <Flame size={12} className="text-black sm:w-3.5 sm:h-3.5" />
                        ) : (
                          <Check size={12} strokeWidth={3} className="text-black sm:w-3.5 sm:h-3.5" />
                        )
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                      )}
                    </div>

                    {/* Mini Kcal text */}
                    <div className="w-full">
                      {d.completed ? (
                        <span className="block text-[10px] sm:text-[11px] font-mono font-bold text-zinc-200 truncate">
                          {d.kcal}
                        </span>
                      ) : (
                        <span className="block text-[10px] font-mono text-zinc-600">--</span>
                      )}

                      {/* Mini progress dot / bar */}
                      <div className="w-full h-1 rounded-full bg-white/10 mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            d.completed ? 'bg-white' : 'bg-transparent'
                          }`}
                          style={{ width: `${hitRatio}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom: Day Inspection Snapshot Bar */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-black/50 border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="font-bold text-white font-sans text-xs sm:text-sm">
                  {activeDay.displayDate}
                </span>
                <span className="text-zinc-500">·</span>
                <span className="text-zinc-300">
                  {activeDay.completed ? `${activeDay.mealsCount} meals logged` : 'No meals recorded'}
                </span>
              </div>

              {activeDay.completed ? (
                <div className="flex items-center gap-3 text-zinc-300">
                  <span className="text-white font-bold">
                    {activeDay.kcal} kcal
                  </span>
                  <span className="text-zinc-600">|</span>
                  <span>{activeDay.protein}g P</span>
                  <span className="text-zinc-600">|</span>
                  <span>{activeDay.carbs}g C</span>
                  <span className="text-zinc-600">|</span>
                  <span>{activeDay.fat}g F</span>
                </div>
              ) : (
                <span className="text-zinc-500 italic">Day upcoming / unlogged</span>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
