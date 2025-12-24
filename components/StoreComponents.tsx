// StoreComponents.tsx - Re-exports store components for code splitting

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
    AddToCartSuccessModal,
    CategoryCircle,
    CategoryPill,
    SectionHeader
} from './store';

// Skeleton loaders for store views
// export {
//     StorePageSkeleton,
//     HeroSectionSkeleton,
//     CategoriesSectionSkeleton,
//     FlashSalesSkeleton,
//     ProductGridSkeleton,
//     PromoBannerSkeleton,
//     SearchResultsSkeleton
// } from './SkeletonLoaders';

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
    AddToCartSuccessModalProps
} from './store';
