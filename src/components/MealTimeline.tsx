import React from 'react';
import { Plus, Sunrise, Utensils, Moon, Apple } from 'lucide-react';
import type { MealItem, MealCategory } from '../types';
import { MealCard } from './MealCard';

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

  const totalDayKcal = meals.reduce((sum, m) => sum + (m.calories || 0), 0);

  // Empty state when nothing has been logged yet for the day
  const renderEmptyState = () => (
    <div className="panel-fintech-history rounded-[34px] p-6 sm:p-8 text-center flex flex-col items-center justify-center select-none">
      <div className="chip-circular-gloss w-14 h-14 mb-3 text-zinc-300">
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
            className="btn-pill-glass px-4 py-2 text-xs sm:text-sm"
          >
            <cat.icon size={15} className={cat.accentColor} />
            <span>+ Log {cat.title}</span>
          </button>
        ))}
      </div>
    </div>
  );

  // 1. Mobile View: History list panel matching Fintech reference
  const renderMobileView = () => {
    if (loggedCategories.length === 0) {
      return renderEmptyState();
    }

    return (
      <div className="w-full panel-fintech-history rounded-[34px] p-4 sm:p-5 select-none space-y-4">
        {/* Panel Header matching Fintech "History / Today" */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div>
            <h3 className="text-lg sm:text-xl font-black tracking-tight text-white font-sans">
              History
            </h3>
            <p className="text-xs font-mono text-zinc-400">
              Today
            </p>
          </div>
          <div className="text-right">
            <span className="text-sm sm:text-base font-bold font-mono text-[#CDFF50]">
              {totalDayKcal} kcal
            </span>
          </div>
        </div>

        {/* Meal Categories inside History Panel */}
        <div className="space-y-4">
          {loggedCategories.map((cat) => {
            const categoryMeals = meals.filter((m) => m.category === cat.key);
            const categoryKcal = categoryMeals.reduce((sum, m) => sum + (m.calories || 0), 0);

            return (
              <div key={cat.key} className="space-y-2">
                {/* Category Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <div className="chip-circular-gloss w-7 h-7 text-white shrink-0">
                      <cat.icon size={14} className={cat.accentColor} strokeWidth={2} />
                    </div>
                    <h4 className="text-sm sm:text-base font-bold tracking-tight text-white font-sans">
                      {cat.title}
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-white/10 text-zinc-300 font-semibold">
                      {categoryMeals.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {categoryKcal > 0 && (
                      <span className="text-xs font-mono text-zinc-400 font-bold">
                        {categoryKcal} kcal
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => onAddMealClick(cat.key)}
                      className="btn-circle-cta-lime w-8 h-8"
                      title={`Add ${cat.title} item`}
                    >
                      <Plus size={15} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                {/* History Rows for this category */}
                <div className="space-y-1.5">
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
            );
          })}
        </div>

        {/* Quick Log button for unlogged categories */}
        {unloggedCategories.length > 0 && (
          <div className="pt-3 border-t border-white/[0.08]">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
              Log Meal:
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {unloggedCategories.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => onAddMealClick(cat.key)}
                  className="btn-pill-glass text-xs py-1.5 px-3.5 min-h-[38px]"
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

  // 2. Desktop View: History panel with clean 2-column history rows
  const renderDesktopView = () => {
    if (loggedCategories.length === 0) {
      return renderEmptyState();
    }

    return (
      <div className="w-full panel-fintech-history rounded-[34px] p-6 select-none space-y-6">
        {/* Panel Header matching Fintech "History / Today" */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
              History
            </h3>
            <p className="text-xs font-mono text-zinc-400">
              Today
            </p>
          </div>
          <div className="text-right">
            <span className="text-base font-bold font-mono text-[#CDFF50]">
              {totalDayKcal} kcal total
            </span>
          </div>
        </div>

        {loggedCategories.map((cat) => {
          const categoryMeals = meals.filter((m) => m.category === cat.key);
          const totalCount = categoryMeals.length;
          const categoryKcal = categoryMeals.reduce((sum, m) => sum + (m.calories || 0), 0);

          return (
            <div key={cat.key} className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="chip-circular-gloss w-9 h-9 text-white shrink-0">
                    <cat.icon size={18} strokeWidth={2} className={cat.accentColor} />
                  </div>
                  <div className="flex items-center gap-2.5">
                    <h4 className="text-lg sm:text-xl font-black tracking-tight text-white font-sans">
                      {cat.title}
                    </h4>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-300 font-semibold">
                      {totalCount} {totalCount === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {categoryKcal > 0 && (
                    <span className="text-sm font-mono text-zinc-300 font-bold">
                      {categoryKcal} kcal
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onAddMealClick(cat.key)}
                    className="btn-circle-cta-lime w-9 h-9 shadow-[0_4px_18px_rgba(205,255,80,0.35)]"
                    title={`Add ${cat.title} item`}
                  >
                    <Plus size={18} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Rows */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
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
          );
        })}

        {/* Quick Log button for unlogged categories */}
        {unloggedCategories.length > 0 && (
          <div className="pt-3 border-t border-white/[0.08] flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mr-1">
              Log meal:
            </span>
            {unloggedCategories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => onAddMealClick(cat.key)}
                className="btn-pill-glass text-xs py-1.5 px-4 min-h-[38px]"
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
