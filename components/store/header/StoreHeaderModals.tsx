import React, { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';
import type { Product } from '../../../types';
import type { VisualSearchResult } from '../../../services/visualSearchTypes';
import type { CatalogGroup } from './headerTypes';

const CartModal = lazy(() => import('./CartModal'));
const WishlistModal = lazy(() => import('./WishlistModal'));
const MobileDrawer = lazy(() => import('./MobileDrawer'));
const VisualSearchModal = lazy(() => import('../visualSearch/VisualSearchModal'));

interface StoreHeaderModalsProps {
  isVisualSearchOpen: boolean;
  isVisualSearchProcessing: boolean;
  visualSearchImage: string | null;
  visualSearchResult: VisualSearchResult | null;
  visualSearchMatches: Product[];
  visualSearchError: string | null;
  onVisualSearchClose: () => void;
  onVisualSearchCapture: (imageData: string) => Promise<void>;
  onVisualSearchProductView: (product: Product) => void;
  onCartToggle: (productId: number) => void;
  onWishlistToggle: (productId: number) => void;
  catalogSource: Product[];
  cartItems: number[];
  wishlistItems: number[];
  isWishlistDrawerOpen: boolean;
  onWishlistClose: () => void;
  isCartDrawerOpen: boolean;
  onCartClose: () => void;
  onCheckoutFromCart: (productId: number) => void;
  isMobileMenuOpen: boolean;
  onMobileMenuClose: () => void;
  logo?: string | null;
  logoKey: string;
  catalogGroups: CatalogGroup[];
  activeCatalogSection: string;
  isCatalogDropdownOpen: boolean;
  onCatalogDropdownToggle: () => void;
  onCatalogSectionToggle: (key: string) => void;
  onCatalogItemClick: (item: string) => void;
  onTrackOrder?: () => void;
}

export const StoreHeaderModals: React.FC<StoreHeaderModalsProps> = ({
  isVisualSearchOpen,
  isVisualSearchProcessing,
  visualSearchImage,
  visualSearchResult,
  visualSearchMatches,
  visualSearchError,
  onVisualSearchClose,
  onVisualSearchCapture,
  onVisualSearchProductView,
  onCartToggle,
  onWishlistToggle,
  catalogSource,
  cartItems,
  wishlistItems,
  isWishlistDrawerOpen,
  onWishlistClose,
  isCartDrawerOpen,
  onCartClose,
  onCheckoutFromCart,
  isMobileMenuOpen,
  onMobileMenuClose,
  logo,
  logoKey,
  catalogGroups,
  activeCatalogSection,
  isCatalogDropdownOpen,
  onCatalogDropdownToggle,
  onCatalogSectionToggle,
  onCatalogItemClick,
  onTrackOrder
}) => (
  <>
    {isVisualSearchOpen && (
      <Suspense
        fallback={
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 backdrop-blur-xl">
            <div className="flex items-center gap-3 rounded-full bg-white/10 px-5 py-3 text-white">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm gesund font-semibold tracking-wide">Loading visual search…</span>
            </div>
          </div>
        }
      >
        <VisualSearchModal
          isOpen={isVisualSearchOpen}
          isProcessing={isVisualSearchProcessing}
          capturedImage={visualSearchImage}
          result={visualSearchResult}
          matches={visualSearchMatches}
          errorMessage={visualSearchError}
          onClose={onVisualSearchClose}
          onCapture={onVisualSearchCapture}
          onAddToCart={onCartToggle}
          onViewProduct={onVisualSearchProductView}
        />
      </Suspense>
    )}

    {isWishlistDrawerOpen && (
      <Suspense fallback={null}>
        <WishlistModal
          isOpen={isWishlistDrawerOpen}
          onClose={onWishlistClose}
          wishlistItems={wishlistItems}
          catalogSource={catalogSource}
          onToggleWishlist={onWishlistToggle}
        />
      </Suspense>
    )}

    {isCartDrawerOpen && (
      <Suspense fallback={null}>
        <CartModal
          isOpen={isCartDrawerOpen}
          onClose={onCartClose}
          cartItems={cartItems}
          catalogSource={catalogSource}
          onToggleCart={onCartToggle}
          onCheckout={onCheckoutFromCart}
        />
      </Suspense>
    )}

    {isMobileMenuOpen && (
      <Suspense fallback={null}>
        <MobileDrawer
          isOpen={isMobileMenuOpen}
          onClose={onMobileMenuClose}
          logo={logo}
          logoKey={logoKey}
          catalogGroups={catalogGroups}
          activeCatalogSection={activeCatalogSection}
          isCatalogDropdownOpen={isCatalogDropdownOpen}
          onCatalogDropdownToggle={onCatalogDropdownToggle}
          onCatalogSectionToggle={onCatalogSectionToggle}
          onCatalogItemClick={onCatalogItemClick}
          onTrackOrder={onTrackOrder}
        />
      </Suspense>
    )}
  </>
);