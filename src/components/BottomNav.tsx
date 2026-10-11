import { Apple, BarChart3, Home, MoreHorizontal, Plus } from 'lucide-react';
import type { TabKey } from '../store';

/**
 * Native-style floating bottom nav: 5 icon-only cells, selected cell gets a
 * light pill highlight that slides (jelly-ish spring), centre + opens Food Log.
 */
const ITEMS: { key: TabKey | 'plus'; icon: React.ReactNode }[] = [
  { key: 'dashboard', icon: <Home size={25} strokeWidth={2.1} /> },
  { key: 'foodlog', icon: <Apple size={25} strokeWidth={2.1} /> },
  { key: 'plus', icon: <Plus size={27} strokeWidth={2.4} /> },
  { key: 'analytics', icon: <BarChart3 size={25} strokeWidth={2.1} /> },
  { key: 'more', icon: <MoreHorizontal size={25} strokeWidth={2.1} /> },
];

export function BottomNav({ tab, onTab }: { tab: TabKey; onTab: (t: TabKey) => void }) {
  const selectedIdx = ITEMS.findIndex((i) => i.key === tab);
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 flex justify-center pointer-events-none">
      <div
        className="pointer-events-auto mb-4 mx-4 w-full max-w-[400px] rounded-full backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
        style={{ background: 'rgba(28,28,32,0.72)' }}
      >
        <div className="relative flex items-center px-2 py-2">
          {/* sliding highlight pill */}
          <div
            className="nav-pill absolute top-2 bottom-2 rounded-full bg-white/[0.14]"
            style={{
              left: 8,
              width: 'calc((100% - 16px) / 5)',
              transform: `translateX(${selectedIdx * 100}%)`,
            }}
          />
          {ITEMS.map((item) => {
            const active = item.key === tab;
            return (
              <button
                key={item.key}
                type="button"
                aria-label={item.key}
                onClick={() => onTab(item.key === 'plus' ? 'foodlog' : (item.key as TabKey))}
                className="relative z-10 flex-1 h-12 flex items-center justify-center rounded-full cursor-pointer"
              >
                <span className={active ? 'text-white' : 'text-[#8b8b96]'}>
                  {item.icon}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
