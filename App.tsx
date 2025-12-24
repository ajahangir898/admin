/**
 * App.tsx - Main Application Component (Refactored)
 * 
 * This file has been significantly reduced by extracting logic into:
 * - utils/appHelpers.ts - Utility functions
 * - hooks/useChat.ts - Chat state and handlers
 * - hooks/useCart.ts - Cart state and handlers  
 * - hooks/useAuth.ts - Authentication handlers
 * - hooks/useTenant.ts - Tenant state and handlers
 * - hooks/useThemeEffects.ts - Theme application
 * - hooks/useFacebookPixel.ts - Facebook Pixel
 * - hooks/useNavigation.ts - URL routing and navigation
 */

import React, { useState, useEffect, lazy, Suspense, useCallback, useRef, useMemo, memo } from 'react';
import type { 
  Product, Order, User, ThemeConfig, WebsiteConfig, DeliveryConfig, 
  ProductVariantSelection, LandingPage, FacebookPixelConfig, CourierConfig, 
  ChatMessage, Role, Category, SubCategory, ChildCategory, Brand, Tag 
} from './types';
import type { LandingCheckoutPayload } from './components/LandingPageComponents';

// Core services
import { StorePageSkeleton } from './components/SkeletonLoaders';
import { DataService, joinTenantRoom, leaveTenantRoom, isKeyFromSocket, clearSocketFlag } from './services/DataService';
import { useDataRefreshDebounced } from './hooks/useDataRefresh';
import { DEFAULT_TENANT_ID } from './constants';
import { toast } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';

// Extracted utilities and hooks
import {
  isAdminRole,
  isPlatformOperator,
  normalizeProductCollection,
  ensureUniqueProductSlug,
  ensureVariantSelection,
  getInitialCachedData,
  hasCachedData,
  sanitizeSubdomainSlug,
  getHostTenantSlug,
  hexToRgb,
  SESSION_STORAGE_KEY,
  ACTIVE_TENANT_STORAGE_KEY,
  DEFAULT_TENANT_SLUG,
} from './utils/appHelpers';
import { useChat } from './hooks/useChat';
import { useCart } from './hooks/useCart';
import { useAuth } from './hooks/useAuth';
import { useTenant } from './hooks/useTenant';
import { useThemeEffects } from './hooks/useThemeEffects';
import { useFacebookPixel } from './hooks/useFacebookPixel';
import { useNavigation, type ViewState } from './hooks/useNavigation';

// Lazy load Toaster for faster initial render
const Toaster = lazy(() => import('react-hot-toast').then(m => ({ default: m.Toaster })));

// Store pages - lazy loaded
const StoreHome = lazy(() => import('./pages/StoreHome'));
const StoreProductDetail = lazy(() => import('./pages/StoreProductDetail'));
const StoreCheckout = lazy(() => import('./pages/StoreCheckout'));
const StoreOrderSuccess = lazy(() => import('./pages/StoreOrderSuccess'));
const StoreProfile = lazy(() => import('./pages/StoreProfile'));
const LandingPagePreview = lazy(() => import('./pages/LandingPagePreview'));

// Admin pages - lazy loaded
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminAppWithAuth = lazy(() => {
  import('./pages/AdminApp').then(m => m.preloadAdminChunks?.());
  return import('./pages/AdminAppWithAuth');
});

// Store components - lazy loaded
const LoginModal = lazy(() => import('./components/store/LoginModal').then(m => ({ default: m.LoginModal })));
const MobileBottomNav = lazy(() => import('./components/store/MobileBottomNav').then(m => ({ default: m.MobileBottomNav })));
const StoreChatModal = lazy(() => import('./components/store/StoreChatModal').then(m => ({ default: m.StoreChatModal })));

// Preload critical chunks during idle time
if (typeof window !== 'undefined') {
  const preload = () => {
    Promise.all([
      import('./pages/StoreHome'),
      import('./components/store/MobileBottomNav')
    ]).catch(() => {});
  };
  
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(preload, { timeout: 2000 });
  } else {
    setTimeout(preload, 100);
  }
}

