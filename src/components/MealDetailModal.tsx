import React, { useState, useEffect } from 'react';
import { X, Trash2, Edit3, Clock, Utensils, Check, Sparkles, Scale, ChevronLeft, Flame } from 'lucide-react';
import type { MealItem, MealCategory } from '../types';
import { FuelIconBadge } from './FuelIcons';
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
  // Normalize against the largest of the three, min ~12% so small/zero values still show
  const maxMacro = Math.max(
    Number(protein) || 0,
    Number(carbs) || 0,
    Number(fat) || 0,
    1
  );

  const getMacroFillHeight = (val: number) => {
    const num = Math.max(0, Number(val) || 0);
    if (num <= 0) return 12;
    const ratio = num / maxMacro;
    return Math.min(80, Math.max(14, Math.round(14 + ratio * 64)));
  };

  const macroTiles = [
    { label: 'Protein', value: protein, fill: getMacroFillHeight(protein) },
    { label: 'Carbs', value: carbs, fill: getMacroFillHeight(carbs) },
    { label: 'Fat', value: fat, fill: getMacroFillHeight(fat) },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-[32px] sm:rounded-[36px] bg-[#050507] border border-white/[0.12] border-t-white/[0.50] shadow-[0_32px_100px_rgba(0,0,0,0.98),0_0_0_1px_rgba(255,255,255,0.06),inset_0_1.5px_0.5px_rgba(255,255,255,0.55)] overflow-hidden flex flex-col max-h-[92vh] text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Specular sheen dome overlay */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-16 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.03)_40%,transparent_75%)] pointer-events-none z-30" />

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {/* 1. Full-bleed Hero Photo Header (fills ~45-55% of the viewport) */}
          <div className="relative w-full h-72 sm:h-80 shrink-0 overflow-hidden select-none bg-black">
            <img
              src={currentImg}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-500 ease-out"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = FALLBACK_FOOD_IMAGE;
              }}
            />

            {/* Top gradient for contrast with floating controls */}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/80 via-black/35 to-transparent pointer-events-none" />

            {/* Bottom soft dark gradient so text stays completely readable */}
            <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#050507] via-[#050507]/85 to-transparent pointer-events-none" />

            {/* Floating Top Controls */}
            <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
              {/* Circular close/back button (top-left) */}
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/45 backdrop-blur-md border border-white/20 text-white flex items-center justify-center cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:bg-black/60 hover:border-white/30 transition-all"
                title="Back"
              >
                <ChevronLeft size={20} className="mr-0.5" />
              </button>

              {/* Title context */}
              <span className="text-xs sm:text-sm font-semibold text-white/90 tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
                Nutritions
              </span>

              {/* Circular edit / cancel toggle button (top-right) */}
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/45 backdrop-blur-md border border-white/20 text-white flex items-center justify-center cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:bg-black/60 hover:border-white/30 transition-all"
                  title="Edit meal"
                >
                  <Edit3 size={15} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/45 backdrop-blur-md border border-white/20 text-white flex items-center justify-center cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:bg-black/60 hover:border-white/30 transition-all"
                  title="Cancel editing"
                >
                  <X size={17} />
                </button>
              )}
            </div>

            {/* Meal Category as a small glass pill near top */}
            <div className="absolute top-16 left-4 sm:left-5 z-20">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.25)] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white">
                <Clock size={11} className="text-zinc-400" />
                <span>{categoryTitles[category]}</span>
              </div>
            </div>

            {/* Big calorie figure overlaid near photo lower area */}
            <div className="absolute bottom-10 sm:bottom-11 left-5 right-5 sm:left-6 sm:right-6 z-20 flex items-end justify-between pointer-events-none">
              <div>
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white/70 block drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
                  Nutritional Energy
                </span>
                <span className="text-xs text-zinc-400 font-mono block mt-0.5 drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
                  Logged Fuel · {portion}
                </span>
              </div>
              <div className="flex items-baseline gap-1 text-right">
                <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.95)]">
                  {calories}
                </span>
                <span className="text-xs sm:text-sm font-bold text-zinc-400 font-mono">
                  kcal
                </span>
              </div>
            </div>
          </div>

          {/* 2. Overlapping Sheet (large 28-32px top radius with negative margin) */}
          <div className="relative z-20 -mt-7 sm:-mt-8 rounded-t-[30px] sm:rounded-t-[34px] bg-[#050507] border-t border-white/[0.22] shadow-[0_-16px_36px_rgba(0,0,0,0.95),inset_0_1.5px_0.5px_rgba(255,255,255,0.65)] p-5 sm:p-6 space-y-5">
            {/* Sheet top tactile drag pill */}
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto -mt-1 mb-2" />

            {/* Food Name & Portion / Brand */}
            {!isEditing ? (
              <div className="space-y-1">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                    {name}
                  </h2>
                  <span className="text-xs font-mono font-bold text-zinc-300 bg-white/[0.06] border border-white/10 px-3 py-1 rounded-full shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                    {calories} kcal
                  </span>
                </div>
                <p className="text-xs text-zinc-400 flex items-center gap-1.5 font-medium">
                  <Utensils size={13} className="text-zinc-500 shrink-0" />
                  <span>Logged portion: <strong className="text-white font-semibold">{portion}</strong></span>
                  {meal.brand && (
                    <>
                      <span className="text-zinc-600">•</span>
                      <span className="font-mono text-zinc-400">{meal.brand}</span>
                    </>
                  )}
                </p>
              </div>
            ) : (
              <div className="space-y-3 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Edit3 size={13} className="text-white" />
                  <span>Edit Food Information</span>
                </span>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Food Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/20 text-white font-bold text-base focus:border-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Portion</label>
                    <input
                      type="text"
                      value={portion}
                      onChange={(e) => setPortion(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white font-semibold text-xs focus:border-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Time Logged</label>
                    <input
                      type="text"
                      value={timestamp}
                      onChange={(e) => setTimestamp(e.target.value)}
                      placeholder="e.g. 8:30 AM"
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white font-mono font-bold text-xs focus:border-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Category Slot</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MealCategory)}
                    className="w-full bg-[#14151e] text-white text-xs rounded-xl p-2.5 border border-white/20 focus:outline-none cursor-pointer"
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
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Flame size={13} className="text-white" />
                  <span>Macro Nutrition Distribution</span>
                </span>
                <span className="text-[11px] font-mono text-zinc-500">
                  Total {protein + carbs + fat}g
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {macroTiles.map((tile) => (
                  <div
                    key={tile.label}
                    className="relative h-40 sm:h-48 rounded-[22px] sm:rounded-[26px] macro-column-track overflow-hidden flex flex-col justify-between items-center select-none"
                  >
                    {/* Label at top */}
                    <div className="pt-3.5 sm:pt-4 z-10 relative text-center">
                      <span className="text-xs sm:text-sm font-semibold text-zinc-400 tracking-wide">
                        {tile.label}
                      </span>
                    </div>

                    {/* WHITE/glass fill rising from the bottom */}
                    <div
                      className="absolute bottom-1.5 left-1.5 right-1.5 rounded-[16px] sm:rounded-[20px] macro-column-fill transition-all duration-500 ease-out overflow-hidden pointer-events-none"
                      style={{ height: `${tile.fill}%` }}
                    >
                      {/* Top specular highlight rim */}
                      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent opacity-95" />
                    </div>

                    {/* Value at bottom inside/over the fill */}
                    <div className="pb-3 sm:pb-3.5 z-10 relative text-center">
                      <span className="text-base sm:text-lg font-black font-mono tracking-tight text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
                        {tile.value}
                      </span>
                      <span className="text-xs font-semibold text-zinc-300 ml-0.5">g</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Macro Inputs in Edit Mode */}
            {isEditing && (
              <div className="p-4 rounded-2xl bg-[#08090d] border border-white/[0.10] border-t-white/[0.25] shadow-[inset_0_1px_1px_rgba(255,255,255,0.18)] space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Edit Macro Nutritional Values
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Energy (kcal)</label>
                    <input
                      type="number"
                      value={calories}
                      onChange={(e) => setCalories(Number(e.target.value) || 0)}
                      className="w-full text-base font-black font-mono text-white bg-black/60 rounded-xl px-2.5 py-1.5 border border-white/20 focus:border-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Protein (g)</label>
                    <input
                      type="number"
                      value={protein}
                      onChange={(e) => setProtein(Number(e.target.value) || 0)}
                      className="w-full text-base font-black font-mono text-white bg-black/60 rounded-xl px-2.5 py-1.5 border border-white/20 focus:border-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Carbs (g)</label>
                    <input
                      type="number"
                      value={carbs}
                      onChange={(e) => setCarbs(Number(e.target.value) || 0)}
                      className="w-full text-base font-black font-mono text-white bg-black/60 rounded-xl px-2.5 py-1.5 border border-white/20 focus:border-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Fat (g)</label>
                    <input
                      type="number"
                      value={fat}
                      onChange={(e) => setFat(Number(e.target.value) || 0)}
                      className="w-full text-base font-black font-mono text-white bg-black/60 rounded-xl px-2.5 py-1.5 border border-white/20 focus:border-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Quick Serving Multiplier Scaler (When not editing raw fields) */}
            {!isEditing && (
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#07080b] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Scale size={13} className="text-zinc-300" />
                    <span>Quick Portion Scale</span>
                  </span>
                  <span className="text-[11px] font-mono text-white font-bold">{multiplier}x Portion</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0.5, 1, 1.5, 2].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => applyMultiplier(m)}
                      className={`py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer border min-h-[40px] flex items-center justify-center ${
                        multiplier === m
                          ? 'bg-white text-black border-white shadow-[0_0_14px_rgba(255,255,255,0.25)] font-black'
                          : 'bg-white/[0.05] text-zinc-300 border-white/10 hover:text-white hover:bg-white/[0.1] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                      }`}
                    >
                      {m}x
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Total Energy Line */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#08090d] border border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FuelIconBadge name="energy" size="sm" />
                <div>
                  <span className="text-xs font-bold text-white block">Total Caloric Energy</span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {Math.round((protein * 4) + (carbs * 4) + (fat * 9))} kcal calculated from P/C/F macros
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-black font-mono text-white">{calories}</span>
                <span className="text-xs text-zinc-400 ml-1">kcal</span>
              </div>
            </div>

            {/* Secondary Micronutrients */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#07080b] border border-white/[0.08] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Secondary Micronutrients
                </span>
                {isEditing && (
                  <span className="text-[10px] text-zinc-500 font-mono">Fiber editable</span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-[10px] text-zinc-500 block">FIBER</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={fiber}
                      onChange={(e) => setFiber(Number(e.target.value) || 0)}
                      className="w-full bg-transparent text-white font-bold text-xs mt-0.5 focus:outline-none border-b border-white/20"
                    />
                  ) : (
                    <strong className="text-white font-bold">{fiber}g</strong>
                  )}
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-[10px] text-zinc-500 block">SAT FAT</span>
                  <strong className="text-white font-bold">{estimatedSatFat}g</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-[10px] text-zinc-500 block">SUGARS</span>
                  <strong className="text-white font-bold">{estimatedSugar}g</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-[10px] text-zinc-500 block">SODIUM</span>
                  <strong className="text-white font-bold">{estimatedSodium}mg</strong>
                </div>
              </div>
            </div>

            {/* Log Provenance Details Card */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2 text-xs">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-white" />
                  <span>Log Details & History</span>
                </span>
                <span className="text-[11px] font-mono text-zinc-500">ID: {meal.id.slice(-6)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-zinc-500 block text-[10px]">TIME LOGGED</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={timestamp}
                      onChange={(e) => setTimestamp(e.target.value)}
                      placeholder="e.g. 8:30 AM"
                      className="w-full bg-transparent text-white font-bold text-xs mt-0.5 focus:outline-none"
                    />
                  ) : (
                    <strong className="text-white font-bold">{timestamp}</strong>
                  )}
                </div>

                <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-zinc-500 block text-[10px]">LOG METHOD</span>
                  <strong className="text-white font-bold">Food Hub Entry</strong>
                </div>

                <div className="p-2 rounded-xl bg-black/40 border border-white/5 col-span-2">
                  <span className="text-zinc-500 block text-[10px]">CATEGORY SLOT</span>
                  {isEditing ? (
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as MealCategory)}
                      className="w-full bg-[#181922] text-white text-xs mt-1 rounded-lg p-1.5 border border-white/20 focus:outline-none"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snacks</option>
                    </select>
                  ) : (
                    <strong className="text-white font-bold">{categoryTitles[category]}</strong>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Footer */}
        <div className="p-4 sm:p-5 border-t border-white/[0.08] bg-black/85 shrink-0 flex items-center justify-between gap-3 backdrop-blur-md">
          {/* Delete Action (Red) */}
          {isConfirmingDelete ? (
            <div className="flex items-center gap-2 w-full">
              <span className="text-xs text-rose-400 font-semibold truncate">Sure delete this meal?</span>
              <button
                type="button"
                onClick={handleDelete}
                className="ml-auto px-4 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer shadow-md min-h-[44px]"
              >
                Yes, Delete
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="btn-pill-glass px-4 py-2.5 text-zinc-300 font-bold text-xs cursor-pointer min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold text-xs transition-all cursor-pointer min-h-[44px]"
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
                      className="btn-pill-glass px-4 py-2.5 text-zinc-300 font-bold text-xs transition-all cursor-pointer min-h-[44px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="btn-pill-primary px-5 py-2.5 text-xs font-black min-h-[44px] cursor-pointer"
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
                      className="btn-pill-glass flex items-center gap-1.5 px-4 py-2.5 text-white font-bold text-xs transition-all cursor-pointer min-h-[44px]"
                    >
                      <Edit3 size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="btn-pill-primary px-6 py-2.5 text-xs font-black min-h-[44px] cursor-pointer"
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
