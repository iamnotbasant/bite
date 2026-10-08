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
  const height = 280;
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
    <div className="relative card-fintech-hero p-4 sm:p-5 w-full max-w-[340px] sm:max-w-[390px] mx-auto flex flex-col items-center justify-center select-none shadow-[0_20px_48px_rgba(0,0,0,0.95)]">
      {/* Top Header Pill Row matching Fintech card ("Your money ...8887 ▾") */}
      <div className="w-full flex items-center justify-between px-1 mb-1">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          {metricLabel === 'Calories' ? 'Energy Consumed' : `${metricLabel} Metric`}
        </span>
        <button
          type="button"
          onClick={onEditGoal}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.14] text-[11px] font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.18)]"
          title="Edit target goal"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{goalKcal} {unit}</span>
        </button>
      </div>

      {/* SVG Container */}
      <div className="relative w-full aspect-[380/280] flex items-center justify-center">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* Diagonal Cross-Line Pattern (Pure White stripes with subtle dark background) */}
            <pattern
              id="refStripes"
              patternUnits="userSpaceOnUse"
              width="13"
              height="13"
              patternTransform="rotate(45)"
            >
              <rect
                width="13"
                height="13"
                fill="rgba(255, 255, 255, 0.04)"
              />
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="13"
                stroke="#FFFFFF"
                strokeWidth="2.8"
                strokeOpacity="0.45"
              />
            </pattern>

            {/* Drop shadow filter for pin spheres */}
            <filter id="pinShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Layer 1: Translucent Base Track Guide */}
          <path
            d={createBaseTrackPath()}
            fill="rgba(255, 255, 255, 0.06)"
          />

          {/* Layer 2: Cross-Line Target Zone (Diagonal Stripes - Zero Green) */}
          {!isCompleted && cutAngleDeg > endAngleDeg && (
            <path
              d={createStripedArcPath(cutAngleDeg)}
              fill="url(#refStripes)"
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

          {/* Center Typography: Rendered natively inside SVG with ample clearance */}
          {/* Supports dynamic spotlight metric (Calories, Protein, Carbs, Fat) */}
          <g
            key={metricLabel}
            className={`select-none transition-opacity duration-300 ${
              metricLabel !== 'Calories' ? 'cursor-pointer' : ''
            }`}
            onClick={metricLabel !== 'Calories' ? onResetToCalories : undefined}
          >
            {metricLabel !== 'Calories' ? (
              <>
                {/* Metric label: PROTEIN / CARBS / FAT with plenty of clearance from apex */}
                <text
                  x={cx}
                  y={cy - 48}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="rgba(255, 255, 255, 0.7)"
                  className="font-sans font-bold"
                  style={{
                    fontSize: '12px',
                    letterSpacing: '0.12em',
                  }}
                >
                  {metricLabel.toUpperCase()}
                </text>

                {/* Main Value */}
                <text
                  x={cx}
                  y={cy - 12}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#FFFFFF"
                  className="font-sans"
                  style={{
                    fontSize: '52px',
                    fontWeight: 800,
                    letterSpacing: '-0.04em',
                  }}
                >
                  {Math.round(animValue)}{unit === 'g' ? 'g' : ''}
                </text>

                {/* Subtitle */}
                <text
                  x={cx}
                  y={cy + 24}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="rgba(255, 255, 255, 0.85)"
                  className="font-sans pointer-events-auto cursor-pointer"
                  style={{
                    fontSize: '15px',
                    fontWeight: 500,
                    letterSpacing: '-0.01em',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditGoal?.();
                  }}
                >
                  of {goalKcal}{unit} {metricLabel.toLowerCase()}
                </text>
              </>
            ) : (
              <>
                {/* Main Calorie Value */}
                <text
                  x={cx}
                  y={cy - 28}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#FFFFFF"
                  className="font-sans"
                  style={{
                    fontSize: '56px',
                    fontWeight: 800,
                    letterSpacing: '-0.04em',
                  }}
                >
                  {Math.round(animValue)}
                </text>

                {/* Subtitle */}
                <text
                  x={cx}
                  y={cy + 20}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="rgba(255, 255, 255, 0.9)"
                  className="font-sans pointer-events-auto cursor-pointer"
                  style={{
                    fontSize: '16px',
                    fontWeight: 500,
                    letterSpacing: '-0.01em',
                  }}
                  onClick={onEditGoal}
                >
                  of {goalKcal}{unit}
                </text>
              </>
            )}
          </g>
        </svg>
      </div>
    </div>
  );
};
