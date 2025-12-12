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
        green: buildPalette('--color-primary-rgb', buildStops()),
        blue: buildPalette('--color-tertiary-rgb', buildStops()),
        orange: buildPalette('--color-secondary-rgb', buildStops()),
        pink: buildPalette('--color-secondary-rgb', buildStops()),
        purple: buildPalette('--color-tertiary-rgb', buildStops())
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeOutUp: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-10px)' },
        },
        fadeOutDown: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(10px)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scaleOut: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.95)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideOutLeft: {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(-20px)' },
        },
        slideOutRight: {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(20px)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
        successBounce: {
          '0%': { transform: 'scale(0)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '10%': { transform: 'scale(1.1)' },
          '20%': { transform: 'scale(1)' },
          '30%': { transform: 'scale(1.1)' },
          '40%': { transform: 'scale(1)' },
        },
        zoomIn: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(251, 146, 60, 0.7)' },
          '50%': { boxShadow: '0 0 20px 10px rgba(251, 146, 60, 0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in-out',
        fadeOut: 'fadeOut 0.3s ease-in-out',
        fadeInUp: 'fadeInUp 0.4s ease-out',
        fadeInDown: 'fadeInDown 0.4s ease-out',
        fadeOutUp: 'fadeOutUp 0.3s ease-in',
        fadeOutDown: 'fadeOutDown 0.3s ease-in',
        scaleIn: 'scaleIn 0.3s ease-out',
        scaleOut: 'scaleOut 0.2s ease-in',
        slideInLeft: 'slideInLeft 0.4s ease-out',
        slideInRight: 'slideInRight 0.4s ease-out',
        slideOutLeft: 'slideOutLeft 0.3s ease-in',
        slideOutRight: 'slideOutRight 0.3s ease-in',
        bounceIn: 'bounceIn 0.6s ease-out',
        successBounce: 'successBounce 0.5s ease-out',
        shimmer: 'shimmer 2s linear infinite',
        wiggle: 'wiggle 0.5s ease-in-out',
        float: 'float 3s ease-in-out infinite',
        heartbeat: 'heartbeat 1s ease-in-out',
        zoomIn: 'zoomIn 0.3s ease-out forwards',
        pulseGlow: 'pulseGlow 2s ease-in-out infinite',
      },
    }
  },
  plugins: []
};
