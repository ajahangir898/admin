// StoreHeader - Extracted from StoreComponents for better code splitting
// This file contains the main store header component with multiple style variants

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { ShoppingCart, Search, User, X, Loader2, Heart, LogOut, ChevronDown, Bell, Gift, Menu, Mic, Camera, Minus, Plus, Trash2, Info, Truck, Grid, UserCircle } from 'lucide-react';
import { Product, User as UserType, WebsiteConfig } from '../types';
import { formatCurrency } from '../utils/format';
import { toast } from 'react-hot-toast';
import { PRODUCTS } from '../constants';
import { normalizeImageUrl } from '../utils/imageUrlHelper';

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

type DrawerLinkItem = {
    key: string;
    label: string;
    icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
    action?: () => void;
};

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

// Sub-components for cleaner code
const VoiceButton: React.FC<{ 
    variant?: 'light' | 'dark'; 
    supportsVoiceSearch: boolean;
    isListening: boolean;
    onVoiceSearch: () => void;
}> = ({ variant = 'dark', supportsVoiceSearch, isListening, onVoiceSearch }) => {
    if (!supportsVoiceSearch) return null;
    const baseClasses = variant === 'light'
        ? 'bg-white/90 text-gray-700 hover:bg-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    return (
        <button
            type="button"
            onClick={onVoiceSearch}
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
        ? 'bg-white/90 text-gray-700 hover:bg-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    return (
        <button
            type="button"
            className={`${baseClasses} border border-gray-200 rounded-full p-2 flex items-center justify-center transition shadow-sm`}
            title="Visual search"
            aria-label="Visual search"
        >
            <Camera size={16} />
        </button>
    );
};

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

    // Drawer links
    const mobileDrawerLinks = useMemo<DrawerLinkItem[]>(() => [
        { key: 'campaign', label: 'Campaign', icon: () => <Gift size={18} /> },
        { key: 'recommend', label: 'Recommend', icon: () => <Heart size={18} />, action: onTrackOrder },
        { key: 'faqs', label: 'FAQs', icon: () => <Info size={18} /> },
    ], [onTrackOrder]);

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

    const handleDrawerNavClick = useCallback((action?: () => void) => {
        setIsMobileMenuOpen(false);
        action?.();
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

    // Render helpers
    const renderSearchHintOverlay = (offsetClass = 'left-4', textSizeClass = 'text-sm') => {
        if (activeSearchValue.trim() || !activeHint) return null;
        return (
            <div key={`${offsetClass}-${activeHintIndex}`} className={`pointer-events-none absolute inset-y-0 ${offsetClass} flex items-center text-gray-400 ${textSizeClass} z-10`}>
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

    const SearchSuggestionsDropdown = () => {
        if (!isSearchSuggestionsOpen || searchSuggestions.length === 0) return null;
        return (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
                {searchSuggestions.map((product) => (
                    <button key={product.id} onClick={() => handleSuggestionClick(product)} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition border-b border-gray-100 last:border-0 text-left">
                        <img src={normalizeImageUrl(product.image)} alt={product.name} className="w-14 h-14 object-cover rounded" />
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{product.name}</div>
                            <div className="text-xs text-gray-500">{product.category}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-bold text-green-600">{formatCurrency(product.price)}</div>
                        </div>
                    </button>
                ))}
            </div>
        );
    };

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
                {/* Mobile Drawer Overlay */}
                <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileMenuOpen(false)} />
                
                {/* Mobile Drawer */}
                <aside className={`fixed inset-y-0 left-0 z-[99] w-[82%] max-w-sm bg-white shadow-2xl md:hidden transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="flex items-center justify-between px-4 pt-6 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            {logo ? <img src={logo} alt="Store Logo" className="h-8 object-contain" /> : <span className="text-lg font-black tracking-tight text-gray-900">GADGET<span className="text-theme-primary">SHOB</span></span>}
                        </div>
                        <button type="button" className="p-2 rounded-full text-gray-600 hover:bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}><X size={20} /></button>
                    </div>
                    
                    {/* Catalog dropdown */}
                    <div className="rounded-2xl border border-gray-200 shadow-sm overflow-hidden mt-2 mx-4">
                        <button type="button" className="flex w-full items-center justify-between px-5 py-3 text-sm font-semibold text-gray-900 bg-gray-50" onClick={() => setIsCatalogDropdownOpen((prev) => !prev)}>
                            <div className="flex items-center gap-3"><Grid size={18} /><span>Catalog</span></div>
                            <ChevronDown className={`transition-transform ${isCatalogDropdownOpen ? 'rotate-180' : ''}`} size={18} />
                        </button>
                        <div className={`border-t border-gray-200 transition-[max-height] duration-300 ${isCatalogDropdownOpen ? 'max-h-[520px]' : 'max-h-0'} overflow-hidden`}>
                            {catalogGroups.map((group) => (
                                <div key={group.key}>
                                    <button type="button" className={`flex w-full items-center justify-between px-4 py-3 text-sm font-semibold ${activeCatalogSection === group.key ? 'text-theme-primary bg-theme-primary/10' : 'text-gray-800'}`} onClick={() => toggleCatalogSection(group.key)}>
                                        <span>{group.label}</span>
                                        {activeCatalogSection === group.key ? <Minus size={16} /> : <Plus size={16} />}
                                    </button>
                                    <ul className={`pl-10 pr-6 text-xs text-gray-600 transition-[max-height] duration-300 overflow-hidden ${activeCatalogSection === group.key ? 'max-h-60 py-3 space-y-1.5' : 'max-h-0'}`}>
                                        {group.items.map((item) => (
                                            <li key={item}><button type="button" className="w-full text-left hover:text-theme-primary" onClick={() => handleCatalogItemClick(item)}>{item}</button></li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
                        <nav className="space-y-2">
                            {mobileDrawerLinks.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <button key={item.key} type="button" className="w-full flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 text-left text-sm font-semibold text-gray-800 shadow-sm" onClick={() => handleDrawerNavClick(item.action)}>
                                        <Icon /><span>{item.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                {/* MOBILE HEADER */}
                <div className="md:hidden bg-white pb-1 pt-0 px-3 border-b border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-3 h-8 gap-3">
                        <div className="flex items-center" onClick={onHomeClick}>
                            {logo ? <img src={logo} alt="Store Logo" className="h-8 object-contain" /> : <h1 className="text-lg font-bold tracking-tight"><span className="text-gray-900">GADGET</span><span className="text-theme-primary">SHOB</span></h1>}
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
                                {logo ? <img src={logo} alt="Store Logo" className="h-10 md:h-12 object-contain" /> : <h1 className="text-2xl font-bold tracking-tighter"><span className="text-gray-800">GADGET</span><span className="text-theme-primary">SHOB</span></h1>}
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

            {/* Wishlist Modal */}
            {isWishlistDrawerOpen && (
                <div className="fixed inset-0 z-[999] bg-black/40 flex items-center justify-center" onClick={() => setIsWishlistDrawerOpen(false)}>
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 p-6 relative" onClick={(e) => e.stopPropagation()}>
                        <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-900" onClick={() => setIsWishlistDrawerOpen(false)}><X size={22} /></button>
                        <h2 className="text-lg font-bold mb-4">My Wishlist</h2>
                        {wishlistItems.length === 0 ? <div className="text-center text-gray-500 py-8">No items in wishlist.</div> : (
                            <ul className="space-y-4 max-h-96 overflow-y-auto">
                                {wishlistItems.map((id) => {
                                    const product = catalogSource.find(p => p.id === id);
                                    if (!product) return null;
                                    return (
                                        <li key={id} className="flex items-center gap-3 border-b pb-3 last:border-b-0">
                                            <img src={product.image} alt={product.name} className="w-14 h-14 rounded-lg object-cover border" />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold">{product.name}</div>
                                                <div className="text-sm font-bold text-green-600 mt-1">৳ {formatCurrency(product.price)}</div>
                                            </div>
                                            <button className="text-red-500 hover:text-red-700" onClick={() => handleWishlistItemToggle(id)}><Trash2 size={18} /></button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            {/* Cart Modal */}
            {isCartDrawerOpen && (
                <div className="fixed inset-0 z-[999] bg-black/40 flex items-center justify-center" onClick={() => setIsCartDrawerOpen(false)}>
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 p-6 relative" onClick={(e) => e.stopPropagation()}>
                        <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-900" onClick={() => setIsCartDrawerOpen(false)}><X size={22} /></button>
                        <h2 className="text-lg font-bold mb-4">My Cart</h2>
                        {cartItems.length === 0 ? <div className="text-center text-gray-500 py-8">No items in cart.</div> : (
                            <ul className="space-y-4 max-h-96 overflow-y-auto">
                                {cartItems.map((id) => {
                                    const product = catalogSource.find(p => p.id === id);
                                    if (!product) return null;
                                    return (
                                        <li key={id} className="flex items-center gap-3 border-b pb-3 last:border-b-0">
                                            <img src={normalizeImageUrl(product.image)} alt={product.name} className="w-14 h-14 rounded-lg object-cover border" />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold">{product.name}</div>
                                                <div className="text-sm font-bold text-green-600 mt-1">৳ {formatCurrency(product.price)}</div>
                                                <div className="mt-3 flex gap-2">
                                                    <button className="flex-1 btn-order py-1.5 text-sm" onClick={() => handleCheckoutFromCartClick(id)}>Checkout</button>
                                                    <button className="rounded-lg border border-red-200 text-red-500 text-xs font-semibold px-3 py-2 hover:bg-red-50" onClick={() => handleCartItemToggle(id)}>Remove</button>
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
        </>
    );
};

export default StoreHeader;
