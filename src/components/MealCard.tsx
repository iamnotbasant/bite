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
      className="group relative rounded-[22px] sm:rounded-[26px] px-3.5 py-3 sm:px-4.5 sm:py-3.5 bg-gradient-to-r from-white/[0.06] via-[#090a0e] to-[#040406] hover:from-white/[0.1] hover:via-[#0e0f14] hover:to-[#060608] border border-white/[0.09] hover:border-white/[0.24] shadow-[0_10px_24px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.18)] transition-all duration-300 flex items-center justify-between gap-2.5 sm:gap-3.5 text-white select-none card-fintech-interactive cursor-pointer min-h-[56px]"
      title="Tap to view full nutrition details & edit/delete"
    >
      {/* Left: Circular Dish Plate Image + Name & Macros */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
        {/* Circular Food Image matching reference plate */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-black border-2 border-white/15 shadow-[0_4px_14px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform duration-300">
          <img
            src={imgSrc}
            alt={meal.name}
            className="w-full h-full object-cover"
            onError={() => setImgSrc(FALLBACK_FOOD_IMAGE)}
          />
        </div>

        {/* Middle: Title & Macros ("12g P | 54g C | 7g F") */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <h4 className="font-bold text-[15px] sm:text-base tracking-tight text-white truncate">
              {meal.name}
            </h4>
            {meal.brand && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 border border-white/10 text-zinc-300 font-medium shrink-0">
                {meal.brand}
              </span>
            )}
            {meal.timestamp && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-zinc-300 font-mono shrink-0 ml-auto mr-0.5">
                {meal.timestamp}
              </span>
            )}
          </div>

          <div className="text-[11px] sm:text-xs text-zinc-400 font-medium mt-1 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap overflow-hidden text-ellipsis">
            {meal.portion && (
              <>
                <span className="text-zinc-400 shrink-0">{meal.portion}</span>
                <span className="text-zinc-600 font-normal select-none shrink-0">•</span>
              </>
            )}
            <span>{meal.protein}g P</span>
            <span className="text-zinc-600 font-normal select-none">|</span>
            <span>{meal.carbs}g C</span>
            <span className="text-zinc-600 font-normal select-none">|</span>
            <span>{meal.fat}g F</span>
          </div>
        </div>
      </div>

      {/* Right: Calories + Chevron > cleanly aligned to the right edge with NO phantom gap */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <span className="font-extrabold text-[15px] sm:text-base text-white tracking-tight whitespace-nowrap font-sans">
          {meal.calories} kcal
        </span>

        <ChevronRight
          size={17}
          className="text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300 shrink-0"
        />
      </div>
    </div>
  );
};
