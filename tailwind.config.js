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
          900: '#050507',
          850: '#090a0d',
          800: '#0e0f14',
          750: '#14151c',
          700: '#1a1b24',
          600: '#252632',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-highlight': 'rgba(255, 255, 255, 0.16)',
        },
        fuel: {
          green: {
            DEFAULT: '#22c55e',
            light: '#4ade80',
            dark: '#16a34a',
            deep: '#14532d',
          },
          dark: {
            bg: '#000000',
            card: '#08080a',
            surface: '#0e0f13',
            hover: '#16171d',
            border: 'rgba(255, 255, 255, 0.08)',
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
        'glass-card': '0 12px 32px 0 rgba(0, 0, 0, 0.85)',
        'glass-card-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.65)',
        'rim-top': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.2)',
        'rim-top-bright': 'inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.35)',
        'specular-glow': '0 0 32px -4px rgba(255, 255, 255, 0.08)',
        'emerald-glow': '0 0 40px -10px rgba(34, 197, 94, 0.5)',
        'pill-float': '0 16px 36px rgba(0, 0, 0, 0.95), inset 0 1px 1px rgba(255, 255, 255, 0.18)',
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
