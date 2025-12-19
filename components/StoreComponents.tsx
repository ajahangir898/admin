import React, { useState, useRef, useEffect, useMemo, useCallback, CSSProperties, lazy, Suspense } from 'react';
import { ShoppingCart, User, Facebook, Instagram, Twitter, Linkedin, Truck, X, CheckCircle, Sparkles, Wand2, Image as ImageIcon, Loader2, ArrowRight, Heart, LogOut, ChevronDown, Phone, Mail, MapPin, Youtube, ShoppingBag, Globe, Star, Eye, Bell, Gift, ChevronLeft, ChevronRight, MessageCircle, Home, MessageSquare, List, Menu, Mic, Camera, Minus, Plus, Send, Edit2, Trash2, Check, Video, Info, Smile, Clock } from 'lucide-react';
import { Product, User as UserType, WebsiteConfig, CarouselItem, ProductVariantSelection, ChatMessage, ThemeConfig, Order } from '../types';
import { formatCurrency } from '../utils/format';
import { toast } from 'react-hot-toast';
import { PRODUCTS } from '../constants';
import { LazyImage } from '../utils/performanceOptimization';
import { normalizeImageUrl } from '../utils/imageUrlHelper';

// Re-export StoreHeader from its own file for better code splitting
export { StoreHeader } from './StoreHeader';
export type { StoreHeaderProps } from './StoreHeader';

// Lazy-loaded heavy modals for better code splitting
export { LoginModal } from './store/LoginModal';
export type { LoginModalProps } from './store/LoginModal';

const buildWhatsAppLink = (rawNumber?: string | null) => {
    if (!rawNumber) return null;
    const sanitized = rawNumber.trim().replace(/[^0-9]/g, '');
    return sanitized ? `https://wa.me/${sanitized}` : null;
};

const hexToRgb = (hex: string) => {
    if (!hex) return '0, 0, 0';
    let sanitized = hex.replace('#', '');
    if (sanitized.length === 3) {
        sanitized = sanitized.split('').map((char) => char + char).join('');
    }
    if (sanitized.length !== 6) return '0, 0, 0';
    const numeric = parseInt(sanitized, 16);
    const r = (numeric >> 16) & 255;
    const g = (numeric >> 8) & 255;
    const b = numeric & 255;
    return `${r}, ${g}, ${b}`;
};