const App = () => {
  // === LOADING STATE ===
  const [isLoading, setIsLoading] = useState(() => !hasCachedData());

  // === TENANT MANAGEMENT (from useTenant hook) ===
  const tenant = useTenant();
  const {
    tenants,
    setTenants,
    activeTenantId,
    setActiveTenantId,
    hostTenantId,
    setHostTenantId,
    hostTenantSlug,
    isTenantSwitching,
    setIsTenantSwitching,
    isTenantSeeding,
    deletingTenantId,
    applyTenantList,
    refreshTenants,
    completeTenantSwitch,
    tenantsRef,
    activeTenantIdRef,
  } = tenant;

  // === CORE DATA STATE ===
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>(() => getInitialCachedData('products', []));
  const [logo, setLogo] = useState<string | null>(() => getInitialCachedData('logo', null));
  const [themeConfig, setThemeConfig] = useState<ThemeConfig | null>(() => getInitialCachedData('theme_config', null));
  const [websiteConfig, setWebsiteConfig] = useState<WebsiteConfig | undefined>(() => getInitialCachedData('website_config', undefined));
  const [deliveryConfig, setDeliveryConfig] = useState<DeliveryConfig[]>([]);
  const [facebookPixelConfig, setFacebookPixelConfig] = useState<FacebookPixelConfig>({
    pixelId: '', accessToken: '', enableTestEvent: false, isEnabled: false
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // Catalog State
  const [categories, setCategories] = useState<Category[]>(() => getInitialCachedData('categories', []));
  const [subCategories, setSubCategories] = useState<SubCategory[]>(() => getInitialCachedData('subcategories', []));
  const [childCategories, setChildCategories] = useState<ChildCategory[]>(() => getInitialCachedData('childcategories', []));
  const [brands, setBrands] = useState<Brand[]>(() => getInitialCachedData('brands', []));
  const [tags, setTags] = useState<Tag[]>(() => getInitialCachedData('tags', []));
  const [courierConfig, setCourierConfig] = useState<CourierConfig>({ apiKey: '', secretKey: '', instruction: '' });

  // === AUTH & USER STATE ===
  const [user, setUser] = useState<User | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [checkoutQuantity, setCheckoutQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantSelection | null>(null);
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [selectedLandingPage, setSelectedLandingPage] = useState<LandingPage | null>(null);

  // === NAVIGATION (from useNavigation hook) ===
  const navigation = useNavigation({ products, user });
  const {
    currentView,
    setCurrentView,
    adminSection,
    setAdminSection,
    urlCategoryFilter,
    selectedProduct,
    setSelectedProduct,
    storeSearchQuery,
    handleStoreSearchChange,
    handleProductClick,
    handleCategoryFilterChange,
    currentViewRef,
  } = navigation;

  // === CHAT (from useChat hook) ===
  const chat = useChat({ activeTenantId, isLoading, user, websiteConfig });
  const {
    isChatOpen,
    isAdminChatOpen,
    chatMessages,
    hasUnreadChat,
    handleCustomerSendChat,
    handleAdminSendChat,
    handleEditChatMessage,
    handleDeleteChatMessage,
    handleOpenChat,
    handleCloseChat,
    handleOpenAdminChat,
    handleCloseAdminChat,
    loadChatMessages,
    resetChatLoaded,
    setChatMessages,
    setHasUnreadChat,
    skipNextChatSaveRef,
    chatMessagesRef,
    isAdminChatOpenRef,
  } = chat;

  // === CART (from useCart hook) ===
  const cart = useCart({ user, products });
  const { cartItems, handleCartToggle, handleAddProductToCart } = cart;

  // === AUTH (from useAuth hook) ===
  const auth = useAuth({
    tenants,
    users,
    activeTenantId,
    setUser,
    setUsers,
    setActiveTenantId,
    setCurrentView: setCurrentView as (view: string) => void,
    setAdminSection,
    setSelectedVariant: () => setSelectedVariant(null),
  });
  const { handleLogin, handleRegister, handleGoogleLogin, handleLogout, handleUpdateProfile } = auth;

  // === THEME EFFECTS ===
  useThemeEffects({ themeConfig, websiteConfig, activeTenantId, isLoading, currentView });
  
  // === FACEBOOK PIXEL ===
  useFacebookPixel(facebookPixelConfig);

  // === REFS FOR PERSISTENCE ===
  const prevLogoRef = useRef<string | null>(null);
  const ordersLoadedRef = useRef(false);
  const prevOrdersRef = useRef<Order[]>([]);
  const prevDeliveryConfigRef = useRef<DeliveryConfig[]>([]);
  const prevLandingPagesRef = useRef<LandingPage[]>([]);
  const initialDataLoadedRef = useRef(false);
  const productsLoadedFromServerRef = useRef(false);
  const prevProductsRef = useRef<Product[]>([]);
  const isFirstProductUpdateRef = useRef(true);
  const catalogLoadedRef = useRef(false);
  const adminDataLoadedRef = useRef(false);
  const userRef = useRef<User | null>(user);

  useEffect(() => { userRef.current = user; }, [user]);

  // === SOCKET ROOM MANAGEMENT ===
  useEffect(() => {
    if (activeTenantId) {
      joinTenantRoom(activeTenantId);
    }
    return () => {
      if (activeTenantId) {
        leaveTenantRoom(activeTenantId);
      }
    };
  }, [activeTenantId]);

  // === SESSION RESTORATION ===
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as User;
      if (parsed) {
        setUser(parsed);
        const tenantInfo = (parsed as unknown as { tenant?: { id?: string; _id?: string } }).tenant;
        const parsedTenantId = parsed.tenantId || tenantInfo?.id || tenantInfo?._id;
        if (parsedTenantId) {
          setActiveTenantId(parsedTenantId);
        }
      }
    } catch (error) {
      console.warn('Unable to restore session', error);
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      window.localStorage.removeItem(ACTIVE_TENANT_STORAGE_KEY);
    }
  }, [setActiveTenantId]);

  // Persist user session
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (user) {
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      window.localStorage.removeItem(ACTIVE_TENANT_STORAGE_KEY);
    }
  }, [user]);

  // Handle user role changes
  useEffect(() => {
    if (!user) {
      if (currentViewRef.current.startsWith('admin')) {
        setCurrentView('store');
        setAdminSection('dashboard');
      }
      return;
    }

    const resolvedTenantId = user.tenantId || activeTenantId || DEFAULT_TENANT_ID;
    if (resolvedTenantId !== activeTenantId) {
      setActiveTenantId(resolvedTenantId);
    }

    if (isAdminRole(user.role) && !currentViewRef.current.startsWith('admin')) {
      setCurrentView('admin');
      setAdminSection('dashboard');
    }
  }, [user, activeTenantId, setActiveTenantId, setCurrentView, setAdminSection, currentViewRef]);

  // === INITIAL DATA LOADING ===
  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      setIsLoading(true);
      let loadError: Error | null = null;
      const startTime = performance.now();
      
      try {
        let resolvedTenantId = activeTenantId;
        if (!resolvedTenantId && hostTenantSlug) {
          const tenantList = await DataService.listTenants();
          if (!isMounted) return;
          const sanitizedSlug = sanitizeSubdomainSlug(hostTenantSlug);
          const matchedTenant = tenantList.find((t) => sanitizeSubdomainSlug(t.subdomain || '') === sanitizedSlug);
          if (matchedTenant) {
            resolvedTenantId = matchedTenant.id;
            setActiveTenantId(resolvedTenantId);
            setHostTenantId(matchedTenant.id);
            setTenants(tenantList);
          } else {
            resolvedTenantId = DEFAULT_TENANT_ID;
            setActiveTenantId(resolvedTenantId);
            setTenants(tenantList);
          }
        }
        
        if (!resolvedTenantId) return;
        
        const [tenantList, bootstrapData] = await Promise.all([
          tenants.length > 0 ? Promise.resolve(tenants) : DataService.listTenants(),
          DataService.bootstrap(resolvedTenantId)
        ]);
        
        console.log(`[Perf] Bootstrap data loaded in ${(performance.now() - startTime).toFixed(0)}ms`);

        if (!isMounted) return;
        
        if (tenants.length === 0) {
          applyTenantList(tenantList);
        }
        
        const normalizedProducts = normalizeProductCollection(bootstrapData.products, resolvedTenantId);
        setProducts(normalizedProducts);
        setThemeConfig(bootstrapData.themeConfig);
        setWebsiteConfig(bootstrapData.websiteConfig);

        // Load secondary data
        const loadSecondaryData = () => {
          if (!isMounted) return;
          DataService.getSecondaryData(resolvedTenantId).then((data) => {
            if (!isMounted) return;
            
            ordersLoadedRef.current = false;
            prevOrdersRef.current = data.orders;
            setOrders(data.orders);
            
            prevLogoRef.current = data.logo;
            setLogo(data.logo);
            
            prevDeliveryConfigRef.current = data.deliveryConfig;
            setDeliveryConfig(data.deliveryConfig);
            
            loadChatMessages(data.chatMessages, activeTenantId);
            
            prevLandingPagesRef.current = data.landingPages;
            setLandingPages(data.landingPages);
            
            setCategories(data.categories);
            setSubCategories(data.subcategories);
            setChildCategories(data.childcategories);
            setBrands(data.brands);
            setTags(data.tags);
            catalogLoadedRef.current = true;
            console.log(`[Perf] Secondary data loaded in ${(performance.now() - startTime).toFixed(0)}ms`);
          }).catch(error => console.warn('Failed to load secondary data', error));
        };
        
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(loadSecondaryData, { timeout: 50 });
        } else {
          setTimeout(loadSecondaryData, 10);
        }
      } catch (error) {
        loadError = error as Error;
        console.error('Failed to load data', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          completeTenantSwitch(loadError);
        }
      }
    };

    loadInitialData();
    return () => { isMounted = false; };
  }, [activeTenantId, hostTenantSlug, tenants.length, applyTenantList, loadChatMessages, completeTenantSwitch, setActiveTenantId, setHostTenantId, setTenants]);

  // === ADMIN DATA LOADING ===
  const loadAdminData = useCallback(async () => {
    if (!activeTenantId) return;
    try {
      const [usersData, rolesData, courierData, facebookPixelData, categoriesData, subCategoriesData, childCategoriesData, brandsData, tagsData] = await Promise.all([
        DataService.getUsers(activeTenantId),
        DataService.getRoles(activeTenantId),
        DataService.get('courier', { apiKey: '', secretKey: '', instruction: '' }, activeTenantId),
        DataService.get<FacebookPixelConfig>('facebook_pixel', { pixelId: '', accessToken: '', enableTestEvent: false, isEnabled: false }, activeTenantId),
        DataService.getCatalog('categories', [], activeTenantId),
        DataService.getCatalog('subcategories', [], activeTenantId),
        DataService.getCatalog('childcategories', [], activeTenantId),
        DataService.getCatalog('brands', [], activeTenantId),
        DataService.getCatalog('tags', [], activeTenantId)
      ]);
      setUsers(usersData);
      setRoles(rolesData);
      setCourierConfig({ apiKey: courierData?.apiKey || '', secretKey: courierData?.secretKey || '', instruction: courierData?.instruction || '' });
      setFacebookPixelConfig(facebookPixelData);
      if (!catalogLoadedRef.current) {
        setCategories(categoriesData);
        setSubCategories(subCategoriesData);
        setChildCategories(childCategoriesData);
        setBrands(brandsData);
        setTags(tagsData);
        catalogLoadedRef.current = true;
      }
    } catch (error) {
      console.warn('Failed to load admin data', error);
    }
  }, [activeTenantId]);

  useEffect(() => {
    if (currentView === 'admin' && !adminDataLoadedRef.current) {
      adminDataLoadedRef.current = true;
      loadAdminData();
    }
  }, [currentView, loadAdminData]);

  useEffect(() => {
    adminDataLoadedRef.current = false;
    prevLogoRef.current = null;
  }, [activeTenantId]);

  // === DATA REFRESH HANDLER ===
  const handleDataRefresh = useCallback(async (key: string, eventTenantId?: string, fromSocket = false) => {
    if (currentViewRef.current.startsWith('admin')) return;
    if (eventTenantId && eventTenantId !== activeTenantIdRef.current) return;

    const tenantId = eventTenantId || activeTenantIdRef.current;
    console.log(`[DataRefresh] Refreshing ${key} for tenant ${tenantId} (fromSocket: ${fromSocket})`);

    try {
      switch (key) {
        case 'products':
          const productsData = await DataService.getProducts(tenantId);
          if (productsData.length > 0 || products.length === 0) {
            isFirstProductUpdateRef.current = true;
            setProducts(normalizeProductCollection(productsData, tenantId));
          }
          break;
        case 'orders':
          const ordersData = await DataService.getOrders(tenantId);
          setOrders(ordersData);
          break;
        case 'logo':
          const logoData = await DataService.get<string | null>('logo', null, tenantId);
          setLogo(logoData);
          break;
        case 'theme':
          const themeData = await DataService.getThemeConfig(tenantId);
          setThemeConfig(themeData);
          break;
        case 'website':
          const websiteData = await DataService.getWebsiteConfig(tenantId);
          setWebsiteConfig(websiteData);
          break;
        case 'delivery':
          const deliveryData = await DataService.getDeliveryConfig(tenantId);
          setDeliveryConfig(deliveryData);
          break;
        case 'categories':
          const categoriesData = await DataService.getCatalog('categories', [], tenantId);
          setCategories(categoriesData);
          break;
        case 'landing_pages':
          const landingData = await DataService.getLandingPages(tenantId);
          setLandingPages(landingData);
          break;
        case 'chat_messages':
          const chatData = await DataService.getChatMessages(tenantId);
          const normalized = Array.isArray(chatData) ? [...chatData] : [];
          normalized.sort((a, b) => (a?.timestamp || 0) - (b?.timestamp || 0));
          skipNextChatSaveRef.current = true;
          setChatMessages(normalized);
          const localIds = new Set(chatMessagesRef.current.map(m => m.id));
          const newCustomerMessages = normalized.filter(m => !localIds.has(m.id) && m.sender === 'customer');
          if (newCustomerMessages.length > 0 && !isAdminChatOpenRef.current && isAdminRole(userRef.current?.role)) {
            setHasUnreadChat(true);
          }
          break;
      }
    } catch (error) {
      console.warn(`[DataRefresh] Failed to refresh ${key}:`, error);
    }
  }, [products.length, skipNextChatSaveRef, chatMessagesRef, isAdminChatOpenRef, setChatMessages, setHasUnreadChat, activeTenantIdRef, currentViewRef]);

  useDataRefreshDebounced(handleDataRefresh, 150);

  // === DATA PERSISTENCE ===
  useEffect(() => { 
    if(!isLoading && activeTenantId) {
      if (isKeyFromSocket('orders', activeTenantId)) {
        clearSocketFlag('orders', activeTenantId);
        prevOrdersRef.current = orders;
        return;
      }
      if (!ordersLoadedRef.current) {
        ordersLoadedRef.current = true;
        prevOrdersRef.current = orders;
        return;
      }
      if (orders.length === 0 && prevOrdersRef.current.length > 0) {
        return;
      }
      if (JSON.stringify(orders) !== JSON.stringify(prevOrdersRef.current)) {
        prevOrdersRef.current = orders;
        DataService.save('orders', orders, activeTenantId);
      }
    }
  }, [orders, isLoading, activeTenantId]);

  useEffect(() => {
    if (!isLoading && activeTenantId) {
      initialDataLoadedRef.current = true;
    }
  }, [isLoading, activeTenantId]);

  useEffect(() => {
    productsLoadedFromServerRef.current = false;
    isFirstProductUpdateRef.current = true;
    ordersLoadedRef.current = false;
    catalogLoadedRef.current = false;
    prevProductsRef.current = [];
    prevOrdersRef.current = [];
  }, [activeTenantId]);

  useEffect(() => { 
    if (isLoading || !initialDataLoadedRef.current || !activeTenantId) return;
    
    if (isKeyFromSocket('products', activeTenantId)) {
      clearSocketFlag('products', activeTenantId);
      prevProductsRef.current = products;
      return;
    }
    
    if (isFirstProductUpdateRef.current) {
      isFirstProductUpdateRef.current = false;
      prevProductsRef.current = products;
      productsLoadedFromServerRef.current = true;
      return;
    }
    
    if (products.length === 0 && prevProductsRef.current.length > 0) {
      return;
    }
    
    if (JSON.stringify(products) === JSON.stringify(prevProductsRef.current)) return;
    
    prevProductsRef.current = products;
    DataService.saveImmediate('products', products, activeTenantId); 
  }, [products, activeTenantId, isLoading]);

  useEffect(() => { if(!isLoading && activeTenantId && adminDataLoadedRef.current && roles.length > 0) DataService.save('roles', roles, activeTenantId); }, [roles, isLoading, activeTenantId]);
  useEffect(() => { if(!isLoading && activeTenantId && adminDataLoadedRef.current && users.length > 0) DataService.save('users', users, activeTenantId); }, [users, isLoading, activeTenantId]);
  
  useEffect(() => {
    if (!activeTenantId || isLoading) return;
    if (logo === prevLogoRef.current) return;
    if (isKeyFromSocket('logo', activeTenantId)) {
      clearSocketFlag('logo', activeTenantId);
      prevLogoRef.current = logo;
      return;
    }
    prevLogoRef.current = logo;
    DataService.save('logo', logo, activeTenantId);
  }, [logo, isLoading, activeTenantId]);
  
  useEffect(() => { 
    if(!isLoading && activeTenantId && deliveryConfig.length > 0) {
      if (JSON.stringify(deliveryConfig) === JSON.stringify(prevDeliveryConfigRef.current)) return;
      prevDeliveryConfigRef.current = deliveryConfig;
      DataService.save('delivery_config', deliveryConfig, activeTenantId);
    }
  }, [deliveryConfig, isLoading, activeTenantId]);

  useEffect(() => { if(!isLoading && activeTenantId && adminDataLoadedRef.current) DataService.save('courier', courierConfig, activeTenantId); }, [courierConfig, isLoading, activeTenantId]);
  useEffect(() => { if(!isLoading && activeTenantId && adminDataLoadedRef.current) DataService.save('facebook_pixel', facebookPixelConfig, activeTenantId); }, [facebookPixelConfig, isLoading, activeTenantId]);
  
  useEffect(() => { if(!isLoading && activeTenantId && catalogLoadedRef.current && categories.length > 0) DataService.save('categories', categories, activeTenantId); }, [categories, isLoading, activeTenantId]);
  useEffect(() => { if(!isLoading && activeTenantId && catalogLoadedRef.current && subCategories.length > 0) DataService.save('subcategories', subCategories, activeTenantId); }, [subCategories, isLoading, activeTenantId]);
  useEffect(() => { if(!isLoading && activeTenantId && catalogLoadedRef.current && childCategories.length > 0) DataService.save('childcategories', childCategories, activeTenantId); }, [childCategories, isLoading, activeTenantId]);
  useEffect(() => { if(!isLoading && activeTenantId && catalogLoadedRef.current && brands.length > 0) DataService.save('brands', brands, activeTenantId); }, [brands, isLoading, activeTenantId]);
  useEffect(() => { if(!isLoading && activeTenantId && catalogLoadedRef.current && tags.length > 0) DataService.save('tags', tags, activeTenantId); }, [tags, isLoading, activeTenantId]);

  useEffect(() => { 
    if(!isLoading && activeTenantId && initialDataLoadedRef.current && landingPages.length > 0) {
      if (JSON.stringify(landingPages) === JSON.stringify(prevLandingPagesRef.current)) return;
      prevLandingPagesRef.current = landingPages;
      DataService.save('landing_pages', landingPages, activeTenantId);
    }
  }, [landingPages, isLoading, activeTenantId]);

  // === ADMIN CHAT VISIBILITY ===
  useEffect(() => {
    if (!currentView.startsWith('admin') && isAdminChatOpen) {
      handleCloseAdminChat();
    }
  }, [currentView, isAdminChatOpen, handleCloseAdminChat]);

  useEffect(() => {
    if (adminSection === 'tenants' && !isPlatformOperator(user?.role)) {
      setAdminSection('dashboard');
    }
  }, [adminSection, user, setAdminSection]);

  // === HANDLERS ===
  const handleAddRole = (newRole: Role) => {
    const scopedRole = { ...newRole, tenantId: newRole.tenantId || activeTenantId };
    setRoles([...roles, scopedRole]);
  };
  const handleUpdateRole = (updatedRole: Role) => {
    const scopedRole = { ...updatedRole, tenantId: updatedRole.tenantId || activeTenantId };
    setRoles(roles.map(r => r.id === scopedRole.id ? scopedRole : r));
  };
  const handleDeleteRole = (roleId: string) => setRoles(roles.filter(r => r.id !== roleId));

  const handleAddProduct = (newProduct: Product) => {
    const tenantId = newProduct.tenantId || activeTenantId;
    const slug = ensureUniqueProductSlug(newProduct.slug || newProduct.name || `product-${newProduct.id}`, products, tenantId, newProduct.id);
    setProducts([...products, { ...newProduct, slug, tenantId }]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    const tenantId = updatedProduct.tenantId || activeTenantId;
    const slug = ensureUniqueProductSlug(updatedProduct.slug || updatedProduct.name || `product-${updatedProduct.id}`, products, tenantId, updatedProduct.id);
    setProducts(products.map(p => p.id === updatedProduct.id ? { ...updatedProduct, slug, tenantId } : p));
  };
  const handleDeleteProduct = (id: number) => setProducts(products.filter(p => p.id !== id));
  const handleBulkDeleteProducts = (ids: number[]) => setProducts(products.filter(p => !ids.includes(p.id)));
  const handleBulkUpdateProducts = (ids: number[], updates: Partial<Product>) => {
    const { slug, ...restUpdates } = updates;
    setProducts(products.map(p => ids.includes(p.id) ? { ...p, ...restUpdates } : p));
  };

  const handleUpdateOrder = (orderId: string, updates: Partial<Order>) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, ...updates, tenantId: o.tenantId || activeTenantId } : o));
  };

  const addToWishlist = (id: number) => { if (!wishlist.includes(id)) setWishlist([...wishlist, id]); };
  const removeFromWishlist = (id: number) => { setWishlist(wishlist.filter(wId => wId !== id)); };
  const isInWishlist = (id: number) => wishlist.includes(id);

  const handleCheckoutStart = (product: Product, quantity: number = 1, variant?: ProductVariantSelection) => {
    setSelectedProduct(product);
    setCheckoutQuantity(quantity);
    setSelectedVariant(ensureVariantSelection(product, variant));
    setCurrentView('checkout');
    if (product.slug) {
      window.history.pushState({ slug: product.slug }, '', `/${product.slug}`);
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCheckoutFromCart = useCallback((productId: number) => {
    const targetProduct = products.find(p => p.id === productId);
    if (!targetProduct) {
      toast.error('Product unavailable for checkout');
      return;
    }
    handleCheckoutStart(targetProduct, 1, ensureVariantSelection(targetProduct));
  }, [products]);

  const handlePlaceOrder = async (formData: any) => {
    const orderId = `#${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: orderId,
      tenantId: activeTenantId,
      customer: formData.fullName,
      location: formData.address,
      amount: formData.amount,
      date: new Date().toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: 'Pending',
      email: formData.email,
      phone: formData.phone,
      division: formData.division,
      variant: ensureVariantSelection(selectedProduct, formData.variant || selectedVariant),
      productId: selectedProduct?.id,
      productName: selectedProduct?.name,
      quantity: formData.quantity || checkoutQuantity,
      deliveryType: formData.deliveryType,
      deliveryCharge: formData.deliveryCharge
    };

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
      const response = await fetch(`${apiBase}/api/orders/${activeTenantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      
      if (response.ok) {
        const result = await response.json();
        setOrders([result.data || newOrder, ...orders]);
      } else {
        setOrders([newOrder, ...orders]);
      }
    } catch (error) {
      setOrders([newOrder, ...orders]);
    }

    setCurrentView('success');
    window.scrollTo(0, 0);
  };

  const handleLandingOrderSubmit = async (payload: LandingCheckoutPayload & { pageId: string; productId: number }) => {
    const product = products.find(p => p.id === payload.productId);
    if (!product) return;
    const orderId = `LP-${Math.floor(10000 + Math.random() * 90000)}`;
    const orderAmount = product.price * payload.quantity;
    const newOrder: Order = {
      id: orderId,
      tenantId: activeTenantId,
      customer: payload.fullName,
      location: payload.address,
      phone: payload.phone,
      amount: orderAmount,
      date: new Date().toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: 'Pending',
      email: payload.email,
      variant: ensureVariantSelection(product),
      productId: product.id,
      productName: product.name,
      quantity: payload.quantity
    };

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
      const response = await fetch(`${apiBase}/api/orders/${activeTenantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      
      if (response.ok) {
        const result = await response.json();
        setOrders(prev => [result.data || newOrder, ...prev]);
      } else {
        setOrders(prev => [newOrder, ...prev]);
      }
    } catch (error) {
      setOrders(prev => [newOrder, ...prev]);
    }
  };

  const handleCloseLandingPreview = () => {
    setSelectedLandingPage(null);
    setCurrentView(isAdminRole(user?.role) ? 'admin' : 'store');
  };

  const handleUpdateLogo = (newLogo: string | null) => setLogo(newLogo);
  const handleUpdateTheme = (newConfig: ThemeConfig) => setThemeConfig(newConfig);
  const handleUpdateWebsiteConfig = (newConfig: WebsiteConfig) => setWebsiteConfig(newConfig);
  const handleUpdateCourierConfig = (config: CourierConfig) => setCourierConfig(config);
  const handleUpdateDeliveryConfig = (configs: DeliveryConfig[]) => setDeliveryConfig(configs);

  const handleTenantChange = useCallback((tenantId: string) => {
    tenant.handleTenantChange(tenantId, {
      onResetChat: resetChatLoaded,
      setUser: (fn) => setUser(fn(user)),
      setCurrentView: setCurrentView as (view: string) => void,
      setAdminSection,
      setSelectedProduct: () => setSelectedProduct(null),
      setSelectedLandingPage: () => setSelectedLandingPage(null),
    });
  }, [tenant, resetChatLoaded, user, setCurrentView, setAdminSection, setSelectedProduct]);

  const handleCreateTenant = useCallback(async (payload: any, options?: { activate?: boolean }) => {
    return tenant.handleCreateTenant(payload, options, handleTenantChange);
  }, [tenant, handleTenantChange]);

  const handleDeleteTenant = useCallback(async (tenantId: string) => {
    return tenant.handleDeleteTenant(tenantId, handleTenantChange);
  }, [tenant, handleTenantChange]);

  // Catalog CRUD handlers
  const attachTenant = <T extends { tenantId?: string }>(item: T): T => ({ ...item, tenantId: item?.tenantId || activeTenantId });

  const createCrudHandler = (setter: React.Dispatch<React.SetStateAction<any[]>>, storageKey: string) => ({
    add: (item: any) => {
      setter(prev => {
        const updated = [...prev, attachTenant(item)];
        DataService.save(storageKey, updated, activeTenantId);
        return updated;
      });
    },
    update: (item: any) => {
      setter(prev => {
        const updated = prev.map(i => i.id === item.id ? attachTenant(item) : i);
        DataService.save(storageKey, updated, activeTenantId);
        return updated;
      });
    },
    delete: (id: string) => {
      setter(prev => {
        const updated = prev.filter(i => i.id !== id);
        DataService.save(storageKey, updated, activeTenantId);
        return updated;
      });
    }
  });

  const catHandlers = createCrudHandler(setCategories, 'categories');
  const subCatHandlers = createCrudHandler(setSubCategories, 'subcategories');
  const childCatHandlers = createCrudHandler(setChildCategories, 'childcategories');
  const brandHandlers = createCrudHandler(setBrands, 'brands');
  const tagHandlers = createCrudHandler(setTags, 'tags');

  // Computed values
  const platformOperator = isPlatformOperator(user?.role);
  const canAccessAdminChat = isAdminRole(user?.role);
  const selectedTenantRecord = tenants.find(t => t.id === activeTenantId) || tenantsRef.current.find(t => t.id === activeTenantId) || null;
  const isTenantLockedByHost = Boolean(hostTenantId);
  const scopedTenants = isTenantLockedByHost ? tenants.filter((t) => t.id === hostTenantId) : tenants;
  const headerTenants = platformOperator ? scopedTenants : (selectedTenantRecord ? [selectedTenantRecord] : []);

  // === RENDER ===
  return (
    <ThemeProvider themeConfig={themeConfig || undefined}>
      <Suspense fallback={null}>
        <Suspense fallback={null}>
          <Toaster position="top-right" toastOptions={{ duration: 2500 }} />
        </Suspense>
        <div className={`relative ${themeConfig?.darkMode ? 'dark bg-slate-900' : 'bg-gray-50'}`}>
          {isLoginOpen && <LoginModal onClose={() => setIsLoginOpen(false)} onLogin={handleLogin} onRegister={handleRegister} onGoogleLogin={handleGoogleLogin} />}

          {currentView === 'admin-login' ? (
            <Suspense fallback={null}>
              <AdminLogin onLoginSuccess={(user) => {
                setUser(user);
                setActiveTenantId(user.tenantId || activeTenantId || DEFAULT_TENANT_ID);
                setCurrentView('admin');
                setAdminSection('dashboard');
                window.history.pushState({}, '', '/admin');
              }} />
            </Suspense>
          ) : currentView === 'admin' ? (
            <Suspense fallback={null}>
              <AdminAppWithAuth
                activeTenantId={activeTenantId}
                tenants={headerTenants}
                orders={orders}
                products={products}
                logo={logo}
                themeConfig={themeConfig}
                websiteConfig={websiteConfig}
                deliveryConfig={deliveryConfig}
                courierConfig={courierConfig}
                facebookPixelConfig={facebookPixelConfig}
                chatMessages={chatMessages}
                onLogout={handleLogout}
                onUpdateOrder={handleUpdateOrder}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                onBulkDeleteProducts={handleBulkDeleteProducts}
                onBulkUpdateProducts={handleBulkUpdateProducts}
                onUpdateLogo={handleUpdateLogo}
                onUpdateTheme={handleUpdateTheme}
                onUpdateWebsiteConfig={handleUpdateWebsiteConfig}
                onUpdateDeliveryConfig={handleUpdateDeliveryConfig}
                onUpdateCourierConfig={handleUpdateCourierConfig}
                onUpdateProfile={handleUpdateProfile}
                onTenantChange={handleTenantChange}
                isTenantSwitching={isTenantSwitching}
                onSwitchToStore={() => setCurrentView('store')}
                onOpenAdminChat={handleOpenAdminChat}
                hasUnreadChat={hasUnreadChat}
                onCreateTenant={handleCreateTenant}
                onDeleteTenant={handleDeleteTenant}
                onRefreshTenants={refreshTenants}
                isTenantCreating={isTenantSeeding}
                deletingTenantId={deletingTenantId}
              />
            </Suspense>
          ) : (
            <>
              {currentView === 'store' && (
                <Suspense fallback={<StorePageSkeleton />}>
                  <>
                    <StoreHome 
                      products={products} 
                      orders={orders} 
                      onProductClick={handleProductClick} 
                      onQuickCheckout={(product, quantity, variant) => handleCheckoutStart(product, quantity, variant)} 
                      onImageSearchClick={() => setCurrentView('image-search')}
                      wishlistCount={wishlist.length} 
                      wishlist={wishlist} 
                      onToggleWishlist={(id) => isInWishlist(id) ? removeFromWishlist(id) : addToWishlist(id)} 
                      user={user} 
                      onLoginClick={() => setIsLoginOpen(true)} 
                      onLogoutClick={handleLogout} 
                      onProfileClick={() => setCurrentView('profile')} 
                      logo={logo} 
                      websiteConfig={websiteConfig} 
                      searchValue={storeSearchQuery} 
                      onSearchChange={handleStoreSearchChange} 
                      onOpenChat={handleOpenChat}
                      cart={cartItems}
                      onToggleCart={handleCartToggle}
                      onCheckoutFromCart={handleCheckoutFromCart}
                      onAddToCart={(product, quantity, variant) => handleAddProductToCart(product, quantity, variant)}
                      categories={categories}
                      subCategories={subCategories}
                      childCategories={childCategories}
                      brands={brands}
                      tags={tags}
                      initialCategoryFilter={urlCategoryFilter}
                      onCategoryFilterChange={handleCategoryFilterChange}
                    />
                    <MobileBottomNav 
                      onHomeClick={() => { setCurrentView('store'); window.scrollTo(0,0); }}
                      onCartClick={() => {}}
                      onAccountClick={() => user ? setCurrentView('profile') : setIsLoginOpen(true)}
                      cartCount={cartItems.length}
                      websiteConfig={websiteConfig}
                      onChatClick={handleOpenChat}
                      user={user}
                      onLogoutClick={handleLogout}
                    />
                  </>
                </Suspense>
              )}
              {currentView === 'detail' && selectedProduct && (
                <Suspense fallback={null}>
                  <StoreProductDetail 
                    product={selectedProduct} 
                    orders={orders} 
                    onBack={() => setCurrentView('store')} 
                    onProductClick={handleProductClick} 
                    wishlistCount={wishlist.length} 
                    isWishlisted={isInWishlist(selectedProduct.id)} 
                    onToggleWishlist={() => isInWishlist(selectedProduct.id) ? removeFromWishlist(selectedProduct.id) : addToWishlist(selectedProduct.id)} 
                    onCheckout={handleCheckoutStart} 
                    user={user} 
                    onLoginClick={() => setIsLoginOpen(true)} 
                    onLogoutClick={handleLogout} 
                    onProfileClick={() => setCurrentView('profile')} 
                    onImageSearchClick={() => setCurrentView('image-search')}
                    logo={logo} 
                    websiteConfig={websiteConfig} 
                    searchValue={storeSearchQuery} 
                    onSearchChange={handleStoreSearchChange} 
                    onOpenChat={handleOpenChat}
                    cart={cartItems}
                    onToggleCart={handleCartToggle}
                    onCheckoutFromCart={handleCheckoutFromCart}
                    onAddToCart={(product, quantity, variant) => handleAddProductToCart(product, quantity, variant, { silent: true })}
                    productCatalog={products}
                  />
                </Suspense>
              )}
              {currentView === 'checkout' && selectedProduct && (
                <Suspense fallback={null}>
                  <StoreCheckout 
                    product={selectedProduct}
                    quantity={checkoutQuantity}
                    variant={selectedVariant || ensureVariantSelection(selectedProduct)}
                    onBack={() => setCurrentView('detail')}
                    onConfirmOrder={handlePlaceOrder}
                    user={user}
                    onLoginClick={() => setIsLoginOpen(true)}
                    onLogoutClick={handleLogout}
                    onProfileClick={() => setCurrentView('profile')}
                    onImageSearchClick={() => setCurrentView('image-search')}
                    logo={logo}
                    websiteConfig={websiteConfig}
                    deliveryConfigs={deliveryConfig}
                    searchValue={storeSearchQuery}
                    onSearchChange={handleStoreSearchChange}
                    onOpenChat={handleOpenChat}
                    cart={cartItems}
                    onToggleCart={handleCartToggle}
                    onCheckoutFromCart={handleCheckoutFromCart}
                    productCatalog={products}
                  />
                </Suspense>
              )}
              {currentView === 'success' && (
                <Suspense fallback={null}>
                  <StoreOrderSuccess 
                    onHome={() => setCurrentView('store')} 
                    onImageSearchClick={() => setCurrentView('image-search')}
                    user={user} 
                    onLoginClick={() => setIsLoginOpen(true)} 
                    onLogoutClick={handleLogout} 
                    onProfileClick={() => setCurrentView('profile')} 
                    logo={logo} 
                    websiteConfig={websiteConfig} 
                    searchValue={storeSearchQuery} 
                    onSearchChange={handleStoreSearchChange} 
                    onOpenChat={handleOpenChat}
                    cart={cartItems}
                    onToggleCart={handleCartToggle}
                    onCheckoutFromCart={handleCheckoutFromCart}
                    productCatalog={products}
                  />
                </Suspense>
              )}
              {currentView === 'profile' && user && (
                <Suspense fallback={null}>
                  <>
                    <StoreProfile 
                      user={user} 
                      onUpdateProfile={handleUpdateProfile} 
                      orders={orders} 
                      onHome={() => setCurrentView('store')} 
                      onLoginClick={() => setIsLoginOpen(true)} 
                      onLogoutClick={handleLogout} 
                      onImageSearchClick={() => setCurrentView('image-search')}
                      logo={logo} 
                      websiteConfig={websiteConfig} 
                      searchValue={storeSearchQuery} 
                      onSearchChange={handleStoreSearchChange} 
                      onOpenChat={handleOpenChat}
                      cart={cartItems}
                      onToggleCart={handleCartToggle}
                      onCheckoutFromCart={handleCheckoutFromCart}
                      productCatalog={products}
                    />
                    <MobileBottomNav 
                      onHomeClick={() => { setCurrentView('store'); window.scrollTo(0,0); }}
                      onCartClick={() => {}}
                      onAccountClick={() => {}}
                      cartCount={cartItems.length}
                      websiteConfig={websiteConfig}
                      onChatClick={handleOpenChat}
                      user={user}
                      onLogoutClick={handleLogout}
                      activeTab="account"
                    />
                  </>
                </Suspense>
              )}
              {currentView === 'landing_preview' && selectedLandingPage && (
                <Suspense fallback={null}>
                  <LandingPagePreview 
                    page={selectedLandingPage}
                    product={selectedLandingPage.productId ? products.find(p => p.id === selectedLandingPage.productId) : undefined}
                    onBack={handleCloseLandingPreview}
                    onSubmitLandingOrder={handleLandingOrderSubmit}
                  />
                </Suspense>
              )}
              <StoreChatModal
                isOpen={isChatOpen}
                onClose={handleCloseChat}
                websiteConfig={websiteConfig}
                themeConfig={themeConfig}
                user={user}
                messages={chatMessages}
                onSendMessage={handleCustomerSendChat}
                context="customer"
                onEditMessage={handleEditChatMessage}
                onDeleteMessage={handleDeleteChatMessage}
              />
            </>
          )}
        </div>
        {canAccessAdminChat && (
          <StoreChatModal
            isOpen={Boolean(isAdminChatOpen && currentView.startsWith('admin'))}
            onClose={handleCloseAdminChat}
            websiteConfig={websiteConfig}
            themeConfig={themeConfig}
            user={user}
            messages={chatMessages}
            onSendMessage={handleAdminSendChat}
            context="admin"
            onEditMessage={handleEditChatMessage}
            onDeleteMessage={handleDeleteChatMessage}
            canDeleteAll
          />
        )}
      </Suspense>
    </ThemeProvider>
  );
};

export default App;
