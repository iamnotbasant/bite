import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Flame,
  LayoutGrid,
  UtensilsCrossed,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { DayLog } from '../types';
import { PetalBalanceChart } from './PetalBalanceChart';
import { FoodMosaicChart } from './FoodMosaicChart';
import { FuelStreakWidget } from './FuelStreakWidget';
import { GithubActivityGrid } from './GithubActivityGrid';

interface StatsViewProps {
  weekLogs: DayLog[];
  currentDay: DayLog;
  onBackToDashboard?: () => void;
}

type StatsSection = 'all' | 'nutrition' | 'habits';

export const StatsView: React.FC<StatsViewProps> = ({
  weekLogs,
  currentDay,
  onBackToDashboard,
}) => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');
  const [activeSection, setActiveSection] = useState<StatsSection>('all');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    nutrition: false,
    habits: false,
  });

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden flex flex-col select-none relative bg-black text-white">
      {/* ----------------- TOP NAVBAR (Mobile Only) ----------------- */}
      <div className="lg:hidden px-4 sm:px-6 py-3.5 border border-white/[0.12] border-t-white/[0.45] rounded-2xl flex items-center justify-between shrink-0 bg-[radial-gradient(ellipse_65%_45%_at_50%_-5%,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.05)_25%,transparent_70%)] bg-[#050506] gap-3 mb-3 shadow-[0_16px_36px_rgba(0,0,0,0.95),inset_0_1.2px_0.5px_rgba(255,255,255,0.50)]">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onBackToDashboard || (() => navigate('/dashboard'))}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all active:scale-95 cursor-pointer shadow-sm shrink-0"
            title="Back to Dashboard"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-white truncate">
              Stats
            </h2>
          </div>
        </div>

        {/* Timeframe Filter Switcher (Mobile) */}
        <div className="flex p-0.5 sm:p-1 rounded-xl bg-black/70 border border-white/10 text-[11px] sm:text-xs font-semibold shrink-0">
          {(['week', 'month', 'all'] as const).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setTimeRange(range)}
              className={`px-2.5 sm:px-3 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                timeRange === range
                  ? 'bg-white text-black font-black shadow-[0_2px_10px_rgba(255,255,255,0.25)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {range === 'all' ? 'All' : range}
            </button>
          ))}
        </div>
      </div>

      {/* ----------------- CATEGORY VIEW TABS (Segmented Pill Filter) ----------------- */}
      <div className="py-1 flex items-center justify-between shrink-0 mb-4 gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/70 border border-white/10 overflow-x-auto no-scrollbar w-full sm:w-auto shadow-inner">
          {[
            { id: 'all', label: 'All', icon: LayoutGrid },
            { id: 'nutrition', label: 'Diet', icon: UtensilsCrossed },
            { id: 'habits', label: 'Habits', icon: Flame },
          ].map((cat) => {
            const isSelected = activeSection === cat.id;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                data-section={cat.id}
                onClick={() => setActiveSection(cat.id as StatsSection)}
                className={`px-3 py-1 sm:py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-white text-black shadow-[0_2px_12px_rgba(255,255,255,0.25)] font-black'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={13} strokeWidth={isSelected ? 2.5 : 1.8} className={isSelected ? 'text-black' : 'text-zinc-400'} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Timeframe Filter Switcher (Desktop Only) */}
        <div className="hidden lg:flex p-1 rounded-xl bg-black/70 border border-white/10 text-xs font-semibold shrink-0 shadow-inner">
          {(['week', 'month', 'all'] as const).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                timeRange === range
                  ? 'bg-white text-black font-black shadow-[0_2px_10px_rgba(255,255,255,0.25)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {range === 'all' ? 'All' : range}
            </button>
          ))}
        </div>
      </div>

      {/* ----------------- MAIN STATS CONTENT ----------------- */}
      <div className="w-full space-y-7 pb-28 sm:pb-20">
        
        {/* =========================================================================
            HERO: FUEL STREAK WIDGET (Top of Page)
            ========================================================================= */}
        {(activeSection === 'all' || activeSection === 'habits') && (
          <section className="animate-fade-in">
            <FuelStreakWidget currentDay={currentDay} weekLogs={weekLogs} />
          </section>
        )}

        {/* =========================================================================
            SECTION 1: DIETARY COMPOSITION & FOODS
            ========================================================================= */}
        {(activeSection === 'all' || activeSection === 'nutrition') && (
          <section className="space-y-4 animate-fade-in">
            {/* Section Header */}
            <div
              onClick={() => activeSection === 'all' && toggleSection('nutrition')}
              className={`flex items-center justify-between gap-2 pb-2.5 border-b border-white/[0.06] ${
                activeSection === 'all' ? 'cursor-pointer group' : ''
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="p-1.5 rounded-xl bg-white/5 text-zinc-300 border border-white/10 shrink-0">
                  <UtensilsCrossed size={15} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-base font-extrabold text-white tracking-tight">
                    Diet
                  </h3>
                </div>
              </div>

              {activeSection === 'all' && (
                <button
                  type="button"
                  className="p-1.5 rounded-xl bg-white/5 group-hover:bg-white/10 text-zinc-400 group-hover:text-white transition-colors shrink-0"
                  title="Toggle section"
                >
                  {collapsedSections.nutrition ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
                </button>
              )}
            </div>

            {(!collapsedSections.nutrition || activeSection === 'nutrition') && (
              <div className="flex flex-col gap-6 sm:gap-8 items-stretch w-full">
                {/* 1. CIRCULAR PETAL RADAR BALANCE CHART */}
                <PetalBalanceChart currentDay={currentDay} weekLogs={weekLogs} />

                {/* 2. FOOD CONSUMPTION MOSAIC TREEMAP */}
                <FoodMosaicChart currentDay={currentDay} weekLogs={weekLogs} />
              </div>
            )}
          </section>
        )}

        {/* =========================================================================
            SECTION 2: HABITS & CONSISTENCY (GitHub Grid)
            ========================================================================= */}
        {(activeSection === 'all' || activeSection === 'habits') && (
          <section className="space-y-4 animate-fade-in">
            {/* Section Header */}
            <div
              onClick={() => activeSection === 'all' && toggleSection('habits')}
              className={`flex items-center justify-between gap-2 pb-2.5 border-b border-white/[0.06] ${
                activeSection === 'all' ? 'cursor-pointer group' : ''
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="p-1.5 rounded-xl bg-white/5 text-zinc-300 border border-white/10 shrink-0">
                  <Flame size={15} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-base font-extrabold text-white tracking-tight">
                    Habits
                  </h3>
                </div>
              </div>

              {activeSection === 'all' && (
                <button
                  type="button"
                  className="p-1.5 rounded-xl bg-white/5 group-hover:bg-white/10 text-zinc-400 group-hover:text-white transition-colors shrink-0"
                  title="Toggle section"
                >
                  {collapsedSections.habits ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
                </button>
              )}
            </div>

            {(!collapsedSections.habits || activeSection === 'habits') && (
              <div className="space-y-5">
                {/* GITHUB-STYLE ACTIVITY GRID */}
                <GithubActivityGrid currentDay={currentDay} weekLogs={weekLogs} />
              </div>
            )}
          </section>
        )}

      </div>
    </div>
  );
};