export const MobileBottomNav: React.FC<{
    onHomeClick: () => void;
    onCartClick: () => void;
    onAccountClick: () => void;
    onChatClick?: () => void;
    cartCount?: number;
    websiteConfig?: WebsiteConfig;
    activeTab?: string;
    user?: UserType | null;
    onLogoutClick?: () => void;
}> = ({ onHomeClick, onCartClick, onAccountClick, onChatClick, cartCount, websiteConfig, activeTab = 'home', user, onLogoutClick }) => {
  
    const style = websiteConfig?.bottomNavStyle || 'style1';
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
    const accountSectionRef = useRef<HTMLDivElement>(null);
    const customerLabel = user?.name || user?.displayName || user?.email || 'Guest shopper';
    const customerInitial = (customerLabel?.charAt(0) || 'G').toUpperCase();
    useEffect(() => {
        if (!isAccountMenuOpen) return;
        const handleOutsideClick = (event: MouseEvent) => {
            if (!accountSectionRef.current?.contains(event.target as Node)) {
                setIsAccountMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [isAccountMenuOpen]);
    useEffect(() => {
        if (style !== 'style1') {
            setIsAccountMenuOpen(false);
        }
    }, [style]);
    const handleAccountPrimaryAction = () => {
        setIsAccountMenuOpen(false);
        onAccountClick?.();
    };
    const handleAccountLogout = () => {
        if (!onLogoutClick) {
            setIsAccountMenuOpen(false);
            return;
        }
        setIsAccountMenuOpen(false);
        onLogoutClick();
    };
                const facebookLinkRaw = websiteConfig?.socialLinks?.find((link) => {
                        const platformKey = (link.platform || '').toLowerCase();
                        return platformKey.includes('facebook') || platformKey === 'fb';
                })?.url?.trim();
                const facebookLink = facebookLinkRaw
                        ? (/^https?:\/\//i.test(facebookLinkRaw) ? facebookLinkRaw : `https://${facebookLinkRaw.replace(/^\/+/, '')}`)
                        : null;
                const whatsappLink = buildWhatsAppLink(websiteConfig?.whatsappNumber);
                const chatEnabled = websiteConfig?.chatEnabled ?? true;
                const chatFallbackLink = !chatEnabled && websiteConfig?.chatWhatsAppFallback ? whatsappLink : null;

  // Style 2: Floating Center Home Button (Light Pink Circle with Dark Pink Icon)
  if (style === 'style2') {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 h-[70px] flex items-end px-2 md:hidden z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-1">
        
        {/* Left Side */}
        <div className="flex-1 flex justify-around items-center h-full pb-2 pr-10">
                     {chatEnabled && onChatClick ? (
                         <button onClick={onChatClick} className="flex flex-col items-center gap-1 text-gray-500 hover:text-theme-primary transition group">
                                <MessageSquare size={20} strokeWidth={1.5} />
                                <span className="text-[10px] font-medium">Chat</span>
                         </button>
                     ) : chatFallbackLink ? (
                         <a href={chatFallbackLink} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 text-gray-500 hover:text-theme-primary transition group">
                                <MessageSquare size={20} strokeWidth={1.5} />
                                <span className="text-[10px] font-medium">Chat</span>
                         </a>
                     ) : (
                         <button className="flex flex-col items-center gap-1 text-gray-400 transition group" type="button" disabled>
                                <MessageSquare size={20} strokeWidth={1.5} className="text-gray-400" />
                                <span className="text-[10px] font-medium">Chat</span>
                         </button>
                     )}
           <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-theme-primary transition group">
              <List size={22} strokeWidth={1.5} />
              <span className="text-[10px] font-medium">Categories</span>
           </button>
        </div>

        {/* Floating Home Button */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
           <button 
             onClick={onHomeClick}
             className="w-16 h-16 rounded-full bg-theme-primary/20 text-theme-primary flex flex-col items-center justify-center border-[4px] border-white shadow-lg transform active:scale-95 transition-transform"
           >
              <Home size={24} strokeWidth={2.5} className="mb-0.5" />
              <span className="text-[10px] font-bold">Home</span>
           </button>
        </div>

        {/* Right Side */}
        <div className="flex-1 flex justify-around items-center h-full pb-2 pl-10">
           <button onClick={onAccountClick} className={`flex flex-col items-center gap-1 transition group ${activeTab === 'account' ? 'text-theme-primary' : 'text-gray-500 hover:text-theme-primary'}`}>
              <User size={22} strokeWidth={1.5} />
              <span className="text-[10px] font-medium">Account</span>
           </button>
           <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-theme-primary transition group">
              <Menu size={22} strokeWidth={1.5} />
              <span className="text-[10px] font-medium">Menu</span>
           </button>
        </div>
      </div>
    );
  }

  // Style 3: Clean 4 Columns
  if (style === 'style3') {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2.5 px-6 grid grid-cols-4 items-center md:hidden z-50 shadow-lg pb-safe">
        <button onClick={onHomeClick} className={`flex flex-col items-center gap-1 transition ${activeTab === 'home' ? 'text-theme-primary' : 'text-gray-500'}`}>
          <Home size={22} strokeWidth={2} className={activeTab === 'home' ? 'fill-theme-primary/20' : ''} />
          <span className="text-[10px] font-medium">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-theme-primary transition">
          <List size={22} strokeWidth={1.5} />
          <span className="text-[10px] font-medium">Categories</span>
        </button>
                {chatEnabled && onChatClick ? (
                    <button onClick={onChatClick} className="flex flex-col items-center gap-1 text-gray-500 hover:text-theme-primary transition">
                        <MessageSquare size={22} strokeWidth={1.5} />
                        <span className="text-[10px] font-medium">Chat</span>
                    </button>
                ) : chatFallbackLink ? (
                    <a href={chatFallbackLink} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 text-gray-500 hover:text-theme-primary transition">
                        <MessageSquare size={22} strokeWidth={1.5} />
                        <span className="text-[10px] font-medium">Chat</span>
                    </a>
                ) : (
                    <button className="flex flex-col items-center gap-1 text-gray-400 transition" type="button" disabled>
                        <MessageSquare size={22} strokeWidth={1.5} className="text-gray-400" />
                        <span className="text-[10px] font-medium">Chat</span>
                    </button>
                )}
        <button onClick={onAccountClick} className={`flex flex-col items-center gap-1 transition ${activeTab === 'account' ? 'text-theme-primary' : 'text-gray-500'}`}>
          <User size={22} strokeWidth={1.5} />
          <span className="text-[10px] font-medium">Account</span>
        </button>
      </div>
    );
  }

  // Style 1 (Default): 5 Columns (Messenger, Call, Home, Page, Account)
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-br from-blue-300/30 via-cyan-200/25 to-blue-200/30 backdrop-blur-xl border-t border-cyan-300/40 py-2 px-2 flex justify-between items-center md:hidden z-50 shadow-[0_-8px_32px_rgba(0,150,200,0.15),inset_0_1px_0_rgba(255,255,255,0.5)] pb-safe h-[60px]">
            {chatEnabled && onChatClick ? (
                <button onClick={onChatClick} className="flex flex-col items-center gap-1.5 transition w-1/5 group">
                    <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.3)] hover:shadow-[0_12px_48px_rgba(0,120,150,0.2),inset_0_1px_0_rgba(255,255,255,0.4)] transition group-hover:from-white/50 group-hover:to-white/25">
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 group-hover:text-cyan-600"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/></svg>
                    </div>
                    <span className="text-[9px] font-semibold text-gray-700 group-hover:text-cyan-600">Chat</span>
                </button>
            ) : chatFallbackLink ? (
                <a href={chatFallbackLink} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1.5 transition w-1/5 group">
                    <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.3)] hover:shadow-[0_12px_48px_rgba(0,120,150,0.2),inset_0_1px_0_rgba(255,255,255,0.4)] transition group-hover:from-white/50 group-hover:to-white/25">
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 group-hover:text-cyan-600"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/></svg>
                    </div>
                    <span className="text-[9px] font-semibold text-gray-700 group-hover:text-cyan-600">Chat</span>
                </a>
            ) : (
                <button className="flex flex-col items-center gap-1.5 transition w-1/5 group" type="button" disabled title="Live chat unavailable">
                    <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.05)]">
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/></svg>
                    </div>
                    <span className="text-[9px] font-semibold text-gray-500">Chat</span>
                </button>
            )}
      
            {whatsappLink ? (
                <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center gap-1.5 transition w-1/5 group"
                    aria-label="Chat on WhatsApp"
                >
                    <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.3)] hover:shadow-[0_12px_48px_rgba(0,120,150,0.2),inset_0_1px_0_rgba(255,255,255,0.4)] transition group-hover:from-white/50 group-hover:to-white/25">
                        <Phone size={20} strokeWidth={2} className="text-gray-600 group-hover:text-cyan-600" />
                    </div>
                    <span className="text-[9px] font-semibold text-gray-700 group-hover:text-cyan-600">Call</span>
                </a>
            ) : (
                <button className="flex flex-col items-center gap-1.5 transition w-1/5 group" title="WhatsApp number not configured" type="button" disabled>
                    <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.05)]">
                        <Phone size={20} strokeWidth={2} className="text-gray-400" />
                    </div>
                    <span className="text-[9px] font-semibold text-gray-500">Call</span>
                </button>
            )}
      
      <button onClick={onHomeClick} className="flex flex-col items-center gap-1.5 transition w-1/5 group">
        <div className="relative w-20 h-7  flex items-center justify-center">
          {/* Outer Silver/Gray Ring Border */}
          {/* <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-300 to-gray-400 shadow-[0_6px_20px_rgba(0,0,0,0.15)] group-hover:shadow-[0_8px_28px_rgba(0,0,0,0.25)] transition-shadow"></div>
           */}
          {/* Inner Dark Blue Background */}
          {/* <div className="absolute inset-1.5 rounded-xl bg-gradient-to-br from-blue-900 to-blue-800 shadow-[inset_0_2px_8px_rgba(0,0,0,0.3),inset_0_-2px_6px_rgba(255,255,255,0.1)]"></div>
           */}
          {/* Highlight/Shine Effect */}
          {/* <div className="absolute inset-1.5 rounded-xl bg-gradient-to-br from-blue-600/20 via-transparent to-transparent pointer-events-none"></div>
           */}
          {/* Home Icon from URL */}
          <div className="relative z-10 flex items-center justify-center">
            <img 
              src="https://images.vexels.com/media/users/3/139729/isolated/svg/082dce112041515d39a27e2c124c3070.svg" 
              alt="Home" 
              className="w-12 h-12 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
            />
          </div>
        </div>
        <span className="text-[9px] font-bold text-blue-900 group-hover:text-blue-700">Home</span>
      </button>
      
            {facebookLink ? (
                <a
                    href={facebookLink}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook Page"
                    className="flex flex-col items-center gap-1.5 transition w-1/5 group"
                >
                    <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.3)] hover:shadow-[0_12px_48px_rgba(0,120,150,0.2),inset_0_1px_0_rgba(255,255,255,0.4)] transition group-hover:from-white/50 group-hover:to-white/25">
                        <Facebook size={20} strokeWidth={2} className="text-gray-600 group-hover:text-cyan-600" />
                    </div>
                    <span className="text-[9px] font-semibold text-gray-700 group-hover:text-cyan-600">Page</span>
                </a>
            ) : (
                <button className="flex flex-col items-center gap-1.5 transition w-1/5 group">
                    <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.3)] hover:shadow-[0_12px_48px_rgba(0,120,150,0.2),inset_0_1px_0_rgba(255,255,255,0.4)] transition group-hover:from-white/50 group-hover:to-white/25">
                        <Facebook size={20} strokeWidth={2} className="text-gray-600 group-hover:text-cyan-600" />
                    </div>
                    <span className="text-[9px] font-semibold text-gray-700 group-hover:text-cyan-600">Page</span>
                </button>
            )}
      
            <div ref={accountSectionRef} className="relative flex justify-center w-1/5">
                <button onClick={() => setIsAccountMenuOpen((prev) => !prev)} className={`flex flex-col items-center gap-1.5 transition w-full group`}>
                    <div className={`relative w-10 h-10 rounded-2xl backdrop-blur-md border flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.3)] transition ${ isAccountMenuOpen ? 'bg-gradient-to-br from-white/50 to-white/30 border-white/40 shadow-[0_12px_48px_rgba(0,120,150,0.25),inset_0_1px_0_rgba(255,255,255,0.4)]' : 'bg-gradient-to-br from-white/40 to-white/20 border-white/30 hover:shadow-[0_12px_48px_rgba(0,120,150,0.2),inset_0_1px_0_rgba(255,255,255,0.4)]'}`}>
                        <User size={20} strokeWidth={2} className={`${isAccountMenuOpen ? 'text-cyan-600' : 'text-gray-600 group-hover:text-cyan-600'}`} />
                    </div>
                    <span className="text-[9px] font-semibold text-gray-700 group-hover:text-cyan-600">Account</span>
                </button>
                {isAccountMenuOpen && (
                    <div className="absolute bottom-[70px] left-1/2 -translate-x-1/2 w-[230px] rounded-3xl border border-gray-100 bg-white shadow-[0_15px_45px_rgba(15,23,42,0.15)] p-4 z-[60]">
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-gray-100 rotate-45"></div>
                        {user ? (
                            <>
                                <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                                    <div className="w-10 h-10 rounded-full bg-theme-gradient text-white flex items-center justify-center text-sm font-semibold">
                                        {customerInitial}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{customerLabel}</p>
                                        {user.email && <p className="text-xs text-gray-500 truncate">{user.email}</p>}
                                    </div>
                                </div>
    <button onClick={handleAccountPrimaryAction} className="mt-3 w-full flex items-center justify-between rounded-2xl bg-gray-50 hover:bg-theme-primary/10 text-gray-800 hover:text-theme-primary text-sm font-medium py-2.5 px-3 transition">
        <span>My Account</span>
        <ChevronRight size={16} />
    </button>
                                <button onClick={handleAccountLogout} disabled={!onLogoutClick} className={`mt-2 w-full flex items-center justify-between rounded-2xl text-sm font-semibold py-2.5 px-3 transition ${onLogoutClick ? 'text-rose-600 hover:bg-rose-50' : 'text-gray-400 cursor-not-allowed'}`}>
                                    <span>Logout</span>
                                    <LogOut size={16} />
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="pb-3 border-b border-gray-100">
                                    <p className="text-sm text-gray-600">Sign in to track orders and manage your wishlist.</p>
                                </div>
                                <button onClick={handleAccountPrimaryAction} className="flex-1 btn-order py-1.5 px-2 text-sm">
                                    Sign in / Sign up
                                </button>
                                {chatFallbackLink && (
                                    <a href={chatFallbackLink} target="_blank" rel="noreferrer" className="mt-2 block text-center text-xs text-gray-500 hover:text-theme-primary transition">
                                        Need help? Chat on WhatsApp
                                    </a>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
    </div>
  );
};

export const ProductCard: React.FC<{ product: Product; onClick: (product: Product) => void; variant?: string; onQuickView?: (product: Product) => void; onBuyNow?: (product: Product) => void; onAddToCart?: (product: Product) => void }> = ({ product, onClick, variant, onQuickView, onBuyNow, onAddToCart }) => {
    const handleBuyNow = (event?: React.MouseEvent) => {
        event?.stopPropagation();
        if (onBuyNow) {
            onBuyNow(product);
        } else {
            onClick(product);
        }
    };

  // Style 1 (Clean Card Design)
  if (variant === 'style1') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group relative overflow-hidden flex flex-col">
        {/* Discount Badge */}
        <div className="absolute top-3 left-3 z-10">
          {product.discount && (
            <span className="inline-block bg-theme-secondary text-white text-xs font-bold px-2 py-1 rounded-md">
              {product.discount}
            </span>
          )}
        </div>

        {/* Product Image */}
        <div className="relative aspect-square p-4 bg-gray-50 cursor-pointer overflow-hidden" onClick={() => onClick(product)}>
          <LazyImage 
            src={normalizeImageUrl(product.galleryImages?.[0] || product.image)} 
            alt={product.name} 
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" 
          />
        </div>

        {/* Product Details */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Product Name */}
          <h3 
            className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 cursor-pointer hover:text-theme-primary transition"
            onClick={() => onClick(product)}
          >
            {product.name}
          </h3>

          {/* Price Section */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-gray-900">à§³{product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">à§³{product.originalPrice}</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-auto">
            <button 
              className="flex-1 bg-gray-200 text-gray-700 text-xs font-semibold py-2 rounded-md hover:bg-gray-300 transition flex items-center justify-center gap-1 text-[16px]"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart?.(product);
              }}
            >
              <ShoppingCart size={17} /> Cart
            </button>
            <button 
              className="flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition transform active:scale-95 btn-order"
              onClick={handleBuyNow}
            >  Buy Now 

            </button>
        

         </div>
        </div>
      </div>
    );
  }

  // Style 2 (Flash Sale - Pink/Blue)
  if (variant === 'style2') {
    return (
        <div className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition group relative overflow-hidden flex flex-col">
            <div className="relative aspect-square p-2 bg-gray-50 cursor-pointer" onClick={() => onClick(product)}>
                <LazyImage src={normalizeImageUrl(product.galleryImages?.[0] || product.image)} alt={product.name} className="w-full h-full object-contain mix-blend-multiply transition duration-500 group-hover:scale-105" />
                {product.discount && (
                    <span className="absolute top-1.5 left-1.5 bg-theme-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {product.discount}
                    </span>
                )}
                <button className="absolute top-1.5 right-1.5 btn-wishlist text-current" onClick={(e) => e.stopPropagation()}>
                    <Heart size={16} />
                </button>
            </div>
            
            <div className="px-2 py-1.5 flex-1 flex flex-col">
                {/* Rating */}
                <div className="flex items-center gap-0.5 text-yellow-400 text-xs">
                    <Star size={10} fill="currentColor" />
                    <span className="text-gray-400 text-[10px]">({product.reviews || 0})</span>
                    <span className="text-gray-400 text-[10px] ml-0.5">| 0 Sold</span>
                </div>

                <h3 
                  className="font-bold text-gray-800 text-xs leading-tight line-clamp-1 cursor-pointer hover:text-theme-primary transition"
                  onClick={() => onClick(product)}
                >
                    {product.name}
                </h3>

                <div className="mt-auto">
                    <div className="flex items-center gap-1 mb-1">
                        <span className="text-theme-primary font-bold text-sm"><b>৳</b>{product.price}</span>
                        {product.originalPrice && (
                            <span className="text-gray-400 text-[10px] line-through">{product.originalPrice}</span>
                        )}
                        <span className="ml-auto text-[9px] text-blue-500 font-medium">Get 50 Coins</span>
                    </div>
                    
                    <div className="flex gap-1.5">
                    <button 
                        className="flex-1 btn-order py-1 text-xs"
                        onClick={handleBuyNow}
                    >
                            Buy Now
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddToCart?.(product);
                            }}
                            className="cart_btn px-2"
                            aria-label="Add to cart"
                        >
                            <ShoppingCart size={16} className="text-rose-500" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  // Style 3 (Minimal Clean Design)
  if (variant === 'style3') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 group relative overflow-hidden flex flex-col">
        {/* Product Image */}
        <div className="relative aspect-square p-4 bg-gray-50 cursor-pointer overflow-hidden" onClick={() => onClick(product)}> 
          <LazyImage 
            src={normalizeImageUrl(product.galleryImages?.[0] || product.image)} 
            alt={product.name} 
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" 
          />
        </div>

        {/* Product Details */}
        <div className="px-4 pt-2 pb-4 flex-1 flex flex-col">
          {/* Product Name */}
          <h3 
            className="font-semibold text-gray-800 text-xs mb-2 line-clamp-1 cursor-pointer transition"
            style={{ '--hover-color': 'rgba(var(--color-primary-rgb), 1)' } as React.CSSProperties}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(var(--color-primary-rgb), 1)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '')}
            onClick={() => onClick(product)}
          >
            {product.name}
          </h3>

          {/* Price Section */}
          <div className="flex items-center gap-2 mb-4">
            <span 
              className="text-base font-bold"
              style={{ color: 'rgba(var(--color-primary-rgb), 1)' }}
            >
              à§³{product.price}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through">à§³{product.originalPrice}</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 mt-auto">
            <button 
              className="w-full text-white text-xs font-bold py-2 rounded-md transition btn-order"
              onClick={handleBuyNow}
            >
              Buy Now
            </button>
            <button 
              className="w-full text-xs font-bold py-1.5 rounded-md transition border-2"
              style={{ 
                borderColor: 'rgba(var(--color-primary-rgb), 1)', 
                color: 'rgba(var(--color-primary-rgb), 1)',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(var(--color-primary-rgb), 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart?.(product);
              }}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

    const formattedPrice = formatCurrency(product.price);
    const formattedOriginalPrice = formatCurrency(product.originalPrice, null);
    const tagLabel = product.tag || 'Trending';
    const accentMeta = product.brand || product.category || 'Curated pick';

    // Default Style (Card 0)
    return (
        <div className="group relative flex flex-col rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden">
            <span className="pointer-events-none absolute inset-x-4 top-0 h-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-500 opacity-60 group-hover:opacity-100" />

            <div className="relative px-4 pt-4">
                <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 uppercase tracking-wide dark:bg-emerald-500/10 dark:text-emerald-200">
                        <Sparkles size={12} /> {tagLabel}
                    </span>
                    {typeof product.rating === 'number' ? (
                        <span className="inline-flex items-center gap-1 text-amber-500">
                            <Star size={12} fill="currentColor" className="drop-shadow" />
                            {product.rating.toFixed(1)}
                            {typeof product.reviews === 'number' && (
                                <span className="text-[10px] text-gray-400 dark:text-gray-300 font-normal">({product.reviews})</span>
                            )}
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-sky-600 bg-sky-50 dark:bg-sky-500/10 dark:text-sky-200">
                            <Truck size={12} /> Fast ship
                        </span>
                    )}
                </div>

                <div className="relative mt-4">
                    <div className="absolute inset-x-6 top-2 h-28 bg-gradient-to-br from-emerald-200/40 via-transparent to-transparent blur-3xl opacity-60 group-hover:opacity-90 transition" aria-hidden />
                    <div className="relative h-40 rounded-2xl bg-gray-50 dark:bg-slate-700 flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => onClick(product)}>
                        <LazyImage src={normalizeImageUrl(product.galleryImages?.[0] || product.image)} alt={product.name} className="h-full w-full object-contain mix-blend-multiply dark:mix-blend-normal transition duration-500 group-hover:scale-110" />
                    </div>
                    {product.discount && (
                        <span className="absolute top-4 left-6 bg-purple-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                            {product.discount}
                        </span>
                    )}
                    <button className="absolute top-4 right-6 btn-wishlist bg-white/80 dark:bg-slate-800/70 shadow-md backdrop-blur-sm hover:scale-110 transition" aria-label="Save to wishlist">
                        <Heart size={16} />
                    </button>
                </div>
            </div>

            <div className="p-4 flex-1 flex flex-col gap-3">
                <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500 mb-1">{accentMeta}</p>
                    <h3
                        className="font-bold text-gray-900 dark:text-gray-100 text-base leading-tight cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-300 transition line-clamp-2"
                        onClick={() => onClick(product)}
                    >
                        {product.name}
                    </h3>
                    {product.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{product.description}</p>
                    )}
                </div>

                {product.colors && product.colors.length > 0 && (
                    <div className="flex gap-1.5">
                        {product.colors.slice(0, 4).map((c, i) => (
                            <span key={i} className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ backgroundColor: c }}></span>
                        ))}
                        {product.colors.length > 4 && (
                            <span className="text-[10px] text-gray-400">+{product.colors.length - 4}</span>
                        )}
                    </div>
                )}

                <div className="mt-auto flex items-end justify-between gap-3">
                    <div>
                        <p className="text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500">Starting at</p>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-gray-900 dark:text-white">à§³ {formattedPrice}</span>
                            {formattedOriginalPrice && (
                                <span className="text-xs text-gray-400 line-through">à§³ {formattedOriginalPrice}</span>
                            )}
                        </div>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-300 font-semibold">Instant confirmation</p>
                    </div>

                    <div className="flex flex-col gap-2 w-32">
                        <button
                            onClick={handleBuyNow}
                            className="w-full btn-order py-2 rounded-xl font-bold text-sm"
                        >
                            à¦…à¦°à§à¦¡à¦¾à¦° à¦•à¦°à§à¦¨
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddToCart?.(product);
                            }}
                            className="w-full rounded-xl border border-emerald-200 text-xs font-semibold text-emerald-600 py-1.5 flex items-center justify-center gap-1 hover:bg-emerald-50 transition"
                        >
                            <ShoppingCart size={14} /> Add to cart
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onQuickView) onQuickView(product);
                                else onClick(product);
                            }}
                            className="inline-flex items-center justify-center gap-1 rounded-xl border border-gray-200 dark:border-slate-600 text-xs font-semibold text-gray-600 dark:text-gray-200 py-1.5 hover:border-emerald-400 hover:text-emerald-600 transition"
                        >
                            <Eye size={14} /> Quick view
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


