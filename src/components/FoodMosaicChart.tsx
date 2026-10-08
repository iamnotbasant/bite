import React, { useState, useMemo } from 'react';
import { Utensils, Flame, Dumbbell } from 'lucide-react';
import type { DayLog } from '../types';

export interface FoodConsumptionItem {
  id: string;
  name: string;
  calories: number;
  servings: number;
  protein: number;
  carbs: number;
  fat: number;
  category: string;
  sharePct: number;
}

interface FoodMosaicChartProps {
  currentDay: DayLog;
  weekLogs?: DayLog[];
}

interface Point {
  x: number;
  y: number;
}

// Sutherland-Hodgman Polygon Clipping by half-plane: a*x + b*y + c >= 0
function clipPolygon(polygon: Point[], a: number, b: number, c: number): Point[] {
  const inside = (p: Point) => a * p.x + b * p.y + c >= -1e-6;
  const lineIntersect = (p1: Point, p2: Point): Point => {
    const val1 = a * p1.x + b * p1.y + c;
    const val2 = a * p2.x + b * p2.y + c;
    const t = val1 / (val1 - val2);
    return {
      x: p1.x + t * (p2.x - p1.x),
      y: p1.y + t * (p2.y - p1.y),
    };
  };

  const output: Point[] = [];
  if (polygon.length === 0) return output;

  let s = polygon[polygon.length - 1];
  for (const e of polygon) {
    if (inside(e)) {
      if (!inside(s)) {
        output.push(lineIntersect(s, e));
      }
      output.push(e);
    } else if (inside(s)) {
      output.push(lineIntersect(s, e));
    }
    s = e;
  }
  return output;
}

// Inset polygon towards its centroid to create uniform black gaps
function insetPolygon(poly: Point[], padding = 4): Point[] {
  if (poly.length < 3) return poly;
  let cx = 0;
  let cy = 0;
  for (const p of poly) {
    cx += p.x;
    cy += p.y;
  }
  cx /= poly.length;
  cy /= poly.length;

  return poly.map((p) => {
    const dx = cx - p.x;
    const dy = cy - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= padding) return p;
    return {
      x: p.x + (dx / dist) * padding,
      y: p.y + (dy / dist) * padding,
    };
  });
}

// Convert polygon vertices to smooth rounded SVG path (matching media_1791387413279.jpg)
function polygonToRoundedPath(poly: Point[], radius = 14): string {
  if (poly.length < 3) return '';
  let d = '';
  const len = poly.length;

  for (let i = 0; i < len; i++) {
    const prev = poly[(i + len - 1) % len];
    const curr = poly[i];
    const next = poly[(i + 1) % len];

    const v1 = { x: prev.x - curr.x, y: prev.y - curr.y };
    const v2 = { x: next.x - curr.x, y: next.y - curr.y };

    const len1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const len2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

    const r = Math.min(radius, len1 / 2.2, len2 / 2.2);

    const pStart = {
      x: curr.x + (v1.x / len1) * r,
      y: curr.y + (v1.y / len1) * r,
    };
    const pEnd = {
      x: curr.x + (v2.x / len2) * r,
      y: curr.y + (v2.y / len2) * r,
    };

    if (i === 0) {
      d += `M ${pStart.x.toFixed(1)} ${pStart.y.toFixed(1)} `;
    } else {
      d += `L ${pStart.x.toFixed(1)} ${pStart.y.toFixed(1)} `;
    }
    d += `Q ${curr.x.toFixed(1)} ${curr.y.toFixed(1)} ${pEnd.x.toFixed(1)} ${pEnd.y.toFixed(1)} `;
  }
  d += 'Z';
  return d;
}

