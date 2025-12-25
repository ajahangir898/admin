// StoreHeader orchestrates layout, state, and async modals for the storefront header.
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Product, User as UserType, WebsiteConfig } from '../types';
import { toast } from 'react-hot-toast';
import { PRODUCTS } from '../constants';
import type { VisualSearchResult } from '../services/visualSearchTypes';
import { AdminNoticeTicker } from './store/header/AdminNoticeTicker';
import { MobileHeaderBar } from './store/header/MobileHeaderBar';
import { DesktopHeaderBar } from './store/header/DesktopHeaderBar';
import { StoreHeaderModals } from './store/header/StoreHeaderModals';
import type { CatalogGroup, HeaderSearchProps } from './store/header/headerTypes';

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
    onProductClick
  } = props;

  const normalizedCart = useMemo(() => (Array.isArray(cart) ? cart : []), [cart]);
  const normalizedWishlist = useMemo(() => (Array.isArray(wishlist) ? wishlist : []), [wishlist]);
  const catalogSource = useMemo(
    () => (Array.isArray(productCatalog) && productCatalog.length ? productCatalog : PRODUCTS),
    [productCatalog]
  );

  const resolvedHeaderLogo = websiteConfig?.headerLogo || logo || null;
  const logoKey = useMemo(
    () => (resolvedHeaderLogo ? `logo-${resolvedHeaderLogo.slice(-20)}` : 'no-logo'),
    [resolvedHeaderLogo]
  );

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCatalogDropdownOpen, setIsCatalogDropdownOpen] = useState(false);
  const [activeCatalogSection, setActiveCatalogSection] = useState<string>('categories');
  const [isSearchSuggestionsOpen, setIsSearchSuggestionsOpen] = useState(false);
  const [isWishlistDrawerOpen, setIsWishlistDrawerOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [activeHintIndex, setActiveHintIndex] = useState(0);
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
  const [isVisualSearchProcessing, setIsVisualSearchProcessing] = useState(false);
  const [visualSearchResult, setVisualSearchResult] = useState<VisualSearchResult | null>(null);
  const [visualSearchImage, setVisualSearchImage] = useState<string | null>(null);
  const [visualSearchError, setVisualSearchError] = useState<string | null>(null);

  const [supportsVoiceSearch, setSupportsVoiceSearch] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [typedSearchValue, setTypedSearchValue] = useState(searchValue ?? '');

  const menuRef = useRef<HTMLDivElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const speechApiRef = useRef<any>(null);
  const visualSearchModuleRef = useRef<{ identifyProduct: (img: string) => Promise<VisualSearchResult> } | null>(null);

  const cartItems = normalizedCart;
  const wishlistItems = normalizedWishlist;
  const cartBadgeCount = cartItems.length;
  const wishlistBadgeCount =
    typeof wishlistCount === 'number' ? wishlistCount : wishlistItems.length;
  const notificationBadgeCount =
    typeof notificationsCount === 'number' && notificationsCount > 0 ? notificationsCount : 0;
  const activeSearchValue = isListening && liveTranscript ? liveTranscript : typedSearchValue;

  const parsedHints = useMemo(() => {
    if (websiteConfig?.searchHints) {
      return websiteConfig.searchHints
        .split(/[\n,|]/)
        .map((hint) => hint.trim())
        .filter(Boolean);
    }
    return ['Search smartphones', 'Find the best deals', 'Discover new gadgets'];
  }, [websiteConfig?.searchHints]);

  const activeHint = parsedHints[activeHintIndex] || '';

  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeSubCategories = Array.isArray(subCategories) ? subCategories : [];
  const safeChildCategories = Array.isArray(childCategories) ? childCategories : [];
  const safeBrands = Array.isArray(brands) ? brands : [];
  const safeTags = Array.isArray(tags) ? tags : [];

  const catalogGroups = useMemo<CatalogGroup[]>(
    () => [
      {
        key: 'categories',
        label: 'Categories',
        items:
          Array.isArray(categoriesList) && categoriesList.length
            ? categoriesList
            : safeCategories.map((c: any) => c.name)
      },
      { key: 'subCategories', label: 'Sub Categories', items: safeSubCategories.map((s: any) => s.name) },
      { key: 'childCategories', label: 'Child Categories', items: safeChildCategories.map((c: any) => c.name) },
      { key: 'brand', label: 'Brand', items: safeBrands.map((b: any) => b.name) },
      { key: 'tags', label: 'Tags', items: safeTags.map((t: any) => t.name) }
    ],
    [categoriesList, safeCategories, safeSubCategories, safeChildCategories, safeBrands, safeTags]
  );

  const searchSuggestions = useMemo(() => {
    if (!activeSearchValue.trim() || !catalogSource.length) return [];
    const query = activeSearchValue.trim().toLowerCase();
    return catalogSource
      .filter((product) => {
        const matchesName = product.name?.toLowerCase().includes(query);
        const matchesCategory = product.category?.toLowerCase().includes(query);
        const matchesBrand = product.brand?.toLowerCase().includes(query);
        return matchesName || matchesCategory || matchesBrand;
      })
      .slice(0, 6);
  }, [activeSearchValue, catalogSource]);

  const visualSearchMatches = useMemo(() => {
    if (!visualSearchResult) return [];
    const nameQuery = visualSearchResult.productName?.toLowerCase().trim() || '';
    const brandQuery = visualSearchResult.brand?.toLowerCase().trim() || '';
    const categoryQuery = visualSearchResult.category?.toLowerCase().trim() || '';
    if (!nameQuery && !brandQuery && !categoryQuery) return [];

    return catalogSource
      .map((product) => {
        let score = 0;
        const productName = product.name?.toLowerCase() || '';
        const productBrand = product.brand?.toLowerCase() || '';
        const productCategory = product.category?.toLowerCase() || '';

        if (nameQuery) {
          if (productName === nameQuery) score += 8;
          else if (productName.includes(nameQuery)) score += 5;
          const nameTokens = nameQuery.split(/\s+/).filter(Boolean);
          const matchedTokens = nameTokens.filter((token) => productName.includes(token));
          score += matchedTokens.length * 1.2;
        }

        if (brandQuery) {
          if (productBrand === brandQuery) score += 4;
          else if (productBrand.includes(brandQuery)) score += 3;
        }

        if (categoryQuery) {
          if (productCategory === categoryQuery) score += 2.4;
          else if (productCategory.includes(categoryQuery)) score += 1.4;
        }

        if (nameQuery) {
          const tagsList = Array.isArray(product.searchTags) ? product.searchTags : [];
          if (tagsList.some((tag) => tag.toLowerCase().includes(nameQuery))) score += 1.6;
          const description = product.description?.toLowerCase() || '';
          if (description.includes(nameQuery)) score += 1.1;
        }

        if (!score) return null;
        return { product, score };
      })
      .filter((entry): entry is { product: Product; score: number } => Boolean(entry))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((entry) => entry.product);
  }, [visualSearchResult, catalogSource]);

  const emitSearchValue = useCallback(
    (value: string) => {
      onSearchChange?.(value);
    },
    [onSearchChange]
  );

  const handleSearchInput = useCallback(
    (value: string) => {
      setTypedSearchValue(value);
      emitSearchValue(value);
    },
    [emitSearchValue]
  );

  const handleSuggestionClick = useCallback(
    (product: Product) => {
      setIsSearchSuggestionsOpen(false);
      setTypedSearchValue('');
      emitSearchValue('');
      onProductClick?.(product);
    },
    [onProductClick, emitSearchValue]
  );

  const handleCartItemToggle = useCallback(
    (productId: number) => {
      if (onToggleCart) {
        onToggleCart(productId);
      } else {
        toast.error('Cart unavailable right now');
      }
    },
    [onToggleCart]
  );

  const handleWishlistItemToggle = useCallback(
    (productId: number) => {
      if (onToggleWishlist) {
        onToggleWishlist(productId);
      } else {
        toast.error('Wishlist unavailable right now');
      }
    },
    [onToggleWishlist]
  );

  const handleCheckoutFromCartClick = useCallback(
    (productId: number) => {
      if (onCheckoutFromCart) {
        onCheckoutFromCart(productId);
        setIsCartDrawerOpen(false);
      } else {
        toast.error('Checkout unavailable right now');
      }
    },
    [onCheckoutFromCart]
  );

  const toggleCatalogSection = useCallback((key: string) => {
    setActiveCatalogSection((prev) => (prev === key ? '' : key));
  }, []);

  const handleCatalogItemClick = useCallback(
    (item: string) => {
      onCategorySelect?.(item);
      onCategoriesClick?.();
      setIsMobileMenuOpen(false);
    },
    [onCategoriesClick, onCategorySelect]
  );

  const notifyVoiceSearchIssue = useCallback((message: string) => {
    if (message) toast.error(message);
  }, []);

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

    recognition.onstart = () => {
      setLiveTranscript('');
      setIsListening(true);
    };
    recognition.onend = () => {
      setIsListening(false);
      setLiveTranscript('');
      recognitionRef.current = null;
    };
    recognition.onerror = () => {
      setIsListening(false);
      setLiveTranscript('');
      recognitionRef.current = null;
    };

    return recognition;
  }, [emitSearchValue, websiteConfig?.voiceSearchLanguage]);

  const handleVoiceSearch = useCallback(async () => {
    if (!supportsVoiceSearch) {
      notifyVoiceSearchIssue('Voice search is not available in this browser.');
      return;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort?.();
      } catch (error) {
        /* no-op */
      }
      recognitionRef.current = null;
    }
    const recognition = buildRecognition();
    if (!recognition) return;
    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (error) {
      recognitionRef.current = null;
    }
  }, [supportsVoiceSearch, buildRecognition, notifyVoiceSearchIssue]);

  const handleVisualSearchOpen = useCallback(() => {
    setIsVisualSearchOpen(true);
    setVisualSearchError(null);
    if (!visualSearchModuleRef.current) {
      import('../services/visualSearch')
        .then((module) => {
          visualSearchModuleRef.current = module;
        })
        .catch((error) => {
          console.error('Preloading visual search failed', error);
        });
    }
  }, []);

  const handleVisualSearchClose = useCallback(() => {
    setIsVisualSearchOpen(false);
    setIsVisualSearchProcessing(false);
  }, []);

  const handleVisualSearchCapture = useCallback(
    async (imageData: string) => {
      if (!imageData) return;

      setVisualSearchImage(imageData);
      setVisualSearchError(null);
      setIsVisualSearchProcessing(true);
      setVisualSearchResult(null);

      try {
        if (!visualSearchModuleRef.current) {
          visualSearchModuleRef.current = await import('../services/visualSearch');
        }

        const identifyProductFn = visualSearchModuleRef.current?.identifyProduct;
        if (!identifyProductFn) {
          throw new Error('Visual search module failed to load correctly.');
        }

        const aiResult = await identifyProductFn(imageData);
        setVisualSearchResult(aiResult);

        const normalizedName = aiResult.productName?.trim();
        if (normalizedName && normalizedName.toLowerCase() !== 'unknown product') {
          handleSearchInput(normalizedName);
          setIsSearchSuggestionsOpen(true);
        }
      } catch (error: any) {
        const message = error?.message || 'Visual search failed. Please try again.';
        setVisualSearchError(message);
        toast.error(message);
      } finally {
        setIsVisualSearchProcessing(false);
      }
    },
    [handleSearchInput]
  );

  const handleVisualSearchProductView = useCallback(
    (product: Product) => {
      onProductClick?.(product);
      handleVisualSearchClose();
    },
    [onProductClick, handleVisualSearchClose]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognitionConstructor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
    speechApiRef.current = SpeechRecognitionConstructor;
    setSupportsVoiceSearch(Boolean(SpeechRecognitionConstructor));
    return () => {
      recognitionRef.current?.stop?.();
      recognitionRef.current = null;
    };
  }, []);

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

  useEffect(() => {
    setTypedSearchValue(searchValue ?? '');
  }, [searchValue]);

  useEffect(() => {
    setIsSearchSuggestionsOpen(searchSuggestions.length > 0 && activeSearchValue.trim().length > 0);
  }, [searchSuggestions.length, activeSearchValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false);
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target as Node))
        setIsCategoryMenuOpen(false);
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node))
        setIsSearchSuggestionsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchBarProps = useMemo<HeaderSearchProps>(
    () => ({
      containerRef: searchContainerRef,
      activeSearchValue,
      onInputChange: handleSearchInput,
      suggestions: searchSuggestions,
      isSuggestionsOpen: isSearchSuggestionsOpen,
      onSuggestionClick: handleSuggestionClick,
      activeHint,
      activeHintIndex,
      isListening,
      liveTranscript,
      supportsVoiceSearch,
      onVoiceSearch: handleVoiceSearch,
      onVisualSearch: handleVisualSearchOpen
    }),
    [
      activeSearchValue,
      handleSearchInput,
      searchSuggestions,
      isSearchSuggestionsOpen,
      handleSuggestionClick,
      activeHint,
      activeHintIndex,
      isListening,
      liveTranscript,
      supportsVoiceSearch,
      handleVoiceSearch,
      handleVisualSearchOpen
    ]
  );

  return (
    <>
      <style>{`
@keyframes searchHintSlideUp {
    0% { opacity: 0; transform: translateY(40%); }
    100% { opacity: 1; transform: translateY(0); }
}
.search-hint-animate {
    animation: searchHintSlideUp 0.45s ease;
    display: inline-block;
}
      `}</style>
      <style>{`
@keyframes adminNoticeTicker {
    0% { transform: translateX(100%); }
    100% { transform: translateX(-100%); }
}
.admin-notice-ticker {
    animation: adminNoticeTicker 30s linear infinite;
    white-space: nowrap;
}
      `}</style>

      <AdminNoticeTicker noticeText={websiteConfig?.adminNoticeText} />

      <header className="store-header w-full bg-white shadow-sm sticky top-0 z-50 transition-colors duration-300">
        <MobileHeaderBar
          resolvedHeaderLogo={resolvedHeaderLogo}
          logoKey={logoKey}
          onHomeClick={onHomeClick}
          wishlistBadgeCount={wishlistBadgeCount}
          cartBadgeCount={cartBadgeCount}
          notificationBadgeCount={notificationBadgeCount}
          onWishlistOpen={() => setIsWishlistDrawerOpen(true)}
          onCartOpen={() => setIsCartDrawerOpen(true)}
          onMobileMenuOpen={() => setIsMobileMenuOpen(true)}
          searchProps={searchBarProps}
        />

        <DesktopHeaderBar
          resolvedHeaderLogo={resolvedHeaderLogo}
          logoKey={logoKey}
          onHomeClick={onHomeClick}
          searchProps={searchBarProps}
          wishlistBadgeCount={wishlistBadgeCount}
          cartBadgeCount={cartBadgeCount}
          onWishlistOpen={() => setIsWishlistDrawerOpen(true)}
          onCartOpen={() => setIsCartDrawerOpen(true)}
          user={user}
          onLoginClick={onLoginClick}
          onProfileClick={onProfileClick}
          onTrackOrder={onTrackOrder}
          onLogoutClick={onLogoutClick}
          isMenuOpen={isMenuOpen}
          onMenuToggle={() => setIsMenuOpen((prev) => !prev)}
          onMenuClose={() => setIsMenuOpen(false)}
          menuRef={menuRef}
          categoriesList={categoriesList}
          onCategoriesClick={onCategoriesClick}
          onCategorySelect={onCategorySelect}
          categoryMenuRef={categoryMenuRef}
          isCategoryMenuOpen={isCategoryMenuOpen}
          onCategoryMenuOpen={setIsCategoryMenuOpen}
          onProductsClick={onProductsClick}
          websiteConfig={websiteConfig}
        />
      </header>

      <StoreHeaderModals
        isVisualSearchOpen={isVisualSearchOpen}
        isVisualSearchProcessing={isVisualSearchProcessing}
        visualSearchImage={visualSearchImage}
        visualSearchResult={visualSearchResult}
        visualSearchMatches={visualSearchMatches}
        visualSearchError={visualSearchError}
        onVisualSearchClose={handleVisualSearchClose}
        onVisualSearchCapture={handleVisualSearchCapture}
        onVisualSearchProductView={handleVisualSearchProductView}
        onCartToggle={handleCartItemToggle}
        onWishlistToggle={handleWishlistItemToggle}
        catalogSource={catalogSource}
        cartItems={cartItems}
        wishlistItems={wishlistItems}
        isWishlistDrawerOpen={isWishlistDrawerOpen}
        onWishlistClose={() => setIsWishlistDrawerOpen(false)}
        isCartDrawerOpen={isCartDrawerOpen}
        onCartClose={() => setIsCartDrawerOpen(false)}
        onCheckoutFromCart={handleCheckoutFromCartClick}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuClose={() => setIsMobileMenuOpen(false)}
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
    </>
  );
};

export default StoreHeader;