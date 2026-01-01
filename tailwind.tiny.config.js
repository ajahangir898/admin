/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // MINIMAL CONTENT - only scan essential files
    './index.html',
    './App.tsx'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary-rgb))',
        secondary: 'rgb(var(--color-secondary-rgb))',
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
    content: false,
    // Disable spacing utilities we don't need
    space: false,
    divideWidth: false,
    divideColor: false,
    divideOpacity: false,
    divideStyle: false
  },
  plugins: []
};