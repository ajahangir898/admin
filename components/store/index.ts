// Navigation components
export { MobileBottomNav, StoreHeader } from './Navigation';

// Layout components
export { ProductCard, HeroSection, CategoryCircle, CategoryPill, SectionHeader, StoreFooter } from './Layout';

// Note: Modal components are NOT exported here to enable proper lazy loading
// Import modals directly from './store/Modals' for lazy loading:
// const TrackOrderModal = lazy(() => import('../components/store/Modals').then(m => ({ default: m.TrackOrderModal })));
