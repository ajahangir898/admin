/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './App.tsx',
    './index.tsx',
    './components/**/*.{ts,tsx,js,jsx}',
    './pages/**/*.{ts,tsx,js,jsx}',
    './services/**/*.{ts,tsx,js,jsx}',
    './constants.ts',
    './types.ts'
  ],
  darkMode: 'class',
  safelist: [
    // Grid columns for dynamic layouts
    'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-5', 'grid-cols-6',
    // Status badge colors
    'bg-green-100', 'bg-green-500', 'text-green-800',
    'bg-red-100', 'bg-red-500', 'text-red-800', 
    'bg-yellow-100', 'bg-yellow-500', 'text-yellow-800',
    'bg-blue-100', 'bg-blue-500', 'text-blue-800',
    'bg-emerald-100', 'bg-emerald-500', 'text-emerald-800',
    'bg-rose-100', 'bg-rose-500', 'text-rose-800',
    'bg-amber-100', 'bg-amber-500', 'text-amber-800',
    // Dynamic spacing
    'p-2', 'p-4', 'p-6', 'm-2', 'm-4', 'm-6',
    // Common animations and transitions
    'transition-all', 'duration-300', 'ease-in-out',
    // Theme variables
    'bg-primary', 'bg-secondary', 'bg-tertiary', 'bg-accent', 'bg-surface',
    'text-primary', 'text-secondary', 'text-tertiary', 'text-accent',
    'bg-theme-primary', 'text-theme-font', 'text-theme-primary',
    // Common colors from scan
    'bg-white', 'bg-black', 'bg-gray-50', 'bg-gray-100', 'bg-slate-700', 'bg-slate-900',
    'text-white', 'text-black', 'text-gray-600', 'text-gray-800', 'text-slate-400',
    // Common utilities
    'flex', 'grid', 'rounded-xl', 'rounded-2xl', 'shadow-sm', 'shadow-lg', 'shadow-xl'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      },
      keyframes: {
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(100px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-33.33%)' }
        }
      },
      animation: {
        'slide-in-right': 'slide-in-right 0.5s ease-out forwards',
        'fade-in': 'fade-in 0.4s ease-in-out forwards',
        'marquee': 'marquee 12s linear infinite'
      },
      colors: {
        // Simplified theme colors - remove complex palette functions
        primary: {
          50: 'rgba(var(--color-primary-rgb), 0.1)',
          500: 'rgb(var(--color-primary-rgb))'
        },
        secondary: {
          50: 'rgba(var(--color-secondary-rgb), 0.1)', 
          500: 'rgb(var(--color-secondary-rgb))'
        },
        tertiary: 'rgb(var(--color-tertiary-rgb))',
        accent: 'rgb(var(--color-hover-rgb))',
        surface: 'rgb(var(--color-surface-rgb))',
        'theme-font': 'rgb(var(--color-font-rgb))',
        'theme-primary': 'rgb(var(--color-primary-rgb))'
      }
    }
  },
  corePlugins: {
    // Aggressively disable unused utilities 
    backdropBlur: false,
    backdropBrightness: false,
    backdropContrast: false,
    backdropGrayscale: false,
    backdropHueRotate: false,
    backdropInvert: false,
    backdropOpacity: false,
    backdropSaturate: false,
    backdropSepia: false,
    filter: false,
    blur: false,
    brightness: false,
    contrast: false,
    dropShadow: false,
    grayscale: false,
    hueRotate: false,
    invert: false,
    saturate: false,
    sepia: false,
    scrollMargin: false,
    scrollPadding: false,
    ringColor: false,
    ringOffsetColor: false,
    ringOffsetWidth: false,
    ringOpacity: false,
    ringWidth: false,
    // Disable additional unused utilities
    columns: false,
    breakAfter: false,
    breakBefore: false,
    breakInside: false,
    boxDecorationBreak: false,
    caretColor: false,
    accentColor: false,
    aspectRatio: false,
    scrollSnapAlign: false,
    scrollSnapStop: false,
    scrollSnapType: false,
    touchAction: false,
    userSelect: false,
    resize: false,
    scrollBehavior: false,
    listStyleImage: false,
    listStylePosition: false,
    listStyleType: false,
    appearance: false,
    cursor: false,
    pointerEvents: false,
    willChange: false,
    content: false
  },
  plugins: []
};