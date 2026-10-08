import React, { useState, useEffect } from 'react';
import { X, Trash2, Edit3, Scale, ChevronLeft, Flame, Sparkles, Check } from 'lucide-react';
import type { MealItem, MealCategory } from '../types';
import { getFoodImage, FALLBACK_FOOD_IMAGE } from '../utils/foodImages';

interface MealDetailModalProps {
  meal: MealItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateMeal: (updatedMeal: MealItem) => void;
  onDeleteMeal: (mealId: string) => void;
}

export const MealDetailModal: React.FC<MealDetailModalProps> = ({
  meal,
  isOpen,
  onClose,
  onUpdateMeal,
  onDeleteMeal,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false);

  // Editable Form Fields
  const [name, setName] = useState<string>('');
  const [portion, setPortion] = useState<string>('');
  const [category, setCategory] = useState<MealCategory>('breakfast');
  const [timestamp, setTimestamp] = useState<string>('');
  const [calories, setCalories] = useState<number>(0);
  const [protein, setProtein] = useState<number>(0);
  const [carbs, setCarbs] = useState<number>(0);
  const [fat, setFat] = useState<number>(0);
  const [fiber, setFiber] = useState<number>(0);

  // Portion multiplier for quick scaling (0.5x, 1x, 1.5x, 2x)
  const [multiplier, setMultiplier] = useState<number>(1);

  useEffect(() => {
    if (meal) {
      setName(meal.name);
      setPortion(meal.portion || '1 serving');
      setCategory(meal.category);
      setTimestamp(meal.timestamp || '8:30 AM');
      setCalories(meal.calories);
      setProtein(meal.protein);
      setCarbs(meal.carbs);
      setFat(meal.fat);
      setFiber(meal.fiber || Math.round(meal.carbs * 0.12));
      setMultiplier(1);
      setIsEditing(false);
      setIsConfirmingDelete(false);
    }
  }, [meal]);

  if (!isOpen || !meal) return null;

  // Handle multiplier scale
  const applyMultiplier = (mult: number) => {
    setMultiplier(mult);
    setCalories(Math.round(meal.calories * mult));
    setProtein(Math.round(meal.protein * mult));
    setCarbs(Math.round(meal.carbs * mult));
    setFat(Math.round(meal.fat * mult));
    setFiber(Math.round((meal.fiber || Math.round(meal.carbs * 0.12)) * mult));
    setPortion(mult === 1 ? meal.portion : `${mult}x ${meal.portion}`);
  };

  const handleSave = () => {
    const updated: MealItem = {
      ...meal,
      name,
      portion,
      category,
      timestamp,
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      fiber: Number(fiber) || 0,
    };
    onUpdateMeal(updated);
    setIsEditing(false);
    onClose();
  };

  const handleCancelEdit = () => {
    if (meal) {
      setName(meal.name);
      setPortion(meal.portion || '1 serving');
      setCategory(meal.category);
      setTimestamp(meal.timestamp || '8:30 AM');
      setCalories(meal.calories);
      setProtein(meal.protein);
      setCarbs(meal.carbs);
      setFat(meal.fat);
      setFiber(meal.fiber || Math.round(meal.carbs * 0.12));
      setMultiplier(1);
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDeleteMeal(meal.id);
    onClose();
  };

  const categoryTitles: Record<MealCategory, string> = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snacks',
  };

  // Micro nutrients estimation if not present in item
  const estimatedSodium = meal.sodium ?? Math.round(meal.calories * 0.45);
  const estimatedSugar = meal.sugar ?? Math.round(meal.carbs * 0.22);
  const estimatedSatFat = meal.saturatedFat ?? Math.round(meal.fat * 0.28);

  const currentImg = meal.imageUrl || getFoodImage(meal.name);

  // Calculate proportional vertical fill heights for the 3 macro tiles
  // Normalize against the largest of the three, min ~14%
  const maxMacro = Math.max(
    Number(protein) || 0,
    Number(carbs) || 0,
    Number(fat) || 0,
    1
  );

  const getMacroFillHeight = (val: number) => {
    const num = Math.max(0, Number(val) || 0);
    if (num <= 0) return 26;
    const ratio = num / maxMacro;
    return Math.min(78, Math.max(26, Math.round(26 + ratio * 52)));
  };

  const macroTiles = [
    { label: 'Protein', value: protein, fill: getMacroFillHeight(protein) },
    { label: 'Carbs', value: carbs, fill: getMacroFillHeight(carbs) },
    { label: 'Fat', value: fat, fill: getMacroFillHeight(fat) },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/60 sm:bg-black/75 sm:backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:max-w-lg rounded-none sm:rounded-[36px] bg-white sm:shadow-[0_24px_70px_rgba(0,0,0,0.45),0_0_0_1px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col text-[#14161C]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-white">
          {/* 1. Full-bleed Hero Photo Header (edge-to-edge, soft scrims) */}
          <div className="relative w-full h-[310px] sm:h-[330px] shrink-0 overflow-hidden select-none bg-neutral-900">
            <img
              src={currentImg}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-500 ease-out"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = FALLBACK_FOOD_IMAGE;
              }}
            />

            {/* Soft top gradient scrim for title & frosted controls */}
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/45 via-black/15 to-transparent pointer-events-none" />

            {/* Soft bottom gradient scrim for kcal overlay */}
            <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

            {/* Floating Top Controls (Frosted glass discs) */}
            <div className="absolute top-0 inset-x-0 z-20 pt-[max(1rem,env(safe-area-inset-top))] px-4 sm:px-5 sm:pt-4 flex items-center justify-between">
              {/* Circular frosted back button (top-left) */}
              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-xl border border-white/30 text-white flex items-center justify-center cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.15)] hover:bg-white/40 active:scale-95 transition-all"
                title="Back"
              >
                <ChevronLeft size={20} className="mr-0.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
              </button>

              {/* Centered white title "Nutritions" */}
              <span className="text-sm sm:text-base font-semibold text-white tracking-wide drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
                Nutritions
              </span>

              {/* Circular frosted edit button (top-right) */}
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-xl border border-white/30 text-white flex items-center justify-center cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.15)] hover:bg-white/40 active:scale-95 transition-all"
                  title="Edit meal"
                >
                  <Edit3 size={16} className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-xl border border-white/30 text-white flex items-center justify-center cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.15)] hover:bg-white/40 active:scale-95 transition-all"
                  title="Cancel editing"
                >
                  <X size={18} className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
                </button>
              )}
            </div>

            {/* Photo overlay block (bottom-left over photo, above the overlapping sheet) */}
            <div className="absolute bottom-11 sm:bottom-12 left-5 right-5 sm:left-6 sm:right-6 z-20 pointer-events-none space-y-2">
              {/* Meal Category small light pill (frosted white, dark text) */}
              <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-white/85 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
                <span className="text-[11px] font-bold text-[#14161C] tracking-wider uppercase">
                  {categoryTitles[category]}
                </span>
              </div>

              {/* Big bold white headline line: calories hero figure ("320" large + "kcal") */}
              <div className="flex items-baseline gap-1.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight leading-none">
                  {calories}
                </span>
                <span className="text-sm sm:text-base font-bold text-white/90 font-mono">
                  kcal
                </span>
              </div>

              {/* Small white subtext line with portion */}
              <p className="text-xs text-white/90 font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
                Logged portion: {portion}
              </p>
            </div>
          </div>

          {/* 2. White Sheet Overlapping Photo (-mt negative top margin, rounded-t ~28px, soft shadow) */}
          <div className="relative z-20 -mt-7 sm:-mt-8 rounded-t-[28px] sm:rounded-t-[32px] bg-white text-[#14161C] p-5 sm:p-6 space-y-6 shadow-[0_-16px_48px_rgba(16,24,40,0.20)]">
            {/* Food Name & Portion / Brand */}
            {!isEditing ? (
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-2xl sm:text-[26px] font-bold text-[#14161C] tracking-tight leading-tight">
                    {name}
                  </h2>
                  <span className="text-base sm:text-lg font-semibold text-[#8A93A3] shrink-0 font-mono">
                    {calories}kcal
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#8A93A3] font-medium leading-relaxed">
                  Logged portion: <strong className="text-[#14161C] font-semibold">{portion}</strong>
                  <span className="mx-1.5 text-gray-300">•</span>
                  <span>{categoryTitles[category]}</span>
                  {meal.brand && (
                    <>
                      <span className="mx-1.5 text-gray-300">•</span>
                      <span className="font-mono text-[#14161C]/75">{meal.brand}</span>
                    </>
                  )}
                </p>
                {(meal as any).description && (
                  <p className="text-xs text-[#8A93A3] line-clamp-2 leading-relaxed pt-0.5">
                    {(meal as any).description}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3 p-4 rounded-2xl bg-[#F5F7FB] border border-[rgba(16,24,40,0.06)]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A93A3] flex items-center gap-1.5">
                  <Edit3 size={13} className="text-[#14161C]" />
                  <span>Edit Food Information</span>
                </span>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8A93A3] uppercase tracking-wider block">Food Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[rgba(16,24,40,0.12)] text-[#14161C] font-bold text-base focus:border-[#14161C] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#8A93A3] uppercase tracking-wider block">Portion</label>
                    <input
                      type="text"
                      value={portion}
                      onChange={(e) => setPortion(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[rgba(16,24,40,0.12)] text-[#14161C] font-semibold text-xs focus:border-[#14161C] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#8A93A3] uppercase tracking-wider block">Time Logged</label>
                    <input
                      type="text"
                      value={timestamp}
                      onChange={(e) => setTimestamp(e.target.value)}
                      placeholder="e.g. 8:30 AM"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[rgba(16,24,40,0.12)] text-[#14161C] font-mono font-bold text-xs focus:border-[#14161C] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8A93A3] uppercase tracking-wider block">Category Slot</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MealCategory)}
                    className="w-full bg-white text-[#14161C] text-xs rounded-xl p-2.5 border border-[rgba(16,24,40,0.12)] focus:border-[#14161C] focus:outline-none cursor-pointer"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snacks</option>
                  </select>
                </div>
              </div>
            )}

            {/* Three Vertical Macro Tiles matching reference (tall ~188-196px, pastel blue, matte) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs px-0.5">
                <span className="font-bold text-[#8A93A3] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Flame size={13} className="text-[#8A93A3]" />
                  <span>Macro Nutrition Distribution</span>
                </span>
                <span className="text-[11px] font-mono text-[#8A93A3]">
                  Total {protein + carbs + fat}g
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {macroTiles.map((tile) => (
                  <div
                    key={tile.label}
                    className="relative h-[188px] sm:h-[196px] rounded-[22px] bg-[#F0F4FA] macro-column-track overflow-hidden flex flex-col justify-between items-center select-none"
                  >
                    {/* Label at top in gray (#8A93A3) */}
                    <div className="pt-4 z-10 relative text-center">
                      <span className="text-xs sm:text-[13px] font-medium text-[#8A93A3] tracking-wide">
                        {tile.label}
                      </span>
                    </div>

                    {/* Calm pastel blue fill rising from bottom (#D9E8FD -> #CFE2FB soft gradient, flat & matte) */}
                    <div
                      className="absolute bottom-0 inset-x-0 rounded-t-[20px] macro-column-fill transition-all duration-500 ease-out pointer-events-none"
                      style={{
                        height: `${tile.fill}%`,
                        minHeight: '52px',
                        background: 'linear-gradient(180deg, #D9E8FD 0%, #CFE2FB 100%)',
                      }}
                    />

                    {/* Value at bottom inside the fill in dark bold */}
                    <div className="pb-4 z-10 relative text-center">
                      <span className="text-base sm:text-lg font-bold text-[#14161C] tracking-tight">
                        {tile.value}
                      </span>
                      <span className="text-xs sm:text-[13px] font-bold text-[#14161C]/80 ml-0.5">g</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Macro Inputs in Edit Mode */}
            {isEditing && (
              <div className="p-4 rounded-2xl bg-[#F5F7FB] border border-[rgba(16,24,40,0.06)] space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A93A3] block">
                  Edit Macro Nutritional Values
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#8A93A3] uppercase">Energy (kcal)</label>
                    <input
                      type="number"
                      value={calories}
                      onChange={(e) => setCalories(Number(e.target.value) || 0)}
                      className="w-full text-base font-bold font-mono text-[#14161C] bg-white rounded-xl px-2.5 py-1.5 border border-[rgba(16,24,40,0.12)] focus:border-[#14161C] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#8A93A3] uppercase">Protein (g)</label>
                    <input
                      type="number"
                      value={protein}
                      onChange={(e) => setProtein(Number(e.target.value) || 0)}
                      className="w-full text-base font-bold font-mono text-[#14161C] bg-white rounded-xl px-2.5 py-1.5 border border-[rgba(16,24,40,0.12)] focus:border-[#14161C] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#8A93A3] uppercase">Carbs (g)</label>
                    <input
                      type="number"
                      value={carbs}
                      onChange={(e) => setCarbs(Number(e.target.value) || 0)}
                      className="w-full text-base font-bold font-mono text-[#14161C] bg-white rounded-xl px-2.5 py-1.5 border border-[rgba(16,24,40,0.12)] focus:border-[#14161C] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#8A93A3] uppercase">Fat (g)</label>
                    <input
                      type="number"
                      value={fat}
                      onChange={(e) => setFat(Number(e.target.value) || 0)}
                      className="w-full text-base font-bold font-mono text-[#14161C] bg-white rounded-xl px-2.5 py-1.5 border border-[rgba(16,24,40,0.12)] focus:border-[#14161C] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Quick Serving Multiplier Scaler (When not editing raw fields) */}
            {!isEditing && (
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F5F7FB] border border-[rgba(16,24,40,0.06)] space-y-2.5">
                <div className="flex items-center justify-between text-xs text-[#8A93A3]">
                  <span className="font-semibold text-[#14161C] flex items-center gap-1.5">
                    <Scale size={13} className="text-[#8A93A3]" />
                    <span>Quick Portion Scale</span>
                  </span>
                  <span className="text-[11px] font-mono text-[#14161C] font-bold">{multiplier}x Portion</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 bg-[#EAEFF6] p-1 rounded-full">
                  {[0.5, 1, 1.5, 2].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => applyMultiplier(m)}
                      className={`py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer min-h-[38px] flex items-center justify-center ${
                        multiplier === m
                          ? 'bg-[#14161C] text-white shadow-sm font-black'
                          : 'text-[#8A93A3] hover:text-[#14161C] hover:bg-white/60'
                      }`}
                    >
                      {m}x
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Total Energy Line */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F5F7FB] border border-[rgba(16,24,40,0.06)] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Flame size={15} />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#14161C] block">Total Caloric Energy</span>
                  <span className="text-[10px] text-[#8A93A3] font-mono">
                    {Math.round((protein * 4) + (carbs * 4) + (fat * 9))} kcal calculated from P/C/F macros
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold font-mono text-[#14161C]">{calories}</span>
                <span className="text-xs text-[#8A93A3] ml-1">kcal</span>
              </div>
            </div>

            {/* Secondary Micronutrients */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F5F7FB] border border-[rgba(16,24,40,0.06)] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#8A93A3] uppercase tracking-wider block">
                  Secondary Micronutrients
                </span>
                {isEditing && (
                  <span className="text-[10px] text-[#8A93A3] font-mono">Fiber editable</span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-white border border-[rgba(16,24,40,0.06)]">
                  <span className="text-[10px] text-[#8A93A3] block font-sans font-medium">FIBER</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={fiber}
                      onChange={(e) => setFiber(Number(e.target.value) || 0)}
                      className="w-full bg-white text-[#14161C] font-bold text-xs mt-0.5 px-1 py-0.5 rounded border border-[rgba(16,24,40,0.12)] focus:outline-none"
                    />
                  ) : (
                    <strong className="text-[#14161C] font-bold">{fiber}g</strong>
                  )}
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-[rgba(16,24,40,0.06)]">
                  <span className="text-[10px] text-[#8A93A3] block font-sans font-medium">SAT FAT</span>
                  <strong className="text-[#14161C] font-bold">{estimatedSatFat}g</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-[rgba(16,24,40,0.06)]">
                  <span className="text-[10px] text-[#8A93A3] block font-sans font-medium">SUGARS</span>
                  <strong className="text-[#14161C] font-bold">{estimatedSugar}g</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-[rgba(16,24,40,0.06)]">
                  <span className="text-[10px] text-[#8A93A3] block font-sans font-medium">SODIUM</span>
                  <strong className="text-[#14161C] font-bold">{estimatedSodium}mg</strong>
                </div>
              </div>
            </div>

            {/* Log Provenance Details Card */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F5F7FB] border border-[rgba(16,24,40,0.06)] space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#8A93A3]">
                <span className="font-semibold text-[#14161C] flex items-center gap-1.5">
                  <Sparkles size={13} className="text-[#8A93A3]" />
                  <span>Log Details & History</span>
                </span>
                <span className="text-[11px] font-mono text-[#8A93A3]">ID: {meal.id.slice(-6)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div className="p-2.5 rounded-xl bg-white border border-[rgba(16,24,40,0.06)]">
                  <span className="text-[#8A93A3] block text-[10px] font-sans font-medium">TIME LOGGED</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={timestamp}
                      onChange={(e) => setTimestamp(e.target.value)}
                      placeholder="e.g. 8:30 AM"
                      className="w-full bg-white text-[#14161C] font-bold text-xs mt-1 px-1.5 py-0.5 rounded border border-[rgba(16,24,40,0.12)] focus:outline-none"
                    />
                  ) : (
                    <strong className="text-[#14161C] font-bold">{timestamp}</strong>
                  )}
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-[rgba(16,24,40,0.06)]">
                  <span className="text-[#8A93A3] block text-[10px] font-sans font-medium">LOG METHOD</span>
                  <strong className="text-[#14161C] font-bold">Food Hub Entry</strong>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-[rgba(16,24,40,0.06)] col-span-2">
                  <span className="text-[#8A93A3] block text-[10px] font-sans font-medium">CATEGORY SLOT</span>
                  {isEditing ? (
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as MealCategory)}
                      className="w-full bg-white text-[#14161C] text-xs mt-1 rounded-lg p-1.5 border border-[rgba(16,24,40,0.12)] focus:outline-none"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snacks</option>
                    </select>
                  ) : (
                    <strong className="text-[#14161C] font-bold">{categoryTitles[category]}</strong>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Footer */}
        <div className="p-4 sm:p-5 border-t border-[rgba(16,24,40,0.06)] bg-white shrink-0 flex items-center justify-between gap-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {/* Delete Action (Red) */}
          {isConfirmingDelete ? (
            <div className="flex items-center gap-2 w-full">
              <span className="text-xs text-rose-600 font-semibold truncate">Sure delete this meal?</span>
              <button
                type="button"
                onClick={handleDelete}
                className="ml-auto px-4 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-sm min-h-[44px]"
              >
                Yes, Delete
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="px-4 py-2.5 rounded-full bg-[#F5F7FB] hover:bg-gray-200 text-[#14161C] font-bold text-xs cursor-pointer min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#FDECEC] hover:bg-rose-100 text-rose-600 font-bold text-xs transition-all cursor-pointer min-h-[44px]"
                title="Delete meal from today"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>

              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-2.5 rounded-full bg-white border border-[rgba(16,24,40,0.12)] hover:bg-[#F5F7FB] text-[#14161C] font-bold text-xs transition-all cursor-pointer min-h-[44px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#14161C] hover:bg-black text-white font-bold text-xs min-h-[44px] cursor-pointer shadow-sm"
                    >
                      <Check size={14} />
                      <span>Save Changes</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-[rgba(16,24,40,0.12)] hover:bg-[#F5F7FB] text-[#14161C] font-bold text-xs transition-all cursor-pointer min-h-[44px]"
                    >
                      <Edit3 size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-2.5 rounded-full bg-[#14161C] hover:bg-black text-white font-bold text-xs min-h-[44px] cursor-pointer shadow-sm"
                    >
                      Done
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
