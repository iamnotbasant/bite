import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { DayLog, FoodLibraryItem, MealItem } from './types';
import {
  addCustomFood as addCustomFoodStore,
  addMealToDay,
  calculateDayTotals,
  DEFAULT_GOALS,
  deleteCustomFood as deleteCustomFoodStore,
  loadCustomFoods,
  loadGoals,
  loadWeekLogs,
  removeMealFromDay,
  saveCustomFoods,
  saveGoals,
  saveWeekLogs,
  updateCustomFood as updateCustomFoodStore,
  type GlobalGoals,
} from './utils/storage';
import {
  DEFAULT_PROFILE,
  isProfileSet,
  loadProfile,
  saveProfile,
  type UserProfile,
} from './utils/profile';
import { computeTargetsFromProfile } from './utils/targets';
import { loadWeightEntries, saveWeightEntries, type WeightEntry } from './utils/weight';
import { getDeviceUuid, resetDeviceUuid } from './utils/device';
import {
  enqueueOp,
  loadSyncState,
  subscribeSync,
  syncNow,
  type SyncCallbacks,
  type SyncState,
} from './utils/syncEngine';
import { isSupabaseConfigured } from './utils/supabase';

export type TabKey = 'dashboard' | 'foodlog' | 'analytics' | 'more';

const FAV_KEY = 'bite_favorite_foods_v1';

function loadFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {
    /* ignore */
  }
  return new Set();
}

export interface BiteStore {
  tab: TabKey;
  setTab: (t: TabKey) => void;
  logs: DayLog[];
  addMeal: (date: string, meal: Omit<MealItem, 'id' | 'timestamp'> & { timestamp?: string }) => void;
  removeMeal: (date: string, mealId: string) => void;
  dayTotals: (date: string) => { calories: number; protein: number; carbs: number; fat: number; fiber: number };
  getDay: (date: string) => DayLog | undefined;
  customFoods: FoodLibraryItem[];
  addCustomFood: (f: Omit<FoodLibraryItem, 'id'>) => FoodLibraryItem;
  updateCustomFood: (f: FoodLibraryItem) => void;
  removeCustomFood: (id: string) => void;
  favorites: Set<string>;
  toggleFavorite: (id: string) => void;
  goals: GlobalGoals;
  setGoalsManual: (g: Partial<GlobalGoals>) => void;
  profile: UserProfile;
  setProfile: (p: Partial<UserProfile>) => void;
  profileSet: boolean;
  weight: WeightEntry[];
  setWeight: (entries: WeightEntry[]) => void;
  sync: SyncState;
  doSyncNow: () => Promise<boolean>;
  deviceId: string;
  resetIdentity: () => void;
  linkDevice: (uuid: string) => boolean;
  exportJson: () => string;
  importJson: (json: string) => boolean;
  todayStr: string;
}

const BiteContext = createContext<BiteStore | null>(null);

export function useBite(): BiteStore {
  const s = useContext(BiteContext);
  if (!s) throw new Error('useBite outside provider');
  return s;
}

