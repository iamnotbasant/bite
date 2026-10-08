import { useState } from 'react';
import { Sliders } from 'lucide-react';

interface ScenariosWidgetProps {
  onApplyScenario: (scenario: {
    name: string;
    proteinGoal: number;
    carbsGoal: number;
    fatGoal: number;
  }) => void;
}

export const ScenariosWidget: React.FC<ScenariosWidgetProps> = ({ onApplyScenario }) => {
  const [activeScenario, setActiveScenario] = useState<string>('SUNRISE');

  const scenarios = [
    {
      id: 'SUNSET',
      label: 'SUNSET',
      sublabel: 'High Protein Cut',
      style:
        activeScenario === 'SUNSET'
          ? 'bg-gradient-to-r from-rose-500 via-orange-400 to-amber-300 text-black shadow-lg font-black'
          : 'bg-[#12131A] text-zinc-300 hover:text-white border border-white/10 hover:border-white/20',
      data: { name: 'Sunset (High Protein)', proteinGoal: 160, carbsGoal: 120, fatGoal: 45 },
    },
    {
      id: 'SUNRISE',
      label: 'SUNRISE',
      sublabel: 'Balanced Energy',
      style:
        activeScenario === 'SUNRISE'
          ? 'bg-gradient-to-r from-rose-500 via-amber-400 to-yellow-300 text-black shadow-lg font-black'
          : 'bg-[#12131A] text-zinc-300 hover:text-white border border-white/10 hover:border-white/20',
      data: { name: 'Sunrise (Balanced)', proteinGoal: 130, carbsGoal: 180, fatGoal: 50 },
    },
    {
      id: 'OCEAN',
      label: 'OCEAN',
      sublabel: 'Keto / Low Carb',
      style:
        activeScenario === 'OCEAN'
          ? 'bg-white text-black shadow-lg font-black'
          : 'bg-[#12131A] text-zinc-300 hover:text-white border border-white/20',
      data: { name: 'Ocean (Low Carb)', proteinGoal: 140, carbsGoal: 50, fatGoal: 85 },
    },
    {
      id: 'NEON',
      label: 'NEON',
      sublabel: 'Athletic High Carb',
      style:
        activeScenario === 'NEON'
          ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-400 text-black shadow-lg font-black'
          : 'bg-[#12131A] text-purple-300 hover:text-white border border-purple-500/30 hover:border-purple-500/60',
      data: { name: 'Neon (Athletic Carb)', proteinGoal: 120, carbsGoal: 230, fatGoal: 40 },
    },
  ];

  const handleSelect = (scenario: (typeof scenarios)[0]) => {
    setActiveScenario(scenario.id);
    onApplyScenario(scenario.data);
  };

  return (
    <div className="rounded-[30px] p-5 sm:p-6 bg-[#0E0F15] border border-white/10 text-white select-none">
      {/* Header from Reference Screenshot */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <Sliders size={16} className="text-amber-300" />
          <h3 className="text-base font-black tracking-wider uppercase text-white">
            Scenarios
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-white/60">
          Target Presets
        </span>
      </div>

      {/* Scenarios Stack matching media_1791289033733.jpg */}
      <div className="space-y-2">
        {/* Row 1: Sunset */}
        <button
          type="button"
          onClick={() => handleSelect(scenarios[0])}
          className={`w-full py-3 px-4 rounded-2xl text-xs font-black tracking-widest uppercase transition-all duration-300 flex items-center justify-between cursor-pointer ${scenarios[0].style}`}
        >
          <span>{scenarios[0].label}</span>
          <span className="text-[10px] font-semibold opacity-80">{scenarios[0].sublabel}</span>
        </button>

        {/* Row 2: Sunrise (Active Glowing Preset from Screenshot) */}
        <button
          type="button"
          onClick={() => handleSelect(scenarios[1])}
          className={`w-full py-3.5 px-4 rounded-2xl text-xs font-black tracking-widest uppercase transition-all duration-300 flex items-center justify-between shadow-lg cursor-pointer ${scenarios[1].style}`}
        >
          <span>{scenarios[1].label}</span>
          <span className="text-[10px] font-semibold opacity-90">{scenarios[1].sublabel}</span>
        </button>

        {/* Row 3: Split Ocean & Neon */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleSelect(scenarios[2])}
            className={`py-3 px-3 rounded-2xl text-xs font-black tracking-widest uppercase transition-all duration-300 flex items-center justify-center cursor-pointer ${scenarios[2].style}`}
          >
            <span>{scenarios[2].label}</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelect(scenarios[3])}
            className={`py-3 px-3 rounded-2xl text-xs font-black tracking-widest uppercase transition-all duration-300 flex items-center justify-center cursor-pointer ${scenarios[3].style}`}
          >
            <span>{scenarios[3].label}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
