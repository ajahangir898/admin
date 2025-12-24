import React from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import App from './App';

// Defer CSS loading - only load after hydration for faster TTI
const loadCSS = () => import('./styles/tailwind.css');

const container = document.getElementById('root')!;

// Use hydrateRoot if SSR content exists, otherwise createRoot for dev
if (container.hasChildNodes()) {
  // SSR hydration - fastest path
  hydrateRoot(container, <App />);
} else {
  // Client-only render (dev mode without SSR)
  const root = createRoot(container);
  root.render(<App />);
}

// Load full CSS after hydration completes
requestIdleCallback(() => loadCSS(), { timeout: 100 });
