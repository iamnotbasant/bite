import React, { useState } from 'react';
import { X, Target, Check } from 'lucide-react';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCalorieGoal: number;
  currentProteinGoal: number;
  currentCarbsGoal: number;
  currentFatGoal: number;
  currentWaterGoal: number;
  onSaveGoals: (goals: {
    calorieGoal: number;
    proteinGoal: number;
    carbsGoal: number;
    fatGoal: number;
    waterGoal: number;
  }) => void;
  theme: 'emerald' | 'obsidian' | 'pure-black';
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  currentCalorieGoal,
  currentProteinGoal,
  currentCarbsGoal,
  currentFatGoal,
  currentWaterGoal,
  onSaveGoals,
  theme: _theme,
}) => {
  const [calorieGoal, setCalorieGoal] = useState(currentCalorieGoal.toString());
  const [proteinGoal, setProteinGoal] = useState(currentProteinGoal.toString());
  const [carbsGoal, setCarbsGoal] = useState(currentCarbsGoal.toString());
  const [fatGoal, setFatGoal] = useState(currentFatGoal.toString());
  const [waterGoal, setWaterGoal] = useState(currentWaterGoal.toString());

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveGoals({
      calorieGoal: Number(calorieGoal) || 1600,
      proteinGoal: Number(proteinGoal) || 130,
      carbsGoal: Number(carbsGoal) || 180,
      fatGoal: Number(fatGoal) || 50,
      waterGoal: Number(waterGoal) || 2500,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border bg-[#14151C] border-white/10 text-white transition-all"
      >
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target size={20} className="text-amber-300" />
            <h3 className="text-lg font-bold tracking-tight">Adjust Daily Goals</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1">
              Daily Calorie Target (kcal)
            </label>
            <input
              type="number"
              value={calorieGoal}
              onChange={(e) => setCalorieGoal(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-black/30 border border-white/15 text-white font-extrabold text-xl focus:outline-none focus:ring-2 focus:ring-white/40"
            />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-white/70 mb-1">
                Protein (g)
              </label>
              <input
                type="number"
                value={proteinGoal}
                onChange={(e) => setProteinGoal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/15 text-white text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/70 mb-1">
                Carbs (g)
              </label>
              <input
                type="number"
                value={carbsGoal}
                onChange={(e) => setCarbsGoal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/15 text-white text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/70 mb-1">
                Fats (g)
              </label>
              <input
                type="number"
                value={fatGoal}
                onChange={(e) => setFatGoal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/15 text-white text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1">
              Water Target (ml)
            </label>
            <input
              type="number"
              value={waterGoal}
              onChange={(e) => setWaterGoal(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-black/30 border border-white/15 text-white text-sm focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl font-bold bg-white text-zinc-950 shadow-lg hover:bg-white/95 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              <Check size={18} />
              <span>Save Target Goals</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
