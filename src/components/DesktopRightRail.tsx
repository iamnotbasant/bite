import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Droplets,
  Plus,
  Utensils,
} from 'lucide-react';
import type { DayLog } from '../types';

interface DesktopRightRailProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  currentDay: DayLog;
  allLogs: DayLog[];
  onQuickAddWater?: (amount: number) => void;
}

export const DesktopRightRail: React.FC<DesktopRightRailProps> = ({
  selectedDate,
  onSelectDate,
  currentDay,
  allLogs,
  onQuickAddWater,
}) => {
  // Parse selected date or fallback to 2026-08-23
  const [currentViewDate, setCurrentViewDate] = useState(() => {
    const d = new Date(selectedDate || '2026-08-23');
    return isNaN(d.getTime()) ? new Date('2026-08-23') : d;
  });

  const year = currentViewDate.getFullYear();
  const month = currentViewDate.getMonth(); // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handlePrevMonth = () => {
    setCurrentViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentViewDate(new Date(year, month + 1, 1));
  };

  // Build calendar matrix (Monday to Sunday)
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sun, 1 is Mon
  const startDayOffset = (firstDayOfMonth + 6) % 7; // Convert to Mon = 0, Sun = 6
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays: {
    dayNumber: number;
    dateStr: string;
    isCurrentMonth: boolean;
    isSelected: boolean;
    isToday: boolean;
    hasLogs: boolean;
  }[] = [];

  // Previous month fill days
  for (let i = startDayOffset - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevDate = new Date(year, month - 1, dayNum);
    const dateStr = prevDate.toISOString().split('T')[0];
    calendarDays.push({
      dayNumber: dayNum,
      dateStr,
      isCurrentMonth: false,
      isSelected: selectedDate === dateStr,
      isToday: false,
      hasLogs: allLogs.some((l) => l.date === dateStr && (l.meals?.length || 0) > 0),
    });
  }

  // Current month days
  for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const isSelected = selectedDate === dateStr;
    const isToday = dateStr === '2026-08-23'; // Reference active date
    calendarDays.push({
      dayNumber: dayNum,
      dateStr,
      isCurrentMonth: true,
      isSelected,
      isToday,
      hasLogs: allLogs.some((l) => l.date === dateStr && (l.meals?.length || 0) > 0),
    });
  }

  // Next month fill days to complete 35 or 42 grid cells
  const remainingCells = 35 - calendarDays.length > 0 ? 35 - calendarDays.length : 42 - calendarDays.length;
  for (let dayNum = 1; dayNum <= Math.max(0, remainingCells); dayNum++) {
    const nextDate = new Date(year, month + 1, dayNum);
    const dateStr = nextDate.toISOString().split('T')[0];
    calendarDays.push({
      dayNumber: dayNum,
      dateStr,
      isCurrentMonth: false,
      isSelected: selectedDate === dateStr,
      isToday: false,
      hasLogs: allLogs.some((l) => l.date === dateStr && (l.meals?.length || 0) > 0),
    });
  }

  // Totals for selected day
  const totalKcal = currentDay?.meals?.reduce((sum, m) => sum + (m.calories || 0), 0) || 0;
  const goalKcal = currentDay?.calorieGoal || 1600;
  const remainingKcal = Math.max(0, goalKcal - totalKcal);
  const progressPct = Math.min(100, Math.round((totalKcal / goalKcal) * 100));

  const totalWater = currentDay?.waterIntake || 1800;
  const goalWater = currentDay?.waterGoal || 2500;

  return (
    <aside className="hidden xl:flex flex-col w-80 h-screen bg-[#07080a] border-l border-white/[0.08] p-5 select-none shrink-0 overflow-y-auto no-scrollbar space-y-6 z-30">
      {/* 1. Mini Calendar (Matching Reference Image Style) */}
      <div className="space-y-3">
        {/* Month Header with navigation arrows */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white tracking-tight">
            {monthNames[month]} {year}
          </h3>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Day of Week Labels Row */}
        <div className="grid grid-cols-7 text-center text-[10px] font-mono font-bold text-zinc-500 py-1">
          {['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-y-1 gap-x-1 text-center">
          {calendarDays.map((cell, idx) => (
            <button
              key={`${cell.dateStr}-${idx}`}
              type="button"
              onClick={() => onSelectDate(cell.dateStr)}
              className={`relative h-8 w-8 mx-auto rounded-full flex flex-col items-center justify-center text-xs font-mono transition-all cursor-pointer ${
                cell.isSelected
                  ? 'bg-white text-black font-extrabold shadow-md scale-105'
                  : cell.isCurrentMonth
                  ? 'text-zinc-200 hover:bg-white/10'
                  : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              <span>{cell.dayNumber}</span>
              {/* Dot indicator if day has meals */}
              {cell.hasLogs && !cell.isSelected && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-amber-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Today's Fuel Target Card (Matching the Reference "PENDING" card with glowing badge) */}
      <div className="relative overflow-hidden rounded-2xl p-4 bg-[#0e0f14] border border-white/[0.08] shadow-lg text-white space-y-3 group">
        {/* Subtle warm glow at bottom right */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-white">
              <Flame size={13} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
              Daily Target
            </span>
          </div>

          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-zinc-200 font-semibold">
            {progressPct}%
          </span>
        </div>

        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-white tracking-tight">
              {totalKcal}
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              / {goalKcal} kcal
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5 font-sans">
            {remainingKcal > 0 ? `${remainingKcal} kcal remaining today` : 'Daily calorie goal reached!'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            style={{ width: `${progressPct}%` }}
            className="h-full bg-white rounded-full transition-all duration-300"
          />
        </div>
      </div>

      {/* 3. Hydration Quick Tracker */}
      <div className="rounded-2xl p-4 bg-[#0e0f14] border border-white/[0.08] text-white space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-sky-500/15 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <Droplets size={13} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
              Hydration
            </span>
          </div>

          <button
            type="button"
            onClick={() => onQuickAddWater?.(250)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition-all active:scale-95 cursor-pointer"
            title="Log +250ml water"
          >
            <Plus size={11} strokeWidth={3} />
            <span>250ml</span>
          </button>
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold font-mono text-white">
            {totalWater}
          </span>
          <span className="text-xs text-zinc-400 font-mono">
            / {goalWater} ml
          </span>
        </div>
      </div>

      {/* 4. Daily Meals Breakdown in Right Rail */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-mono px-1">
          <span>Meals Logged</span>
          <span>{currentDay?.meals?.length || 0} items</span>
        </div>

        <div className="space-y-1.5 text-xs">
          {[
            { key: 'breakfast', label: 'Breakfast', count: currentDay?.meals?.filter((m) => m.category === 'breakfast').length || 0 },
            { key: 'lunch', label: 'Lunch', count: currentDay?.meals?.filter((m) => m.category === 'lunch').length || 0 },
            { key: 'dinner', label: 'Dinner', count: currentDay?.meals?.filter((m) => m.category === 'dinner').length || 0 },
            { key: 'snack', label: 'Snacks', count: currentDay?.meals?.filter((m) => m.category === 'snack').length || 0 },
          ].map((meal) => (
            <div
              key={meal.key}
              className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-between text-zinc-300"
            >
              <div className="flex items-center gap-2">
                <Utensils size={12} className="text-zinc-500" />
                <span className="font-medium text-white">{meal.label}</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">
                {meal.count > 0 ? `${meal.count} logged` : 'Empty'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
