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
    if (num <= 0) return 14;
    const ratio = num / maxMacro;
    return Math.min(78, Math.max(14, Math.round(14 + ratio * 64)));
  };

  const macroTiles = [
    { label: 'Protein', value: protein, fill: getMacroFillHeight(protein) },
    { label: 'Carbs', value: carbs, fill: getMacroFillHeight(carbs) },
    { label: 'Fat', value: fat, fill: getMacroFillHeight(fat) },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-[32px] sm:rounded-[36px] bg-white shadow-[0_24px_70px_rgba(0,0,0,0.5),0_0_0_1px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col max-h-[92vh] text-[#111318]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-white">
          {/* 1. Full-bleed Hero Photo Header (tall ~300px) */}
          <div className="relative w-full h-72 sm:h-80 shrink-0 overflow-hidden select-none bg-neutral-900">
            <img
              src={currentImg}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-500 ease-out"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = FALLBACK_FOOD_IMAGE;
              }}
            />

            {/* Top gradient for contrast with floating controls */}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 via-black/25 to-transparent pointer-events-none" />

            {/* Bottom soft dark gradient so text stays completely readable */}
            <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/85 via-black/45 to-transparent pointer-events-none" />

            {/* Floating Top Controls */}
            <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
              {/* Circular frosted back/close button (top-left) */}
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/25 backdrop-blur-md border border-white/30 text-white flex items-center justify-center cursor-pointer shadow-sm hover:bg-white/35 active:scale-95 transition-all"
                title="Back"
              >
                <ChevronLeft size={20} className="mr-0.5" />
              </button>

              {/* Centered white title "Nutritions" */}
              <span className="text-sm sm:text-base font-semibold text-white tracking-wide drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
                Nutritions
              </span>

              {/* Circular frosted edit button (top-right) */}
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/25 backdrop-blur-md border border-white/30 text-white flex items-center justify-center cursor-pointer shadow-sm hover:bg-white/35 active:scale-95 transition-all"
                  title="Edit meal"
                >
                  <Edit3 size={15} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/25 backdrop-blur-md border border-white/30 text-white flex items-center justify-center cursor-pointer shadow-sm hover:bg-white/35 active:scale-95 transition-all"
                  title="Cancel editing"
                >
                  <X size={17} />
                </button>
              )}
            </div>

            {/* Photo overlay block (bottom-left over photo, above the overlapping sheet) */}
            <div className="absolute bottom-9 sm:bottom-10 left-5 right-5 sm:left-6 sm:right-6 z-20 pointer-events-none space-y-1.5">
              {/* Meal Category small light pill (frosted white, dark text) */}
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/90 backdrop-blur-md shadow-sm">
                <span className="text-[11px] font-bold text-zinc-900 tracking-wider uppercase">
                  {categoryTitles[category]}
                </span>
              </div>

              {/* Big bold white headline line: calories hero figure ("320" large + "kcal") */}
              <div className="flex items-baseline gap-1.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight leading-none">
                  {calories}
                </span>
                <span className="text-sm sm:text-base font-bold text-white/90 font-mono">
                  kcal
                </span>
              </div>

              {/* Small white subtext line with portion */}
              <p className="text-xs text-white/90 font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                Logged portion: {portion}
              </p>
            </div>
          </div>

          {/* 2. White Sheet Overlapping Photo (-mt negative top margin, rounded-t ~28-32px, bg white #ffffff, dark text) */}
          <div className="relative z-20 -mt-6 sm:-mt-7 rounded-t-[28px] sm:rounded-t-[32px] bg-white text-[#111318] p-5 sm:p-6 space-y-5 shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
            {/* Food Name & Portion / Brand */}
            {!isEditing ? (
              <div className="space-y-1">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-2xl sm:text-[26px] font-bold text-[#111318] tracking-tight leading-tight">
                    {name}
                  </h2>
                  <span className="text-base sm:text-lg font-semibold text-gray-500 shrink-0 font-mono">
                    {calories}kcal
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">
                  Logged portion: <strong className="text-gray-800 font-semibold">{portion}</strong>
                  <span className="mx-1.5 text-gray-300">•</span>
                  <span>{categoryTitles[category]}</span>
                  {meal.brand && (
                    <>
                      <span className="mx-1.5 text-gray-300">•</span>
                      <span className="font-mono text-gray-600">{meal.brand}</span>
                    </>
                  )}
                </p>
                {(meal as any).description && (
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed pt-0.5">
                    {(meal as any).description}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3 p-4 rounded-2xl bg-[#F8FAFC] border border-gray-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                  <Edit3 size={13} className="text-gray-800" />
                  <span>Edit Food Information</span>
                </span>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider block">Food Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-gray-300 text-[#111318] font-bold text-base focus:border-gray-900 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider block">Portion</label>
                    <input
                      type="text"
                      value={portion}
                      onChange={(e) => setPortion(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-[#111318] font-semibold text-xs focus:border-gray-900 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider block">Time Logged</label>
                    <input
                      type="text"
                      value={timestamp}
                      onChange={(e) => setTimestamp(e.target.value)}
                      placeholder="e.g. 8:30 AM"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-[#111318] font-mono font-bold text-xs focus:border-gray-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider block">Category Slot</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MealCategory)}
                    className="w-full bg-white text-[#111318] text-xs rounded-xl p-2.5 border border-gray-300 focus:border-gray-900 focus:outline-none cursor-pointer"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snacks</option>
                  </select>
                </div>
              </div>
            )}

            {/* Three Vertical Macro Tiles exactly matching reference */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs px-0.5">
                <span className="font-bold text-gray-500 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Flame size={13} className="text-gray-700" />
                  <span>Macro Nutrition Distribution</span>
                </span>
                <span className="text-[11px] font-mono text-gray-400">
                  Total {protein + carbs + fat}g
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {macroTiles.map((tile) => (
                  <div
                    key={tile.label}
                    className="relative h-40 sm:h-44 rounded-[20px] bg-[#EDF1F7] macro-column-track overflow-hidden flex flex-col justify-between items-center select-none"
                  >
                    {/* Label at top in gray (#6B7280) */}
                    <div className="pt-3.5 sm:pt-4 z-10 relative text-center">
                      <span className="text-xs sm:text-sm font-medium text-[#6B7280] tracking-wide">
                        {tile.label}
                      </span>
                    </div>

                    {/* Soft pale blue fill rising from bottom (#D8E6FD -> #C9DCFC gradient) */}
                    <div
                      className="absolute bottom-0 inset-x-0 rounded-t-[18px] macro-column-fill transition-all duration-500 ease-out pointer-events-none"
                      style={{
                        height: `${tile.fill}%`,
                        minHeight: '44px',
                        background: 'linear-gradient(180deg, #D8E6FD 0%, #C9DCFC 100%)',
                      }}
                    />

                    {/* Value at bottom inside the fill in dark bold ("12 g") */}
                    <div className="pb-3.5 sm:pb-4 z-10 relative text-center">
                      <span className="text-sm sm:text-base font-bold text-[#111318] tracking-tight">
                        {tile.value}
                      </span>
                      <span className="text-xs font-semibold text-[#111318]/80 ml-0.5">g</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Macro Inputs in Edit Mode */}
            {isEditing && (
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-gray-200 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 block">
                  Edit Macro Nutritional Values
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Energy (kcal)</label>
                    <input
                      type="number"
                      value={calories}
                      onChange={(e) => setCalories(Number(e.target.value) || 0)}
                      className="w-full text-base font-bold font-mono text-[#111318] bg-white rounded-xl px-2.5 py-1.5 border border-gray-300 focus:border-gray-900 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Protein (g)</label>
                    <input
                      type="number"
                      value={protein}
                      onChange={(e) => setProtein(Number(e.target.value) || 0)}
                      className="w-full text-base font-bold font-mono text-[#111318] bg-white rounded-xl px-2.5 py-1.5 border border-gray-300 focus:border-gray-900 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Carbs (g)</label>
                    <input
                      type="number"
                      value={carbs}
                      onChange={(e) => setCarbs(Number(e.target.value) || 0)}
                      className="w-full text-base font-bold font-mono text-[#111318] bg-white rounded-xl px-2.5 py-1.5 border border-gray-300 focus:border-gray-900 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Fat (g)</label>
                    <input
                      type="number"
                      value={fat}
                      onChange={(e) => setFat(Number(e.target.value) || 0)}
                      className="w-full text-base font-bold font-mono text-[#111318] bg-white rounded-xl px-2.5 py-1.5 border border-gray-300 focus:border-gray-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Quick Serving Multiplier Scaler (When not editing raw fields) */}
            {!isEditing && (
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F8FAFC] border border-gray-100 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                    <Scale size={13} className="text-gray-500" />
                    <span>Quick Portion Scale</span>
                  </span>
                  <span className="text-[11px] font-mono text-[#111318] font-bold">{multiplier}x Portion</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 bg-[#EDF1F7] p-1 rounded-full">
                  {[0.5, 1, 1.5, 2].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => applyMultiplier(m)}
                      className={`py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer min-h-[38px] flex items-center justify-center ${
                        multiplier === m
                          ? 'bg-[#111318] text-white shadow-sm font-black'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                      }`}
                    >
                      {m}x
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Total Energy Line */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F8FAFC] border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Flame size={15} />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#111318] block">Total Caloric Energy</span>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {Math.round((protein * 4) + (carbs * 4) + (fat * 9))} kcal calculated from P/C/F macros
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold font-mono text-[#111318]">{calories}</span>
                <span className="text-xs text-gray-500 ml-1">kcal</span>
              </div>
            </div>

            {/* Secondary Micronutrients */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F8FAFC] border border-gray-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  Secondary Micronutrients
                </span>
                {isEditing && (
                  <span className="text-[10px] text-gray-400 font-mono">Fiber editable</span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-[#F4F6FA] border border-gray-100">
                  <span className="text-[10px] text-gray-500 block font-sans font-medium">FIBER</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={fiber}
                      onChange={(e) => setFiber(Number(e.target.value) || 0)}
                      className="w-full bg-white text-[#111318] font-bold text-xs mt-0.5 px-1 py-0.5 rounded border border-gray-200 focus:outline-none"
                    />
                  ) : (
                    <strong className="text-[#111318] font-bold">{fiber}g</strong>
                  )}
                </div>
                <div className="p-2.5 rounded-xl bg-[#F4F6FA] border border-gray-100">
                  <span className="text-[10px] text-gray-500 block font-sans font-medium">SAT FAT</span>
                  <strong className="text-[#111318] font-bold">{estimatedSatFat}g</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F4F6FA] border border-gray-100">
                  <span className="text-[10px] text-gray-500 block font-sans font-medium">SUGARS</span>
                  <strong className="text-[#111318] font-bold">{estimatedSugar}g</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F4F6FA] border border-gray-100">
                  <span className="text-[10px] text-gray-500 block font-sans font-medium">SODIUM</span>
                  <strong className="text-[#111318] font-bold">{estimatedSodium}mg</strong>
                </div>
              </div>
            </div>

            {/* Log Provenance Details Card */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F8FAFC] border border-gray-100 space-y-2 text-xs">
              <div className="flex items-center justify-between text-gray-500">
                <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-gray-400" />
                  <span>Log Details & History</span>
                </span>
                <span className="text-[11px] font-mono text-gray-400">ID: {meal.id.slice(-6)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div className="p-2.5 rounded-xl bg-[#F4F6FA] border border-gray-100">
                  <span className="text-gray-500 block text-[10px] font-sans font-medium">TIME LOGGED</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={timestamp}
                      onChange={(e) => setTimestamp(e.target.value)}
                      placeholder="e.g. 8:30 AM"
                      className="w-full bg-white text-[#111318] font-bold text-xs mt-1 px-1.5 py-0.5 rounded border border-gray-200 focus:outline-none"
                    />
                  ) : (
                    <strong className="text-[#111318] font-bold">{timestamp}</strong>
                  )}
                </div>

                <div className="p-2.5 rounded-xl bg-[#F4F6FA] border border-gray-100">
                  <span className="text-gray-500 block text-[10px] font-sans font-medium">LOG METHOD</span>
                  <strong className="text-[#111318] font-bold">Food Hub Entry</strong>
                </div>

                <div className="p-2.5 rounded-xl bg-[#F4F6FA] border border-gray-100 col-span-2">
                  <span className="text-gray-500 block text-[10px] font-sans font-medium">CATEGORY SLOT</span>
                  {isEditing ? (
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as MealCategory)}
                      className="w-full bg-white text-[#111318] text-xs mt-1 rounded-lg p-1.5 border border-gray-200 focus:outline-none"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snacks</option>
                    </select>
                  ) : (
                    <strong className="text-[#111318] font-bold">{categoryTitles[category]}</strong>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Footer */}
        <div className="p-4 sm:p-5 border-t border-gray-100 bg-white shrink-0 flex items-center justify-between gap-3">
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
                className="px-4 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs cursor-pointer min-h-[44px]"
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
                      className="px-4 py-2.5 rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-bold text-xs transition-all cursor-pointer min-h-[44px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#111318] hover:bg-black text-white font-bold text-xs min-h-[44px] cursor-pointer shadow-sm"
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
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-bold text-xs transition-all cursor-pointer min-h-[44px]"
                    >
                      <Edit3 size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-2.5 rounded-full bg-[#111318] hover:bg-black text-white font-bold text-xs min-h-[44px] cursor-pointer shadow-sm"
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
