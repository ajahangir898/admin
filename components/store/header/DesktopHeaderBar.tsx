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

const IconButton: React.FC<{ icon: React.ReactNode; label: string; badge?: number; onClick: () => void }> = ({ icon, label, badge, onClick }) => (
  <button type="button" className="flex items-center gap-2 hover:text-theme-primary transition" onClick={onClick}>
    <div className="relative">
      {icon}
      {badge ? <span className="absolute -top-2 -right-2 bg-theme-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{badge}</span> : null}
    </div>
    <span className="text-sm font-medium">{label}</span>
  </button>
);

const NavLink: React.FC<{ onClick?: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
  <button type="button" onClick={onClick} className="hover:text-theme-primary transition">{children}</button>
);

export const DesktopHeaderBar: React.FC<DesktopHeaderBarProps> = (props) => {
  const { resolvedHeaderLogo, logoKey, onHomeClick, searchProps, wishlistBadgeCount, cartBadgeCount, onWishlistOpen, onCartOpen, user, onLoginClick, onProfileClick, onTrackOrder, onLogoutClick, isMenuOpen, onMenuToggle, onMenuClose, menuRef, categoriesList, onCategoriesClick, onCategorySelect, categoryMenuRef, isCategoryMenuOpen, onCategoryMenuOpen, onProductsClick, websiteConfig } = props;

  const menuItems = [
    { icon: <UserCircle size={16} />, label: 'My Profile', onClick: onProfileClick },
    { icon: <Truck size={16} />, label: 'My Orders', onClick: onTrackOrder },
    { icon: <LogOut size={16} />, label: 'Logout', onClick: onLogoutClick, className: 'text-red-600 hover:bg-red-50' }
  ];

  return (
    <div className="hidden md:block">
      <div className="max-w-7xl mx-auto px-4 py-1">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <button type="button" className="flex items-center" onClick={onHomeClick}>
            {resolvedHeaderLogo ? (
              <img key={logoKey} src={normalizeImageUrl(resolvedHeaderLogo)} alt="Store logo" className="h-8 md:h-10 object-contain" />
            ) : (
              <h2 className="text-2xl font-black tracking-widest">
                <span style={{ color: 'var(--admin-text, white)' }}>GADGET</span>
                <span style={{ color: 'var(--admin-accent-secondary, #0097f6ff)' }}>SHOB</span>
              </h2>
            )}
          </button>

          <DesktopSearchBar {...searchProps} />

          {/* Actions */}
          <div className="flex items-center gap-6 text-gray-600">
            <IconButton icon={<Heart size={24} />} label="Wishlist" badge={wishlistBadgeCount} onClick={onWishlistOpen} />
            <IconButton icon={<ShoppingCart size={24} />} label="Cart" badge={cartBadgeCount} onClick={onCartOpen} />

            {/* User Menu */}
            <div className="relative" ref={menuRef}>
              <button type="button" className="flex items-center gap-2 hover:text-theme-primary transition" onClick={user ? onMenuToggle : onLoginClick}>
                <div className="bg-gray-100 p-1 rounded-full"><User size={20} /></div>
                <span className="text-sm font-medium">
                  {user ? <>{user.name.split(' ')[0]} <ChevronDown size={12} className="inline" /></> : 'Login'}
                </span>
              </button>

              {user && isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border py-1 z-50">
                  <div className="px-4 py-3 border-b">
                    <p className="text-sm font-bold truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  {menuItems.map(({ icon, label, onClick, className }) => (
                    <button key={label} type="button" onClick={() => { onMenuClose(); onClick?.(); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${className || ''}`}>
                      {icon} {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-8 py-3 text-sm font-medium text-gray-700 items-center">
            <NavLink onClick={onHomeClick}>Home</NavLink>

            {websiteConfig?.showMobileHeaderCategory && (
              <div ref={categoryMenuRef} className="relative" onMouseEnter={() => onCategoryMenuOpen(true)} onMouseLeave={() => onCategoryMenuOpen(false)}>
                <NavLink onClick={onCategoriesClick}>Categories</NavLink>
                {isCategoryMenuOpen && categoriesList?.length ? (
                  <div className="absolute left-0 top-full mt-2 w-48 rounded-xl border bg-white py-2 shadow-lg z-50">
                    {categoriesList.map((cat) => (
                      <button key={cat} type="button" onClick={() => { onCategorySelect?.(cat); onCategoryMenuOpen(false); }} className="block w-full px-4 py-1.5 text-left text-sm hover:bg-gray-50 hover:text-theme-primary">
                        {cat}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            )}

            <NavLink onClick={onProductsClick}>Products</NavLink>
            <NavLink onClick={onTrackOrder}>Track Order</NavLink>
          </nav>
        </div>
      </div>
    </div>
  );
};
