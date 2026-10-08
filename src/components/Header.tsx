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
      <div className="w-full h-14 rounded-2xl bg-[#0e0f13] border border-white/[0.08] px-3.5 sm:px-5 flex items-center justify-between shadow-lg">
        {/* Brand identity (Clean, NO subheading) */}
        <div
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-b from-white/15 to-white/5 border border-white/10 text-white shadow-sm group-hover:scale-105 transition-transform">
            <Flame size={16} className="fill-white text-white" />
          </div>

          <span className="text-base font-bold tracking-wider text-white font-sans">
            FUEL
          </span>
        </div>

        {/* Center: Top Navigation Bar (>= sm screens) */}
        <nav className="hidden sm:flex items-center gap-1 bg-[#14151a] p-1 rounded-xl border border-white/[0.06]">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  item.isActive
                    ? 'font-bold bg-white text-black shadow-sm'
                    : 'font-medium text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={14} strokeWidth={item.isActive ? 2.2 : 1.75} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Date Badge & Settings Button */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Active Date Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-zinc-300 text-xs font-medium">
            <Calendar size={13} className="text-zinc-400" />
            <span className="hidden md:inline text-zinc-400">Today,</span>
            <span className="text-white font-semibold">{displayDate}</span>
          </div>

          {/* Settings Button */}
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
              isSettings
                ? 'bg-white text-black border-white font-bold'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border-white/[0.06]'
            }`}
            title="App Settings"
          >
            <Settings size={14} />
            <span className="hidden md:inline">Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};
