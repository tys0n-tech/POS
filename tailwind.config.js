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
        apple: {
          bg: '#F5F5F7',
          card: '#FFFFFF',
          darkBg: '#000000',
          darkCard: '#1C1C1E',
          darkSurface: '#2C2C2E',
          darkHover: '#3A3A3C',
          textPrimary: '#1D1D1F',
          textSecondary: '#6E6E73',
          textTertiary: '#86868B',
          darkTextPrimary: '#F5F5F7',
          darkTextSecondary: '#98989D',
          darkTextTertiary: '#636366',
          border: 'rgba(0, 0, 0, 0.08)',
          darkBorder: 'rgba(255, 255, 255, 0.10)',
          hover: 'rgba(0, 0, 0, 0.04)',
          active: 'rgba(0, 0, 0, 0.07)',
          accent: '#8B6F5A',
          accentHover: '#795F4C',
          accentLight: 'rgba(139, 111, 90, 0.08)',
          accentDark: '#A3856E',
          success: '#34C759',
          warning: '#FF9F0A',
          error: '#FF3B30',
          blue: '#0071E3'
        }
      },
      fontFamily: {
        sans: [
          'SF Pro Text',
          'SF Pro TH',
          'SF Pro Display',
          '-apple-system',
          'BlinkMacSystemFont',
          'Inter',
          'sans-serif'
        ],
        mono: [
          'SF Mono',
          'ui-monospace',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace'
        ]
      },
      borderRadius: {
        'apple-sm': '8px',
        'apple-md': '12px',
        'apple-lg': '16px',
        'apple-xl': '20px',
        'apple-2xl': '24px',
        'apple-sheet': '28px'
      },
      boxShadow: {
        'apple-subtle': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'apple-card': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'apple-floating': '0 12px 36px rgba(0, 0, 0, 0.08)',
        'apple-modal': '0 24px 60px rgba(0, 0, 0, 0.12)',
        'apple-dark-card': '0 4px 20px rgba(0, 0, 0, 0.4)',
        'apple-dark-modal': '0 24px 60px rgba(0, 0, 0, 0.7)'
      },
      transitionTimingFunction: {
        'apple-spring': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'apple-smooth': 'cubic-bezier(0.16, 1, 0.3, 1)'
      }
    },
  },
  plugins: [],
}