export const HeroSection: React.FC<{ carouselItems?: CarouselItem[]; websiteConfig?: WebsiteConfig }> = ({ carouselItems }) => {
  const items = carouselItems?.filter(i => i.status === 'Publish').sort((a,b) => a.serial - b.serial) || [];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 mt-4">
      {/* Full Width Carousel */}
      <div className="relative w-full aspect-[4/1] rounded-xl overflow-hidden shadow-lg group bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
        {items.map((item, index) => (
          <a
            href={item.url || '#'}
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <img src={normalizeImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
          </a>
        ))}

        {items.length > 1 && (
          <>
            {/* Navigation Arrows */}
            <button
              onClick={(e) => { e.preventDefault(); setCurrentIndex((prev) => (prev - 1 + items.length) % items.length); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 w-9 h-9 rounded-full shadow-lg z-20 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center hover:scale-110"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); setCurrentIndex((prev) => (prev + 1) % items.length); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 w-9 h-9 rounded-full shadow-lg z-20 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center hover:scale-110"
            >
              <ChevronRight size={20} />
            </button>

            {/* Dots Navigation */}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
              {items.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.preventDefault(); setCurrentIndex(idx); }}
                  className={`h-2 rounded-full transition-all duration-300 shadow-sm ${idx === currentIndex ? 'bg-white w-6' : 'bg-white/50 w-2 hover:bg-white/80'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export const CategoryCircle: React.FC<{ name: string; icon: React.ReactNode }> = ({ name, icon }) => (
    <div className="flex flex-col items-center gap-2 cursor-pointer group min-w-[80px]">

        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-green-500 group-hover:text-white group-hover:border-green-500 transition duration-300 shadow-sm hover:shadow-lg transform group-hover:-translate-y-1">
            {icon}
        </div>
        <span className="text-xs md:text-sm font-medium text-gray-700 group-hover:text-green-600 text-center transition-colors">{name}</span>
    </div>
);

export const CategoryPill: React.FC<{ name: string; icon: React.ReactNode }> = ({ name, icon }) => (

    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full shadow-sm hover:border-theme-primary hover:shadow-md cursor-pointer transition whitespace-nowrap group">
        <div className="w-7 h-7 rounded-full bg-theme-primary/10 text-theme-primary flex items-center justify-center group-hover:rotate-6 transition-transform duration-300">
            {icon}
        </div>
        <span className="text-sm font-bold text-[rgb(var(--color-font-rgb))] group-hover:text-theme-primary tracking-wide">{name}</span>
    </div>
);

export const SectionHeader: React.FC<{ title: string; className?: string }> = ({ title, className }) => (
    <div className="inline-flex flex-col gap-1">
        <div className="flex items-center gap-3">
            
            <h2 className={`text-2xl font-black tracking-tight text-gray-900 dark:text-white drop-shadow-sm ${className ?? ''}`}>
                {title}
            </h2>
        </div>
        <span className="h-1 w-24 bg-gradient-theme-primary rounded-full" />
    </div>
);


export const StoreFooter: React.FC<{ websiteConfig?: WebsiteConfig; logo?: string | null; onOpenChat?: () => void }> = ({ websiteConfig, logo, onOpenChat }) => {
    const resolveSocialIcon = (platform?: string): React.ReactNode => {
        const key = platform?.toLowerCase() || '';
        if (key.includes('facebook') || key === 'fb') return <Facebook size={18} className="text-current" />;
        if (key.includes('instagram') || key === 'ig') return <Instagram size={18} className="text-current" />;
        if (key.includes('twitter') || key === 'x') return <Twitter size={18} className="text-current" />;
        if (key.includes('youtube') || key.includes('yt')) return <Youtube size={18} className="text-current" />;
        if (key.includes('linkedin')) return <Linkedin size={18} className="text-current" />;
        if (key.includes('whatsapp') || key.includes('messenger')) return <MessageCircle size={18} className="text-current" />;
        return <Globe size={18} className="text-current" />;
    };
    const whatsappLink = buildWhatsAppLink(websiteConfig?.whatsappNumber);
    const chatEnabled = websiteConfig?.chatEnabled ?? true;
    const chatFallbackLink = !chatEnabled && websiteConfig?.chatWhatsAppFallback ? whatsappLink : null;

    const floatingChatButton = (() => {
        const baseClasses = 'hidden md:flex fixed bottom-8 right-8 w-16 h-16 items-center justify-center rounded-[26px] text-white shadow-[0_18px_35px_rgba(255,122,85,0.35)] border border-white/30 transition-transform duration-200 hover:-translate-y-1 z-40';
        const bubbleContent = (
            <span className="relative flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-white opacity-90" />
                <span className="w-2 h-2 rounded-full bg-white opacity-80" />
                <span className="w-2 h-2 rounded-full bg-white opacity-70" />
            </span>
        );
        if (chatEnabled && onOpenChat) {
            return (
                <button
                    type="button"
                    onClick={onOpenChat}
                    aria-label="Open live chat"
                    className={`${baseClasses} flex-1 btn-order py-1 text-sm`}
                >
                    {bubbleContent}
                </button>
            );
        }
        if (chatFallbackLink) {
            return (
                <a
                    href={chatFallbackLink}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Chat on WhatsApp"
                    className={`${baseClasses} bg-gradient-to-br from-[#34d399] to-[#059669]`}
                >
                    {bubbleContent}
                </a>
            );
        }
        return null;
    })();

    // Style 2 (Coco Kids Footer)
    if (websiteConfig?.footerStyle === 'style2') {
        return (
            <>
            <footer className="store-footer surface-panel bg-white border-t border-gray-100 pt-4 md:pt-6 pb-2 relative mt-auto">
                <div className="px-1 md:px-8 lg:px-16 md:max-w-7xl md:mx-auto">
                    {/* Centered Contact Bar */}
                    <div className="flex flex-col md:flex-row justify-center items-center gap-3 md:gap-10 mb-2 md:mb-4 border-b border-gray-100 pb-2 md:pb-4">
                        <div className="flex items-center gap-1.5 md:gap-2">
                            <Mail size={16} className="text-theme-primary md:w-5 md:h-5" />
                            <span className="text-gray-600 text-sm md:text-base font-medium">{websiteConfig.emails?.[0] || 'info@systemnextit.com.bd'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 md:gap-2">
                            <Phone size={16} className="text-theme-primary md:w-5 md:h-5" />
                            <span className="text-gray-600 text-sm md:text-base font-medium">{websiteConfig.phones?.[0] || '09638-866300'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 md:gap-2 max-w-xs text-center md:text-left">
                            <MapPin size={16} className="text-theme-primary shrink-0 md:w-5 md:h-5" />
                            <span className="text-gray-600 text-sm md:text-base font-medium">{websiteConfig.addresses?.[0] || 'Dhaka-1230'}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8 text-center md:text-left">
                        {/* Logo & Social */}
                        <div className="flex flex-col items-center md:items-start">
                            <div className="mb-2 md:mb-3 flex flex-col items-center md:items-start">
                                {websiteConfig?.favicon ? (
                                    <img src={websiteConfig.favicon} alt={`${websiteConfig?.websiteName || 'Store'} logo`} className="h-[106px] md:h-[141px] object-contain" />
                                ) : logo ? (
                                    <img src={logo} alt={`${websiteConfig?.websiteName || 'Store'} logo`} className="h-[106px] md:h-[141px] object-contain" />
                                ) : (
                                    <>
                                        <span className="text-xl md:text-2xl font-black text-theme-primary tracking-tight">OPBD.SHOP</span>
                                        <span className="text-lg md:text-xl font-bold text-theme-secondary tracking-widest -mt-1 block"></span>
                                    </>
                                )}
                            </div>
                            <p className="text-sm md:text-base text-gray-500 mb-2 md:mb-3">{websiteConfig?.shortDescription || 'Every Smile Matters'}</p>
                            <div className="flex gap-3">
                                <a href="#" className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-theme-primary/10 text-theme-primary flex items-center justify-center hover:bg-theme-primary hover:text-white transition">
                                    <Facebook size={20} className="md:w-5 md:h-5" />
                                </a>
                                <a href="#" className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition">
                                    <MessageCircle size={20} className="md:w-5 md:h-5" />
                                </a>
                            </div>
                        </div>

                        {/* Columns */}
                        <div>
                            <h4 className="font-bold text-theme-primary text-base md:text-lg mb-2 md:mb-3">Contact Us</h4>
                            <ul className="space-y-1 md:space-y-2 text-sm md:text-base text-gray-600">
                                <li>{websiteConfig.emails?.[0]}</li>
                                <li>{websiteConfig.phones?.[0]}</li>
                                <li>{websiteConfig.addresses?.[0]}</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-theme-primary text-base md:text-lg mb-2 md:mb-3">Quick Links</h4>
                            <ul className="space-y-1 md:space-y-2 text-sm md:text-base text-gray-600">
                                <li><a href="#" className="hover:text-theme-primary">Return & Refund Policy</a></li>
                                <li><a href="#" className="hover:text-theme-primary">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-theme-primary">Terms and Conditions</a></li>
                                <li><a href="#" className="hover:text-theme-primary">About us</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-theme-primary text-base md:text-lg mb-2 md:mb-3">Useful Links</h4>
                            <ul className="space-y-1 md:space-y-2 text-sm md:text-base text-gray-600">
                                <li><a href="#" className="hover:text-theme-primary">Why Shop Online with Us</a></li>
                                <li><a href="#" className="hover:text-theme-primary">Online Payment Methods</a></li>
                                <li><a href="#" className="hover:text-theme-primary">After Sales Support</a></li>
                                <li><a href="#" className="hover:text-theme-primary">Faq</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 mt-4 md:mt-6 pt-3 md:pt-4 text-center text-sm md:text-base text-gray-500">
                        &copy; All Copyrights Reserved by  {websiteConfig?.websiteName || 'Your Store'}. {new Date().getFullYear()}
                    </div>
                </div>
            </footer>
            {floatingChatButton}
            </>
        );
    }

    if (websiteConfig?.footerStyle === 'style3') {
        const quickLinksSource = websiteConfig?.footerQuickLinks;
        const quickLinks = quickLinksSource && quickLinksSource.length
            ? quickLinksSource
            : [
                { id: 'quick-1', label: 'About Us', url: '#' },
                { id: 'quick-2', label: 'Order Tracking', url: '#' },
                { id: 'quick-3', label: 'Shipping & Delivery', url: '#' },
                { id: 'quick-4', label: 'Contact', url: '#' }
            ];
        const usefulLinksSource = websiteConfig?.footerUsefulLinks;
        const usefulLinks = usefulLinksSource && usefulLinksSource.length
            ? usefulLinksSource
            : [
                { id: 'useful-1', label: 'Return & Refund Policy', url: '#' },
                { id: 'useful-2', label: 'Privacy Policy', url: '#' },
                { id: 'useful-3', label: 'FAQ', url: '#' },
                { id: 'useful-4', label: 'Why Shop With Us', url: '#' }
            ];
        const socialLinks = websiteConfig?.socialLinks || [];
        const contactCards = [
            websiteConfig?.phones?.[0]
                ? { label: 'Call us', value: websiteConfig.phones[0], icon: <Phone size={16} className="text-[color:var(--color-primary)]" /> }
                : null,
            websiteConfig?.emails?.[0]
                ? { label: 'Mail us', value: websiteConfig.emails[0], icon: <Mail size={16} className="text-[color:var(--color-primary)]" /> }
                : null,
            websiteConfig?.addresses?.[0]
                ? { label: 'Visit us', value: websiteConfig.addresses[0], icon: <MapPin size={16} className="text-[color:var(--color-primary)]" /> }
                : null
        ].filter((card): card is { label: string; value: string; icon: React.ReactNode } => Boolean(card));

        return (
            <>
            <footer className="store-footer surface-panel bg-white/95 border-t border-gray-100 mt-auto">
                <div className="max-w-7xl mx-auto px-4 py-12 space-y-10">
                    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr,0.8fr,0.8fr]">
                        <div className="space-y-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                {websiteConfig?.favicon ? (
                                    <img src={websiteConfig.favicon} alt={`${websiteConfig?.websiteName || 'Store'} logo`} className="h-24 object-contain" />
                                ) : logo ? (
                                    <img src={logo} alt={`${websiteConfig?.websiteName || 'Store'} logo`} className="h-24 object-contain" />
                                ) : (
                                    <div className="text-3xl font-black tracking-tight text-gray-900">
                                        {websiteConfig?.websiteName || 'Your Store'}
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs uppercase tracking-[0.4em] text-gray-400">{websiteConfig?.brandingText || 'Stay Inspired'}</p>
                                    <p className="text-sm text-gray-500 mt-2 max-w-md">{websiteConfig?.shortDescription || 'Discover curated picks and seasonal favorites in one place.'}</p>
                                </div>
                            </div>
                            {contactCards.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {contactCards.map(card => (
                                        <div key={card.label} className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 shadow-sm">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                                                {card.icon}
                                                <span>{card.label}</span>
                                            </div>
                                            <p className="text-sm font-bold text-gray-900 mt-1 break-words">{card.value}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {socialLinks.length > 0 && (
                                <div className="flex flex-wrap items-center gap-3">
                                    {socialLinks.map(link => (
                                        <a
                                            key={link.id}
                                            href={link.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            aria-label={link.platform}
                                            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:text-white hover:bg-[color:var(--color-primary)] transition"
                                        >
                                            {resolveSocialIcon(link.platform)}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-theme-primary mb-4">Quick Links</h4>
                            <ul className="space-y-2">
                                {quickLinks.map(link => (
                                    <li key={link.id}>
                                        <a href={link.url || '#'} className="flex items-center justify-between gap-4 text-sm text-gray-600 hover:text-[color:var(--color-primary)] transition">
                                            <span>{link.label}</span>
                                            <ArrowRight size={16} className="text-gray-400" />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-theme-primary mb-4">Useful Links</h4>
                            <ul className="space-y-2">
                                {usefulLinks.map(link => (
                                    <li key={link.id}>
                                        <a href={link.url || '#'} className="flex items-center justify-between gap-4 text-sm text-gray-600 hover:text-[color:var(--color-secondary)] transition">
                                            <span>{link.label}</span>
                                            <ArrowRight size={16} className="text-gray-300" />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 border-t border-gray-100 pt-6 text-xs text-gray-500 md:flex-row md:items-center md:justify-between">
                        <p>
                            &copy; {new Date().getFullYear()} {websiteConfig?.websiteName || 'Store'}. All rights reserved.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            {websiteConfig?.addresses?.slice(0, 2).map((addr, idx) => (
                                <span key={`${addr}-${idx}`} className="inline-flex items-center gap-1">
                                    <MapPin size={14} className="text-gray-400" />
                                    <span>{addr}</span>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
            {floatingChatButton}
            </>
        );
    }

    // Style 4 (Premium Footer - Two Tone)
    if (websiteConfig?.footerStyle === 'style4') {
        const socialLinks = websiteConfig?.socialLinks || [];
        const quickLinks = websiteConfig?.footerQuickLinks?.length
            ? websiteConfig.footerQuickLinks
            : [
                { id: 'quick-1', label: 'Return & Refund Policy', url: '#' },
                { id: 'quick-2', label: 'Privacy Policy', url: '#' },
                { id: 'quick-3', label: 'Terms and Conditions', url: '#' },
                { id: 'quick-4', label: 'About us', url: '#' }
            ];
        const usefulLinks = websiteConfig?.footerUsefulLinks?.length
            ? websiteConfig.footerUsefulLinks
            : [
                { id: 'useful-1', label: 'Why Shop Online with Us', url: '#' },
                { id: 'useful-2', label: 'Online Payment Methods', url: '#' },
                { id: 'useful-3', label: 'After Sales Support', url: '#' },
                { id: 'useful-4', label: 'FAQ', url: '#' }
            ];

        return (
            <>
            <footer className="store-footer mt-auto">
                {/* Top Section - Darker Background */}
                <div className="bg-slate-700 text-white py-6 px-4">
                    <div className="max-w-7xl mx-auto space-y-4">
                        {/* Logo & Tagline */}
                        <div className="text-center">
                            {websiteConfig?.favicon && (
                                <img src={websiteConfig.favicon} alt="Favicon" className="w-24 h-24 mx-auto mb-2 object-contain" />
                            )}
                            <p className="text-white text-lg font-light tracking-wide">{websiteConfig?.shortDescription || 'Get the best for less'}</p>
                        </div>

                        {/* Social Links */}
                        {socialLinks.length > 0 && (
                            <div className="flex justify-center gap-4">
                                {socialLinks.map(link => (
                                    <a
                                        key={link.id}
                                        href={link.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        aria-label={link.platform}
                                        className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition transform hover:scale-110"
                                    >
                                        {resolveSocialIcon(link.platform)}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Section - Lighter Background */}
                <div className="bg-slate-800 text-white py-6 px-4">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Contact Us Section */}
                        <div className="text-center space-y-3">
                            <h2 className="text-3xl font-bold tracking-tight">Contact Us</h2>
                            
                            <div className="space-y-2">
                                {websiteConfig?.emails?.[0] && (
                                    <div className="flex items-center justify-center gap-3">
                                        <Mail size={24} className="text-green-400" />
                                        <a href={`mailto:${websiteConfig.emails[0]}`} className="text-lg hover:text-green-400 transition">
                                            {websiteConfig.emails[0]}
                                        </a>
                                    </div>
                                )}
                                {websiteConfig?.phones?.[0] && (
                                    <div className="flex items-center justify-center gap-3">
                                        <Phone size={24} className="text-green-400" />
                                        <a href={`tel:${websiteConfig.phones[0]}`} className="text-lg hover:text-green-400 transition">
                                            {websiteConfig.phones[0]}
                                        </a>
                                    </div>
                                )}
                                {websiteConfig?.addresses?.[0] && (
                                    <div className="flex items-center justify-center gap-3">
                                        <MapPin size={24} className="text-green-400" />
                                        <span className="text-lg">{websiteConfig.addresses[0]}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Links Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center md:text-left">
                            {/* Quick Links */}
                            <div>
                                <h3 className="text-2xl font-bold mb-4">Quick Links</h3>
                                <ul className="space-y-2">
                                    {quickLinks.map(link => (
                                        <li key={link.id}>
                                            <a href={link.url || '#'} className="text-white/80 hover:text-green-400 transition text-lg">
                                                {link.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Useful Links */}
                            <div>
                                <h3 className="text-2xl font-bold mb-4">Useful Links</h3>
                                <ul className="space-y-2">
                                    {usefulLinks.map(link => (
                                        <li key={link.id}>
                                            <a href={link.url || '#'} className="text-white/80 hover:text-green-400 transition text-lg">
                                                {link.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                         </div>

                        {/* Copyright */}
                        <div className="border-t border-white/10 pt-8 text-center text-sm text-white/60">
                            <p>&copy; {new Date().getFullYear()} {websiteConfig?.websiteName || 'Store'}. All rights reserved.</p>
                        </div>
                    </div>
                </div>
               
            </footer>
            {floatingChatButton}
            
            </>
        );
    }

    // Default Footer
    return (
        <>
        <footer className={`store-footer surface-panel bg-white border-t border-gray-100 pt-1 pb-1 text-gray-600 max-w-7xl mx-auto px-4`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div>
                    {websiteConfig?.favicon ? (
                        <img src={websiteConfig.favicon} alt={`${websiteConfig?.websiteName || 'Store'} logo`} className="h-20 object-contain mb-4" />
                    ) : logo ? (
                        <img src={logo} alt={`${websiteConfig?.websiteName || 'Store'} logo`} className="h-20 object-contain mb-4" />
                    ) : (
                        <h3 className="text-lg font-bold text-gray-900 mb-4 dark:text-white">{websiteConfig?.websiteName || 'GadgetShob'}</h3>
                    )}
                    <p className="text-sm leading-relaxed mb-4">{websiteConfig?.shortDescription}</p>
                    <div className="flex gap-3">
                    {websiteConfig?.socialLinks?.map(link => (
                        <a key={link.id} href={link.url} target="_blank" rel="noreferrer" aria-label={link.platform} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-theme-primary hover:text-white transition">
                            {resolveSocialIcon(link.platform)}
                        </a>
                    ))}
                    </div>
                </div>
                <div>
                    <h4 className="font-bold text-theme-primary mb-4 dark:text-white">Quick Links</h4>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#" className="hover:text-theme-primary">About Us</a></li>
                        <li><a href="#" className="hover:text-theme-primary">Why Shop with us</a></li>
                        <li><a href="#" className="hover:text-theme-primary">Terms & Conditions</a></li>
                        <li><a href="#" className="hover:text-theme-primary">Privacy Policy</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-theme-primary mb-4 dark:text-white">Customer Area</h4>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#" className="hover:text-theme-primary">My Account</a></li>
                        <li><a href="#" className="hover:text-theme-primary">Orders</a></li>
                        <li><a href="#" className="hover:text-theme-primary">Tracking</a></li>
                        <li><a href="#" className="hover:text-theme-primary">Returns</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-theme-primary mb-4 dark:text-white">Contact Us</h4>
                    <ul className="space-y-3 text-sm">
                        {websiteConfig?.addresses?.map((addr, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <MapPin size={16} className="mt-0.5 shrink-0" />
                                <span>{addr}</span>
                            </li>
                        ))}
                        {websiteConfig?.phones?.map((phone, i) => (
                            <li key={i} className="flex items-center gap-2">
                                <Phone size={16} />
                                <span>{phone}</span>
                            </li>
                        ))}
                        {websiteConfig?.emails?.map((email, i) => (
                            <li key={i} className="flex items-center gap-2">
                                <Mail size={16} />
                                <span>{email}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            {!websiteConfig?.hideCopyright && (
                <div className="max-w-7xl mx-auto px-4 border-t border-gray-100 pt-6 flex flex-col md:flex-row justify-between items-center text-xs">
                    {!websiteConfig?.hideCopyrightText && (
                        <p>&copy; {new Date().getFullYear()} {websiteConfig?.websiteName}. All rights reserved.</p>
                    )}
                    {websiteConfig?.showPoweredBy && (
                        <p>Powered by SystemNext IT </p>
                    )}
                </div>
            )}
        </footer>
        {floatingChatButton}
        </>
    );
};

export const StoreChatModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    websiteConfig?: WebsiteConfig;
    themeConfig?: ThemeConfig;
    user?: UserType | null;
    messages?: ChatMessage[];
    onSendMessage?: (text: string) => void;
    context?: 'customer' | 'admin';
    onEditMessage?: (id: string, text: string) => void;
    onDeleteMessage?: (id: string) => void;
    canDeleteAll?: boolean;
}> = ({ isOpen, onClose, websiteConfig, themeConfig, user, messages = [], onSendMessage, context = 'customer', onEditMessage, onDeleteMessage, canDeleteAll = false }) => {
    const [draft, setDraft] = useState('');
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editingDraft, setEditingDraft] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isCustomerView = context !== 'admin';
    const baseWhatsAppLink = isCustomerView ? buildWhatsAppLink(websiteConfig?.whatsappNumber) : null;
    const chatEnabled = isCustomerView ? (websiteConfig?.chatEnabled ?? true) : true;
    const whatsappFallbackLink = websiteConfig?.chatWhatsAppFallback ? baseWhatsAppLink : null;
    const storeName = websiteConfig?.websiteName || 'Our Store';
    const supportHours = websiteConfig?.chatSupportHours ? `${websiteConfig.chatSupportHours.from} â€“ ${websiteConfig.chatSupportHours.to}` : null;
    const displayMessages = messages;
    const normalizedUserEmail = user?.email?.toLowerCase();
    const chatContactName = websiteConfig?.websiteName || 'Support Team';
    const statusLine = websiteConfig?.chatGreeting || (supportHours ? `Typically replies ${supportHours}` : 'Active now');
    const chatInitial = chatContactName.charAt(0).toUpperCase();
    const chatShellStyle = useMemo(() => {
        const fallbackAccent = themeConfig?.primaryColor || '#0084ff';
        const accentHex = websiteConfig?.chatAccentColor || fallbackAccent;
        const accentRgb = hexToRgb(accentHex);
        const fallbackSurface = themeConfig?.surfaceColor || '#f5f6f7';
        const surfaceColor = websiteConfig?.chatSurfaceColor || `rgba(${hexToRgb(fallbackSurface)}, 0.96)`;
        const borderColor = websiteConfig?.chatBorderColor || `rgba(${accentRgb}, 0.18)`;
        const shadowColor = websiteConfig?.chatShadowColor || `rgba(${accentRgb}, 0.28)`;
        return {
            '--chat-accent': accentHex,
            '--chat-accent-rgb': accentRgb,
            '--chat-surface': surfaceColor,
            '--chat-border': borderColor,
            '--chat-shadow': shadowColor
        } as CSSProperties;
    }, [themeConfig?.primaryColor, themeConfig?.surfaceColor, websiteConfig?.chatAccentColor, websiteConfig?.chatSurfaceColor, websiteConfig?.chatBorderColor, websiteConfig?.chatShadowColor]);
    const composerPlaceholder = isCustomerView
        ? (user ? `Reply as ${user.name}` : 'Write a message...')
        : 'Reply to the customer...';
    const openWhatsApp = useCallback(() => {
        if (!baseWhatsAppLink || typeof window === 'undefined') return;
        window.open(baseWhatsAppLink, '_blank', 'noopener,noreferrer');
    }, [baseWhatsAppLink]);
    const showChatInfo = useCallback(() => {
        toast.custom(() => (
            <div className="max-w-sm rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-xl text-sm text-gray-700">
                <p className="font-semibold text-gray-900 mb-2">How live chat works</p>
                <ul className="list-disc pl-4 space-y-1">
                    <li>Messages sync in real-time between customer and admin.</li>
                    <li>Tap and hold on your own replies to edit or delete them.</li>
                    <li>Use the call or video icons to jump into WhatsApp if you need faster support.</li>
                </ul>
            </div>
        ), { duration: 6000 });
    }, []);
    const canSend = Boolean(draft.trim() && (chatEnabled || !isCustomerView));

    useEffect(() => {
        if (!isOpen) return;
        const timeout = setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 80);
        return () => clearTimeout(timeout);
    }, [isOpen, messages.length]);

    useEffect(() => {
        if (!showEmojiPicker) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showEmojiPicker]);

    useEffect(() => {
        if (!editingMessageId) return;
        const targetExists = displayMessages.some((message) => message.id === editingMessageId);
        if (!targetExists) {
            setEditingMessageId(null);
            setEditingDraft('');
        }
    }, [displayMessages, editingMessageId]);

    const handleSend = useCallback(() => {
        const text = draft.trim();
        if (!text || !onSendMessage || (!chatEnabled && isCustomerView)) return;
        onSendMessage(text);
        setDraft('');
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 10);
    }, [draft, onSendMessage, chatEnabled, isCustomerView]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    const handleEmojiClick = (emoji: string) => {
        setDraft(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    const startEditing = (message: ChatMessage) => {
        setEditingMessageId(message.id);
        setEditingDraft(message.text);
    };

    const cancelEditing = () => {
        setEditingMessageId(null);
        setEditingDraft('');
    };

    const saveEditing = () => {
        if (!editingMessageId || !onEditMessage) return;
        const trimmed = editingDraft.trim();
        if (!trimmed) return;
        onEditMessage(editingMessageId, trimmed);
        setEditingMessageId(null);
        setEditingDraft('');
    };

    const handleDelete = (id: string) => {
        onDeleteMessage?.(id);
        if (editingMessageId === id) {
            cancelEditing();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-0 sm:px-4">
            <div className="live-chat-shell bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl flex flex-col h-[75vh] sm:h-[560px]" style={chatShellStyle}>
                <div className="live-chat-header flex items-center justify-between px-4 sm:px-5 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white to-[rgba(var(--chat-accent-rgb),0.18)] border border-white shadow-sm flex items-center justify-center text-sm font-semibold text-[color:var(--chat-accent)]">
                            {chatInitial}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">{chatContactName}</p>
                            <p className="text-xs text-gray-500">{statusLine}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={openWhatsApp}
                            className={`p-2 rounded-full text-gray-500 ${baseWhatsAppLink ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`}
                            aria-label="Open WhatsApp"
                            disabled={!baseWhatsAppLink}
                        >
                            <Phone size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={openWhatsApp}
                            className={`p-2 rounded-full text-gray-500 ${baseWhatsAppLink ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`}
                            aria-label="Open WhatsApp video"
                            disabled={!baseWhatsAppLink}
                        >
                            <Video size={18} />
                        </button>
                        <button type="button" onClick={showChatInfo} className="p-2 rounded-full text-gray-500 hover:bg-gray-100" aria-label="Chat usage tips">
                            <Info size={18} />
                        </button>
                        <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100" aria-label="Close chat">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {!chatEnabled && isCustomerView && (
                    <div className="bg-amber-50 text-amber-700 text-sm px-5 py-3 border-b border-amber-100">
                        {websiteConfig?.chatOfflineMessage || 'Our agents are currently offline. Please try again later or use the fallback options below.'}
                    </div>
                )}

                <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4" style={{ background: 'var(--chat-surface)' }}>
                    {displayMessages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center text-sm text-gray-500 gap-2">
                            <p className="text-base font-semibold text-gray-600">Start the conversation</p>
                            <p className="text-xs text-gray-500 max-w-xs">Send a message to {storeName} and we will reply as soon as possible.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {displayMessages.map((message) => {
                                const isCustomer = message.sender === 'customer';
                                const isOwnMessage = normalizedUserEmail && message.authorEmail?.toLowerCase() === normalizedUserEmail;
                                const isSuperAdminMessage = message.authorRole === 'super_admin' || message.authorEmail?.toLowerCase() === 'admin@systemnextit.com';
                                const alignRight = isCustomerView ? isCustomer : isSuperAdminMessage;
                                const bubbleVariant = isCustomer
                                    ? (isCustomerView ? 'customer' : 'admin')
                                    : (isSuperAdminMessage ? 'super-admin' : 'admin');
                                const bubbleClasses = `live-chat-bubble ${alignRight ? 'ml-auto rounded-br-sm' : 'rounded-bl-sm'}`;
                                const rawDisplayName = isOwnMessage ? 'You' : (message.authorName || (message.sender === 'admin' ? 'Support Team' : message.customerName || 'Customer'));
                                const displayName = !isCustomerView && isSuperAdminMessage ? 'Super Admin' : rawDisplayName;
                                const canEdit = Boolean(isOwnMessage && onEditMessage);
                                const canDelete = Boolean(onDeleteMessage && (isOwnMessage || (!isCustomerView && canDeleteAll)));
                                const isEditing = editingMessageId === message.id;
                                const actionWrapperClass = alignRight ? 'text-white/80' : 'text-gray-400';
                                const actionButtonClass = alignRight ? 'text-white/80 hover:text-white' : 'text-gray-400 hover:text-gray-600';
                                const timestampColorClass = alignRight ? 'text-white/80' : 'text-gray-500';
                                const timestampAlignClass = alignRight ? 'text-right' : 'text-left';
                                const showNameTag = !isCustomerView && (!isSuperAdminMessage || isCustomer);
                                const shouldShowAvatar = showNameTag && !alignRight;
                                const avatarInitial = (message.authorName || message.customerName || 'A').charAt(0).toUpperCase();
                                return (
                                    <div key={message.id} className={`flex ${alignRight ? 'justify-end' : 'justify-start'} gap-2`}>
                                        {shouldShowAvatar && (
                                            <div className="pt-1 hidden sm:flex">
                                                <div className="h-8 w-8 rounded-full bg-white text-gray-600 text-xs font-semibold flex items-center justify-center shadow ring-1 ring-gray-100">
                                                    {avatarInitial}
                                                </div>
                                            </div>
                                        )}
                                        <div className="max-w-[80%] space-y-1">
                                            {showNameTag && (
                                                <span className={`text-[11px] font-semibold px-1 ${alignRight ? 'text-[rgba(255,255,255,0.85)]' : 'text-gray-500'}`}>
                                                    {displayName}
                                                </span>
                                            )}
                                            <div className={`${bubbleClasses}`} data-variant={bubbleVariant}>
                                                {isEditing ? (
                                                    <div className="space-y-2">
                                                        <textarea
                                                            value={editingDraft}
                                                            onChange={(e) => setEditingDraft(e.target.value)}
                                                            className="w-full rounded-xl border border-gray-200 bg-white/90 text-sm text-gray-800 p-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                                            rows={2}
                                                        />
                                                        <div className="flex justify-end gap-2">
                                                            <button type="button" onClick={cancelEditing} className="text-xs font-semibold text-gray-500 hover:text-gray-700">Cancel</button>
                                                            <button type="button" onClick={saveEditing} className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                                                <Check size={14} /> Save
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="whitespace-pre-line leading-relaxed break-words font-medium">{message.text}</p>
                                                )}
                                                {(canEdit || canDelete) && !isEditing && (
                                                    <div className={`mt-2 flex justify-end gap-2 text-xs ${actionWrapperClass}`}>
                                                        {canEdit && (
                                                            <button type="button" onClick={() => startEditing(message)} className={actionButtonClass} aria-label="Edit message">
                                                                <Edit2 size={14} />
                                                            </button>
                                                        )}
                                                        {canDelete && (
                                                            <button type="button" onClick={() => handleDelete(message.id)} className={actionButtonClass} aria-label="Delete message">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className={`text-[11px] ${timestampColorClass} ${timestampAlignClass} px-1`}>
                                                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {message.editedAt ? ' â€¢ Edited' : ''}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                    {displayMessages.length === 0 && <div ref={messagesEndRef} />}
                </div>

                <div className="px-4 pb-5 pt-3 border-t border-gray-100 bg-white">
                    {chatEnabled || !isCustomerView ? (
                        <div className="live-chat-input flex items-center gap-3 px-4 py-2 relative">
                            <button type="button" className="text-gray-500 hover:text-gray-700" aria-label="Attach image">
                                <ImageIcon size={18} />
                            </button>
                            <div className="relative">
                                <button 
                                    type="button" 
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className={`text-gray-500 hover:text-gray-700 transition ${showEmojiPicker ? 'text-blue-500' : ''}`}
                                    aria-label="Add emoji"
                                >
                                    <Smile size={18} />
                                </button>
                                {showEmojiPicker && (
                                    <div 
                                        ref={emojiPickerRef}
                                        className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-2xl shadow-2xl p-3 z-50 grid grid-cols-8 gap-2 w-80"
                                        style={{ right: '-200px' }}
                                    >
                                        {['ðŸ˜€', 'ðŸ˜‚', 'ðŸ˜', 'ðŸ¥°', 'ðŸ˜Ž', 'ðŸ¤”', 'ðŸ˜¢', 'ðŸ˜¡', 'ðŸ‘', 'ðŸ‘Ž', 'â¤ï¸', 'ðŸ’”', 'ðŸŽ‰', 'ðŸŽŠ', 'âœ¨', 'â­', 'ðŸ”¥', 'ðŸ’¯', 'ðŸ˜´', 'ðŸ˜·', 'ðŸ¤', 'ðŸ¤®', 'ðŸ¤¢', 'ðŸ¤®', 'ðŸ˜ˆ', 'ðŸ‘¿', 'ðŸ’€', 'â˜ ï¸', 'ðŸ’«', 'ðŸ’¥', 'âœ…', 'âŒ', 'ðŸ™Œ', 'ðŸ¤', 'ðŸ‘', 'ðŸŽ', 'ðŸŽˆ', 'ðŸŽ€', 'ðŸŒˆ', 'ðŸŒŸ', 'ðŸ’–', 'ðŸ’', 'ðŸ’—', 'ðŸ’“', 'ðŸ’ž', 'ðŸš€', 'âš¡', 'ðŸŒº', 'ðŸŒ¸', 'ðŸŒ¼', 'ðŸ•', 'ðŸ”', 'ðŸŸ', 'ðŸŒ®', 'ðŸ°', 'ðŸª', 'â˜•', 'ðŸº', 'ðŸ»', 'ðŸ¥‚', 'ðŸ¾'].map((emoji) => (
                                            <button
                                                key={emoji}
                                                onClick={() => handleEmojiClick(emoji)}
                                                className="text-2xl hover:bg-gray-100 p-1 rounded transition hover:scale-125"
                                                title={emoji}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <input
                                type="text"
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={composerPlaceholder}
                                className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400"
                            />
                            <button
                                onClick={handleSend}
                                className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition ${canSend ? 'text-white shadow-md' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                style={canSend ? { backgroundColor: 'var(--chat-accent)', boxShadow: '0 8px 18px rgba(var(--chat-accent-rgb), 0.25)' } : undefined}
                                aria-label="Send message"
                                disabled={!canSend}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="text-sm text-gray-600 space-y-3">
                            <p>Need urgent help? You can still reach us via the options below:</p>
                            {whatsappFallbackLink && (
                                <a href={whatsappFallbackLink} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-green-500 text-green-700 py-2 font-semibold">
                                    <MessageCircle size={16} /> Chat on WhatsApp
                                </a>
                            )}
                            <p className="text-xs text-gray-400">Leave your message and we will respond once we are online.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const ProductQuickViewModal: React.FC<{
    product: Product;
    onClose: () => void;
    onCompleteOrder: (product: Product, quantity: number, variant: ProductVariantSelection) => void;
    onViewDetails?: (product: Product) => void;
}> = ({ product, onClose, onCompleteOrder, onViewDetails }) => {
    const [selectedColor, setSelectedColor] = useState<string>(product.variantDefaults?.color || product.colors?.[0] || 'Default');
    const [selectedSize, setSelectedSize] = useState<string>(product.variantDefaults?.size || product.sizes?.[0] || 'Standard');
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        setSelectedColor(product.variantDefaults?.color || product.colors?.[0] || 'Default');
        setSelectedSize(product.variantDefaults?.size || product.sizes?.[0] || 'Standard');
        setQuantity(1);
    }, [product]);

    const handleQuantityChange = (delta: number) => {
        setQuantity(prev => Math.max(1, prev + delta));
    };

    const variant: ProductVariantSelection = {
        color: selectedColor || 'Default',
        size: selectedSize || 'Standard'
    };
    const quickPrice = formatCurrency(product.price);
    const quickOriginalPrice = formatCurrency(product.originalPrice, null);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden grid grid-cols-1 lg:grid-cols-2">
                <button aria-label="Close" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={22} />
                </button>
                <div className="p-6 lg:p-10 bg-gray-50 flex flex-col items-center justify-center">
                    <div className="relative w-full max-w-sm">
                        <div className="absolute inset-6 bg-gradient-to-br from-emerald-200/40 via-transparent to-transparent blur-3xl" aria-hidden />
                        <img src={normalizeImageUrl(product.galleryImages?.[0] || product.image)} alt={product.name} className="relative w-full h-80 object-contain" />
                    </div>
                    <div className="mt-4 flex gap-2 text-xs text-gray-500">
                        <span className="px-3 py-1 rounded-full bg-white border border-gray-200">Ships 48h</span>
                        <span className="px-3 py-1 rounded-full bg-white border border-gray-200">Secure Payment</span>
                    </div>
                </div>

                <div className="p-6 lg:p-10 space-y-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Quick view</p>
                        <h3 className="text-2xl font-black text-gray-900 mt-2">{product.name}</h3>
                        <p className="text-sm text-gray-500 mt-2 line-clamp-3">{product.description}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-3xl font-black text-gray-900">à§³ {quickPrice}</span>
                        {quickOriginalPrice && (
                            <span className="text-sm line-through text-gray-400">à§³ {quickOriginalPrice}</span>
                        )}
                    </div>

                    {product.colors && product.colors.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Color</p>
                            <div className="flex flex-wrap gap-2">
                                {product.colors.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setSelectedColor(color)}
                                        className={`w-8 h-8 rounded-full border-2 ${selectedColor === color ? 'border-emerald-500' : 'border-transparent'} shadow-sm`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {product.sizes && product.sizes.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Size</p>
                            <div className="flex flex-wrap gap-2">
                                {product.sizes.map(size => (
                                    <button
                                        key={size}
                                        type="button"
                                        onClick={() => setSelectedSize(size)}
                                        className={`px-3 py-1.5 rounded-xl border text-sm font-semibold ${selectedSize === size ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 'border-gray-200 text-gray-600'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase">Quantity</p>
                        <div className="flex items-center rounded-full border border-gray-200">
                            <button type="button" onClick={() => handleQuantityChange(-1)} className="p-2 text-gray-500 hover:text-gray-900">
                                <Minus size={16} />
                            </button>
                            <span className="px-4 text-sm font-bold text-gray-900">{quantity}</span>
                            <button type="button" onClick={() => handleQuantityChange(1)} className="p-2 text-gray-500 hover:text-gray-900">
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            type="button"
                            onClick={() => onCompleteOrder(product, quantity, variant)}
                            className="w-full btn-order py-3 rounded-2xl font-bold text-base shadow-[0_18px_28px_rgba(16,185,129,0.25)]"
                        >
                            Complete Order
                        </button>
                        <button
                            type="button"
                            onClick={() => { onViewDetails?.(product); }}
                            className="w-full py-3 rounded-2xl border border-gray-200 text-gray-700 font-semibold hover:border-emerald-400"
                        >
                            View Full Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const TrackOrderModal: React.FC<{ onClose: () => void, orders?: Order[] }> = ({ onClose, orders }) => {
    const [orderId, setOrderId] = useState('');
    const [result, setResult] = useState<Order | null>(null);
    const [searched, setSearched] = useState(false);

    const handleTrack = () => {
        setSearched(true);
        const found = orders?.find(o => o.id === orderId);
        setResult(found || null);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
                <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-1">
                        <Truck size={28} className="text-purple-600" />
                        <h2 className="text-2xl font-bold text-gray-800">Track Order</h2>
                    </div>
                    
                    <div className="flex gap-2 mb-6">
                        <input 
                          type="text" 
                          placeholder="Enter Order ID (e.g. #0024)" 
                          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={orderId}
                          onChange={e => setOrderId(e.target.value)}
                        />
                        <button onClick={handleTrack} className="bg-purple-600 text-black-600 px-4 py-2 rounded-lg font-bold hover:bg-purple-700 shadow-lg">Track</button>
                    </div>

                    {searched && (
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            {result ? (
                                <div className="space-y-2">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 text-green-600">
                                        <CheckCircle size={24} />
                                    </div>
                                    <p className="font-bold text-gray-800">Order Found!</p>
                                    <p className="text-sm text-gray-600">Status: <span className="font-bold text-purple-600">{result.status}</span></p>
                                    <p className="text-xs text-gray-500">Date: {result.date}</p>
                                    <p className="text-xs text-gray-500">Amount: à§³{result.amount}</p>
                                </div>
                            ) : (
                                <div className="text-gray-500">
                                    <p>Order not found. Please check the ID.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

let cachedGoogleGenAI: typeof import('@google/generative-ai').GoogleGenerativeAI | null = null; // eslint-disable-line import/no-unresolved
const loadGoogleGenAI = async () => {
    if (cachedGoogleGenAI) return cachedGoogleGenAI;
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    cachedGoogleGenAI = GoogleGenerativeAI;
    return cachedGoogleGenAI;
};

export const AIStudioModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const defaultEnvKey =
        import.meta.env.VITE_GOOGLE_AI_API_KEY ||
        import.meta.env.VITE_GOOGLE_API_KEY ||
        process.env.VITE_GOOGLE_AI_API_KEY ||
        process.env.VITE_GOOGLE_API_KEY ||
        process.env.API_KEY ||
        '';
    const [customKey, setCustomKey] = useState('');
    const activeApiKey = customKey || defaultEnvKey;

    const generateImage = async () => {
        if (!prompt) return;
        if (!activeApiKey) {
            setErrorMessage('No Google AI API key configured. Add VITE_GOOGLE_AI_API_KEY to your .env or paste a key below.');
            return;
        }
        setLoading(true);
        setErrorMessage(null);
        try {
            const GoogleGenAI = await loadGoogleGenAI();
            if (!GoogleGenAI) {
                setErrorMessage('Failed to load Google GenAI SDK. Please refresh and try again.');
                return;
            }
            const ai = new GoogleGenAI(activeApiKey);
            const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash-image' });

            const result = await model.generateContent([{ text: prompt }]);
            const response = result.response;

            // Extract image from response parts
            // Guidelines say: The output response may contain both image and text parts; you must iterate...
            const parts = response?.candidates?.[0]?.content?.parts;
            if (parts) {
                for (const part of parts) {
                    if (part.inlineData?.data) {
                        const base64EncodeString = part.inlineData.data;
                        setImageUrl(`data:image/png;base64,${base64EncodeString}`);
                        break;
                    }
                }
            }
        } catch (error: any) {
            console.error("AI Generation failed", error);
            const status = error?.status || error?.response?.status;
            if (status === 403 && error?.error?.error?.status !== 'RESOURCE_EXHAUSTED') {
                setErrorMessage('This API key is blocked from calling the Generative Language API. Enable the API for your Google Cloud project or use a different unrestricted key.');
            } else {
                setErrorMessage(`Failed to generate image. ${error?.message || 'Check API key configuration.'}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex overflow-hidden border border-gray-800">
                <div className="w-80 bg-gray-800 p-6 flex flex-col border-r border-gray-700">
                    <div className="flex items-center gap-2 mb-6 text-white">
                        <Sparkles className="text-purple-400" />
                        <h2 className="font-bold text-lg">AI Studio</h2>
                    </div>
                    
                    <div className="space-y-4 flex-1">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Google AI API Key</label>
                            <input
                                type="password"
                                placeholder="Paste VITE_GOOGLE_AI_API_KEY"
                                value={customKey}
                                onChange={(e) => setCustomKey(e.target.value.trim())}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                            />
                            <p className="text-[11px] text-gray-500 mt-1">Key is held in memory for this session only. Leave blank to use the bundled env key.</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Prompt</label>
                            <textarea
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500 focus:outline-none resize-none h-32"
                                placeholder="Describe the image you want to generate..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={generateImage}
                            disabled={loading || !prompt}
                            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold transition flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                            Generate
                        </button>
                        {errorMessage && (
                            <div className="text-xs text-red-400 bg-red-950/30 border border-red-500/30 rounded-lg p-3">
                                {errorMessage}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex-1 bg-black flex items-center justify-center relative">
                    {imageUrl ? (
                        <img src={imageUrl} alt="Generated" className="max-w-full max-h-full object-contain" />
                    ) : (
                        <div className="text-center text-gray-600">
                            <ImageIcon size={64} className="mx-auto mb-4 opacity-20" />
                            <p>Generated image will appear here</p>
                        </div>
                    )}
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export const AddToCartSuccessModal: React.FC<{ product: Product; onClose: () => void; onCheckout: () => void; variant?: ProductVariantSelection | null; quantity?: number }> = ({ product, onClose, onCheckout, variant, quantity }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                    <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Added to Cart!</h3>
                <p className="text-gray-600 text-sm mb-2">{product.name} has been added to your cart.</p>
                {variant && (
                    <p className="text-xs text-gray-500 mb-4">Variant: <span className="font-semibold text-gray-700">{variant.color} / {variant.size}</span>{quantity ? ` â€¢ Qty: ${quantity}` : ''}</p>
                )}
                
                <div className="flex gap-3">
                    <button 
                        onClick={onClose} 
                        className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition"
                    >
                        Continue Shopping
                    </button>
                    <button 
                        onClick={onCheckout} 
                        className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 transition"
                    >
                        Checkout
                    </button>
                </div>
            </div>
        </div>
    );
};
