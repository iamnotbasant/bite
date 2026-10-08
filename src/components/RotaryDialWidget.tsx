import React, { useState } from 'react';
import { Plus, Clock } from 'lucide-react';

interface RotaryDialWidgetProps {
  onQuickLog: (calories: number) => void;
  theme: 'emerald' | 'obsidian' | 'pure-black';
}

export const RotaryDialWidget: React.FC<RotaryDialWidgetProps> = ({
  onQuickLog,
  theme,
}) => {
  const [dialValue, setDialValue] = useState<number>(250); // Default 250 kcal
  const [fastingHours] = useState<number>(14);

  // Quick increment/decrement
  const adjustDial = (delta: number) => {
    setDialValue((prev) => Math.max(50, Math.min(1200, prev + delta)));
  };

  return (
    <div
      className={`rounded-3xl p-5 transition-all duration-300 ${
        theme === 'emerald'
          ? 'glass-emerald-card text-white'
          : 'glass-obsidian-surface text-white'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock size={16} className={theme === 'emerald' ? 'text-white' : 'text-rose-400'} />
          <span className="text-xs uppercase tracking-wider font-bold">
            Dial Quick Logger
          </span>
        </div>
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            theme === 'emerald' ? 'bg-white/20' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
          }`}
        >
          {fastingHours}h Fasted
        </span>
      </div>

      {/* Rotary Center Core matching Reference 4 */}
      <div className="relative flex items-center justify-center my-3">
        {/* Ambient Radial Magenta/Coral Glow Core */}
        <div
          className={`absolute w-36 h-36 rounded-full blur-xl pointer-events-none ${
            theme === 'emerald'
              ? 'bg-white/20'
              : 'bg-rose-600/30'
          }`}
        />

        {/* Circular Dial with Tick Marks */}
        <div className="relative w-44 h-44 rounded-full border-2 border-white/20 flex items-center justify-center bg-black/30 backdrop-blur-md shadow-inner">
          {/* Circular Tick Marks */}
          {[...Array(16)].map((_, i) => {
            const angle = (i * 360) / 16;
            return (
              <div
                key={i}
                className="absolute w-1 h-2 bg-white/40 rounded-full"
                style={{
                  transform: `rotate(${angle}deg) translateY(-80px)`,
                }}
              />
            );
          })}

          {/* Center Digital Readout */}
          <div className="flex flex-col items-center justify-center z-10 text-center">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-white/70">
              Dial Cal
            </span>
            <span className="font-digital text-4xl font-extrabold tracking-wider text-white drop-shadow-md">
              {dialValue}
            </span>
            <span className="text-xs font-semibold text-white/80">kcal</span>
          </div>
        </div>
      </div>

      {/* Dial Controls & Log Button */}
      <div className="flex items-center justify-between gap-2 mt-4">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => adjustDial(-50)}
            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold transition-all active:scale-95 ${
              theme === 'emerald'
                ? 'bg-white/20 hover:bg-white/30 text-white'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            -50
          </button>
          <button
            type="button"
            onClick={() => adjustDial(50)}
            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold transition-all active:scale-95 ${
              theme === 'emerald'
                ? 'bg-white/20 hover:bg-white/30 text-white'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            +50
          </button>
        </div>

        <button
          type="button"
          onClick={() => onQuickLog(dialValue)}
          className={`flex-1 py-2.5 px-4 rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer ${
            theme === 'emerald'
              ? 'bg-white text-black hover:bg-white/95'
              : 'bg-rose-500 hover:bg-rose-600 text-white'
          }`}
        >
          <Plus size={16} />
          <span>Log {dialValue} kcal</span>
        </button>
      </div>
    </div>
  );
};
