import React, { useRef, useState } from 'react';
import { Download, Upload, Database } from 'lucide-react';

const BITE_KEYS = [
  'bite_device_uuid',
  'bite_profile_v1',
  'bite_sync_queue_v1',
  'bite_sync_tombstones_v1',
  'bite_sync_state_v1',
  'bite_sync_stamps_v1',
  'bite_weight_entries_v1',
  'fuel_app_week_logs_v7',
  'fuel_app_custom_foods_v1',
  'fuel_app_theme_v1',
  'fuel_app_card_style_v1',
  'fuel-last-category',
];

export const BackupSection: React.FC = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(null), 2500);
  };

  const handleExport = () => {
    const data: Record<string, unknown> = {};
    for (const k of BITE_KEYS) {
      try {
        const v = localStorage.getItem(k);
        if (v !== null) data[k] = JSON.parse(v);
      } catch {
        /* skip */
      }
    }
    const blob = new Blob([JSON.stringify({ app: 'bite-web', exportedAt: new Date().toISOString(), data }, null, 2)], {
      type: 'application/json',
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `bite-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    flash('✓ Backup download ho gaya');
  };

  const handleImportFile = (f: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const data = parsed.data || parsed;
        let n = 0;
        for (const k of BITE_KEYS) {
          if (data[k] !== undefined) {
            localStorage.setItem(k, JSON.stringify(data[k]));
            n++;
          }
        }
        flash(n > 0 ? `✓ ${n} sections restore ho gaye — page refresh karo` : 'File me kuch nahi mila');
      } catch {
        flash('File samajh nahi aayi');
      }
    };
    reader.readAsText(f);
  };

  return (
    <div className="p-4 sm:p-6 rounded-3xl bg-[#050506] border border-white/[0.10] border-t-white/[0.48] space-y-3">
      <div className="flex items-center gap-2">
        <Database size={16} className="text-white" />
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">Backup</span>
      </div>
      <p className="text-[11px] text-zinc-400 -mt-1">Apna saara data JSON file me download karo, ya purani file se wapas lao.</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleExport}
          className="px-4 py-2 rounded-full bg-white/10 border border-white/15 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-white/20 cursor-pointer"
        >
          <Download size={13} /> Export JSON
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="px-4 py-2 rounded-full bg-white/10 border border-white/15 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-white/20 cursor-pointer"
        >
          <Upload size={13} /> Import JSON
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleImportFile(f);
            e.target.value = '';
          }}
        />
      </div>
      {msg && <p className="text-[11px] text-emerald-300">{msg}</p>}
    </div>
  );
};
