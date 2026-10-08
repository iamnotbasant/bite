import React, { useState, useEffect, useRef } from 'react';
import { Wheat, Dumbbell, Droplets } from 'lucide-react';

interface StraightRadarBarProps {
  percent: number;
  id: string;
}

// Straight Radar Progress Bar in normal black theme (chunky pill height, solid white fill, floating white barbell pin, diagonal cross-lines)
const StraightRadarBar: React.FC<StraightRadarBarProps> = ({ percent, id }) => {
  const [animPercent, setAnimPercent] = useState<number>(0);
  const animRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const targetRef = useRef<number>(percent);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    targetRef.current = Math.min(100, Math.max(0, percent));
    startRef.current = animPercent;
    startTimeRef.current = null;

    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
    }

    const duration = 850;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);

      const val = startRef.current + (targetRef.current - startRef.current) * ease;
      setAnimPercent(val);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setAnimPercent(targetRef.current);
      }
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [percent]);

  const clampedPercent = Math.min(100, Math.max(0, animPercent));
  const width = 320;
  const height = 40;
  const padX = 14;
  const trackW = width - 2 * padX;
  const trackY = 8;
  const trackH = 24;
  const rx = trackH / 2; // 12

  const progressW = (clampedPercent / 100) * trackW;
  const progressX = padX + progressW;

  return (
    <div className="w-full relative h-[40px] select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full block overflow-visible"
      >
        <defs>
          {/* Diagonal Cross-Line Pattern (Pure White stripes at 45°) matching Calorie Arc Gauge */}
          <pattern
            id={`radarStripes-${id}`}
            patternUnits="userSpaceOnUse"
            width="10"
            height="10"
            patternTransform="rotate(45)"
          >
            <rect width="10" height="10" fill="rgba(255, 255, 255, 0.04)" />
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="10"
              stroke="#FFFFFF"
              strokeWidth="2.4"
              strokeOpacity="0.45"
            />
          </pattern>
          <filter id={`ballShadow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#000000" floodOpacity="0.8" />
          </filter>
          <clipPath id={`trackClip-${id}`}>
            <rect x={padX} y={trackY} width={trackW} height={trackH} rx={rx} />
          </clipPath>
        </defs>

        {/* Base Track Border & Background */}
        <rect
          x={padX}
          y={trackY}
          width={trackW}
          height={trackH}
          rx={rx}
          fill="rgba(255, 255, 255, 0.06)"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="1"
        />

        {/* Inside Track (Clipped by Pill) */}
        <g clipPath={`url(#trackClip-${id})`}>
          {/* Remainder Diagonal Stripes */}
          {clampedPercent < 100 && (
            <rect
              x={padX}
              y={trackY}
              width={trackW}
              height={trackH}
              fill={`url(#radarStripes-${id})`}
            />
          )}

          {/* Solid White Progress Fill (Rounded cap) */}
          {clampedPercent > 0 && (
            <rect
              x={padX}
              y={trackY}
              width={progressW}
              height={trackH}
              rx={rx}
              fill="#FFFFFF"
            />
          )}
        </g>

        {/* Barbell Pin Needle (Floating top & bottom balls + vertical line) */}
        {clampedPercent > 2 && clampedPercent < 98 && (
          <g>
            <line
              x1={progressX}
              y1={3}
              x2={progressX}
              y2={height - 3}
              stroke="#FFFFFF"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <circle
              cx={progressX}
              cy={4}
              r={4}
              fill="#FFFFFF"
              filter={`url(#ballShadow-${id})`}
            />
            <circle
              cx={progressX}
              cy={height - 4}
              r={4}
              fill="#FFFFFF"
              filter={`url(#ballShadow-${id})`}
            />
          </g>
        )}
      </svg>
    </div>
  );
};

// Compact Radar Progress Bar for Mobile Cards (height 18px, solid white fill, white barbell pin clamp, diagonal cross-lines buffer)
interface CompactRadarBarProps {
  percent: number;
  id: string;
}

const CompactRadarBar: React.FC<CompactRadarBarProps> = ({ percent, id }) => {
  const [animPercent, setAnimPercent] = useState<number>(0);
  const animRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const targetRef = useRef<number>(percent);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    targetRef.current = Math.min(100, Math.max(0, percent));
    startRef.current = animPercent;
    startTimeRef.current = null;

    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
    }

    const duration = 850;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);

      const val = startRef.current + (targetRef.current - startRef.current) * ease;
      setAnimPercent(val);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setAnimPercent(targetRef.current);
      }
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [percent]);

  const clampedPercent = Math.min(100, Math.max(0, animPercent));
  const width = 100;
  const height = 18;
  const padX = 4;
  const trackW = width - 2 * padX;
  const trackY = 4;
  const trackH = 10;
  const rx = trackH / 2; // 5

  const progressW = (clampedPercent / 100) * trackW;
  const progressX = padX + progressW;

  return (
    <div className="w-full relative h-[18px] select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full block overflow-visible"
      >
        <defs>
          <pattern
            id={`compactStripes-${id}`}
            patternUnits="userSpaceOnUse"
            width="6"
            height="6"
            patternTransform="rotate(45)"
          >
            <rect width="6" height="6" fill="rgba(255, 255, 255, 0.04)" />
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="6"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeOpacity="0.45"
            />
          </pattern>
          <clipPath id={`compactClip-${id}`}>
            <rect x={padX} y={trackY} width={trackW} height={trackH} rx={rx} />
          </clipPath>
        </defs>

        {/* Base Track */}
        <rect
          x={padX}
          y={trackY}
          width={trackW}
          height={trackH}
          rx={rx}
          fill="rgba(255, 255, 255, 0.06)"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="0.8"
        />

        {/* Inside Track (Clipped by Pill) */}
        <g clipPath={`url(#compactClip-${id})`}>
          {/* Remainder Striped Buffer */}
          {clampedPercent < 100 && (
            <rect
              x={padX}
              y={trackY}
              width={trackW}
              height={trackH}
              fill={`url(#compactStripes-${id})`}
            />
          )}

          {/* Solid White Progress Fill */}
          {clampedPercent > 0 && (
            <rect
              x={padX}
              y={trackY}
              width={progressW}
              height={trackH}
              rx={rx}
              fill="#FFFFFF"
            />
          )}
        </g>

        {/* Barbell Pin Clamp at Cut Line */}
        {clampedPercent > 2 && clampedPercent < 98 && (
          <g>
            <line
              x1={progressX}
              y1={1}
              x2={progressX}
              y2={height - 1}
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <circle cx={progressX} cy={2.2} r={2.2} fill="#FFFFFF" />
            <circle cx={progressX} cy={height - 2.2} r={2.2} fill="#FFFFFF" />
          </g>
        )}
      </svg>
    </div>
  );
};

