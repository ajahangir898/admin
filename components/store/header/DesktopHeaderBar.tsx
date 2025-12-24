import React from 'react';
import { ShoppingCart, Heart, User, LogOut, ChevronDown, Truck, UserCircle } from 'lucide-react';
import { normalizeImageUrl } from '../../../utils/imageUrlHelper';
import type { HeaderSearchProps } from './headerTypes';
import { DesktopSearchBar } from './HeaderSearchBar';
import type { User as UserType, WebsiteConfig } from '../../../types';

interface DesktopHeaderBarProps {
  resolvedHeaderLogo: string | null;
  logoKey: string;
  onHomeClick?: () => void;
  searchProps: HeaderSearchProps;
  wishlistBadgeCount: number;
  cartBadgeCount: number;
  onWishlistOpen: () => void;
  onCartOpen: () => void;
  user?: UserType | null;
  onLoginClick?: () => void;
  onProfileClick?: () => void;
  onTrackOrder?: () => void;
  onLogoutClick?: () => void;
  isMenuOpen: boolean;
  onMenuToggle: () => void;
  onMenuClose: () => void;
  menuRef: React.RefObject<HTMLDivElement>;
  categoriesList?: string[];
  onCategoriesClick?: () => void;
  onCategorySelect?: (category: string) => void;
  categoryMenuRef: React.RefObject<HTMLDivElement>;
  isCategoryMenuOpen: boolean;
  onCategoryMenuOpen: (open: boolean) => void;
  onProductsClick?: () => void;
  websiteConfig?: WebsiteConfig;
}

export const DesktopHeaderBar: React.FC<DesktopHeaderBarProps> = ({
  resolvedHeaderLogo,
  logoKey,
  onHomeClick,
  searchProps,
  wishlistBadgeCount,
  cartBadgeCount,
  onWishlistOpen,
  onCartOpen,
  user,
  onLoginClick,
  onProfileClick,
  onTrackOrder,
  onLogoutClick,
  isMenuOpen,
  onMenuToggle,
  onMenuClose,
  menuRef,
  categoriesList,
  onCategoriesClick,
  onCategorySelect,
  categoryMenuRef,
  isCategoryMenuOpen,
  onCategoryMenuOpen,
  onProductsClick,
  websiteConfig
}) => (
  <div className="hidden md:block">
    <div className="max-w-7xl mx-auto px-4 py-1">
      <div className="flex items-center justify-between gap-4">
        <button type="button" className="flex items-center cursor-pointer" onClick={onHomeClick}>
          {resolvedHeaderLogo ? (
            <img
              key={logoKey}
              src={normalizeImageUrl(resolvedHeaderLogo)}
              alt="Store logo"
              className="h-8 md:h-10 object-contain"
            />
          ) : (
            <h2 className="text-2xl font-black tracking-widest">
              <span style={{ color: 'var(--admin-text, white)' }}>GADGET</span>
              <span style={{ color: 'var(--admin-accent-secondary, #ef4444)' }}>SHOB</span>
            </h2>
          )}
        </button>
        <DesktopSearchBar {...searchProps} />
        <div className="flex items-center gap-6 text-gray-600">
          <button
            type="button"
            className="flex items-center gap-2 cursor-pointer hover:text-theme-primary transition hidden md:flex"
            onClick={onWishlistOpen}
          >
            <div className="relative">
              <Heart size={24} />
              {wishlistBadgeCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-theme-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistBadgeCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline text-sm font-medium">Wishlist</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-2 cursor-pointer hover:text-theme-primary transition hidden md:flex"
            onClick={onCartOpen}
          >
            <div className="relative">
              <ShoppingCart size={24} />
              {cartBadgeCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-theme-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartBadgeCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline text-sm font-medium">Cart</span>
          </button>
          <div className="relative hidden md:block" ref={menuRef}>
            <button
              type="button"
              className="flex items-center gap-2 cursor-pointer hover:text-theme-primary transition"
              onClick={user ? onMenuToggle : onLoginClick}
            >
              <div className="bg-gray-100 p-1 rounded-full">
                <User size={20} />
              </div>
              {user ? (
                <span className="text-sm font-bold">
                  {user.name.split(' ')[0]} <ChevronDown size={12} className="inline" />
                </span>
              ) : (
                <span className="text-sm font-medium">Login</span>
              )}
            </button>
            {user && isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border py-1 z-50">
                <div className="px-4 py-3 border-b">
                  <p className="text-sm font-bold truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onMenuClose();
                    onProfileClick?.();
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <UserCircle size={16} />
                  My Profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onMenuClose();
                    onTrackOrder?.();
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Truck size={16} />
                  My Orders
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onMenuClose();
                    onLogoutClick?.();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    <div className="border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <nav className="flex gap-8 py-3 text-sm font-medium text-gray-700 items-center">
          <button type="button" onClick={onHomeClick} className="hover:text-theme-primary transition">
            Home
          </button>
          {websiteConfig?.showMobileHeaderCategory && (
            <div
              ref={categoryMenuRef}
              className="relative"
              onMouseEnter={() => onCategoryMenuOpen(true)}
              onMouseLeave={() => onCategoryMenuOpen(false)}
            >
              <button type="button" onClick={onCategoriesClick} className="hover:text-theme-primary transition">
                Categories
              </button>
              {isCategoryMenuOpen && categoriesList?.length ? (
                <div className="absolute left-0 top-full mt-2 w-48 rounded-xl border bg-white py-2 shadow-lg">
                  {categoriesList.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        onCategorySelect?.(category);
                        onCategoryMenuOpen(false);
                      }}
                      className="block w-full px-4 py-1.5 text-left text-sm hover:bg-gray-50 hover:text-theme-primary"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          )}
          <button type="button" onClick={onProductsClick} className="hover:text-theme-primary transition">
            Products
          </button>
          <button type="button" onClick={onTrackOrder} className="hover:text-theme-primary transition">
            Track Order
          </button>
        </nav>
      </div>
    </div>
  </div>
);