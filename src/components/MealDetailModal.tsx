import React, { useState, useEffect } from 'react';
import { X, Trash2, Edit3, Clock, Utensils, Check, Sparkles, Scale, Flame } from 'lucide-react';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-lg rounded-[32px] sm:rounded-[36px] bg-[#050506] border border-white/[0.12] border-t-white/[0.50] shadow-[0_32px_100px_rgba(0,0,0,0.98),0_0_0_1px_rgba(255,255,255,0.06),inset_0_1.5px_0.5px_rgba(255,255,255,0.55)] overflow-hidden flex flex-col max-h-[90vh] text-white">
        {/* Specular sheen dome overlay */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-16 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.03)_40%,transparent_75%)] pointer-events-none" />
        
        {/* Top Header Bar with Close Button */}
        <div className="relative z-10 px-5 sm:px-6 pt-5 pb-3.5 flex items-center justify-between border-b border-white/[0.08] bg-black/40 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 text-white border border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              {categoryTitles[category]}
            </span>
            <span className="text-xs text-zinc-400 font-mono flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
              <Clock size={12} className="text-zinc-400" />
              <span>{timestamp}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.18)]"
                title="Edit this meal"
              >
                <Edit3 size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.18)]"
              title="Close modal"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 sm:p-6 space-y-5">
          {/* Section 1: Food Hero Plate & Title */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-black border-2 border-white/20 shadow-[0_8px_25px_rgba(0,0,0,0.8)] shrink-0 flex items-center justify-center relative group">
              <img
                src={currentImg}
                alt={name}
                className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = FALLBACK_FOOD_IMAGE;
                }}
              />
            </div>

            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Food Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/20 text-white font-bold text-base focus:border-white focus:outline-none"
                  />
                </div>
              ) : (
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                    {name}
                  </h3>
                  {meal.brand && (
                    <span className="text-[10px] text-zinc-400 font-mono block mt-0.5">
                      Brand: {meal.brand}
                    </span>
                  )}
                  <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5 font-medium">
                    <Utensils size={13} className="text-zinc-500" />
                    <span>Logged portion: <strong className="text-white">{portion}</strong></span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: "Kab Kaise Add Kiya" - Log Provenance Card */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2 text-xs">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-400" />
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

          {/* Section 3: Core Macros Grid (Kitna Nutrition Tha) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Flame size={14} className="text-orange-400" />
                <span>Macro Nutrition Breakdown</span>
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                Total: <strong className="text-white font-bold">{calories} kcal</strong>
              </span>
            </div>

            {/* 4 Macro Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Calories */}
              <div className="p-3.5 rounded-2xl bg-[#07080b] border border-white/[0.12] border-t-white/[0.35] shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Energy</span>
                  <FuelIconBadge name="energy" size="sm" />
                </div>
                {isEditing ? (
                  <input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(Number(e.target.value) || 0)}
                    className="w-full text-lg font-black font-mono text-[#CDFF50] bg-black/60 rounded-xl px-2 py-1 border border-white/20 focus:outline-none"
                  />
                ) : (
                  <div className="text-xl font-black font-mono text-[#CDFF50] drop-shadow-[0_0_12px_rgba(205,255,80,0.35)]">
                    {calories}
                    <span className="text-[10px] font-normal text-zinc-400 ml-1">kcal</span>
                  </div>
                )}
              </div>

              {/* Protein */}
              <div className="p-3.5 rounded-2xl bg-[#07080b] border border-white/[0.10] border-t-white/[0.25] shadow-[inset_0_1px_1px_rgba(255,255,255,0.20)]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Protein</span>
                  <FuelIconBadge name="protein" size="sm" />
                </div>
                {isEditing ? (
                  <input
                    type="number"
                    value={protein}
                    onChange={(e) => setProtein(Number(e.target.value) || 0)}
                    className="w-full text-lg font-black font-mono text-white bg-black/60 rounded-xl px-2 py-1 border border-white/20 focus:outline-none"
                  />
                ) : (
                  <div className="text-xl font-black font-mono text-white">
                    {protein}
                    <span className="text-[10px] font-normal text-zinc-400 ml-1">g</span>
                  </div>
                )}
              </div>

              {/* Carbs */}
              <div className="p-3.5 rounded-2xl bg-[#07080b] border border-white/[0.10] border-t-white/[0.25] shadow-[inset_0_1px_1px_rgba(255,255,255,0.20)]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Carbs</span>
                  <FuelIconBadge name="carbs" size="sm" />
                </div>
                {isEditing ? (
                  <input
                    type="number"
                    value={carbs}
                    onChange={(e) => setCarbs(Number(e.target.value) || 0)}
                    className="w-full text-lg font-black font-mono text-white bg-black/60 rounded-xl px-2 py-1 border border-white/20 focus:outline-none"
                  />
                ) : (
                  <div className="text-xl font-black font-mono text-white">
                    {carbs}
                    <span className="text-[10px] font-normal text-zinc-400 ml-1">g</span>
                  </div>
                )}
              </div>

              {/* Fat */}
              <div className="p-3.5 rounded-2xl bg-[#07080b] border border-white/[0.10] border-t-white/[0.25] shadow-[inset_0_1px_1px_rgba(255,255,255,0.20)]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Fat</span>
                  <FuelIconBadge name="fat" size="sm" />
                </div>
                {isEditing ? (
                  <input
                    type="number"
                    value={fat}
                    onChange={(e) => setFat(Number(e.target.value) || 0)}
                    className="w-full text-lg font-black font-mono text-white bg-black/60 rounded-xl px-2 py-1 border border-white/20 focus:outline-none"
                  />
                ) : (
                  <div className="text-xl font-black font-mono text-white">
                    {fat}
                    <span className="text-[10px] font-normal text-zinc-400 ml-1">g</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Serving Multiplier Scaler (When not editing raw fields) */}
          {!isEditing && (
            <div className="p-3.5 rounded-2xl bg-[#07080b] border border-white/[0.08] space-y-2">
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
                        ? 'bg-[#CDFF50] text-black border-[#CDFF50] shadow-[0_0_14px_rgba(205,255,80,0.35)] font-black'
                        : 'bg-white/[0.05] text-zinc-300 border-white/10 hover:text-white hover:bg-white/[0.1] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                    }`}
                  >
                    {m}x
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Micro-Nutrient Details */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] space-y-2.5">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              Secondary Micronutrients
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] text-zinc-500 block">FIBER</span>
                <strong className="text-white">{fiber}g</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] text-zinc-500 block">SAT FAT</span>
                <strong className="text-white">{estimatedSatFat}g</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] text-zinc-500 block">SUGARS</span>
                <strong className="text-white">{estimatedSugar}g</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] text-zinc-500 block">SODIUM</span>
                <strong className="text-white">{estimatedSodium}mg</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Footer */}
        <div className="p-4 sm:p-5 border-t border-white/[0.08] bg-black/80 shrink-0 flex items-center justify-between gap-3">
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
                      onClick={() => setIsEditing(false)}
                      className="btn-pill-glass px-4 py-2.5 text-zinc-300 font-bold text-xs transition-all cursor-pointer min-h-[44px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="btn-pill-lime px-5 py-2.5 text-xs font-black min-h-[44px]"
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
                      className="btn-pill-lime px-6 py-2.5 text-xs font-black min-h-[44px]"
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
