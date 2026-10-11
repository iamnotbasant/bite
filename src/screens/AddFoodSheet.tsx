import { useMemo, useState } from 'react';
import { Heart, Plus, ScanLine, Search, UtensilsCrossed, X, Zap } from 'lucide-react';
import { useBite } from '../store';
import { EmptyState, Field, inputCls, Segmented, Sheet } from '../components/ui';
import type { FoodLibraryItem, MealCategory } from '../types';

type Tab = 'scan' | 'search' | 'quick' | 'library';
type Chip = 'all' | 'custom' | 'favorites' | 'recent';

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'scan', label: 'Scan', icon: <ScanLine size={17} /> },
  { key: 'search', label: 'Search', icon: <Search size={17} /> },
  { key: 'quick', label: 'Quick Add', icon: <Zap size={17} /> },
  { key: 'library', label: 'Library', icon: <UtensilsCrossed size={17} /> },
];

function nowTime(): string {
  const d = new Date();
  let h = d.getHours();
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} ${ap}`;
}

export function AddFoodSheet({
  open,
  onClose,
  date,
  initialCategory,
}: {
  open: boolean;
  onClose: () => void;
  date: string;
  initialCategory: MealCategory;
}) {
  const { customFoods, favorites, toggleFavorite, addMeal, logs } = useBite();
  const [tab, setTab] = useState<Tab>('search');
  const [chip, setChip] = useState<Chip>('all');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<MealCategory>(initialCategory);
  const [creating, setCreating] = useState(false);
  const [logging, setLogging] = useState<FoodLibraryItem | null>(null);
  const [qty, setQty] = useState('1');

  // reset when opened
  const [wasOpen, setWasOpen] = useState(false);
  if (open && !wasOpen) {
    setWasOpen(true);
    setTab('search');
    setChip('all');
    setQuery('');
    setCategory(initialCategory);
    setCreating(false);
    setLogging(null);
    setQty('1');
  }
  if (!open && wasOpen) setWasOpen(false);

  const recentFoods = useMemo(() => {
    const seen = new Map<string, FoodLibraryItem>();
    for (const log of logs) {
      for (const m of log.meals) {
        if (!seen.has(m.name)) {
          seen.set(m.name, {
            id: `recent-${m.id}`,
            name: m.name,
            calories: m.calories,
            protein: m.protein,
            carbs: m.carbs,
            fat: m.fat,
            defaultPortion: m.portion,
            category: m.category,
            tagId: 'recent',
          });
        }
      }
    }
    return [...seen.values()].slice(0, 20);
  }, [logs]);

  const results = useMemo(() => {
    let pool: FoodLibraryItem[] = customFoods;
    if (chip === 'favorites') pool = customFoods.filter((f) => favorites.has(f.id));
    else if (chip === 'recent') pool = recentFoods;
    else if (chip === 'custom') pool = customFoods;
    else pool = [...customFoods, ...recentFoods.filter((r) => !customFoods.some((c) => c.name === r.name))];
    const q = query.trim().toLowerCase();
    if (!q) return pool.slice(0, 30);
    return pool.filter(
      (f) => f.name.toLowerCase().includes(q) || (f.brand || '').toLowerCase().includes(q)
    ).slice(0, 30);
  }, [customFoods, favorites, recentFoods, chip, query]);

  const doLog = (food: FoodLibraryItem, quantity: number) => {
    addMeal(date, {
      name: food.name,
      brand: food.brand,
      calories: Math.round(food.calories * quantity),
      protein: Math.round(food.protein * quantity * 10) / 10,
      carbs: Math.round(food.carbs * quantity * 10) / 10,
      fat: Math.round(food.fat * quantity * 10) / 10,
      portion: quantity === 1 ? food.defaultPortion : `${quantity} × ${food.defaultPortion}`,
      category,
      timestamp: nowTime(),
    });
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose}>
      {/* tabs */}
      <div className="flex gap-1 mb-4 -mx-1 px-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-[14px] text-[12px] font-semibold cursor-pointer ${
              tab === t.key ? 'bg-[#1E1E26] text-white' : 'text-[#5E5E6C]'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'scan' && (
        <EmptyState
          icon={<ScanLine size={48} strokeWidth={1.4} />}
          title="Barcode scan available nahi hai"
          hint="Web par camera scan supported nahi — Search se dhundho ya Quick Add use karo."
          actionLabel="Search par jao"
          onAction={() => setTab('search')}
        />
      )}

      {tab === 'search' && !creating && !logging && (
        <>
          <div className="relative mb-3">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5E5E6C]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a food"
              className="w-full pl-11 pr-10 py-3.5 rounded-full bg-[#1E1E26] text-white text-[15px] placeholder:text-[#5E5E6C] border border-white/[0.06]"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" aria-label="Clear">
                <X size={18} className="text-[#5E5E6C]" />
              </button>
            )}
          </div>
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {(['all', 'custom', 'favorites', 'recent'] as Chip[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setChip(c)}
                className={`px-4 py-2 rounded-full text-[13.5px] font-semibold whitespace-nowrap cursor-pointer ${
                  chip === c ? 'bg-[#4F8FF7] text-white' : 'bg-[#1E1E26] text-[#9A9AA5]'
                }`}
              >
                {c === 'all' ? 'All' : c === 'custom' ? 'Custom' : c === 'favorites' ? 'Favorites' : 'Recent'}
              </button>
            ))}
          </div>

          {results.length === 0 ? (
            <EmptyState
              icon={<UtensilsCrossed size={48} strokeWidth={1.4} />}
              title="No foods yet"
              hint="Create Food se apna pehla food banao"
              actionLabel="Create Food"
              onAction={() => setCreating(true)}
            />
          ) : (
            <div className="space-y-2">
              {results.map((f) => (
                <div key={f.id} className="flex items-center gap-3 bg-[#1E1E26] rounded-[16px] p-3.5">
                  <button type="button" onClick={() => { setLogging(f); setQty('1'); }} className="flex-1 text-left min-w-0 cursor-pointer">
                    <div className="text-[15px] font-semibold text-white truncate">{f.name}</div>
                    <div className="text-[12px] text-[#5E5E6C] truncate">
                      {f.defaultPortion} · {Math.round(f.calories)} kcal
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(f.id)}
                    className="w-9 h-9 flex items-center justify-center cursor-pointer"
                    aria-label="Favorite"
                  >
                    <Heart size={19} className={favorites.has(f.id) ? 'text-[#F0714F] fill-[#F0714F]' : 'text-[#5E5E6C]'} />
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLogging(f); setQty('1'); }}
                    className="w-9 h-9 rounded-full bg-[#4F8FF7] flex items-center justify-center cursor-pointer"
                    aria-label="Log"
                  >
                    <Plus size={18} className="text-white" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setCreating(true)}
                className="w-full py-3.5 rounded-[16px] border border-dashed border-[#3a3a48] text-[#9A9AA5] text-[14px] font-semibold cursor-pointer mt-2"
              >
                + Create Food
              </button>
            </div>
          )}
        </>
      )}

      {tab === 'search' && creating && !logging && (
        <CreateFoodForm
          onDone={(food) => {
            setCreating(false);
            setLogging(food);
            setQty('1');
          }}
          onCancel={() => setCreating(false)}
        />
      )}

      {logging && (
        <LogPortionStep
          food={logging}
          category={category}
          setCategory={setCategory}
          qty={qty}
          setQty={setQty}
          onLog={() => {
            const q = parseFloat(qty);
            doLog(logging, isNaN(q) || q <= 0 ? 1 : q);
          }}
          onBack={() => setLogging(null)}
        />
      )}

      {tab === 'quick' && <QuickAddForm date={date} category={category} setCategory={setCategory} onClose={onClose} />}

      {tab === 'library' && (
        <LibraryView
          onEdit={() => {
            setCreating(false);
          }}
        />
      )}
    </Sheet>
  );
}

function CreateFoodForm({ onDone, onCancel }: { onDone: (f: FoodLibraryItem) => void; onCancel: () => void }) {
  const { addCustomFood } = useBite();
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [portion, setPortion] = useState('1 serving');

  const save = () => {
    if (!name.trim()) return;
    const food = addCustomFood({
      name: name.trim(),
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      defaultPortion: portion.trim() || '1 serving',
      category: 'lunch',
      tagId: 'custom',
    });
    onDone(food);
  };

  return (
    <div>
      <div className="text-[15px] text-[#9A9AA5] mb-4">Apna khud ka food banao — naam aur macros likho</div>
      <Field label="Food name">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Dal Tadka" className={inputCls} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Calories (kcal)">
          <input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="0" className={inputCls} inputMode="decimal" />
        </Field>
        <Field label="Serving (e.g. 1 katori)">
          <input value={portion} onChange={(e) => setPortion(e.target.value)} placeholder="1 serving" className={inputCls} />
        </Field>
        <Field label="Protein (g)">
          <input type="number" value={protein} onChange={(e) => setProtein(e.target.value)} placeholder="0" className={inputCls} inputMode="decimal" />
        </Field>
        <Field label="Carbs (g)">
          <input type="number" value={carbs} onChange={(e) => setCarbs(e.target.value)} placeholder="0" className={inputCls} inputMode="decimal" />
        </Field>
        <Field label="Fat (g)">
          <input type="number" value={fat} onChange={(e) => setFat(e.target.value)} placeholder="0" className={inputCls} inputMode="decimal" />
        </Field>
      </div>
      <div className="flex gap-3 mt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-3.5 rounded-full bg-[#1E1E26] text-[#9A9AA5] font-semibold cursor-pointer">
          Cancel
        </button>
        <button type="button" onClick={save} disabled={!name.trim()} className="flex-1 py-3.5 rounded-full bg-[#4F8FF7] text-white font-bold cursor-pointer disabled:opacity-40">
          Save Food
        </button>
      </div>
    </div>
  );
}

function LogPortionStep({
  food,
  category,
  setCategory,
  qty,
  setQty,
  onLog,
  onBack,
}: {
  food: FoodLibraryItem;
  category: MealCategory;
  setCategory: (c: MealCategory) => void;
  qty: string;
  setQty: (q: string) => void;
  onLog: () => void;
  onBack: () => void;
}) {
  const q = parseFloat(qty);
  const mult = isNaN(q) || q <= 0 ? 1 : q;
  return (
    <div>
      <button type="button" onClick={onBack} className="text-[#4F8FF7] text-[14px] font-semibold mb-3 cursor-pointer">
        ‹ Back to results
      </button>
      <div className="bg-[#1E1E26] rounded-[20px] p-5 mb-4">
        <div className="text-[18px] font-bold text-white">{food.name}</div>
        <div className="text-[13px] text-[#9A9AA5] mt-1">
          {food.defaultPortion} · {Math.round(food.calories)} kcal · P {food.protein}g · C {food.carbs}g · F {food.fat}g
        </div>
      </div>
      <Field label="Quantity (servings)">
        <input type="number" value={qty} onChange={(e) => setQty(e.target.value)} className={inputCls} inputMode="decimal" min="0" step="0.5" />
      </Field>
      <Field label="Meal">
        <div className="grid grid-cols-4 gap-2">
          {(['breakfast', 'lunch', 'dinner', 'snack'] as MealCategory[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setCategory(m)}
              className={`py-2.5 rounded-[12px] text-[12.5px] font-semibold capitalize cursor-pointer ${
                category === m ? 'bg-[#4F8FF7] text-white' : 'bg-[#1E1E26] text-[#9A9AA5]'
              }`}
            >
              {m === 'snack' ? 'Snack' : m}
            </button>
          ))}
        </div>
      </Field>
      <div className="bg-[#141418] rounded-[16px] p-4 mb-4 flex justify-between text-[14px]">
        <span className="text-[#9A9AA5]">Total</span>
        <span className="text-white font-bold tnum">{Math.round(food.calories * mult)} kcal</span>
      </div>
      <button type="button" onClick={onLog} className="w-full py-4 rounded-full bg-[#4F8FF7] text-white text-[16px] font-bold cursor-pointer">
        Log Food
      </button>
    </div>
  );
}

function QuickAddForm({
  date,
  category,
  setCategory,
  onClose,
}: {
  date: string;
  category: MealCategory;
  setCategory: (c: MealCategory) => void;
  onClose: () => void;
}) {
  const { addMeal } = useBite();
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');

  const save = () => {
    addMeal(date, {
      name: name.trim() || 'Quick entry',
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: 0,
      fat: 0,
      portion: '1 serving',
      category,
      timestamp: nowTime(),
    });
    onClose();
  };

  return (
    <div>
      <div className="text-[15px] text-[#9A9AA5] mb-4">Bas naam aur calories — turant log karo</div>
      <Field label="Kya khaya?">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. 2 roti + dal" className={inputCls} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Calories (kcal)">
          <input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="0" className={inputCls} inputMode="decimal" />
        </Field>
        <Field label="Protein (g, optional)">
          <input type="number" value={protein} onChange={(e) => setProtein(e.target.value)} placeholder="0" className={inputCls} inputMode="decimal" />
        </Field>
      </div>
      <Field label="Meal">
        <div className="grid grid-cols-4 gap-2">
          {(['breakfast', 'lunch', 'dinner', 'snack'] as MealCategory[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setCategory(m)}
              className={`py-2.5 rounded-[12px] text-[12.5px] font-semibold capitalize cursor-pointer ${
                category === m ? 'bg-[#4F8FF7] text-white' : 'bg-[#1E1E26] text-[#9A9AA5]'
              }`}
            >
              {m === 'snack' ? 'Snack' : m}
            </button>
          ))}
        </div>
      </Field>
      <button type="button" onClick={save} className="w-full py-4 rounded-full bg-[#4F8FF7] text-white text-[16px] font-bold cursor-pointer mt-2">
        Log it
      </button>
    </div>
  );
}

function LibraryView({ onEdit }: { onEdit: (f: FoodLibraryItem) => void }) {
  const { customFoods, favorites, toggleFavorite, removeCustomFood } = useBite();
  const [filter, setFilter] = useState<'all' | 'custom' | 'favorites'>('all');
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  const list = customFoods.filter((f) => (filter === 'favorites' ? favorites.has(f.id) : true));

  return (
    <div>
      <Segmented
        options={[
          { value: 'all', label: 'All' },
          { value: 'custom', label: 'Custom' },
          { value: 'favorites', label: 'Favorites' },
        ]}
        value={filter}
        onChange={setFilter}
      />
      <div className="mt-4 space-y-2">
        {list.length === 0 && (
          <EmptyState
            icon={<UtensilsCrossed size={44} strokeWidth={1.4} />}
            title={filter === 'favorites' ? 'Koi favorite nahi' : 'Koi custom food nahi'}
            hint="Search tab se Create Food karo"
          />
        )}
        {list.map((f) => (
          <div key={f.id} className="bg-[#1E1E26] rounded-[16px] p-3.5">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => onEdit(f)} className="flex-1 text-left min-w-0 cursor-pointer">
                <div className="text-[15px] font-semibold text-white truncate">{f.name}</div>
                <div className="text-[12px] text-[#5E5E6C]">
                  {Math.round(f.calories)} kcal · P {f.protein}g · C {f.carbs}g · F {f.fat}g
                </div>
              </button>
              <button type="button" onClick={() => toggleFavorite(f.id)} className="cursor-pointer" aria-label="Favorite">
                <Heart size={19} className={favorites.has(f.id) ? 'text-[#F0714F] fill-[#F0714F]' : 'text-[#5E5E6C]'} />
              </button>
            </div>
            {confirmDel === f.id ? (
              <div className="flex gap-2 mt-3">
                <button type="button" onClick={() => { removeCustomFood(f.id); setConfirmDel(null); }} className="flex-1 py-2 rounded-full bg-[#F0714F]/15 text-[#F0714F] text-[13px] font-bold cursor-pointer">
                  Pakka delete?
                </button>
                <button type="button" onClick={() => setConfirmDel(null)} className="flex-1 py-2 rounded-full bg-[#262632] text-[#9A9AA5] text-[13px] font-semibold cursor-pointer">
                  Rakh lo
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmDel(f.id)} className="mt-2 text-[12.5px] text-[#5E5E6C] cursor-pointer">
                Delete food
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
