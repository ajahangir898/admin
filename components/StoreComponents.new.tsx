// StoreComponents.tsx - Re-exports all store components from separate files for better code splitting
// The individual component implementations have been moved to components/store/ folder

import React, { lazy, Suspense } from 'react';

// Re-export StoreHeader from its own file
export { StoreHeader } from './StoreHeader';
export type { StoreHeaderProps } from './StoreHeader';

// Import and re-export lazy-loaded components from store folder
export {
    StoreChatModal,
    LoginModal,
    MobileBottomNav,
    ProductCard,
    HeroSection,
    StoreFooter,
    ProductQuickViewModal,
    TrackOrderModal,
    AIStudioModal,
    AddToCartSuccessModal,
    CategoryCircle,
    CategoryPill,
    SectionHeader
} from './store';

// Re-export types
export type {
    StoreChatModalProps,
    LoginModalProps,
    MobileBottomNavProps,
    ProductCardProps,
    HeroSectionProps,
    StoreFooterProps,
    ProductQuickViewModalProps,
    TrackOrderModalProps,
    AIStudioModalProps,
    AddToCartSuccessModalProps
} from './store';
