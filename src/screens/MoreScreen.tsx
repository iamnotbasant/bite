import { useRef, useState } from 'react';
import { ChevronRight, Download, RefreshCw, Upload } from 'lucide-react';
import { useBite } from '../store';
import { Card, Divider, Field, inputCls, Row } from '../components/ui';
import { useSyncStatus } from '../hooks/useSyncStatus';
import { isSupabaseConfigured } from '../utils/supabase';
import { setSyncEnabled } from '../utils/syncEngine';
import { upsertWeightEntry, deleteWeightEntry } from '../utils/weight';
import { computeTargetsFromProfile } from '../utils/targets';
import { C } from '../theme';

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[13px] font-semibold text-[#9A9AA5] mb-1.5 mt-6">{children}</div>;
}

function timeAgo(iso: string | null): string {
  if (!iso) return 'kabhi nahi';
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'abhi-abhi';
  if (s < 3600) return `${Math.floor(s / 60)} min pehle`;
  if (s < 86400) return `${Math.floor(s / 3600)} ghante pehle`;
  return `${Math.floor(s / 86400)} din pehle`;
}

export function MoreScreen() {
  const store = useBite();
  const { profile, setProfile, goals, deviceId, resetIdentity, linkDevice } = store;
  const sync = useSyncStatus();
  const [showProfile, setShowProfile] = useState(false);
  const [showSync, setShowSync] = useState(false);
  const [showWeight, setShowWeight] = useState(false);
  const [showBackup, setShowBackup] = useState(false);
  const [linkId, setLinkId] = useState('');
  const [linkErr, setLinkErr] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [wDate, setWDate] = useState(store.todayStr);
  const [wKg, setWKg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [importMsg, setImportMsg] = useState('');

  const doLink = () => {
    const ok = linkDevice(linkId);
    setLinkErr(!ok);
  };

  const doExport = () => {
    const blob = new Blob([store.exportJson()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `bite-backup-${store.todayStr}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const doImportFile = (f: File | undefined) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const ok = store.importJson(String(r.result || ''));
      setImportMsg(ok ? 'Backup wapas aa gaya ✓' : 'File samajh nahi aayi');
      setTimeout(() => setImportMsg(''), 3000);
    };
    r.readAsText(f);
  };

  const addWeight = () => {
    const kg = parseFloat(wKg);
    if (isNaN(kg) || kg <= 0 || kg > 500) return;
    store.setWeight(upsertWeightEntry(wDate, Math.round(kg * 10) / 10));
    setWKg('');
  };

  const maxW = Math.max(...store.weight.map((w) => w.kg), 0);
  const minW = Math.min(...store.weight.map((w) => w.kg), 0);

  return (
    <div className="px-4 pt-6 pb-32 md:max-w-[600px] md:mx-auto">
      <h1 className="text-[30px] font-bold text-white mb-4">More</h1>

      {/* Profile */}
      <SectionLabel>Profile</SectionLabel>
      <Card className="!p-4">
        <Row
          title="Body profile"
          subtitle={
            store.profileSet
              ? `${profile.weightKg} kg · ${profile.heightCm} cm · ${profile.age}y · ${profile.goalType}`
              : 'Set up karo — targets apne aap banenge'
          }
          onClick={() => setShowProfile(!showProfile)}
          right={<ChevronRight size={20} color={C.chevron} className={`transition-transform ${showProfile ? 'rotate-90' : ''}`} />}
        />
        {showProfile && (
          <div className="pt-2">
            <Divider />
            <div className="grid grid-cols-3 gap-3 mt-4">
              <Field label="Weight (kg)">
                <input type="number" value={profile.weightKg || ''} onChange={(e) => setProfile({ weightKg: Number(e.target.value) || 0 })} className={inputCls} inputMode="decimal" />
              </Field>
              <Field label="Height (cm)">
                <input type="number" value={profile.heightCm || ''} onChange={(e) => setProfile({ heightCm: Number(e.target.value) || 0 })} className={inputCls} inputMode="decimal" />
              </Field>
              <Field label="Age">
                <input type="number" value={profile.age || ''} onChange={(e) => setProfile({ age: Number(e.target.value) || 0 })} className={inputCls} inputMode="numeric" />
              </Field>
            </div>
            <Field label="Sex">
              <div className="flex gap-2">
                {['Male', 'Female'].map((s) => (
                  <button key={s} type="button" onClick={() => setProfile({ sex: s })}
                    className={`flex-1 py-2.5 rounded-[12px] text-[14px] font-semibold cursor-pointer ${profile.sex === s ? 'bg-[#4F8FF7] text-white' : 'bg-[#262632] text-[#9A9AA5]'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Goal">
              <div className="flex gap-2">
                {['Lose', 'Maintain', 'Gain'].map((g) => (
                  <button key={g} type="button" onClick={() => setProfile({ goalType: g })}
                    className={`flex-1 py-2.5 rounded-[12px] text-[14px] font-semibold cursor-pointer ${profile.goalType === g ? 'bg-[#4F8FF7] text-white' : 'bg-[#262632] text-[#9A9AA5]'}`}>
                    {g}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Activity">
              <div className="flex gap-2">
                {[{ l: 'Low', v: 1.2 }, { l: 'Medium', v: 1.55 }, { l: 'High', v: 1.9 }].map((a) => (
                  <button key={a.l} type="button" onClick={() => setProfile({ activityLevel: a.v })}
                    className={`flex-1 py-2.5 rounded-[12px] text-[14px] font-semibold cursor-pointer ${profile.activityLevel === a.v ? 'bg-[#4F8FF7] text-white' : 'bg-[#262632] text-[#9A9AA5]'}`}>
                    {a.l}
                  </button>
                ))}
              </div>
            </Field>
            <div className="text-[12.5px] text-[#5E5E6C] leading-relaxed">
              Targets: {goals.calorieGoal} kcal · P {goals.proteinGoal}g · C {goals.carbsGoal}g · F {goals.fatGoal}g
              {profile.targetsManuallyEdited ? ' (manual)' : ' (auto)'}
            </div>
          </div>
        )}
        <Divider />
        <Row
          title="Edit targets manually"
          subtitle={`${goals.calorieGoal} kcal · P ${goals.proteinGoal}g · F ${goals.fatGoal}g · C ${goals.carbsGoal}g`}
          onClick={() => setShowProfile(true)}
          right={<TargetEditor />}
        />
      </Card>

      {/* Cloud Sync */}
      <SectionLabel>Cloud Sync</SectionLabel>
      <Card className="!p-4">
        {!isSupabaseConfigured() ? (
          <div className="text-[13px] text-[#5E5E6C] leading-relaxed">
            Cloud sync is configured nahi hai is build me. Data sirf isi browser me rahega.
          </div>
        ) : (
          <>
            <Row
              title="Supabase Sync"
              subtitle="Food logs, custom foods & goals"
              right={
                <button
                  type="button"
                  role="switch"
                  aria-checked={sync.enabled}
                  onClick={() => setSyncEnabled(!sync.enabled)}
                  className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer ${sync.enabled ? 'bg-[#3ECF8E]' : 'bg-[#2E2E3A]'}`}
                >
                  <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${sync.enabled ? 'translate-x-5' : ''}`} />
                </button>
              }
            />
            <Divider />
            <div className="py-3 space-y-1.5">
              <div className="flex items-center gap-2 text-[13px]">
                <span className={`w-2 h-2 rounded-full ${sync.lastError ? 'bg-[#F0714F]' : sync.syncing ? 'bg-[#F2C14E]' : 'bg-[#3ECF8E]'}`} />
                <span className="text-[#9A9AA5] font-medium">
                  {sync.syncing ? 'Syncing…' : sync.lastError ? `Error: ${sync.lastError}` : sync.lastSyncIso ? 'Synced' : 'Abhi sync nahi hua'}
                </span>
              </div>
              <div className="text-[12px] text-[#5E5E6C]">Last synced: {timeAgo(sync.lastSyncIso)}</div>
              <div className="text-[12px] text-[#5E5E6C]">Pending changes: {sync.pendingCount}</div>
              <div className="text-[12px] text-[#5E5E6C] font-mono break-all">Device id: {deviceId.slice(0, 8)}…</div>
            </div>
            <Divider />
            <div className="flex gap-2.5 py-3">
              <button
                type="button"
                onClick={() => store.doSyncNow()}
                disabled={!sync.enabled || sync.syncing}
                className="flex-1 h-11 rounded-[12px] bg-[#4F8FF7] text-white text-[14px] font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              >
                <RefreshCw size={16} className={sync.syncing ? 'animate-spin' : ''} />
                {sync.syncing ? 'Syncing…' : 'Sync Now'}
              </button>
              {!confirmReset ? (
                <button type="button" onClick={() => setConfirmReset(true)} className="flex-1 h-11 rounded-[12px] bg-[#262633] text-[#F0714F] text-[13px] font-bold cursor-pointer">
                  Reset identity
                </button>
              ) : (
                <button type="button" onClick={() => { resetIdentity(); setConfirmReset(false); }} className="flex-1 h-11 rounded-[12px] bg-[#F0714F]/15 text-[#F0714F] text-[13px] font-bold cursor-pointer">
                  Pakka? Nayi ID
                </button>
              )}
            </div>
            <Divider />
            <div className="py-3">
              <button type="button" onClick={() => setShowSync(!showSync)} className="text-[13px] text-[#4F8FF7] font-semibold cursor-pointer">
                {showSync ? '− Hide' : '+ Link phone\'s device'}
              </button>
              {showSync && (
                <div className="mt-2.5">
                  <div className="text-[12px] text-[#5E5E6C] leading-relaxed mb-2">
                    Phone ke Bite app → Settings → Cloud Sync se Device ID copy karke yahan paste karo — dono ek hi hisaab ban jayenge.
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={linkId}
                      onChange={(e) => { setLinkId(e.target.value); setLinkErr(false); }}
                      placeholder="phone wali device ID paste karo"
                      className="flex-1 px-3.5 py-2.5 rounded-[12px] bg-[#141418] border border-white/10 text-white text-[12px] font-mono placeholder:text-[#5E5E6C]"
                    />
                    <button type="button" onClick={doLink} className="px-5 rounded-full bg-white text-black text-[13px] font-bold cursor-pointer">
                      Link
                    </button>
                  </div>
                  {linkErr && <div className="text-[12px] text-[#F0714F] mt-1.5">ID sahi nahi lag rahi — dobara copy karke paste karo</div>}
                </div>
              )}
            </div>
          </>
        )}
      </Card>

      {/* Weight */}
      <SectionLabel>Weight</SectionLabel>
      <Card className="!p-4">
        <Row
          title="Weight entries"
          subtitle={store.weight.length > 0 ? `${store.weight[store.weight.length - 1].kg} kg · ${store.weight.length} entries (sirf is browser me)` : 'Abhi koi entry nahi (sirf is browser me)'}
          onClick={() => setShowWeight(!showWeight)}
          right={<ChevronRight size={20} color={C.chevron} className={`transition-transform ${showWeight ? 'rotate-90' : ''}`} />}
        />
        {showWeight && (
          <div className="pt-3">
            <Divider />
            {store.weight.length > 1 && <WeightChart entries={store.weight} minW={minW} maxW={maxW} />}
            <div className="flex gap-2 mt-3">
              <input type="date" value={wDate} onChange={(e) => setWDate(e.target.value)} className="flex-1 px-3.5 py-2.5 rounded-[12px] bg-[#141418] border border-white/10 text-white text-[13px] [color-scheme:dark]" />
              <input type="number" value={wKg} onChange={(e) => setWKg(e.target.value)} placeholder="kg" className="w-24 px-3.5 py-2.5 rounded-[12px] bg-[#141418] border border-white/10 text-white text-[13px]" inputMode="decimal" />
              <button type="button" onClick={addWeight} className="px-5 rounded-[12px] bg-[#4F8FF7] text-white text-[13px] font-bold cursor-pointer">
                Add
              </button>
            </div>
            <div className="mt-2 max-h-44 overflow-y-auto">
              {[...store.weight].reverse().slice(0, 12).map((w) => (
                <div key={w.date} className="flex items-center justify-between py-2 border-b border-white/[0.05] last:border-0">
                  <span className="text-[13px] text-[#9A9AA5]">{w.date}</span>
                  <span className="text-[14px] font-bold text-white tnum">{w.kg} kg</span>
                  <button type="button" onClick={() => store.setWeight(deleteWeightEntry(w.date))} className="text-[12px] text-[#5E5E6C] cursor-pointer">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Backup */}
      <SectionLabel>Backup</SectionLabel>
      <Card className="!p-4">
        <Row title="JSON backup" subtitle="Logs, foods, goals, profile, weight" onClick={() => setShowBackup(!showBackup)}
          right={<ChevronRight size={20} color={C.chevron} className={`transition-transform ${showBackup ? 'rotate-90' : ''}`} />} />
        {showBackup && (
          <div className="pt-3">
            <Divider />
            <div className="flex gap-2.5 mt-3">
              <button type="button" onClick={doExport} className="flex-1 h-11 rounded-[12px] bg-[#262632] text-white text-[13.5px] font-bold flex items-center justify-center gap-2 cursor-pointer">
                <Download size={16} /> Export
              </button>
              <button type="button" onClick={() => fileRef.current?.click()} className="flex-1 h-11 rounded-[12px] bg-[#262632] text-white text-[13.5px] font-bold flex items-center justify-center gap-2 cursor-pointer">
                <Upload size={16} /> Import
              </button>
              <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => { doImportFile(e.target.files?.[0]); e.target.value = ''; }} />
            </div>
            {importMsg && <div className="text-[12.5px] text-[#3ECF8E] mt-2">{importMsg}</div>}
            <div className="text-[12px] text-[#5E5E6C] mt-2">Backup offline hai — file tumhare paas rehti hai.</div>
          </div>
        )}
      </Card>

      {/* About */}
      <SectionLabel>About</SectionLabel>
      <Card className="!p-4">
        <div className="flex items-center justify-between py-1">
          <span className="text-[16px] font-bold text-white">Bite Web</span>
          <span className="text-[12px] text-[#9A9AA5] font-semibold">native jaisa · shared DB</span>
        </div>
      </Card>
      <div className="h-4" />
    </div>
  );
}

function TargetEditor() {
  const { goals, setGoalsManual, profile } = useBite();
  const [open, setOpen] = useState(false);
  const [v, setV] = useState({ c: goals.calorieGoal, p: goals.proteinGoal, f: goals.fatGoal, cb: goals.carbsGoal });

  if (!open) {
    return (
      <button type="button" onClick={(e) => { e.stopPropagation(); setV({ c: goals.calorieGoal, p: goals.proteinGoal, f: goals.fatGoal, cb: goals.carbsGoal }); setOpen(true); }}
        className="text-[13px] font-bold text-[#4F8FF7] cursor-pointer">
        Edit
      </button>
    );
  }
  const save = () => {
    setGoalsManual({ calorieGoal: v.c || 0, proteinGoal: v.p || 0, fatGoal: v.f || 0, carbsGoal: v.cb || 0 });
    setOpen(false);
  };
  const auto = computeTargetsFromProfile(profile);
  return (
    <div className="py-2" onClick={(e) => e.stopPropagation()}>
      <div className="grid grid-cols-4 gap-2">
        {([['c', 'kcal'], ['p', 'P g'], ['f', 'F g'], ['cb', 'C g']] as const).map(([k, label]) => (
          <label key={k} className="block">
            <span className="text-[11px] text-[#5E5E6C]">{label}</span>
            <input type="number" value={v[k] || ''} onChange={(e) => setV({ ...v, [k]: Number(e.target.value) || 0 })}
              className="w-full mt-1 px-2.5 py-2 rounded-[10px] bg-[#141418] border border-white/10 text-white text-[13px] tnum" inputMode="numeric" />
          </label>
        ))}
      </div>
      <div className="flex gap-2 mt-2.5">
        <button type="button" onClick={save} className="flex-1 py-2.5 rounded-[10px] bg-[#4F8FF7] text-white text-[13px] font-bold cursor-pointer">Save</button>
        {auto.calories > 0 && (
          <button type="button" onClick={() => { setV({ c: auto.calories, p: auto.protein, f: auto.fat, cb: auto.carbs }); }}
            className="flex-1 py-2.5 rounded-[10px] bg-[#262632] text-[#9A9AA5] text-[13px] font-semibold cursor-pointer">Auto wapas</button>
        )}
        <button type="button" onClick={() => setOpen(false)} className="px-4 py-2.5 rounded-[10px] text-[#5E5E6C] text-[13px] cursor-pointer">✕</button>
      </div>
    </div>
  );
}

function WeightChart({ entries, minW, maxW }: { entries: { date: string; kg: number }[]; minW: number; maxW: number }) {
  const W = 320;
  const H = 110;
  const pad = 8;
  const range = Math.max(1, maxW - minW);
  const pts = entries.slice(-20).map((e, i, arr) => {
    const x = pad + (i / Math.max(1, arr.length - 1)) * (W - pad * 2);
    const y = H - pad - ((e.kg - minW) / range) * (H - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full mt-2">
      <polyline points={pts.join(' ')} fill="none" stroke="#9B86EE" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {entries.slice(-20).map((e, i, arr) => {
        const x = pad + (i / Math.max(1, arr.length - 1)) * (W - pad * 2);
        const y = H - pad - ((e.kg - minW) / range) * (H - pad * 2);
        return <circle key={e.date} cx={x} cy={y} r="3" fill="#9B86EE" />;
      })}
    </svg>
  );
}
