import React, { useState } from 'react';
import { X, Search, Plus } from 'lucide-react';
import type { MealCategory, FoodLibraryItem, MealItem } from '../types';
import { FOOD_DATABASE } from '../data/initialData';
import { PillBadge } from './PillBadge';
import { getFoodImage, FALLBACK_FOOD_IMAGE } from '../utils/foodImages';

interface LogMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: MealCategory;
  onAddMeal: (meal: Omit<MealItem, 'id' | 'timestamp'>) => void;
  theme: 'emerald' | 'obsidian' | 'pure-black';
}

export const LogMealModal: React.FC<LogMealModalProps> = ({
  isOpen,
  onClose,
  defaultCategory = 'lunch',
  onAddMeal,
  theme: _theme,
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'custom'>('catalog');
  const [category, setCategory] = useState<MealCategory>(defaultCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [portionMultiplier, setPortionMultiplier] = useState<number>(1);

  // Custom food inputs
  const [customName, setCustomName] = useState('');
  const [customKcal, setCustomKcal] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [customPortion, setCustomPortion] = useState('1 serving');
  const [customTag, setCustomTag] = useState('fast');

  if (!isOpen) return null;

  // Filter food database
  const filteredFoods = FOOD_DATABASE.filter((food) => {
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag ? food.tagId === selectedTag : true;
    return matchesSearch && matchesTag;
  });

  const handleSelectFood = (food: FoodLibraryItem) => {
    onAddMeal({
      name: food.name,
      calories: Math.round(food.calories * portionMultiplier),
      protein: Math.round(food.protein * portionMultiplier),
      carbs: Math.round(food.carbs * portionMultiplier),
      fat: Math.round(food.fat * portionMultiplier),
      portion: portionMultiplier === 1 ? food.defaultPortion : `${portionMultiplier}x (${food.defaultPortion})`,
      category: category,
      tagId: food.tagId,
      imageUrl: food.imageUrl || getFoodImage(food.name),
    });
    onClose();
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName || !customKcal) return;

    onAddMeal({
      name: customName,
      calories: Number(customKcal) || 0,
      protein: Number(customProtein) || 0,
      carbs: Number(customCarbs) || 0,
      fat: Number(customFat) || 0,
      portion: customPortion || '1 serving',
      category: category,
      tagId: customTag,
      imageUrl: getFoodImage(customName),
    });

    // Reset and close
    setCustomName('');
    setCustomKcal('');
    setCustomProtein('');
    setCustomCarbs('');
    setCustomFat('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border bg-[#14151C] border-white/10 text-white transition-all"
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold tracking-tight">Log Food & Fuel</h3>
            <p className="text-xs text-white/70 mt-0.5">
              Select from food database or enter custom nutrition
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Category Pill Switcher & Tabs */}
        <div className="p-4 bg-black/20 flex flex-col gap-3">
          {/* Target Meal Category */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(['breakfast', 'lunch', 'dinner', 'snack'] as MealCategory[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all cursor-pointer ${
                  category === cat
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'bg-white/10 hover:bg-white/20 text-white/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Catalog vs Custom Tab */}
          <div className="grid grid-cols-2 p-1 bg-white/10 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-white text-zinc-900 shadow'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Food Database
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('custom')}
              className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'custom'
                  ? 'bg-white text-zinc-900 shadow'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              + Custom Food
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {activeTab === 'catalog' ? (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50"
                />
                <input
                  type="text"
                  placeholder="Search avocado, chicken bowl, shake..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/30 border border-white/15 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/40"
                />
              </div>

              {/* Tag filters from Reference 5 */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                <button
                  type="button"
                  onClick={() => setSelectedTag(null)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    selectedTag === null
                      ? 'bg-white text-zinc-900'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  All
                </button>
                {['fast', 'finance', 'simple', 'digital', 'secure', 'fluid'].map((tid) => (
                  <PillBadge
                    key={tid}
                    tagId={tid}
                    size="sm"
                    isSelected={selectedTag === tid}
                    onClick={() => setSelectedTag(selectedTag === tid ? null : tid)}
                  />
                ))}
              </div>

              {/* Portion Multiplier */}
              <div className="flex items-center justify-between text-xs font-medium px-1">
                <span className="text-white/70">Portion Serving:</span>
                <div className="flex items-center gap-1.5">
                  {[0.5, 1, 1.5, 2].map((mult) => (
                    <button
                      key={mult}
                      type="button"
                      onClick={() => setPortionMultiplier(mult)}
                      className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                        portionMultiplier === mult
                          ? 'bg-amber-400 text-zinc-950'
                          : 'bg-white/10 text-white/80 hover:bg-white/20'
                      }`}
                    >
                      {mult}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Food Items List */}
              <div className="space-y-2 mt-2">
                {filteredFoods.map((food) => {
                  const scaledKcal = Math.round(food.calories * portionMultiplier);
                  const scaledProtein = Math.round(food.protein * portionMultiplier);
                  const scaledCarbs = Math.round(food.carbs * portionMultiplier);
                  const scaledFat = Math.round(food.fat * portionMultiplier);

                  return (
                    <div
                      key={food.id}
                      onClick={() => handleSelectFood(food)}
                      className="group p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-between cursor-pointer transition-all active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Circular Food Image */}
                        <div className="w-11 h-11 rounded-full overflow-hidden border border-white/20 shrink-0 bg-black/40">
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
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm tracking-tight text-white truncate">
                              {food.name}
                            </span>
                            <PillBadge tagId={food.tagId} size="sm" />
                          </div>
                          <div className="text-xs text-white/70 mt-0.5">
                            {food.defaultPortion} • P:{scaledProtein}g C:{scaledCarbs}g F:{scaledFat}g
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-sm text-amber-300">
                          {scaledKcal} kcal
                        </span>
                        <div className="w-8 h-8 rounded-full bg-white text-zinc-900 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                          <Plus size={16} />
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredFoods.length === 0 && (
                  <div className="py-8 text-center text-white/60 text-sm">
                    No matching foods found. Try adding a custom food item!
                  </div>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateCustom} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1">
                  Food Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grilled Chicken Wrap"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-black/30 border border-white/15 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1">
                    Calories (kcal)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 450"
                    value={customKcal}
                    onChange={(e) => setCustomKcal(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-black/30 border border-white/15 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1">
                    Portion
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1 bowl (300g)"
                    value={customPortion}
                    onChange={(e) => setCustomPortion(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-black/30 border border-white/15 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    placeholder="35"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/15 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    placeholder="40"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/15 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1">
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    placeholder="12"
                    value={customFat}
                    onChange={(e) => setCustomFat(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/15 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1.5">
                  Badge Tag
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {['fast', 'finance', 'simple', 'digital', 'secure', 'fluid'].map((tid) => (
                    <PillBadge
                      key={tid}
                      tagId={tid}
                      size="sm"
                      isSelected={customTag === tid}
                      onClick={() => setCustomTag(tid)}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl font-bold bg-white text-zinc-950 shadow-lg hover:bg-white/95 transition-all active:scale-[0.98] cursor-pointer"
                >
                  Save & Log Meal
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
