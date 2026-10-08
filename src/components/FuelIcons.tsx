import React from 'react';

export type FuelIconType =
  | 'dashboard'
  | 'target'
  | 'fiber'
  | 'energy'
  | 'calories'
  | 'quality'
  | 'water'
  | 'protein'
  | 'carbs'
  | 'fat'
  | 'timing';

interface FuelIconConfig {
  borderColor: string;
  bgTint: string;
  badgeBg: string;
  iconColor: string;
  glowColor: string;
}

export const FUEL_ICON_CONFIGS: Record<FuelIconType, FuelIconConfig> = {
  dashboard: {
    borderColor: 'rgba(255, 255, 255, 0.14)',
    bgTint: 'rgba(255, 255, 255, 0.04)',
    badgeBg: '#1f2029',
    iconColor: '#FFFFFF',
    glowColor: 'transparent',
  },
  target: {
    borderColor: 'rgba(255, 255, 255, 0.14)',
    bgTint: 'rgba(255, 255, 255, 0.04)',
    badgeBg: '#1f2029',
    iconColor: '#FFFFFF',
    glowColor: 'transparent',
  },
  fiber: {
    borderColor: 'rgba(255, 255, 255, 0.14)',
    bgTint: 'rgba(255, 255, 255, 0.04)',
    badgeBg: '#1f2029',
    iconColor: '#FFFFFF',
    glowColor: 'transparent',
  },
  energy: {
    borderColor: 'rgba(255, 255, 255, 0.14)',
    bgTint: 'rgba(255, 255, 255, 0.04)',
    badgeBg: '#1f2029',
    iconColor: '#FFFFFF',
    glowColor: 'transparent',
  },
  calories: {
    borderColor: 'rgba(255, 255, 255, 0.14)',
    bgTint: 'rgba(255, 255, 255, 0.04)',
    badgeBg: '#1f2029',
    iconColor: '#FFFFFF',
    glowColor: 'transparent',
  },
  quality: {
    borderColor: 'rgba(255, 255, 255, 0.14)',
    bgTint: 'rgba(255, 255, 255, 0.04)',
    badgeBg: '#1f2029',
    iconColor: '#FFFFFF',
    glowColor: 'transparent',
  },
  water: {
    borderColor: 'rgba(255, 255, 255, 0.14)',
    bgTint: 'rgba(255, 255, 255, 0.04)',
    badgeBg: '#1f2029',
    iconColor: '#FFFFFF',
    glowColor: 'transparent',
  },
  protein: {
    borderColor: 'rgba(255, 255, 255, 0.14)',
    bgTint: 'rgba(255, 255, 255, 0.04)',
    badgeBg: '#1f2029',
    iconColor: '#FFFFFF',
    glowColor: 'transparent',
  },
  carbs: {
    borderColor: 'rgba(255, 255, 255, 0.14)',
    bgTint: 'rgba(255, 255, 255, 0.04)',
    badgeBg: '#1f2029',
    iconColor: '#FFFFFF',
    glowColor: 'transparent',
  },
  fat: {
    borderColor: 'rgba(255, 255, 255, 0.14)',
    bgTint: 'rgba(255, 255, 255, 0.04)',
    badgeBg: '#1f2029',
    iconColor: '#FFFFFF',
    glowColor: 'transparent',
  },
  timing: {
    borderColor: 'rgba(255, 255, 255, 0.14)',
    bgTint: 'rgba(255, 255, 255, 0.04)',
    badgeBg: '#1f2029',
    iconColor: '#FFFFFF',
    glowColor: 'transparent',
  },
};

/**
 * Pure SVG vectors matching the exact shapes in reference media_1791387532290.png
 */
