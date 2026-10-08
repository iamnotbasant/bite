import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Upload, Trash2, X, ArrowRight } from 'lucide-react';
import type { MealCategory, FoodLibraryItem, MealItem } from '../types';
import { getFoodImage, FALLBACK_FOOD_IMAGE } from '../utils/foodImages';
import { addCustomFood, updateCustomFood } from '../utils/storage';
import { loadServingUnits, type ServingUnitConfig } from '../utils/servingUnits';

// Helper to compress local uploaded image via canvas before storing to avoid localStorage limits
const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 400; // 400px ensures crisp resolution for food avatars
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          resolve(readerEvent.target?.result as string);
        }
      };
      img.onerror = reject;
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export interface CreateFoodViewProps {
  onBack: () => void;
  defaultCategory?: MealCategory;
  onAddMeal?: (meal: Omit<MealItem, 'id' | 'timestamp'>) => void;
  onSuccess?: () => void;
  initialFood?: FoodLibraryItem | null;
  isEditing?: boolean;
}

export const CreateFoodView: React.FC<CreateFoodViewProps> = ({
  onBack,
  defaultCategory = 'lunch',
  onSuccess,
  initialFood = null,
  isEditing = false,
}) => {
  const navigate = useNavigate();
  // Page 1: Details & Serving | Page 2: Nutrition Facts
  const [currentPage, setCurrentPage] = useState<1 | 2>(1);
  const category = initialFood?.category || defaultCategory;

  // Dynamic Serving Units from Settings / LocalStorage
  const [servingUnits, setServingUnits] = useState<ServingUnitConfig[]>(() => loadServingUnits());

  useEffect(() => {
    const handler = () => {
      setServingUnits(loadServingUnits());
    };
    window.addEventListener('fuel-serving-units-changed', handler);
    return () => window.removeEventListener('fuel-serving-units-changed', handler);
  }, []);

  // Page 1: Basic Info & Servings
  const [foodName, setFoodName] = useState(initialFood?.name || '');
  const [foodDescription, setFoodDescription] = useState(initialFood?.description || '');
  const [servingSizeQty, setServingSizeQty] = useState(initialFood?.servingSizeQty ? String(initialFood.servingSizeQty) : '1');
  const [servingSizeUnit, setServingSizeUnit] = useState(initialFood?.servingSizeUnit || 'roti');
  const [servingWeightGrams, setServingWeightGrams] = useState(initialFood?.servingWeightGrams ? String(initialFood.servingWeightGrams) : '100');
  const [equivalentUnit, setEquivalentUnit] = useState<'g' | 'ml'>((initialFood?.servingEquivalentUnit as 'g' | 'ml') || 'g');
  const [servingsPerContainer, setServingsPerContainer] = useState(initialFood?.servingsPerContainer ? String(initialFood.servingsPerContainer) : '1');

  // Custom Image State: Local Upload or Image URL
  const [customImage, setCustomImage] = useState(initialFood?.imageUrl || '');
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file');
      return;
    }

    try {
      setIsUploading(true);
      const dataUrl = await compressImageFile(file);
      setCustomImage(dataUrl);
      showToast('✓ Image uploaded from device');
    } catch (err) {
      console.error('Error loading image', err);
      showToast('Could not load image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Page 2: Full Nutrition Facts List (Exact match to reference)
  const [calories, setCalories] = useState(initialFood?.calories ? String(initialFood.calories) : '');
  const [totalFat, setTotalFat] = useState(initialFood?.fat !== undefined ? String(initialFood.fat) : '');
  const [saturatedFat, setSaturatedFat] = useState(initialFood?.saturatedFat !== undefined ? String(initialFood.saturatedFat) : '');
  const [transFat, setTransFat] = useState(initialFood?.transFat !== undefined ? String(initialFood.transFat) : '');
  const [polyFat, setPolyFat] = useState(initialFood?.polyunsaturatedFat !== undefined ? String(initialFood.polyunsaturatedFat) : '');
  const [monoFat, setMonoFat] = useState(initialFood?.monounsaturatedFat !== undefined ? String(initialFood.monounsaturatedFat) : '');
  const [cholesterol, setCholesterol] = useState(initialFood?.cholesterol !== undefined ? String(initialFood.cholesterol) : '');
  const [sodium, setSodium] = useState(initialFood?.sodium !== undefined ? String(initialFood.sodium) : '');
  const [carbs, setCarbs] = useState(initialFood?.carbs !== undefined ? String(initialFood.carbs) : '');
  const [fiber, setFiber] = useState(initialFood?.fiber !== undefined ? String(initialFood.fiber) : '');
  const [sugars, setSugars] = useState(initialFood?.sugar !== undefined ? String(initialFood.sugar) : '');
  const [protein, setProtein] = useState(initialFood?.protein !== undefined ? String(initialFood.protein) : '');
  const [calcium, setCalcium] = useState(initialFood?.calcium !== undefined ? String(initialFood.calcium) : '');
  const [iron, setIron] = useState(initialFood?.iron !== undefined ? String(initialFood.iron) : '');
  const [potassium, setPotassium] = useState(initialFood?.potassium !== undefined ? String(initialFood.potassium) : '');
  const [vitaminA, setVitaminA] = useState(initialFood?.vitaminA !== undefined ? String(initialFood.vitaminA) : '');
  const [vitaminC, setVitaminC] = useState(initialFood?.vitaminC !== undefined ? String(initialFood.vitaminC) : '');

  // Missing Nutrient Prompt Dialog (matching reference)
  const [showNutrientPrompt, setShowNutrientPrompt] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  const handleNext = () => {
    if (!foodName.trim()) {
      showToast('Please enter a Food Name');
      return;
    }
    setCurrentPage(2);
  };

  const handleAttemptSave = () => {
    const kcal = Number(calories);
    if (!kcal || kcal <= 0) {
      showToast('Calories is required');
      return;
    }

    const p = Number(protein) || 0;
    const c = Number(carbs) || 0;
    const f = Number(totalFat) || 0;

    // If only calories is filled and all macros are 0, prompt user like reference app
    if (p === 0 && c === 0 && f === 0) {
      setShowNutrientPrompt(true);
      return;
    }

    executeSave();
  };

  const executeSave = () => {
    const p = Math.max(0, Number(protein) || 0);
    const c = Math.max(0, Number(carbs) || 0);
    const f = Math.max(0, Number(totalFat) || 0);
    const kcal = Math.max(0, Number(calories) || Math.round(p * 4 + c * 4 + f * 9) || 0);

    const qty = Number(servingSizeQty) || 1;
    const unit = servingSizeUnit.trim() || 'serving';
    const wt = Number(servingWeightGrams) || 100;
    const eqUnit = equivalentUnit;
    const perContainer = Number(servingsPerContainer) || 1;

    const portionText =
      unit === 'g' || unit === 'ml'
        ? `${qty}${unit}`
        : `${qty} ${unit} (${wt}${eqUnit})`;

    if (isEditing && initialFood) {
      updateCustomFood({
        ...initialFood,
        name: foodName.trim(),
        description: foodDescription.trim() || undefined,
        calories: kcal,
        protein: p,
        carbs: c,
        fat: f,
        saturatedFat: Number(saturatedFat) || undefined,
        transFat: Number(transFat) || undefined,
        polyunsaturatedFat: Number(polyFat) || undefined,
        monounsaturatedFat: Number(monoFat) || undefined,
        cholesterol: Number(cholesterol) || undefined,
        sodium: Number(sodium) || undefined,
        fiber: Number(fiber) || undefined,
        sugar: Number(sugars) || undefined,
        calcium: Number(calcium) || undefined,
        iron: Number(iron) || undefined,
        potassium: Number(potassium) || undefined,
        vitaminA: Number(vitaminA) || undefined,
        vitaminC: Number(vitaminC) || undefined,
        servingSizeQty: qty,
        servingSizeUnit: unit,
        servingWeightGrams: wt,
        servingEquivalentUnit: eqUnit,
        servingsPerContainer: perContainer,
        defaultPortion: portionText,
        category,
        imageUrl: customImage.trim() || initialFood.imageUrl || getFoodImage(foodName.trim()),
      });
      setShowNutrientPrompt(false);
      showToast(`✓ Updated "${foodName.trim()}"`);
    } else {
      const created: FoodLibraryItem = addCustomFood({
        name: foodName.trim(),
        description: foodDescription.trim() || undefined,
        calories: kcal,
        protein: p,
        carbs: c,
        fat: f,
        saturatedFat: Number(saturatedFat) || undefined,
        transFat: Number(transFat) || undefined,
        polyunsaturatedFat: Number(polyFat) || undefined,
        monounsaturatedFat: Number(monoFat) || undefined,
        cholesterol: Number(cholesterol) || undefined,
        sodium: Number(sodium) || undefined,
        fiber: Number(fiber) || undefined,
        sugar: Number(sugars) || undefined,
        calcium: Number(calcium) || undefined,
        iron: Number(iron) || undefined,
        potassium: Number(potassium) || undefined,
        vitaminA: Number(vitaminA) || undefined,
        vitaminC: Number(vitaminC) || undefined,
        servingSizeQty: qty,
        servingSizeUnit: unit,
        servingWeightGrams: wt,
        servingEquivalentUnit: eqUnit,
        servingsPerContainer: perContainer,
        defaultPortion: portionText,
        category,
        tagId: 'fast',
        imageUrl: customImage.trim() || getFoodImage(foodName.trim()),
      });

      setShowNutrientPrompt(false);
      showToast(`✓ Saved "${created.name}" to My Foods`);
    }

    setTimeout(() => {
      onSuccess?.();
    }, 400);
  };

  // 17 Nutrition Facts Rows matching reference screenshot exactly
  const NUTRIENT_ROWS = [
    { id: 'calories', label: 'Calories', value: calories, setter: setCalories, required: true },
    { id: 'totalFat', label: 'Total Fat ( g )', value: totalFat, setter: setTotalFat, required: false },
    { id: 'saturatedFat', label: 'Saturated Fat ( g )', value: saturatedFat, setter: setSaturatedFat, required: false },
    { id: 'transFat', label: 'Trans Fat ( g )', value: transFat, setter: setTransFat, required: false },
    { id: 'polyFat', label: 'Polyunsaturated Fat ( g )', value: polyFat, setter: setPolyFat, required: false },
    { id: 'monoFat', label: 'Monounsaturated Fat ( g )', value: monoFat, setter: setMonoFat, required: false },
    { id: 'cholesterol', label: 'Cholesterol ( mg )', value: cholesterol, setter: setCholesterol, required: false },
    { id: 'sodium', label: 'Sodium ( mg )', value: sodium, setter: setSodium, required: false },
    { id: 'carbs', label: 'Total Carbohydrates ( g )', value: carbs, setter: setCarbs, required: false },
    { id: 'fiber', label: 'Dietary Fibers ( g )', value: fiber, setter: setFiber, required: false },
    { id: 'sugars', label: 'Sugars ( g )', value: sugars, setter: setSugars, required: false },
    { id: 'protein', label: 'Protein ( g )', value: protein, setter: setProtein, required: false },
    { id: 'calcium', label: 'Calcium ( % )', value: calcium, setter: setCalcium, required: false },
    { id: 'iron', label: 'Iron ( % )', value: iron, setter: setIron, required: false },
    { id: 'potassium', label: 'Potassium ( mg )', value: potassium, setter: setPotassium, required: false },
    { id: 'vitaminA', label: 'Vitamin A ( % )', value: vitaminA, setter: setVitaminA, required: false },
    { id: 'vitaminC', label: 'Vitamin C ( % )', value: vitaminC, setter: setVitaminC, required: false },
  ];

  return (
    <div className="w-full flex flex-col min-h-[85vh] select-none bg-black text-white">
      {/* ----------------- TOP NAVBAR (Mobile Only) ----------------- */}
      <div className="lg:hidden border border-white/[0.12] border-t-white/[0.45] bg-[radial-gradient(ellipse_65%_45%_at_50%_-5%,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.05)_25%,transparent_70%)] bg-[#050506] shadow-[0_20px_48px_rgba(0,0,0,0.95),inset_0_1.2px_0.5px_rgba(255,255,255,0.50)] rounded-2xl sm:rounded-3xl mb-4 sticky top-0 z-40">
        <div className="max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={currentPage === 2 ? () => setCurrentPage(1) : onBack}
              className="w-9 h-9 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 flex items-center justify-center text-white transition-all active:scale-95 cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.18)]"
              title="Go back"
            >
              <ArrowLeft size={16} />
            </button>

            <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
              Create Food
            </h2>
          </div>

          {/* Top Right Action: Next on Page 1, Save on Page 2 */}
          {currentPage === 1 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!foodName.trim()}
              className="btn-pill-lime px-4 py-1.5 text-xs min-h-[36px]"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAttemptSave}
              disabled={!calories || Number(calories) <= 0}
              className="btn-pill-lime px-4 py-1.5 text-xs min-h-[36px]"
            >
              Save
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ----------------- PAGE 1: FOOD DETAILS & SERVINGS ----------------------- */}
      {/* ========================================================================= */}
      {currentPage === 1 && (
        <div className="flex-1 max-w-5xl xl:max-w-6xl mx-auto w-full px-4 sm:px-6 py-4 space-y-6 animate-fade-in pb-32">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Section: New Food */}
            <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-300 tracking-wide uppercase">
              New Food
            </h3>

            {/* Food Name (Required) */}
            <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[radial-gradient(ellipse_65%_45%_at_50%_-5%,rgba(255,255,255,0.20)_0%,rgba(255,255,255,0.04)_25%,transparent_70%)] bg-[#050506] border border-white/[0.10] border-t-white/[0.38] shadow-[0_12px_28px_rgba(0,0,0,0.9),inset_0_1.2px_0.5px_rgba(255,255,255,0.40)] space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-400">
                Food Name (Required)
              </label>
              <input
                type="text"
                placeholder="e.g. Whole Wheat Roti, Paneer Bhurji"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                className="w-full bg-black/60 rounded-xl px-3.5 py-2.5 border border-white/10 text-white text-base focus:outline-none focus:border-white/30 placeholder:text-zinc-600 font-medium"
                autoFocus
              />
            </div>

            {/* Notes / Description (Optional) */}
            <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[radial-gradient(ellipse_65%_45%_at_50%_-5%,rgba(255,255,255,0.20)_0%,rgba(255,255,255,0.04)_25%,transparent_70%)] bg-[#050506] border border-white/[0.10] border-t-white/[0.38] shadow-[0_12px_28px_rgba(0,0,0,0.9),inset_0_1.2px_0.5px_rgba(255,255,255,0.40)] space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-400">
                Notes / Description (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Homemade chapati without oil or ghee"
                value={foodDescription}
                onChange={(e) => setFoodDescription(e.target.value)}
                className="w-full bg-black/60 rounded-xl px-3.5 py-2.5 border border-white/10 text-white text-base focus:outline-none focus:border-white/30 placeholder:text-zinc-600 font-medium"
              />
            </div>

            {/* Food Image (Optional) - Local Upload OR URL */}
            <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[radial-gradient(ellipse_65%_45%_at_50%_-5%,rgba(255,255,255,0.20)_0%,rgba(255,255,255,0.04)_25%,transparent_70%)] bg-[#050506] border border-white/[0.10] border-t-white/[0.38] shadow-[0_12px_28px_rgba(0,0,0,0.9),inset_0_1.2px_0.5px_rgba(255,255,255,0.40)] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300">
                    Food Image (Optional)
                  </label>
                  <p className="text-[11px] text-zinc-500">
                    Upload from device or enter image URL
                  </p>
                </div>

                {/* Mode Switcher: Device File vs Image URL */}
                <div className="inline-flex self-start sm:self-auto p-0.5 rounded-lg bg-black/60 border border-white/10 text-xs shrink-0">
                  <button
                    type="button"
                    onClick={() => setImageInputMode('upload')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      imageInputMode === 'upload'
                        ? 'bg-white text-black shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageInputMode('url')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      imageInputMode === 'url'
                        ? 'bg-white text-black shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Image URL
                  </button>
                </div>
              </div>

              {/* Dish Preview & Upload Controls */}
              <div className="flex items-center gap-3.5 pt-1">
                {/* Circular Dish Plate Preview */}
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/20 bg-black shrink-0 shadow-lg group">
                  <img
                    src={customImage || getFoodImage(foodName)}
                    alt={foodName || 'Food preview'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = FALLBACK_FOOD_IMAGE;
                    }}
                  />
                  {customImage && (
                    <button
                      type="button"
                      onClick={() => setCustomImage('')}
                      className="absolute inset-0 bg-black/75 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-rose-400 cursor-pointer"
                      title="Remove custom image"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {/* Input control by mode */}
                <div className="flex-1 min-w-0">
                  {imageInputMode === 'upload' ? (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                        >
                          <Upload size={14} />
                          <span>
                            {isUploading
                              ? 'Loading...'
                              : customImage
                              ? 'Change Image'
                              : 'Choose from Device'}
                          </span>
                        </button>

                        {customImage && (
                          <button
                            type="button"
                            onClick={() => setCustomImage('')}
                            className="px-2.5 py-2 rounded-xl text-xs text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1">
                        Select a photo from local files or gallery
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="relative">
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/photo-..."
                          value={customImage}
                          onChange={(e) => setCustomImage(e.target.value)}
                          className="w-full px-3 py-2 pr-8 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-white/30 placeholder:text-zinc-600"
                        />
                        {customImage && (
                          <button
                            type="button"
                            onClick={() => setCustomImage('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white cursor-pointer"
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1">
                        Paste any public image link (Unsplash, Pexels, etc.)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Servings */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-300 tracking-wide uppercase">
                Servings
              </h3>
              <span className="text-xs text-zinc-500 font-mono">Weight & Volume</span>
            </div>

            {/* Quick Unit Presets */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-zinc-400">
                  Select Base Unit
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/settings')}
                  className="text-[11px] text-zinc-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-medium"
                  title="Edit or customize serving units in Settings"
                >
                  <span>Manage in Settings</span>
                  <ArrowRight size={12} />
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {servingUnits.map((p) => {
                  const isSelected = servingSizeUnit.toLowerCase() === p.label.toLowerCase();
                  return (
                    <button
                      key={p.id || p.label}
                      type="button"
                      onClick={() => {
                        setServingSizeUnit(p.label);
                        setServingSizeQty(p.defaultQty);
                        setServingWeightGrams(p.defaultEq);
                        setEquivalentUnit(p.eqUnit);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white text-black font-bold shadow-sm'
                          : 'bg-[#0e0e12] border border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Serving Size & Equivalent Measurement Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Card 1: Serving Size (Required) */}
              <div className="p-4 rounded-xl bg-[#06070a] border border-white/10 border-t-white/25 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-zinc-400">
                    Serving Size (Required)
                  </label>
                  <span className="text-[10px] text-zinc-500 font-mono">Qty & Unit</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 p-2 rounded-lg bg-black border border-white/10 focus-within:border-white/30">
                    <span className="block text-[9px] uppercase font-mono text-zinc-500">Qty</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      value={servingSizeQty}
                      onChange={(e) => {
                        setServingSizeQty(e.target.value);
                        if (servingSizeUnit === 'g' || servingSizeUnit === 'ml') {
                          setServingWeightGrams(e.target.value);
                        }
                      }}
                      className="w-full bg-transparent text-white font-mono font-bold text-base focus:outline-none"
                    />
                  </div>
                  <div className="flex-1 p-2 rounded-lg bg-black border border-white/10 focus-within:border-white/30">
                    <span className="block text-[9px] uppercase font-mono text-zinc-500">Unit</span>
                    <input
                      type="text"
                      value={servingSizeUnit}
                      onChange={(e) => {
                        const val = e.target.value;
                        setServingSizeUnit(val);
                        const lower = val.toLowerCase().trim();
                        if (lower === 'ml' || lower.includes('glass') || lower.includes('cup') || lower.includes('shake') || lower.includes('juice') || lower.includes('milk')) {
                          setEquivalentUnit('ml');
                        }
                      }}
                      placeholder="e.g. roti, glass"
                      className="w-full bg-transparent text-white text-base focus:outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Equivalent Measure (Weight in g or Volume in ml) */}
              <div className="p-4 rounded-xl bg-[#06070a] border border-white/10 border-t-white/25 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-zinc-400">
                    {equivalentUnit === 'ml' ? 'Equivalent Volume (ml)' : 'Equivalent Weight (grams)'}
                  </label>

                  {/* g vs ml Pill Toggle Switch */}
                  <div className="flex items-center p-0.5 rounded-lg bg-black border border-white/10 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setEquivalentUnit('g')}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        equivalentUnit === 'g'
                          ? 'bg-white text-black font-bold shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      g
                    </button>
                    <button
                      type="button"
                      onClick={() => setEquivalentUnit('ml')}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        equivalentUnit === 'ml'
                          ? 'bg-sky-400 text-black font-bold shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      ml
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={servingWeightGrams}
                    onChange={(e) => setServingWeightGrams(e.target.value)}
                    placeholder={equivalentUnit === 'ml' ? '250' : '100'}
                    className="w-full p-2.5 rounded-lg bg-black border border-white/10 text-white font-mono font-bold text-base focus:outline-none focus:border-white/30"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-zinc-400">
                    {equivalentUnit === 'ml' ? 'ml' : 'grams'}
                  </span>
                </div>
              </div>
            </div>

            {/* Servings Per Container (From Reference App) */}
            <div className="p-4 rounded-xl bg-[#0e0e12] border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-zinc-400">
                  Servings Per Container (Optional)
                </label>
                <span className="text-[10px] text-zinc-500 font-mono">Reference: default 1</span>
              </div>
              <input
                type="number"
                min="0.1"
                step="0.5"
                value={servingsPerContainer}
                onChange={(e) => setServingsPerContainer(e.target.value)}
                placeholder="1"
                className="w-full bg-transparent text-white font-mono font-bold text-base focus:outline-none"
              />
            </div>

            {/* Clear Formula display */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-zinc-400 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 font-mono">
              <span className="text-zinc-500">Dual-Unit Equation:</span>
              <span className="text-amber-300 font-bold text-sm">
                {servingSizeUnit === 'g' || servingSizeUnit === 'ml'
                  ? `${servingSizeQty} ${servingSizeUnit}`
                  : `${servingSizeQty} ${servingSizeUnit} = ${servingWeightGrams} ${equivalentUnit}`}
              </span>
            </div>
          </div>
        </div>

          {/* Bottom Next Button */}
          <div className="pt-4 max-w-md mx-auto w-full lg:max-w-none">
            <button
              type="button"
              onClick={handleNext}
              disabled={!foodName.trim()}
              className="btn-pill-lime w-full py-4 text-sm font-black shadow-[0_4px_22px_rgba(205,255,80,0.4)] disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Next</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ----------------- PAGE 2: NUTRITION FACTS (EXACT TO REFERENCE) ---------- */}
      {/* ========================================================================= */}
      {currentPage === 2 && (
        <div className="flex-1 max-w-5xl xl:max-w-6xl mx-auto w-full px-4 sm:px-6 py-4 animate-fade-in pb-32">
          
          {/* Desktop Back button */}
          <div className="hidden lg:flex items-center pb-2">
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to Details</span>
            </button>
          </div>

          {/* Heading matching reference screenshot */}
          <div className="pb-3 pt-1">
            <h3 className="text-lg font-bold text-white tracking-tight">
              Nutrition Facts
            </h3>
          </div>

          {/* Focused Single Vertical List of 17 Nutrients */}
          <div className="max-w-2xl mx-auto space-y-2.5">
            {NUTRIENT_ROWS.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-3.5 px-4 sm:px-5 rounded-2xl border border-white/[0.08] border-t-white/[0.28] hover:border-white/[0.18] hover:border-t-white/[0.42] bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,transparent_6%)] bg-[#000000] hover:bg-[#050508] transition-colors shadow-sm"
              >
                <label className="text-sm font-semibold text-white tracking-wide">
                  {item.label}
                </label>
                <div className="w-40 text-right">
                  <input
                    type="number"
                    step="0.1"
                    placeholder={item.required ? 'Required' : 'Optional'}
                    value={item.value}
                    onChange={(e) => item.setter(e.target.value)}
                    className="w-full text-right bg-transparent text-white font-mono text-sm placeholder:text-zinc-500 focus:outline-none focus:text-white font-medium"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Action: Save Custom Food */}
          <div className="pt-6 max-w-2xl mx-auto w-full">
            <button
              type="button"
              onClick={handleAttemptSave}
              disabled={!calories || Number(calories) <= 0}
              className="btn-pill-lime w-full py-4 text-sm font-black shadow-[0_4px_22px_rgba(205,255,80,0.4)] disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
            >
              <Check size={18} strokeWidth={2.5} />
              <span>{isEditing ? 'Update Custom Food' : 'Save Custom Food'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ----------------- MISSING NUTRIENT PROMPT MODAL (Exact match to reference) ----------------- */}
      {showNutrientPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-[28px] bg-[radial-gradient(ellipse_65%_45%_at_50%_-5%,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.05)_25%,transparent_70%)] bg-[#050506] border border-white/[0.14] border-t-white/[0.45] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.98),inset_0_1.5px_0.5px_rgba(255,255,255,0.50)] text-white animate-scale-in">
            <h3 className="text-base font-bold text-white tracking-tight mb-2">
              Add Nutrient Information
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed mb-6">
              Your diary is more accurate when you add nutrient details.
            </p>

            <div className="flex items-center justify-end gap-4 text-xs font-semibold">
              <button
                type="button"
                onClick={executeSave}
                className="text-zinc-400 hover:text-white cursor-pointer uppercase tracking-wider"
              >
                No Thanks
              </button>
              <button
                type="button"
                onClick={() => setShowNutrientPrompt(false)}
                className="text-[#CDFF50] hover:text-[#d8ff66] cursor-pointer uppercase tracking-wider font-bold"
              >
                Add Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TOAST BANNER ----------------- */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-white text-black text-xs font-bold shadow-2xl animate-bounce">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
