import React, { useState } from 'react';
import { Scale, Trash2 } from 'lucide-react';
import { loadWeightEntries, upsertWeightEntry, deleteWeightEntry } from '../utils/weight';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export const WeightSection: React.FC = () => {
  const [entries, setEntries] = useState(() => loadWeightEntries());
  const [date, setDate] = useState(todayIso());
  const [kg, setKg] = useState('');

  const handleAdd = () => {
    const v = parseFloat(kg);
    if (!date || isNaN(v) || v <= 0) return;
    setEntries(upsertWeightEntry(date, Math.round(v * 10) / 10));
    setKg('');
  };

  const min = entries.length ? Math.min(...entries.map((e) => e.kg)) : 0;
  const max = entries.length ? Math.max(...entries.map((e) => e.kg)) : 0;
  const W = 300, H = 90, P = 8;
  const pts = entries.map((e, i) => {
    const x = entries.length === 1 ? W / 2 : P + (i / (entries.length - 1)) * (W - 2 * P);
    const y = max === min ? H / 2 : H - P - ((e.kg - min) / (max - min)) * (H - 2 * P);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="p-4 sm:p-6 rounded-3xl bg-[#050506] border border-white/[0.10] border-t-white/[0.48] space-y-4">
      <div className="flex items-center gap-2">
        <Scale size={16} className="text-white" />
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">Weight</span>
        <span className="ml-auto text-[10px] text-zinc-500">sirf is device par (local)</span>
      </div>

      <div className="flex gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-2 rounded-xl bg-black/70 border border-white/15 text-white text-xs focus:outline-none focus:border-white/60"
        />
        <input
          type="number"
          step="0.1"
          min="1"
          value={kg}
          onChange={(e) => setKg(e.target.value)}
          placeholder="kg"
          className="w-24 px-3 py-2 rounded-xl bg-black/70 border border-white/15 text-white text-xs focus:outline-none focus:border-white/60"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-4 py-2 rounded-full bg-white text-black text-xs font-black cursor-pointer"
        >
          Add
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="text-[11px] text-zinc-500">Abhi koi weight entry nahi — upar se pehli entry jodo.</p>
      ) : (
        <>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-24">
            <polyline points={pts} fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
            {entries.map((e, i) => {
              const x = entries.length === 1 ? W / 2 : P + (i / (entries.length - 1)) * (W - 2 * P);
              const y = max === min ? H / 2 : H - P - ((e.kg - min) / (max - min)) * (H - 2 * P);
              return <circle key={e.date} cx={x} cy={y} r="3" fill="#fff" />;
            })}
          </svg>
          <div className="space-y-1 max-h-40 overflow-y-auto no-scrollbar">
            {[...entries].reverse().map((e) => (
              <div key={e.date} className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs">
                <span className="text-zinc-400">{e.date}</span>
                <span className="text-white font-bold">{e.kg} kg</span>
                <button
                  type="button"
                  onClick={() => setEntries(deleteWeightEntry(e.date))}
                  className="p-1 text-zinc-500 hover:text-rose-300 cursor-pointer"
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
