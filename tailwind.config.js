/** @type {import('tailwindcss').Config} */
const buildPalette = (variable, stops) =>
  Object.fromEntries(
    Object.entries(stops).map(([token, alpha]) => [
      token,
      `rgb(var(${variable}) / ${alpha})`
    ])
  );

const subtleScale = {
  50: 0.08,
  100: 0.16,
  200: 0.26,
  300: 0.38,
  400: 0.52
};

const vividScale = {
  500: 1,
  600: 0.9,
  700: 0.8,
  800: 0.7,
  900: 0.6
};

const buildStops = () => ({ ...subtleScale, ...vividScale });

export default {
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
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      },
      colors: {
        // Dynamic tenant theme colors - these map to CSS variables
        // that are set per-tenant in App.tsx
        green: buildPalette('--color-primary-rgb', buildStops()),
        blue: buildPalette('--color-tertiary-rgb', buildStops()),
        orange: buildPalette('--color-secondary-rgb', buildStops()),
        pink: buildPalette('--color-secondary-rgb', buildStops()),
        purple: buildPalette('--color-tertiary-rgb', buildStops()),
        
        // Semantic theme colors for easier usage
        primary: buildPalette('--color-primary-rgb', buildStops()),
        secondary: buildPalette('--color-secondary-rgb', buildStops()),
        tertiary: buildPalette('--color-tertiary-rgb', buildStops()),
        accent: buildPalette('--color-hover-rgb', buildStops()),
        surface: buildPalette('--color-surface-rgb', buildStops()),
        
        // Font color utility
        'theme-font': {
          DEFAULT: 'rgb(var(--color-font-rgb))',
          50: 'rgb(var(--color-font-rgb) / 0.08)',
          100: 'rgb(var(--color-font-rgb) / 0.16)',
          200: 'rgb(var(--color-font-rgb) / 0.26)',
          300: 'rgb(var(--color-font-rgb) / 0.38)',
          400: 'rgb(var(--color-font-rgb) / 0.52)',
          500: 'rgb(var(--color-font-rgb) / 1)',
          600: 'rgb(var(--color-font-rgb) / 0.9)',
          700: 'rgb(var(--color-font-rgb) / 0.8)',
          800: 'rgb(var(--color-font-rgb) / 0.7)',
          900: 'rgb(var(--color-font-rgb) / 0.6)',
        }
      }
    }
  },
  plugins: []
};
