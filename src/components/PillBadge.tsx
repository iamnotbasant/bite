import React from 'react';
import { 
  Tv, 
  Briefcase, 
  Feather, 
  Zap, 
  ShieldCheck, 
  Droplets, 
  Utensils, 
  Flame 
} from 'lucide-react';
import { PILL_BADGES } from '../data/initialData';

interface PillBadgeProps {
  tagId: string;
  label?: string;
  isSelected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const PillBadge: React.FC<PillBadgeProps> = ({
  tagId,
  label,
  isSelected = false,
  onClick,
  size = 'md',
}) => {
  const config = PILL_BADGES[tagId] || {
    id: tagId,
    label: label || tagId,
    iconName: 'utensils',
    badgeStyle: {
      border: 'border-white/30',
      bg: 'bg-white/10',
      text: 'text-white',
      iconBg: 'bg-white/20',
      iconColor: 'text-white',
    },
  };

  const displayLabel = label || config.label;

  const renderIcon = () => {
    const iconSize = size === 'sm' ? 13 : size === 'lg' ? 18 : 15;
    switch (config.iconName) {
      case 'monitor':
        return <Tv size={iconSize} />;
      case 'briefcase':
        return <Briefcase size={iconSize} />;
      case 'feather':
        return <Feather size={iconSize} />;
      case 'zap':
        return <Zap size={iconSize} />;
      case 'shield':
        return <ShieldCheck size={iconSize} />;
      case 'droplets':
        return <Droplets size={iconSize} />;
      case 'flame':
        return <Flame size={iconSize} />;
      default:
        return <Utensils size={iconSize} />;
    }
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3.5 py-1.5 text-sm gap-2',
    lg: 'px-4.5 py-2 text-base gap-2.5',
  }[size];

  const selectedRing = isSelected ? 'ring-2 ring-white/80 shadow-md scale-105' : 'hover:opacity-95';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`inline-flex items-center rounded-full font-semibold border-2 transition-all duration-200 cursor-pointer ${
        config.badgeStyle.border
      } ${config.badgeStyle.bg} ${config.badgeStyle.text} ${sizeClasses} ${selectedRing} ${
        !onClick ? 'cursor-default pointer-events-none' : 'hover:scale-[1.02] active:scale-95'
      }`}
    >
      <span
        className={`flex items-center justify-center p-1 rounded-full ${config.badgeStyle.iconBg} ${config.badgeStyle.iconColor}`}
      >
        {renderIcon()}
      </span>
      <span className="tracking-tight">{displayLabel}</span>
    </button>
  );
};
