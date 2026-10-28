import { useEffect, useState, useMemo, useRef, type ChangeEvent, type FormEvent } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
import { isSnackFood } from '../utils/snackTags';
import {
  PHONE_USER_ID,
  STORAGE_BUCKET,
  STORAGE_BASE_URL,
  MICROS_DEFS,
  round2,
  optRound2,
  toFoodSlug,
  generateFoodId,
} from './constants';
import type { CustomFoodRow } from './types';

export function FoodsTab() {
  const [foods, setFoods] = useState<CustomFoodRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Modal form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<CustomFoodRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('lunch');
  const [isSnack, setIsSnack] = useState(false);
  const [servingWeightGrams, setServingWeightGrams] = useState('100');
  const [defaultPortion, setDefaultPortion] = useState('1 serving (100g)');
  const [imageUrl, setImageUrl] = useState('');

  // Primary nutrition numbers (stored as strings during form input)
  const [calories, setCalories] = useState('0');
  const [protein, setProtein] = useState('0');
  const [carbs, setCarbs] = useState('0');
  const [fat, setFat] = useState('0');
  const [fiber, setFiber] = useState('0');
  const [sugar, setSugar] = useState('0');
  const [sodium, setSodium] = useState('0');
  const [saturatedFat, setSaturatedFat] = useState('0');
  const [transFat, setTransFat] = useState('0');
  const [monounsaturatedFat, setMonounsaturatedFat] = useState('0');
  const [polyunsaturatedFat, setPolyunsaturatedFat] = useState('0');
  const [cholesterol, setCholesterol] = useState('0');
  const [calcium, setCalcium] = useState('0');
  const [iron, setIron] = useState('0');
  const [potassium, setPotassium] = useState('0');
  const [vitaminA, setVitaminA] = useState('0');
  const [vitaminC, setVitaminC] = useState('0');

  // Micros dictionary (the 34 exact keys)
  const [micros, setMicros] = useState<Record<string, string>>({});
  const [microsOpen, setMicrosOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchFoods = async () => {
    if (!supabase || !isSupabaseConfigured()) {
      setError('Supabase is not configured. Please check environment variables.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('custom_foods')
        .select('*')
        .eq('user_id', PHONE_USER_ID)
        .order('updated_at', { ascending: false });

      if (err) {
        setError(err.message);
      } else {
        setFoods((data || []) as CustomFoodRow[]);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch foods');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!supabase || !isSupabaseConfigured()) {
        setError('Supabase is not configured. Please check environment variables.');
        setLoading(false);
        return;
      }
      try {
        const { data, error: err } = await supabase
          .from('custom_foods')
          .select('*')
          .eq('user_id', PHONE_USER_ID)
          .order('updated_at', { ascending: false });

        if (!ignore) {
          if (err) setError(err.message);
          else setFoods((data || []) as CustomFoodRow[]);
        }
      } catch (e: unknown) {
        if (!ignore) {
          setError(e instanceof Error ? e.message : 'Failed to fetch foods');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const filteredFoods = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return foods;
    return foods.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        (f.brand && f.brand.toLowerCase().includes(q)) ||
        (f.category && f.category.toLowerCase().includes(q))
    );
  }, [foods, search]);

  const openNewForm = () => {
    setEditingFood(null);
    setName('');
    setBrand('');
    setCategory('lunch');
    setIsSnack(false);
    setServingWeightGrams('100');
    setDefaultPortion('1 serving (100g)');
    setImageUrl('');

    setCalories('0');
    setProtein('0');
    setCarbs('0');
    setFat('0');
    setFiber('0');
    setSugar('0');
    setSodium('0');
    setSaturatedFat('0');
    setTransFat('0');
    setMonounsaturatedFat('0');
    setPolyunsaturatedFat('0');
    setCholesterol('0');
    setCalcium('0');
    setIron('0');
    setPotassium('0');
    setVitaminA('0');
    setVitaminC('0');

    // Initialize all 34 micros keys to empty or 0
    const initialMicros: Record<string, string> = {};
    for (const def of MICROS_DEFS) {
      initialMicros[def.key] = '';
    }
    setMicros(initialMicros);

    setFormError(null);
    setUploadError(null);
    setMicrosOpen(false);
    setModalOpen(true);
  };

  const openEditForm = (food: CustomFoodRow) => {
    setEditingFood(food);
    setName(food.name || '');
    setBrand(food.brand || '');
    setCategory(food.category || 'lunch');
    setIsSnack(isSnackFood(food.name || '', food.category || ''));
    setServingWeightGrams(food.serving_weight_grams?.toString() || '100');
    setDefaultPortion(food.default_portion || '1 serving (100g)');
    setImageUrl(food.image_url && food.image_url !== 'null' ? food.image_url : '');

    setCalories(food.calories?.toString() || '0');
    setProtein(food.protein?.toString() || '0');
    setCarbs(food.carbs?.toString() || '0');
    setFat(food.fat?.toString() || '0');
    setFiber(food.fiber?.toString() || '0');
    setSugar(food.sugar?.toString() || '0');
    setSodium(food.sodium?.toString() || '0');
    setSaturatedFat(food.saturated_fat?.toString() || '0');
    setTransFat(food.trans_fat?.toString() || '0');
    setMonounsaturatedFat(food.monounsaturated_fat?.toString() || '0');
    setPolyunsaturatedFat(food.polyunsaturated_fat?.toString() || '0');
    setCholesterol(food.cholesterol?.toString() || '0');
    setCalcium(food.calcium?.toString() || '0');
    setIron(food.iron?.toString() || '0');
    setPotassium(food.potassium?.toString() || '0');
    setVitaminA(food.vitamin_a?.toString() || '0');
    setVitaminC(food.vitamin_c?.toString() || '0');

    // Parse existing micros_json
    let parsedMicros: Record<string, unknown> = {};
    if (food.micros_json) {
      if (typeof food.micros_json === 'string') {
        try {
          parsedMicros = JSON.parse(food.micros_json);
        } catch {
          parsedMicros = {};
        }
      } else if (typeof food.micros_json === 'object') {
        parsedMicros = food.micros_json as Record<string, unknown>;
      }
    }

    const initialMicros: Record<string, string> = {};
    for (const def of MICROS_DEFS) {
      if (parsedMicros[def.key] !== undefined && parsedMicros[def.key] !== null) {
        initialMicros[def.key] = parsedMicros[def.key]?.toString() || '';
      } else {
        initialMicros[def.key] = '';
      }
    }
    setMicros(initialMicros);

    setFormError(null);
    setUploadError(null);
    setMicrosOpen(false);
    setModalOpen(true);
  };

  const handleMicroChange = (key: string, val: string) => {
    setMicros((prev) => ({ ...prev, [key]: val }));
  };

  // Sync core nutrients into micros
  const syncMicrosFromCore = () => {
    setMicros((prev) => ({
      ...prev,
      fiber: fiber || prev.fiber || '',
      sugar: sugar || prev.sugar || '',
      sodiumMg: sodium || prev.sodiumMg || '',
      saturatedFat: saturatedFat || prev.saturatedFat || '',
      transFat: transFat || prev.transFat || '',
      monoFat: monounsaturatedFat || prev.monoFat || '',
      polyFat: polyunsaturatedFat || prev.polyFat || '',
      cholesterol: cholesterol || prev.cholesterol || '',
      calcium: calcium || prev.calcium || '',
      iron: iron || prev.iron || '',
      potassium: potassium || prev.potassium || '',
      vitaminA: vitaminA || prev.vitaminA || '',
      vitaminC: vitaminC || prev.vitaminC || '',
    }));
  };

  // File picker handler for food-images bucket upload
  const handleImageFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;
    setUploadError(null);
    setUploadingImage(true);

    const slug = toFoodSlug(name || (editingFood ? editingFood.name : 'food'));
    const filePath = `foods/${slug}.png`;
    const targetPublicUrl = `${STORAGE_BASE_URL}/${filePath}`;

    try {
      const { error: uploadErr } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type || 'image/png',
        });

      if (uploadErr) {
        setUploadError(
          `Bucket upload rejected: ${uploadErr.message}. Fallback: Paste a public image URL into the field below.`
        );
      } else {
        setImageUrl(targetPublicUrl);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setUploadError(
        `Bucket upload rejected: ${msg}. Fallback: Paste a public image URL into the field below.`
      );
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    if (!name.trim()) {
      setFormError('Food name is required');
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      // 1. Determine ID
      const foodId = editingFood ? editingFood.id : generateFoodId(name);

      // 2. Prepare micros_json with EXACT 34 keys, rounded to max 2 decimals
      const microsPayload: Record<string, number> = {};
      for (const def of MICROS_DEFS) {
        const valStr = micros[def.key];
        if (valStr !== undefined && valStr !== '' && !isNaN(Number(valStr))) {
          microsPayload[def.key] = round2(Number(valStr));
        }
      }

      // Also ensure core values are mirrored into microsPayload if not explicitly set
      if (fiber && microsPayload.fiber === undefined) microsPayload.fiber = round2(Number(fiber));
      if (sugar && microsPayload.sugar === undefined) microsPayload.sugar = round2(Number(sugar));
      if (sodium && microsPayload.sodiumMg === undefined) microsPayload.sodiumMg = round2(Number(sodium));
      if (saturatedFat && microsPayload.saturatedFat === undefined) microsPayload.saturatedFat = round2(Number(saturatedFat));
      if (transFat && microsPayload.transFat === undefined) microsPayload.transFat = round2(Number(transFat));
      if (monounsaturatedFat && microsPayload.monoFat === undefined) microsPayload.monoFat = round2(Number(monounsaturatedFat));
      if (polyunsaturatedFat && microsPayload.polyFat === undefined) microsPayload.polyFat = round2(Number(polyunsaturatedFat));
      if (cholesterol && microsPayload.cholesterol === undefined) microsPayload.cholesterol = round2(Number(cholesterol));
      if (calcium && microsPayload.calcium === undefined) microsPayload.calcium = round2(Number(calcium));
      if (iron && microsPayload.iron === undefined) microsPayload.iron = round2(Number(iron));
      if (potassium && microsPayload.potassium === undefined) microsPayload.potassium = round2(Number(potassium));
      if (vitaminA && microsPayload.vitaminA === undefined) microsPayload.vitaminA = round2(Number(vitaminA));
      if (vitaminC && microsPayload.vitaminC === undefined) microsPayload.vitaminC = round2(Number(vitaminC));

      const nowIso = new Date().toISOString();

      const payload = {
        id: foodId,
        user_id: PHONE_USER_ID,
        name: name.trim(),
        brand: brand.trim() || null,
        category: isSnack ? 'snack' : (category.trim() || 'lunch'),
        calories: round2(Number(calories)),
        protein: round2(Number(protein)),
        carbs: round2(Number(carbs)),
        fat: round2(Number(fat)),
        fiber: optRound2(Number(fiber)),
        sugar: optRound2(Number(sugar)),
        sodium: optRound2(Number(sodium)),
        saturated_fat: optRound2(Number(saturatedFat)),
        trans_fat: optRound2(Number(transFat)),
        monounsaturated_fat: optRound2(Number(monounsaturatedFat)),
        polyunsaturated_fat: optRound2(Number(polyunsaturatedFat)),
        cholesterol: optRound2(Number(cholesterol)),
        calcium: optRound2(Number(calcium)),
        iron: optRound2(Number(iron)),
        potassium: optRound2(Number(potassium)),
        vitamin_a: optRound2(Number(vitaminA)),
        vitamin_c: optRound2(Number(vitaminC)),
        serving_size_qty: 1,
        serving_size_unit: 'serving',
        serving_weight_grams: round2(Number(servingWeightGrams) || 100),
        serving_equivalent_unit: 'g',
        servings_per_container: 1,
        default_portion: defaultPortion.trim() || `1 serving (${round2(Number(servingWeightGrams) || 100)}g)`,
        image_url: imageUrl.trim() || null,
        micros_json: JSON.stringify(microsPayload),
        updated_at: nowIso,
      };

      const { error: upsertErr } = await supabase
        .from('custom_foods')
        .upsert(payload, { onConflict: 'id' });

      if (upsertErr) {
        setFormError(upsertErr.message);
      } else {
        setModalOpen(false);
        await fetchFoods();
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (food: CustomFoodRow) => {
    if (!supabase) return;
    const ok = window.confirm(`Permanently delete custom food "${food.name}"?`);
    if (!ok) return;

    try {
      const { error: delErr } = await supabase
        .from('custom_foods')
        .delete()
        .eq('id', food.id)
        .eq('user_id', PHONE_USER_ID);

      if (delErr) {
        alert(`Delete failed: ${delErr.message}`);
      } else {
        await fetchFoods();
      }
    } catch (err: unknown) {
      alert(`Delete error: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950 border border-zinc-800 p-3 sm:p-4 rounded-sm">
        <div className="flex items-center gap-2 flex-1">
          <input
            type="text"
            placeholder="Search custom foods by name, brand, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:max-w-md bg-black border border-zinc-700 focus:border-zinc-300 text-zinc-100 text-sm px-3 py-1.5 rounded-sm outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="text-xs text-zinc-400 hover:text-white px-2 py-1 border border-zinc-700 rounded-sm"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchFoods}
            disabled={loading}
            className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-3 py-2 border border-zinc-700 rounded-sm cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            type="button"
            onClick={openNewForm}
            className="text-xs bg-zinc-100 hover:bg-white text-black font-semibold px-4 py-2 rounded-sm cursor-pointer"
          >
            + New Food
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-800 text-red-200 text-xs rounded-sm">
          {error}
        </div>
      )}

      {/* Foods Table */}
      <div className="border border-zinc-800 bg-zinc-950 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Food Name</th>
                <th className="py-2.5 px-3">Energy</th>
                <th className="py-2.5 px-3">P / F / C</th>
                <th className="py-2.5 px-3">Serving</th>
                <th className="py-2.5 px-3">ID / Category</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {loading && foods.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">
                    Loading custom foods from Supabase...
                  </td>
                </tr>
              ) : filteredFoods.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">
                    {search ? 'No foods match your search filter.' : 'No custom foods found for phone user.'}
                  </td>
                </tr>
              ) : (
                filteredFoods.map((f) => {
                  const hasImage = Boolean(f.image_url && f.image_url !== 'null');
                  return (
                    <tr key={f.id} className="hover:bg-zinc-900/60 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          {hasImage ? (
                            <img
                              src={f.image_url!}
                              alt=""
                              className="w-8 h-8 rounded-sm object-cover border border-zinc-700 shrink-0 bg-black"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-sm border border-zinc-800 bg-black flex items-center justify-center text-zinc-600 text-[10px] shrink-0">
                              N/A
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-semibold text-zinc-200 truncate">
                              {f.name}
                              {isSnackFood(f.name, f.category) && (
                                <span className="ml-2 text-[10px] font-bold text-amber-300 border border-amber-500/50 rounded-full px-2 py-0.5">Snack</span>
                              )}
                            </div>
                            {f.brand && <div className="text-zinc-500 text-[11px] truncate">{f.brand}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-zinc-200 whitespace-nowrap">
                        {round2(f.calories)} kcal
                      </td>
                      <td className="py-2.5 px-3 text-zinc-300 whitespace-nowrap">
                        <span className="text-blue-400 font-semibold">{round2(f.protein)}P</span> /{' '}
                        <span className="text-amber-400 font-semibold">{round2(f.fat)}F</span> /{' '}
                        <span className="text-emerald-400 font-semibold">{round2(f.carbs)}C</span>
                      </td>
                      <td className="py-2.5 px-3 text-zinc-300 whitespace-nowrap">
                        {f.default_portion || `${f.serving_weight_grams || 100}g`}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-500 text-[11px] truncate max-w-[140px]">
                        <div>{f.category || 'lunch'}</div>
                        <div className="text-zinc-600 truncate">{f.id}</div>
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap space-x-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(f)}
                          className="px-2.5 py-1 text-xs border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded-sm cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(f)}
                          className="px-2.5 py-1 text-xs border border-red-900/60 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded-sm cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="p-2.5 bg-zinc-950 border-t border-zinc-900 text-[11px] text-zinc-500 flex justify-between items-center font-mono">
          <span>Total foods: {filteredFoods.length}</span>
          <span>Target device: {PHONE_USER_ID.slice(0, 8)}...</span>
        </div>
      </div>

      {/* Food Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-mono">
          <div className="w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-sm my-8 p-4 sm:p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h2 className="text-lg font-bold text-zinc-100">
                  {editingFood ? `Edit Food: ${editingFood.name}` : 'New Custom Food'}
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  ID: {editingFood ? editingFood.id : `${toFoodSlug(name || 'food')}-08597798`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-zinc-400 hover:text-white text-lg px-2 cursor-pointer"
              >
                &times;
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-950/50 border border-red-800 text-red-200 text-xs rounded-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              {/* 1. Basic Information */}
              <div className="space-y-3">
                <div className="text-xs uppercase font-bold text-zinc-400 tracking-wider">
                  1. Basic Details
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-zinc-400 mb-1">Food Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Chana Dal"
                      className="w-full bg-black border border-zinc-700 text-zinc-100 text-xs p-2 rounded-sm outline-none focus:border-zinc-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Brand (optional)</label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g. homemade"
                      className="w-full bg-black border border-zinc-700 text-zinc-100 text-xs p-2 rounded-sm outline-none focus:border-zinc-300"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pb-1">
                  <input
                    type="checkbox"
                    checked={isSnack}
                    onChange={(e) => setIsSnack(e.target.checked)}
                    className="accent-amber-400"
                  />
                  <label className="text-xs text-amber-300 font-semibold">Snack food — snack tag lagao (khane se pata chalega, time se nahi; log hote hi Snacks me jayega)</label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Category</label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. lunch, dairy, snacks"
                      className="w-full bg-black border border-zinc-700 text-zinc-100 text-xs p-2 rounded-sm outline-none focus:border-zinc-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Serving Weight (g)</label>
                    <input
                      type="number"
                      step="any"
                      value={servingWeightGrams}
                      onChange={(e) => setServingWeightGrams(e.target.value)}
                      className="w-full bg-black border border-zinc-700 text-zinc-100 text-xs p-2 rounded-sm outline-none focus:border-zinc-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Default Portion Label</label>
                    <input
                      type="text"
                      value={defaultPortion}
                      onChange={(e) => setDefaultPortion(e.target.value)}
                      placeholder="e.g. 1 serving (100g)"
                      className="w-full bg-black border border-zinc-700 text-zinc-100 text-xs p-2 rounded-sm outline-none focus:border-zinc-300"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Food Image */}
              <div className="space-y-3 border-t border-zinc-900 pt-4">
                <div className="text-xs uppercase font-bold text-zinc-400 tracking-wider">
                  2. Food Image
                </div>
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={uploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 px-3 py-2 rounded-sm cursor-pointer disabled:opacity-50"
                    >
                      {uploadingImage ? 'Uploading to food-images...' : 'Upload Image File (.png / .jpg)'}
                    </button>
                    <span className="text-[11px] text-zinc-500">
                      Uploads to storage at foods/{toFoodSlug(name || 'food')}.png
                    </span>
                  </div>

                  {uploadError && (
                    <div className="p-2.5 bg-amber-950/40 border border-amber-800/80 text-amber-200 text-xs rounded-sm">
                      {uploadError}
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="block text-[11px] text-zinc-400 mb-1">
                        Public Image URL (or paste fallback):
                      </label>
                      <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://... or paste image URL"
                        className="w-full bg-black border border-zinc-700 text-zinc-100 text-xs p-2 rounded-sm outline-none focus:border-zinc-300"
                      />
                    </div>
                    {imageUrl && (
                      <div className="shrink-0 pt-4">
                        <img
                          src={imageUrl}
                          alt="preview"
                          className="w-10 h-10 rounded-sm object-cover border border-zinc-700 bg-black"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Primary Nutrition Fields */}
              <div className="space-y-3 border-t border-zinc-900 pt-4">
                <div className="text-xs uppercase font-bold text-zinc-400 tracking-wider">
                  3. Primary Nutrition (per serving)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Calories (kcal) *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={calories}
                      onChange={(e) => setCalories(e.target.value)}
                      className="w-full bg-black border border-zinc-700 text-zinc-100 text-xs p-2 rounded-sm outline-none focus:border-zinc-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Protein (g) *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={protein}
                      onChange={(e) => setProtein(e.target.value)}
                      className="w-full bg-black border border-zinc-700 text-zinc-100 text-xs p-2 rounded-sm outline-none focus:border-zinc-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Carbs (g) *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={carbs}
                      onChange={(e) => setCarbs(e.target.value)}
                      className="w-full bg-black border border-zinc-700 text-zinc-100 text-xs p-2 rounded-sm outline-none focus:border-zinc-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Fat (g) *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={fat}
                      onChange={(e) => setFat(e.target.value)}
                      className="w-full bg-black border border-zinc-700 text-zinc-100 text-xs p-2 rounded-sm outline-none focus:border-zinc-300 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Fiber (g)</label>
                    <input
                      type="number"
                      step="any"
                      value={fiber}
                      onChange={(e) => setFiber(e.target.value)}
                      className="w-full bg-black border border-zinc-700 text-zinc-100 text-xs p-2 rounded-sm outline-none focus:border-zinc-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Sugar (g)</label>
                    <input
                      type="number"
                      step="any"
                      value={sugar}
                      onChange={(e) => setSugar(e.target.value)}
                      className="w-full bg-black border border-zinc-700 text-zinc-100 text-xs p-2 rounded-sm outline-none focus:border-zinc-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Sodium (mg)</label>
                    <input
                      type="number"
                      step="any"
                      value={sodium}
                      onChange={(e) => setSodium(e.target.value)}
                      className="w-full bg-black border border-zinc-700 text-zinc-100 text-xs p-2 rounded-sm outline-none focus:border-zinc-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Saturated Fat (g)</label>
                    <input
                      type="number"
                      step="any"
                      value={saturatedFat}
                      onChange={(e) => setSaturatedFat(e.target.value)}
                      className="w-full bg-black border border-zinc-700 text-zinc-100 text-xs p-2 rounded-sm outline-none focus:border-zinc-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Trans Fat (g)</label>
                    <input
                      type="number"
                      step="any"
                      value={transFat}
                      onChange={(e) => setTransFat(e.target.value)}
                      className="w-full bg-black border border-zinc-700 text-zinc-100 text-xs p-2 rounded-sm outline-none focus:border-zinc-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Mono Fat (g)</label>
                    <input
                      type="number"
                      step="any"
                      value={monounsaturatedFat}
                      onChange={(e) => setMonounsaturatedFat(e.target.value)}
                      className="w-full bg-black border border-zinc-700 text-zinc-100 text-xs p-2 rounded-sm outline-none focus:border-zinc-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Poly Fat (g)</label>
                    <input
                      type="number"
                      step="any"
                      value={polyunsaturatedFat}
                      onChange={(e) => setPolyunsaturatedFat(e.target.value)}
                      className="w-full bg-black border border-zinc-700 text-zinc-100 text-xs p-2 rounded-sm outline-none focus:border-zinc-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Cholesterol (mg)</label>
                    <input
                      type="number"
                      step="any"
                      value={cholesterol}
                      onChange={(e) => setCholesterol(e.target.value)}
                      className="w-full bg-black border border-zinc-700 text-zinc-100 text-xs p-2 rounded-sm outline-none focus:border-zinc-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Calcium (mg)</label>
                    <input
                      type="number"
                      step="any"
                      value={calcium}
                      onChange={(e) => setCalcium(e.target.value)}
                      className="w-full bg-black border border-zinc-700 text-zinc-100 text-xs p-2 rounded-sm outline-none focus:border-zinc-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Iron (mg)</label>
                    <input
                      type="number"
                      step="any"
                      value={iron}
                      onChange={(e) => setIron(e.target.value)}
                      className="w-full bg-black border border-zinc-700 text-zinc-100 text-xs p-2 rounded-sm outline-none focus:border-zinc-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Potassium (mg)</label>
                    <input
                      type="number"
                      step="any"
                      value={potassium}
                      onChange={(e) => setPotassium(e.target.value)}
                      className="w-full bg-black border border-zinc-700 text-zinc-100 text-xs p-2 rounded-sm outline-none focus:border-zinc-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Vitamin A (mcg)</label>
                    <input
                      type="number"
                      step="any"
                      value={vitaminA}
                      onChange={(e) => setVitaminA(e.target.value)}
                      className="w-full bg-black border border-zinc-700 text-zinc-100 text-xs p-2 rounded-sm outline-none focus:border-zinc-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Vitamin C (mg)</label>
                    <input
                      type="number"
                      step="any"
                      value={vitaminC}
                      onChange={(e) => setVitaminC(e.target.value)}
                      className="w-full bg-black border border-zinc-700 text-zinc-100 text-xs p-2 rounded-sm outline-none focus:border-zinc-300"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Vitamins & Micros (micros_json with 34 exact keys) */}
              <div className="space-y-3 border-t border-zinc-900 pt-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs uppercase font-bold text-zinc-400 tracking-wider">
                    4. Vitamins & Micros (34 keys &rarr; micros_json)
                  </div>
                  <div className="space-x-2">
                    <button
                      type="button"
                      onClick={syncMicrosFromCore}
                      className="text-[11px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-1 rounded-sm"
                    >
                      Sync from Core
                    </button>
                    <button
                      type="button"
                      onClick={() => setMicrosOpen(!microsOpen)}
                      className="text-[11px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-1 rounded-sm"
                    >
                      {microsOpen ? 'Collapse [-]' : 'Expand All [+]'}
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-500">
                  Written directly into <code className="text-zinc-300">micros_json</code> with the exact
                  keys required by Android native app.
                </p>

                {microsOpen && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 bg-black p-3 border border-zinc-800 rounded-sm">
                    {MICROS_DEFS.map((def) => (
                      <div key={def.key}>
                        <label className="block text-[11px] text-zinc-400 truncate mb-1">
                          {def.key} <span className="text-zinc-600">({def.unit})</span>
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={micros[def.key] ?? ''}
                          onChange={(e) => handleMicroChange(def.key, e.target.value)}
                          placeholder="0"
                          className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-400 text-zinc-200 text-xs px-2 py-1.5 rounded-sm outline-none"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-zinc-800 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs bg-zinc-100 hover:bg-white text-black font-semibold rounded-sm cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingFood ? 'Update Food' : 'Create Food'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default FoodsTab;
