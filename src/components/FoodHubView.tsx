import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Minus,
  Check,
  ArrowLeft,
  Flame,
  Trash2,
  Sparkles,
  BookmarkCheck,
  X,
  Layers,
  Clock,
  Calendar,
  Sunrise,
  Utensils,
  Moon,
  Apple,
  Pencil,
} from 'lucide-react';
import type { MealCategory, FoodLibraryItem, MealItem } from '../types';
import { FOOD_DATABASE } from '../data/initialData';
import { getFoodImage, FALLBACK_FOOD_IMAGE } from '../utils/foodImages';
import { loadCustomFoods, deleteCustomFood } from '../utils/storage';

export interface FoodHubViewProps {
  onBackToDashboard: () => void;
  onNavigateToCreateFood?: () => void;
  onEditFood?: (food: FoodLibraryItem) => void;
  defaultCategory?: MealCategory;
  selectedDate?: string;
  onAddMeal: (meal: Omit<MealItem, 'id' | 'timestamp'> & { timestamp?: string; targetDate?: string }) => void;
  theme?: 'emerald' | 'obsidian' | 'pure-black';
  isModal?: boolean;
  onCloseModal?: () => void;
}

type FoodHubTab = 'all' | 'my-foods' | 'my-meals' | 'quick-add';

const MEAL_CATEGORY_OPTIONS = [
  { id: 'breakfast', label: 'Breakfast', icon: Sunrise },
  { id: 'lunch', label: 'Lunch', icon: Utensils },
  { id: 'dinner', label: 'Dinner', icon: Moon },
  { id: 'snack', label: 'Snack', icon: Apple },
] as const;

interface PresetComboMeal {
  id: string;
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: MealCategory;
  itemsCount: number;
}

const PRESET_COMBOS: PresetComboMeal[] = [
  {
    id: 'combo-desi-lunch',
    name: 'Desi Lunch Combo',
    description: '2 Tawa Rotis + Yellow Tadka Dal + Salad',
    calories: 380,
    protein: 20,
    carbs: 62,
    fat: 6,
    category: 'lunch',
    itemsCount: 3,
  },
  {
    id: 'combo-protein-breakfast',
    name: 'Power Protein Breakfast',
    description: 'Oats with Banana + 2 Boiled Eggs',
    calories: 470,
    protein: 26,
    carbs: 55,
    fat: 17,
    category: 'breakfast',
    itemsCount: 2,
  },
  {
    id: 'combo-post-workout',
    name: 'Post-Workout Fuel',
    description: 'Whey Protein Shake + 2 Boiled Eggs',
    calories: 320,
    protein: 40,
    carbs: 9,
    fat: 12,
    category: 'snack',
    itemsCount: 2,
  },
  {
    id: 'combo-light-dinner',
    name: 'Paneer & Roti Dinner',
    description: 'Fresh Paneer (150g) + 2 Tandoori Rotis',
    calories: 440,
    protein: 26,
    carbs: 48,
    fat: 15,
    category: 'dinner',
    itemsCount: 2,
  },
];

const safeMacro = (val: number | undefined | null) => Math.max(0, Number(val) || 0);
const formatMacro = (val: number | undefined | null) => {
  const n = safeMacro(val);
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
};

// Format 24h ("14:30") to 12h ("2:30 PM")
function formatTime12h(timeStr: string): string {
  if (!timeStr) return '';
  if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return timeStr;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

// Current formatted HH:mm for "Now" buttons
function getNowTimeHHMM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// Current formatted time (e.g. "9:23 PM")
function getNowFormattedTime(): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date());
  } catch {
    return '';
  }
}

// Auto-deduce natural meal category by time of day
function getDefaultMealCategoryByTime(): MealCategory {
  const hour = new Date().getHours();
  const min = new Date().getMinutes();
  const timeVal = hour + min / 60;

  if (timeVal < 11.5) return 'breakfast';       // Before 11:30 AM
  if (timeVal < 16.5) return 'lunch';           // 11:30 AM – 4:30 PM
  if (timeVal < 19.5) return 'snack';           // 4:30 PM – 7:30 PM
  return 'dinner';                              // After 7:30 PM
}

