import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import type { DayLog, MealItem, MealCategory, ThemeMode, CardStyleMode } from './types';
import {
  loadWeekLogs,
  saveWeekLogs,
  loadSavedTheme,
  saveTheme,
  loadSavedCardStyle,
  saveCardStyle,
  calculateDayTotals,
  addMealToDay,
  removeMealFromDay,
  updateMealInDay,
} from './utils/storage';
import { Header } from './components/Header';
import { CalorieArcGauge } from './components/CalorieArcGauge';
import { MacroCardsGrid } from './components/MacroCardsGrid';
import { MealTimeline } from './components/MealTimeline';
import { MealDetailModal } from './components/MealDetailModal';
import { FoodHubView } from './components/FoodHubView';
import { CreateFoodView } from './components/CreateFoodView';
import { SettingsView } from './components/SettingsView';
import { GoalsView } from './components/GoalsView';
import { StatsView } from './components/StatsView';
import {
  LayoutGrid,
  Utensils,
  PlusCircle,
  BarChart2,
  Target,
  Flame,
  Dumbbell,
  Wheat,
  Droplets,
} from 'lucide-react';
import type { MacroMetricItem } from './components/MacroCardsGrid';

export function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const [logs, setLogs] = useState<DayLog[]>(() => loadWeekLogs());
  const [selectedDate] = useState<string>('2026-08-23'); // Today
  const [theme, setTheme] = useState<ThemeMode>(() => loadSavedTheme());
  const [cardStyle, setCardStyle] = useState<CardStyleMode>(() => loadSavedCardStyle());
  const [activeLogCategory, setActiveLogCategory] = useState<MealCategory>('lunch');
  const [selectedMealForDetail, setSelectedMealForDetail] = useState<MealItem | null>(null);
  const [isMealDetailOpen, setIsMealDetailOpen] = useState<boolean>(false);
  const [editingFood, setEditingFood] = useState<import('./types').FoodLibraryItem | null>(null);

  // Sync logs, theme and cardStyle to localStorage
  useEffect(() => {
    saveWeekLogs(logs);
  }, [logs]);

  useEffect(() => {
    saveTheme(theme);
    if (theme === 'obsidian') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    saveCardStyle(cardStyle);
  }, [cardStyle]);

  // Current active day log
  const currentDay = logs.find((l) => l.date === selectedDate) || logs[3] || logs[0];
  const dayTotals = calculateDayTotals(currentDay);

  // Spotlight Metric for Radar Arc Gauge vs Cards Grid
  // Clicking any card swaps that metric into the radar gauge, and Calories shifts to that card!
  const [spotlightMetric, setSpotlightMetric] = useState<'calories' | 'protein' | 'carbs' | 'fat'>('calories');

  const allMetrics: Record<'calories' | 'protein' | 'carbs' | 'fat', MacroMetricItem> = {
    calories: {
      id: 'calories',
      label: 'Calories',
      current: dayTotals.calories,
      goal: currentDay.calorieGoal,
      unit: 'kcal',
      icon: <Flame size={15} className="text-white" />,
      desktopIcon: <Flame size={22} className="text-white" />,
    },
    protein: {
      id: 'protein',
      label: 'Protein',
      current: dayTotals.protein,
      goal: currentDay.proteinGoal,
      unit: 'g',
      icon: <Dumbbell size={15} className="text-white" />,
      desktopIcon: <Dumbbell size={22} className="text-white" />,
    },
    carbs: {
      id: 'carbs',
      label: 'Carbs',
      current: dayTotals.carbs,
      goal: currentDay.carbsGoal,
      unit: 'g',
      icon: <Wheat size={15} className="text-white" />,
      desktopIcon: <Wheat size={22} className="text-white" />,
    },
    fat: {
      id: 'fat',
      label: 'Fat',
      current: dayTotals.fat,
      goal: currentDay.fatGoal,
      unit: 'g',
      icon: <Droplets size={15} className="text-white" />,
      desktopIcon: <Droplets size={22} className="text-white" />,
    },
  };

  const currentSpotlight = allMetrics[spotlightMetric];

  // The 3 cards/bars: whichever macro is in the radar gauge, Calories shifts to its slot!
  const cardsMetrics: MacroMetricItem[] = (() => {
    if (spotlightMetric === 'calories') {
      return [allMetrics.protein, allMetrics.carbs, allMetrics.fat];
    }
    if (spotlightMetric === 'protein') {
      return [allMetrics.calories, allMetrics.carbs, allMetrics.fat];
    }
    if (spotlightMetric === 'carbs') {
      return [allMetrics.protein, allMetrics.calories, allMetrics.fat];
    }
    // 'fat'
    return [allMetrics.protein, allMetrics.carbs, allMetrics.calories];
  })();

  // Trigger celebration if goal is reached
  const checkGoalAchievement = (newCalories: number, goal: number) => {
    if (newCalories >= goal && dayTotals.calories < goal) {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#FFFFFF', '#38BDF8', '#FF6B6B'],
      });
    }
  };

  // Add meal
  const handleAddMeal = (
    mealData: Omit<MealItem, 'id' | 'timestamp'> & { timestamp?: string; targetDate?: string }
  ) => {
    const targetDate = mealData.targetDate || selectedDate;
    const nextCalories = dayTotals.calories + mealData.calories;
    checkGoalAchievement(nextCalories, currentDay.calorieGoal);

    setLogs((prev) => addMealToDay(prev, targetDate, mealData));
  };

  // Delete meal
  const handleDeleteMeal = (mealId: string) => {
    setLogs((prev) => removeMealFromDay(prev, selectedDate, mealId));
  };

  // Open meal details & nutrition modal
  const handleOpenMealDetail = (meal: MealItem) => {
    setSelectedMealForDetail(meal);
    setIsMealDetailOpen(true);
  };

  // Update meal
  const handleUpdateMeal = (updatedMeal: MealItem) => {
    setLogs((prev) => updateMealInDay(prev, selectedDate, updatedMeal));
  };

  // Save new goals
  const handleSaveGoals = (newGoals: {
    calorieGoal: number;
    proteinGoal: number;
    carbsGoal: number;
    fatGoal: number;
    waterGoal: number;
    micronutrientGoals?: DayLog['micronutrientGoals'];
  }) => {
    setLogs((prev) =>
      prev.map((log) => {
        if (log.date === selectedDate) {
          return {
            ...log,
            calorieGoal: newGoals.calorieGoal,
            proteinGoal: newGoals.proteinGoal,
            carbsGoal: newGoals.carbsGoal,
            fatGoal: newGoals.fatGoal,
            waterGoal: newGoals.waterGoal,
            micronutrientGoals: newGoals.micronutrientGoals,
          };
        }
        return log;
      })
    );

    // Background Supabase Sync if configured
    import('./utils/supabase').then(({ saveUserGoalsToSupabase }) => {
      saveUserGoalsToSupabase({
        calorieGoal: newGoals.calorieGoal,
        proteinGoal: newGoals.proteinGoal,
        carbsGoal: newGoals.carbsGoal,
        fatGoal: newGoals.fatGoal,
        waterGoal: newGoals.waterGoal,
        fiberGoal: newGoals.micronutrientGoals?.fiber,
        sugarGoal: newGoals.micronutrientGoals?.sugar,
        sodiumGoal: newGoals.micronutrientGoals?.sodium,
        potassiumGoal: newGoals.micronutrientGoals?.potassium,
        saturatedFatGoal: newGoals.micronutrientGoals?.saturatedFat,
        cholesterolGoal: newGoals.micronutrientGoals?.cholesterol,
      }).catch(() => {});
    });
  };

  const openLogForCategory = (category: MealCategory) => {
    setActiveLogCategory(category);
    navigate('/food');
  };


  const isDashboard = path === '/' || path === '/dashboard';
  const isFood = path === '/food' || path === '/foods';
  const isCreateFood = path === '/create-food' || path === '/foods/create';
  const isStats = path === '/stats' || path === '/statistics';
  const isGoals = path === '/goals' || path === '/goal';

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-black bg-dot-matrix text-white flex flex-col justify-between font-sans selection:bg-white selection:text-black">
      {/* Top Header with Integrated Navigation Bar */}
      <Header selectedDate={selectedDate} />

      {/* Dynamic Route Content */}
      <main className={`relative z-10 flex-1 max-w-[1600px] mx-auto w-full px-3.5 sm:px-6 lg:px-8 xl:px-10 ${isFood || isCreateFood ? 'pt-1 sm:pt-4' : 'py-3 sm:py-5'} pb-28 sm:pb-20`}>
        <Routes>
          {/* Default redirect to /dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 1. Main Dashboard */}
          <Route
            path="/dashboard"
            element={
              <div className="space-y-5 sm:space-y-7 animate-fade-in">
                {/* Top Section: Arc Gauge & Macro Cards Grid directly on pure black canvas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center py-2 sm:py-4">
                  {/* Left: Dynamic Spotlight Arc Gauge + Twin Pill Buttons */}
                  <div className="flex flex-col items-center justify-center w-full">
                    <CalorieArcGauge
                      currentKcal={currentSpotlight.current}
                      goalKcal={currentSpotlight.goal}
                      metricLabel={currentSpotlight.label}
                      unit={currentSpotlight.unit}
                      theme={theme}
                      onEditGoal={() => navigate('/goals')}
                      onResetToCalories={() => setSpotlightMetric('calories')}
                    />
                  </div>

                  {/* Right: Macro Cards Grid with interactive swapping */}
                  <div className="w-full">
                    <MacroCardsGrid
                      metrics={cardsMetrics}
                      onSelectMetric={(metricId) =>
                        setSpotlightMetric((prev) => (prev === metricId ? 'calories' : (metricId as any)))
                      }
                      variant="auto"
                    />
                  </div>
                </div>

                {/* Bottom Row: Daily Meals Timeline */}
                <div className="space-y-4">
                  <MealTimeline
                    meals={currentDay.meals}
                    theme={theme}
                    onAddMealClick={openLogForCategory}
                    onDeleteMeal={handleDeleteMeal}
                    onSelectMeal={handleOpenMealDetail}
                    variant="auto"
                  />
                </div>
              </div>
            }
          />

          {/* 2. Clutter-Free Food Hub & Catalog (/food and /foods) */}
          <Route
            path="/food"
            element={
              <div className="w-full animate-fade-in">
                <FoodHubView
                  onBackToDashboard={() => navigate('/dashboard')}
                  onNavigateToCreateFood={() => {
                    setEditingFood(null);
                    navigate('/create-food');
                  }}
                  onEditFood={(food) => {
                    setEditingFood(food);
                    navigate('/create-food');
                  }}
                  defaultCategory={activeLogCategory}
                  selectedDate={selectedDate}
                  onAddMeal={handleAddMeal}
                  theme={theme}
                />
              </div>
            }
          />
          <Route path="/foods" element={<Navigate to="/food" replace />} />

          {/* 3. Dedicated Custom Food Creator (/create-food) */}
          <Route
            path="/create-food"
            element={
              <div className="w-full animate-fade-in">
                <CreateFoodView
                  key={editingFood?.id || 'create-new-food'}
                  onBack={() => {
                    setEditingFood(null);
                    navigate('/food');
                  }}
                  defaultCategory={activeLogCategory}
                  onAddMeal={handleAddMeal}
                  onSuccess={() => {
                    setEditingFood(null);
                    navigate('/food');
                  }}
                  initialFood={editingFood}
                  isEditing={Boolean(editingFood)}
                />
              </div>
            }
          />
          <Route path="/foods/create" element={<Navigate to="/create-food" replace />} />

          {/* 4. Dedicated Stats View (/stats and /statistics) */}
          <Route
            path="/stats"
            element={
              <div className="w-full animate-fade-in">
                <StatsView
                  weekLogs={logs}
                  currentDay={currentDay}
                  onBackToDashboard={() => navigate('/dashboard')}
                />
              </div>
            }
          />
          <Route path="/statistics" element={<Navigate to="/stats" replace />} />

          {/* 5. Dedicated Settings View (/settings and /setting) */}
          <Route
            path="/settings"
            element={
              <div className="w-full animate-fade-in">
                <SettingsView
                  theme={theme}
                  onSetTheme={setTheme}
                  cardStyle={cardStyle}
                  onSetCardStyle={setCardStyle}
                />
              </div>
            }
          />
          <Route path="/setting" element={<Navigate to="/settings" replace />} />

          {/* 6. Dedicated Goals View (/goals and /goal) */}
          <Route
            path="/goals"
            element={
              <div className="w-full animate-fade-in">
                <GoalsView
                  currentCalorieGoal={currentDay.calorieGoal}
                  currentProteinGoal={currentDay.proteinGoal}
                  currentCarbsGoal={currentDay.carbsGoal}
                  currentFatGoal={currentDay.fatGoal}
                  currentWaterGoal={currentDay.waterGoal}
                  currentMicronutrientGoals={currentDay.micronutrientGoals}
                  onSaveGoals={handleSaveGoals}
                />
              </div>
            }
          />
          <Route path="/goal" element={<Navigate to="/goals" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      {/* Floating Bottom Navigation Bar for Mobile (< sm) matching Proton / Fintech dock */}
      <nav className="fixed bottom-3.5 left-3.5 right-3.5 max-w-[420px] mx-auto z-40 sm:hidden floating-dock-glass px-2 py-1.5 flex items-center justify-around shadow-[0_20px_48px_rgba(0,0,0,0.98)]">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className={`flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-2xl min-h-[48px] min-w-[48px] transition-all cursor-pointer ${
            isDashboard
              ? 'text-white font-bold bg-white/[0.14] border border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]'
              : 'text-zinc-400 hover:text-white font-medium hover:bg-white/[0.04]'
          }`}
        >
          <LayoutGrid size={18} strokeWidth={isDashboard ? 2.5 : 1.75} className={isDashboard ? 'text-white' : 'text-zinc-400'} />
          <span className="text-[10px] tracking-tight">Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveLogCategory('lunch');
            navigate('/food');
          }}
          className={`flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-2xl min-h-[48px] min-w-[48px] transition-all cursor-pointer ${
            isFood
              ? 'text-white font-bold bg-white/[0.14] border border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]'
              : 'text-zinc-400 hover:text-white font-medium hover:bg-white/[0.04]'
          }`}
        >
          <Utensils size={18} strokeWidth={isFood ? 2.5 : 1.75} className={isFood ? 'text-white' : 'text-zinc-400'} />
          <span className="text-[10px] tracking-tight">Food Log</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/create-food')}
          className={`flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-2xl min-h-[48px] min-w-[48px] transition-all cursor-pointer ${
            isCreateFood
              ? 'text-white font-bold bg-white/[0.14] border border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]'
              : 'text-zinc-400 hover:text-white font-medium hover:bg-white/[0.04]'
          }`}
        >
          <PlusCircle size={18} strokeWidth={isCreateFood ? 2.5 : 1.75} className={isCreateFood ? 'text-white' : 'text-zinc-400'} />
          <span className="text-[10px] tracking-tight">Create</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/stats')}
          className={`flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-2xl min-h-[48px] min-w-[48px] transition-all cursor-pointer ${
            isStats
              ? 'text-white font-bold bg-white/[0.14] border border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]'
              : 'text-zinc-400 hover:text-white font-medium hover:bg-white/[0.04]'
          }`}
        >
          <BarChart2 size={18} strokeWidth={isStats ? 2.5 : 1.75} className={isStats ? 'text-white' : 'text-zinc-400'} />
          <span className="text-[10px] tracking-tight">Stats</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/goals')}
          className={`flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-2xl min-h-[48px] min-w-[48px] transition-all cursor-pointer ${
            isGoals
              ? 'text-white font-bold bg-white/[0.14] border border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]'
              : 'text-zinc-400 hover:text-white font-medium hover:bg-white/[0.04]'
          }`}
        >
          <Target size={18} strokeWidth={isGoals ? 2.5 : 1.75} className={isGoals ? 'text-white' : 'text-zinc-400'} />
          <span className="text-[10px] tracking-tight">Goals</span>
        </button>
      </nav>

      {/* Full Food Nutrition & Detail Modal (Kab Kaise Add Kiya, Macros, Edit & Delete) */}
      <MealDetailModal
        meal={selectedMealForDetail}
        isOpen={isMealDetailOpen}
        onClose={() => setIsMealDetailOpen(false)}
        onUpdateMeal={handleUpdateMeal}
        onDeleteMeal={handleDeleteMeal}
      />
    </div>
  );
}

export default App;
