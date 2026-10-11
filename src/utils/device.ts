/**
 * Device identity — no login. One persistent UUID per browser, used as
 * `user_id` for every Supabase row so the web app shares ONE database
 * with the native Android app (which uses its own device UUID the same way).
 */

const KEY = 'bite_device_uuid';

function makeUuid(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through */
  }
  // RFC4122 v4 fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getDeviceUuid(): string {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = makeUuid();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return makeUuid();
  }
}

/** Wipes the identity — next call generates a fresh one. Requires user confirm in UI. */
export function resetDeviceUuid(): string {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  return getDeviceUuid();
}
