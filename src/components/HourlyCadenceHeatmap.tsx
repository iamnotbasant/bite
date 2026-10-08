import React, { useState } from 'react';
import { Clock, Zap } from 'lucide-react';
import type { DayLog } from '../types';

interface HourlyCadenceHeatmapProps {
  weekLogs?: DayLog[];
  currentDay?: DayLog;
}

interface CellData {
  dayLabel: string;
  dayDate: string;
  hour: number;
  hourLabel: string;
  calories: number;
  meals: string[];
  level: number; // 0: none, 1: light, 2: medium, 3: heavy
}

export const HourlyCadenceHeatmap: React.FC<HourlyCadenceHeatmapProps> = ({
  currentDay: _currentDay,
}) => {
  const [activeRange, setActiveRange] = useState<'day' | 'week' | 'month'>('week');
  const [hoveredCell, setHoveredCell] = useState<CellData | null>(null);

  // Hours to display (7 PM down to 8 AM - 12 rows matching reference image media_1791387493625.jpg)
  const hours = [19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8];
  const hourLabels: Record<number, string> = {
    19: '7 pm',
    18: '6 pm',
    17: '5 pm',
    16: '4 pm',
    15: '3 pm',
    14: '2 pm',
    13: '1 pm',
    12: '12 pm',
    11: '11 am',
    10: '10 am',
    9: '9 am',
    8: '8 am',
  };

  // 14 days grid (matching reference labels Mo 2 through Su 15)
  const days = [
    { label: 'Mo 2', date: '2026-08-10', isUpcoming: false },
    { label: 'Tu 3', date: '2026-08-11', isUpcoming: false },
    { label: 'We 4', date: '2026-08-12', isUpcoming: false },
    { label: 'Th 5', date: '2026-08-13', isUpcoming: false },
    { label: 'Fr 6', date: '2026-08-14', isUpcoming: false },
    { label: 'Sa 7', date: '2026-08-15', isUpcoming: false },
    { label: 'Su 8', date: '2026-08-16', isUpcoming: false },
    { label: 'Mo 9', date: '2026-08-17', isUpcoming: false },
    { label: 'Tu 10', date: '2026-08-18', isUpcoming: false },
    { label: 'We 11', date: '2026-08-19', isToday: true, isUpcoming: false },
    { label: 'Th 12', date: '2026-08-20', isUpcoming: true },
    { label: 'Fr 13', date: '2026-08-21', isUpcoming: true },
    { label: 'Sa 14', date: '2026-08-22', isUpcoming: true },
    { label: 'Su 15', date: '2026-08-23', isUpcoming: true },
  ];

  // Meal timing mock pattern grounded in real meals
  const getCellData = (dayIndex: number, hour: number): CellData => {
    const day = days[dayIndex];
    let calories = 0;
    const meals: string[] = [];

    // Realistic meal cadence:
    // 8-9am: Breakfast (350-450 kcal)
    // 11am: Mid-morning snack (120-200 kcal)
    // 1-2pm: Lunch (500-680 kcal)
    // 3-4pm: Afternoon snack / Tea (180-250 kcal)
    // 7pm: Dinner (450-580 kcal)
    if (!day.isUpcoming) {
      if ((hour === 8 || hour === 9) && (dayIndex % 2 === 0 || dayIndex > 6)) {
        calories = 380 + (dayIndex * 15) % 90;
        meals.push('Oats with Banana & Milk');
      } else if (hour === 11 && dayIndex % 3 === 0) {
        calories = 160;
        meals.push('Boiled Eggs & Green Tea');
      } else if ((hour === 13 || hour === 14) && dayIndex % 7 !== 5) {
        calories = 520 + (dayIndex * 22) % 110;
        meals.push('Roti, Tadka Dal & Paneer');
      } else if (hour === 15) {
        if (dayIndex === 9) {
          // Highlighted active cell matching reference '417'
          calories = 417;
          meals.push('High-Protein Greek Yogurt Bowl');
        } else if (dayIndex % 2 === 1) {
          calories = 220;
          meals.push('Fruit & Roasted Seeds');
        }
      } else if (hour === 16 && (dayIndex % 2 === 1 || dayIndex === 9)) {
        calories = 210;
        meals.push('Peanut Butter Toast & Almonds');
      } else if (hour === 19 && dayIndex <= 9) {
        calories = 490 + (dayIndex * 18) % 80;
        meals.push('Grilled Chicken / Paneer Bhurji');
      }
    }

    let level = 0;
    if (calories > 400) level = 3;
    else if (calories > 220) level = 2;
    else if (calories > 0) level = 1;

    return {
      dayLabel: day.label,
      dayDate: day.date,
      hour,
      hourLabel: hourLabels[hour] || `${hour}:00`,
      calories,
      meals,
      level,
    };
  };

  return (
    <div className="w-full rounded-3xl p-4 sm:p-6 bg-[#0c0d12] border border-white/[0.06] shadow-xl space-y-5 select-none">
      {/* Top Header matching reference (Range selector) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-white/5 text-zinc-300 border border-white/10">
            <Clock size={16} />
          </span>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Meal Cadence
          </h3>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/60 border border-white/10 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveRange('day')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeRange === 'day' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Day
          </button>
          <button
            type="button"
            onClick={() => setActiveRange('week')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeRange === 'week' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Week
          </button>
          <button
            type="button"
            onClick={() => setActiveRange('month')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeRange === 'month' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Main Grid & Pacing Card Row (Matching media_1791387493625.jpg top layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 14 Days x 12 Hours Heatmap Matrix */}
        <div className="lg:col-span-8 bg-black/60 rounded-3xl p-4 sm:p-5 border border-white/10 overflow-x-auto no-scrollbar">
          <div className="min-w-[560px]">
            <div className="flex gap-2">
              {/* Matrix Columns (Days) - Exact 14 columns grid */}
              <div
                className="flex-1"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(14, minmax(0, 1fr))',
                  gap: '5px',
                }}
              >
                {days.map((day, dIdx) => (
                  <div key={day.date} className="flex flex-col gap-1.5">
                    {/* Hour Blocks for this day (7pm down to 8am) */}
                    {hours.map((hour) => {
                      const cell = getCellData(dIdx, hour);
                      const isHovered =
                        hoveredCell?.dayDate === cell.dayDate && hoveredCell?.hour === cell.hour;
                      const isRefActiveBadge = dIdx === 9 && hour === 15; // 'We 11' at 3pm (reference 417 badge)

                      // Colors: Stealth Monochrome Titanium scale
                      let cellColor = '';
                      if (day.isUpcoming) {
                        cellColor = 'bg-[#181924] border-white/5'; // Muted dark block for future days
                      } else if (cell.level === 3) {
                        cellColor =
                          'bg-white border-white shadow-[0_0_6px_rgba(255,255,255,0.4)] text-black font-bold';
                      } else if (cell.level === 2) {
                        cellColor = 'bg-zinc-400 border-zinc-400 text-black';
                      } else if (cell.level === 1) {
                        cellColor = 'bg-zinc-700 border-zinc-700 text-white';
                      } else {
                        cellColor = 'bg-[#14151e] border-white/[0.04]'; // Empty
                      }

                      return (
                        <div
                          key={`${day.date}-${hour}`}
                          onMouseEnter={() => setHoveredCell(cell)}
                          onMouseLeave={() => setHoveredCell(null)}
                          className={`relative h-4 sm:h-[18px] rounded-[4px] border transition-all duration-150 cursor-pointer flex items-center justify-center ${cellColor} ${
                            isHovered
                              ? 'scale-110 z-30 ring-2 ring-white shadow-xl'
                              : 'hover:opacity-90'
                          }`}
                        >
                          {/* Value badge matching reference '417' pill on We 11 at 3pm */}
                          {(isRefActiveBadge || isHovered) && cell.calories > 0 && (
                            <div className="absolute z-30 px-1.5 py-0.5 rounded-[4px] bg-white text-black font-extrabold font-mono text-[9px] shadow-[0_4px_12px_rgba(0,0,0,0.8)] flex items-center gap-0.5 pointer-events-none whitespace-nowrap">
                              <span>{cell.calories}</span>
                              <span className="text-[7px]">👆</span>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Day Column Footer Label */}
                    <span
                      className={`text-[10px] font-mono text-center mt-2 font-medium truncate ${
                        day.isToday ? 'text-white font-bold' : 'text-zinc-500'
                      }`}
                    >
                      {day.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Y-Axis Hour Labels (Right side, matching reference image) */}
              <div className="flex flex-col gap-1.5 justify-start text-[10px] font-mono text-zinc-500 font-medium pl-1.5 select-none shrink-0">
                {hours.map((h) => (
                  <div key={h} className="h-4 sm:h-[18px] flex items-center">
                    {hourLabels[h]}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Legend */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 mt-2 border-t border-white/5 text-[11px] font-mono text-zinc-400">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-[3px] bg-white" />
                <span>Peak window: 1:00 PM – 2:30 PM (Lunch, 520+ kcal)</span>
              </span>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span>Empty</span>
                <span className="w-2.5 h-2.5 rounded-[2px] bg-[#14151e]" />
                <span className="w-2.5 h-2.5 rounded-[2px] bg-zinc-700" />
                <span className="w-2.5 h-2.5 rounded-[2px] bg-zinc-400" />
                <span className="w-2.5 h-2.5 rounded-[2px] bg-white" />
                <span>Heavy</span>
                <span className="ml-2 pl-2 border-l border-white/10 flex items-center gap-1 text-zinc-500">
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-[#181924]" />
                  <span>Upcoming</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Pacing Status Widget matching reference top right */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-[#0c0d12] border border-white/10 shadow-xl">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Zap size={14} />
                <span>Pacing Status</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-white" />
            </div>

            {/* Pacing progress bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-400">Completion</span>
                <span className="text-white font-bold">85%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/60 border border-white/10 overflow-hidden">
                <div className="w-[85%] h-full bg-white rounded-full shadow-sm" />
              </div>
            </div>

            {/* Active Counter Badges */}
            <div className="flex items-center gap-2 pt-1 text-xs font-mono text-zinc-300 flex-wrap">
              <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10">
                417 kcal lunch
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-zinc-300">
                26g P
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-zinc-300">
                391 ml
              </span>
            </div>
          </div>

          {/* Interactive Inspection Details for Hovered Cell */}
          <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10">
            {hoveredCell && hoveredCell.calories > 0 ? (
              <div className="space-y-1 animate-fade-in">
                <div className="flex items-center justify-between text-xs">
                  <strong className="text-white">{hoveredCell.dayLabel} at {hoveredCell.hourLabel}</strong>
                  <span className="font-mono text-white font-bold">{hoveredCell.calories} kcal</span>
                </div>
                <p className="text-[11px] text-zinc-400 truncate">
                  {hoveredCell.meals.join(', ')}
                </p>
              </div>
            ) : (
              <p className="text-[11px] text-zinc-500 font-mono">
                Hover over any hour block to view exact meal calories and food items.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
