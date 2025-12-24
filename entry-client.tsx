import React from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';

// Remove initial loading skeleton immediately
const initialLoader = document.getElementById('initial-loader');
if (initialLoader) initialLoader.remove();

// Start React app immediately - don't wait for CSS
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
});
