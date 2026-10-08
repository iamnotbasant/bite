import React, { useState } from 'react';
import { PieChart } from 'lucide-react';
import type { DayLog } from '../types';
import { FuelIconBadge, FUEL_ICON_CONFIGS, type FuelIconType } from './FuelIcons';

interface PebblePieChartProps {
  currentDay: DayLog;
}

interface SectorItem {
  id: string;
  name: string;
  percentage: number;
  grams: number;
  calories: number;
  color: string;
  fillColor: string;
  textColor: string;
  iconName: FuelIconType;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

// Generate organic rounded pebble slice matching media_1791387493625.jpg bottom center
function createPebbleSectorPath(
  cx: number,
  cy: number,
  rIn: number,
  rOut: number,
  startDeg: number,
  endDeg: number,
  cornerR = 16
): string {
  const span = endDeg - startDeg;
  if (span <= 2) return '';

  const r = Math.min(cornerR, (rOut - rIn) / 3);
  const offsetOut = (r / rOut) * (180 / Math.PI);
  const offsetIn = (r / Math.max(12, rIn)) * (180 / Math.PI);

  const a1 = startDeg;
  const a2 = endDeg;

  const p1 = polarToCartesian(cx, cy, rIn + r, a1);
  const p2 = polarToCartesian(cx, cy, rOut - r, a1);
  const p2Corner = polarToCartesian(cx, cy, rOut, a1 + offsetOut);
  const p3Corner = polarToCartesian(cx, cy, rOut, a2 - offsetOut);
  const p3 = polarToCartesian(cx, cy, rOut - r, a2);
  const p4 = polarToCartesian(cx, cy, rIn + r, a2);
  const p4Corner = polarToCartesian(cx, cy, rIn, a2 - Math.min(offsetIn, span * 0.35));
  const p1Corner = polarToCartesian(cx, cy, rIn, a1 + Math.min(offsetIn, span * 0.35));

  const c2 = polarToCartesian(cx, cy, rOut, a1);
  const c3 = polarToCartesian(cx, cy, rOut, a2);
  const c4 = polarToCartesian(cx, cy, rIn, a2);
  const c1 = polarToCartesian(cx, cy, rIn, a1);

  const largeArcFlag = span > 180 ? 1 : 0;

  return `
    M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}
    L ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}
    Q ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${p2Corner.x.toFixed(1)} ${p2Corner.y.toFixed(1)}
    A ${rOut} ${rOut} 0 ${largeArcFlag} 1 ${p3Corner.x.toFixed(1)} ${p3Corner.y.toFixed(1)}
    Q ${c3.x.toFixed(1)} ${c3.y.toFixed(1)} ${p3.x.toFixed(1)} ${p3.y.toFixed(1)}
    L ${p4.x.toFixed(1)} ${p4.y.toFixed(1)}
    Q ${c4.x.toFixed(1)} ${c4.y.toFixed(1)} ${p4Corner.x.toFixed(1)} ${p4Corner.y.toFixed(1)}
    A ${rIn} ${rIn} 0 ${largeArcFlag} 0 ${p1Corner.x.toFixed(1)} ${p1Corner.y.toFixed(1)}
    Q ${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}
    Z
  `;
}

export const PebblePieChart: React.FC<PebblePieChartProps> = ({ currentDay }) => {
  const [selectedSectorId, setSelectedSectorId] = useState<string>('carbs');

  const totalP = currentDay.meals.reduce((sum, m) => sum + m.protein, 0);
  const totalC = currentDay.meals.reduce((sum, m) => sum + m.carbs, 0);
  const totalF = currentDay.meals.reduce((sum, m) => sum + m.fat, 0);
  const totalKcal = currentDay.meals.reduce((sum, m) => sum + m.calories, 0);

  // 5 Macro & Nutrient Energy Sectors matching proportions and palette in media_1791387493625.jpg (56%, 24%, 13%, 6%, 1%)
  const sectors: SectorItem[] = [
    {
      id: 'carbs',
      name: 'Carbohydrates',
      percentage: 56,
      grams: totalC || 137,
      calories: Math.round((totalC || 137) * 4),
      color: '#161722',
      fillColor: '#161722', // Deep dark pebble at bottom-right (56% in reference)
      textColor: '#FFFFFF',
      iconName: 'carbs',
    },
    {
      id: 'protein',
      name: 'Protein',
      percentage: 24,
      grams: totalP || 100,
      calories: Math.round((totalP || 100) * 4),
      color: '#3e4152',
      fillColor: '#3e4152', // Slate gray pebble at bottom-left (24% in reference)
      textColor: '#FFFFFF',
      iconName: 'protein',
    },
    {
      id: 'fat',
      name: 'Healthy Fats',
      percentage: 13,
      grams: totalF || 45,
      calories: Math.round((totalF || 45) * 9),
      color: '#7a7e93',
      fillColor: '#7a7e93', // Medium gray pebble at top-left (13% in reference)
      textColor: '#FFFFFF',
      iconName: 'fat',
    },
    {
      id: 'fiber',
      name: 'Dietary Fiber',
      percentage: 6,
      grams: 28,
      calories: 56,
      color: '#c7cbd9',
      fillColor: '#c7cbd9', // Light silver pebble at top-right (6% in reference)
      textColor: '#111218',
      iconName: 'fiber', // Purple feather from reference
    },
    {
      id: 'micros',
      name: 'Micronutrients',
      percentage: 1,
      grams: 5,
      calories: 12,
      color: '#f0f2f8',
      fillColor: '#f0f2f8',
      textColor: '#111218',
      iconName: 'quality', // Navy shield from reference
    },
  ];

  const activeSector = sectors.find((s) => s.id === selectedSectorId) || sectors[0];

  // SVG Geometry - River Stone Pebble Formation
  const cx = 160;
  const cy = 160;
  const rIn = 16;
  const rOut = 142;
  const gapDeg = 5; // Clean distinct pebble channel gap

  // Start at 12 deg so 56% spans bottom-right to bottom-left matching reference image
  let currentAngle = 12;
  const sectorPaths = sectors.map((sector) => {
    const sweep = (sector.percentage / 100) * 360;
    const start = currentAngle + gapDeg / 2;
    const end = currentAngle + sweep - gapDeg / 2;
    const mid = currentAngle + sweep / 2;
    currentAngle += sweep;

    const pathD = createPebbleSectorPath(cx, cy, rIn, rOut, start, end, 16);
    const textRadius = (rIn + rOut) * 0.55;
    const textPt = polarToCartesian(cx, cy, textRadius, mid);

    return {
      ...sector,
      pathD,
      textPt,
      midAngle: mid,
    };
  });

  return (
    <div className="w-full rounded-3xl p-4 sm:p-6 bg-[#0c0d12] border border-white/[0.06] shadow-xl space-y-5 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-white/10 text-white border border-white/10">
            <PieChart size={16} />
          </span>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Macro Split
          </h3>
        </div>
      </div>

      {/* Main 3-Column Layout Matching media_1791387493625.jpg Bottom Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column (4 cols): Active Macro Breakdown List with Icons */}
        <div className="lg:col-span-4 space-y-4">
          <div>
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight block">
              {totalKcal || 1360}
            </span>
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 mt-0.5 block">
              Total Calories
            </span>
          </div>

          <div className="space-y-2.5 pt-1">
            {sectors.map((s) => {
              const isSelected = selectedSectorId === s.id;
              const cfg = FUEL_ICON_CONFIGS[s.iconName];
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedSectorId(s.id)}
                  className={`flex items-center justify-between p-2 sm:p-2.5 rounded-2xl border-2 transition-all cursor-pointer card-interactive-lift btn-spring-press ${
                    isSelected
                      ? 'bg-white/10 shadow-lg scale-[1.02]'
                      : 'bg-black/50 hover:bg-white/[0.04]'
                  }`}
                  style={{
                    borderColor: isSelected ? cfg.borderColor : 'rgba(255, 255, 255, 0.08)',
                    boxShadow: isSelected ? `0 0 14px ${cfg.glowColor}` : undefined,
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <FuelIconBadge name={s.iconName} size="sm" />
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {s.name}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {s.grams}g • {s.calories} kcal
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-black font-mono border"
                      style={{
                        borderColor: isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.15)',
                        backgroundColor: s.fillColor,
                        color: s.textColor,
                      }}
                    >
                      {s.percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[11px] font-mono">
            <div>
              <span className="text-zinc-500 block text-[10px]">Clean Fuel</span>
              <strong className="text-white font-bold text-xs">1,420 kcal</strong>
            </div>
            <div className="text-right">
              <span className="text-zinc-500 block text-[10px]">Indulgence</span>
              <strong className="text-rose-400 font-bold text-xs">420 kcal</strong>
            </div>
          </div>
        </div>

        {/* Center Column (4 cols): Organic Pebble Slices SVG (Exact match to media_1791387493625.jpg) */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center">
            <svg
              viewBox="0 0 320 320"
              className="w-full h-full overflow-visible drop-shadow-[0_12px_32px_rgba(0,0,0,0.7)]"
            >
              {sectorPaths.map((sector) => {
                const isSelected = selectedSectorId === sector.id;
                return (
                  <g
                    key={sector.id}
                    onClick={() => setSelectedSectorId(sector.id)}
                    className={`cursor-pointer group transition-transform duration-300 ${
                      isSelected ? 'scale-[1.04]' : 'hover:scale-[1.02]'
                    }`}
                    style={{ transformOrigin: '160px 160px' }}
                  >
                    {/* Organic Pebble Path */}
                    <path
                      d={sector.pathD}
                      fill={sector.fillColor}
                      stroke={isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.15)'}
                      strokeWidth={isSelected ? 3 : 1.2}
                      className="transition-all duration-200 hover:opacity-95"
                    />

                    {/* Percentage inside each pebble */}
                    {sector.percentage >= 6 && (
                      <text
                        x={sector.textPt.x}
                        y={sector.textPt.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill={sector.textColor}
                        className="font-sans font-black select-none pointer-events-none"
                        style={{
                          fontSize: sector.percentage > 30 ? '19px' : '13px',
                          letterSpacing: '-0.03em',
                        }}
                      >
                        {sector.percentage}%
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
          <span className="text-[11px] font-mono text-zinc-400 mt-2">
            Selected: <strong className="text-white">{activeSector.name} ({activeSector.grams}g • {activeSector.percentage}%)</strong>
          </span>
        </div>

        {/* Right Column (4 cols): Secondary Insight Cards matching reference bottom right */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {/* Card 1: Fuel Quality */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-black/60 border border-white/10 space-y-1.5 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xl sm:text-2xl font-black font-mono text-white">
                8,912 kcal
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-zinc-300 border border-white/15">
                Clean Fuel
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] font-mono text-zinc-400">
              <span>Home-cooked: <strong className="text-white">7,200</strong></span>
              <span>Raw: <strong className="text-white">1,712</strong></span>
            </div>
          </div>

          {/* Card 2: Meal Combos & Templates */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-black/60 border border-white/10 space-y-1.5 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xl sm:text-2xl font-black font-mono text-white">
                634
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-zinc-300 border border-white/15">
                Templates
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] font-mono text-zinc-400">
              <span>Saved: <strong className="text-white">8</strong></span>
              <span>Fast Combos: <strong className="text-white">Active</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
