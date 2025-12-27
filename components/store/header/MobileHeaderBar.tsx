import React from 'react';
import { ShoppingCart, Heart, User } from 'lucide-react';
import { normalizeImageUrl } from '../../../utils/imageUrlHelper';
import type { HeaderSearchProps } from './headerTypes';
import { MobileSearchBar } from './HeaderSearchBar';

interface MobileHeaderBarProps {
  resolvedHeaderLogo: string | null;
  logoKey: string;
  onHomeClick?: () => void;
  wishlistBadgeCount: number;
  cartBadgeCount: number;
  onWishlistOpen: () => void;
  onCartOpen: () => void;
  onAccountClick?: () => void;
  searchProps: HeaderSearchProps;
}

export const MobileHeaderBar: React.FC<MobileHeaderBarProps> = ({
  resolvedHeaderLogo,
  logoKey,
  onHomeClick,
  wishlistBadgeCount,
  cartBadgeCount,
  onWishlistOpen,
  onCartOpen,
  onAccountClick,
  searchProps
}) => (
  <div className="md:hidden bg-white px-3 py-2.5 border-b border-gray-100 shadow-sm sticky top-0 z-40">
    {/* Top Row: Actions Left, Logo Right */}
    <div className="flex items-center justify-between gap-2 mb-2.5">
      {/* Left: Action Icons */}
      <div className="flex items-center gap-0.5">
        <button 
          type="button" 
          className="relative w-9 h-9 flex items-center justify-center rounded-xl text-gray-700 hover:bg-gray-100 transition-colors" 
          onClick={onWishlistOpen}
        >
          <Heart size={20} />
          {wishlistBadgeCount > 0 && (
            <span className="absolute top-0.5 right-0.5 bg-theme-primary text-white text-[9px] font-bold h-3.5 w-3.5 rounded-full flex items-center justify-center">
              {wishlistBadgeCount}
            </span>
          )}
        </button>
        <button 
          type="button" 
          className="relative w-9 h-9 flex items-center justify-center rounded-xl text-gray-700 hover:bg-gray-100 transition-colors" 
          onClick={onCartOpen}
        >
          <ShoppingCart size={20} />
          {cartBadgeCount > 0 && (
            <span className="absolute top-0.5 right-0.5 bg-theme-primary text-white text-[9px] font-bold h-3.5 w-3.5 rounded-full flex items-center justify-center">
              {cartBadgeCount}
            </span>
          )}
        </button>
        <button 
          type="button" 
          className="relative w-9 h-9 flex items-center justify-center rounded-xl text-gray-700 hover:bg-gray-100 transition-colors" 
          onClick={onAccountClick}
        >
          <User size={20} />
        </button>
      </div>

      {/* Right: Logo */}
      <button type="button" className="flex items-center" onClick={onHomeClick}>
        {resolvedHeaderLogo ? (
          <img
            key={logoKey}
            src={normalizeImageUrl(resolvedHeaderLogo)}
            alt="Store logo"
            className="h-8 max-w-[120px] object-contain"
          />
        ) : (
          <h1 className="text-lg font-bold tracking-tight">
            <span className="text-green-900">YOUR</span>
            <span className="text-theme-primary">SHOP</span>
          </h1>
        )}
      </button>
    </div>

    {/* Bottom Row: Search Bar */}
    <MobileSearchBar {...searchProps} />
  </div>
);