function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function BiteProvider({ children }: { children: React.ReactNode }) {
  const [tab, setTab] = useState<TabKey>('dashboard');
  const [logs, setLogs] = useState<DayLog[]>(() => loadWeekLogs());
  const [customFoods, setCustomFoods] = useState<FoodLibraryItem[]>(() => loadCustomFoods());
  const [goals, setGoalsState] = useState<GlobalGoals>(() => loadGoals());
  const [profile, setProfileState] = useState<UserProfile>(() => loadProfile());
  const [weight, setWeightState] = useState<WeightEntry[]>(() => loadWeightEntries());
  const [favorites, setFavorites] = useState<Set<string>>(loadFavorites);
  const [sync, setSync] = useState<SyncState>(() => loadSyncState());
  const [deviceId, setDeviceId] = useState<string>(() => getDeviceUuid());
  const todayStr = useMemo(() => todayLocal(), []);

  // keep refs fresh for sync callbacks
  const logsRef = useRef(logs);
  const foodsRef = useRef(customFoods);
  const goalsRef = useRef(goals);
  useEffect(() => {
    logsRef.current = logs;
  }, [logs]);
  useEffect(() => {
    foodsRef.current = customFoods;
  }, [customFoods]);
  useEffect(() => {
    goalsRef.current = goals;
  }, [goals]);

  useEffect(() => saveWeekLogs(logs), [logs]);
  useEffect(() => saveCustomFoods(customFoods), [customFoods]);
  useEffect(() => saveGoals(goals), [goals]);
  useEffect(() => saveProfile(profile), [profile]);
  useEffect(() => saveWeightEntries(weight), [weight]);
  useEffect(() => {
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify([...favorites]));
    } catch {
      /* ignore */
    }
  }, [favorites]);

  useEffect(() => subscribeSync(setSync), []);

  const syncCallbacks: SyncCallbacks = useMemo(
    () => ({
      getLogs: () => logsRef.current,
      setLogs: (l) => setLogs(l),
      getCustomFoods: () => foodsRef.current,
      setCustomFoods: (f) => setCustomFoods(f),
      getGoals: () => goalsRef.current,
      setGoals: (g) => setGoalsState(g),
    }),
    []
  );

  const doSyncNow = useCallback(async () => {
    return syncNow(syncCallbacks);
  }, [syncCallbacks]);

  // auto-sync on load + on reconnect (once)
  const autoSynced = useRef(false);
  useEffect(() => {
    if (autoSynced.current) return;
    autoSynced.current = true;
    if (isSupabaseConfigured() && navigator.onLine) {
      const t = setTimeout(() => {
        syncNow(syncCallbacks).catch(() => {});
      }, 1500);
      const onOnline = () => syncNow(syncCallbacks).catch(() => {});
      window.addEventListener('online', onOnline);
      return () => {
        clearTimeout(t);
        window.removeEventListener('online', onOnline);
      };
    }
    return undefined;
  }, [syncCallbacks]);

  const addMeal = useCallback((date: string, meal: Omit<MealItem, 'id' | 'timestamp'> & { timestamp?: string }) => {
    setLogs((prev) => addMealToDay(prev, date, meal));
  }, []);

  const removeMeal = useCallback((date: string, mealId: string) => {
    setLogs((prev) => removeMealFromDay(prev, date, mealId));
  }, []);

  const dayTotals = useCallback(
    (date: string) => {
      const d = logs.find((l) => l.date === date);
      if (!d) return { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
      return calculateDayTotals(d);
    },
    [logs]
  );

  const getDay = useCallback((date: string) => logs.find((l) => l.date === date), [logs]);

  const addCustomFood = useCallback((f: Omit<FoodLibraryItem, 'id'>) => {
    const item = addCustomFoodStore(f);
    setCustomFoods((prev) => [item, ...prev]);
    return item;
  }, []);

  const updateCustomFood = useCallback((f: FoodLibraryItem) => {
    setCustomFoods(updateCustomFoodStore(f));
  }, []);

  const removeCustomFood = useCallback((id: string) => {
    setCustomFoods(deleteCustomFoodStore(id));
    setFavorites((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }, []);

  const setGoalsManual = useCallback((g: Partial<GlobalGoals>) => {
    setGoalsState((prev) => {
      const next = { ...prev, ...g, updatedAt: new Date().toISOString() };
      enqueueOp({ kind: 'upsert-goals', goals: next });
      return next;
    });
    setProfileState((prev) => ({ ...prev, targetsManuallyEdited: true }));
  }, []);

  const setProfile = useCallback((p: Partial<UserProfile>) => {
    setProfileState((prev) => {
      const next = { ...prev, ...p, targetsManuallyEdited: false };
      const t = computeTargetsFromProfile(next);
      if (t.calories > 0) {
        setGoalsState((gp) => {
          const ng = {
            ...gp,
            calorieGoal: t.calories,
            proteinGoal: t.protein,
            fatGoal: t.fat,
            carbsGoal: t.carbs,
            updatedAt: new Date().toISOString(),
          };
          enqueueOp({ kind: 'upsert-goals', goals: ng });
          return ng;
        });
      }
      return next;
    });
  }, []);

  const setWeight = useCallback((entries: WeightEntry[]) => {
    setWeightState(entries);
  }, []);

  const resetIdentity = useCallback(() => {
    const id = resetDeviceUuid();
    setDeviceId(id);
  }, []);

  const linkDevice = useCallback((uuid: string) => {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid.trim())) return false;
    try {
      localStorage.setItem('bite_device_uuid', uuid.trim());
    } catch {
      return false;
    }
    window.location.reload();
    return true;
  }, []);

  const exportJson = useCallback(() => {
    return JSON.stringify(
      {
        app: 'bite-web',
        version: 1,
        exportedAt: new Date().toISOString(),
        deviceId: getDeviceUuid(),
        goals,
        profile,
        logs,
        customFoods,
        weight,
        favorites: [...favorites],
      },
      null,
      2
    );
  }, [goals, profile, logs, customFoods, weight, favorites]);

  const importJson = useCallback((json: string) => {
    try {
      const d = JSON.parse(json);
      if (!d || typeof d !== 'object') return false;
      if (Array.isArray(d.logs)) setLogs(d.logs);
      if (Array.isArray(d.customFoods)) setCustomFoods(d.customFoods);
      if (d.goals) setGoalsState({ ...DEFAULT_GOALS, ...d.goals });
      if (d.profile) setProfileState({ ...DEFAULT_PROFILE, ...d.profile });
      if (Array.isArray(d.weight)) setWeightState(d.weight);
      if (Array.isArray(d.favorites)) setFavorites(new Set(d.favorites));
      return true;
    } catch {
      return false;
    }
  }, []);

  const value: BiteStore = {
    tab,
    setTab,
    logs,
    addMeal,
    removeMeal,
    dayTotals,
    getDay,
    customFoods,
    addCustomFood,
    updateCustomFood,
    removeCustomFood,
    favorites,
    toggleFavorite,
    goals,
    setGoalsManual,
    profile,
    setProfile,
    profileSet: isProfileSet(profile),
    weight,
    setWeight,
    sync,
    doSyncNow,
    deviceId,
    resetIdentity,
    linkDevice,
    exportJson,
    importJson,
    todayStr,
  };

  return <BiteContext.Provider value={value}>{children}</BiteContext.Provider>;
}
