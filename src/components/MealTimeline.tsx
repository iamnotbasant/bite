import React from 'react';
import { Plus, Trash2, Sunrise, Utensils, Moon, Apple } from 'lucide-react';
import type { MealItem, MealCategory } from '../types';
import { MealCard } from './MealCard';
import { getFoodImage, FALLBACK_FOOD_IMAGE } from '../utils/foodImages';

interface MealTimelineProps {
  meals: MealItem[];
  theme: 'emerald' | 'obsidian' | 'pure-black';
  onAddMealClick: (category: MealCategory) => void;
  onDeleteMeal: (id: string) => void;
  onSelectMeal?: (meal: MealItem) => void;
  variant?: 'auto' | 'mobile' | 'desktop';
}

export const MealTimeline: React.FC<MealTimelineProps> = ({
  meals,
  theme,
  onAddMealClick,
  onDeleteMeal,
  onSelectMeal,
  variant = 'auto',
}) => {
  const categories: {
    key: MealCategory;
    title: string;
    icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
    accentColor: string;
  }[] = [
    {
      key: 'breakfast',
      title: 'Breakfast',
      icon: Sunrise,
      accentColor: 'text-amber-400',
    },
    {
      key: 'lunch',
      title: 'Lunch',
      icon: Utensils,
      accentColor: 'text-emerald-400',
    },
    {
      key: 'dinner',
      title: 'Dinner',
      icon: Moon,
      accentColor: 'text-indigo-400',
    },
    {
      key: 'snack',
      title: 'Snacks',
      icon: Apple,
      accentColor: 'text-rose-400',
    },
  ];

  // Only show categories where the user has actually logged food
  const loggedCategories = categories.filter((cat) =>
    meals.some((m) => m.category === cat.key)
  );

  // Remaining categories not yet logged today
  const unloggedCategories = categories.filter(
    (cat) => !meals.some((m) => m.category === cat.key)
  );

  // Empty state when nothing has been logged yet for the day
  const renderEmptyState = () => (
    <div className="rounded-[28px] p-6 sm:p-8 card-fintech-gloss border border-white/[0.1] shadow-2xl text-center flex flex-col items-center justify-center select-none bg-gradient-to-b from-white/[0.06] via-[#08090d] to-[#040406]">
      <div className="w-14 h-14 rounded-2xl bg-white/[0.08] border border-white/15 flex items-center justify-center mb-3 text-zinc-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
        <Utensils size={24} />
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
        No meals logged today
      </h3>
      <p className="text-xs sm:text-sm text-zinc-400 mb-5 max-w-sm">
        Log your breakfast, lunch, dinner, or snacks to start tracking.
      </p>
      <div className="flex items-center gap-2.5 flex-wrap justify-center">
        {categories.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => onAddMealClick(cat.key)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 hover:border-white/30 text-xs sm:text-sm font-semibold text-white transition-all cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] active:scale-95 min-h-[44px]"
          >
            <cat.icon size={15} className={cat.accentColor} />
            <span>+ Log {cat.title}</span>
          </button>
        ))}
      </div>
    </div>
  );

  // 1. Mobile View: Stacked horizontal pill rows with rich gradient black cards (Only logged categories)
  const renderMobileView = () => {
    if (loggedCategories.length === 0) {
      return renderEmptyState();
    }

    return (
      <div className="w-full flex flex-col gap-4 select-none">
        {loggedCategories.map((cat) => {
          const categoryMeals = meals.filter((m) => m.category === cat.key);
          const categoryKcal = categoryMeals.reduce((sum, m) => sum + (m.calories || 0), 0);

          return (
            <div
              key={cat.key}
              className="rounded-[26px] sm:rounded-[32px] p-4 sm:p-5 transition-all duration-200 text-white flex flex-col justify-between border border-white/[0.09] shadow-[0_16px_36px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.18)] bg-gradient-to-b from-white/[0.06] via-[#08090d] to-[#040406]"
            >
              <div>
                {/* Category Header */}
                <div className="flex items-center justify-between mb-3.5 sm:mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl bg-white/[0.08] border border-white/10 ${cat.accentColor} shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]`}>
                      <cat.icon size={16} strokeWidth={2} />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
                      {cat.title}
                    </h3>
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10 text-zinc-300 font-semibold shadow-inner">
                      {categoryMeals.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {categoryKcal > 0 && (
                      <span className="text-xs font-mono text-zinc-400 font-bold">
                        {categoryKcal} kcal
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => onAddMealClick(cat.key)}
                      className="w-10 h-10 rounded-full bg-gradient-to-b from-white to-zinc-200 hover:brightness-95 text-black flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-[0_4px_16px_rgba(255,255,255,0.2)]"
                      title={`Add ${cat.title} item`}
                    >
                      <Plus size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                {/* Meals List (Horizontal Pill Cards) */}
                <div className="space-y-2.5 sm:space-y-3">
                  {categoryMeals.map((meal) => (
                    <MealCard
                      key={meal.id}
                      meal={meal}
                      theme={theme}
                      onDelete={onDeleteMeal}
                      onClick={onSelectMeal}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {/* Quick Log button for unlogged categories */}
        {unloggedCategories.length > 0 && (
          <div className="pt-1 px-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mr-1">
                Log meal:
              </span>
              {unloggedCategories.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => onAddMealClick(cat.key)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] hover:border-white/[0.22] text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.18)] active:scale-95 min-h-[38px]"
                >
                  <cat.icon size={13} strokeWidth={2} className={cat.accentColor} />
                  <span>+ {cat.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // 2. Desktop View: Spacious full-width rows with squircle dish cards & horizontal scroll (Only logged categories)
  const renderDesktopView = () => {
    if (loggedCategories.length === 0) {
      return renderEmptyState();
    }

    return (
      <div className="w-full flex flex-col gap-6 select-none">
        {loggedCategories.map((cat) => {
          const categoryMeals = meals.filter((m) => m.category === cat.key);
          const totalCount = categoryMeals.length;
          const categoryKcal = categoryMeals.reduce((sum, m) => sum + (m.calories || 0), 0);

          return (
            <div
              key={cat.key}
              className="rounded-3xl p-5 sm:p-6 transition-all duration-200 text-white flex flex-col justify-between border border-white/[0.09] shadow-[0_20px_48px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.18)] bg-gradient-to-b from-white/[0.06] via-[#08090d] to-[#040406]"
            >
              {/* Header: Title + Category Icon + Count / Total Kcal + Circular Plus button */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-white/[0.08] border border-white/10 ${cat.accentColor} shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]`}>
                    <cat.icon size={20} strokeWidth={2} />
                  </div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
                      {cat.title}
                    </h3>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10 text-zinc-300 font-semibold shadow-inner">
                      {totalCount} {totalCount === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {categoryKcal > 0 && (
                    <span className="text-sm font-mono text-zinc-400 font-bold">
                      {categoryKcal} kcal
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onAddMealClick(cat.key)}
                    className="w-10 h-10 rounded-full bg-gradient-to-b from-white to-zinc-200 hover:brightness-95 text-black flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-[0_4px_16px_rgba(255,255,255,0.2)]"
                    title={`Add ${cat.title} item`}
                  >
                    <Plus size={19} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Landscape Row: Modern Squircle Meal Cards + More Food Button */}
              <div className="flex items-center gap-3.5 overflow-x-auto pb-2 no-scrollbar pt-1">
                {categoryMeals.map((meal) => (
                  <div
                    key={meal.id}
                    onClick={() => onSelectMeal?.(meal)}
                    className="w-[165px] sm:w-[175px] min-h-[220px] rounded-[24px] p-3.5 bg-gradient-to-b from-white/[0.07] via-[#08090d] to-[#030406] hover:from-white/[0.12] hover:via-[#0c0d12] hover:to-[#050608] border border-white/[0.09] hover:border-white/[0.24] shadow-[0_12px_28px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.18)] flex flex-col items-center justify-between text-center shrink-0 group relative transition-all cursor-pointer card-fintech-interactive"
                  >
                    {/* Delete action on card hover */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteMeal(meal.id);
                      }}
                      className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-black/80 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-all cursor-pointer z-10 border border-white/10"
                      title="Delete meal"
                    >
                      <Trash2 size={12} />
                    </button>

                    {/* Circular Dish Image - Clean, Zero Tick / Checkmark */}
                    <div className="w-[85px] h-[85px] rounded-full overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.8)] border-2 border-white/20 bg-black mt-1 shrink-0">
                      <img
                        src={meal.imageUrl || getFoodImage(meal.name)}
                        alt={meal.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = FALLBACK_FOOD_IMAGE;
                        }}
                      />
                    </div>

                    {/* Food Name */}
                    <h4 className="font-bold text-sm text-white tracking-tight leading-snug line-clamp-2 px-1 mt-1">
                      {meal.name}
                    </h4>

                    {/* Nutrition: Calories + Carbs, Protein, Fat */}
                    <div className="w-full pt-1.5 border-t border-white/[0.07]">
                      <div className="text-xs font-bold text-white font-mono">
                        {meal.calories} kcal
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400 mt-0.5 flex items-center justify-center gap-1 leading-tight whitespace-nowrap">
                        <span>{meal.protein || 0}g P</span>
                        <span className="text-zinc-600">·</span>
                        <span>{meal.carbs || 0}g C</span>
                        <span className="text-zinc-600">·</span>
                        <span>{meal.fat || 0}g F</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* "+ More Food" Squircle Card */}
                <div
                  onClick={() => onAddMealClick(cat.key)}
                  className="w-[165px] sm:w-[175px] min-h-[220px] rounded-[24px] border border-dashed border-white/20 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/35 transition-all flex flex-col items-center justify-center gap-3 shrink-0 cursor-pointer group shadow-[0_8px_20px_rgba(0,0,0,0.4)]"
                  title={`Add more ${cat.title} food`}
                >
                  <div className="w-12 h-12 rounded-full bg-white/[0.08] group-hover:bg-white/[0.16] text-white flex items-center justify-center transition-all group-hover:scale-105 shadow-md border border-white/15">
                    <Plus size={22} />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-zinc-400 group-hover:text-white transition-colors">
                    More Food
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Quick Log button for unlogged categories */}
        {unloggedCategories.length > 0 && (
          <div className="pt-2 px-1 flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mr-1">
              Log meal:
            </span>
            {unloggedCategories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => onAddMealClick(cat.key)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] hover:border-white/[0.22] text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.18)] active:scale-95"
              >
                <cat.icon size={14} className={cat.accentColor} />
                <span>+ Add {cat.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (variant === 'mobile') {
    return renderMobileView();
  }

  if (variant === 'desktop') {
    return renderDesktopView();
  }

  // Auto: Mobile layout on < lg, Desktop landscape layout on >= lg
  return (
    <>
      <div className="block lg:hidden w-full">{renderMobileView()}</div>
      <div className="hidden lg:block w-full">{renderDesktopView()}</div>
    </>
  );
};