export const FoodMosaicChart: React.FC<FoodMosaicChartProps> = ({
  currentDay,
  weekLogs = [],
}) => {
  const [metricMode, setMetricMode] = useState<'calories' | 'protein' | 'servings'>('calories');
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);

  // 1. Aggregate all consumption from weekLogs and today
  const aggregatedFoods: FoodConsumptionItem[] = useMemo(() => {
    const map = new Map<string, {
      name: string;
      calories: number;
      servings: number;
      protein: number;
      carbs: number;
      fat: number;
      category: string;
    }>();

    // Default core foods to ensure a vibrant, packed mosaic even if user is on day 1
    const defaultRoster = [
      { name: 'Oats with Banana', calories: 640, servings: 2, protein: 24, carbs: 108, fat: 8, category: 'Breakfast' },
      { name: 'Boiled Eggs', calories: 450, servings: 6, protein: 42, carbs: 3, fat: 30, category: 'High Protein' },
      { name: 'Whole Wheat Roti', calories: 720, servings: 6, protein: 18, carbs: 132, fat: 6, category: 'Staple Carb' },
      { name: 'Fresh Paneer', calories: 520, servings: 2, protein: 36, carbs: 8, fat: 40, category: 'Dairy' },
      { name: 'Tadka Yellow Dal', calories: 410, servings: 3, protein: 26, carbs: 62, fat: 7, category: 'Legume' },
      { name: 'Greek Yogurt Bowl', calories: 280, servings: 2, protein: 30, carbs: 18, fat: 4, category: 'Snack' },
      { name: 'Cow Milk (Toned)', calories: 310, servings: 2, protein: 16, carbs: 24, fat: 12, category: 'Hydration' },
      { name: 'Brown Rice & Veg', calories: 380, servings: 2, protein: 10, carbs: 74, fat: 4, category: 'Lunch' },
      { name: 'Grilled Chicken Breast', calories: 560, servings: 2, protein: 62, carbs: 0, fat: 10, category: 'Lean Protein' },
      { name: 'Mixed Sprouted Salad', calories: 190, servings: 2, protein: 14, carbs: 26, fat: 2, category: 'Fiber' },
      { name: 'Peanut Butter Toast', calories: 320, servings: 1, protein: 12, carbs: 32, fat: 16, category: 'Snack' },
      { name: 'Roasted Almonds', calories: 210, servings: 1, protein: 7, carbs: 6, fat: 18, category: 'Healthy Fats' },
      { name: 'Apple & Walnuts', calories: 175, servings: 1, protein: 4, carbs: 28, fat: 9, category: 'Fruit' },
      { name: 'Whey Protein Shake', calories: 240, servings: 2, protein: 48, carbs: 4, fat: 3, category: 'Supplement' },
    ];

    defaultRoster.forEach((item) => {
      map.set(item.name.toLowerCase(), { ...item });
    });

    // Merge in live logged meals from week
    const allDays = weekLogs.length > 0 ? weekLogs : [currentDay];
    allDays.forEach((log) => {
      log.meals.forEach((m) => {
        const key = m.name.toLowerCase();
        const existing = map.get(key);
        if (existing) {
          existing.calories += m.calories;
          existing.protein += m.protein;
          existing.carbs += m.carbs;
          existing.fat += m.fat;
          existing.servings += 1;
        } else {
          map.set(key, {
            name: m.name,
            calories: m.calories * 2,
            servings: 2,
            protein: m.protein * 2,
            carbs: m.carbs * 2,
            fat: m.fat * 2,
            category: 'Logged Food',
          });
        }
      });
    });

    const list = Array.from(map.values());
    const totalCal = list.reduce((sum, item) => sum + item.calories, 0);

    return list
      .map((item, idx) => ({
        id: `food-${idx}-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
        ...item,
        sharePct: totalCal > 0 ? Math.round((item.calories / totalCal) * 100) : 7,
      }))
      .sort((a, b) => {
        if (metricMode === 'protein') return b.protein - a.protein;
        if (metricMode === 'servings') return b.servings - a.servings;
        return b.calories - a.calories;
      })
      .slice(0, 15); // Top 15 foods matching reference image layout
  }, [currentDay, weekLogs, metricMode]);

  const activeFood =
    aggregatedFoods.find((f) => f.id === selectedFoodId) || aggregatedFoods[0];

  // 2. Voronoi Layout Geometry (Width = 920, Height = 540)
  // Seeds arranged in a staggered 4-row organic mosaic resembling media_1791387413279.jpg
  const W = 920;
  const H = 540;
  const insetPad = 12;

  // Staggered seed positions matching reference composition
  const seedPositions: Point[] = [
    // Top Row
    { x: 90, y: 75 },       // 0: Top Left (Soul / Small)
    { x: 260, y: 95 },      // 1: Upper Mid-Left (Jazz / Medium)
    { x: 490, y: 120 },     // 2: Upper Center (Indie / Med-Large)
    { x: 770, y: 145 },     // 3: Top Right (Hip-Hop / Huge)
    // Middle Row Left & Center
    { x: 135, y: 260 },     // 4: Mid Left (R&B / Large)
    { x: 310, y: 220 },     // 5: Mid Upper Center (Punk / Small)
    { x: 440, y: 310 },     // 6: Center (K-Pop / Medium)
    { x: 575, y: 285 },     // 7: Mid Center-Right (Blues / Small)
    { x: 760, y: 380 },     // 8: Lower Right (Pop / Huge)
    // Lower Row Left & Center
    { x: 120, y: 445 },     // 9: Bottom Left (Rock / Med-Large)
    { x: 310, y: 440 },     // 10: Lower Mid-Left (Country / Medium)
    { x: 510, y: 450 },     // 11: Lower Center (Latin / Medium)
    { x: 670, y: 470 },     // 12: Lower Mid-Right (Dance / Medium)
    // Bottom Edge Pill Accents
    { x: 815, y: 490 },     // 13: Bottom Right Corner (Reggae)
    { x: 890, y: 475 },     // 14: Far Bottom Right (Gospel)
  ];

  // Compute weighted Voronoi polygons
  const cells = useMemo(() => {
    const rawValues = aggregatedFoods.map((f) => {
      if (metricMode === 'protein') return Math.max(10, f.protein);
      if (metricMode === 'servings') return Math.max(1, f.servings);
      return Math.max(50, f.calories);
    });
    const maxVal = Math.max(...rawValues, 1);
    const minVal = Math.min(...rawValues, 1);

    // Compute weights: larger foods push boundaries outward
    const weights = rawValues.map((v) => {
      const normalized = (v - minVal) / Math.max(1, maxVal - minVal);
      return 25 + normalized * 75; // weight between 25 and 100
    });

    const boundingPoly: Point[] = [
      { x: insetPad, y: insetPad },
      { x: W - insetPad, y: insetPad },
      { x: W - insetPad, y: H - insetPad },
      { x: insetPad, y: H - insetPad },
    ];

    return aggregatedFoods.map((food, i) => {
      const p1 = seedPositions[i] || { x: (i * 120) % W, y: (i * 90) % H };
      const w1 = weights[i] || 50;

      let poly = [...boundingPoly];

      // Clip against all other seeds using radical line
      for (let j = 0; j < aggregatedFoods.length; j++) {
        if (i === j) continue;
        const p2 = seedPositions[j] || { x: (j * 120) % W, y: (j * 90) % H };
        const w2 = weights[j] || 50;

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < 1e-4) continue;

        // Radical line equation: 2*dx*(x - mx) + 2*dy*(y - my) + (w1 - w2) = 0
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;

        const offset = (w1 - w2) / 2;
        const a = -2 * dx;
        const b = -2 * dy;
        const c = 2 * dx * mx + 2 * dy * my + offset;

        poly = clipPolygon(poly, a, b, c);
      }

      // Compute centroid of the clipped polygon
      let cx = 0;
      let cy = 0;
      if (poly.length > 0) {
        for (const pt of poly) {
          cx += pt.x;
          cy += pt.y;
        }
        cx /= poly.length;
        cy /= poly.length;
      }

      // Inset polygon to create uniform black gaps between cells
      const insetted = insetPolygon(poly, 3.8);
      const pathD = polygonToRoundedPath(insetted, 16);

      return {
        food,
        centroid: { x: cx, y: cy },
        pathD,
      };
    });
  }, [aggregatedFoods, metricMode]);

  return (
    <div className="w-full rounded-3xl p-5 sm:p-7 md:p-8 bg-[radial-gradient(120%_65%_at_50%_-5%,rgba(255,255,255,0.20)_0%,rgba(255,255,255,0.03)_38%,transparent_70%),linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.01)_35%,rgba(4,4,6,0.92)_80%,#050608_100%)] bg-[#050608] border border-white/[0.12] border-t-white/[0.38] shadow-[0_20px_50px_rgba(0,0,0,0.95),inset_0_1.5px_1px_rgba(255,255,255,0.38)] space-y-6 select-none">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-white/[0.06] text-white border border-white/10">
            <Utensils size={18} />
          </span>
          <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
            Food Consumption Mosaic
          </h3>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/70 border border-white/10 self-start sm:self-auto shadow-inner">
          <button
            type="button"
            onClick={() => setMetricMode('calories')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              metricMode === 'calories'
                ? 'bg-[#CDFF50] text-black font-black shadow-[0_2px_12px_rgba(205,255,80,0.35)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Calories
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('protein')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              metricMode === 'protein'
                ? 'bg-[#CDFF50] text-black font-black shadow-[0_2px_12px_rgba(205,255,80,0.35)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Protein
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('servings')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              metricMode === 'servings'
                ? 'bg-[#CDFF50] text-black font-black shadow-[0_2px_12px_rgba(205,255,80,0.35)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Frequency
          </button>
        </div>
      </div>

      {/* Main Mosaic Map Container */}
      <div className="w-full relative rounded-[28px] overflow-hidden bg-black border-2 border-black shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto block select-none"
          style={{ maxHeight: '640px' }}
        >
          <defs>
            {/* Soft ivory-cream gradient matching reference */}
            <linearGradient id="mosaicCellGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FAF7F2" />
              <stop offset="60%" stopColor="#F2EDE4" />
              <stop offset="100%" stopColor="#E9E3D8" />
            </linearGradient>

            {/* Selected active glow gradient */}
            <linearGradient id="mosaicActiveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#FBF9F5" />
            </linearGradient>

            <filter id="cellGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#FFFFFF" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Render all Organic Rounded Voronoi Cells */}
          {cells.map(({ food, centroid, pathD }) => {
            const isSelected = selectedFoodId === food.id;

            return (
              <g
                key={food.id}
                onClick={() => setSelectedFoodId(food.id)}
                className={`cursor-pointer group transition-transform duration-300 ${
                  isSelected ? 'scale-[1.03]' : 'hover:scale-[1.015]'
                }`}
                style={{ transformOrigin: `${centroid.x}px ${centroid.y}px` }}
              >
                {/* Cell Pebble Path */}
                <path
                  d={pathD}
                  fill={isSelected ? 'url(#mosaicActiveGrad)' : 'url(#mosaicCellGrad)'}
                  stroke={isSelected ? '#FFFFFF' : 'rgba(0,0,0,0.9)'}
                  strokeWidth={isSelected ? 3 : 1}
                  filter={isSelected ? 'url(#cellGlow)' : undefined}
                  className="transition-all duration-200 hover:opacity-95"
                />

                {/* Centered Food Typography inside cell */}
                <g pointerEvents="none">
                  <text
                    x={centroid.x}
                    y={centroid.y - 4}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#111218"
                    className="font-sans font-extrabold"
                    style={{
                      fontSize: food.sharePct > 8 ? '14px' : '11.5px',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {food.name}
                  </text>

                  <text
                    x={centroid.x}
                    y={centroid.y + 13}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="rgba(17, 18, 24, 0.7)"
                    className="font-sans font-bold"
                    style={{
                      fontSize: food.sharePct > 8 ? '11px' : '9.5px',
                    }}
                  >
                    {metricMode === 'calories' && `${food.calories} kcal`}
                    {metricMode === 'protein' && `${food.protein}g protein`}
                    {metricMode === 'servings' && `${food.servings} servings`}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Food Inspection Card */}
      {activeFood && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-black/60 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white shrink-0">
              <Flame size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-white">
                  {activeFood.name}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-zinc-300">
                  {activeFood.category}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 font-mono text-xs">
            <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-white flex items-center gap-1.5">
              <Flame size={12} className="text-zinc-300" />
              <strong>{activeFood.calories} kcal</strong>
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-zinc-300 flex items-center gap-1.5">
              <Dumbbell size={12} />
              <strong>{activeFood.protein}g P</strong>
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-zinc-300">
              <strong>{activeFood.carbs}g C</strong>
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-zinc-300">
              <strong>{activeFood.fat}g F</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