export interface MacroMetricItem {
  id: 'calories' | 'protein' | 'carbs' | 'fat';
  label: string;
  current: number;
  goal: number;
  unit: string;
  icon: React.ReactNode;
  desktopIcon: React.ReactNode;
}

interface MacroCardsGridProps {
  protein?: number;
  proteinGoal?: number;
  carbs?: number;
  carbsGoal?: number;
  fat?: number;
  fatGoal?: number;
  metrics?: MacroMetricItem[];
  onSelectMetric?: (metricId: 'calories' | 'protein' | 'carbs' | 'fat') => void;
  variant?: 'auto' | 'compact' | 'horizontal';
  water?: number;
  waterGoal?: number;
  theme?: 'emerald' | 'obsidian' | 'pure-black';
  cardStyle?: 'glow' | 'stealth';
  onAddWater?: (amount: number) => void;
}

export const MacroCardsGrid: React.FC<MacroCardsGridProps> = ({
  protein = 0,
  proteinGoal = 120,
  carbs = 0,
  carbsGoal = 180,
  fat = 0,
  fatGoal = 45,
  metrics: customMetrics,
  onSelectMetric,
  variant = 'auto',
}) => {
  // If custom metrics are passed (e.g. when Calories swaps with a macro), use them;
  // otherwise default to standard Protein, Carbs, Fat
  const defaultMacros: MacroMetricItem[] = [
    {
      id: 'protein',
      label: 'Protein',
      current: protein,
      goal: proteinGoal,
      unit: 'g',
      icon: <Dumbbell size={15} className="text-white" />,
      desktopIcon: <Dumbbell size={22} className="text-white" />,
    },
    {
      id: 'carbs',
      label: 'Carbs',
      current: carbs,
      goal: carbsGoal,
      unit: 'g',
      icon: <Wheat size={15} className="text-white" />,
      desktopIcon: <Wheat size={22} className="text-white" />,
    },
    {
      id: 'fat',
      label: 'Fat',
      current: fat,
      goal: fatGoal,
      unit: 'g',
      icon: <Droplets size={15} className="text-white" />,
      desktopIcon: <Droplets size={22} className="text-white" />,
    },
  ];

  const macros = customMetrics && customMetrics.length > 0 ? customMetrics : defaultMacros;

  // 1. Mobile Compact 3-Column Squircle Grid with Bottom Progress Radar Line & Full Dashboard Info
  const renderCompactGrid = () => (
    <div className="w-full grid grid-cols-3 gap-1.5 sm:gap-3 select-none">
      {macros.map((macro, idx) => {
        const rawPercent = macro.goal > 0 ? (macro.current / macro.goal) * 100 : 0;
        const displayPercent = Math.min(100, Math.round(rawPercent));
        const remaining = Math.max(0, macro.goal - macro.current);
        const staggerClass = idx === 0 ? 'animate-stagger-1' : idx === 1 ? 'animate-stagger-2' : 'animate-stagger-3';
        const cardHoverClass = 'hover:border-white/20 hover:bg-white/[0.03]';

        return (
          <div
            key={macro.id}
            onClick={() => onSelectMetric?.(macro.id)}
            role="button"
            tabIndex={0}
            className={`rounded-2xl p-2 sm:p-3.5 bg-gradient-to-b from-[#181923] to-[#111219] border border-white/[0.08] shadow-[0_10px_25px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.07)] flex flex-col justify-between transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer select-none min-h-[114px] sm:min-h-[132px] group ${cardHoverClass} ${staggerClass} card-interactive-lift`}
            title={`Tap to view ${macro.label} on radar arc`}
          >
            {/* Top: Label on Left + Icon Badge on Right */}
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[11px] sm:text-sm font-bold text-white tracking-tight truncate">
                {macro.label}
              </span>
              <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                {macro.icon}
              </div>
            </div>

            {/* Middle: Grams / Goal */}
            <div className="my-0.5 sm:my-1">
              <div className="flex items-baseline gap-0.5 sm:gap-1">
                <span className="text-base sm:text-xl font-black text-white leading-none tracking-tight">
                  {macro.current}
                </span>
                <span className="text-[10px] sm:text-[11px] text-zinc-400 font-medium font-mono">
                  /{macro.goal}{macro.unit}
                </span>
              </div>
            </div>

            {/* Bottom: Progress Line (Radar Bar) + Remaining Left & Percentage */}
            <div className="flex flex-col gap-1 sm:gap-1.5 pt-1 mt-auto">
              <CompactRadarBar
                percent={rawPercent}
                id={macro.id}
              />

              <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono leading-none pt-0.5">
                <span className="text-zinc-400 truncate">
                  {remaining > 0 ? `${remaining}${macro.unit} left` : 'Done'}
                </span>
                <span className="font-bold text-white/90 shrink-0 ml-1">
                  {displayPercent}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // 2. Desktop Horizontal Cards with Straight Radar Progress Bars
  const renderHorizontalStack = () => (
    <div className="w-full flex flex-col gap-4 select-none">
      {macros.map((macro, idx) => {
        const rawPercent = macro.goal > 0 ? (macro.current / macro.goal) * 100 : 0;
        const displayPercent = Math.min(100, Math.round(rawPercent));
        const remaining = Math.max(0, macro.goal - macro.current);
        const staggerClass = idx === 0 ? 'animate-stagger-1' : idx === 1 ? 'animate-stagger-2' : 'animate-stagger-3';
        const cardHoverClass = 'hover:border-white/20 hover:bg-[#1a1b24]';

        return (
          <div
            key={macro.id}
            onClick={() => onSelectMetric?.(macro.id)}
            role="button"
            tabIndex={0}
            className={`group relative rounded-3xl p-4 sm:p-5 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden border border-white/[0.08] bg-gradient-to-b from-[#181923] to-[#0e0f14] hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-[0_12px_28px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.07)] ${cardHoverClass} ${staggerClass} card-interactive-lift`}
            title={`Click to view ${macro.label} on radar arc`}
          >
            {/* Left: Icon + Label & Values */}
            <div className="flex items-center gap-3.5 min-w-[140px] sm:min-w-[170px]">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-white/15 to-white/5 border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.3)] flex items-center justify-center shrink-0 text-white group-hover:scale-105 transition-transform duration-300">
                {macro.desktopIcon}
              </div>

              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wider font-sans text-white/50">
                  {macro.label}
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-black text-white font-sans tracking-tight">
                    {macro.current}
                  </span>
                  <span className="text-xs font-semibold font-mono text-zinc-500">
                    /{macro.goal}{macro.unit}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Chunky Straight Radar Progress Bar */}
            <div className="flex-1 max-w-full sm:max-w-[260px] md:max-w-[320px] flex items-center gap-3.5">
              <div className="flex-1 flex flex-col gap-1.5">
                <StraightRadarBar
                  percent={rawPercent}
                  id={macro.id}
                />

                <div className="flex items-center justify-between text-[11px] font-mono px-1">
                  <span className="text-zinc-500">
                    {remaining > 0 ? `${remaining}${macro.unit} left` : 'Completed'}
                  </span>
                  <span className="font-bold text-white/90">{displayPercent}%</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  if (variant === 'compact') {
    return renderCompactGrid();
  }

  if (variant === 'horizontal') {
    return renderHorizontalStack();
  }

  // 'auto' responsive: Compact on small screens (< lg), Horizontal on large screens (>= lg)
  return (
    <>
      <div className="block lg:hidden w-full">
        {renderCompactGrid()}
      </div>
      <div className="hidden lg:block w-full">
        {renderHorizontalStack()}
      </div>
    </>
  );
};
