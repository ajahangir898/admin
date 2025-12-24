import React from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import App from './App';
// Import CSS immediately for SSR hydration consistency
import './styles/tailwind.css';

// Remove initial loading skeleton
const initialLoader = document.getElementById('initial-loader');
if (initialLoader) {
  initialLoader.remove();
}

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