export const FoodHubView: React.FC<FoodHubViewProps> = ({
  onBackToDashboard,
  onNavigateToCreateFood,
  onEditFood,
  defaultCategory,
  selectedDate,
  onAddMeal,
  isModal = false,
  onCloseModal,
}) => {
  const [activeTab, setActiveTab] = useState<FoodHubTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customFoods, setCustomFoods] = useState<FoodLibraryItem[]>([]);

  // Serving Detail / Portion Modal State
  const [selectedFood, setSelectedFood] = useState<FoodLibraryItem | null>(null);
  const [servingQty, setServingQty] = useState<number>(1);
  const [detailMode, setDetailMode] = useState<'unit' | 'weight'>('unit');
  const [detailWeightInput, setDetailWeightInput] = useState<string>('100');
  const [modalCategory, setModalCategory] = useState<MealCategory>(defaultCategory || getDefaultMealCategoryByTime());

  // Keep the log category in sync with the section the user came from,
  // so food never lands in the wrong meal (breakfast/lunch/dinner/snack mix-up).
  useEffect(() => {
    if (defaultCategory) setModalCategory(defaultCategory);
  }, [defaultCategory]);
  const [modalDate, setModalDate] = useState<string>(selectedDate || '2026-08-23');
  const [modalTime, setModalTime] = useState<string>(''); // Blank by default as requested!

  // Quick Add State
  const [quickCalories, setQuickCalories] = useState('');
  const [quickProtein, setQuickProtein] = useState('');
  const [quickCarbs, setQuickCarbs] = useState('');
  const [quickFat, setQuickFat] = useState('');
  const [quickName, setQuickName] = useState('Quick Calories');
  const [quickCategory, setQuickCategory] = useState<MealCategory>(defaultCategory || getDefaultMealCategoryByTime());
  const [quickDate, setQuickDate] = useState<string>(selectedDate || '2026-08-23');
  const [quickTime, setQuickTime] = useState<string>(''); // Blank by default as requested!

  // Toast Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setCustomFoods(loadCustomFoods());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  const allFoods = useMemo(() => {
    return [...customFoods, ...FOOD_DATABASE];
  }, [customFoods]);

  const filteredFoods = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return allFoods;
    return allFoods.filter((f) => {
      const matchName = f.name.toLowerCase().includes(q);
      const matchBrand = f.brand ? f.brand.toLowerCase().includes(q) : false;
      const matchDesc = f.description ? f.description.toLowerCase().includes(q) : false;
      return matchName || matchBrand || matchDesc;
    });
  }, [allFoods, searchQuery]);

  const handleOpenDetail = (food: FoodLibraryItem) => {
    setSelectedFood(food);
    setServingQty(1);
    setDetailMode('unit');
    setModalCategory(defaultCategory || getDefaultMealCategoryByTime());
    setModalDate(selectedDate || '2026-08-23');
    setModalTime('');
    const defaultWt =
      food.servingWeightGrams ||
      (food.servingSizeUnit === 'g' || food.servingSizeUnit === 'ml'
        ? food.servingSizeQty || 100
        : 100);
    setDetailWeightInput(String(defaultWt));
  };

  const handleLogCombo = (combo: PresetComboMeal) => {
    onAddMeal({
      name: combo.name,
      calories: combo.calories,
      protein: combo.protein,
      carbs: combo.carbs,
      fat: combo.fat,
      portion: `${combo.itemsCount} items combo`,
      category: combo.category,
      timestamp: getNowFormattedTime(),
      imageUrl: getFoodImage(combo.name),
    });
    showToast(`✓ Logged ${combo.name} (+${combo.calories} kcal) to ${combo.category.toUpperCase()}`);
  };

  // Base weight & unit for dual-unit math
  const baseWeight =
    selectedFood?.servingWeightGrams ||
    (selectedFood?.servingSizeUnit === 'g' || selectedFood?.servingSizeUnit === 'ml'
      ? selectedFood?.servingSizeQty || 100
      : null);
  const baseUnit = selectedFood?.servingSizeUnit || 'serving';
  const equivUnit =
    selectedFood?.servingEquivalentUnit ||
    (selectedFood?.servingSizeUnit === 'ml' ? 'ml' : 'g');

  let detailMultiplier = Math.max(0.1, servingQty);
  if (selectedFood && baseWeight && detailMode === 'weight') {
    const g = Number(detailWeightInput) || baseWeight;
    detailMultiplier = Math.max(0.05, g / baseWeight);
  }

  const handleConfirmLogFromDetail = () => {
    if (!selectedFood) return;
    const finalKcal = Math.max(0, Math.round(selectedFood.calories * detailMultiplier));
    const finalProtein = Math.max(0, Math.round(selectedFood.protein * detailMultiplier));
    const finalCarbs = Math.max(0, Math.round(selectedFood.carbs * detailMultiplier));
    const finalFat = Math.max(0, Math.round(selectedFood.fat * detailMultiplier));

    let portionDesc = selectedFood.defaultPortion;
    if (baseWeight) {
      if (detailMode === 'weight') {
        const val = Number(detailWeightInput) || baseWeight;
        const computedUnits = Number((val / baseWeight).toFixed(1));
        portionDesc = `${val}${equivUnit} (${computedUnits} ${baseUnit})`;
      } else {
        const computedVal = Math.round(servingQty * baseWeight);
        portionDesc =
          baseUnit === 'g' || baseUnit === 'ml'
            ? `${computedVal}${baseUnit}`
            : `${servingQty} ${baseUnit} (${computedVal}${equivUnit})`;
      }
    } else {
      portionDesc =
        detailMultiplier === 1
          ? selectedFood.defaultPortion
          : `${detailMultiplier}x ${selectedFood.defaultPortion}`;
    }

    const formattedTime = modalTime ? formatTime12h(modalTime) : '';
    onAddMeal({
      name: selectedFood.name,
      brand: selectedFood.brand,
      calories: finalKcal,
      protein: finalProtein,
      carbs: finalCarbs,
      fat: finalFat,
      portion: portionDesc,
      category: modalCategory,
      timestamp: formattedTime,
      imageUrl: selectedFood.imageUrl || getFoodImage(selectedFood.name),
      targetDate: modalDate,
    });

    const timeNotice = formattedTime ? ` at ${formattedTime}` : '';
    showToast(`✓ Added to ${modalCategory.toUpperCase()}${timeNotice} (+${finalKcal} kcal)`);
    setSelectedFood(null);
  };

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const kcal = Number(quickCalories) || 0;
    if (kcal <= 0) return;

    const formattedQuickTime = quickTime ? formatTime12h(quickTime) : '';
    onAddMeal({
      name: quickName.trim() || 'Quick Calories',
      calories: kcal,
      protein: Number(quickProtein) || 0,
      carbs: Number(quickCarbs) || 0,
      fat: Number(quickFat) || 0,
      portion: 'Manual entry',
      category: quickCategory,
      timestamp: formattedQuickTime,
      imageUrl: getFoodImage(quickName),
      targetDate: quickDate,
    });

    const timeNotice = formattedQuickTime ? ` at ${formattedQuickTime}` : '';
    showToast(`✓ Logged (+${kcal} kcal) to ${quickCategory.toUpperCase()}${timeNotice}`);
    setQuickCalories('');
    setQuickProtein('');
    setQuickCarbs('');
    setQuickFat('');
    setActiveTab('all');
  };

  const handleDeleteCustomFood = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteCustomFood(id);
    setCustomFoods(updated);
    showToast('Removed custom food');
  };

  // Nutrient calculations for portion
  const detailKcal = selectedFood ? Math.max(0, Math.round(selectedFood.calories * detailMultiplier)) : 0;
  const detailProtein = selectedFood ? Math.max(0, Number(((selectedFood.protein || 0) * detailMultiplier).toFixed(1))) : 0;
  const detailCarbs = selectedFood ? Math.max(0, Number(((selectedFood.carbs || 0) * detailMultiplier).toFixed(1))) : 0;
  const detailFat = selectedFood ? Math.max(0, Number(((selectedFood.fat || 0) * detailMultiplier).toFixed(1))) : 0;

  return (
    <div className={`w-full flex flex-col ${isModal ? 'max-h-[92vh] sm:max-h-[88vh]' : 'min-h-[82vh]'} select-none relative bg-black`}>
      {/* ----------------- TOP NAVBAR ----------------- */}
      <div className={`${!isModal ? 'lg:hidden ' : ''}px-4 sm:px-6 py-3.5 border border-white/[0.12] border-t-white/[0.45] ${isModal ? 'rounded-t-3xl' : 'rounded-2xl sm:rounded-3xl'} flex items-center justify-between shrink-0 bg-[radial-gradient(ellipse_65%_45%_at_50%_-5%,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.05)_25%,transparent_70%)] bg-[#050506] shadow-[0_20px_48px_rgba(0,0,0,0.95),inset_0_1.2px_0.5px_rgba(255,255,255,0.50)] mb-3`}>
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="w-9 h-9 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 flex items-center justify-center text-white transition-all active:scale-95 cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.18)]"
            title="Back to Dashboard"
          >
            <ArrowLeft size={16} />
          </button>

          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
              Food Log
            </h2>
          </div>
        </div>

        {/* Right Top Actions */}
        <div className="flex items-center gap-2">
          {onNavigateToCreateFood && (
            <button
              type="button"
              onClick={onNavigateToCreateFood}
              className="btn-pill-primary px-3.5 py-1.5 text-xs min-h-[36px] font-black cursor-pointer shadow-[0_2px_14px_rgba(255,255,255,0.25)]"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>Create Food</span>
            </button>
          )}

          {isModal && onCloseModal && (
            <button
              type="button"
              onClick={onCloseModal}
              className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/15 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/[0.1]"
              title="Close"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ----------------- CLUTTER-FREE TABS & CONTEXTUAL SEARCH ----------------- */}
      <div className="px-3.5 sm:px-6 pt-2 pb-2 space-y-2.5 shrink-0 bg-black">
        {/* Clean Segmented Filter Tabs: Frequent | My Foods | Combos | Quick matching Proton pill style */}
        <div className="grid grid-cols-4 p-1 rounded-full bg-black/70 border border-white/[0.1] text-center shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`py-2 rounded-full text-xs transition-all cursor-pointer min-h-[38px] flex items-center justify-center ${
              activeTab === 'all'
                ? 'bg-white text-black shadow-[0_2px_14px_rgba(255,255,255,0.25)] font-black'
                : 'text-zinc-400 hover:text-white font-medium hover:bg-white/[0.05]'
            }`}
          >
            <span className="sm:hidden">Frequent</span>
            <span className="hidden sm:inline">Frequent Foods</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('my-foods')}
            className={`py-2 rounded-full text-xs transition-all cursor-pointer flex items-center justify-center gap-1 min-h-[38px] ${
              activeTab === 'my-foods'
                ? 'bg-white text-black shadow-[0_2px_14px_rgba(255,255,255,0.25)] font-black'
                : 'text-zinc-400 hover:text-white font-medium hover:bg-white/[0.05]'
            }`}
          >
            <span>My Foods</span>
            {customFoods.length > 0 && (
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'my-foods' ? 'bg-black text-white' : 'bg-white/15 text-zinc-300'
                }`}
              >
                {customFoods.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('my-meals')}
            className={`py-2 rounded-full text-xs transition-all cursor-pointer min-h-[38px] flex items-center justify-center ${
              activeTab === 'my-meals'
                ? 'bg-white text-black shadow-[0_2px_14px_rgba(255,255,255,0.25)] font-black'
                : 'text-zinc-400 hover:text-white font-medium hover:bg-white/[0.05]'
            }`}
          >
            <span className="sm:hidden">Combos</span>
            <span className="hidden sm:inline">Saved Meals</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quick-add')}
            className={`py-2 rounded-full text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 min-h-[38px] ${
              activeTab === 'quick-add'
                ? 'bg-white text-black shadow-[0_2px_14px_rgba(255,255,255,0.25)] font-black'
                : 'text-zinc-400 hover:text-white font-medium hover:bg-white/[0.05]'
            }`}
          >
            <Flame size={13} className={activeTab === 'quick-add' ? 'text-black fill-black' : 'text-white'} />
            <span>Quick</span>
          </button>
        </div>

        {/* Contextual Search Bar (Proton search pill capsule) */}
        {(activeTab === 'all' || activeTab === 'my-foods') && (
          <div className="relative animate-fade-in">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder={activeTab === 'my-foods' ? 'Search custom foods...' : 'Search foods (Roti, Milk, Oats)...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-full bg-white/[0.04] border border-white/[0.12] hover:border-white/[0.22] focus:border-white/[0.38] text-white placeholder:text-zinc-500 text-xs sm:text-sm focus:outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-zinc-400 hover:text-white cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ----------------- TAB CONTENT ----------------- */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-3.5 sm:px-6 pb-28 sm:pb-20 pt-1.5">
        {/* TAB 1: ALL / FREQUENT FOODS */}
        {activeTab === 'all' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1 px-1">
              <span className="text-[11px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={12} className="text-white" />
                {searchQuery ? `Search Results (${filteredFoods.length})` : 'Frequently Eaten Foods'}
              </span>
              <span className="hidden sm:inline text-[11px] text-zinc-500 font-medium">Tap to adjust serving</span>
            </div>

            <div className="max-w-4xl mx-auto space-y-2.5">
              {filteredFoods.map((food) => (
                <div
                  key={food.id}
                  onClick={() => handleOpenDetail(food)}
                  className="group p-3.5 sm:p-4 rounded-[22px] bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,transparent_6%)] bg-[#000000] hover:bg-[#050508] border border-white/[0.08] border-t-white/[0.28] hover:border-white/[0.18] hover:border-t-white/[0.45] shadow-[0_8px_20px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.25)] flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] card-fintech-interactive min-h-[58px]"
                >
                  <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 pr-2">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 bg-black shrink-0 shadow-md group-hover:scale-105 transition-transform">
                      <img
                        src={food.imageUrl || getFoodImage(food.name)}
                        alt={food.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = FALLBACK_FOOD_IMAGE;
                        }}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm sm:text-base text-white tracking-tight truncate group-hover:text-white transition-colors">
                          {food.name}
                        </h4>
                        {food.brand && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 border border-white/10 text-zinc-300 font-medium shrink-0">
                            {food.brand}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 flex flex-wrap items-center gap-1.5 leading-tight">
                        <span className="text-zinc-400">{food.defaultPortion}</span>
                        <span className="text-zinc-600">•</span>
                        <span className="font-mono text-zinc-300 whitespace-nowrap">
                          {formatMacro(food.protein)}g P · {formatMacro(food.carbs)}g C · {formatMacro(food.fat)}g F
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                    <span className="font-extrabold text-sm sm:text-base text-white font-mono whitespace-nowrap">
                      {safeMacro(Math.round(food.calories))} kcal
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetail(food);
                      }}
                      className="btn-circle-cta-white w-9 h-9 sm:w-10 sm:h-10 shadow-[0_4px_16px_rgba(255,255,255,0.2)]"
                      title="Add food (adjust portion)"
                    >
                      <Plus size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredFoods.length === 0 && (
              <div className="py-12 text-center flex flex-col items-center justify-center text-zinc-400">
                <Search size={32} className="text-zinc-600 mb-2" />
                <p className="text-sm font-semibold text-white">No food found for "{searchQuery}"</p>
                {onNavigateToCreateFood && (
                  <button
                    type="button"
                    onClick={onNavigateToCreateFood}
                    className="btn-pill-primary mt-4 px-5 py-2 text-xs font-black cursor-pointer"
                  >
                    Create Custom Food
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY FOODS */}
        {activeTab === 'my-foods' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1 px-1">
              <span className="text-[11px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookmarkCheck size={13} className="text-white" />
                My Custom Foods ({customFoods.length})
              </span>
            </div>

            {customFoods.length > 0 ? (
              <div className="max-w-4xl mx-auto space-y-2.5">
                {customFoods.map((food) => (
                  <div
                    key={food.id}
                    onClick={() => handleOpenDetail(food)}
                    className="group p-3.5 sm:p-4 rounded-[22px] bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,transparent_6%)] bg-[#000000] hover:bg-[#050508] border border-white/[0.08] border-t-white/[0.28] hover:border-white/[0.18] hover:border-t-white/[0.45] shadow-[0_8px_20px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.25)] flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] card-fintech-interactive min-h-[58px]"
                  >
                    <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 pr-2">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 bg-black shrink-0 shadow-md">
                        <img
                          src={food.imageUrl || getFoodImage(food.name)}
                          alt={food.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = FALLBACK_FOOD_IMAGE;
                          }}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm sm:text-base text-white tracking-tight truncate">
                            {food.name}
                          </h4>
                        </div>
                        <div className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
                          {food.brand ? `${food.brand}, ${food.defaultPortion}` : food.defaultPortion}
                          <span className="text-zinc-500 mx-1">•</span>
                          P:{formatMacro(food.protein)}g C:{formatMacro(food.carbs)}g F:{formatMacro(food.fat)}g
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                      <span className="font-bold text-xs sm:text-base text-white font-mono mr-1">
                        {safeMacro(Math.round(food.calories))} kcal
                      </span>

                      {onEditFood && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditFood(food);
                          }}
                          className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                          title="Edit custom food"
                        >
                          <Pencil size={14} />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleDeleteCustomFood(food.id, e)}
                        className="w-8 h-8 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                        title="Delete custom food"
                      >
                        <Trash2 size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(food);
                        }}
                        className="btn-circle-cta-white w-9 h-9 sm:w-10 sm:h-10 shadow-[0_4px_16px_rgba(255,255,255,0.2)]"
                        title="Add food (adjust portion)"
                      >
                        <Plus size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 px-4 rounded-3xl bg-gradient-to-b from-white/[0.06] via-[#090a0e] to-[#040406] border border-white/[0.08] flex flex-col items-center justify-center text-center shadow-lg">
                <BookmarkCheck size={32} className="text-zinc-500 mb-2" />
                <h4 className="text-sm font-bold text-white">No custom foods yet</h4>
                {onNavigateToCreateFood && (
                  <button
                    type="button"
                    onClick={onNavigateToCreateFood}
                    className="btn-pill-primary mt-4 px-5 py-2 text-xs"
                  >
                    Create Your First Food
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MY MEALS / PRESET COMBOS */}
        {activeTab === 'my-meals' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1 px-1">
              <span className="text-[11px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers size={13} className="text-white" />
                Saved Meals & Combos ({PRESET_COMBOS.length})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {PRESET_COMBOS.map((combo) => (
                <div
                  key={combo.id}
                  className="p-3.5 sm:p-4.5 rounded-[24px] bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,transparent_6%)] bg-[#000000] hover:bg-[#050508] border border-white/[0.08] border-t-white/[0.28] hover:border-white/[0.18] hover:border-t-white/[0.45] flex items-center justify-between gap-3 shadow-[0_10px_24px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.25)] card-fintech-interactive"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm sm:text-base text-white tracking-tight">
                      {combo.name}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5 line-clamp-1">
                      {combo.description}
                    </p>
                    <div className="text-[10px] sm:text-[11px] text-zinc-400 font-mono mt-0.5">
                      {combo.protein}g P · {combo.carbs}g C · {combo.fat}g F
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <span className="font-extrabold text-xs sm:text-base text-white font-mono">
                      {combo.calories} kcal
                    </span>
                    <button
                      type="button"
                      onClick={() => handleLogCombo(combo)}
                      className="btn-pill-primary px-4 py-2 text-xs min-h-[36px] font-black cursor-pointer shadow-[0_2px_14px_rgba(255,255,255,0.2)]"
                    >
                      <Plus size={13} strokeWidth={2.5} /> Log
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: QUICK ADD */}
        {activeTab === 'quick-add' && (
          <div className="card-fintech-hero max-w-2xl mx-auto w-full p-5 sm:p-7 rounded-[30px] space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-white/[0.08] border border-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                <Flame size={16} />
              </span>
              <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight">Quick Calorie Entry</h3>
            </div>

            <form onSubmit={handleQuickAddSubmit} className="space-y-4">
              {/* 1. Meal Category for Quick Add */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Log into Meal
                </label>
                <div className="grid grid-cols-4 p-1 rounded-2xl bg-white/[0.04] border border-white/10 gap-1">
                  {MEAL_CATEGORY_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = quickCategory === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setQuickCategory(opt.id)}
                        className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-white text-black font-bold shadow-md scale-[1.02]'
                            : 'text-zinc-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon size={16} strokeWidth={isSelected ? 2.5 : 2} className={isSelected ? 'text-black' : 'text-zinc-400'} />
                        <span className="text-[11px] truncate">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Date & Time for Quick Add */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-zinc-300" />
                    <span>Date & Time</span>
                  </span>
                  {quickTime ? (
                    <button
                      type="button"
                      onClick={() => setQuickTime('')}
                      className="text-[10px] text-zinc-500 hover:text-zinc-300 font-mono transition-colors cursor-pointer"
                    >
                      Clear Time
                    </button>
                  ) : (
                    <span className="text-[10px] text-zinc-500 font-mono">
                      Time is optional
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Date Picker */}
                  <div className="relative flex items-center">
                    <Calendar size={14} className="absolute left-3 text-zinc-400 pointer-events-none" />
                    <input
                      type="date"
                      value={quickDate}
                      onChange={(e) => setQuickDate(e.target.value)}
                      className="w-full pl-9 pr-2.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-white/30 transition-all cursor-pointer [color-scheme:dark]"
                    />
                  </div>

                  {/* Time Picker */}
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1 flex items-center">
                      <Clock size={14} className="absolute left-3 text-zinc-400 pointer-events-none" />
                      <input
                        type="time"
                        value={quickTime}
                        onChange={(e) => setQuickTime(e.target.value)}
                        placeholder="--:--"
                        className="w-full pl-9 pr-2 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-white/30 transition-all cursor-pointer [color-scheme:dark]"
                      />
                      {quickTime && (
                        <button
                          type="button"
                          onClick={() => setQuickTime('')}
                          className="absolute right-2 text-zinc-400 hover:text-white p-0.5 cursor-pointer"
                          title="Clear time"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setQuickTime(getNowTimeHHMM())}
                      className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-xs font-semibold cursor-pointer transition-all active:scale-95 shrink-0"
                      title="Set to Current Time"
                    >
                      Now
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Item Label (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Street Snack, Party Drink"
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Calories (kcal) <span className="text-white">*</span>
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 350"
                  value={quickCalories}
                  onChange={(e) => setQuickCalories(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm font-mono font-bold focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1 font-mono">Protein (g)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={quickProtein}
                    onChange={(e) => setQuickProtein(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1 font-mono">Carbs (g)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={quickCarbs}
                    onChange={(e) => setQuickCarbs(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1 font-mono">Fat (g)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={quickFat}
                    onChange={(e) => setQuickFat(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!quickCalories || Number(quickCalories) <= 0}
                className="btn-pill-primary w-full mt-2 py-3.5 text-xs sm:text-sm font-bold disabled:opacity-40 cursor-pointer shadow-[0_4px_18px_rgba(255,255,255,0.2)]"
              >
                Log Calories to {quickCategory.charAt(0).toUpperCase() + quickCategory.slice(1)}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ----------------- ULTRA-MINIMAL, CLUTTER-FREE PORTION & MEAL MODAL ----------------- */}
      {selectedFood && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in"
          onClick={() => setSelectedFood(null)}
        >
          <div
            className="w-full max-w-md rounded-[36px] bg-[radial-gradient(ellipse_65%_45%_at_50%_-5%,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.06)_25%,transparent_75%)] bg-[#050506] border border-white/[0.14] border-t-white/[0.48] p-5 sm:p-6 shadow-[0_24px_80px_rgba(0,0,0,0.98),inset_0_1.5px_0.5px_rgba(255,255,255,0.50)] text-white space-y-4 max-h-[92vh] overflow-y-auto no-scrollbar animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Minimal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 bg-black shrink-0 shadow-md">
                  <img
                    src={selectedFood.imageUrl || getFoodImage(selectedFood.name)}
                    alt={selectedFood.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = FALLBACK_FOOD_IMAGE;
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-base sm:text-lg text-white tracking-tight truncate">
                    {selectedFood.name}
                  </h3>
                  {selectedFood.description ? (
                    <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {selectedFood.description}
                    </p>
                  ) : selectedFood.brand ? (
                    <p className="text-xs text-zinc-400 mt-0.5 truncate">
                      {selectedFood.brand}
                    </p>
                  ) : null}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedFood(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* 1. MEAL CATEGORY SELECTOR (Breakfast, Lunch, Dinner, Snack) */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Log into Meal
              </label>
              <div className="grid grid-cols-4 p-1.5 rounded-2xl bg-black/70 border border-white/10 gap-1 shadow-inner">
                {MEAL_CATEGORY_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = modalCategory === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setModalCategory(opt.id)}
                      className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-white text-black font-black shadow-[0_2px_14px_rgba(255,255,255,0.25)] scale-[1.02]'
                          : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                      }`}
                    >
                      <Icon size={16} strokeWidth={isSelected ? 2.5 : 2} className={isSelected ? 'text-black' : 'text-zinc-400'} />
                      <span className="text-[11px] tracking-tight">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. DATE & TIME PICKER */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Calendar size={12} className="text-zinc-300" />
                  <span>Date & Time</span>
                </span>
                {modalTime ? (
                  <button
                    type="button"
                    onClick={() => setModalTime('')}
                    className="text-[10px] text-zinc-500 hover:text-zinc-300 font-mono transition-colors cursor-pointer"
                  >
                    Clear Time
                  </button>
                ) : (
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Time is optional
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Date Picker */}
                <div className="relative flex items-center">
                  <Calendar size={14} className="absolute left-3 text-zinc-400 pointer-events-none" />
                  <input
                    type="date"
                    value={modalDate}
                    onChange={(e) => setModalDate(e.target.value)}
                    className="w-full pl-9 pr-2.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-white/30 transition-all cursor-pointer [color-scheme:dark]"
                  />
                </div>

                {/* Time Picker */}
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1 flex items-center">
                    <Clock size={14} className="absolute left-3 text-zinc-400 pointer-events-none" />
                    <input
                      type="time"
                      value={modalTime}
                      onChange={(e) => setModalTime(e.target.value)}
                      placeholder="--:--"
                      className="w-full pl-9 pr-2 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-white/30 transition-all cursor-pointer [color-scheme:dark]"
                    />
                    {modalTime && (
                      <button
                        type="button"
                        onClick={() => setModalTime('')}
                        className="absolute right-2 text-zinc-400 hover:text-white p-0.5 cursor-pointer"
                        title="Clear time"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setModalTime(getNowTimeHHMM())}
                    className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-xs font-semibold cursor-pointer transition-all active:scale-95 shrink-0"
                    title="Set to Current Time"
                  >
                    Now
                  </button>
                </div>
              </div>
            </div>

            {/* 3. SERVING UNIT TOGGLE (If countable unit with weight) */}
            {baseWeight && baseUnit !== 'g' && baseUnit !== 'ml' && (
              <div className="flex p-1 rounded-full bg-white/5 border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setDetailMode('unit')}
                  className={`flex-1 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
                    detailMode === 'unit'
                      ? 'bg-white text-black shadow-sm font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {baseUnit.charAt(0).toUpperCase() + baseUnit.slice(1)}
                </button>
                <button
                  type="button"
                  onClick={() => setDetailMode('weight')}
                  className={`flex-1 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
                    detailMode === 'weight'
                      ? 'bg-white text-black shadow-sm font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {equivUnit === 'ml' ? 'Milliliters (ml)' : 'Grams (g)'}
                </button>
              </div>
            )}

            {/* 4. QUANTITY STEPPER & PRESET CHIPS */}
            {detailMode === 'unit' ? (
              <div className="space-y-3 py-1 bg-white/[0.02] border border-white/5 rounded-2xl p-3">
                {/* Stepper */}
                <div className="flex items-center justify-between px-2">
                  <button
                    type="button"
                    onClick={() => setServingQty((prev) => Math.max(0.25, Number((prev - (prev > 1 ? 0.5 : 0.25)).toFixed(2))))}
                    className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/15 active:scale-95 flex items-center justify-center text-white cursor-pointer transition-all border border-white/10"
                  >
                    <Minus size={20} />
                  </button>

                  <div className="text-center">
                    <div className="flex items-baseline justify-center gap-1.5">
                      <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
                        {servingQty}
                      </span>
                      <span className="text-sm font-medium text-zinc-400">
                        {baseUnit}{servingQty > 1 && !baseUnit.endsWith('s') && baseUnit !== 'roti' ? 's' : ''}
                      </span>
                    </div>
                    {baseWeight && (
                      <span className="text-xs text-zinc-500 font-mono mt-0.5 block">
                        ≈ {Math.round(servingQty * baseWeight)}{equivUnit}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setServingQty((prev) => Number((prev + (prev >= 1 ? 0.5 : 0.25)).toFixed(2)))}
                    className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/15 active:scale-95 flex items-center justify-center text-white cursor-pointer transition-all border border-white/10"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 py-1 bg-white/[0.02] border border-white/5 rounded-2xl p-3">
                {/* Stepper with Weight/Volume */}
                <div className="flex items-center justify-between px-2">
                  <button
                    type="button"
                    onClick={() => {
                      const step = equivUnit === 'ml' ? 25 : 10;
                      setDetailWeightInput((prev) => String(Math.max(step, (Number(prev) || 100) - step)));
                    }}
                    className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/15 active:scale-95 flex items-center justify-center text-white cursor-pointer transition-all border border-white/10"
                  >
                    <Minus size={20} />
                  </button>

                  <div className="text-center">
                    <div className="flex items-baseline justify-center gap-1">
                      <input
                        type="number"
                        min="1"
                        value={detailWeightInput}
                        onChange={(e) => setDetailWeightInput(e.target.value)}
                        className="w-24 text-center bg-transparent text-3xl sm:text-4xl font-extrabold text-white tracking-tight focus:outline-none border-b border-white/20 focus:border-white font-mono"
                      />
                      <span className="text-sm font-medium text-zinc-400 font-mono">
                        {equivUnit}
                      </span>
                    </div>
                    {baseWeight && (
                      <span className="text-xs text-zinc-500 font-mono mt-0.5 block">
                        ≈ {Number((Number(detailWeightInput) / baseWeight).toFixed(1))} {baseUnit}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const step = equivUnit === 'ml' ? 25 : 10;
                      setDetailWeightInput((prev) => String((Number(prev) || 100) + step));
                    }}
                    className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/15 active:scale-95 flex items-center justify-center text-white cursor-pointer transition-all border border-white/10"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                {/* Quick Weight Chips */}
                <div className="flex items-center justify-center gap-1.5 pt-1">
                  {(equivUnit === 'ml' ? ['100', '200', '250', '350', '500'] : ['50', '100', '150', '200', '250']).map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setDetailWeightInput(val)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer font-mono ${
                        detailWeightInput === val
                          ? 'bg-white text-black font-bold shadow-sm'
                          : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5'
                      }`}
                    >
                      {val}{equivUnit}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 5. NUTRIENTS LIVE BREAKDOWN ROW */}
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-white text-sm font-mono">
                <Flame size={16} className="text-white" />
                <span>{detailKcal} kcal</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-400 font-mono text-[11px]">
                <span><strong className="text-white font-semibold">{detailProtein}g</strong> Protein</span>
                <span><strong className="text-white font-semibold">{detailCarbs}g</strong> Carbs</span>
                <span><strong className="text-white font-semibold">{detailFat}g</strong> Fat</span>
              </div>
            </div>

            {/* 6. PRIMARY CTA BUTTON */}
            <button
              type="button"
              onClick={handleConfirmLogFromDetail}
              className="btn-pill-primary w-full py-4 text-sm font-black shadow-[0_4px_22px_rgba(255,255,255,0.25)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check size={18} strokeWidth={2.5} />
              <span>
                Add to {modalCategory.charAt(0).toUpperCase() + modalCategory.slice(1)} • {detailKcal} kcal
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-white text-black text-xs font-bold shadow-2xl animate-bounce">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
