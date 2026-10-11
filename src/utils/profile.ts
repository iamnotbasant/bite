import type { ProfileInput } from './targets';

export interface UserProfile extends ProfileInput {
  /** when true the user overrode targets by hand and auto-compute is paused */
  targetsManuallyEdited: boolean;
}

const KEY = 'bite_profile_v1';

export const DEFAULT_PROFILE: UserProfile = {
  weightKg: 0,
  heightCm: 0,
  age: 0,
  sex: 'Male',
  goalType: 'Maintain',
  rateKgPerWeek: 0.5,
  activityLevel: 1.2,
  targetsManuallyEdited: false,
};

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_PROFILE, ...parsed };
    }
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_PROFILE };
}

export function saveProfile(p: UserProfile): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export function isProfileSet(p: UserProfile): boolean {
  return p.weightKg > 0 && p.heightCm > 0 && p.age > 0;
}
