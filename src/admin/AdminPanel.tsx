import { useState } from 'react';
import { AUTH_STORAGE_KEY, ADMIN_USERNAME, PHONE_USER_ID } from './constants';
import { isSupabaseConfigured } from '../utils/supabase';
import { Login } from './Login';
import { FoodsTab } from './FoodsTab';
import { LogsTab } from './LogsTab';

export function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(AUTH_STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  const [activeTab, setActiveTab] = useState<'foods' | 'logs'>('foods');

  const handleLogout = () => {
    try {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onSuccess={() => setIsAuthenticated(true)} />;
  }

  const supabaseReady = isSupabaseConfigured();

  return (
    <div className="min-h-dvh bg-black text-white font-mono antialiased">
      {/* Top Console Navigation Bar */}
      <header className="border-b border-zinc-800 bg-zinc-950 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold tracking-tight text-white uppercase border border-zinc-700 px-2 py-0.5 rounded-sm bg-black">
              Bite
            </span>
            <span className="text-sm font-semibold text-zinc-200">Admin Panel</span>
            <span className="text-xs text-zinc-500 hidden md:inline">
              device: <code className="text-zinc-400">{PHONE_USER_ID.slice(0, 8)}</code>
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {!supabaseReady && (
              <span className="text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded-sm">
                Supabase Not Configured
              </span>
            )}
            <span className="text-zinc-400">user: {ADMIN_USERNAME}</span>
            <a
              href="/"
              className="text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 px-2.5 py-1 rounded-sm transition-colors"
            >
              &larr; Web App
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 px-3 py-1 rounded-sm cursor-pointer transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-3 sm:p-6 space-y-4">
        {/* Tab Switcher */}
        <div className="flex items-center gap-1 border-b border-zinc-800 pb-0">
          <button
            type="button"
            onClick={() => setActiveTab('foods')}
            className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase border-b-2 transition-colors cursor-pointer ${
              activeTab === 'foods'
                ? 'border-white text-white bg-zinc-950'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Foods (custom_foods)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase border-b-2 transition-colors cursor-pointer ${
              activeTab === 'logs'
                ? 'border-white text-white bg-zinc-950'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Logs (food_logs)
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'foods' && <FoodsTab />}
        {activeTab === 'logs' && <LogsTab />}
      </main>
    </div>
  );
}
export default AdminPanel;
