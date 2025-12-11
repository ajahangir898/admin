
import React, { useState, useRef, useEffect, useMemo, useCallback, CSSProperties } from 'react';
import { ShoppingCart, Search, User, Facebook, Instagram, Twitter, Linkedin, Truck, X, CheckCircle, Sparkles, Upload, Wand2, Image as ImageIcon, Loader2, ArrowRight, Heart, LogOut, ChevronDown, UserCircle, Phone, Mail, MapPin, Youtube, ShoppingBag, Globe, Star, Eye, Bell, Gift, Users, ChevronLeft, ChevronRight, MessageCircle, Home, Grid, MessageSquare, List, Menu, Smartphone, Mic, Camera, Minus, Plus, Send, Edit2, Trash2, Check, Video, Info, Smile } from 'lucide-react';
import { Product, User as UserType, WebsiteConfig, CarouselItem, Order, ProductVariantSelection, ChatMessage, ThemeConfig } from '../../types';
import { formatCurrency } from '../../utils/format';
import { toast } from 'react-hot-toast';
import { PRODUCTS } from '../../constants';
import { LazyImage } from '../../utils/performanceOptimization';
import { buildWhatsAppLink, DrawerLinkItem, CatalogGroup, SEARCH_HINT_ANIMATION } from './helpers';

