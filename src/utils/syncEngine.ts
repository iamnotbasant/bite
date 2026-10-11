/**
 * Offline-first two-way sync engine.
 * - Every local mutation enqueues an op (persisted in localStorage).
 * - syncNow(): push pending ops -> pull remote (by user_id) -> merge last-write-wins.
 * - Deletes use tombstones so a pulled row can't resurrect a deleted one.
 */
import type { DayLog, FoodLibraryItem, MealItem } from '../types';
import { getDeviceUuid } from './device';
import {
  isSupabaseConfigured,
  upsertFoodLogToSupabase,
  deleteFoodLogFromSupabase,
  upsertCustomFoodToSupabase,
  deleteCustomFoodFromSupabase,
  saveUserGoalsToSupabase,
  fetchFoodLogRows,
  fetchCustomFoodRows,
  fetchUserGoalsRow,
  foodLogFromRow,
  customFoodFromRow,
  type RemoteFoodLogRow,
} from './supabase';

// ---------------------------------------------------------------------------
// Pure merge helpers (unit-tested)
// ---------------------------------------------------------------------------

export interface StampedRow {
  id: string;
  stamp: string; // ISO timestamp for last-write-wins comparison
}

export function stampOf(row: { updated_at?: string | null; timestamp?: string | null; created_at?: string | null }): string {
  return row.updated_at || row.timestamp || row.created_at || '';
}

/** last-write-wins: returns ids where the REMOTE row is newer than local. */
export function remoteWinsIds(
  local: Map<string, string>, // id -> stamp
  remote: StampedRow[],
  tombstoned: Set<string>
): Set<string> {
  const wins = new Set<string>();
  for (const r of remote) {
    if (tombstoned.has(r.id)) continue;
    const ls = local.get(r.id);
    if (ls === undefined || r.stamp > ls) wins.add(r.id);
  }
  return wins;
}

/** Remove tombstones older than 7 days (they've had time to propagate). */
export function pruneTombstones(
  tombstones: { id: string; at: string }[],
  nowIso: string = new Date().toISOString()
): { id: string; at: string }[] {
  const cutoff = new Date(new Date(nowIso).getTime() - 7 * 24 * 3600 * 1000).toISOString();
  return tombstones.filter((t) => t.at >= cutoff);
}

// ---------------------------------------------------------------------------
// Persistent state
// ---------------------------------------------------------------------------

export type SyncOp =
  | { kind: 'upsert-log'; date: string; meal: MealItem }
  | { kind: 'delete-log'; id: string }
  | { kind: 'upsert-food'; food: FoodLibraryItem }
  | { kind: 'delete-food'; id: string }
  | { kind: 'upsert-goals'; goals: { calorieGoal: number; proteinGoal: number; carbsGoal: number; fatGoal: number; waterGoal: number } };

export interface SyncState {
  lastSyncIso: string | null;
  pendingCount: number;
  syncing: boolean;
  lastError: string | null;
  enabled: boolean;
}

const QUEUE_KEY = 'bite_sync_queue_v1';
const TOMBSTONE_KEY = 'bite_sync_tombstones_v1';
const STATE_KEY = 'bite_sync_state_v1';
const STAMPS_KEY = 'bite_sync_stamps_v1'; // id -> last known stamp (for merge)

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    /* ignore */
  }
  return fallback;
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function loadQueue(): SyncOp[] {
  return readJson<SyncOp[]>(QUEUE_KEY, []);
}
function saveQueue(q: SyncOp[]): void {
  writeJson(QUEUE_KEY, q);
}

export function enqueueOp(op: SyncOp): void {
  const q = loadQueue();
  q.push(op);
  saveQueue(q);
  notify({ ...loadSyncState(), pendingCount: q.length });
}

export function enqueueTombstone(id: string): void {
  const ts = readJson<{ id: string; at: string }[]>(TOMBSTONE_KEY, []);
  ts.push({ id, at: new Date().toISOString() });
  writeJson(TOMBSTONE_KEY, pruneTombstones(ts));
}

