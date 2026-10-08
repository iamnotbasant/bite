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
        fuel: {
          green: {
            DEFAULT: '#2EB65C',
            light: '#3FD474',
            dark: '#179344',
            deep: '#0F6830',
          },
          dark: {
            bg: '#000000',
            card: '#080808',
            surface: '#101010',
            hover: '#181818',
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
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.18)',
        'glass-card-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.12)',
        'emerald-glow': '0 0 40px -10px rgba(46, 182, 92, 0.6)',
        'coral-glow': '0 0 35px -8px rgba(255, 122, 89, 0.5)',
        'blue-glow': '0 0 35px -8px rgba(59, 130, 246, 0.5)',
        'purple-glow': '0 0 35px -8px rgba(139, 92, 246, 0.5)',
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
