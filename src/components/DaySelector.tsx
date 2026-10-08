import React from 'react';
import type { DayLog } from '../types';

interface DaySelectorProps {
  logs: DayLog[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  theme: 'emerald' | 'obsidian' | 'pure-black';
}

export const DaySelector: React.FC<DaySelectorProps> = ({
  logs,
  selectedDate,
  onSelectDate,
  theme,
}) => {
  const selectedLog = logs.find((l) => l.date === selectedDate) || logs[0];

  return (
    <div className="flex flex-col items-center justify-center w-full py-2 select-none">
      {/* Horizontal Day Buttons Row (Su, Mo, Tu, Today, Th, Fr, Sa) */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 max-w-full overflow-x-auto no-scrollbar px-2 py-1">
        {logs.map((day) => {
          const isSelected = day.date === selectedDate;
          const label = day.isToday ? 'Today' : day.dayLabel;

          return (
            <button
              key={day.date}
              type="button"
              onClick={() => onSelectDate(day.date)}
              className={`relative transition-all duration-300 ease-out cursor-pointer flex items-center justify-center ${
                isSelected
                  ? 'px-4 sm:px-5 py-2 rounded-full font-black text-sm sm:text-base shadow-[0_0_16px_rgba(205,255,80,0.4)] scale-105 z-10 bg-[#CDFF50] text-black border border-[#CDFF50]'
                  : 'w-9 h-9 sm:w-11 sm:h-11 rounded-full text-xs sm:text-sm font-semibold btn-pill-glass text-zinc-400 hover:text-white'
              }`}
            >
              <span>{label}</span>

              {/* Dot indicator if day has logged meals */}
              {!isSelected && day.meals.length > 0 && (
                <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#CDFF50] shadow-[0_0_6px_rgba(205,255,80,0.8)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Date Subtitle (e.g. "23 Aug" directly below active day as shown in Reference 1) */}
      <div className="mt-1.5 text-center">
        <span
          className={`text-xs sm:text-sm font-medium tracking-wide ${
            theme === 'emerald' ? 'text-white/90 drop-shadow-sm' : 'text-zinc-400'
          }`}
        >
          {selectedLog.displayDate}
        </span>
      </div>
    </div>
  );
};
