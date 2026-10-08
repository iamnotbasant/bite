import React, { useState, useEffect, useRef } from 'react';

interface CalorieArcGaugeProps {
  currentKcal: number;
  goalKcal: number;
  metricLabel?: string;
  unit?: string;
  theme?: 'emerald' | 'obsidian' | 'pure-black';
  onEditGoal?: () => void;
  onResetToCalories?: () => void;
}

export const CalorieArcGauge: React.FC<CalorieArcGaugeProps> = ({
  currentKcal,
  goalKcal,
  metricLabel = 'Calories',
  unit = 'kcal',
  onEditGoal,
  onResetToCalories,
}) => {
  // SVG Dimensions & Geometry matching Reference 1 (media_1791288938978.jpg)
  const width = 380;
  const height = 236;
  const cx = 190;
  const cy = 190;
  const r = 145; // Centerline radius
  const thickness = 38; // Thick chunky arc matching reference
  const R = r + thickness / 2; // Outer radius = 164
  const r_in = r - thickness / 2; // Inner radius = 126

  // Horseshoe sweep angles (degrees)
  // 202° is bottom-left, -22° is bottom-right (total sweep = 224°)
  const startAngleDeg = 202;
  const endAngleDeg = -22;
  const totalSpanDeg = startAngleDeg - endAngleDeg; // 224°

  const degToRad = (deg: number) => (deg * Math.PI) / 180;

  // Smooth 60fps Animation Engine using requestAnimationFrame
  // Separate animation for ratio (0..1) and value so metric switching is silky smooth
  const [animRatio, setAnimRatio] = useState<number>(0);
  const [animValue, setAnimValue] = useState<number>(0);

  const animRef = useRef<number | null>(null);
  const prevMetricRef = useRef<string>(metricLabel);

  const startRatioRef = useRef<number>(0);
  const targetRatioRef = useRef<number>(goalKcal > 0 ? Math.min(1.0, currentKcal / goalKcal) : 0);

  const startValRef = useRef<number>(0);
  const targetValRef = useRef<number>(currentKcal);

  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const targetRatio = goalKcal > 0 ? Math.min(1.0, Math.max(0.0, currentKcal / goalKcal)) : 0;
    targetRatioRef.current = targetRatio;
    targetValRef.current = currentKcal;

    // Check if the spotlight metric changed (e.g. Calories -> Protein)
    const isMetricChange = prevMetricRef.current !== metricLabel;
    prevMetricRef.current = metricLabel;

    startRatioRef.current = animRatio;
    startValRef.current = isMetricChange ? 0 : animValue;

    startTimeRef.current = null;

    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
    }

    const duration = 650; // Silky smooth 650ms ease-out

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(1, elapsed / duration);

      // Silky-smooth cubic ease-out curve
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const nextRatio =
        startRatioRef.current +
        (targetRatioRef.current - startRatioRef.current) * easeProgress;
      const nextVal =
        startValRef.current +
        (targetValRef.current - startValRef.current) * easeProgress;

      setAnimRatio(nextRatio);
      setAnimValue(nextVal);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setAnimRatio(targetRatioRef.current);
        setAnimValue(targetValRef.current);
      }
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [currentKcal, goalKcal, metricLabel]);

  // Current interpolated ratio
  const ratio = Math.min(1.0, Math.max(0.005, animRatio));
  const isCompleted = animRatio >= 0.999 && currentKcal >= goalKcal;

  // Cut angle where solid white arc meets the cross-line (striped) section
  const cutAngleDeg = startAngleDeg - ratio * totalSpanDeg;
  const capR = thickness / 2; // 19
  // Geometric tangent angular offset so rounded caps meet apex-to-apex at cutAngleDeg
  const offsetDeg = (capR / r) * (180 / Math.PI) * 0.96; // ~7.2 degrees

  // Helper point on circle
  const getCirclePt = (radius: number, angleDeg: number) => {
    const rad = degToRad(angleDeg);
    return {
      x: cx + radius * Math.cos(rad),
      y: cy - radius * Math.sin(rad),
    };
  };

  // 1. Solid White Arc Path:
  // Starts with rounded cap at startAngleDeg, sweeps clockwise along outer radius R,
  // ends with a clean rounded cap at the barbell pin junction (media_1791385273646.png)
  const createSolidArcPath = (cutDeg: number) => {
    const pInStart = getCirclePt(r_in, startAngleDeg);
    const pOutStart = getCirclePt(R, startAngleDeg);

    if (cutDeg <= endAngleDeg) {
      // Reached or exceeded goal: completed full arc with rounded caps at both ends!
      const pOutEnd = getCirclePt(R, endAngleDeg);
      const pInEnd = getCirclePt(r_in, endAngleDeg);
      return `
        M ${pInStart.x} ${pInStart.y}
        A ${capR} ${capR} 0 0 1 ${pOutStart.x} ${pOutStart.y}
        A ${R} ${R} 0 1 1 ${pOutEnd.x} ${pOutEnd.y}
        A ${capR} ${capR} 0 0 1 ${pInEnd.x} ${pInEnd.y}
        A ${r_in} ${r_in} 0 1 0 ${pInStart.x} ${pInStart.y}
        Z
      `;
    }

    const solidEndDeg = Math.min(startAngleDeg - 1, cutDeg + offsetDeg);
    const pOutCut = getCirclePt(R, solidEndDeg);
    const pInCut = getCirclePt(r_in, solidEndDeg);
    const arcSweep = startAngleDeg - solidEndDeg;
    const largeArcFlag = arcSweep > 180 ? 1 : 0;

    return `
      M ${pInStart.x} ${pInStart.y}
      A ${capR} ${capR} 0 0 1 ${pOutStart.x} ${pOutStart.y}
      A ${R} ${R} 0 ${largeArcFlag} 1 ${pOutCut.x} ${pOutCut.y}
      A ${capR} ${capR} 0 0 1 ${pInCut.x} ${pInCut.y}
      A ${r_in} ${r_in} 0 ${largeArcFlag} 0 ${pInStart.x} ${pInStart.y}
      Z
    `;
  };

  // 2. Striped / Cross-Line Target Arc Path:
  // Starts with a clean rounded cap at the barbell pin junction and sweeps clockwise to endAngleDeg
  const createStripedArcPath = (cutDeg: number) => {
    if (cutDeg <= endAngleDeg) return '';

    const stripedStartDeg = Math.max(endAngleDeg + 1, cutDeg - offsetDeg);
    const pInCut = getCirclePt(r_in, stripedStartDeg);
    const pOutCut = getCirclePt(R, stripedStartDeg);
    const pOutEnd = getCirclePt(R, endAngleDeg);
    const pInEnd = getCirclePt(r_in, endAngleDeg);

    const arcSweep = stripedStartDeg - endAngleDeg;
    const largeArcFlag = arcSweep > 180 ? 1 : 0;

    return `
      M ${pOutCut.x} ${pOutCut.y}
      A ${R} ${R} 0 ${largeArcFlag} 1 ${pOutEnd.x} ${pOutEnd.y}
      A ${capR} ${capR} 0 0 1 ${pInEnd.x} ${pInEnd.y}
      A ${r_in} ${r_in} 0 ${largeArcFlag} 0 ${pInCut.x} ${pInCut.y}
      A ${capR} ${capR} 0 0 1 ${pOutCut.x} ${pOutCut.y}
      Z
    `;
  };

  // 3. Base Background Track Guide (translucent rounded path)
  const createBaseTrackPath = () => {
    const pInStart = getCirclePt(r_in, startAngleDeg);
    const pOutStart = getCirclePt(R, startAngleDeg);
    const pOutEnd = getCirclePt(R, endAngleDeg);
    const pInEnd = getCirclePt(r_in, endAngleDeg);

    return `
      M ${pInStart.x} ${pInStart.y}
      A ${capR} ${capR} 0 0 1 ${pOutStart.x} ${pOutStart.y}
      A ${R} ${R} 0 1 1 ${pOutEnd.x} ${pOutEnd.y}
      A ${capR} ${capR} 0 0 1 ${pInEnd.x} ${pInEnd.y}
      A ${r_in} ${r_in} 0 1 0 ${pInStart.x} ${pInStart.y}
      Z
    `;
  };

  // 4. Barbell pin clamp at cutAngleDeg
  // Flush with outer and inner track edges, clean rounded spheres that never invade center text
  const pinRad = degToRad(cutAngleDeg);
  const nx = Math.cos(pinRad);
  const ny = -Math.sin(pinRad);

  const pinOutRadius = R + 1;
  const pinInRadius = r_in - 1;

  const pinOutX = cx + pinOutRadius * nx;
  const pinOutY = cy + pinOutRadius * ny;
  const pinInX = cx + pinInRadius * nx;
  const pinInY = cy + pinInRadius * ny;

  return (
    <div className="hero card-fintech-hero pt-4 sm:pt-4.5 px-5 sm:px-6 pb-3 sm:pb-3.5 w-full max-w-[370px] sm:max-w-[410px] mx-auto flex flex-col items-center justify-center select-none">

      {/* 1. Top Header Row: small muted label top-left, white pill badge top-right (...8887 ▾) */}
      <div className="w-full flex items-center justify-between px-1 mb-0.5 relative z-10">
        <span className="text-xs sm:text-sm font-medium text-zinc-400 font-sans tracking-tight">
          {metricLabel === 'Calories' ? 'Energy consumed' : `${metricLabel} consumed`}
        </span>
        <button
          type="button"
          onClick={onEditGoal}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 hover:bg-black/95 border border-white/20 hover:border-white/35 text-[11px] sm:text-xs font-semibold text-white transition-all cursor-pointer shadow-[inset_0_1.2px_1px_rgba(255,255,255,0.3),0_2px_8px_rgba(0,0,0,0.7)] active:scale-95 group"
          title="Edit target goal"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.7)] animate-pulse" />
          <span className="font-mono tracking-tight text-white group-hover:brightness-110">
            {goalKcal} {unit} ▾
          </span>
        </button>
      </div>

      {/* 2. TWO-TONE calorie number matching "$8,700.46" (glossy specular gradient digits, dimmer gray unit) */}
      <div className="w-full px-1 pt-0.5 pb-1 relative z-10">
        <div className="flex items-baseline justify-between">
          <div className="hero-number">
            <span className="big">
              {Math.round(animValue).toLocaleString()}
            </span>
            <span className="unit text-base sm:text-lg font-semibold text-zinc-500 font-mono tracking-tight self-baseline">
              {unit}
            </span>
          </div>

          {metricLabel !== 'Calories' && (
            <button
              type="button"
              onClick={onResetToCalories}
              className="text-[11px] font-mono text-zinc-300 hover:text-white underline cursor-pointer px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/15"
              title="Return to Calories"
            >
              ← Calories
            </button>
          )}
        </div>
      </div>

      {/* 3. The arc gauge below the huge white number — wide low proportions */}
      <div className="relative w-full aspect-[380/236] flex items-center justify-center z-10 -mt-1 sm:-mt-2">
        <svg
          viewBox={`0 22 ${width} ${height}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* Soft white glow for gauge percentage */}
            <filter id="whiteValueGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#FFFFFF" floodOpacity="0.25" />
            </filter>

            {/* Glossy gradient for gauge percentage matching Round 11 */}
            <linearGradient id="glossyGaugeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="45%" stopColor="#f4f4f4" />
              <stop offset="100%" stopColor="#d9d9d9" />
            </linearGradient>

            {/* Drop shadow filter for gauge percentage matching Round 11 */}
            <filter id="glossyGaugeShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#FFFFFF" floodOpacity="0.18" />
            </filter>

            {/* Drop shadow filter for pin spheres */}
            <filter id="pinShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Layer 1: Clean Solid Dark Base Track (No stripes, no pattern) */}
          <path
            d={createBaseTrackPath()}
            fill="#121319"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1"
          />

          {/* Layer 2: Clean Solid Dark Remaining Track Segment */}
          {!isCompleted && cutAngleDeg > endAngleDeg && (
            <path
              d={createStripedArcPath(cutAngleDeg)}
              fill="#13141b"
            />
          )}

          {/* Layer 3: Solid White Arc (Rounded Start, Rounded Cap at Pin) */}
          {ratio > 0.01 && (
            <path
              d={createSolidArcPath(cutAngleDeg)}
              fill="#FFFFFF"
            />
          )}

          {/* Layer 4: Barbell Pin Clamp (Outer ball + connecting line + inner ball) */}
          {!isCompleted && ratio > 0.02 && (
            <g className="transition-all duration-150">
              <line
                x1={pinInX}
                y1={pinInY}
                x2={pinOutX}
                y2={pinOutY}
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              <circle
                cx={pinOutX}
                cy={pinOutY}
                r="4.5"
                fill="#FFFFFF"
                filter="url(#pinShadow)"
              />

              <circle
                cx={pinInX}
                cy={pinInY}
                r="4.5"
                fill="#FFFFFF"
                filter="url(#pinShadow)"
              />
            </g>
          )}

          {/* Goal Completed Star Node at end */}
          {isCompleted && (
            <circle
              cx={getCirclePt(r, endAngleDeg).x}
              cy={getCirclePt(r, endAngleDeg).y}
              r="8"
              fill="#FFFFFF"
              stroke="#000000"
              strokeWidth="2"
            />
          )}

          {/* Center Typography inside Arc: Percentage + Remaining status */}
          <g
            key={metricLabel}
            className={`select-none transition-opacity duration-300 ${
              metricLabel !== 'Calories' ? 'cursor-pointer' : ''
            }`}
            onClick={metricLabel !== 'Calories' ? onResetToCalories : undefined}
          >
            {/* Percentage Display */}
            <text
              x={cx}
              y={cy - 12}
              textAnchor="middle"
              dominantBaseline="central"
              fill="url(#glossyGaugeGrad)"
              filter="url(#glossyGaugeShadow)"
              style={{
                fontSize: '44px',
                fontWeight: 800,
                letterSpacing: '-2px',
                fontFamily: "-apple-system, 'SF Pro Rounded', 'Nunito', 'Quicksand', 'Segoe UI', sans-serif",
              }}
            >
              {Math.round(ratio * 100)}%
            </text>

            {/* Subtitle / Remaining info */}
            <text
              x={cx}
              y={cy + 26}
              textAnchor="middle"
              dominantBaseline="central"
              fill="rgba(255, 255, 255, 0.8)"
              className="font-sans pointer-events-auto cursor-pointer"
              style={{
                fontSize: '13px',
                fontWeight: 500,
                letterSpacing: '-0.01em',
              }}
              onClick={(e) => {
                e.stopPropagation();
                onEditGoal?.();
              }}
            >
              {isCompleted
                ? 'Daily Goal Achieved'
                : `${Math.max(0, goalKcal - Math.round(animValue)).toLocaleString()} ${unit} remaining`}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};
