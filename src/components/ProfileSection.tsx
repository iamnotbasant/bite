import React, { useState } from 'react';
import { UserRound } from 'lucide-react';
import { loadProfile, saveProfile, isProfileSet, type UserProfile } from '../utils/profile';
import { computeTargetsFromProfile } from '../utils/targets';

export const ProfileSection: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile());
  const [saved, setSaved] = useState(false);
  const auto = computeTargetsFromProfile(profile);

  const set = <K extends keyof UserProfile>(k: K, v: UserProfile[K]) => {
    setProfile((p) => ({ ...p, [k]: v }));
    setSaved(false);
  };

  const handleSave = () => {
    saveProfile(profile);
    setSaved(true);
    try {
      window.dispatchEvent(new Event('bite-profile-changed'));
    } catch {
      /* ignore */
    }
    setTimeout(() => setSaved(false), 2000);
  };

  const num = (v: string) => {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  };

  const inputCls =
    'w-full px-3 py-2 rounded-xl bg-black/70 border border-white/15 text-white text-sm focus:outline-none focus:border-white/60';

  return (
    <div className="p-4 sm:p-6 rounded-3xl bg-[#050506] border border-white/[0.10] border-t-white/[0.48] space-y-4">
      <div className="flex items-center gap-2">
        <UserRound size={16} className="text-white" />
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">Profile</span>
        {isProfileSet(profile) && (
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-semibold">
            Auto targets: {auto.calories} kcal
          </span>
        )}
      </div>
      <p className="text-[11px] text-zinc-400 -mt-2">
        Profile bharo — calorie/protein targets Mifflin-St Jeor formula se apne aap banenge (native app wala hisaab).
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] text-zinc-400 mb-1">Age</label>
          <input type="number" min="1" value={profile.age || ''} onChange={(e) => set('age', num(e.target.value))} className={inputCls} placeholder="20" />
        </div>
        <div>
          <label className="block text-[11px] text-zinc-400 mb-1">Weight (kg)</label>
          <input type="number" min="1" step="0.1" value={profile.weightKg || ''} onChange={(e) => set('weightKg', num(e.target.value))} className={inputCls} placeholder="50" />
        </div>
        <div>
          <label className="block text-[11px] text-zinc-400 mb-1">Height (cm)</label>
          <input type="number" min="1" value={profile.heightCm || ''} onChange={(e) => set('heightCm', num(e.target.value))} className={inputCls} placeholder="170" />
        </div>
        <div>
          <label className="block text-[11px] text-zinc-400 mb-1">Sex</label>
          <div className="grid grid-cols-2 gap-1 bg-black/70 p-0.5 rounded-xl border border-white/15">
            {(['Male', 'Female'] as const).map((s) => (
              <button key={s} type="button" onClick={() => set('sex', s)}
                className={`py-1.5 rounded-lg text-xs font-bold cursor-pointer ${profile.sex === s ? 'bg-white text-black' : 'text-zinc-400'}`}>{s}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-[11px] text-zinc-400 mb-1">Goal</label>
          <div className="grid grid-cols-3 gap-1 bg-black/70 p-0.5 rounded-xl border border-white/15">
            {(['Lose', 'Maintain', 'Gain'] as const).map((g) => (
              <button key={g} type="button" onClick={() => set('goalType', g)}
                className={`py-1.5 rounded-lg text-[11px] font-bold cursor-pointer ${profile.goalType === g ? 'bg-white text-black' : 'text-zinc-400'}`}>{g}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-[11px] text-zinc-400 mb-1">Rate (kg/week)</label>
          <input type="number" min="0" step="0.1" value={profile.rateKgPerWeek} onChange={(e) => set('rateKgPerWeek', num(e.target.value))} className={inputCls} />
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="px-4 py-2 rounded-full bg-white text-black text-xs font-black cursor-pointer"
      >
        {saved ? '✓ Saved' : 'Save Profile'}
      </button>
    </div>
  );
};
