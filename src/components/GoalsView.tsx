import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';

interface GoalsViewProps {
  currentCalorieGoal: number;
  currentProteinGoal: number;
  currentCarbsGoal: number;
  currentFatGoal: number;
  currentWaterGoal: number;
  currentMicronutrientGoals?: {
    fiber?: number;
    sugar?: number;
    sodium?: number;
    potassium?: number;
    saturatedFat?: number;
    cholesterol?: number;
    calcium?: number;
    iron?: number;
  };
  onSaveGoals: (goals: {
    calorieGoal: number;
    proteinGoal: number;
    carbsGoal: number;
    fatGoal: number;
    waterGoal: number;
    micronutrientGoals?: {
      fiber?: number;
      sugar?: number;
      sodium?: number;
      potassium?: number;
      saturatedFat?: number;
      cholesterol?: number;
      calcium?: number;
      iron?: number;
    };
  }) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  currentCalorieGoal,
  currentProteinGoal,
  currentCarbsGoal,
  currentFatGoal,
  currentWaterGoal,
  currentMicronutrientGoals,
  onSaveGoals,
}) => {
  const navigate = useNavigate();
  const [calorieGoal, setCalorieGoal] = useState(currentCalorieGoal.toString());
  const [proteinGoal, setProteinGoal] = useState(currentProteinGoal.toString());
  const [carbsGoal, setCarbsGoal] = useState(currentCarbsGoal.toString());
  const [fatGoal, setFatGoal] = useState(currentFatGoal.toString());
  const [waterGoal, setWaterGoal] = useState(currentWaterGoal.toString());

  // Micronutrient Goals
  const [fiberGoal, setFiberGoal] = useState(String(currentMicronutrientGoals?.fiber ?? 30));
  const [sugarGoal, setSugarGoal] = useState(String(currentMicronutrientGoals?.sugar ?? 50));
  const [sodiumGoal, setSodiumGoal] = useState(String(currentMicronutrientGoals?.sodium ?? 2300));
  const [potassiumGoal, setPotassiumGoal] = useState(String(currentMicronutrientGoals?.potassium ?? 3500));
  const [satFatGoal, setSatFatGoal] = useState(String(currentMicronutrientGoals?.saturatedFat ?? 20));
  const [cholesterolGoal, setCholesterolGoal] = useState(String(currentMicronutrientGoals?.cholesterol ?? 300));
  const [calciumGoal, setCalciumGoal] = useState(String(currentMicronutrientGoals?.calcium ?? 1000));
  const [ironGoal, setIronGoal] = useState(String(currentMicronutrientGoals?.iron ?? 18));

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveGoals({
      calorieGoal: Number(calorieGoal) || 1600,
      proteinGoal: Number(proteinGoal) || 130,
      carbsGoal: Number(carbsGoal) || 180,
      fatGoal: Number(fatGoal) || 50,
      waterGoal: Number(waterGoal) || 2500,
      micronutrientGoals: {
        fiber: Number(fiberGoal) || 30,
        sugar: Number(sugarGoal) || 50,
        sodium: Number(sodiumGoal) || 2300,
        potassium: Number(potassiumGoal) || 3500,
        saturatedFat: Number(satFatGoal) || 20,
        cholesterol: Number(cholesterolGoal) || 300,
        calcium: Number(calciumGoal) || 1000,
        iron: Number(ironGoal) || 18,
      },
    });
    showToast('✓ Goals updated successfully');
  };

  const p = Number(proteinGoal) || 0;
  const c = Number(carbsGoal) || 0;
  const f = Number(fatGoal) || 0;
  const targetKcal = Number(calorieGoal) || 0;
  const macroKcal = p * 4 + c * 4 + f * 9;
  const diff = macroKcal - targetKcal;

  const pPct = macroKcal > 0 ? Math.round(((p * 4) / macroKcal) * 100) : 0;
  const cPct = macroKcal > 0 ? Math.round(((c * 4) / macroKcal) * 100) : 0;
  const fPct = macroKcal > 0 ? Math.max(0, 100 - pPct - cPct) : 0;

  return (
    <div className="w-full flex flex-col min-h-[82vh] select-none relative bg-black text-white">
      {/* Top Navbar (Mobile Only) */}
      <div className="lg:hidden px-4 sm:px-6 py-3.5 border border-white/[0.12] border-t-white/[0.45] rounded-2xl flex items-center justify-between shrink-0 bg-[radial-gradient(ellipse_65%_45%_at_50%_-5%,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.05)_25%,transparent_70%)] bg-[#050506] mb-4 shadow-[0_16px_36px_rgba(0,0,0,0.95),inset_0_1.2px_0.5px_rgba(255,255,255,0.50)]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all active:scale-95 cursor-pointer shadow-sm"
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
            Daily Goals & Targets
          </h2>
        </div>
      </div>

      {/* Content Form */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-1 sm:p-2 pb-36">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl xl:max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left Column: Calorie Target + Hydration Target */}
            <div className="space-y-5">
              {/* Calorie Card */}
              <div className="p-4 sm:p-5 rounded-3xl bg-[radial-gradient(ellipse_65%_45%_at_50%_-5%,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.06)_25%,transparent_70%)] bg-[#050506] border border-white/[0.12] border-t-white/[0.42] space-y-2 shadow-[0_16px_36px_rgba(0,0,0,0.95),inset_0_1.2px_0.5px_rgba(255,255,255,0.45)]">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Daily Calorie Target (kcal)
                </label>
                <input
                  type="number"
                  value={calorieGoal}
                  onChange={(e) => setCalorieGoal(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-white/15 text-[#CDFF50] font-mono font-black text-xl focus:outline-none focus:border-[#CDFF50]/50"
                />
              </div>

              {/* Hydration Card */}
              <div className="p-4 sm:p-5 rounded-3xl bg-[radial-gradient(ellipse_65%_45%_at_50%_-5%,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.06)_25%,transparent_70%)] bg-[#050506] border border-white/[0.12] border-t-white/[0.42] space-y-2 shadow-[0_16px_36px_rgba(0,0,0,0.95),inset_0_1.2px_0.5px_rgba(255,255,255,0.45)]">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Daily Water Target (ml)
                </label>
                <input
                  type="number"
                  value={waterGoal}
                  onChange={(e) => setWaterGoal(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-white/15 text-white font-mono font-bold text-base focus:outline-none focus:border-white/40"
                />
              </div>
            </div>

            {/* Right Column: Macro Distribution Card with live ratio balancer */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[radial-gradient(ellipse_65%_45%_at_50%_-5%,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.07)_25%,rgba(255,255,255,0.015)_50%,transparent_75%)] bg-[#050506] border border-white/[0.12] border-t-white/[0.45] space-y-4 shadow-[0_16px_36px_rgba(0,0,0,0.95),inset_0_1.2px_0.5px_rgba(255,255,255,0.50)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 block">
                  Macro Distribution
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  {macroKcal} kcal from macros
                </span>
              </div>

              {/* Live Macro Distribution Ratio Bar */}
              <div className="space-y-2">
                <div className="w-full h-3 rounded-full bg-black/60 overflow-hidden flex p-0.5 border border-white/10">
                  <div
                    style={{ width: `${pPct}%` }}
                    className="h-full bg-rose-500 rounded-l-full transition-all duration-300"
                    title={`Protein: ${pPct}%`}
                  />
                  <div
                    style={{ width: `${cPct}%` }}
                    className="h-full bg-sky-400 transition-all duration-300"
                    title={`Carbs: ${cPct}%`}
                  />
                  <div
                    style={{ width: `${fPct}%` }}
                    className="h-full bg-amber-400 rounded-r-full transition-all duration-300"
                    title={`Fat: ${fPct}%`}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>Protein {pPct}%</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                      <span>Carbs {cPct}%</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>Fat {fPct}%</span>
                    </span>
                  </div>

                  <span className={Math.abs(diff) <= 25 ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                    {Math.abs(diff) <= 25 ? '✓ Balanced' : diff > 0 ? `+${diff} kcal` : `${diff} kcal`}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10">
                  <label className="block text-xs font-medium text-rose-300 mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    value={proteinGoal}
                    onChange={(e) => setProteinGoal(e.target.value)}
                    className="w-full bg-transparent text-white font-mono font-bold text-base focus:outline-none"
                  />
                  <span className="text-[10px] text-zinc-500 font-mono">{p * 4} kcal</span>
                </div>

                <div className="p-3 rounded-2xl bg-black/40 border border-white/10">
                  <label className="block text-xs font-medium text-sky-300 mb-1">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    value={carbsGoal}
                    onChange={(e) => setCarbsGoal(e.target.value)}
                    className="w-full bg-transparent text-white font-mono font-bold text-base focus:outline-none"
                  />
                  <span className="text-[10px] text-zinc-500 font-mono">{c * 4} kcal</span>
                </div>

                <div className="p-3 rounded-2xl bg-black/40 border border-white/10">
                  <label className="block text-xs font-medium text-amber-300 mb-1">
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    value={fatGoal}
                    onChange={(e) => setFatGoal(e.target.value)}
                    className="w-full bg-transparent text-white font-mono font-bold text-base focus:outline-none"
                  />
                  <span className="text-[10px] text-zinc-500 font-mono">{f * 9} kcal</span>
                </div>
              </div>
            </div>

            {/* Micronutrient Targets Section */}
            <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-[#050505] border border-white/[0.07] space-y-4 shadow-xl">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Micronutrient Daily Targets
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Set daily thresholds for key micronutrients configured during food creation
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="p-3.5 rounded-2xl bg-black/60 border border-white/[0.08]">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Fiber
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={fiberGoal}
                      onChange={(e) => setFiberGoal(e.target.value)}
                      className="w-full bg-transparent text-white font-mono font-bold text-base focus:outline-none pr-6"
                    />
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-500">g</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/60 border border-white/[0.08]">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Sugar Max
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={sugarGoal}
                      onChange={(e) => setSugarGoal(e.target.value)}
                      className="w-full bg-transparent text-white font-mono font-bold text-base focus:outline-none pr-6"
                    />
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-500">g</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/60 border border-white/[0.08]">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Sodium Max
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={sodiumGoal}
                      onChange={(e) => setSodiumGoal(e.target.value)}
                      className="w-full bg-transparent text-white font-mono font-bold text-base focus:outline-none pr-8"
                    />
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-500">mg</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/60 border border-white/[0.08]">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Potassium
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={potassiumGoal}
                      onChange={(e) => setPotassiumGoal(e.target.value)}
                      className="w-full bg-transparent text-white font-mono font-bold text-base focus:outline-none pr-8"
                    />
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-500">mg</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/60 border border-white/[0.08]">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Saturated Fat
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={satFatGoal}
                      onChange={(e) => setSatFatGoal(e.target.value)}
                      className="w-full bg-transparent text-white font-mono font-bold text-base focus:outline-none pr-6"
                    />
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-500">g</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/60 border border-white/[0.08]">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Cholesterol
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={cholesterolGoal}
                      onChange={(e) => setCholesterolGoal(e.target.value)}
                      className="w-full bg-transparent text-white font-mono font-bold text-base focus:outline-none pr-8"
                    />
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-500">mg</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/60 border border-white/[0.08]">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Calcium
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={calciumGoal}
                      onChange={(e) => setCalciumGoal(e.target.value)}
                      className="w-full bg-transparent text-white font-mono font-bold text-base focus:outline-none pr-8"
                    />
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-500">mg</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/60 border border-white/[0.08]">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Iron
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={ironGoal}
                      onChange={(e) => setIronGoal(e.target.value)}
                      className="w-full bg-transparent text-white font-mono font-bold text-base focus:outline-none pr-8"
                    />
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-500">mg</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 max-w-md mx-auto w-full lg:max-w-none">
            <button
              type="submit"
              className="btn-pill-lime w-full py-4 text-sm font-black shadow-[0_4px_22px_rgba(205,255,80,0.4)] cursor-pointer flex items-center justify-center gap-2"
            >
              <Check size={18} strokeWidth={2.5} />
              <span>Save Goals</span>
            </button>
          </div>
        </form>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-white text-black text-xs font-bold shadow-2xl animate-bounce">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
