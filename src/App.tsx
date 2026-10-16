import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BiteProvider, useBite, type TabKey } from './store';
import { BottomNav } from './components/BottomNav';
import { DashboardScreen } from './screens/DashboardScreen';
import { FoodLogScreen } from './screens/FoodLogScreen';
import { AnalyticsScreen } from './screens/AnalyticsScreen';
import { MoreScreen } from './screens/MoreScreen';
import AdminPanel from './admin/AdminPanel';

function Shell() {
  const { tab, setTab } = useBite();

  const goTab = (t: TabKey) => {
    setTab(t);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="min-h-dvh bg-[#0B0B0F] flex justify-center">
      <div className="w-full lg:max-w-[1120px] min-h-dvh relative bg-[#0B0B0F] lg:border-x lg:border-white/[0.06]">
        {tab === 'dashboard' && <DashboardScreen />}
        {tab === 'foodlog' && <FoodLogScreen key="foodlog" />}
        {tab === 'analytics' && <AnalyticsScreen />}
        {tab === 'more' && <MoreScreen />}
        <BottomNav tab={tab} onTab={goTab} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/adminpanel/*" element={<AdminPanel />} />
        <Route
          path="/*"
          element={
            <BiteProvider>
              <Shell />
            </BiteProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
