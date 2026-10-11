import React, { useState } from 'react';
import { Cloud, CloudOff, RefreshCw, Trash2, User } from 'lucide-react';
import { useSyncStatus } from '../hooks/useSyncStatus';
import { loadSyncState, setSyncEnabled, syncNow, type SyncCallbacks } from '../utils/syncEngine';
import { isSupabaseConfigured } from '../utils/supabase';
import { getDeviceUuid, resetDeviceUuid } from '../utils/device';

function timeAgo(iso: string | null): string {
  if (!iso) return 'kabhi nahi';
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'abhi-abhi';
  if (s < 3600) return `${Math.floor(s / 60)} min pehle`;
  if (s < 86400) return `${Math.floor(s / 3600)} ghante pehle`;
  return `${Math.floor(s / 86400)} din pehle`;
}

export const CloudSyncSection: React.FC<{ getCallbacks: () => SyncCallbacks }> = ({ getCallbacks }) => {
  const status = useSyncStatus();
  const [confirmReset, setConfirmReset] = useState(false);
  const configured = isSupabaseConfigured();

  const handleSyncNow = async () => {
    await syncNow(getCallbacks());
  };

  return (
    <div className="p-4 sm:p-6 rounded-3xl bg-[#050506] border border-white/[0.10] border-t-white/[0.48] space-y-4">
      <div className="flex items-center gap-2">
        {configured ? <Cloud size={16} className="text-white" /> : <CloudOff size={16} className="text-zinc-500" />}
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">Cloud Sync</span>
        <span className={`ml-auto flex items-center gap-1.5 text-[11px] font-semibold ${status.syncing ? 'text-sky-300' : configured ? 'text-emerald-300' : 'text-zinc-500'}`}>
          <span className={`w-2 h-2 rounded-full ${status.syncing ? 'bg-sky-400 animate-pulse' : configured ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
          {status.syncing ? 'Sync ho raha hai…' : configured ? 'Connected' : 'Not configured'}
        </span>
      </div>

      {!configured && (
        <p className="text-[11px] text-zinc-400">
          Cloud abhi juda nahi hai — Vercel me VITE_SUPABASE_URL aur VITE_SUPABASE_ANON_KEY set karo, phir redeploy karo. Tab tak sab kuch phone/browser me safe rahega.
        </p>
      )}

      <div className="grid grid-cols-2 gap-2.5 text-center">
        <div className="p-3 rounded-2xl bg-black/60 border border-white/10">
          <div className="text-[10px] uppercase tracking-wider text-zinc-500">Last sync</div>
          <div className="text-sm font-bold text-white">{timeAgo(status.lastSyncIso)}</div>
        </div>
        <div className="p-3 rounded-2xl bg-black/60 border border-white/10">
          <div className="text-[10px] uppercase tracking-wider text-zinc-500">Pending</div>
          <div className="text-sm font-bold text-white">{status.pendingCount}</div>
        </div>
      </div>

      {status.lastError && (
        <p className="text-[11px] text-rose-300">Error: {status.lastError}</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleSyncNow}
          disabled={status.syncing || !configured}
          className="px-4 py-2 rounded-full bg-white text-black text-xs font-black flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
        >
          <RefreshCw size={13} className={status.syncing ? 'animate-spin' : ''} />
          Sync Now
        </button>
        <label className="flex items-center gap-2 text-[11px] text-zinc-400 cursor-pointer ml-auto">
          <input
            type="checkbox"
            checked={loadSyncState().enabled}
            onChange={(e) => setSyncEnabled(e.target.checked)}
            className="accent-white"
          />
          Auto-sync
        </label>
      </div>

      <div className="pt-2 border-t border-white/5">
        <p className="text-[10px] text-zinc-600 mb-1">Device ID (is browser ka pehchan — native app jaisa):</p>
        <p className="text-[10px] font-mono text-zinc-500 break-all">{getDeviceUuid()}</p>
        {!confirmReset ? (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="mt-2 text-[11px] text-zinc-500 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
          >
            <Trash2 size={11} /> Reset identity
          </button>
        ) : (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[11px] text-amber-300 flex items-center gap-1"><User size={11} /> Pakka? Nayi ID banegi.</span>
            <button
              type="button"
              onClick={() => { resetDeviceUuid(); setConfirmReset(false); }}
              className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-[11px] font-bold cursor-pointer"
            >
              Haan
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="px-3 py-1 rounded-full bg-white/10 text-zinc-300 text-[11px] cursor-pointer"
            >
              Ruko
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
