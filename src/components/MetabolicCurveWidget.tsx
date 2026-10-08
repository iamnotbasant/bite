import React, { useState } from 'react';

interface MetabolicCurveWidgetProps {
  sugarLevel: number;
  glucoseAverage: number;
  timeInRange: number;
  burnedCalories: number;
  theme: 'emerald' | 'obsidian' | 'pure-black';
}

export const MetabolicCurveWidget: React.FC<MetabolicCurveWidgetProps> = ({
  sugarLevel = 90,
  glucoseAverage = 84,
  timeInRange = 100,
  burnedCalories = 460,
  theme,
}) => {
  const [activePoint, setActivePoint] = useState<number>(3); // Default to current time

  // Timeline points for intake & expenditure curve
  const timelinePoints = [
    { time: '08:00', label: 'Breakfast', val: 75, burn: 110 },
    { time: '11:00', label: 'Workout', val: 120, burn: 280 },
    { time: '13:00', label: 'Lunch', val: 95, burn: 140 },
    { time: '16:00', label: 'Current', val: 90, burn: 190 },
    { time: '19:00', label: 'Dinner', val: 85, burn: 120 },
    { time: '22:00', label: 'Rest', val: 78, burn: 80 },
  ];

  // SVG dimensions for the sine-wave
  const svgWidth = 360;
  const svgHeight = 75;

  // Generate smooth cubic bezier curve
  // Points map to x: 20 to 340, y: 15 to 60
  const points = [
    { x: 20, y: 48 },
    { x: 80, y: 18 },
    { x: 150, y: 55 },
    { x: 220, y: 24 },
    { x: 290, y: 45 },
    { x: 340, y: 35 },
  ];

  const currentPt = points[activePoint] || points[3];

  return (
    <div
      className={`rounded-3xl p-5 transition-all duration-300 ${
        theme === 'emerald' || theme === 'pure-black'
          ? 'bg-[#111218] border border-white/10 text-white shadow-xl'
          : 'glass-obsidian-surface text-white'
      }`}
    >
      {/* Top Header with Veri-Style Dot-Matrix Sugar / Energy Metric */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-zinc-400">
            Metabolic Telemetry
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            {/* Dot-matrix style typography from Reference 4 */}
            <span className="font-digital text-3xl font-extrabold tracking-wider text-white drop-shadow-sm">
              {sugarLevel}
            </span>
            <span className="text-xs font-semibold text-zinc-400">
              mg/dL (Glucose)
            </span>
          </div>
        </div>

        <div className="text-right">
          <span
            className={`text-xs uppercase tracking-widest font-bold ${
              theme === 'emerald' ? 'text-white/75' : 'text-zinc-400'
            }`}
          >
            Active Burn
          </span>
          <div className="flex items-baseline justify-end gap-1 mt-0.5">
            <span className="font-digital text-2xl font-bold text-amber-300">
              +{burnedCalories}
            </span>
            <span
              className={`text-xs font-semibold ${
                theme === 'emerald' ? 'text-white/80' : 'text-zinc-400'
              }`}
            >
              kcal
            </span>
          </div>
        </div>
      </div>

      {/* Sine-Wave Energy Curve from Reference 4 */}
      <div className="relative w-full my-2 bg-black/20 rounded-2xl p-2.5 overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-16 overflow-visible"
        >
          <defs>
            <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="40%" stopColor="#FBBF24" />
              <stop offset="70%" stopColor="#F43F5E" />
              <stop offset="100%" stopColor="#60A5FA" />
            </linearGradient>
            <filter id="waveGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Golden Sine Curve */}
          <path
            d={`M 20 48 C 50 20, 60 18, 80 18 C 110 18, 120 55, 150 55 C 180 55, 190 24, 220 24 C 250 24, 270 45, 290 45 C 310 45, 325 35, 340 35`}
            fill="none"
            stroke="url(#waveGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#waveGlow)"
          />

          {/* Interactive Nodes on Wave */}
          {points.map((pt, idx) => (
            <g
              key={idx}
              className="cursor-pointer transition-all hover:scale-125"
              onClick={() => setActivePoint(idx)}
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r={activePoint === idx ? 6 : 4}
                fill={activePoint === idx ? '#FFFFFF' : '#FBBF24'}
                stroke={activePoint === idx ? '#FFFFFF' : '#000000'}
                strokeWidth="2"
              />
            </g>
          ))}

          {/* Reference 4 Yellow Triangular Indicator pointer */}
          <polygon
            points={`${currentPt.x},${currentPt.y - 7} ${currentPt.x - 5},${
              currentPt.y - 14
            } ${currentPt.x + 5},${currentPt.y - 14}`}
            fill="#FBBF24"
            className="animate-bounce"
          />
        </svg>

        {/* Timeline Time Labels */}
        <div className="flex justify-between px-2 pt-1 text-[10px] font-mono text-white/60">
          {timelinePoints.map((tp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActivePoint(idx)}
              className={`hover:text-white transition-colors ${
                activePoint === idx ? 'text-amber-300 font-bold underline' : ''
              }`}
            >
              {tp.time}
            </button>
          ))}
        </div>
      </div>

      {/* Mini Telemetry Grid (Veri-Style from Reference 4) */}
      <div className="grid grid-cols-3 gap-2.5 mt-3">
        {/* Card 1: Average Glucose */}
        <div className="rounded-2xl p-2.5 bg-white/5 border border-white/5 transition-all">
          <div className="text-[10px] uppercase font-bold text-white/70 truncate">
            Avg Glucose
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-digital text-lg font-bold text-white">
              {glucoseAverage}
            </span>
            <span className="text-[10px] text-white/60">mg/dl</span>
          </div>
          <div className="w-full bg-white/10 h-1 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-white/80 h-full w-[84%]" />
          </div>
        </div>

        {/* Card 2: Time in Range */}
        <div className="rounded-2xl p-2.5 bg-white/5 border border-white/5 transition-all">
          <div className="text-[10px] uppercase font-bold text-white/70 truncate">
            Time in Range
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-digital text-lg font-bold text-white">
              {timeInRange}%
            </span>
          </div>
          <div className="w-full bg-white/10 h-1 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-cyan-400 h-full w-full" />
          </div>
        </div>

        {/* Card 3: Energy Score / Variability */}
        <div className="rounded-2xl p-2.5 bg-white/5 border border-white/5 transition-all">
          <div className="text-[10px] uppercase font-bold text-white/70 truncate">
            Stability
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-digital text-lg font-bold text-cyan-300">
              6.8%
            </span>
            <span className="text-[10px] text-cyan-400">Optimal</span>
          </div>
          <div className="w-full bg-white/10 h-1 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-cyan-400 h-full w-[90%]" />
          </div>
        </div>
      </div>
    </div>
  );
};
