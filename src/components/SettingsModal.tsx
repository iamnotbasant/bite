import React from 'react';
import { X, Settings, Check, Sparkles, Layers, Target, RotateCcw } from 'lucide-react';
import type { ThemeMode, CardStyleMode } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  onSetTheme: (theme: ThemeMode) => void;
  cardStyle: CardStyleMode;
  onSetCardStyle: (style: CardStyleMode) => void;
  onOpenGoalModal: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onSetTheme,
  cardStyle,
  onSetCardStyle,
  onOpenGoalModal,
}) => {
  if (!isOpen) return null;

  const handleResetToDefaults = () => {
    onSetTheme('pure-black');
    onSetCardStyle('glow');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl border border-white/10 bg-[#0e0f14] text-white flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-black/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center text-white">
              <Settings size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">Settings</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto no-scrollbar">
          {/* Section 1: Card Appearance Style (Glow vs Stealth) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                Card Visual Style
              </span>
              <span className="text-[11px] font-semibold text-amber-300">Default: Glow Cards</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Glow Cards (Default) */}
              <button
                type="button"
                onClick={() => onSetCardStyle('glow')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between min-h-[120px] ${
                  cardStyle === 'glow'
                    ? 'border-amber-400/80 bg-zinc-900/90 ring-1 ring-amber-400/50 shadow-lg'
                    : 'border-white/10 bg-zinc-900/40 hover:bg-zinc-900/70 text-white/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                      <Sparkles size={16} className="text-amber-400" />
                      <span>Glow Cards</span>
                    </div>
                    {cardStyle === 'glow' && (
                      <span className="w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Luminous ambient gradient squircle cards (Champagne, Coral, Lavender, Cyan).
                  </p>
                </div>

                {/* Mini Preview Chips */}
                <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-white/5">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#F6E6C4] shadow-sm" title="Carbs" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#FF7A59] shadow-sm" title="Protein" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#8B5CF6] shadow-sm" title="Fats" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#38BDF8] shadow-sm" title="Hydration" />
                  <span className="text-[10px] text-white/50 ml-1">Multi-color Glow</span>
                </div>
              </button>

              {/* Option 2: Stealth Monochrome Dark */}
              <button
                type="button"
                onClick={() => onSetCardStyle('stealth')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between min-h-[120px] ${
                  cardStyle === 'stealth'
                    ? 'border-white/80 bg-zinc-900/90 ring-1 ring-white/50 shadow-lg'
                    : 'border-white/10 bg-zinc-900/40 hover:bg-zinc-900/70 text-white/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                      <Layers size={16} className="text-zinc-400" />
                      <span>Stealth Dark</span>
                    </div>
                    {cardStyle === 'stealth' && (
                      <span className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Clean monochrome dark cards (#13141B) with uniform typography without bright card gradients.
                  </p>
                </div>

                {/* Mini Preview Chips */}
                <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-white/5">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#181922] border border-white/20" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#181922] border border-white/20" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#181922] border border-white/20" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#181922] border border-white/20" />
                  <span className="text-[10px] text-white/50 ml-1">Minimal Black</span>
                </div>
              </button>
            </div>
          </div>

          {/* Section 2: App Theme (Pure Black vs Obsidian) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                App Canvas Theme
              </span>
              <span className="text-[11px] font-semibold text-white/60">Default: Pure Black</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Pure Black OLED */}
              <button
                type="button"
                onClick={() => onSetTheme('pure-black')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  theme === 'pure-black'
                    ? 'border-white/80 bg-black ring-1 ring-white/50 shadow-lg'
                    : 'border-white/10 bg-zinc-900/40 hover:bg-zinc-900/70 text-white/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-black border border-white/60" />
                    <span className="font-bold text-sm text-white">Pure Black</span>
                  </div>
                  {theme === 'pure-black' && (
                    <span className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/60">
                  True 100% pitch black (#000000) OLED display. Maximum contrast & zero distraction.
                </p>
              </button>

              {/* Option 2: Obsidian Ambient */}
              <button
                type="button"
                onClick={() => onSetTheme('obsidian')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  theme === 'obsidian'
                    ? 'border-purple-400/80 bg-[#12131c] ring-1 ring-purple-400/50 shadow-lg'
                    : 'border-white/10 bg-zinc-900/40 hover:bg-zinc-900/70 text-white/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-600" />
                    <span className="font-bold text-sm text-white">Obsidian Ambient</span>
                  </div>
                  {theme === 'obsidian' && (
                    <span className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/60">
                  Deep charcoal surface with subtle ambient background glow lighting.
                </p>
              </button>
            </div>
          </div>

          {/* Section 3: Goals Quick Action */}
          <div className="pt-2 border-t border-white/10 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white/70 block">
              Quick Actions
            </span>

            <div>
              {/* Daily Goals Modifier */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenGoalModal();
                }}
                className="w-full p-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 flex items-center gap-3 transition-all cursor-pointer text-left"
              >
                <div className="p-2 rounded-xl bg-amber-400/10 text-amber-300">
                  <Target size={18} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Daily Macro Targets</div>
                  <div className="text-[11px] text-white/60">Calories, protein, carbs & water goals</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-black/40 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors cursor-pointer py-1.5 px-2.5 rounded-lg hover:bg-white/5"
            title="Reset to default Black theme + Glow Cards"
          >
            <RotateCcw size={13} />
            <span>Reset to Default (Black + Glow)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-white text-black font-bold text-xs shadow-md hover:bg-white/90 transition-all active:scale-95 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
