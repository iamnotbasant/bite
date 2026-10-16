import { useEffect, useState, useMemo, type FormEvent } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
import {
  PHONE_USER_ID,
  round2,
  optRound2,
  encodePortion,
  decodePortion,
} from './constants';
import type { FoodLogRow, CustomFoodRow } from './types';

function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getLocalTimeString(d: Date = new Date()): string {
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function LogsTab() {
  const [logs, setLogs] = useState<FoodLogRow[]>([]);
  const [customFoods, setCustomFoods] = useState<CustomFoodRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Date filter (defaults to empty = show all latest 30 days)
  const [dateFilter, setDateFilter] = useState<string>('');

  // Modal form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<FoodLogRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form inputs
  const [selectedFoodId, setSelectedFoodId] = useState<string>('');
  const [foodSearchQuery, setFoodSearchQuery] = useState('');
  const [logName, setLogName] = useState('');
  const [logBrand, setLogBrand] = useState('');
  const [logCategory, setLogCategory] = useState<'breakfast' | 'lunch' | 'snacks' | 'dinner'>('lunch');
  const [logDate, setLogDate] = useState(getLocalDateString());
  const [logTime, setLogTime] = useState(getLocalTimeString());
  const [logQty, setLogQty] = useState('1');
  const [logUnit, setLogUnit] = useState('serving');
  const [logGrams, setLogGrams] = useState('100');
  const [logImageUrl, setLogImageUrl] = useState('');

  // Nutrition inputs
  const [logCalories, setLogCalories] = useState('0');
  const [logProtein, setLogProtein] = useState('0');
  const [logCarbs, setLogCarbs] = useState('0');
  const [logFat, setLogFat] = useState('0');
  const [logFiber, setLogFiber] = useState('0');
  const [logSugar, setLogSugar] = useState('0');
  const [logSodium, setLogSodium] = useState('0');
  const [logSaturatedFat, setLogSaturatedFat] = useState('0');
  const [logTransFat, setLogTransFat] = useState('0');

  // Load custom foods for picker
  const loadCustomFoods = async () => {
    if (!supabase || !isSupabaseConfigured()) return;
    try {
      const { data } = await supabase
        .from('custom_foods')
        .select('*')
        .eq('user_id', PHONE_USER_ID)
        .order('name', { ascending: true });
      if (data) {
        setCustomFoods(data as CustomFoodRow[]);
      }
    } catch {
      /* ignore */
    }
  };

  // Load food_logs for latest 30 days
  const fetchLogs = async () => {
    if (!supabase || !isSupabaseConfigured()) {
      setError('Supabase is not configured.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await loadCustomFoods();
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().slice(0, 10);
      const { data, error: err } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', PHONE_USER_ID)
        .gte('date', thirtyDaysAgo)
        .order('date', { ascending: false });

      if (err) {
        setError(err.message);
      } else {
        const sorted = ((data || []) as FoodLogRow[]).sort((a, b) => {
          if (a.date !== b.date) return b.date.localeCompare(a.date);
          return (b.timestamp || '').localeCompare(a.timestamp || '');
        });
        setLogs(sorted);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch food logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!supabase || !isSupabaseConfigured()) {
        setError('Supabase is not configured.');
        setLoading(false);
        return;
      }
      try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().slice(0, 10);
        const { data, error: err } = await supabase
          .from('food_logs')
          .select('*')
          .eq('user_id', PHONE_USER_ID)
          .gte('date', thirtyDaysAgo)
          .order('date', { ascending: false });

        if (!ignore) {
          if (err) {
            setError(err.message);
          } else {
            const sorted = ((data || []) as FoodLogRow[]).sort((a, b) => {
              if (a.date !== b.date) return b.date.localeCompare(a.date);
              return (b.timestamp || '').localeCompare(a.timestamp || '');
            });
            setLogs(sorted);
          }
        }
      } catch (e: unknown) {
        if (!ignore) {
          setError(e instanceof Error ? e.message : 'Failed to fetch food logs');
        }
      } finally {
        if (!ignore) setLoading(false);
      }

      try {
        const { data: foodsData } = await supabase
          .from('custom_foods')
          .select('*')
          .eq('user_id', PHONE_USER_ID)
          .order('name', { ascending: true });
        if (!ignore && foodsData) {
          setCustomFoods(foodsData as CustomFoodRow[]);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const filteredLogs = useMemo(() => {
    if (!dateFilter) return logs;
    return logs.filter((l) => l.date === dateFilter);
  }, [logs, dateFilter]);

  const filteredFoodsForPicker = useMemo(() => {
    const q = foodSearchQuery.trim().toLowerCase();
    if (!q) return customFoods;
    return customFoods.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        (f.brand && f.brand.toLowerCase().includes(q))
    );
  }, [customFoods, foodSearchQuery]);

  // When a food is selected from picker, apply scaled macros
  const handleSelectFood = (food: CustomFoodRow) => {
    setSelectedFoodId(food.id);
    setLogName(food.name);
    setLogBrand(food.brand || '');
    setLogImageUrl(food.image_url && food.image_url !== 'null' ? food.image_url : '');
    const unit = food.serving_size_unit || 'serving';
    setLogUnit(unit);

    const baseWeight = food.serving_weight_grams || 100;
    const q = parseFloat(logQty) || 1;
    setLogGrams(round2(q * baseWeight).toString());

    setLogCalories(round2(q * food.calories).toString());
    setLogProtein(round2(q * food.protein).toString());
    setLogCarbs(round2(q * food.carbs).toString());
    setLogFat(round2(q * food.fat).toString());
    setLogFiber(food.fiber != null ? round2(q * food.fiber).toString() : '0');
    setLogSugar(food.sugar != null ? round2(q * food.sugar).toString() : '0');
    setLogSodium(food.sodium != null ? round2(q * food.sodium).toString() : '0');
    setLogSaturatedFat(food.saturated_fat != null ? round2(q * food.saturated_fat).toString() : '0');
    setLogTransFat(food.trans_fat != null ? round2(q * food.trans_fat).toString() : '0');
  };

  // When quantity is changed, auto scale if a food is selected
  const handleQtyChange = (newQtyStr: string) => {
    setLogQty(newQtyStr);
    const q = parseFloat(newQtyStr);
    if (isNaN(q) || q <= 0) return;

    const food = customFoods.find((f) => f.id === selectedFoodId);
    if (food) {
      const baseWeight = food.serving_weight_grams || 100;
      setLogGrams(round2(q * baseWeight).toString());
      setLogCalories(round2(q * food.calories).toString());
      setLogProtein(round2(q * food.protein).toString());
      setLogCarbs(round2(q * food.carbs).toString());
      setLogFat(round2(q * food.fat).toString());
      if (food.fiber != null) setLogFiber(round2(q * food.fiber).toString());
      if (food.sugar != null) setLogSugar(round2(q * food.sugar).toString());
      if (food.sodium != null) setLogSodium(round2(q * food.sodium).toString());
      if (food.saturated_fat != null) setLogSaturatedFat(round2(q * food.saturated_fat).toString());
      if (food.trans_fat != null) setLogTransFat(round2(q * food.trans_fat).toString());
    }
  };

  const openLogFoodModal = () => {
    setEditingLog(null);
    setSelectedFoodId('');
    setFoodSearchQuery('');
    setLogName('');
    setLogBrand('');
    setLogCategory('lunch');
    setLogDate(getLocalDateString());
    setLogTime(getLocalTimeString());
    setLogQty('1');
    setLogUnit('serving');
    setLogGrams('100');
    setLogImageUrl('');

    setLogCalories('0');
    setLogProtein('0');
    setLogCarbs('0');
    setLogFat('0');
    setLogFiber('0');
    setLogSugar('0');
    setLogSodium('0');
    setLogSaturatedFat('0');
    setLogTransFat('0');

    setFormError(null);
    setModalOpen(true);
  };

  const openEditLogModal = (log: FoodLogRow) => {
    setEditingLog(log);
    setSelectedFoodId('');
    setFoodSearchQuery('');
    setLogName(log.name);
    setLogBrand(log.brand || '');

    const validCategories = ['breakfast', 'lunch', 'snacks', 'dinner'];
    const cat = validCategories.includes(log.category)
      ? (log.category as 'breakfast' | 'lunch' | 'snacks' | 'dinner')
      : 'lunch';
    setLogCategory(cat);

    setLogDate(log.date || getLocalDateString());

    // Extract time from timestamp
    if (log.timestamp && log.timestamp.includes('T')) {
      try {
        const d = new Date(log.timestamp);
        setLogTime(getLocalTimeString(d));
      } catch {
        setLogTime(getLocalTimeString());
      }
    } else {
      setLogTime(getLocalTimeString());
    }

    const decoded = decodePortion(log.portion);
    setLogQty(decoded.qty.toString());
    setLogUnit(decoded.unit);
    setLogGrams(decoded.grams.toString());
    setLogImageUrl(log.image_url && log.image_url !== 'null' ? log.image_url : '');

    setLogCalories(log.calories?.toString() || '0');
    setLogProtein(log.protein?.toString() || '0');
    setLogCarbs(log.carbs?.toString() || '0');
    setLogFat(log.fat?.toString() || '0');
    setLogFiber(log.fiber?.toString() || '0');
    setLogSugar(log.sugar?.toString() || '0');
    setLogSodium(log.sodium?.toString() || '0');
    setLogSaturatedFat(log.saturated_fat?.toString() || '0');
    setLogTransFat(log.trans_fat?.toString() || '0');

    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    if (!logName.trim()) {
      setFormError('Food name is required');
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      const logId = editingLog ? editingLog.id : crypto.randomUUID();

      // Parse hours from logTime
      let hour = 12;
      if (logTime && logTime.includes(':')) {
        const h = parseInt(logTime.split(':')[0], 10);
        if (!isNaN(h)) hour = h;
      }

      const q = parseFloat(logQty) || 1;
      const g = parseFloat(logGrams) || 0;
      const encodedPortionStr = encodePortion(q, logUnit, g, hour);

      // Construct timestamp
      const dateIso = new Date(`${logDate}T${logTime || '12:00'}:00`).toISOString();

      const payload = {
        id: logId,
        user_id: PHONE_USER_ID,
        date: logDate,
        name: logName.trim(),
        brand: logBrand.trim() || null,
        calories: round2(Number(logCalories)),
        protein: round2(Number(logProtein)),
        carbs: round2(Number(logCarbs)),
        fat: round2(Number(logFat)),
        fiber: optRound2(Number(logFiber)),
        saturated_fat: optRound2(Number(logSaturatedFat)),
        trans_fat: optRound2(Number(logTransFat)),
        sodium: optRound2(Number(logSodium)),
        sugar: optRound2(Number(logSugar)),
        portion: encodedPortionStr,
        category: logCategory,
        timestamp: dateIso,
        image_url: logImageUrl.trim() || null,
        created_at: editingLog?.created_at || dateIso,
      };

      const { error: upsertErr } = await supabase
        .from('food_logs')
        .upsert(payload, { onConflict: 'id' });

      if (upsertErr) {
        setFormError(upsertErr.message);
      } else {
        setModalOpen(false);
        await fetchLogs();
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (log: FoodLogRow) => {
    if (!supabase) return;
    const ok = window.confirm(`Permanently delete log "${log.name}" on ${log.date}?`);
    if (!ok) return;

    try {
      const { error: delErr } = await supabase
        .from('food_logs')
        .delete()
        .eq('id', log.id)
        .eq('user_id', PHONE_USER_ID);

      if (delErr) {
        alert(`Delete failed: ${delErr.message}`);
      } else {
        await fetchLogs();
      }
    } catch (err: unknown) {
      alert(`Delete error: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950 border border-zinc-800 p-3 sm:p-4 rounded-sm">
        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-400 font-mono">Date:</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-black border border-zinc-700 focus:border-zinc-300 text-zinc-100 text-xs px-2.5 py-1.5 rounded-sm outline-none font-mono"
          />
          {dateFilter && (
            <button
              type="button"
              onClick={() => setDateFilter('')}
              className="text-xs text-zinc-400 hover:text-white px-2 py-1 border border-zinc-700 rounded-sm font-mono"
            >
              All 30d
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchLogs}
            disabled={loading}
            className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-3 py-2 border border-zinc-700 rounded-sm cursor-pointer disabled:opacity-50 font-mono"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            type="button"
            onClick={openLogFoodModal}
            className="text-xs bg-zinc-100 hover:bg-white text-black font-semibold px-4 py-2 rounded-sm cursor-pointer font-mono"
          >
            + Log Food
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-800 text-red-200 text-xs rounded-sm font-mono">
          {error}
        </div>
      )}

      {/* Logs Table */}
      <div className="border border-zinc-800 bg-zinc-950 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Date / Time</th>
                <th className="py-2.5 px-3">Food</th>
                <th className="py-2.5 px-3">Meal</th>
                <th className="py-2.5 px-3">Portion</th>
                <th className="py-2.5 px-3">Energy</th>
                <th className="py-2.5 px-3">P / F / C</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500 font-mono">
                    Loading food logs from Supabase...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500 font-mono">
                    {dateFilter ? `No logs found for ${dateFilter}.` : 'No logs recorded in the last 30 days.'}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const decoded = decodePortion(log.portion);
                  let timeDisplay = '';
                  if (log.timestamp && log.timestamp.includes('T')) {
                    try {
                      const d = new Date(log.timestamp);
                      timeDisplay = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    } catch {
                      timeDisplay = '';
                    }
                  }
                  const hasImage = Boolean(log.image_url && log.image_url !== 'null');

                  return (
                    <tr key={log.id} className="hover:bg-zinc-900/60 transition-colors">
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-semibold text-zinc-200">{log.date}</div>
                        <div className="text-[11px] text-zinc-500">{timeDisplay || `Hour ${decoded.hour}:00`}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          {hasImage ? (
                            <img
                              src={log.image_url!}
                              alt=""
                              className="w-7 h-7 rounded-sm object-cover border border-zinc-700 shrink-0 bg-black"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-sm border border-zinc-800 bg-black flex items-center justify-center text-zinc-600 text-[9px] shrink-0">
                              🍽️
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-semibold text-zinc-200 truncate">{log.name}</div>
                            {log.brand && <div className="text-zinc-500 text-[11px] truncate">{log.brand}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="capitalize px-1.5 py-0.5 border border-zinc-800 bg-zinc-900 text-zinc-300 rounded text-[11px]">
                          {log.category || 'lunch'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-zinc-300">
                        {decoded.display}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-semibold text-zinc-200">
                        {round2(log.calories)} kcal
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-zinc-300">
                        <span className="text-blue-400 font-semibold">{round2(log.protein)}P</span> /{' '}
                        <span className="text-amber-400 font-semibold">{round2(log.fat)}F</span> /{' '}
                        <span className="text-emerald-400 font-semibold">{round2(log.carbs)}C</span>
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap space-x-2">
                        <button
                          type="button"
                          onClick={() => openEditLogModal(log)}
                          className="px-2.5 py-1 text-xs border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded-sm cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(log)}
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
          <span>Logs listed: {filteredLogs.length}</span>
          <span>Target device: {PHONE_USER_ID.slice(0, 8)}...</span>
        </div>
      </div>

      {/* Log Food Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-mono">
          <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-sm my-8 p-4 sm:p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h2 className="text-lg font-bold text-zinc-100">
                  {editingLog ? `Edit Log: ${editingLog.name}` : 'Log Food'}
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Device: {PHONE_USER_ID.slice(0, 8)}...
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

            <form onSubmit={handleSave} className="space-y-5">
              {/* Food selection (when creating new log) */}
              {!editingLog && (
                <div className="space-y-2 border-b border-zinc-900 pb-4">
                  <div className="text-xs uppercase font-bold text-zinc-400 tracking-wider">
                    1. Select Food from Custom Foods
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Filter custom foods..."
                      value={foodSearchQuery}
                      onChange={(e) => setFoodSearchQuery(e.target.value)}
                      className="w-full bg-black border border-zinc-700 text-zinc-100 text-xs p-2 rounded-sm outline-none focus:border-zinc-300"
                    />
                  </div>

                  <div className="max-h-40 overflow-y-auto border border-zinc-800 bg-black rounded-sm divide-y divide-zinc-900">
                    {filteredFoodsForPicker.length === 0 ? (
                      <div className="p-3 text-zinc-500 text-xs text-center">
                        No custom foods found. You can also enter food details manually below.
                      </div>
                    ) : (
                      filteredFoodsForPicker.map((food) => (
                        <button
                          key={food.id}
                          type="button"
                          onClick={() => handleSelectFood(food)}
                          className={`w-full text-left p-2 text-xs flex items-center justify-between hover:bg-zinc-900 cursor-pointer transition-colors ${
                            selectedFoodId === food.id ? 'bg-zinc-800/80 text-white' : 'text-zinc-300'
                          }`}
                        >
                          <div className="truncate">
                            <span className="font-semibold text-zinc-100">{food.name}</span>
                            {food.brand && <span className="text-zinc-500 text-[11px] ml-1.5">({food.brand})</span>}
                            <span className="text-zinc-500 text-[11px] ml-2">
                              · {food.default_portion || `${food.serving_weight_grams}g`}
                            </span>
                          </div>
                          <span className="text-zinc-400 font-mono whitespace-nowrap ml-2">
                            {round2(food.calories)} kcal
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* 2. Log Info */}
              <div className="space-y-3">
                <div className="text-xs uppercase font-bold text-zinc-400 tracking-wider">
                  {editingLog ? 'Log Information' : '2. Meal, Date & Quantity'}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Food Name *</label>
                    <input
                      type="text"
                      required
                      value={logName}
                      onChange={(e) => setLogName(e.target.value)}
                      placeholder="e.g. Roti"
                      className="w-full bg-black border border-zinc-700 text-zinc-100 text-xs p-2 rounded-sm outline-none focus:border-zinc-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Meal</label>
                    <select
                      value={logCategory}
                      onChange={(e) => setLogCategory(e.target.value as 'breakfast' | 'lunch' | 'snacks' | 'dinner')}
                      className="w-full bg-black border border-zinc-700 text-zinc-100 text-xs p-2 rounded-sm outline-none focus:border-zinc-300"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="snacks">Snacks</option>
                      <option value="dinner">Dinner</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={logDate}
                      onChange={(e) => setLogDate(e.target.value)}
                      className="w-full bg-black border border-zinc-700 text-zinc-100 text-xs p-2 rounded-sm outline-none focus:border-zinc-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Time</label>
                    <input
                      type="time"
                      required
                      value={logTime}
                      onChange={(e) => setLogTime(e.target.value)}
                      className="w-full bg-black border border-zinc-700 text-zinc-100 text-xs p-2 rounded-sm outline-none focus:border-zinc-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Quantity</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={logQty}
                      onChange={(e) => handleQtyChange(e.target.value)}
                      className="w-full bg-black border border-zinc-700 text-zinc-100 text-xs p-2 rounded-sm outline-none focus:border-zinc-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Total Grams</label>
                    <input
                      type="number"
                      step="any"
                      value={logGrams}
                      onChange={(e) => setLogGrams(e.target.value)}
                      className="w-full bg-black border border-zinc-700 text-zinc-100 text-xs p-2 rounded-sm outline-none focus:border-zinc-300"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Scaled Nutrition */}
              <div className="space-y-3 border-t border-zinc-900 pt-4">
                <div className="text-xs uppercase font-bold text-zinc-400 tracking-wider">
                  3. Nutrition for this Log (auto-scales with qty)
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Calories (kcal) *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={logCalories}
                      onChange={(e) => setLogCalories(e.target.value)}
                      className="w-full bg-black border border-zinc-700 text-zinc-100 text-xs p-2 rounded-sm outline-none focus:border-zinc-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Protein (g) *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={logProtein}
                      onChange={(e) => setLogProtein(e.target.value)}
                      className="w-full bg-black border border-zinc-700 text-zinc-100 text-xs p-2 rounded-sm outline-none focus:border-zinc-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Carbs (g) *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={logCarbs}
                      onChange={(e) => setLogCarbs(e.target.value)}
                      className="w-full bg-black border border-zinc-700 text-zinc-100 text-xs p-2 rounded-sm outline-none focus:border-zinc-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Fat (g) *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={logFat}
                      onChange={(e) => setLogFat(e.target.value)}
                      className="w-full bg-black border border-zinc-700 text-zinc-100 text-xs p-2 rounded-sm outline-none focus:border-zinc-300 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Fiber (g)</label>
                    <input
                      type="number"
                      step="any"
                      value={logFiber}
                      onChange={(e) => setLogFiber(e.target.value)}
                      className="w-full bg-black border border-zinc-700 text-zinc-100 text-xs p-2 rounded-sm outline-none focus:border-zinc-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Sugar (g)</label>
                    <input
                      type="number"
                      step="any"
                      value={logSugar}
                      onChange={(e) => setLogSugar(e.target.value)}
                      className="w-full bg-black border border-zinc-700 text-zinc-100 text-xs p-2 rounded-sm outline-none focus:border-zinc-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Sodium (mg)</label>
                    <input
                      type="number"
                      step="any"
                      value={logSodium}
                      onChange={(e) => setLogSodium(e.target.value)}
                      className="w-full bg-black border border-zinc-700 text-zinc-100 text-xs p-2 rounded-sm outline-none focus:border-zinc-300"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-zinc-500 font-mono">
                  Portion string format encoded for phone:{' '}
                  <code className="text-zinc-300">
                    {encodePortion(
                      parseFloat(logQty) || 1,
                      logUnit,
                      parseFloat(logGrams) || 0,
                      parseInt(logTime.split(':')[0] || '12', 10)
                    )}
                  </code>
                </div>
              </div>

              {/* Buttons */}
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
                  {saving ? 'Saving...' : editingLog ? 'Update Log' : 'Save Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default LogsTab;
