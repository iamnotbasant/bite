/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#000000',
          900: '#040406',
          850: '#07080b',
          800: '#0c0d12',
          750: '#12131a',
          700: '#181922',
          600: '#232430',
          border: 'rgba(255, 255, 255, 0.10)',
          'border-highlight': 'rgba(255, 255, 255, 0.22)',
          'rim-light': 'rgba(255, 255, 255, 0.45)',
        },
        fuel: {
          lime: {
            DEFAULT: '#CDFF50',
            light: '#D9FF70',
            dark: '#B5F228',
            glow: 'rgba(205, 255, 80, 0.4)',
            dim: 'rgba(205, 255, 80, 0.14)',
          },
          green: {
            DEFAULT: '#22c55e',
            light: '#4ade80',
            dark: '#16a34a',
            deep: '#14532d',
          },
          dark: {
            bg: '#000000',
            card: '#050608',
            surface: '#0a0b0f',
            hover: '#111218',
            border: 'rgba(255, 255, 255, 0.12)',
          },
          coral: '#FF7A59',
          amber: '#F59E0B',
          purple: '#8B5CF6',
          violet: '#7C3AED',
          cyan: '#06B6D4',
          blue: '#3B82F6',
          rose: '#F43F5E',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        secondary: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glass-card': '0 20px 48px -8px rgba(0, 0, 0, 0.95)',
        'glass-card-sm': '0 10px 24px -4px rgba(0, 0, 0, 0.85)',
        'rim-top': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.35)',
        'rim-top-bright': 'inset 0 1.5px 1.5px 0 rgba(255, 255, 255, 0.55)',
        'hero-gloss': 'inset 0 1.5px 1.5px 0 rgba(255, 255, 255, 0.55), inset 0 12px 28px -6px rgba(255, 255, 255, 0.18), 0 24px 56px -8px rgba(0, 0, 0, 0.98)',
        'card-gloss': 'inset 0 1.2px 1px 0 rgba(255, 255, 255, 0.38), inset 0 6px 18px -4px rgba(255, 255, 255, 0.08), 0 16px 36px -4px rgba(0, 0, 0, 0.92)',
        'specular-glow': '0 0 32px -4px rgba(255, 255, 255, 0.12)',
        'emerald-glow': '0 0 40px -10px rgba(34, 197, 94, 0.5)',
        'lime-glow': '0 0 28px -2px rgba(205, 255, 80, 0.45)',
        'pill-float': '0 16px 36px rgba(0, 0, 0, 0.95), inset 0 1.5px 1px rgba(255, 255, 255, 0.35)',
        'pill-glass': 'inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.42), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.5), 0 8px 20px rgba(0, 0, 0, 0.7)',
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        }
      }
    },
  },
  plugins: [],
}
