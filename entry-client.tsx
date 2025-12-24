import React from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';

// Keep skeleton visible until actual content renders
// It will be hidden via CSS when #root has content
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
