import React from 'react';
import { ChevronRight } from 'lucide-react';
import { C } from '../theme';

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-[#1E1E26] rounded-[24px] p-5 ${className}`}>{children}</div>;
}

export function SectionHeader({
  title,
  onClick,
}: {
  title: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between mb-3 mt-7 text-left cursor-pointer"
    >
      <h2 className="text-[20px] font-semibold text-white">{title}</h2>
      <ChevronRight size={22} color={C.chevron} />
    </button>
  );
}

/** Native Consumed/Remaining style segmented toggle */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex bg-[#141418] rounded-full p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex-1 py-2.5 rounded-full text-[15px] font-semibold transition-colors cursor-pointer ${
            value === o.value ? 'bg-white text-black' : 'text-[#9A9AA5]'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function MacroBar({
  label,
  value,
  goal,
  color,
  mode,
}: {
  label: string;
  value: number;
  goal: number;
  color: string;
  mode: 'consumed' | 'remaining';
}) {
  const display = mode === 'consumed' ? value : Math.max(0, goal - value);
  const pct = goal > 0 ? Math.min(100, (value / goal) * 100) : 0;
  return (
    <div className="flex-1">
      <div className="text-center text-[13px] text-[#9A9AA5] mb-1.5">{label}</div>
      <div className="h-[5px] rounded-full bg-[#282834] overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="text-center text-[14px] font-bold text-white mt-1.5 tnum">
        {Math.round(display)} <span className="font-medium text-[#9A9AA5]">/ {goal}g</span>
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  hint,
  actionLabel,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  hint?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="bg-[#1E1E26] rounded-[24px] p-8 flex flex-col items-center text-center">
      <div className="text-[#9A9AA5] mb-4">{icon}</div>
      <div className="text-[17px] font-bold text-white mb-1.5">{title}</div>
      {hint && <div className="text-[13px] text-[#9A9AA5] mb-5 leading-relaxed">{hint}</div>}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-6 py-3 rounded-full bg-[#4F8FF7] text-white text-[15px] font-bold cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/** Bottom sheet (native modal sheet style) */
export function Sheet({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-center">
      <div className="absolute inset-0 bg-black/70 fade-in" onClick={onClose} />
      <div className="sheet-up relative w-full max-w-[480px] mt-auto max-h-[92dvh] bg-[#141418] rounded-t-[28px] flex flex-col overflow-hidden">
        <div className="pt-2.5 pb-1 flex justify-center shrink-0" onClick={onClose}>
          <div className="w-10 h-1 rounded-full bg-[#3a3a48]" />
        </div>
        {title && (
          <div className="px-5 pt-2 pb-3 shrink-0">
            <h3 className="text-[19px] font-bold text-white">{title}</h3>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-5 pb-8">{children}</div>
      </div>
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block mb-3.5">
      <div className="text-[12.5px] text-[#9A9AA5] mb-1.5 font-medium">{label}</div>
      {children}
    </label>
  );
}

export const inputCls =
  'w-full px-4 py-3 rounded-[14px] bg-[#1E1E26] border border-white/10 text-white text-[15px] placeholder:text-[#5E5E6C] focus:border-[#4F8FF7]';

export function Row({
  title,
  subtitle,
  right,
  onClick,
  danger,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`w-full flex items-center gap-3 py-3.5 text-left ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex-1 min-w-0">
        <div className={`text-[15px] font-semibold ${danger ? 'text-[#F0714F]' : 'text-white'}`}>{title}</div>
        {subtitle && <div className="text-[12px] text-[#5E5E6C] mt-0.5 truncate">{subtitle}</div>}
      </div>
      {right ?? (onClick ? <ChevronRight size={20} color={C.chevron} /> : null)}
    </button>
  );
}

export function Divider() {
  return <div className="h-px bg-white/[0.07]" />;
}