export const FuelSvgGlyph: React.FC<{ name: FuelIconType; size?: number; className?: string }> = ({
  name,
  size = 20,
  className = '',
}) => {
  const config = FUEL_ICON_CONFIGS[name] || FUEL_ICON_CONFIGS.energy;

  switch (name) {
    // 1. Blue Monitor with curved base stand (media_1791387532290.png Row 1)
    case 'dashboard':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <rect
            x="3"
            y="4"
            width="18"
            height="11"
            rx="3"
            fill={config.iconColor}
          />
          <path
            d="M6 19 C8 17.5 16 17.5 18 19"
            stroke={config.iconColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      );

    // 2. Green Briefcase with $ symbol (media_1791387532290.png Row 2)
    case 'target':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          {/* Briefcase Body */}
          <rect
            x="3"
            y="7"
            width="18"
            height="13"
            rx="3"
            fill={config.iconColor}
          />
          {/* Handle */}
          <path
            d="M9 7 V5 C9 4.2 9.7 3.5 10.5 3.5 H13.5 C14.3 3.5 15 4.2 15 5 V7"
            stroke={config.iconColor}
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Center $ Symbol in badge color */}
          <path
            d="M12 9.5 V17.5"
            stroke={config.badgeBg}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M14 11.5 C14 10.5 13 9.8 12 9.8 C10.8 9.8 10 10.5 10 11.5 C10 13 14 13 14 14.8 C14 16 13 16.8 12 16.8 C10.8 16.8 10 16 10 15"
            stroke={config.badgeBg}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Side tabs */}
          <rect x="2" y="11" width="2" height="3" rx="1" fill={config.iconColor} />
          <rect x="20" y="11" width="2" height="3" rx="1" fill={config.iconColor} />
        </svg>
      );

    // 3. Purple Feather / Leaf (media_1791387532290.png Row 3)
    case 'fiber':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M20.5 3.5 C15 3.8 9.5 8 7.5 13.5 L6 19 L11.5 17.5 C17 15.5 21.2 10 21.5 4.5 C21.5 4 21 3.5 20.5 3.5 Z"
            fill={config.iconColor}
          />
          <path
            d="M7.5 13.5 L14 7"
            stroke={config.badgeBg}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );

    // 4. Orange Lightning Bolt (media_1791387532290.png Row 4)
    case 'energy':
    case 'calories':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M13.5 2.5 L6 13 H12 L10.5 21.5 L18 11 H12 L13.5 2.5 Z"
            fill={config.iconColor}
            stroke={config.iconColor}
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </svg>
      );

    // 5. Navy Shield with Checkmark (media_1791387532290.png Row 5)
    case 'quality':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          {/* Rounded shield */}
          <path
            d="M12 2.5 C15.5 4 19 4 19.5 4.5 C19.5 9 18.5 15.5 12 21.5 C5.5 15.5 4.5 9 4.5 4.5 C5 4 8.5 4 12 2.5 Z"
            fill={config.iconColor}
          />
          {/* Bold checkmark */}
          <path
            d="M8.5 11.5 L11 14 L15.5 9"
            stroke={config.badgeBg}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    // 6. Cyan Water Waves + Droplet (media_1791387532290.png Row 6)
    case 'water':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          {/* 3 Wavy ripple lines on the left */}
          <path
            d="M3 8 C5 6.5 7 9.5 9 8 C11 6.5 13 9.5 15 8"
            stroke={config.iconColor}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M3 12 C5 10.5 7 13.5 9 12 C11 10.5 13 13.5 15 12"
            stroke={config.iconColor}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M3 16 C5 14.5 7 17.5 9 16 C11 14.5 13 17.5 15 16"
            stroke={config.iconColor}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Plump water droplet on the right */}
          <path
            d="M19 9.5 C19 9.5 15.5 14.2 15.5 16.8 C15.5 19 17.1 20.8 19 20.8 C20.9 20.8 22.5 19 22.5 16.8 C22.5 14.2 19 9.5 19 9.5 Z"
            fill={config.iconColor}
          />
        </svg>
      );

    // 7. Protein - Dual Dumbbell / Muscle
    case 'protein':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <rect x="2" y="8" width="3" height="8" rx="1.5" fill={config.iconColor} />
          <rect x="5.5" y="6" width="3.5" height="12" rx="1.5" fill={config.iconColor} />
          <rect x="9" y="10.5" width="6" height="3" rx="1" fill={config.iconColor} />
          <rect x="15" y="6" width="3.5" height="12" rx="1.5" fill={config.iconColor} />
          <rect x="19" y="8" width="3" height="8" rx="1.5" fill={config.iconColor} />
        </svg>
      );

    // 8. Carbs - Wheat Grain Sheaf
    case 'carbs':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M12 22 V3 M12 6 C10 4 8 5 8 7 C8 9 10 10 12 10 M12 6 C14 4 16 5 16 7 C16 9 14 10 12 10 M12 11 C10 9 8 10 8 12 C8 14 10 15 12 15 M12 11 C14 9 16 10 16 12 C16 14 14 15 12 15"
            stroke={config.iconColor}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    // 9. Healthy Fats - Avocado / Seed
    case 'fat':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M12 2 C8 2 5 7 5 14 C5 18.4 8.1 22 12 22 C15.9 22 19 18.4 19 14 C19 7 16 2 12 2 Z"
            fill={config.iconColor}
          />
          <circle cx="12" cy="15" r="3.5" fill={config.badgeBg} />
        </svg>
      );

    // 10. Timing - Clock
    case 'timing':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="9" stroke={config.iconColor} strokeWidth="2.5" />
          <path
            d="M12 7 V12 L15.5 14"
            stroke={config.iconColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      );

    default:
      return null;
  }
};

