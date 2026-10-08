import React from 'react';
import { Flame, CheckSquare, Clock, Trophy, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

interface ConsistencyHeatmapProps {
  currentKcal: number;
  goalKcal: number;
}

export const ConsistencyHeatmap: React.FC<ConsistencyHeatmapProps> = ({ currentKcal, goalKcal }) => {
  // Generate a realistic 7x22 grid of activity cells
  // Rows: M, T, W, T, F, S, S
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const cols = 22;

  // Intensity map to create the text-like pattern or realistic streak from media_1791289046833.jpg
  const getCellColor = (r: number, c: number) => {
    // Generate a clustered heatmap pattern matching the screenshot
    const pattern = [
      [3, 2, 3, 1, 3, 0, 2, 3, 0, 3, 3, 0, 3, 3, 3, 2, 0, 3, 3, 3, 2, 3],
      [2, 3, 0, 0, 3, 0, 3, 0, 0, 2, 0, 0, 3, 0, 3, 0, 0, 3, 0, 3, 0, 3],
      [3, 0, 3, 0, 3, 0, 3, 3, 0, 3, 0, 0, 3, 3, 3, 0, 0, 3, 3, 3, 0, 2],
      [1, 0, 3, 0, 3, 0, 2, 0, 0, 2, 0, 0, 3, 0, 0, 0, 0, 3, 0, 0, 0, 3],
      [3, 0, 3, 3, 3, 0, 3, 3, 0, 3, 3, 0, 3, 0, 0, 0, 0, 3, 0, 0, 0, 2],
      [2, 3, 0, 2, 0, 3, 0, 3, 2, 0, 3, 0, 3, 0, 0, 0, 0, 3, 3, 2, 0, 3],
      [3, 2, 3, 0, 2, 3, 3, 1, 3, 2, 3, 0, 2, 0, 0, 0, 0, 2, 3, 3, 3, 3],
    ];

    const level = pattern[r % 7][c % cols];
    switch (level) {
      case 3:
        return 'bg-white shadow-[0_0_4px_rgba(255,255,255,0.4)]';
      case 2:
        return 'bg-zinc-400';
      case 1:
        return 'bg-zinc-700';
      default:
        return 'bg-[#14151e]';
    }
  };

  const progressPct = goalKcal > 0 ? Math.min(100, Math.round((currentKcal / goalKcal) * 100)) : 67;

  return (
    <div className="w-full space-y-4 select-none">
      {/* 1. Top Heatmap Card */}
      <div className="rounded-[30px] p-5 sm:p-6 bg-[radial-gradient(120%_65%_at_50%_-5%,rgba(255,255,255,0.20)_0%,rgba(255,255,255,0.03)_38%,transparent_70%),linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.01)_35%,rgba(4,4,6,0.92)_80%,#050608_100%)] bg-[#050608] border border-white/[0.25] border-t-white/[0.75] shadow-[0_20px_50px_rgba(0,0,0,0.95),inset_0_2px_2px_rgba(255,255,255,0.65),inset_0_1.5px_1px_rgba(255,255,255,0.38),0_0_32px_rgba(255,255,255,0.06)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-xl bg-white/10 text-zinc-300">
              <BookOpen size={17} />
            </span>
            <span className="text-sm sm:text-base font-bold text-white tracking-tight">
              Calorie Logging Ritual
            </span>
          </div>

          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/15">
            Active Streak
          </span>
        </div>

        {/* Squircle Heatmap Grid */}
        <div className="bg-[#07080b] rounded-2xl p-3 sm:p-4 border border-white/10">
          <div className="flex gap-2">
            {/* Days Labels (M T W T F S S) */}
            <div className="flex flex-col justify-between py-0.5 text-[10px] font-mono text-zinc-500 font-bold">
              {days.map((d, i) => (
                <span key={i} className="h-2.5 leading-none flex items-center">
                  {d}
                </span>
              ))}
            </div>

            {/* Matrix Columns */}
            <div className="flex-1 grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto no-scrollbar py-0.5">
              {Array.from({ length: cols }).map((_, c) =>
                days.map((_, r) => (
                  <div
                    key={`${r}-${c}`}
                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[3px] transition-colors ${getCellColor(
                      r,
                      c
                    )}`}
                  />
                ))
              )}
            </div>
          </div>

          {/* Date range footer from screenshot */}
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5 text-xs text-zinc-400">
            <button
              type="button"
              className="p-1 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-medium tracking-wide">Sep 22, 2025 — Feb 3, 2026</span>
            <button
              type="button"
              className="p-1 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Four Stealth Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Card 1: Streak */}
        <div className="rounded-[28px] p-5 sm:p-6 bg-[radial-gradient(120%_60%_at_50%_-5%,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.02)_35%,transparent_70%),linear-gradient(180deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.01)_35%,rgba(4,4,6,0.92)_80%,#050608_100%)] bg-[#050608] border border-white/[0.12] border-t-white/[0.32] shadow-[0_16px_36px_rgba(0,0,0,0.92),inset_0_1.5px_1px_rgba(255,255,255,0.30)] flex flex-col justify-between min-h-[145px]">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
            <Flame size={15} className="text-zinc-300" />
            <span>Streak</span>
          </div>
          <div className="my-2">
            <span className="font-sans text-4xl sm:text-5xl font-black text-white tracking-tight">
              8
            </span>
          </div>
          <div className="text-[11px] font-medium text-zinc-500">
            Longest: 8 days
          </div>
        </div>

        {/* Card 2: Total Check-Ins */}
        <div className="rounded-[28px] p-5 sm:p-6 bg-[radial-gradient(120%_60%_at_50%_-5%,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.02)_35%,transparent_70%),linear-gradient(180deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.01)_35%,rgba(4,4,6,0.92)_80%,#050608_100%)] bg-[#050608] border border-white/[0.12] border-t-white/[0.32] shadow-[0_16px_36px_rgba(0,0,0,0.92),inset_0_1.5px_1px_rgba(255,255,255,0.30)] flex flex-col justify-between min-h-[145px]">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
            <CheckSquare size={15} className="text-zinc-300" />
            <span>Total Check-Ins</span>
          </div>
          <div className="my-2">
            <span className="font-sans text-4xl sm:text-5xl font-black text-white tracking-tight">
              558
            </span>
          </div>
          <div className="text-[11px] font-medium text-zinc-500">
            Started: Apr 13
          </div>
        </div>

        {/* Card 3: Avg. Log Time */}
        <div className="rounded-[28px] p-5 sm:p-6 bg-[radial-gradient(120%_60%_at_50%_-5%,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.02)_35%,transparent_70%),linear-gradient(180deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.01)_35%,rgba(4,4,6,0.92)_80%,#050608_100%)] bg-[#050608] border border-white/[0.12] border-t-white/[0.32] shadow-[0_16px_36px_rgba(0,0,0,0.92),inset_0_1.5px_1px_rgba(255,255,255,0.30)] flex flex-col justify-between min-h-[145px]">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
            <Clock size={15} className="text-zinc-300" />
            <span>Avg. Log Time</span>
          </div>
          <div className="my-2">
            <span className="font-sans text-4xl sm:text-5xl font-black text-white tracking-tight">
              2:50
            </span>
          </div>
          <div className="text-[11px] font-medium text-zinc-500">
            PM (Midday Habit)
          </div>
        </div>

        {/* Card 4: Goal Progress */}
        <div className="rounded-[28px] p-5 sm:p-6 bg-[radial-gradient(120%_60%_at_50%_-5%,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.02)_35%,transparent_70%),linear-gradient(180deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.01)_35%,rgba(4,4,6,0.92)_80%,#050608_100%)] bg-[#050608] border border-white/[0.12] border-t-white/[0.32] shadow-[0_16px_36px_rgba(0,0,0,0.92),inset_0_1.5px_1px_rgba(255,255,255,0.30)] flex flex-col justify-between min-h-[145px]">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
            <Trophy size={15} className="text-zinc-300" />
            <span>Goal Progress</span>
          </div>
          <div className="my-1">
            <span className="font-sans text-4xl sm:text-5xl font-black text-white tracking-tight">
              {progressPct}%
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mt-1">
            <div
              className="h-full rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
