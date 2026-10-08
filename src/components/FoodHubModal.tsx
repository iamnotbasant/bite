import React from 'react';
import type { MealCategory, MealItem } from '../types';
import { FoodHubView } from './FoodHubView';

interface FoodHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: MealCategory;
  selectedDate?: string;
  onAddMeal: (meal: Omit<MealItem, 'id' | 'timestamp'> & { timestamp?: string; targetDate?: string }) => void;
  theme?: 'emerald' | 'obsidian' | 'pure-black';
}

export const FoodHubModal: React.FC<FoodHubModalProps> = ({
  isOpen,
  onClose,
  defaultCategory = 'lunch',
  selectedDate,
  onAddMeal,
  theme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-xl max-h-[92vh] sm:max-h-[88vh] rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.9)] border border-white/[0.08] bg-[#0c0d12] text-white flex flex-col transition-all">
        <FoodHubView
          isModal={true}
          onCloseModal={onClose}
          onBackToDashboard={onClose}
          defaultCategory={defaultCategory}
          selectedDate={selectedDate}
          onAddMeal={onAddMeal}
          theme={theme}
        />
      </div>
    </div>
  );
};
