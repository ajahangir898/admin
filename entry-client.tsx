import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import App from './App';
import './styles/tailwind.css';

// Hydrate the app on the client side
hydrateRoot(
  document.getElementById('root')!,
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
