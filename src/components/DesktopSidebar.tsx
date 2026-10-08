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
  Plus,
  PanelLeftClose,
} from 'lucide-react';

interface DesktopSidebarProps {
  onQuickLogClick?: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ onQuickLogClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutGrid,
      isActive: path === '/' || path === '/dashboard',
    },
    {
      label: 'Food Log',
      path: '/food',
      icon: Utensils,
      isActive: path === '/food' || path === '/foods',
    },
    {
      label: 'Create Food',
      path: '/create-food',
      icon: PlusCircle,
      isActive: path === '/create-food' || path === '/foods/create',
    },
    {
      label: 'Stats & Trends',
      path: '/stats',
      icon: BarChart2,
      isActive: path === '/stats' || path === '/statistics',
    },
    {
      label: 'Goals & Targets',
      path: '/goals',
      icon: Target,
      isActive: path === '/goals' || path === '/goal',
    },
    {
      label: 'Settings',
      path: '/settings',
      icon: Settings,
      isActive: path === '/settings' || path === '/setting',
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col justify-between w-60 h-screen bg-[#050507] border-r border-white/[0.08] p-4 select-none shrink-0 z-30">
      {/* Top: Brand Header & Navigation Links */}
      <div className="space-y-4">
        {/* Brand identity (Clean, NO subheading, with sidebar toggle icon) */}
        <div className="flex items-center justify-between px-2 py-1">
          <div
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#090a0f] border border-white/10 text-white shadow-sm group-hover:scale-105 transition-transform">
              <Flame size={16} className="fill-white text-white" />
            </div>

            <span className="text-sm font-bold tracking-wider text-white">
              FUEL
            </span>
          </div>

          <div
            className="text-zinc-600 hover:text-zinc-400 p-1 cursor-pointer transition-colors"
            title="Collapse Sidebar"
          >
            <PanelLeftClose size={15} strokeWidth={1.75} />
          </div>
        </div>

        {/* Navigation list matching Reference Sidebar style (NO "Navigation" header) */}
        <nav className="space-y-1 pt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                  item.isActive
                    ? 'bg-white text-black font-black shadow-[0_2px_14px_rgba(255,255,255,0.25)]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04] font-medium'
                }`}
              >
                <Icon
                  size={16}
                  strokeWidth={item.isActive ? 2.5 : 1.75}
                  className={item.isActive ? 'text-black' : 'text-zinc-400'}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Quick Log button & Daily Streak status */}
      <div className="space-y-3 pt-3 border-t border-white/[0.08]">
        {/* Quick Log Action */}
        <button
          type="button"
          onClick={onQuickLogClick || (() => navigate('/food'))}
          className="btn-pill-lime w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-full font-black text-xs cursor-pointer shadow-[0_0_16px_rgba(255,255,255,0.2)] min-h-[40px]"
        >
          <Plus size={14} strokeWidth={3} />
          <span>Quick Log</span>
        </button>

        {/* Streak Profile Card (NO subheading, minimal & clean) */}
        <div
          onClick={() => navigate('/stats')}
          className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/15 transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-2">
            <Flame size={15} className="text-amber-400 fill-amber-400/20" />
            <span className="text-xs font-semibold text-white">8 Days Streak</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold">
            Active
          </span>
        </div>
      </div>
    </aside>
  );
};
