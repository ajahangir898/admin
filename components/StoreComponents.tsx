// This file has been split into smaller modules for better code splitting and performance
// Components are re-exported here for backward compatibility

// Navigation components
export { MobileBottomNav, StoreHeader } from './store/Navigation';

// Layout components
export { ProductCard, HeroSection, CategoryCircle, CategoryPill, SectionHeader, StoreFooter } from './store/Layout';

// Modal components are NOT exported here to enable proper lazy loading
// Import modals directly from './store/Modals' for lazy loading:
// const TrackOrderModal = lazy(() => import('./components/store/Modals').then(m => ({ default: m.TrackOrderModal })));
