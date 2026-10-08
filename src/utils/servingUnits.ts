export interface ServingUnitConfig {
  id: string;
  label: string;
  defaultQty: string;
  defaultEq: string;
  eqUnit: 'g' | 'ml';
  isCustom?: boolean;
}

export const DEFAULT_SERVING_UNITS: ServingUnitConfig[] = [
  { id: 'unit-roti', label: 'roti', defaultQty: '1', defaultEq: '100', eqUnit: 'g' },
  { id: 'unit-piece', label: 'piece', defaultQty: '1', defaultEq: '50', eqUnit: 'g' },
  { id: 'unit-glass', label: 'glass', defaultQty: '1', defaultEq: '250', eqUnit: 'ml' },
  { id: 'unit-cup', label: 'cup', defaultQty: '1', defaultEq: '200', eqUnit: 'ml' },
  { id: 'unit-bowl', label: 'bowl', defaultQty: '1', defaultEq: '150', eqUnit: 'g' },
  { id: 'unit-plate', label: 'plate', defaultQty: '1', defaultEq: '300', eqUnit: 'g' },
  { id: 'unit-slice', label: 'slice', defaultQty: '1', defaultEq: '30', eqUnit: 'g' },
  { id: 'unit-scoop', label: 'scoop', defaultQty: '1', defaultEq: '30', eqUnit: 'g' },
  { id: 'unit-serving', label: 'serving', defaultQty: '1', defaultEq: '100', eqUnit: 'g' },
  { id: 'unit-g', label: 'g', defaultQty: '100', defaultEq: '100', eqUnit: 'g' },
  { id: 'unit-ml', label: 'ml', defaultQty: '100', defaultEq: '100', eqUnit: 'ml' },
];

const STORAGE_KEY = 'fuel_custom_serving_units';

export function loadServingUnits(): ServingUnitConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SERVING_UNITS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load serving units from localStorage', e);
  }
  return DEFAULT_SERVING_UNITS;
}

export function saveServingUnits(units: ServingUnitConfig[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(units));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('fuel-serving-units-changed'));
    }
  } catch (e) {
    console.error('Failed to save serving units to localStorage', e);
  }
}

export function resetServingUnits(): ServingUnitConfig[] {
  saveServingUnits(DEFAULT_SERVING_UNITS);
  return DEFAULT_SERVING_UNITS;
}

export function addServingUnit(unit: Omit<ServingUnitConfig, 'id'>): ServingUnitConfig[] {
  const current = loadServingUnits();
  const id = `unit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const cleanLabel = unit.label.trim().toLowerCase();

  // Prevent duplicate labels
  const existing = current.find((u) => u.label.toLowerCase() === cleanLabel);
  if (existing) {
    return current;
  }

  const newUnit: ServingUnitConfig = {
    id,
    label: cleanLabel,
    defaultQty: unit.defaultQty || '1',
    defaultEq: unit.defaultEq || '100',
    eqUnit: unit.eqUnit || 'g',
    isCustom: true,
  };

  const updated = [...current, newUnit];
  saveServingUnits(updated);
  return updated;
}

export function updateServingUnit(
  id: string,
  updatedFields: Partial<Omit<ServingUnitConfig, 'id'>>
): ServingUnitConfig[] {
  const current = loadServingUnits();
  const updated = current.map((u) => {
    if (u.id === id) {
      return {
        ...u,
        ...updatedFields,
        label: updatedFields.label ? updatedFields.label.trim().toLowerCase() : u.label,
      };
    }
    return u;
  });
  saveServingUnits(updated);
  return updated;
}

export function deleteServingUnit(id: string): ServingUnitConfig[] {
  const current = loadServingUnits();
  const updated = current.filter((u) => u.id !== id);
  // Keep at least 'g' or 'ml' so user is never left with zero units
  if (updated.length === 0) {
    return resetServingUnits();
  }
  saveServingUnits(updated);
  return updated;
}
