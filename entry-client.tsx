import React from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';

// Start API fetch IMMEDIATELY - before React even loads
// This runs in parallel with module loading
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const getBootstrapUrl = () => {
  // Try to get tenant from subdomain or use default
  const host = window.location.hostname;
  const parts = host.split('.');
  const subdomain = parts.length > 2 ? parts[0] : null;
  // Will be resolved properly by App.tsx, but start fetching common data
  return `${API_BASE}/api/tenant-data/694ab941b7e68ce9b11a202e/bootstrap`;
};

// Prefetch bootstrap data immediately (fire and forget - App.tsx will use cached result)
const prefetchPromise = fetch(getBootstrapUrl(), {
  credentials: 'include',
  headers: { 'Accept': 'application/json' }
}).then(r => r.json()).catch(() => null);

// Store prefetched data globally for DataService to pick up
(window as any).__PREFETCHED_BOOTSTRAP__ = prefetchPromise;

const container = document.getElementById('root')!;

// Import app and CSS in parallel
Promise.all([
  import('./App'),
  import('./styles/tailwind.css')
]).then(([{ default: App }]) => {
  if (container.hasChildNodes()) {
    hydrateRoot(container, <App />);
  } else {
    createRoot(container).render(<App />);
  }
  // Remove skeleton after React has rendered first frame
  requestAnimationFrame(() => {
    const initialLoader = document.getElementById('initial-loader');
    if (initialLoader) initialLoader.remove();
  });
});
