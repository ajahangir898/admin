// StoreHeader - Extracted from StoreComponents for better code splitting
// This file contains the main store header component with multiple style variants
// Sub-components are split into separate files for better code splitting

import React, { useState, useRef, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { ShoppingCart, Search, User, Heart, LogOut, ChevronDown, Bell, Menu, Truck, UserCircle } from 'lucide-react';
import { Product, User as UserType, WebsiteConfig } from '../types';
import { toast } from 'react-hot-toast';
import { PRODUCTS } from '../constants';

// Import lightweight search components directly (they're needed immediately)
import { 
  VoiceButton, 
  CameraButton, 
  SearchSuggestions, 
  VoiceStreamOverlay, 
  SearchHintOverlay 
} from './store/header/SearchBar';

// Lazy load heavier modal components (only loaded when opened)
const CartModal = lazy(() => import('./store/header/CartModal'));
const WishlistModal = lazy(() => import('./store/header/WishlistModal'));
const MobileDrawer = lazy(() => import('./store/header/MobileDrawer'));

const SEARCH_HINT_ANIMATION = `
@keyframes searchHintSlideUp {
    0% { opacity: 0; transform: translateY(40%); }
    100% { opacity: 1; transform: translateY(0); }
}
.search-hint-animate {
    animation: searchHintSlideUp 0.45s ease;
    display: inline-block;
}
`;

const ADMIN_NOTICE_TICKER_STYLES = `
@keyframes adminNoticeTicker {
    0% { transform: translateX(100%); }
    100% { transform: translateX(-100%); }
}
.admin-notice-ticker {
    animation: adminNoticeTicker 30s linear infinite;
    white-space: nowrap;
}
`;

type CatalogGroup = {
    key: string;
    label: string;
    items: string[];
};

export interface StoreHeaderProps { 
    onTrackOrder?: () => void;
    onHomeClick?: () => void;
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
    onProductClick?: (product: Product) => void;
}

export const StoreHeader: React.FC<StoreHeaderProps> = (props) => {
    const {
        onTrackOrder,
        onHomeClick,
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
        onProductClick,
    } = props;

    // Normalize arrays
    const normalizedCart = useMemo(() => (Array.isArray(cart) ? cart : []), [cart]);
    const normalizedWishlist = useMemo(() => (Array.isArray(wishlist) ? wishlist : []), [wishlist]);
    const catalogSource = useMemo(() => (
        Array.isArray(productCatalog) && productCatalog.length ? productCatalog : PRODUCTS
    ), [productCatalog]);

    // Generate a cache-busting key for logo to force re-render when logo changes
    const logoKey = useMemo(() => logo ? `logo-${logo.slice(-20)}` : 'no-logo', [logo]);

    // State
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCatalogDropdownOpen, setIsCatalogDropdownOpen] = useState(false);
    const [activeCatalogSection, setActiveCatalogSection] = useState<string>('categories');
    const [isSearchSuggestionsOpen, setIsSearchSuggestionsOpen] = useState(false);
    const [isWishlistDrawerOpen, setIsWishlistDrawerOpen] = useState(false);
    const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
    const [activeHintIndex, setActiveHintIndex] = useState(0);
    
    // Voice search state
    const [supportsVoiceSearch, setSupportsVoiceSearch] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [liveTranscript, setLiveTranscript] = useState('');
    const [typedSearchValue, setTypedSearchValue] = useState(searchValue ?? '');
    
    // Refs
    const menuRef = useRef<HTMLDivElement>(null);
    const categoryMenuRef = useRef<HTMLDivElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);
    const speechApiRef = useRef<any>(null);

    // Computed values
    const cartItems = normalizedCart;
    const wishlistItems = normalizedWishlist;
    const cartBadgeCount = cartItems.length;
    const wishlistBadgeCount = typeof wishlistCount === 'number' ? wishlistCount : wishlistItems.length;
    const notificationBadgeCount = typeof notificationsCount === 'number' && notificationsCount > 0 ? notificationsCount : 0;
    const activeSearchValue = isListening && liveTranscript ? liveTranscript : typedSearchValue;

    // Search hints
    const parsedHints = useMemo(() => {
        if (websiteConfig?.searchHints) {
            return websiteConfig.searchHints.split(/[\n,|]/).map((hint) => hint.trim()).filter(Boolean);
        }
        return ['Search smartphones', 'Find the best deals', 'Discover new gadgets'];
    }, [websiteConfig?.searchHints]);

    const activeHint = parsedHints[activeHintIndex] || '';

    // Catalog groups
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

    // Search suggestions
    const searchSuggestions = useMemo(() => {
        if (!activeSearchValue.trim() || !catalogSource.length) return [];
        const query = activeSearchValue.trim().toLowerCase();
        return catalogSource
            .filter(product => {
                const matchesName = product.name?.toLowerCase().includes(query);
                const matchesCategory = product.category?.toLowerCase().includes(query);
                const matchesBrand = product.brand?.toLowerCase().includes(query);
                return matchesName || matchesCategory || matchesBrand;
            })
            .slice(0, 6);
    }, [activeSearchValue, catalogSource]);

    // Callbacks
    const emitSearchValue = useCallback((value: string) => {
        onSearchChange?.(value);
    }, [onSearchChange]);

    const handleSearchInput = useCallback((value: string) => {
        setTypedSearchValue(value);
        emitSearchValue(value);
    }, [emitSearchValue]);

    const handleSuggestionClick = useCallback((product: Product) => {
        setIsSearchSuggestionsOpen(false);
        setTypedSearchValue('');
        emitSearchValue('');
        onProductClick?.(product);
    }, [onProductClick, emitSearchValue]);

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

    const handleCheckoutFromCartClick = useCallback((productId: number) => {
        if (onCheckoutFromCart) {
            onCheckoutFromCart(productId);
            setIsCartDrawerOpen(false);
        } else {
            toast.error('Checkout unavailable right now');
        }
    }, [onCheckoutFromCart]);

    const toggleCatalogSection = useCallback((key: string) => {
        setActiveCatalogSection((prev) => (prev === key ? '' : key));
    }, []);

    const handleCatalogItemClick = useCallback((item: string) => {
        onCategorySelect?.(item);
        onCategoriesClick?.();
        setIsMobileMenuOpen(false);
    }, [onCategoriesClick, onCategorySelect]);

    const notifyVoiceSearchIssue = useCallback((message: string) => {
        if (message) toast.error(message);
    }, []);

    // Voice search
    const buildRecognition = useCallback(() => {
        const SpeechRecognitionConstructor = speechApiRef.current;
        if (!SpeechRecognitionConstructor) return null;
        
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
            if (latestResult?.isFinal) {
                if (transcript) {
                    setTypedSearchValue(transcript);
                    emitSearchValue(transcript);
                }
                setLiveTranscript('');
            } else {
                setLiveTranscript(transcript);
            }
        };
        
        recognition.onstart = () => { setLiveTranscript(''); setIsListening(true); };
        recognition.onend = () => { setIsListening(false); setLiveTranscript(''); recognitionRef.current = null; };
        recognition.onerror = () => { setIsListening(false); setLiveTranscript(''); recognitionRef.current = null; };
        
        return recognition;
    }, [emitSearchValue, websiteConfig?.voiceSearchLanguage]);

    const handleVoiceSearch = useCallback(async () => {
        if (!supportsVoiceSearch) {
            notifyVoiceSearchIssue('Voice search is not available in this browser.');
            return;
        }
        if (recognitionRef.current) {
            try { recognitionRef.current.abort?.(); } catch (_) {}
            recognitionRef.current = null;
        }
        const recognition = buildRecognition();
        if (!recognition) return;
        recognitionRef.current = recognition;
        try { recognition.start(); } catch (error) { recognitionRef.current = null; }
    }, [supportsVoiceSearch, buildRecognition, notifyVoiceSearchIssue]);

    // Effects
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const SpeechRecognitionConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
        speechApiRef.current = SpeechRecognitionConstructor;
        setSupportsVoiceSearch(Boolean(SpeechRecognitionConstructor));
        return () => { recognitionRef.current?.stop?.(); recognitionRef.current = null; };
    }, []);

    useEffect(() => { setActiveHintIndex(0); }, [parsedHints.length]);

    useEffect(() => {
        if (parsedHints.length <= 1) return;
        const interval = setInterval(() => {
            setActiveHintIndex((prev) => (prev + 1) % parsedHints.length);
        }, 3500);
        return () => clearInterval(interval);
    }, [parsedHints.length]);

    useEffect(() => { setTypedSearchValue(searchValue ?? ''); }, [searchValue]);

    useEffect(() => {
        setIsSearchSuggestionsOpen(searchSuggestions.length > 0 && activeSearchValue.trim().length > 0);
    }, [searchSuggestions.length, activeSearchValue]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false);
            if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target as Node)) setIsCategoryMenuOpen(false);
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) setIsSearchSuggestionsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Render helpers - use imported components
    const renderSearchHintOverlay = (offsetClass = 'left-4', textSizeClass = 'text-sm') => (
        <SearchHintOverlay
            activeSearchValue={activeSearchValue}
            activeHint={activeHint}
            activeHintIndex={activeHintIndex}
            offsetClass={offsetClass}
            textSizeClass={textSizeClass}
        />
    );

    const renderVoiceStreamOverlay = (positionClass = 'absolute -bottom-11 left-0 right-0') => (
        <VoiceStreamOverlay
            isListening={isListening}
            transcript={liveTranscript}
            positionClass={positionClass}
        />
    );

    const SearchSuggestionsDropdown = () => (
        <SearchSuggestions
            isOpen={isSearchSuggestionsOpen}
            suggestions={searchSuggestions}
            onSuggestionClick={handleSuggestionClick}
        />
    );

    // Default Style 1 (GadgetShob) - Simplified
    return (
        <>
            <style>{SEARCH_HINT_ANIMATION}</style>
            <style>{ADMIN_NOTICE_TICKER_STYLES}</style>
            
            {websiteConfig?.adminNoticeText && (
              <div className="w-full bg-white border-b border-gray-100 py-1.5 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 flex items-center gap-3">
                  <div className="flex-1 overflow-hidden relative">
                    <div className="admin-notice-ticker text-sm" style={{ color: 'rgb(var(--color-font-rgb))' }}>
                      {websiteConfig.adminNoticeText}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <header className="store-header w-full bg-white shadow-sm sticky top-0 z-50 transition-colors duration-300">
                {/* MOBILE HEADER */}
                <div className="md:hidden bg-white pb-1 pt-0 px-3 border-b border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-3 h-8 gap-3">
                        <div className="flex items-center" onClick={onHomeClick}>
                            {logo ? <img key={logoKey} src={logo} alt="Store Logo" className="h-8 object-contain" /> : <h1 className="text-lg font-bold tracking-tight"><span className="text-gray-900">GADGET</span><span className="text-theme-primary">SHOB</span></h1>}
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="relative text-gray-800" onClick={() => setIsWishlistDrawerOpen(true)}>
                                <Heart size={24} />
                                {wishlistBadgeCount > 0 && <span className="absolute -top-1.5 -right-1 bg-theme-primary text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">{wishlistBadgeCount}</span>}
                            </button>
                            <button className="relative text-gray-800" onClick={() => setIsCartDrawerOpen(true)}>
                                <ShoppingCart size={26} />
                                {cartBadgeCount > 0 && <span className="absolute -top-1.5 -right-1 bg-black text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">{cartBadgeCount}</span>}
                            </button>
                            <div className="relative text-gray-800">
                                <Bell size={24} />
                                {notificationBadgeCount > 0 && <span className="absolute -top-1.5 -right-1 bg-blue-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">{notificationBadgeCount}</span>}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button type="button" className="text-gray-800" onClick={() => setIsMobileMenuOpen(true)}><Menu size={28} /></button>
                        <div ref={searchContainerRef} className="flex-1 relative">
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-theme-primary text-white flex items-center justify-center"><Search size={16} /></div>
                            {renderSearchHintOverlay('left-10', 'text-xs')}
                            <input type="text" placeholder="Search..." value={activeSearchValue} onChange={(e) => handleSearchInput(e.target.value)} className="w-full pl-12 pr-28 py-2.5 border border-theme-primary rounded-lg text-sm focus:outline-none placeholder-transparent" />
                            <div className="absolute right-1 top-1 bottom-1 flex items-center gap-2">
                                <CameraButton variant="light" />
                                <VoiceButton supportsVoiceSearch={supportsVoiceSearch} isListening={isListening} onVoiceSearch={handleVoiceSearch} />
                                <button className="btn-search text-xs font-bold px-4 h-full rounded-md">Search</button>
                            </div>
                            {renderVoiceStreamOverlay('absolute -bottom-10 left-0 right-0')}
                            <SearchSuggestionsDropdown />
                        </div>
                    </div>
                </div>

                {/* DESKTOP HEADER */}
                <div className="hidden md:block">
                    <div className="max-w-7xl mx-auto px-4 py-1">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center cursor-pointer" onClick={onHomeClick}>
                               {logo ? <img key={logoKey} src={logo} alt="Store Logo" className="h-10 md:h-12 object-contain" /> : <span className="text-xl font-black tracking-tight text-gray-900">GADGET<span className="text-theme-primary">SHOB</span></span>}
                            </div>
                            <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-2xl relative">
                                {renderSearchHintOverlay('left-4')}
                                <input type="text" placeholder="Search product..." value={activeSearchValue} onChange={(e) => handleSearchInput(e.target.value)} className="w-full border-2 border-theme-primary rounded-full py-2 pl-4 pr-32 focus:outline-none focus:ring-2 focus:ring-theme-primary/20 placeholder-transparent" />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    <CameraButton variant="light" />
                                    <VoiceButton supportsVoiceSearch={supportsVoiceSearch} isListening={isListening} onVoiceSearch={handleVoiceSearch} />
                                    <button className="btn-search px-6 py-2 rounded-full flex items-center justify-center"><Search size={20} /></button>
                                </div>
                                {renderVoiceStreamOverlay()}
                                <SearchSuggestionsDropdown />
                            </div>
                            <div className="flex items-center gap-6 text-gray-600">
                                <div className="flex items-center gap-2 cursor-pointer hover:text-theme-primary transition hidden md:flex" onClick={() => setIsWishlistDrawerOpen(true)}>
                                    <div className="relative"><Heart size={24} />{wishlistBadgeCount > 0 && <span className="absolute -top-2 -right-2 bg-theme-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{wishlistBadgeCount}</span>}</div>
                                    <span className="hidden sm:inline text-sm font-medium">Wishlist</span>
                                </div>
                                <div className="flex items-center gap-2 cursor-pointer hover:text-theme-primary transition hidden md:flex" onClick={() => setIsCartDrawerOpen(true)}>
                                    <div className="relative"><ShoppingCart size={24} />{cartBadgeCount > 0 && <span className="absolute -top-2 -right-2 bg-theme-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cartBadgeCount}</span>}</div>
                                    <span className="hidden sm:inline text-sm font-medium">Cart</span>
                                </div>
                                <div className="relative hidden md:block" ref={menuRef}>
                                    <div className="flex items-center gap-2 cursor-pointer hover:text-theme-primary transition" onClick={user ? () => setIsMenuOpen(!isMenuOpen) : onLoginClick}>
                                        <div className="bg-gray-100 p-1 rounded-full"><User size={20} /></div>
                                        {user ? <span className="text-sm font-bold">{user.name.split(' ')[0]} <ChevronDown size={12} className="inline" /></span> : <span className="text-sm font-medium">Login</span>}
                                    </div>
                                    {user && isMenuOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border py-1 z-50">
                                            <div className="px-4 py-3 border-b"><p className="text-sm font-bold truncate">{user.name}</p><p className="text-xs text-gray-500 truncate">{user.email}</p></div>
                                            <button onClick={() => { setIsMenuOpen(false); onProfileClick?.(); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"><UserCircle size={16} /> My Profile</button>
                                            <button onClick={() => { setIsMenuOpen(false); onTrackOrder?.(); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"><Truck size={16} /> My Orders</button>
                                            <button onClick={() => { setIsMenuOpen(false); onLogoutClick?.(); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><LogOut size={16} /> Logout</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-100">
                        <div className="max-w-7xl mx-auto px-4">
                            <nav className="flex gap-8 py-3 text-sm font-medium text-gray-700 items-center">
                                <button onClick={onHomeClick} className="hover:text-theme-primary transition">Home</button>
                                {websiteConfig?.showMobileHeaderCategory && (
                                    <div ref={categoryMenuRef} className="relative" onMouseEnter={() => setIsCategoryMenuOpen(true)} onMouseLeave={() => setIsCategoryMenuOpen(false)}>
                                        <button type="button" onClick={onCategoriesClick} className="hover:text-theme-primary transition">Categories</button>
                                        {isCategoryMenuOpen && categoriesList?.length ? (
                                            <div className="absolute left-0 top-full mt-2 w-48 rounded-xl border bg-white py-2 shadow-lg">
                                                {categoriesList.map((category) => (
                                                    <button key={category} type="button" onClick={() => { onCategorySelect?.(category); setIsCategoryMenuOpen(false); }} className="block w-full px-4 py-1.5 text-left text-sm hover:bg-gray-50 hover:text-theme-primary">{category}</button>
                                                ))}
                                            </div>
                                        ) : null}
                                    </div>
                                )}
                                <button onClick={onProductsClick} className="hover:text-theme-primary transition">Products</button>
                                <button onClick={onTrackOrder} className="hover:text-theme-primary transition">Track Order</button>
                            </nav>
                        </div>
                    </div>
                </div>
            </header>

            {/* Lazy-loaded Wishlist Modal */}
            {isWishlistDrawerOpen && (
                <Suspense fallback={null}>
                    <WishlistModal
                        isOpen={isWishlistDrawerOpen}
                        onClose={() => setIsWishlistDrawerOpen(false)}
                        wishlistItems={wishlistItems}
                        catalogSource={catalogSource}
                        onToggleWishlist={handleWishlistItemToggle}
                    />
                </Suspense>
            )}

            {/* Lazy-loaded Cart Modal */}
            {isCartDrawerOpen && (
                <Suspense fallback={null}>
                    <CartModal
                        isOpen={isCartDrawerOpen}
                        onClose={() => setIsCartDrawerOpen(false)}
                        cartItems={cartItems}
                        catalogSource={catalogSource}
                        onToggleCart={handleCartItemToggle}
                        onCheckout={handleCheckoutFromCartClick}
                    />
                </Suspense>
            )}

            {/* Lazy-loaded Mobile Drawer */}
            {isMobileMenuOpen && (
                <Suspense fallback={null}>
                    <MobileDrawer
                        isOpen={isMobileMenuOpen}
                        onClose={() => setIsMobileMenuOpen(false)}
                        logo={logo}
                        logoKey={logoKey}
                        catalogGroups={catalogGroups}
                        activeCatalogSection={activeCatalogSection}
                        isCatalogDropdownOpen={isCatalogDropdownOpen}
                        onCatalogDropdownToggle={() => setIsCatalogDropdownOpen((prev) => !prev)}
                        onCatalogSectionToggle={toggleCatalogSection}
                        onCatalogItemClick={handleCatalogItemClick}
                        onTrackOrder={onTrackOrder}
                    />
                </Suspense>
            )}
        </>
    );
};

export default StoreHeader;
