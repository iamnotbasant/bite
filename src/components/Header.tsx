import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Flame,
  LayoutGrid,
  Utensils,
  PlusCircle,
  BarChart2,
  Target,
  Settings,
  Calendar,
} from 'lucide-react';

interface HeaderProps {
  selectedDate?: string;
}

export const Header: React.FC<HeaderProps> = ({ selectedDate = '2026-08-23' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const isDashboard = path === '/' || path === '/dashboard';
  const isFood = path === '/food' || path === '/foods';
  const isCreateFood = path === '/create-food' || path === '/foods/create';
  const isStats = path === '/stats' || path === '/statistics';
  const isGoals = path === '/goals' || path === '/goal';
  const isSettings = path === '/settings' || path === '/setting';

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutGrid, isActive: isDashboard },
    { label: 'Food Log', path: '/food', icon: Utensils, isActive: isFood },
    { label: 'Create Food', path: '/create-food', icon: PlusCircle, isActive: isCreateFood },
    { label: 'Stats', path: '/stats', icon: BarChart2, isActive: isStats },
    { label: 'Goals', path: '/goals', icon: Target, isActive: isGoals },
  ];

  // Format date display (e.g. 2026-08-23 -> 23 Aug)
  const displayDate = (() => {
    try {
      const parts = selectedDate.split('-');
      if (parts.length === 3) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthIdx = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        return `${day} ${months[monthIdx] || 'Aug'}`;
      }
    } catch {
      // fallback
    }
    return '23 Aug';
  })();

  return (
    <header className="w-full max-w-[1600px] mx-auto px-3.5 sm:px-6 lg:px-8 xl:px-10 pt-3 sm:pt-4 pb-2 z-30 select-none">
      <div className="w-full h-14 sm:h-16 rounded-2xl sm:rounded-3xl bg-[radial-gradient(85%_100%_at_50%_0%,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.05)_10%,transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.02)_8%,transparent_20%)] bg-[#050507] border border-white/[0.12] border-t-white/[0.48] px-3.5 sm:px-5 flex items-center justify-between shadow-[0_20px_48px_rgba(0,0,0,0.95),inset_0_1.5px_0.5px_rgba(255,255,255,0.50)]">
        {/* Brand identity (Clean, pure-black glossy aesthetic) */}
        <div
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
        >
          <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gradient-to-b from-white/20 to-white/5 border border-white/20 text-white shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.3)] group-hover:scale-105 transition-transform">
            <Flame size={16} className="fill-white text-white" />
          </div>

          <span className="text-base sm:text-lg font-black tracking-wider text-white font-sans">
            FUEL
          </span>
        </div>

        {/* Center: Top Navigation Bar (>= sm screens) */}
        <nav className="hidden sm:flex items-center gap-1.5 bg-black/70 p-1 rounded-full border border-white/[0.1] shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                  item.isActive
                    ? 'font-black bg-[#CDFF50] text-black shadow-[0_2px_14px_rgba(205,255,80,0.38)]'
                    : 'font-medium text-zinc-400 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <Icon size={14} strokeWidth={item.isActive ? 2.5 : 1.75} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Date Badge & Settings Button */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Active Date Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 border border-white/[0.14] text-zinc-300 text-xs font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.18)]">
            <Calendar size={13} className="text-zinc-400" />
            <span className="hidden md:inline text-zinc-400">Today,</span>
            <span className="text-white font-semibold">{displayDate}</span>
          </div>

          {/* Settings Button */}
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-all cursor-pointer min-h-[36px] ${
              isSettings
                ? 'bg-[#CDFF50] text-black border-[#CDFF50] font-black shadow-[0_2px_14px_rgba(205,255,80,0.38)]'
                : 'bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 hover:text-white border-white/[0.12] shadow-[inset_0_1px_1px_rgba(255,255,255,0.18)]'
            }`}
            title="App Settings"
          >
            <Settings size={14} strokeWidth={isSettings ? 2.4 : 1.8} />
            <span className="hidden md:inline font-semibold">Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};