/**
 * Squircle Icon Badge (The colored pill icon on the left from media_1791387532290.png)
 */
export const FuelIconBadge: React.FC<{
  name: FuelIconType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  shape?: 'squircle' | 'circle';
  active?: boolean;
}> = ({ name, size = 'md', className = '', shape = 'squircle', active = false }) => {
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const glyphSizes = {
    sm: 15,
    md: 18,
    lg: 22,
  };

  const roundedClass = shape === 'circle' ? 'rounded-full' : 'rounded-xl';

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 border transition-transform duration-200 ${sizeClasses[size]} ${roundedClass} ${
        active
          ? 'bg-black text-white border-black/20'
          : 'bg-white/10 text-white border-white/10'
      } ${className}`}
    >
      <FuelSvgGlyph name={name} size={glyphSizes[size]} />
    </div>
  );
};

/**
 * FuelPillBadge (Full capsule button / badge)
 * Minimal modern monochrome luxury styling
 */
export const FuelPillBadge: React.FC<{
  name: FuelIconType;
  label?: string;
  value?: string | number;
  subValue?: string;
  active?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({
  name,
  label,
  value,
  subValue,
  active = false,
  onClick,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 gap-2 text-xs rounded-full',
    md: 'px-3 py-1.5 gap-2.5 text-xs sm:text-sm rounded-full',
    lg: 'px-4 py-2 gap-3 text-sm sm:text-base rounded-full',
  };

  const isClickable = Boolean(onClick);

  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={isClickable ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick?.() : undefined}
      className={`inline-flex items-center select-none transition-all duration-200 border ${
        sizeClasses[size]
      } ${
        active
          ? 'bg-white text-black border-white shadow-md'
          : 'bg-[#14151e] text-zinc-300 border-white/10 hover:border-white/20 hover:text-white'
      } ${isClickable ? 'cursor-pointer active:scale-95' : ''} ${className}`}
    >
      {/* Icon Squircle Badge */}
      <FuelIconBadge name={name} size={size === 'lg' ? 'md' : 'sm'} active={active} />

      {/* Content */}
      {(label || value) && (
        <div className="flex items-center gap-2 pr-1">
          {label && (
            <span
              className={`font-bold tracking-tight truncate ${
                active ? 'text-black' : 'text-zinc-300'
              }`}
            >
              {label}
            </span>
          )}

          {value && (
            <span
              className={`font-mono font-extrabold ${
                active ? 'text-black' : 'text-white'
              }`}
            >
              {value}
            </span>
          )}

          {subValue && (
            <span className={`text-[10px] font-mono ${active ? 'text-zinc-600' : 'text-zinc-400'}`}>
              {subValue}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
