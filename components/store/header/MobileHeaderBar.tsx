import React from 'react';
import { ShoppingCart, Heart, Bell, Menu } from 'lucide-react';
import { normalizeImageUrl } from '../../../utils/imageUrlHelper';
import type { HeaderSearchProps } from './headerTypes';
import { MobileSearchBar } from './HeaderSearchBar';

interface MobileHeaderBarProps {
  resolvedHeaderLogo: string | null;
  logoKey: string;
  onHomeClick?: () => void;
  wishlistBadgeCount: number;
  cartBadgeCount: number;
  notificationBadgeCount: number;
  onWishlistOpen: () => void;
  onCartOpen: () => void;
  onMobileMenuOpen: () => void;
  searchProps: HeaderSearchProps;
}

export const MobileHeaderBar: React.FC<MobileHeaderBarProps> = ({
  resolvedHeaderLogo,
  logoKey,
  onHomeClick,
  wishlistBadgeCount,
  cartBadgeCount,
  notificationBadgeCount,
  onWishlistOpen,
  onCartOpen,
  onMobileMenuOpen,
  searchProps
}) => (
  <div className="md:hidden bg-white pb-1 pt-0 px-3 border-b border-gray-100 shadow-sm">
    <div className="flex justify-between items-center mb-3 h-8 gap-3">
      <button type="button" className="flex items-center" onClick={onHomeClick}>
        {resolvedHeaderLogo ? (
          <img
            key={logoKey}
            src={normalizeImageUrl(resolvedHeaderLogo)}
            alt="Store logo"
            className="h-8 object-contain"
          />
        ) : (
          <h1 className="text-lg font-bold tracking-tight">
            <span className="text-green-900">YOUR</span>
            <span className="text-theme-primary">SHOP</span>
          </h1>
        )}
      </button>
      <div className="flex items-center gap-3">
        <button type="button" className="relative text-gray-800" onClick={onWishlistOpen}>
          <Heart size={24} />
          {wishlistBadgeCount > 0 && (
            <span className="absolute -top-1.5 -right-1 bg-theme-primary text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
              {wishlistBadgeCount}
            </span>
          )}
        </button>
        <button type="button" className="relative text-gray-800" onClick={onCartOpen}>
          <ShoppingCart size={26} />
          {cartBadgeCount > 0 && (
            <span className="absolute -top-1.5 -right-1 bg-black text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
              {cartBadgeCount}
            </span>
          )}
        </button>
        <div className="relative text-gray-800">
          <Bell size={24} />
          {notificationBadgeCount > 0 && (
            <span className="absolute -top-1.5 -right-1 bg-blue-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
              {notificationBadgeCount}
            </span>
          )}
        </div>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <button type="button" className="text-gray-800" onClick={onMobileMenuOpen}>
        <Menu size={28} />
      </button>
      <MobileSearchBar {...searchProps} />
    </div>
  </div>
);