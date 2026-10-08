import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import type { MealItem } from '../types';
import { getFoodImage, FALLBACK_FOOD_IMAGE } from '../utils/foodImages';

interface MealCardProps {
  meal: MealItem;
  theme?: 'emerald' | 'obsidian' | 'pure-black';
  onDelete?: (id: string) => void;
  onClick?: (meal: MealItem) => void;
}

export const MealCard: React.FC<MealCardProps> = ({ meal, onClick }) => {
  const [imgSrc, setImgSrc] = useState<string>(
    meal.imageUrl || getFoodImage(meal.name)
  );

  return (
    <div
      onClick={() => onClick?.(meal)}
      role="button"
      tabIndex={0}
      className="row-fintech-history group cursor-pointer select-none text-white min-h-[58px] sm:min-h-[62px]"
      title="Tap to view full nutrition details & edit/delete"
    >
      {/* Left: Circular Food Icon (matching reference circular brand icon) */}
      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-black border border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.3)] group-hover:scale-105 transition-transform duration-200">
        <img
          src={imgSrc}
          alt={meal.name}
          className="w-full h-full object-cover"
          onError={() => setImgSrc(FALLBACK_FOOD_IMAGE)}
        />
      </div>

      {/* Middle: Two-Line Text (Title with Time Pill + Subtitle with Macros) */}
      <div className="flex-1 min-w-0 px-3 sm:px-3.5">
        <div className="flex items-center gap-2 min-w-0">
          <h4 className="font-bold text-[14px] sm:text-[15px] tracking-tight text-white truncate group-hover:text-zinc-200 transition-colors">
            {meal.name}
          </h4>
          {meal.timestamp && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/[0.08] border border-white/15 text-[10px] sm:text-[11px] font-mono font-medium text-zinc-300 shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
              {meal.timestamp}
            </span>
          )}
          {meal.brand && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-zinc-400 font-medium shrink-0 truncate">
              {meal.brand}
            </span>
          )}
        </div>

        <div className="text-[11px] sm:text-xs text-zinc-400 font-medium mt-0.5 truncate flex items-center gap-1.5 leading-tight">
          {meal.portion && (
            <>
              <span className="text-zinc-300">{meal.portion}</span>
              <span className="text-zinc-600">·</span>
            </>
          )}
          <span>{meal.protein}g P</span>
          <span className="text-zinc-600">·</span>
          <span>{meal.carbs}g C</span>
          <span className="text-zinc-600">·</span>
          <span>{meal.fat}g F</span>
        </div>
      </div>

      {/* Right: Kcal Right-Aligned with subtle chevron */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 text-right">
        <span className="font-bold text-sm sm:text-base text-white font-mono tracking-tight whitespace-nowrap">
          {meal.calories} kcal
        </span>
        <ChevronRight
          size={16}
          className="text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0"
        />
      </div>
    </div>
  );
};
