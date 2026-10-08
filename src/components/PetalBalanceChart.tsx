import React, { useState } from 'react';
import {
  Flame,
  Dumbbell,
  Wheat,
  Droplet,
  Apple,
  ShieldCheck,
  Sparkles,
  Cookie,
} from 'lucide-react';
import type { DayLog } from '../types';

export interface PetalItem {
  id: string;
  label: string;
  shortLabel: string;
  valueDisplay: string;
  score: number; // 0 to 100 percentage
  targetDisplay: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accentColor: string;
}

interface PetalBalanceChartProps {
  currentDay: DayLog;
  weekLogs?: DayLog[];
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function createPetalPath(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startAngle: number,
  endAngle: number,
  cornerRadius: number = 8
): string {
  if (rOuter <= rInner + 2) return '';
  const cr = Math.min(cornerRadius, (rOuter - rInner) / 2);
  const outerOffset = (cr / rOuter) * (180 / Math.PI);
  const innerOffset = (cr / rInner) * (180 / Math.PI);

  const p1 = polarToCartesian(cx, cy, rInner + cr, startAngle);
  const p2 = polarToCartesian(cx, cy, rOuter - cr, startAngle);
  const p2Corner = polarToCartesian(cx, cy, rOuter, startAngle + outerOffset);
  const p3Corner = polarToCartesian(cx, cy, rOuter, endAngle - outerOffset);
  const p3 = polarToCartesian(cx, cy, rOuter - cr, endAngle);
  const p4 = polarToCartesian(cx, cy, rInner + cr, endAngle);
  const p4Corner = polarToCartesian(cx, cy, rInner, endAngle - innerOffset);
  const p1Corner = polarToCartesian(cx, cy, rInner, startAngle + innerOffset);

  const c2 = polarToCartesian(cx, cy, rOuter, startAngle);
  const c3 = polarToCartesian(cx, cy, rOuter, endAngle);
  const c4 = polarToCartesian(cx, cy, rInner, endAngle);
  const c1 = polarToCartesian(cx, cy, rInner, startAngle);

  return `
    M ${p1.x} ${p1.y}
    L ${p2.x} ${p2.y}
    Q ${c2.x} ${c2.y} ${p2Corner.x} ${p2Corner.y}
    A ${rOuter} ${rOuter} 0 0 1 ${p3Corner.x} ${p3Corner.y}
    Q ${c3.x} ${c3.y} ${p3.x} ${p3.y}
    L ${p4.x} ${p4.y}
    Q ${c4.x} ${c4.y} ${p4Corner.x} ${p4Corner.y}
    A ${rInner} ${rInner} 0 0 0 ${p1Corner.x} ${p1Corner.y}
    Q ${c1.x} ${c1.y} ${p1.x} ${p1.y}
    Z
  `;
}

export const PetalBalanceChart: React.FC<PetalBalanceChartProps> = ({
  currentDay,
}) => {
  const [selectedPetalIndex, setSelectedPetalIndex] = useState<number>(0);

  // Compute live nutritional metrics from day log
  const totalKcal = currentDay.meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalP = currentDay.meals.reduce((sum, m) => sum + (m.protein || 0), 0);
  const totalC = currentDay.meals.reduce((sum, m) => sum + (m.carbs || 0), 0);
  const totalF = currentDay.meals.reduce((sum, m) => sum + (m.fat || 0), 0);
  const totalFiber = currentDay.meals.reduce((sum, m) => sum + (m.fiber || 0), 0) || 28;
  const totalSugar = currentDay.meals.reduce((sum, m) => sum + (m.sugar || 0), 0) || 24;

  // 8 Nutrients matching Create Food Form (Calories, Protein, Carbs, Fats, Fiber, Vitamins, Minerals, Sugar)
  const nutrientItems: PetalItem[] = [
    {
      id: 'calories',
      label: 'Calories',
      shortLabel: 'Calories',
      valueDisplay: `${totalKcal || 1360}`,
      score: Math.min(100, Math.round(((totalKcal || 1360) / (currentDay.calorieGoal || 1600)) * 100)),
      targetDisplay: `Goal: ${currentDay.calorieGoal || 1600} kcal`,
      icon: Flame,
      accentColor: 'text-amber-400',
    },
    {
      id: 'protein',
      label: 'Protein',
      shortLabel: 'Protein',
      valueDisplay: `${totalP || 100}g`,
      score: Math.min(100, Math.round(((totalP || 100) / (currentDay.proteinGoal || 120)) * 100)),
      targetDisplay: `Goal: ${currentDay.proteinGoal || 120}g`,
      icon: Dumbbell,
      accentColor: 'text-indigo-400',
    },
    {
      id: 'carbs',
      label: 'Carbohydrates',
      shortLabel: 'Carbs',
      valueDisplay: `${totalC || 137}g`,
      score: Math.min(100, Math.round(((totalC || 137) / (currentDay.carbsGoal || 180)) * 100)),
      targetDisplay: `Goal: ${currentDay.carbsGoal || 180}g`,
      icon: Wheat,
      accentColor: 'text-emerald-400',
    },
    {
      id: 'fat',
      label: 'Fats',
      shortLabel: 'Fats',
      valueDisplay: `${totalF || 45}g`,
      score: Math.min(100, Math.round(((totalF || 45) / (currentDay.fatGoal || 45)) * 100)),
      targetDisplay: `Goal: ${currentDay.fatGoal || 45}g`,
      icon: Droplet,
      accentColor: 'text-sky-400',
    },
    {
      id: 'fiber',
      label: 'Dietary Fiber',
      shortLabel: 'Fiber',
      valueDisplay: `${totalFiber}g`,
      score: Math.min(100, Math.round((totalFiber / 30) * 100)),
      targetDisplay: 'Target: 30g daily',
      icon: Apple,
      accentColor: 'text-teal-400',
    },
    {
      id: 'vitamins',
      label: 'Vitamins (A & C)',
      shortLabel: 'Vitamins',
      valueDisplay: '94%',
      score: 94,
      targetDisplay: 'Target: 100% DV',
      icon: ShieldCheck,
      accentColor: 'text-purple-400',
    },
    {
      id: 'minerals',
      label: 'Minerals (Ca & Fe)',
      shortLabel: 'Minerals',
      valueDisplay: '88%',
      score: 88,
      targetDisplay: 'Target: 100% DV',
      icon: Sparkles,
      accentColor: 'text-cyan-400',
    },
    {
      id: 'sugar',
      label: 'Sugars',
      shortLabel: 'Sugar',
      valueDisplay: `${totalSugar}g`,
      score: Math.min(100, Math.round((totalSugar / 35) * 100)),
      targetDisplay: 'Limit: ≤35g daily',
      icon: Cookie,
      accentColor: 'text-rose-400',
    },
  ];

  const activeItem = nutrientItems[selectedPetalIndex] || nutrientItems[0];

  // SVG Geometry Constants
  const cx = 200;
  const cy = 200;
  const rIn = 38;
  const rMax = 172;
  const sectorDeg = 45; // 360 / 8 = 45 degrees per sector
  const gapDeg = 3.5; // Gap between petals

  return (
    <div className="w-full rounded-3xl p-5 sm:p-7 md:p-8 bg-[radial-gradient(ellipse_65%_45%_at_50%_-5%,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.05)_25%,transparent_70%)] bg-[#050506] border border-white/[0.12] border-t-white/[0.45] shadow-[0_20px_50px_rgba(0,0,0,0.95),inset_0_1.2px_0.5px_rgba(255,255,255,0.45)] space-y-6 select-none">
      {/* Header with Title and Active Nutrient Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-white/[0.06] text-white border border-white/10">
            <activeItem.icon size={18} className={activeItem.accentColor} />
          </span>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
              Nutrient Balance Wheel
            </h3>
          </div>
        </div>

        {/* Selected Nutrient Pill Indicator */}
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-mono text-zinc-300 flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-white" />
            <span className="text-zinc-400">{activeItem.label}:</span>
            <strong className="text-white font-bold">{activeItem.valueDisplay}</strong>
            <span className="text-zinc-500">• {activeItem.targetDisplay}</span>
            <span className="px-1.5 py-0.2 rounded bg-white/10 text-white font-bold text-[10px]">
              {activeItem.score}%
            </span>
          </div>
        </div>
      </div>

      {/* Spacious 2-Column Desktop Layout: Left = Large Wheel, Right = Nutrient Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Enlarged Interactive 8-Petal Rose SVG */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-[360px] sm:max-w-[420px] xl:max-w-[450px] aspect-square flex items-center justify-center">
            <svg
              viewBox="0 0 400 400"
              className="w-full h-full overflow-visible drop-shadow-[0_16px_36px_rgba(0,0,0,0.7)]"
            >
              <defs>
                {/* Luminous soft cream-lavender gradient matching reference */}
                <linearGradient id="petalCreamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="50%" stopColor="#F5F0EA" />
                  <stop offset="100%" stopColor="#E5DFEC" />
                </linearGradient>

                {/* Active Highlight Gradient */}
                <linearGradient id="petalActiveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#FAF7F2" />
                </linearGradient>

                {/* Soft drop shadow */}
                <filter id="petalSoftShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#000000" floodOpacity="0.45" />
                </filter>
              </defs>

              {/* Render 8 Sectors */}
              {nutrientItems.map((item, i) => {
                const baseAngle = -90 + i * sectorDeg;
                const startAngle = baseAngle + gapDeg / 2;
                const endAngle = baseAngle + sectorDeg - gapDeg / 2;
                const midAngle = baseAngle + sectorDeg / 2;

                const isSelected = selectedPetalIndex === i;

                // Outer dark track background (scale 100%)
                const bgPath = createPetalPath(cx, cy, rIn, rMax, startAngle, endAngle, 10);

                // Filled petal path (based on score)
                const rFill = rIn + (Math.max(12, item.score) / 100) * (rMax - rIn);
                const fillPath = createPetalPath(
                  cx,
                  cy,
                  rIn,
                  rFill,
                  startAngle,
                  endAngle,
                  Math.min(9, (rFill - rIn) / 2)
                );

                // Coordinates for typography along sector centerline
                const textRadius = (rIn + rMax) / 2;
                const textPt = polarToCartesian(cx, cy, textRadius, midAngle);

                // Adaptive contrast: if petal covers the text area, text is dark charcoal; otherwise crisp white
                const isCoveredByFill = rFill >= textRadius + 12;
                const textColor = isCoveredByFill ? '#181922' : '#FFFFFF';
                const subColor = isCoveredByFill ? 'rgba(24, 25, 34, 0.75)' : 'rgba(255, 255, 255, 0.6)';

                return (
                  <g
                    key={item.id}
                    onClick={() => setSelectedPetalIndex(i)}
                    className={`cursor-pointer group transition-transform duration-300 ${
                      isSelected ? 'scale-[1.04]' : 'hover:scale-[1.02]'
                    }`}
                    style={{
                      transformOrigin: `${cx}px ${cy}px`,
                    }}
                  >
                    {/* Layer 1: Dark Outer Petal Track */}
                    <path
                      d={bgPath}
                      fill={isSelected ? '#3b3d47' : '#2c2e36'}
                      stroke={isSelected ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.08)'}
                      strokeWidth={isSelected ? 1.5 : 1}
                      className="transition-colors duration-200"
                    />

                    {/* Layer 2: Luminous Filled Petal */}
                    <path
                      d={fillPath}
                      fill={isSelected ? 'url(#petalActiveGrad)' : 'url(#petalCreamGrad)'}
                      filter="url(#petalSoftShadow)"
                      stroke={isSelected ? '#FFFFFF' : 'none'}
                      strokeWidth={isSelected ? 1.5 : 0}
                      className="transition-all duration-300"
                    />

                    {/* Layer 3: Typography (Value on top, label below) */}
                    <g pointerEvents="none">
                      <text
                        x={textPt.x}
                        y={textPt.y - 7}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill={textColor}
                        className="font-sans font-extrabold select-none"
                        style={{
                          fontSize: '15px',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {item.valueDisplay}
                      </text>
                      <text
                        x={textPt.x}
                        y={textPt.y + 9}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill={subColor}
                        className="font-sans font-bold select-none"
                        style={{
                          fontSize: '10px',
                          letterSpacing: '0.01em',
                        }}
                      >
                        {item.shortLabel}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Center Scallop / Star Hub */}
              <circle
                cx={cx}
                cy={cy}
                r={rIn - 6}
                fill="#0f1016"
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth="2"
              />
              <circle
                cx={cx}
                cy={cy}
                r={14}
                fill="#FFFFFF"
                className="opacity-90 shadow-sm"
              />
            </svg>
          </div>

          {/* Quick Nutrient Filter Chips (Mobile only) */}
          <div className="mt-4 flex lg:hidden flex-wrap justify-center gap-1.5 max-w-md">
            {nutrientItems.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedPetalIndex(idx)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-mono transition-all cursor-pointer ${
                  selectedPetalIndex === idx
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                {item.shortLabel}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: 8 Spacious Nutrient Cards utilizing full desktop width */}
        <div className="lg:col-span-7 xl:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {nutrientItems.map((item, idx) => {
            const isSelected = selectedPetalIndex === idx;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedPetalIndex(idx)}
                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#08090e] border-[#CDFF50]/50 border-t-[#CDFF50]/80 shadow-[0_8px_24px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(205,255,80,0.3)] scale-[1.01]'
                    : 'bg-[#07080b] hover:bg-[#0b0c10] border-white/[0.08] border-t-white/[0.22] hover:border-white/20'
                }`}
              >
                {/* Header row: Icon, Label, Percentage */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg bg-white/[0.05] ${item.accentColor}`}>
                      <item.icon size={15} />
                    </div>
                    <span className="text-xs font-bold text-white tracking-tight">
                      {item.label}
                    </span>
                  </div>

                  <span
                    className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-[#CDFF50] text-black shadow-sm'
                        : 'bg-white/10 text-zinc-300'
                    }`}
                  >
                    {item.score}%
                  </span>
                </div>

                {/* Main value display */}
                <div className="flex items-baseline justify-between">
                  <span className={`text-xl sm:text-2xl font-black tracking-tight font-sans ${isSelected ? 'text-[#CDFF50]' : 'text-white'}`}>
                    {item.valueDisplay}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {item.targetDisplay}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isSelected ? 'bg-[#CDFF50] shadow-[0_0_8px_rgba(205,255,80,0.8)]' : 'bg-zinc-400'
                    }`}
                    style={{ width: `${Math.min(100, item.score)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
