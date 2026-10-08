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
      className="group relative rounded-[22px] sm:rounded-[26px] px-3.5 py-3 sm:px-4 sm:py-3.5 bg-gradient-to-r from-white/[0.04] via-[#050505] to-black hover:from-white/[0.07] hover:via-[#090909] hover:to-black border border-white/[0.07] hover:border-white/20 shadow-[0_8px_20px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300 flex items-center justify-between gap-2.5 sm:gap-3.5 text-white select-none card-interactive-lift cursor-pointer"
      title="Tap to view full nutrition details & edit/delete"
    >
      {/* Left: Circular Dish Plate Image + Name & Macros */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
        {/* Circular Food Image matching reference plate */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-black shadow-md group-hover:scale-105 group-hover:rotate-1 transition-transform duration-300">
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
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-400 font-medium shrink-0">
                {meal.brand}
              </span>
            )}
            {meal.timestamp && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-400 font-mono shrink-0 ml-auto mr-0.5">
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
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <span className="font-bold text-[14px] sm:text-[15px] text-white tracking-tight whitespace-nowrap">
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
