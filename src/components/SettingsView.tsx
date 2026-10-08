import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RotateCcw,
  Plus,
  Trash2,
  Edit3,
  Scale,
  X,
  Save,
} from 'lucide-react';
import type { ThemeMode, CardStyleMode } from '../types';
import {
  loadServingUnits,
  addServingUnit,
  updateServingUnit,
  deleteServingUnit,
  resetServingUnits,
  type ServingUnitConfig,
} from '../utils/servingUnits';

interface SettingsViewProps {
  theme?: ThemeMode;
  onSetTheme?: (theme: ThemeMode) => void;
  cardStyle?: CardStyleMode;
  onSetCardStyle?: (style: CardStyleMode) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = () => {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Serving units state
  const [servingUnits, setServingUnits] = useState<ServingUnitConfig[]>(() => loadServingUnits());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<ServingUnitConfig | null>(null);
  const [unitForm, setUnitForm] = useState({
    label: '',
    defaultQty: '1',
    defaultEq: '100',
    eqUnit: 'g' as 'g' | 'ml',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2500);
  };

  const handleReset = () => {
    handleResetUnits();
  };

  const handleStartEditUnit = (unit: ServingUnitConfig) => {
    setEditingUnit(unit);
    setUnitForm({
      label: unit.label,
      defaultQty: unit.defaultQty,
      defaultEq: unit.defaultEq,
      eqUnit: unit.eqUnit,
    });
    setIsFormOpen(true);
  };

  const handleSaveUnitForm = () => {
    const cleanLabel = unitForm.label.trim().toLowerCase();
    if (!cleanLabel) {
      showToast('Please enter a unit name');
      return;
    }

    if (editingUnit) {
      const updated = updateServingUnit(editingUnit.id, {
        label: cleanLabel,
        defaultQty: unitForm.defaultQty || '1',
        defaultEq: unitForm.defaultEq || '100',
        eqUnit: unitForm.eqUnit,
      });
      setServingUnits(updated);
      showToast(`✓ Updated unit "${cleanLabel}"`);
    } else {
      const updated = addServingUnit({
        label: cleanLabel,
        defaultQty: unitForm.defaultQty || '1',
        defaultEq: unitForm.defaultEq || '100',
        eqUnit: unitForm.eqUnit,
      });
      setServingUnits(updated);
      showToast(`✓ Added unit "${cleanLabel}"`);
    }

    setIsFormOpen(false);
    setEditingUnit(null);
  };

  const handleDeleteUnit = (id: string, label: string) => {
    const updated = deleteServingUnit(id);
    setServingUnits(updated);
    showToast(`Deleted unit "${label}"`);
  };

  const handleResetUnits = () => {
    const reset = resetServingUnits();
    setServingUnits(reset);
    showToast('Reset serving units to defaults');
  };

  return (
    <div className="w-full flex flex-col min-h-[82vh] select-none relative bg-black text-white">
      {/* Top Navbar */}
      <div className="px-4 sm:px-6 py-3.5 border border-white/[0.12] border-t-white/[0.38] rounded-2xl flex items-center justify-between shrink-0 bg-[radial-gradient(110%_60%_at_50%_-5%,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.03)_35%,transparent_70%),linear-gradient(180deg,rgba(255,255,255,0.09)_0%,rgba(255,255,255,0.015)_35%,rgba(0,0,0,0.75)_75%,rgba(0,0,0,0.98)_100%)] bg-[#050608] mb-4 shadow-[0_16px_36px_rgba(0,0,0,0.92),inset_0_1.5px_1px_rgba(255,255,255,0.40)]">
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
            Settings
          </h2>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="btn-pill-glass flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white"
        >
          <RotateCcw size={13} />
          <span>Reset</span>
        </button>
      </div>

      {/* Settings Options */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-1 sm:p-2 pb-32 space-y-5 max-w-5xl xl:max-w-6xl mx-auto w-full">
        {/* Section: Serving Units Manager (Servings Base Units) */}
        <div className="p-4 sm:p-6 rounded-3xl bg-[radial-gradient(85%_40%_at_50%_0%,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.03)_50%,transparent_100%),linear-gradient(180deg,rgba(255,255,255,0.05)_0%,transparent_22%)] bg-[#050507] border border-white/[0.10] border-t-white/[0.48] shadow-[0_24px_60px_rgba(0,0,0,0.95),inset_0_1.5px_0.5px_rgba(255,255,255,0.55)] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Scale size={16} className="text-[#CDFF50]" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                  Serving Units (Servings)
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Edit, delete, or create custom base units for food logging (e.g. roti, bowl, glass, katori).
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setEditingUnit(null);
                  setUnitForm({ label: '', defaultQty: '1', defaultEq: '100', eqUnit: 'g' });
                  setIsFormOpen(true);
                }}
                className="btn-pill-lime px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 shadow-[0_0_16px_rgba(205,255,80,0.35)]"
              >
                <Plus size={14} strokeWidth={3} />
                <span>Add Unit</span>
              </button>

              <button
                type="button"
                onClick={handleResetUnits}
                className="btn-pill-glass px-2.5 py-1.5 rounded-full text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1"
                title="Reset serving units to default"
              >
                <RotateCcw size={12} />
                <span>Defaults</span>
              </button>
            </div>
          </div>

          {/* Add / Edit Inline Form Modal */}
          {isFormOpen && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#07080b] border border-white/[0.14] border-t-white/[0.40] space-y-3.5 animate-fade-in shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_1.5px_1px_rgba(255,255,255,0.40)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {editingUnit ? `Edit "${editingUnit.label}" Unit` : 'Add New Serving Unit'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingUnit(null);
                  }}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {/* Unit Name / Label */}
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Unit Name *
                  </label>
                  <input
                    type="text"
                    value={unitForm.label}
                    onChange={(e) => setUnitForm({ ...unitForm, label: e.target.value })}
                    placeholder="e.g. katori, scoop"
                    className="w-full px-3 py-2 rounded-xl bg-black/70 border border-white/15 text-white text-xs font-medium focus:outline-none focus:border-[#CDFF50]/60 placeholder:text-zinc-600"
                  />
                </div>

                {/* Default Qty */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Default Qty
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.5"
                    value={unitForm.defaultQty}
                    onChange={(e) => setUnitForm({ ...unitForm, defaultQty: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/70 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-[#CDFF50]/60"
                  />
                </div>

                {/* Equivalent Amount */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Weight / Volume
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={unitForm.defaultEq}
                    onChange={(e) => setUnitForm({ ...unitForm, defaultEq: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/70 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-[#CDFF50]/60"
                  />
                </div>

                {/* Unit Type (g vs ml) */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Scale Unit
                  </label>
                  <div className="grid grid-cols-2 gap-1 bg-black/70 p-0.5 rounded-xl border border-white/15">
                    <button
                      type="button"
                      onClick={() => setUnitForm({ ...unitForm, eqUnit: 'g' })}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        unitForm.eqUnit === 'g'
                          ? 'bg-[#CDFF50] text-black shadow-sm font-black'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      g (Grams)
                    </button>
                    <button
                      type="button"
                      onClick={() => setUnitForm({ ...unitForm, eqUnit: 'ml' })}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        unitForm.eqUnit === 'ml'
                          ? 'bg-[#CDFF50] text-black shadow-sm font-black'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      ml (Volume)
                    </button>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingUnit(null);
                  }}
                  className="btn-pill-glass px-3.5 py-1.5 text-zinc-300 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveUnitForm}
                  className="btn-pill-lime px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-[0_0_16px_rgba(205,255,80,0.35)]"
                >
                  <Save size={13} />
                  <span>{editingUnit ? 'Save Changes' : 'Add Unit'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Serving Units List Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {servingUnits.map((u) => (
              <div
                key={u.id}
                className="p-3.5 rounded-2xl bg-[#07080b] border border-white/[0.10] border-t-white/[0.28] shadow-[inset_0_1px_1px_rgba(255,255,255,0.22)] hover:border-white/25 transition-all flex flex-col justify-between gap-2.5 group"
              >
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <span className="text-sm font-extrabold text-white tracking-tight block">
                      {u.label}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400">
                      {u.defaultQty} {u.label} = {u.defaultEq}{u.eqUnit}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => handleStartEditUnit(u)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    title={`Edit ${u.label}`}
                  >
                    <Edit3 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteUnit(u.id, u.label)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                    title={`Delete ${u.label}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Live Preview: Select Base Unit in Create Food */}
          <div className="pt-2 border-t border-white/5">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-2">
              Live Preview (How it appears in Create Food):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {servingUnits.map((u, idx) => (
                <span
                  key={u.id}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold ${
                    idx === 0
                      ? 'bg-[#CDFF50] text-black font-extrabold shadow-[0_0_12px_rgba(205,255,80,0.3)]'
                      : 'bg-black/60 border border-white/10 text-zinc-400'
                  }`}
                >
                  {u.label}
                </span>
              ))}
            </div>
          </div>
        </div>
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
