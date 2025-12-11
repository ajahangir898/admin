// This file has been split into smaller modules for better code splitting and performance
// All components are re-exported here for backward compatibility

// Navigation components
export { MobileBottomNav, StoreHeader } from './store/Navigation';

// Layout components
export { ProductCard, HeroSection, CategoryCircle, CategoryPill, SectionHeader, StoreFooter } from './store/Layout';

// Modal components (these should be lazy loaded in consuming components)
export { TrackOrderModal, AIStudioModal, ProductQuickViewModal, AddToCartSuccessModal, LoginModal, StoreChatModal } from './store/Modals';