interface StoreHeaderProps { 
    onTrackOrder?: () => void;
    onOpenAIStudio?: () => void;
    onHomeClick?: () => void;
    onImageSearchClick?: () => void;
    wishlistCount?: number;
    wishlist?: number[];
    onToggleWishlist?: (productId: number) => void;
    notificationsCount?: number;
    cart?: number[];
    onToggleCart?: (productId: number) => void;
    onCheckoutFromCart?: (productId: number) => void;
    user?: UserType | null;
    onLoginClick?: () => void;
    onLogoutClick?: () => void;
    onProfileClick?: () => void;
    logo?: string | null;
    websiteConfig?: WebsiteConfig;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    onCategoriesClick?: () => void;
    onProductsClick?: () => void;
    categoriesList?: string[];
    onCategorySelect?: (categoryName: string) => void;
    categories?: any[];
    subCategories?: any[];
    childCategories?: any[];
    brands?: any[];
    tags?: any[];
    productCatalog?: Product[];
}

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
                         <button onClick={onChatClick} className="flex flex-col items-center gap-1 text-gray-500 hover:text-pink-600 transition group">
                                <MessageSquare size={20} strokeWidth={1.5} />
                                <span className="text-[10px] font-medium">Chat</span>
                         </button>
                     ) : chatFallbackLink ? (
                         <a href={chatFallbackLink} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 text-gray-500 hover:text-pink-600 transition group">
                                <MessageSquare size={20} strokeWidth={1.5} />
                                <span className="text-[10px] font-medium">Chat</span>
                         </a>
                     ) : (
                         <button className="flex flex-col items-center gap-1 text-gray-400 transition group" type="button" disabled>
                                <MessageSquare size={20} strokeWidth={1.5} className="text-gray-400" />
                                <span className="text-[10px] font-medium">Chat</span>
                         </button>
                     )}
           <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-pink-600 transition group">
              <List size={22} strokeWidth={1.5} />
              <span className="text-[10px] font-medium">Categories</span>
           </button>
        </div>

        {/* Floating Home Button */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
           <button 
             onClick={onHomeClick}
             className="w-16 h-16 rounded-full bg-pink-100 text-pink-600 flex flex-col items-center justify-center border-[4px] border-white shadow-lg transform active:scale-95 transition-transform"
           >
              <Home size={24} strokeWidth={2.5} className="mb-0.5" />
              <span className="text-[10px] font-bold">Home</span>
           </button>
        </div>

        {/* Right Side */}
        <div className="flex-1 flex justify-around items-center h-full pb-2 pl-10">
           <button onClick={onAccountClick} className={`flex flex-col items-center gap-1 transition group ${activeTab === 'account' ? 'text-pink-600' : 'text-gray-500 hover:text-pink-600'}`}>
              <User size={22} strokeWidth={1.5} />
              <span className="text-[10px] font-medium">Account</span>
           </button>
           <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-pink-600 transition group">
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
        <button onClick={onHomeClick} className={`flex flex-col items-center gap-1 transition ${activeTab === 'home' ? 'text-pink-600' : 'text-gray-500'}`}>
          <Home size={22} strokeWidth={2} className={activeTab === 'home' ? 'fill-pink-100' : ''} />
          <span className="text-[10px] font-medium">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-pink-600 transition">
          <List size={22} strokeWidth={1.5} />
          <span className="text-[10px] font-medium">Categories</span>
        </button>
                {chatEnabled && onChatClick ? (
                    <button onClick={onChatClick} className="flex flex-col items-center gap-1 text-gray-500 hover:text-pink-600 transition">
                        <MessageSquare size={22} strokeWidth={1.5} />
                        <span className="text-[10px] font-medium">Chat</span>
                    </button>
                ) : chatFallbackLink ? (
                    <a href={chatFallbackLink} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 text-gray-500 hover:text-pink-600 transition">
                        <MessageSquare size={22} strokeWidth={1.5} />
                        <span className="text-[10px] font-medium">Chat</span>
                    </a>
                ) : (
                    <button className="flex flex-col items-center gap-1 text-gray-400 transition" type="button" disabled>
                        <MessageSquare size={22} strokeWidth={1.5} className="text-gray-400" />
                        <span className="text-[10px] font-medium">Chat</span>
                    </button>
                )}
        <button onClick={onAccountClick} className={`flex flex-col items-center gap-1 transition ${activeTab === 'account' ? 'text-pink-600' : 'text-gray-500'}`}>
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
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white flex items-center justify-center text-sm font-semibold">
                                        {customerInitial}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{customerLabel}</p>
                                        {user.email && <p className="text-xs text-gray-500 truncate">{user.email}</p>}
                                    </div>
                                </div>
                                <button onClick={handleAccountPrimaryAction} className="mt-3 w-full flex items-center justify-between rounded-2xl bg-gray-50 hover:bg-pink-50 text-gray-800 hover:text-pink-600 text-sm font-medium py-2.5 px-3 transition">
                                    <span>View profile</span>
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
                                    <a href={chatFallbackLink} target="_blank" rel="noreferrer" className="mt-2 block text-center text-xs text-gray-500 hover:text-pink-600 transition">
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

export const StoreHeader: React.FC<StoreHeaderProps> = ({ 
    onTrackOrder,
    onOpenAIStudio,
    onHomeClick,
    onImageSearchClick,
    wishlistCount,
    wishlist,
    onToggleWishlist,
    notificationsCount,
    cart,
    onToggleCart,
    onCheckoutFromCart,
    user,
    onLoginClick,
    onLogoutClick,
    onProfileClick,
    logo,
    websiteConfig,
    searchValue,
    onSearchChange,
    onCategoriesClick,
    onProductsClick,
    categoriesList,
    onCategorySelect,
    categories = [],
    subCategories = [],
    childCategories = [],
    brands = [],
    tags = [],
    productCatalog,
}) => {
    const normalizedCart = useMemo(() => (Array.isArray(cart) ? cart : []), [cart]);
    const normalizedWishlist = useMemo(() => (Array.isArray(wishlist) ? wishlist : []), [wishlist]);
    const catalogSource = useMemo(() => (
        Array.isArray(productCatalog) && productCatalog.length ? productCatalog : PRODUCTS
    ), [productCatalog]);
    const cartItems = normalizedCart;
    const wishlistItems = normalizedWishlist;

    const handleCartItemToggle = useCallback((productId: number) => {
        if (onToggleCart) {
            onToggleCart(productId);
        } else {
            toast.error('Cart unavailable right now');
        }
    }, [onToggleCart]);

    const handleWishlistItemToggle = useCallback((productId: number) => {
        if (onToggleWishlist) {
            onToggleWishlist(productId);
        } else {
            toast.error('Wishlist unavailable right now');
        }
    }, [onToggleWishlist]);
    const [supportsVoiceSearch, setSupportsVoiceSearch] = useState(false);
    const recognitionRef = useRef<any>(null);
    const speechApiRef = useRef<any>(null);
    const isSecureVoiceContext = typeof window !== 'undefined'
        ? (window.isSecureContext || ['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(window.location.hostname))
        : false;
    const notifyVoiceSearchIssue = useCallback((message: string) => {
        if (message) {
            toast.error(message);
        }
    }, []);
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const SpeechRecognitionConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
        speechApiRef.current = SpeechRecognitionConstructor;
        setSupportsVoiceSearch(Boolean(SpeechRecognitionConstructor));
        return () => {
            recognitionRef.current?.stop?.();
            recognitionRef.current = null;
        };
    }, []);
    const parsedHints = useMemo(() => {
        if (websiteConfig?.searchHints) {
            return websiteConfig.searchHints
                .split(/[\n,|]/)
                .map((hint) => hint.trim())
                .filter(Boolean);
        }
        return ['Search smartphones', 'Find the best deals', 'Discover new gadgets'];
    }, [websiteConfig?.searchHints]);
    const [activeHintIndex, setActiveHintIndex] = useState(0);
    useEffect(() => {
        setActiveHintIndex(0);
    }, [parsedHints.length]);
    useEffect(() => {
        if (parsedHints.length <= 1) return;
        const interval = setInterval(() => {
            setActiveHintIndex((prev) => (prev + 1) % parsedHints.length);
        }, 3500);
        return () => clearInterval(interval);
    }, [parsedHints.length]);
    const activeHint = parsedHints[activeHintIndex] || '';
    const renderSearchHintOverlay = (offsetClass = 'left-4', textSizeClass = 'text-sm') => {
        if (activeSearchValue.trim() || !activeHint) return null;
        return (
            <div
                key={`${offsetClass}-${activeHintIndex}`}
                className={`pointer-events-none absolute inset-y-0 ${offsetClass} flex items-center text-gray-400 ${textSizeClass} z-10`}
            >
                <span className="search-hint-animate">{activeHint}</span>
            </div>
        );
    };
    const renderVoiceStreamOverlay = (positionClass = 'absolute -bottom-11 left-0 right-0') => {
        if (!isListening) return null;
        return (
            <div className={`pointer-events-none ${positionClass}`}>
                <div className="flex items-center gap-2 rounded-full border border-blue-200 bg-white/95 px-3 py-1 text-xs font-semibold text-blue-600 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                    <span className="truncate">{liveTranscript || 'Listening…'}</span>
                </div>
            </div>
        );
    };
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const categoryMenuRef = useRef<HTMLDivElement>(null);
    const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
    const notificationBadgeCount = typeof notificationsCount === 'number' && notificationsCount > 0 ? notificationsCount : 0;
    const cartBadgeCount = cartItems.length;
    const wishlistBadgeCount = typeof wishlistCount === 'number' ? wishlistCount : wishlistItems.length;
    const searchQuery = searchValue ?? '';
    const [isListening, setIsListening] = useState(false);
    const [liveTranscript, setLiveTranscript] = useState('');
    const [typedSearchValue, setTypedSearchValue] = useState(searchQuery);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCatalogDropdownOpen, setIsCatalogDropdownOpen] = useState(false);
    const [activeCatalogSection, setActiveCatalogSection] = useState<string>('categories');
        // Wishlist and Cart Drawer/Modal State
        const [isWishlistDrawerOpen, setIsWishlistDrawerOpen] = useState(false);
        const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

    const handleCheckoutFromCartClick = useCallback((productId: number) => {
        if (onCheckoutFromCart) {
            onCheckoutFromCart(productId);
            setIsCartDrawerOpen(false);
        } else {
            toast.error('Checkout unavailable right now');
        }
    }, [onCheckoutFromCart]);
    useEffect(() => {
        setTypedSearchValue(searchQuery);
    }, [searchQuery]);
    const activeSearchValue = isListening && liveTranscript ? liveTranscript : typedSearchValue;
    const emitSearchValue = useCallback((value: string) => {
        onSearchChange?.(value);
    }, [onSearchChange]);
    const handleSearchInput = useCallback((value: string) => {
        setTypedSearchValue(value);
        emitSearchValue(value);
    }, [emitSearchValue]);

      // Catalog data from props
            // Use destructured props directly
            // These should be passed as props to StoreHeader
            // If not present, default to empty array
            const safeCategories = Array.isArray(categories) ? categories : [];
            const safeSubCategories = Array.isArray(subCategories) ? subCategories : [];
            const safeChildCategories = Array.isArray(childCategories) ? childCategories : [];
            const safeBrands = Array.isArray(brands) ? brands : [];
            const safeTags = Array.isArray(tags) ? tags : [];

      const catalogGroups = useMemo<CatalogGroup[]>(() => [
                { key: 'categories', label: 'Categories', items: (Array.isArray(categoriesList) && categoriesList.length) ? categoriesList : safeCategories.map((c: any) => c.name) },
                { key: 'subCategories', label: 'Sub Categories', items: safeSubCategories.map((s: any) => s.name) },
                { key: 'childCategories', label: 'Child Categories', items: safeChildCategories.map((c: any) => c.name) },
                { key: 'brand', label: 'Brand', items: safeBrands.map((b: any) => b.name) },
                { key: 'tags', label: 'Tags', items: safeTags.map((t: any) => t.name) },
            ], [categoriesList, safeCategories, safeSubCategories, safeChildCategories, safeBrands, safeTags]);
    // Drawer order: Campaign, Recommend, Catalog, FAQs, Download, Need Help
    const mobileDrawerLinks = useMemo<DrawerLinkItem[]>(() => [
        { key: 'campaign', label: 'Campaign', icon: (props) => <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpsA1K1YnBSEvQlatJX7r83C0QH2O0TRLXqQ&s" alt="Campaign" style={{ height: props.size || 18, width: props.size || 18, ...props }} /> },
        { key: 'recommend', label: 'Recommend', icon: (props) => <img src="https://i.postimg.cc/T1XsS9F1/images_(1).png" alt="Recommend" style={{ height: props.size || 18, width: props.size || 18, ...props }} />, action: onTrackOrder },
        // Catalog handled separately as dropdown
        { key: 'faqs', label: 'FAQs', icon: Info },
    ], [onTrackOrder]);
            // Drawer: Add app download buttons after FAQs
            // const appDownloadButtons = (
            //     <div className="flex flex-col gap-3 mt-4">
            //         {websiteConfig?.androidAppUrl && (
            //             <a
            //                 href={websiteConfig.androidAppUrl}
            //                 target="_blank"
            //                 rel="noopener noreferrer"
            //                 className="flex items-center justify-center rounded-full bg-white shadow border border-gray-200 px-4 py-2 gap-2 hover:bg-gray-50 transition"
            //                 style={{ minWidth: 220 }}
            //             >
            //                 <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" style={{ height: 32 }} />
            //                 <span className="ml-2 font-semibold text-gray-800 text-base">Get it on Google Play</span>
            //             </a>
            //         )}
            //         {websiteConfig?.iosAppUrl && (
            //             <a
            //                 href={websiteConfig.iosAppUrl}
            //                 target="_blank"
            //                 rel="noopener noreferrer"
            //                 className="flex items-center justify-center rounded-full bg-white shadow border border-gray-200 px-4 py-2 gap-2 hover:bg-gray-50 transition"
            //                 style={{ minWidth: 220 }}
            //             >
            //                 <img src="https://upload.wikimedia.org/wikipedia/commons/6/67/App_Store_badge_EN.svg" alt="App Store" style={{ height: 32 }} />
            //                 <span className="ml-2 font-semibold text-gray-800 text-base">Download on the App Store</span>
            //             </a>
            //         )}
            //     </div>
            // );
    const toggleCatalogSection = useCallback((key: string) => {
        setActiveCatalogSection((prev) => (prev === key ? '' : key));
    }, []);
    const handleDrawerNavClick = useCallback((action?: () => void) => {
        setIsMobileMenuOpen(false);
        action?.();
    }, []);
    const handleCatalogItemClick = useCallback((item: string) => {
        onCategorySelect?.(item);
        onCategoriesClick?.();
        setIsMobileMenuOpen(false);
    }, [onCategoriesClick, onCategorySelect]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
            if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target as Node)) {
                setIsCategoryMenuOpen(false);
            }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

    const buildRecognition = useCallback(() => {
        const SpeechRecognitionConstructor = speechApiRef.current;
        if (!SpeechRecognitionConstructor) {
            return null;
        }
        const recognition = new SpeechRecognitionConstructor();
        recognition.lang = websiteConfig?.voiceSearchLanguage || 'en-US';
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.onresult = (event: any) => {
            if (!event?.results) return;
            const transcript = Array.from(event.results)
                .map((result: any) => result?.[0]?.transcript || '')
                .join(' ')
                .trim();
            const latestResult = event.results[event.results.length - 1];
            const isFinal = latestResult?.isFinal;
            if (isFinal) {
                if (transcript) {
                    setTypedSearchValue(transcript);
                    emitSearchValue(transcript);
                }
                setLiveTranscript('');
            } else {
                setLiveTranscript(transcript);
            }
        };
        recognition.onstart = () => {
            setLiveTranscript('');
            setIsListening(true);
        };
        recognition.onend = () => {
            setIsListening(false);
            setLiveTranscript('');
            recognitionRef.current = null;
        };
        recognition.onerror = (event: any) => {
            setIsListening(false);
            setLiveTranscript('');
            recognitionRef.current = null;
            const errorType = event?.error || '';
            if (errorType === 'not-allowed') {
                notifyVoiceSearchIssue('Microphone permission denied. Please allow access to use voice search.');
            } else if (errorType === 'network') {
                notifyVoiceSearchIssue('Network error interrupted voice search. Check your connection and try again.');
            } else if (typeof errorType === 'string' && errorType.toLowerCase().includes('secure')) {
                notifyVoiceSearchIssue('Voice search requires a secure (https) connection. Open the site via https:// or localhost.');
            } else if (errorType === 'no-speech') {
                notifyVoiceSearchIssue('We did not catch that. Please speak a bit louder and try again.');
            } else {
                notifyVoiceSearchIssue('Voice search stopped due to an unexpected error. Please try again.');
            }
        };
        return recognition;
    }, [emitSearchValue, notifyVoiceSearchIssue, websiteConfig?.voiceSearchLanguage]);

    const ensureMicrophonePermission = useCallback(async () => {
        if (typeof navigator === 'undefined') {
            return false;
        }
        try {
            const permissionStatus = await navigator.permissions?.query?.({ name: 'microphone' as PermissionName });
            if (permissionStatus?.state === 'granted') {
                return true;
            }
        } catch (_) {
            // Some browsers (Safari) do not expose the Permissions API for microphones.
        }
        if (!navigator.mediaDevices?.getUserMedia) {
            return true;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach((track) => track.stop());
            return true;
        } catch (error) {
            notifyVoiceSearchIssue('Microphone permission is required for voice search. Please allow access and try again.');
            console.error('Microphone permission denied', error);
            return false;
        }
    }, [notifyVoiceSearchIssue]);

    const handleVoiceSearch = useCallback(async () => {
        if (!supportsVoiceSearch) {
            notifyVoiceSearchIssue('Voice search is not available in this browser. Please try Chrome or Edge.');
            return;
        }
        if (!isSecureVoiceContext) {
            notifyVoiceSearchIssue('Voice search works best over HTTPS or localhost. Attempting to listen anyway.');
        }
        const hasPermission = await ensureMicrophonePermission();
        if (!hasPermission) {
            return;
        }
        if (recognitionRef.current) {
            try {
                recognitionRef.current.abort?.();
            } catch (_) {
                // Ignore abort errors; we just want a clean state.
            }
            recognitionRef.current = null;
        }
        const recognition = buildRecognition();
        if (!recognition) {
            notifyVoiceSearchIssue('Voice search is still initializing. Please try again in a moment.');
            return;
        }
        recognitionRef.current = recognition;
        try {
            recognition.start();
        } catch (error) {
            recognitionRef.current = null;
            let message = 'Voice search could not start. Please try again.';
            if (error instanceof DOMException) {
                if (error.name === 'NotAllowedError') {
                    message = 'Microphone permission denied. Please allow access to use voice search.';
                } else if (error.message?.toLowerCase().includes('secure origin')) {
                    message = 'Voice search requires a secure (https) connection. Open the site via https:// or localhost.';
                } else if (error.name === 'InvalidStateError') {
                    message = 'Voice search is already running. Please wait a second before trying again.';
                }
            }
            notifyVoiceSearchIssue(message);
            console.error('Voice search failed to start', error);
        }
    }, [supportsVoiceSearch, isSecureVoiceContext, ensureMicrophonePermission, buildRecognition, notifyVoiceSearchIssue]);

    const VoiceButton: React.FC<{ variant?: 'light' | 'dark' }> = ({ variant = 'dark' }) => {
        if (!supportsVoiceSearch) return null;
        const baseClasses = variant === 'light'
            ? 'bg-white/90 text-gray-700 hover:bg-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200';
        return (
            <button
                type="button"
                onClick={handleVoiceSearch}
                className={`${baseClasses} border border-gray-200 rounded-full p-2 flex items-center justify-center transition shadow-sm disabled:opacity-50`}
                title="Voice search"
                aria-pressed={isListening}
            >
                {isListening ? <Loader2 size={16} className="animate-spin" /> : <Mic size={16} />}
            </button>
        );
    };

    const CameraButton: React.FC<{ variant?: 'light' | 'dark' }> = ({ variant = 'dark' }) => {
        const baseClasses = variant === 'light'
            ? 'bg-white/90 text-gray-700 hover:bg-white dark:bg-slate-700/70 dark:text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-white';
        return (
            <button
                type="button"
                className={`${baseClasses} border border-gray-200 dark:border-slate-700 rounded-full p-2 flex items-center justify-center transition shadow-sm`}
                title="Visual search"
                aria-label="Visual search"
            >
                <Camera size={16} />
            </button>
        );
    };

  // Header Style 4: Mobile Exact Search Layout
  if (websiteConfig?.headerStyle === 'style4') {
    return (
            <>
                <style>{SEARCH_HINT_ANIMATION}</style>
                <header className="store-header w-full bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-50 font-sans transition-colors duration-300">
         {/* Mobile Header Style 4 */}
         <div className="md:hidden p-3 flex items-center gap-3 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
            <div className="flex-1 relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <Search size={18} />
               </div>
                    {renderSearchHintOverlay('left-10', 'text-xs')}
               <input 
                  type="text" 
                        placeholder="Search your products" 
                        value={activeSearchValue}
                    onChange={(e) => handleSearchInput(e.target.value)}
                                aria-label="Search products"
                                className="w-full bg-gray-100 dark:bg-slate-800 border-none rounded-lg py-2.5 pl-10 pr-14 text-sm text-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500/20 placeholder-transparent"
               />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400">
                        <CameraButton variant="light" />
                        <VoiceButton variant="light" />
                    </div>
                    {renderVoiceStreamOverlay('absolute -bottom-10 left-0 right-0')}
            </div>
            
                <button className="p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-full transition flex-shrink-0" onClick={handleVoiceSearch}>
                    {isListening ? <Loader2 size={24} className="text-blue-500 animate-spin" /> : <Mic size={24} className="text-blue-500" />}
                </button>
            
            <button className="p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-full transition relative text-gray-600 dark:text-gray-300 flex-shrink-0">
               <ShoppingCart size={24} />
               <span className="absolute top-1 right-0 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900">0</span>
            </button>
         </div>

         {/* Desktop Header (Reused Standard Logic) */}
         <div className="hidden md:block">
            {websiteConfig?.showNewsSlider && websiteConfig.headerSliderText && (
                <div className="bg-green-600 text-white text-xs py-1.5 px-4 text-center font-medium overflow-hidden whitespace-nowrap">
                <span className="inline-block animate-marquee">{websiteConfig.headerSliderText}</span>
                </div>
            )}
            <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
                <div className="flex items-center justify-between gap-4">
                <div className="flex items-center cursor-pointer" onClick={onHomeClick}>
                    {logo ? (
                    <img src={logo} alt="Store Logo" className="h-10 md:h-12 object-contain" />
                    ) : (
                    <h1 className="text-2xl font-bold tracking-tighter">
                        {websiteConfig?.brandingText ? (
                        <span className="text-gray-800 dark:text-white">{websiteConfig.brandingText}</span>
                        ) : (
                        <>
                            <span className="text-gray-800 dark:text-white">GADGET</span>
                            <span className="text-pink-500">SHOB</span>
                        </>
                        )}
                    </h1>
                    )}
                </div>

                <div className="hidden md:flex flex-1 max-w-2xl relative">
                    {renderSearchHintOverlay('left-4')}
                    <input
                    type="text"
                    placeholder={websiteConfig?.searchHints || "Search product..."}
                    value={activeSearchValue}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    aria-label="Search products"
                    className="w-full border-2 border-green-500 rounded-full py-2 pl-4 pr-32 focus:outline-none focus:ring-2 focus:ring-green-200 dark:bg-slate-800 dark:text-white dark:border-green-600 placeholder-transparent"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <button
                            onClick={onImageSearchClick}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                            title="Search by image"
                            aria-label="Search by image"
                        >
                            <ImageIcon size={20} className="text-gray-600 dark:text-gray-400" />
                        </button>
                        <CameraButton variant="light" />
                        <VoiceButton />
                                                <button className="btn-search px-6 py-2 rounded-full flex items-center justify-center">
                          <Search size={20} />
                        </button>
                    </div>
                    {renderVoiceStreamOverlay('absolute -bottom-11 left-6 right-6')}
                </div>

                <div className="flex items-center gap-6 text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2 cursor-pointer hover:text-green-600 dark:hover:text-green-400 transition hidden md:flex">
                    <div className="relative">
                        <Heart size={24} />
                            {wishlistBadgeCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{wishlistBadgeCount}</span>
                                )}
                    </div>
                    <span className="hidden sm:inline text-sm font-medium">Wishlist</span>
                    </div>

                    <div className="flex items-center gap-2 cursor-pointer hover:text-green-600 dark:hover:text-green-400 transition hidden md:flex">
                    <div className="relative">
                        <ShoppingCart size={24} />
                        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">0</span>
                    </div>
                    <span className="hidden sm:inline text-sm font-medium">Cart</span>
                    </div>
                    
                    <div className="flex items-center gap-2 cursor-pointer hover:text-green-600 dark:hover:text-green-400 transition hidden md:flex">
                    <div className="relative">
                        <Bell size={24} />
                        {notificationBadgeCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{notificationBadgeCount}</span>
                        )}
                    </div>
                    <span className="hidden sm:inline text-sm font-medium">Notifications</span>
                    </div>
                    
                    <div className="relative hidden md:block" ref={menuRef}>
                    <div 
                        className="flex items-center gap-2 cursor-pointer hover:text-green-600 dark:hover:text-green-400 transition" 
                        onClick={user ? () => setIsMenuOpen(!isMenuOpen) : onLoginClick}
                    >
                        <div className="bg-gray-100 dark:bg-slate-800 p-1 rounded-full">
                        <User size={20} />
                        </div>
                        {user ? (
                        <div className="hidden sm:flex flex-col items-start leading-tight">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Hello,</span>
                            <span className="text-sm font-bold flex items-center gap-1 dark:text-white">
                                {user.name.split(' ')[0]} 
                                <ChevronDown size={12} />
                            </span>
                        </div>
                        ) : (
                        <span className="hidden sm:inline text-sm font-medium">Login/Register</span>
                        )}
                    </div>

                    {user && isMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-100 dark:border-slate-700 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-4 py-3 border-b border-gray-50 dark:border-slate-700">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        </div>
                        <button onClick={() => { setIsMenuOpen(false); onProfileClick?.(); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-green-600 flex items-center gap-2">
                            <UserCircle size={16} /> My Profile
                        </button>
                        <button onClick={() => { setIsMenuOpen(false); onTrackOrder?.(); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-green-600 flex items-center gap-2">
                            <Truck size={16} /> My Orders
                        </button>
                        <div className="border-t border-gray-50 dark:border-slate-700 mt-1">
                            <button onClick={() => { setIsMenuOpen(false); onLogoutClick?.(); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                        </div>
                    )}
                    </div>
                </div>
                </div>
            </div>
            
            <div className="border-t border-gray-100 dark:border-slate-800 hidden md:block">
                <div className="max-w-7xl mx-auto px-4">
                <nav className="flex gap-8 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 items-center">
                    <button onClick={onHomeClick} className="hover:text-green-500 transition">Home</button>
                                        {websiteConfig?.showMobileHeaderCategory && (
                                            <div
                                                ref={categoryMenuRef}
                                                className="relative"
                                                onMouseEnter={() => setIsCategoryMenuOpen(true)}
                                                onMouseLeave={() => setIsCategoryMenuOpen(false)}
                                            >
                                                <button type="button" onClick={onCategoriesClick} className="hover:text-green-500 transition">
                                                    Categories
                                                </button>
                                                {isCategoryMenuOpen && categoriesList?.length ? (
                                                    <div className="absolute left-0 top-full mt-2 w-48 rounded-xl border border-gray-100 bg-white py-2 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                                                        {categoriesList.map((category) => (
                                                            <button
                                                                key={category}
                                                                type="button"
                                                                onClick={() => {
                                                                    onCategorySelect?.(category);
                                                                    setIsCategoryMenuOpen(false);
                                                                }}
                                                                className="block w-full px-4 py-1.5 text-left text-sm text-gray-600 transition hover:bg-gray-50 hover:text-green-600 dark:text-gray-200 dark:hover:bg-slate-700"
                                                            >
                                                                {category}
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : null}
                                            </div>
                                        )}
                                        <button type="button" onClick={onProductsClick} className="hover:text-green-500 transition">
                                            Products
                                        </button>
                    <button onClick={onTrackOrder} className="hover:text-green-500 transition">Track Order</button>
                    <button onClick={onOpenAIStudio} className="flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:text-purple-700 transition font-bold">
                    <Sparkles size={16} /> 
                    </button>
                    <a href="#" className="hover:text-green-500 transition">Wishlist</a>
                </nav>
                </div>
            </div>
         </div>
      </header>
            </>
    );
  }

  // Header Style 2 (Coco Kids Style)
  if (websiteConfig?.headerStyle === 'style2') {
    return (
            <>
                <style>{SEARCH_HINT_ANIMATION}</style>
                <header className="store-header w-full bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-50 font-sans">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-100 dark:bg-slate-900 dark:border-slate-800 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 py-2 text-[11px] md:text-xs font-medium text-gray-600 dark:text-gray-400 flex flex-col md:flex-row justify-between items-center gap-2">
            <div className="flex items-center gap-4 md:gap-6">
               <div className="flex items-center gap-1.5">
                  <Mail size={14} className="text-gray-800 dark:text-gray-200" />
                  <span>{websiteConfig.emails?.[0] || 'info@example.com'}</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <Phone size={14} className="text-gray-800 dark:text-gray-200" />
                  <span>{websiteConfig.phones?.[0] || '09638-000000'}</span>
               </div>
            </div>
            <div className="flex items-center gap-4 md:gap-6">
               <a href="#" className="flex items-center gap-1 hover:text-blue-600 transition">
                  <Gift size={14} className="text-blue-600" /> Daily Reward
               </a>
               <a href="#" className="hover:text-blue-600 transition hidden sm:inline-block">Community</a>
               <button onClick={onTrackOrder} className="hover:text-blue-600 transition">Track Order</button>
               <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition">
                  <span>My Wishlist ({wishlistItems.length})</span>
               </div>
               <a href="#" className="hover:text-blue-600 transition hidden sm:inline-block">Seller Registration</a>
               <div className="border-l pl-4 border-gray-200 ml-2">
                 <Bell size={16} className="text-gray-600 dark:text-gray-300 hover:text-blue-600 cursor-pointer" />
               </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-5">
           <div className="flex items-center justify-between gap-4 md:gap-8">
              
              {/* Logo */}
              <div className="cursor-pointer shrink-0" onClick={onHomeClick}>
                {logo ? (
                  <img src={logo} alt="Store Logo" className="h-8 md:h-12 object-contain" />
                ) : (
                  <div className="flex flex-col leading-none">
                     <span className="text-2xl font-black text-blue-500 tracking-tight">COCO</span>
                     <span className="text-xl font-bold text-pink-500 tracking-widest -mt-1">KIDS</span>
                  </div>
                )}
              </div>

              {/* Search Bar - Center */}
              <div className="hidden md:block flex-1 max-w-2xl relative">
                 {renderSearchHintOverlay('left-4')}
                                 <input 
                                     type="text" 
                                     placeholder={websiteConfig?.searchHints || "Search..."}
                                                value={activeSearchValue}
                                                onChange={(e) => handleSearchInput(e.target.value)}
                     aria-label="Search products"
                     className="w-full border border-blue-400 rounded px-4 py-2.5 pr-32 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm placeholder-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                 />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                          <CameraButton variant="light" />
                          <VoiceButton variant="light" />
                                  <button className="btn-search px-4 py-2 rounded-full flex items-center justify-center">
                             <Search size={20} />
                          </button>
                      </div>
                      {renderVoiceStreamOverlay('absolute -bottom-11 left-6 right-6')}
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-4 md:gap-8 shrink-0">
                 {/* Mobile Search Icon */}
                 <button className="md:hidden text-gray-600 dark:text-gray-300">
                    <Search size={24} />
                 </button>

                 {/* Cart */}
                 <div className="relative cursor-pointer group hidden md:block">
                    <ShoppingCart size={28} className="text-gray-700 dark:text-gray-200 group-hover:text-blue-600 transition" strokeWidth={1.5} />
                    <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                       0
                    </span>
                 </div>

                 {/* User / Login */}
                 <div className="relative hidden md:block" ref={menuRef}>
                    <div 
                      className="flex items-center gap-2 cursor-pointer group"
                      onClick={user ? () => setIsMenuOpen(!isMenuOpen) : onLoginClick}
                    >
                       <User size={28} className="text-gray-700 dark:text-gray-200 group-hover:text-blue-600 transition" strokeWidth={1.5} />
                       <div className="hidden sm:flex flex-col leading-tight">
                          {user ? (
                             <>
                               <span className="text-xs text-gray-500 dark:text-gray-400">Welcome,</span>
                               <span className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-0.5">
                                 {user.name.split(' ')[0]} <ChevronDown size={12}/>
                               </span>
                             </>
                          ) : (
                             <span className="text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-blue-600 transition whitespace-nowrap">
                                Login / SignUp
                             </span>
                          )}
                       </div>
                    </div>

                    {/* User Dropdown */}
                    {user && isMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-100 dark:border-slate-700 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                         <div className="px-4 py-3 border-b border-gray-50 dark:border-slate-700">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                         </div>
                         <button onClick={() => { setIsMenuOpen(false); onProfileClick?.(); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-blue-600 flex items-center gap-2">
                            <UserCircle size={16} /> My Profile
                         </button>
                         <button onClick={() => { setIsMenuOpen(false); onTrackOrder?.(); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-blue-600 flex items-center gap-2">
                            <Truck size={16} /> My Orders
                         </button>
                         <div className="border-t border-gray-50 dark:border-slate-700 mt-1">
                           <button onClick={() => { setIsMenuOpen(false); onLogoutClick?.(); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                              <LogOut size={16} /> Logout
                           </button>
                         </div>
                      </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      </header>
            </>
    );
  }

  // Default Style 1 (GadgetShob)
  return (
        <>
            <style>{SEARCH_HINT_ANIMATION}</style>
            <header className="store-header w-full bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-50 transition-colors duration-300">
      
      {/* Mobile Drawer & Overlay */}
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMobileMenuOpen(false)}
                aria-hidden={!isMobileMenuOpen}
            />
            <aside
                className={`fixed inset-y-0 left-0 z-[99] w-[82%] max-w-sm bg-white dark:bg-slate-900 shadow-2xl md:hidden transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                aria-hidden={isMobileMenuOpen ? undefined : true}
            >
                <div className="flex items-center justify-between px-4 pt-6 pb-4 border-b border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        {logo ? (
                            <img src={logo} alt="Store Logo" className="h-8 object-contain" />
                        ) : (
                            <span className="text-lg font-black tracking-tight text-gray-900 dark:text-white">
                                GADGET<span className="text-pink-500">SHOB</span>
                            </span>
                        )}
                    </div>

                            

                    <button
                        type="button"
                        className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                        onClick={() => setIsMobileMenuOpen(false)}
                        aria-label="Close menu"
                    >
                        <X size={20} />
                    </button>
                </div>
                            {/* catalog dropdown (click only) */}
                
                         <div className="rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden mt-2">
                            <button
                                type="button"
                                className="flex w-full items-center justify-between px-5 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-slate-800/60"
                                onClick={() => setIsCatalogDropdownOpen((prev) => !prev)}
                            >
                                <div className="flex items-center gap-3">
                                    <Grid size={18} className="text-gray-700 dark:text-gray-200" />
                                    <span>Catalog</span>
                                </div>
                                <ChevronDown className={`transition-transform ${isCatalogDropdownOpen ? 'rotate-180' : ''}`} size={18} />
                            </button>
                            <div className={`border-t border-gray-200 dark:border-slate-700 divide-y divide-gray-100 dark:divide-slate-700 transition-[max-height] duration-300 ${
                                isCatalogDropdownOpen ? 'max-h-[520px]' : 'max-h-0'
                            } overflow-hidden bg-white dark:bg-slate-900`}
                            >
                                {catalogGroups.map((group) => {
                                    const isActive = activeCatalogSection === group.key;
                                    return (
                                        <div key={group.key} className="bg-white dark:bg-slate-900">
                                            <button
                                                type="button"
                                                className={`flex w-full items-center justify-between px-4 py-3 text-sm font-semibold transition-colors ${
                                                    isActive
                                                        ? 'text-orange-600 bg-orange-50/70 dark:bg-white/10'
                                                        : 'text-gray-800 dark:text-gray-100'
                                                }`}
                                                onClick={() => toggleCatalogSection(group.key)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <ChevronRight
                                                        size={16}
                                                        className={`transition-transform ${isActive ? 'rotate-90 text-orange-500' : 'text-gray-400'}`}
                                                    />
                                                    <span>{group.label}</span>
                                                </div>
                                                {isActive ? (
                                                    <Minus size={16} className="text-orange-500" />
                                                ) : (
                                                    <Plus size={16} className="text-gray-400" />
                                                )}
                                            </button>
                                            <ul
                                                className={`pl-10 pr-6 text-xs text-gray-600 dark:text-gray-300 transition-[max-height] duration-300 overflow-hidden ${
                                                    isActive ? 'max-h-60 py-3 space-y-1.5 bg-white dark:bg-slate-900' : 'max-h-0'
                                                }`}
                                            >
                                                {group.items.map((item) => (
                                                    <li key={`${group.key}-${item}`}>
                                                        <button
                                                            type="button"
                                                            className="w-full text-left hover:text-orange-600 dark:hover:text-orange-400"
                                                            onClick={() => handleCatalogItemClick(item)}
                                                        >
                                                            {item}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
                    <nav className="space-y-2">
                        {mobileDrawerLinks.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.key}
                                    type="button"
                                    className="w-full flex items-center gap-3 rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-left text-sm font-semibold text-gray-800 dark:text-gray-200 shadow-sm hover:border-purple-200 dark:hover:border-purple-400/40"
                                    onClick={() => handleDrawerNavClick(item.action)}
                                >
                                    <Icon size={18} strokeWidth={1.8} className="text-gray-700 dark:text-gray-300" />
                                    <span>
                                        
                                        {item.label}</span>
                                </button>
                               
                            );
                        })}

                         
                        {/* App download buttons */}
                        <div className="flex gap-3 mt-4 px-2">
                            {websiteConfig?.androidAppUrl && (
                                <a href={websiteConfig.androidAppUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center rounded-full bg-white px-0 py-0 shadow transition hover:bg-gray-100" style={{ minWidth: 80, height: 56 }}>
                                    <img src="https://i.postimg.cc/Kc9RrHT8/android-icon.png" alt="Google Play" style={{ height: 50, width: 120 }} />
                                </a>
                            )}
                            {websiteConfig?.iosAppUrl && (
                                <a href={websiteConfig.iosAppUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center rounded-full bg-white px-0 py-0 shadow transition hover:bg-gray-100" style={{ minWidth: 80, height: 56 }}>
                                    <img src="https://i.postimg.cc/wxW7cGNT/appple_app_icon.png" alt="App Store" style={{ height: 50, width: 120 }} />
                                </a>
                            )}
                        </div>
                        {/* Catalog dropdown (click only) */}
                       
                    </nav>
                       
                  
                    <div className="rounded-2xl bg-gray-900 text-white px-4 py-5 space-y-2 shadow-lg">
                        <p className="text-sm font-semibold">Need help?</p>
                        <p className="text-xs text-white/80">Chat with our team on WhatsApp or call us directly.</p>
                        <div className="flex flex-col gap-1 text-sm">
                            {websiteConfig?.phones?.[0] && <span>{websiteConfig.phones[0]}</span>}
                            {websiteConfig?.whatsappNumber && <span>WhatsApp: {websiteConfig.whatsappNumber}</span>}
                        </div>
                    </div>
                </div>
            </aside>

      {/* MOBILE HEADER SPECIFIC LAYOUT */}
            <div className="md:hidden bg-white dark:bg-slate-900 pb-3 pt-2 px-3 border-b border-gray-100 shadow-sm">
                {/* Logo Row - Centered */}
                <div className="flex justify-between items-center mb-3 h-8 gap-3">
                    <div className="flex items-center" onClick={onHomeClick}>
                        {logo ? (
                            <img src={logo} alt="Store Logo" className="h-8 object-contain" />
                        ) : (
                            <div className="flex items-center gap-1">
                                <Smartphone size={20} className="text-gray-800 dark:text-white" strokeWidth={2.5} />
                                <h1 className="text-lg font-bold tracking-tight flex items-center">
                                    <span className="text-gray-900 dark:text-white">GADGET</span>
                                    <span className="text-pink-500">SHOB</span>
                                </h1>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            className="relative cursor-pointer text-gray-800 dark:text-white"
                            aria-label="Wishlist"
                            onClick={() => setIsWishlistDrawerOpen(true)}
                        >
                            <Heart size={24} strokeWidth={2} />
                            {wishlistBadgeCount > 0 && (
                                <span className="absolute -top-1.5 -right-1 bg-pink-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white dark:border-slate-900">
                                    {wishlistBadgeCount}
                                </span>
                            )}
                        </button>
                        <button
                            className="relative cursor-pointer text-gray-800 dark:text-white"
                            aria-label="Cart"
                            onClick={() => setIsCartDrawerOpen(true)}
                        >
                            <ShoppingCart size={26} className="text-gray-800 dark:text-white" strokeWidth={2} />
                            {cartBadgeCount > 0 && (
                                <span className="absolute -top-1.5 -right-1 bg-black text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white dark:border-slate-900">
                                    {cartBadgeCount}
                                </span>
                            )}
                        </button>
                                    {/* Wishlist Drawer/Modal */}
                                    {isWishlistDrawerOpen && (
                                        <div className="fixed inset-0 z-[999] bg-black/40 flex items-center justify-center">
                                            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg w-full max-w-md mx-auto p-6 relative">
                                                <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-900" onClick={() => setIsWishlistDrawerOpen(false)}>
                                                    <X size={22} />
                                                </button>
                                                <h2 className="text-lg font-bold mb-4">My Wishlist</h2>
                                                {wishlistItems.length === 0 ? (
                                                    <div className="text-center text-gray-500 py-8">No items in wishlist.</div>
                                                ) : (
                                                    <ul className="space-y-4">
                                                        {wishlistItems.map((id) => {
                                                            const product = catalogSource.find(p => p.id === id);
                                                            if (!product) return null;
                                                            return (
                                                                <li key={id} className="flex items-center gap-3 border-b pb-3">
                                                                    <img src={product.image} alt={product.name} className="w-14 h-14 rounded-lg object-cover border" />
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="font-semibold text-gray-900 dark:text-white">{product.name}</div>
                                                                        <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{product.description}</div>
                                                                        <div className="text-sm font-bold text-green-600 dark:text-green-400 mt-1">৳ {formatCurrency(product.price)}</div>
                                                                    </div>
                                                                    <button className="text-red-500 hover:text-red-700" onClick={() => handleWishlistItemToggle(id)}>
                                                                        <Trash2 size={18} />
                                                                    </button>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {/* Cart Drawer/Modal */}
                                    {isCartDrawerOpen && (
                                        <div className="fixed inset-0 z-[999] bg-black/40 flex items-center justify-center">
                                            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg w-full max-w-md mx-auto p-6 relative">
                                                <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-900" onClick={() => setIsCartDrawerOpen(false)}>
                                                    <X size={22} />
                                                </button>
                                                <h2 className="text-lg font-bold mb-4">My Cart</h2>
                                                {cartItems.length === 0 ? (
                                                    <div className="text-center text-gray-500 py-8">No items in cart.</div>
                                                ) : (
                                                    <ul className="space-y-4">
                                                        {cartItems.map((id) => {
                                                            const product = catalogSource.find(p => p.id === id);
                                                            if (!product) return null;
                                                            return (
                                                                <li key={id} className="flex items-center gap-3 border-b pb-3">
                                                                    <img src={product.image} alt={product.name} className="w-14 h-14 rounded-lg object-cover border" />
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="font-semibold text-gray-900 dark:text-white">{product.name}</div>
                                                                        <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{product.description}</div>
                                                                        <div className="text-sm font-bold text-green-600 dark:text-green-400 mt-1">৳ {formatCurrency(product.price)}</div>
                                                                        <div className="mt-3 flex gap-2">
                                                                            <button
                                                                                className="flex-1 btn-order py-1.5 text-sm"
                                                                                onClick={() => handleCheckoutFromCartClick(id)}
                                                                            >
                                                                                Checkout
                                                                            </button>
                                                                            <button
                                                                                className="rounded-lg border border-red-200 text-red-500 text-xs font-semibold px-3 py-2 hover:bg-red-50 dark:border-red-500/40 dark:hover:bg-red-500/10"
                                                                                onClick={() => handleCartItemToggle(id)}
                                                                            >
                                                                                Remove
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    )}
                        <div className="relative cursor-pointer text-gray-800 dark:text-white">
                            <Bell size={24} strokeWidth={2} />
                            {notificationBadgeCount > 0 && (
                                <span className="absolute -top-1.5 -right-1 bg-blue-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white dark:border-slate-900">
                                    {notificationBadgeCount}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Row */}
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        className="text-gray-800 dark:text-white"
                        onClick={() => setIsMobileMenuOpen(true)}
                        aria-label="Open menu"
                    >
                        <Menu size={28} strokeWidth={2} />
                    </button>

                    <div className="flex-1 relative">
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-green-500 text-white flex items-center justify-center shadow-sm">
                            <Search size={16} strokeWidth={2} />
                        </div>
                        {renderSearchHintOverlay('left-10', 'text-xs')}
                        <input
                            type="text"
                            placeholder={websiteConfig?.searchHints || "gadget"}
                            value={activeSearchValue}
                            onChange={(e) => handleSearchInput(e.target.value)}
                            aria-label="Search products"
                            className="w-full pl-12 pr-28 py-2.5 border border-gray-900 rounded-lg text-sm focus:outline-none dark:bg-slate-800 dark:border-slate-600 dark:text-white placeholder-transparent font-medium text-gray-700"
                        />
                        <div className="absolute right-1 top-1 bottom-1 flex items-center gap-2">
                            <CameraButton variant="light" />
                            <VoiceButton />
                            <button className="btn-search text-xs font-bold px-4 h-full rounded-md flex items-center justify-center">
                                Search
                            </button>
                        </div>
                        {renderVoiceStreamOverlay('absolute -bottom-10 left-0 right-0')}
                    </div>

                   
                </div>
            </div>

      {/* DESKTOP HEADER (Hidden on Mobile) */}
      <div className="hidden md:block">
        {websiteConfig?.showNewsSlider && websiteConfig.headerSliderText && (
            <div className="bg-green-600 text-white text-xs py-1.5 px-4 text-center font-medium overflow-hidden whitespace-nowrap">
            <span className="inline-block animate-marquee">{websiteConfig.headerSliderText}</span>
            </div>
        )}
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
            <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center cursor-pointer" onClick={onHomeClick}>
                {logo ? (
                <img src={logo} alt="Store Logo" className="h-10 md:h-12 object-contain" />
                ) : (
                <h1 className="text-2xl font-bold tracking-tighter">
                    {websiteConfig?.brandingText ? (
                    <span className="text-gray-800 dark:text-white">{websiteConfig.brandingText}</span>
                    ) : (
                    <>
                        <span className="text-gray-800 dark:text-white">GADGET</span>
                        <span className="text-pink-500">SHOB</span>
                    </>
                    )}
                </h1>
                )}
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-2xl relative">
                                {renderSearchHintOverlay('left-4')}
                                <input
                                type="text"
                                placeholder={websiteConfig?.searchHints || "Search product..."}
                                value={activeSearchValue}
                                onChange={(e) => handleSearchInput(e.target.value)}
                                aria-label="Search products"
                                className="w-full border-2 border-green-500 rounded-full py-2 pl-4 pr-32 focus:outline-none focus:ring-2 focus:ring-green-200 dark:bg-slate-800 dark:text-white dark:border-green-600 placeholder-transparent"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    <CameraButton variant="light" />
                                    <VoiceButton />
                                    <button className="btn-search px-6 py-2 rounded-full flex items-center justify-center gap-2">
                                        <Search size={20} />
                                    </button>
                                </div>
                                {renderVoiceStreamOverlay('absolute -bottom-11 left-6 right-6')}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6 text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2 cursor-pointer hover:text-green-600 dark:hover:text-green-400 transition hidden md:flex">
                <div className="relative">
                    <Heart size={24} />
                    {wishlistBadgeCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{wishlistBadgeCount}</span>
                    )}
                </div>
                <span className="hidden sm:inline text-sm font-medium">Wishlist</span>
                </div>
                
                <div className="flex items-center gap-2 cursor-pointer hover:text-green-600 dark:hover:text-green-400 transition hidden md:flex">
                <div className="relative">
                    <ShoppingCart size={24} />
                    {cartBadgeCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cartBadgeCount}</span>
                    )}
                </div>
                <span className="hidden sm:inline text-sm font-medium">Cart</span>
                </div>
                
                <div className="flex items-center gap-2 cursor-pointer hover:text-green-600 dark:hover:text-green-400 transition hidden md:flex">
                <div className="relative">
                    <Bell size={24} />
                    {notificationBadgeCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{notificationBadgeCount}</span>
                    )}
                </div>
                <span className="hidden sm:inline text-sm font-medium">Notifications</span>
                </div>
                
                <div className="relative hidden md:block" ref={menuRef}>
                <div 
                    className="flex items-center gap-2 cursor-pointer hover:text-green-600 dark:hover:text-green-400 transition" 
                    onClick={user ? () => setIsMenuOpen(!isMenuOpen) : onLoginClick}
                >
                    <div className="bg-gray-100 dark:bg-slate-800 p-1 rounded-full">
                    <User size={20} />
                    </div>
                    {user ? (
                    <div className="hidden sm:flex flex-col items-start leading-tight">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Hello,</span>
                        <span className="text-sm font-bold flex items-center gap-1 dark:text-white">
                            {user.name.split(' ')[0]} 
                            <ChevronDown size={12} />
                        </span>
                    </div>
                    ) : (
                    <span className="hidden sm:inline text-sm font-medium">Login/Register</span>
                    )}
                </div>

                {/* User Dropdown */}
                {user && isMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-100 dark:border-slate-700 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 border-b border-gray-50 dark:border-slate-700">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                    <button 
                        onClick={() => { setIsMenuOpen(false); onProfileClick?.(); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-green-600 flex items-center gap-2"
                    >
                        <UserCircle size={16} /> My Profile
                    </button>
                    <button 
                        onClick={() => { setIsMenuOpen(false); onTrackOrder?.(); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-green-600 flex items-center gap-2"
                    >
                        <Truck size={16} /> My Orders
                    </button>
                    <div className="border-t border-gray-50 dark:border-slate-700 mt-1">
                        <button 
                            onClick={() => { setIsMenuOpen(false); onLogoutClick?.(); }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                    </div>
                )}
                </div>
            </div>
            </div>
        </div>
        
        {/* Navigation Bar */}
        <div className="border-t border-gray-100 dark:border-slate-800 hidden md:block">
            <div className="max-w-7xl mx-auto px-4">
            <nav className="flex gap-8 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 items-center">
                <button onClick={onHomeClick} className="hover:text-green-500 transition">Home</button>
                                {websiteConfig?.showMobileHeaderCategory && (
                                    <div
                                        ref={categoryMenuRef}
                                        className="relative"
                                        onMouseEnter={() => setIsCategoryMenuOpen(true)}
                                        onMouseLeave={() => setIsCategoryMenuOpen(false)}
                                    >
                                        <button type="button" onClick={onCategoriesClick} className="hover:text-green-500 transition">
                                            Categories
                                        </button>
                                        {isCategoryMenuOpen && categoriesList?.length ? (
                                            <div className="absolute left-0 top-full mt-2 w-48 rounded-xl border border-gray-100 bg-white py-2 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                                                {categoriesList.map((category) => (
                                                    <button
                                                        key={category}
                                                        type="button"
                                                        onClick={() => {
                                                            onCategorySelect?.(category);
                                                            setIsCategoryMenuOpen(false);
                                                        }}
                                                        className="block w-full px-4 py-1.5 text-left text-sm text-gray-600 transition hover:bg-gray-50 hover:text-green-600 dark:text-gray-200 dark:hover:bg-slate-700"
                                                    >
                                                        {category}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : null}
                                    </div>
                                )}
                                        <button type="button" onClick={onProductsClick} className="hover:text-green-500 transition">
                                            Products
                                        </button>
                <button onClick={onTrackOrder} className="hover:text-green-500 transition">Track Order</button>
                <button onClick={onOpenAIStudio} className="flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:text-purple-700 transition font-bold">
                {/* <Sparkles size={16} /> AI Image Studio */}
                </button>
                {/* <a href="#" className="hover:text-green-500 transition"></a> */}
            </nav>
            </div>
        </div>
      </div>
            </header>
        </>
  );
};