function tombstoneSet(): Set<string> {
  return new Set(readJson<{ id: string; at: string }[]>(TOMBSTONE_KEY, []).map((t) => t.id));
}

function loadStamps(): Record<string, string> {
  return readJson<Record<string, string>>(STAMPS_KEY, {});
}
function saveStamps(s: Record<string, string>): void {
  writeJson(STAMPS_KEY, s);
}

export function loadSyncState(): SyncState {
  const s = readJson<Partial<SyncState>>(STATE_KEY, {});
  return {
    lastSyncIso: s.lastSyncIso ?? null,
    pendingCount: loadQueue().length,
    syncing: false,
    lastError: s.lastError ?? null,
    enabled: s.enabled ?? true,
  };
}

function saveSyncState(s: SyncState): void {
  writeJson(STATE_KEY, {
    lastSyncIso: s.lastSyncIso,
    lastError: s.lastError,
    enabled: s.enabled,
  });
  notify(s);
}

// --- subscribers ------------------------------------------------------------

type Listener = (s: SyncState) => void;
const listeners = new Set<Listener>();

export function subscribeSync(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notify(s: SyncState): void {
  listeners.forEach((l) => {
    try {
      l(s);
    } catch {
      /* ignore */
    }
  });
}

export function setSyncEnabled(enabled: boolean): void {
  const s = loadSyncState();
  s.enabled = enabled;
  saveSyncState(s);
}

// --- day-log helpers --------------------------------------------------------

function emptyDay(date: string, goals: { calorieGoal: number; proteinGoal: number; carbsGoal: number; fatGoal: number; waterGoal: number }): DayLog {
  const d = new Date(date + 'T12:00:00');
  const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return {
    date,
    dayLabel: dayLabels[d.getDay()],
    displayDate: `${d.getDate()} ${months[d.getMonth()]}`,
    isToday: false,
    calorieGoal: goals.calorieGoal,
    proteinGoal: goals.proteinGoal,
    carbsGoal: goals.carbsGoal,
    fatGoal: goals.fatGoal,
    waterGoal: goals.waterGoal,
    waterIntake: 0,
    burnedCalories: 0,
    sugarLevel: 100,
    glucoseAverage: 100,
    timeInRange: 100,
    meals: [],
  };
}

// ---------------------------------------------------------------------------
// syncNow
// ---------------------------------------------------------------------------

export interface SyncCallbacks {
  getLogs: () => DayLog[];
  setLogs: (logs: DayLog[]) => void;
  getCustomFoods: () => FoodLibraryItem[];
  setCustomFoods: (foods: FoodLibraryItem[]) => void;
  getGoals: () => { calorieGoal: number; proteinGoal: number; carbsGoal: number; fatGoal: number; waterGoal: number; updatedAt: string };
  setGoals: (g: { calorieGoal: number; proteinGoal: number; carbsGoal: number; fatGoal: number; waterGoal: number; updatedAt: string }) => void;
}

let running = false;

export async function syncNow(cb: SyncCallbacks): Promise<boolean> {
  if (running) return false;
  const state = loadSyncState();
  if (!state.enabled || !isSupabaseConfigured()) {
    state.lastError = !isSupabaseConfigured() ? 'Cloud not configured' : state.lastError;
    notify(state);
    return false;
  }
  running = true;
  state.syncing = true;
  state.lastError = null;
  notify({ ...state });

  try {
    getDeviceUuid(); // ensure identity exists

    // 1) Push pending ops in order
    let queue = loadQueue();
    const remaining: SyncOp[] = [];
    for (const op of queue) {
      let ok = false;
      try {
        if (op.kind === 'upsert-log') ok = await upsertFoodLogToSupabase(op.date, op.meal);
        else if (op.kind === 'delete-log') ok = await deleteFoodLogFromSupabase(op.id);
        else if (op.kind === 'upsert-food') ok = await upsertCustomFoodToSupabase(op.food);
        else if (op.kind === 'delete-food') ok = await deleteCustomFoodFromSupabase(op.id);
        else if (op.kind === 'upsert-goals') ok = await saveUserGoalsToSupabase(op.goals);
      } catch {
        ok = false;
      }
      if (!ok) remaining.push(op);
    }
    saveQueue(remaining);
    queue = remaining;

    // 2) Pull remote
    const tombstoned = tombstoneSet();
    const stamps = loadStamps();
    const since = new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString().slice(0, 10);

    // --- food logs ---
    const remoteLogs = (await fetchFoodLogRows(since)) || [];
    {
      const localMeals = new Map<string, { stamp: string }>();
      for (const log of cb.getLogs()) {
        for (const m of log.meals) {
          const st = stamps[m.id] || m.timestamp || '';
          localMeals.set(m.id, { stamp: st });
        }
      }
      const stamped: (StampedRow & { row: RemoteFoodLogRow })[] = remoteLogs.map((r) => ({
        id: r.id,
        stamp: stampOf(r),
        row: r,
      }));
      const wins = remoteWinsIds(
        new Map([...localMeals].map(([id, v]) => [id, v.stamp])),
        stamped,
        tombstoned
      );
      if (wins.size > 0) {
        const logs = cb.getLogs().map((l) => ({ ...l, meals: [...l.meals] }));
        const goals = cb.getGoals();
        for (const w of stamped) {
          if (!wins.has(w.id)) continue;
          const { date, meal, updatedAt } = foodLogFromRow(w.row);
          let day = logs.find((l) => l.date === date);
          if (!day) {
            day = emptyDay(date, goals);
            logs.push(day);
          }
          const idx = day.meals.findIndex((m) => m.id === meal.id);
          if (idx >= 0) day.meals[idx] = meal;
          else day.meals.unshift(meal);
          stamps[meal.id] = updatedAt;
        }
        logs.sort((a, b) => (a.date < b.date ? -1 : 1));
        cb.setLogs(logs);
      }
      for (const r of remoteLogs) {
        if (!stamps[r.id]) stamps[r.id] = stampOf(r);
      }
    }

    // --- custom foods ---
    const remoteFoods = (await fetchCustomFoodRows()) || [];
    {
      const localFoods = cb.getCustomFoods();
      const localStamps = new Map(localFoods.map((f) => [f.id, stamps[f.id] || '']));
      const stamped = remoteFoods.map((r) => ({ id: r.id, stamp: stampOf(r) }));
      const wins = remoteWinsIds(localStamps, stamped, tombstoned);
      if (wins.size > 0) {
        const byId = new Map(localFoods.map((f) => [f.id, f]));
        for (const r of remoteFoods) {
          if (!wins.has(r.id)) continue;
          byId.set(r.id, customFoodFromRow(r));
          stamps[r.id] = stampOf(r);
        }
        cb.setCustomFoods([...byId.values()]);
      }
      for (const r of remoteFoods) {
        if (!stamps[r.id]) stamps[r.id] = stampOf(r);
      }
    }

    // --- goals ---
    {
      const remoteGoals = await fetchUserGoalsRow();
      const localGoals = cb.getGoals();
      if (remoteGoals && (remoteGoals.updated_at || '') > (localGoals.updatedAt || '')) {
        cb.setGoals({ ...remoteGoals, updatedAt: remoteGoals.updated_at || '' });
      } else if ((localGoals.updatedAt || '') > (remoteGoals?.updated_at || '')) {
        await saveUserGoalsToSupabase(localGoals);
      }
    }

    saveStamps(stamps);
    const done: SyncState = {
      lastSyncIso: new Date().toISOString(),
      pendingCount: loadQueue().length,
      syncing: false,
      lastError: null,
      enabled: true,
    };
    saveSyncState(done);
    running = false;
    return true;
  } catch (e) {
    const failed: SyncState = {
      ...loadSyncState(),
      syncing: false,
      lastError: e instanceof Error ? e.message : 'Sync failed',
    };
    notify(failed);
    running = false;
    return false;
  }
}
