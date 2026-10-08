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
          <filter id={`ballShadow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#000000" floodOpacity="0.8" />
          </filter>
          <clipPath id={`trackClip-${id}`}>
            <rect x={padX} y={trackY} width={trackW} height={trackH} rx={rx} />
          </clipPath>
        </defs>

        {/* Base Track Border & Background (Clean solid dark track) */}
        <rect
          x={padX}
          y={trackY}
          width={trackW}
          height={trackH}
          rx={rx}
          fill="#121319"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="1"
        />

        {/* Inside Track (Clipped by Pill) */}
        <g clipPath={`url(#trackClip-${id})`}>
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
          <clipPath id={`compactClip-${id}`}>
            <rect x={padX} y={trackY} width={trackW} height={trackH} rx={rx} />
          </clipPath>
        </defs>

        {/* Base Track (Clean solid dark track) */}
        <rect
          x={padX}
          y={trackY}
          width={trackW}
          height={trackH}
          rx={rx}
          fill="#121319"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="0.8"
        />

        {/* Inside Track (Clipped by Pill) */}
        <g clipPath={`url(#compactClip-${id})`}>
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
      icon: <Dumbbell size={18} className="text-white" strokeWidth={2.2} />,
      desktopIcon: <Dumbbell size={26} className="text-white" strokeWidth={2.2} />,
    },
    {
      id: 'carbs',
      label: 'Carbs',
      current: carbs,
      goal: carbsGoal,
      unit: 'g',
      icon: <Wheat size={18} className="text-white" strokeWidth={2.2} />,
      desktopIcon: <Wheat size={26} className="text-white" strokeWidth={2.2} />,
    },
    {
      id: 'fat',
      label: 'Fat',
      current: fat,
      goal: fatGoal,
      unit: 'g',
      icon: <Droplets size={18} className="text-white" strokeWidth={2.2} />,
      desktopIcon: <Droplets size={26} className="text-white" strokeWidth={2.2} />,
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
            className={`rounded-[26px] p-2.5 sm:p-3.5 bg-[radial-gradient(ellipse_90%_60%_at_35%_-10%,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0.10)_38%,transparent_65%),linear-gradient(180deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.12)_22%,rgba(255,255,255,0.03)_44%,transparent_56%)] bg-[#050506] border border-white/[0.25] border-t-white/[0.88] hover:border-white/[0.35] shadow-[0_16px_36px_rgba(0,0,0,0.95),inset_0_2px_2px_rgba(255,255,255,0.65),inset_0_2px_1px_rgba(255,255,255,0.90),inset_0_4px_14px_rgba(255,255,255,0.16),0_0_32px_rgba(255,255,255,0.06)] flex flex-col justify-between transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer select-none min-h-[122px] sm:min-h-[140px] group ${cardHoverClass} ${staggerClass} card-fintech-interactive`}
            title={`Tap to view ${macro.label} on radar arc`}
          >
            {/* Top: Label on Left + Circular Glossy Icon Chip on Right (matching reference circular badges) */}
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[11px] sm:text-xs font-bold text-zinc-300 tracking-tight truncate">
                {macro.label}
              </span>
              <div className="chip-circular-gloss w-9 h-9 sm:w-10 sm:h-10 text-white group-hover:scale-108 transition-transform shadow-[inset_0_1.5px_0.8px_rgba(255,255,255,0.85),0_6px_14px_rgba(0,0,0,0.85)] shrink-0">
                {macro.icon}
              </div>
            </div>

            {/* Middle: Macro Value + Goal */}
            <div className="my-1 sm:my-1.5">
              <div className="flex items-baseline gap-0.5 sm:gap-1">
                <span className="text-lg sm:text-2xl font-black text-white leading-none tracking-tight font-sans drop-shadow-[0_1px_6px_rgba(255,255,255,0.25)]">
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
                <span className="text-zinc-300 font-bold tracking-tight truncate">
                  {remaining > 0 ? `${remaining}${macro.unit} left` : 'Done'}
                </span>
                <span className="font-bold text-white shrink-0 ml-1">
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
        const cardHoverClass = 'hover:border-white/30 hover:bg-[#0c0d12]';

        return (
          <div
            key={macro.id}
            onClick={() => onSelectMetric?.(macro.id)}
            role="button"
            tabIndex={0}
            className={`group relative rounded-[26px] p-4 sm:p-5 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden border border-white/[0.25] border-t-white/[0.88] bg-[radial-gradient(ellipse_90%_60%_at_35%_-10%,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0.10)_38%,transparent_65%),linear-gradient(180deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.12)_22%,rgba(255,255,255,0.03)_44%,transparent_56%)] bg-[#050506] hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-[0_20px_44px_rgba(0,0,0,0.95),inset_0_2px_2px_rgba(255,255,255,0.65),inset_0_2px_1px_rgba(255,255,255,0.90),inset_0_4px_16px_rgba(255,255,255,0.18),0_0_32px_rgba(255,255,255,0.06)] ${cardHoverClass} ${staggerClass} card-fintech-interactive`}
            title={`Click to view ${macro.label} on radar arc`}
          >
            {/* Left: Circular Glossy Icon Chip + Label & White Values */}
            <div className="flex items-center gap-3.5 min-w-[140px] sm:min-w-[170px]">
              <div className="chip-circular-gloss w-14 h-14 text-white group-hover:scale-105 transition-transform duration-300 shrink-0 shadow-[inset_0_1.5px_0.8px_rgba(255,255,255,0.85),0_6px_16px_rgba(0,0,0,0.85)]">
                {macro.desktopIcon}
              </div>

              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wider font-sans text-zinc-300">
                  {macro.label}
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-black text-white font-sans tracking-tight drop-shadow-[0_2px_8px_rgba(255,255,255,0.25)]">
                    {macro.current}
                  </span>
                  <span className="text-xs font-semibold font-mono text-zinc-400">
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
                  <span className="text-zinc-300 font-bold tracking-tight">
                    {remaining > 0 ? `${remaining}${macro.unit} left` : 'Completed'}
                  </span>
                  <span className="font-bold text-white">{displayPercent}%</span>
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
