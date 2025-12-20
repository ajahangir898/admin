
import React, { useState, useEffect, lazy, Suspense, useCallback, useRef, useMemo, memo } from 'react';
import { Store, ShieldCheck } from 'lucide-react';
import type { Product, Order, User, ThemeConfig, WebsiteConfig, DeliveryConfig, ProductVariantSelection, LandingPage, FacebookPixelConfig, CourierConfig, Tenant, ChatMessage, Role, Category, SubCategory, ChildCategory, Brand, Tag, CreateTenantPayload } from './types';
import type { LandingCheckoutPayload } from './components/LandingPageComponents';
import { StoreSkeleton, AdminSkeleton, LoginSkeleton, ProductDetailSkeleton, CheckoutSkeleton, ProfileSkeleton } from './components/SkeletonLoaders';
import { DataService, joinTenantRoom, leaveTenantRoom, isKeyFromSocket, clearSocketFlag } from './services/DataService';
import { useDataRefreshDebounced } from './hooks/useDataRefresh';
import { slugify } from './services/slugify';
import { DEFAULT_TENANT_ID, RESERVED_TENANT_SLUGS } from './constants';
import { toast } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';



// Lazy load notification service (only needed for orders)
const getNotificationService = () => import('./backend/src/services/NotificationService').then(m => m.notificationService);

// Lazy load Toaster for faster initial render
const Toaster = lazy(() => import('react-hot-toast').then(m => ({ default: m.Toaster })));

// Store pages - lazy loaded with preload
const StoreHome = lazy(() => import('./pages/StoreHome'));
const StoreProductDetail = lazy(() => import('./pages/StoreProductDetail'));
const StoreCheckout = lazy(() => import('./pages/StoreCheckout'));
const StoreOrderSuccess = lazy(() => import('./pages/StoreOrderSuccess'));
const StoreProfile = lazy(() => import('./pages/StoreProfile'));
const LandingPagePreview = lazy(() => import('./pages/LandingPagePreview'));

// Admin pages - lazy loaded (only load when needed)
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminAppWithAuth = lazy(() => {
  // Preload admin chunks when admin is accessed
  import('./pages/AdminApp').then(m => m.preloadAdminChunks?.());
  return import('./pages/AdminAppWithAuth');
});

// Store components - lazy loaded with chunk naming
const loadStoreComponents = () => import(/* webpackChunkName: "store-components" */ './components/StoreComponents');
const LoginModal = lazy(() => loadStoreComponents().then(module => ({ default: module.LoginModal })));
const MobileBottomNav = lazy(() => loadStoreComponents().then(module => ({ default: module.MobileBottomNav })));
const StoreChatModal = lazy(() => loadStoreComponents().then(module => ({ default: module.StoreChatModal })));

// Preload critical chunks IMMEDIATELY (not on idle) for faster store load
if (typeof window !== 'undefined') {
  // Start preloading immediately - don't wait for idle
  const preloadPromise = Promise.all([
    import('./pages/StoreHome'),
    import('./components/StoreComponents')
  ]);
  // Store promise for potential future use
  (window as any).__storePreload = preloadPromise;
}

type ViewState = 'store' | 'detail' | 'checkout' | 'success' | 'profile' | 'admin' | 'landing_preview' | 'image-search' | 'admin-login';

const sanitizeSubdomainSlug = (value?: string | null) => {
  if (!value) return '';
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, '')
    .slice(0, 63);
};

const normalizeDomainValue = (value?: string | null) => {
  if (!value) return '';
  return value
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');
};

const PRIMARY_TENANT_DOMAIN = normalizeDomainValue(import.meta.env.VITE_PRIMARY_DOMAIN);
const DEFAULT_TENANT_SLUG = sanitizeSubdomainSlug(import.meta.env.VITE_DEFAULT_TENANT_SLUG);

const isReservedTenantSlug = (slug?: string | null) => {
  if (!slug) return false;
  return RESERVED_TENANT_SLUGS.includes(sanitizeSubdomainSlug(slug));
};

const getHostTenantSlug = (): string | null => {
  if (typeof window === 'undefined') return null;
  const hostname = window.location.hostname?.toLowerCase() || '';
  const params = new URLSearchParams(window.location.search);
  const forcedSlug = sanitizeSubdomainSlug(params.get('tenant'));
  if (forcedSlug && !isReservedTenantSlug(forcedSlug)) {
    return forcedSlug;
  }

  const hostSegments = hostname.split('.');
  const isLocalhost = hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.startsWith('127.');

  if (isLocalhost) {
    if (hostSegments.length > 1) {
      const candidate = sanitizeSubdomainSlug(hostSegments[0]);
      return candidate || null;
    }
    return DEFAULT_TENANT_SLUG || null;
  }

  if (PRIMARY_TENANT_DOMAIN) {
    if (hostname === PRIMARY_TENANT_DOMAIN || hostname === `www.${PRIMARY_TENANT_DOMAIN}`) {
      return DEFAULT_TENANT_SLUG || null;
    }
    if (hostname.endsWith(`.${PRIMARY_TENANT_DOMAIN}`)) {
      const subdomain = hostname.slice(0, hostname.length - (PRIMARY_TENANT_DOMAIN.length + 1));
      const candidate = sanitizeSubdomainSlug(subdomain);
      if (!candidate || isReservedTenantSlug(candidate)) return null;
      return candidate;
    }
  }

  if (hostSegments.length > 2) {
    const candidate = sanitizeSubdomainSlug(hostSegments[0]);
    if (!candidate || isReservedTenantSlug(candidate)) return null;
    return candidate;
  }

  return DEFAULT_TENANT_SLUG || null;
};

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 0, 0';
};

const FALLBACK_VARIANT: ProductVariantSelection = { color: 'Default', size: 'Standard' };
const SESSION_STORAGE_KEY = 'seven-days-user';
const CART_STORAGE_KEY = 'seven-days-cart';

const getAuthErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Something went wrong. Please try again.';
};

const ensureUniqueProductSlug = (desired: string, list: Product[], tenantId?: string, ignoreId?: number) => {
  const base = slugify(desired || '').replace(/--+/g, '-') || `product-${Date.now()}`;
  let candidate = base;
  let counter = 2;
  const hasConflict = (slugValue: string) => list.some(p => {
    const sameTenant = tenantId ? p.tenantId === tenantId : true;
    return sameTenant && p.slug === slugValue && p.id !== ignoreId;
  });
  while (hasConflict(candidate)) {
    candidate = `${base}-${counter++}`;
  }
  return candidate;
};

const normalizeProductCollection = (items: Product[], tenantId?: string): Product[] => {
  const normalized: Product[] = [];
  items.forEach(item => {
    const slugSource = item.slug || item.name || `product-${item.id}`;
    const scopedTenantId = item.tenantId || tenantId;
    const slug = ensureUniqueProductSlug(slugSource, normalized, scopedTenantId, item.id);
    normalized.push({ ...item, slug, tenantId: scopedTenantId });
  });
  return normalized;
};

const SuspenseFallback = memo(({ variant = 'store' }: { variant?: 'store' | 'admin' | 'login' }) => {
  if (variant === 'login') return <LoginSkeleton />;
  if (variant === 'admin') return <AdminSkeleton />;
  return <StoreSkeleton />;
});
SuspenseFallback.displayName = 'SuspenseFallback';

// Simple skeletons for pages without dedicated skeleton components
const OrderSuccessSkeleton = memo(() => <StoreSkeleton />);
OrderSuccessSkeleton.displayName = 'OrderSuccessSkeleton';

const LandingPageSkeleton = memo(() => <StoreSkeleton />);
LandingPageSkeleton.displayName = 'LandingPageSkeleton';

const isAdminRole = (role?: User['role'] | null) => role === 'admin' || role === 'tenant_admin' || role === 'super_admin';
const isPlatformOperator = (role?: User['role'] | null) => role === 'super_admin';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [activeTenantId, setActiveTenantId] = useState<string>(DEFAULT_TENANT_ID);
  const [hostTenantSlug] = useState<string | null>(() => getHostTenantSlug());
  const [hostTenantId, setHostTenantId] = useState<string | null>(null);

  // --- STATE ---
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [logo, setLogo] = useState<string | null>(null);
  // Theme config starts as null - will be loaded from server for each tenant
  const [themeConfig, setThemeConfig] = useState<ThemeConfig | null>(null);
  const [websiteConfig, setWebsiteConfig] = useState<WebsiteConfig | undefined>(undefined);
  const [deliveryConfig, setDeliveryConfig] = useState<DeliveryConfig[]>([]);
  const [facebookPixelConfig, setFacebookPixelConfig] = useState<FacebookPixelConfig>({
    pixelId: '',
    accessToken: '',
    enableTestEvent: false,
    isEnabled: false
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // Catalog State
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [childCategories, setChildCategories] = useState<ChildCategory[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  // Courier Config
  const [courierConfig, setCourierConfig] = useState<CourierConfig>({ apiKey: '', secretKey: '', instruction: '' });

  // Auth & Navigation
  const [user, setUser] = useState<User | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAdminChatOpen, setIsAdminChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [hasUnreadChat, setHasUnreadChat] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('store');
  const [adminSection, setAdminSection] = useState('dashboard');
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [storeSearchQuery, setStoreSearchQuery] = useState('');
  const [urlCategoryFilter, setUrlCategoryFilter] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutQuantity, setCheckoutQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantSelection | null>(null);
  const [cartItems, setCartItems] = useState<number[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = window.localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Unable to parse stored cart', error);
      return [];
    }
  });
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [selectedLandingPage, setSelectedLandingPage] = useState<LandingPage | null>(null);
  const [isTenantSwitching, setIsTenantSwitching] = useState(false);
  const [isTenantSeeding, setIsTenantSeeding] = useState(false);
  const [deletingTenantId, setDeletingTenantId] = useState<string | null>(null);
  const tenantSwitchTargetRef = useRef<string | null>(null);
  const tenantsRef = useRef<Tenant[]>([]);
  const currentViewRef = useRef<ViewState>(currentView);
  const userRef = useRef<User | null>(user);
  const chatGreetingSeedRef = useRef<string | null>(null);
  const chatMessagesRef = useRef<ChatMessage[]>([]);
  const isAdminChatOpenRef = useRef(false);
  const chatSyncLockRef = useRef(false);
  const skipNextChatSaveRef = useRef(false);
  const chatMessagesLoadedRef = useRef(false);
  const hostTenantSlugRef = useRef<string | null>(hostTenantSlug);
  const hostTenantWarningRef = useRef(false);
  const activeTenantIdRef = useRef<string>(activeTenantId);

  useEffect(() => {
    tenantsRef.current = tenants;
  }, [tenants]);

  useEffect(() => {
    currentViewRef.current = currentView;
  }, [currentView]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    chatMessagesRef.current = chatMessages;
  }, [chatMessages]);

  useEffect(() => {
    isAdminChatOpenRef.current = isAdminChatOpen;
  }, [isAdminChatOpen]);

  // Listen for notification click navigation events
  useEffect(() => {
    const handleNavigateToOrder = (event: CustomEvent<{ orderId: string; tenantId?: string }>) => {
      const { orderId } = event.detail;
      console.log('[App] Navigate to order:', orderId);
      // Switch to admin view and orders section
      setCurrentView('admin');
      setAdminSection('orders');
      // Store the order ID to highlight/scroll to it
      window.sessionStorage.setItem('highlightOrderId', orderId);
    };
    
    window.addEventListener('navigate-to-order', handleNavigateToOrder as EventListener);
    return () => {
      window.removeEventListener('navigate-to-order', handleNavigateToOrder as EventListener);
    };
  }, []);

  useEffect(() => {
    chatGreetingSeedRef.current = null;
  }, [activeTenantId]);

  useEffect(() => {
    activeTenantIdRef.current = activeTenantId;
    // Join Socket.IO room for real-time updates
    if (activeTenantId) {
      joinTenantRoom(activeTenantId);
    }
    return () => {
      if (activeTenantId) {
        leaveTenantRoom(activeTenantId);
      }
    };
  }, [activeTenantId]);

  useEffect(() => {
    hostTenantSlugRef.current = hostTenantSlug;
  }, [hostTenantSlug]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.warn('Unable to persist cart locally', error);
    }
  }, [cartItems]);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const remoteCart = await DataService.get('cart', [], user.id);
        if (!cancelled && Array.isArray(remoteCart)) {
          setCartItems(remoteCart);
        }
      } catch (error) {
        console.warn('Failed to load remote cart', error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const persistCartRemotely = useCallback(async (items: number[]) => {
    if (!user?.id) return;
    try {
      await DataService.save('cart', items, user.id);
    } catch (error) {
      console.warn('Failed to sync cart', error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    void persistCartRemotely(cartItems);
  }, [cartItems, persistCartRemotely, user?.id]);

  const applyTenantList = useCallback((tenantList: Tenant[]) => {
    setTenants(tenantList);
    const desiredSlug = hostTenantSlugRef.current ? sanitizeSubdomainSlug(hostTenantSlugRef.current) : '';
    const matchedTenant = desiredSlug
      ? tenantList.find((tenant) => sanitizeSubdomainSlug(tenant.subdomain || '') === desiredSlug)
      : undefined;

    setHostTenantId(matchedTenant ? matchedTenant.id : null);

    if (desiredSlug && !matchedTenant && !hostTenantWarningRef.current) {
      toast.error(`No storefront configured for ${desiredSlug}.`);
      hostTenantWarningRef.current = true;
    }

    const activeId = activeTenantIdRef.current;
    const activeExists = tenantList.some((tenant) => tenant.id === activeId);

    if (matchedTenant) {
      if (matchedTenant.id !== activeId) {
        setActiveTenantId(matchedTenant.id);
      }
      return;
    }

    if (!activeExists && tenantList.length) {
      setActiveTenantId(tenantList[0].id);
    }
  }, []);

  const refreshTenants = useCallback(async () => {
    const tenantList = await DataService.listTenants();
    applyTenantList(tenantList);
    return tenantList;
  }, [applyTenantList]);

  useEffect(() => {
    if (!hostTenantSlug) return;
    if (hostTenantId) return;
    const desiredSlug = sanitizeSubdomainSlug(hostTenantSlug);
    if (!desiredSlug) return;
    const matchedTenant = tenants.find((tenant) => sanitizeSubdomainSlug(tenant.subdomain || '') === desiredSlug);
    if (matchedTenant) {
      setHostTenantId(matchedTenant.id);
      if (matchedTenant.id !== activeTenantIdRef.current) {
        setActiveTenantId(matchedTenant.id);
      }
    }
  }, [hostTenantSlug, hostTenantId, tenants]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as User;
      if (parsed) {
        setUser(parsed);
        if (parsed.tenantId) {
          setActiveTenantId(parsed.tenantId);
        }
      }
    } catch (error) {
      console.warn('Unable to restore session', error);
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (user) {
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, [user]);

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
  }, [user, activeTenantId]);

  // --- INITIAL DATA LOADING (OPTIMIZED: Parallel tenant + data loading) ---
  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      if (!activeTenantId) return;
      setIsLoading(true);
      let loadError: Error | null = null;
      const startTime = performance.now();
      
      try {
        // Load tenants AND bootstrap data in parallel (2 requests instead of 4)
        const [tenantList, bootstrapData] = await Promise.all([
          DataService.listTenants(),
          DataService.bootstrap(activeTenantId)
        ]);
        
        console.log(`[Perf] Bootstrap data loaded in ${(performance.now() - startTime).toFixed(0)}ms`);

        if (!isMounted) return;
        
        // Apply tenants
        applyTenantList(tenantList);
        
        // Apply critical store data immediately
        const normalizedProducts = normalizeProductCollection(bootstrapData.products, activeTenantId);
        setProducts(normalizedProducts);
        setThemeConfig(bootstrapData.themeConfig);
        setWebsiteConfig(bootstrapData.websiteConfig);

        // DEFERRED: Load secondary data immediately after critical data (no delay)
        // Using requestIdleCallback for better scheduling when browser is idle
        const loadSecondaryData = () => {
          if (!isMounted) return;
          Promise.all([
            DataService.getOrders(activeTenantId),
            DataService.get<string | null>('logo', null, activeTenantId),
            DataService.getDeliveryConfig(activeTenantId),
            DataService.get<ChatMessage[]>('chat_messages', [], activeTenantId),
            DataService.getLandingPages(activeTenantId),
            DataService.getCatalog('categories', [], activeTenantId),
            DataService.getCatalog('subcategories', [], activeTenantId),
            DataService.getCatalog('childcategories', [], activeTenantId),
            DataService.getCatalog('brands', [], activeTenantId),
            DataService.getCatalog('tags', [], activeTenantId)
          ]).then(([ordersData, logoData, deliveryData, chatMessagesData, landingPagesData, categoriesData, subCategoriesData, childCategoriesData, brandsData, tagsData]) => {
            if (!isMounted) return;
            setOrders(ordersData);
            setLogo(logoData);
            setDeliveryConfig(deliveryData);
            const hydratedMessages = Array.isArray(chatMessagesData) ? chatMessagesData : [];
            skipNextChatSaveRef.current = true;
            chatMessagesLoadedRef.current = true;
            setChatMessages(hydratedMessages);
            chatGreetingSeedRef.current = hydratedMessages.length ? (activeTenantId || 'default') : null;
            // Check for unread customer messages on initial load for admins
            const hasCustomerMessages = hydratedMessages.some(m => m.sender === 'customer');
            setHasUnreadChat(false); // Reset on load
            setIsAdminChatOpen(false);
            setLandingPages(landingPagesData);
            setCategories(categoriesData);
            setSubCategories(subCategoriesData);
            setChildCategories(childCategoriesData);
            setBrands(brandsData);
            setTags(tagsData);
            console.log(`[Perf] Secondary data loaded in ${(performance.now() - startTime).toFixed(0)}ms`);
          }).catch(error => console.warn('Failed to load deferred data', error));
        };
        
        // Use requestIdleCallback if available, otherwise use minimal setTimeout
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
          if (tenantSwitchTargetRef.current === activeTenantId) {
            setIsTenantSwitching(false);
            if (loadError) {
              toast.error('Unable to switch tenants. Please try again.');
            } else {
              const switchedTenant = tenantsRef.current.find((tenant) => tenant.id === activeTenantId);
              toast.success(`Now viewing ${switchedTenant?.name || 'selected tenant'}`);
            }
            tenantSwitchTargetRef.current = null;
          }
        }
      }
    };

    loadInitialData();
    return () => { isMounted = false; };
  }, [activeTenantId, applyTenantList]);

  // Load admin-only data when entering admin view (deferred)
  const loadAdminData = useCallback(async () => {
    if (!activeTenantId) return;
    try {
      const [usersData, rolesData, courierData, facebookPixelData, categoriesData, subCategoriesData, childCategoriesData, brandsData, tagsData] = await Promise.all([
        DataService.getUsers(activeTenantId),
        DataService.getRoles(activeTenantId),
        DataService.get('courier', { apiKey: '', secretKey: '', instruction: '' }, activeTenantId),
        DataService.get<FacebookPixelConfig>('facebook_pixel', { pixelId: '', accessToken: '', enableTestEvent: false, isEnabled: false }, activeTenantId),
        DataService.getCatalog('categories', [{ id: '1', name: 'Phones', icon: '', status: 'Active' }, { id: '2', name: 'Watches', icon: '', status: 'Active' }], activeTenantId),
        DataService.getCatalog('subcategories', [{ id: '1', categoryId: '1', name: 'Smartphones', status: 'Active' }, { id: '2', categoryId: '1', name: 'Feature Phones', status: 'Active' }], activeTenantId),
        DataService.getCatalog('childcategories', [], activeTenantId),
        DataService.getCatalog('brands', [{ id: '1', name: 'Apple', logo: '', status: 'Active' }, { id: '2', name: 'Samsung', logo: '', status: 'Active' }], activeTenantId),
        DataService.getCatalog('tags', [{ id: '1', name: 'Flash Deal', status: 'Active' }, { id: '2', name: 'New Arrival', status: 'Active' }], activeTenantId)
      ]);
      setUsers(usersData);
      setRoles(rolesData);
      setCourierConfig({ apiKey: courierData?.apiKey || '', secretKey: courierData?.secretKey || '', instruction: courierData?.instruction || '' });
      setFacebookPixelConfig(facebookPixelData);
      setCategories(categoriesData);
      setSubCategories(subCategoriesData);
      setChildCategories(childCategoriesData);
      setBrands(brandsData);
      setTags(tagsData);
    } catch (error) {
      console.warn('Failed to load admin data', error);
    }
  }, [activeTenantId]);

  // Load admin data only when admin view is accessed
  const adminDataLoadedRef = useRef(false);
  useEffect(() => {
    if (currentView === 'admin' && !adminDataLoadedRef.current) {
      adminDataLoadedRef.current = true;
      loadAdminData();
    }
  }, [currentView, loadAdminData]);

  // Reset admin data flag on tenant change
  useEffect(() => {
    adminDataLoadedRef.current = false;
    websiteConfigLoadedRef.current = false;
  }, [activeTenantId]);

  // --- DATA REFRESH HANDLER (Sync Admin changes to Storefront) ---
  const handleDataRefresh = useCallback(async (key: string, eventTenantId?: string, fromSocket = false) => {
    // Only refresh if we're viewing the store and the update is for our tenant
    if (currentViewRef.current.startsWith('admin')) return;
    if (eventTenantId && eventTenantId !== activeTenantIdRef.current) return;

    const tenantId = eventTenantId || activeTenantIdRef.current;
    console.log(`[DataRefresh] Refreshing ${key} for tenant ${tenantId} (fromSocket: ${fromSocket})`);

    try {
      switch (key) {
        case 'products':
          const productsData = await DataService.getProducts(tenantId);
          // Safety: Don't overwrite existing products with empty array
          if (productsData.length > 0 || products.length === 0) {
            isFirstProductUpdateRef.current = true; // Prevent save after socket update
            setProducts(normalizeProductCollection(productsData, tenantId));
          } else {
            console.warn('[DataRefresh] Skipped setting empty products - keeping existing data');
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
          // Real-time chat update - always refresh chat messages when update received
          // Use refs to avoid stale closure issues
          {
            const chatData = await DataService.getChatMessages(tenantId);
            const normalized = Array.isArray(chatData) ? [...chatData] : [];
            normalized.sort((a, b) => (a?.timestamp || 0) - (b?.timestamp || 0));
            skipNextChatSaveRef.current = true;
            setChatMessages(normalized);
            // Check for unread messages from customer (for admin notification)
            const localIds = new Set(chatMessagesRef.current.map(m => m.id));
            const newCustomerMessages = normalized.filter(m => !localIds.has(m.id) && m.sender === 'customer');
            if (newCustomerMessages.length > 0 && !isAdminChatOpenRef.current && isAdminRole(userRef.current?.role)) {
              setHasUnreadChat(true);
            }
          }
          break;
        case 'popups':
          // Popups are loaded in StoreHome directly, trigger re-render
          break;
        default:
          // For other keys, do nothing special
          break;
      }
    } catch (error) {
      console.warn(`[DataRefresh] Failed to refresh ${key}:`, error);
    }
  }, []);

  // Subscribe to data refresh events with 150ms debounce for faster updates
  useDataRefreshDebounced(handleDataRefresh, 150);

  // --- PERSISTENCE WRAPPERS (Simulating DB Writes) ---
  const ordersLoadedRef = useRef(false);
  const prevOrdersRef = useRef<Order[]>([]);
  
  useEffect(() => { 
    if(!isLoading && activeTenantId) {
      // Skip if this update came from socket
      if (isKeyFromSocket('orders', activeTenantId)) {
        clearSocketFlag('orders', activeTenantId);
        prevOrdersRef.current = orders;
        console.log('[Orders] Skipped save - update came from socket');
        return;
      }
      // Skip first load from server
      if (!ordersLoadedRef.current) {
        ordersLoadedRef.current = true;
        prevOrdersRef.current = orders;
        console.log('[Orders] Skipped save - first load from server');
        return;
      }
      // Safety: Don't save empty orders if we previously had orders
      if (orders.length === 0 && prevOrdersRef.current.length > 0) {
        console.warn('[Orders] Prevented saving empty orders - possible race condition');
        return;
      }
      // Only save if actually changed
      if (JSON.stringify(orders) !== JSON.stringify(prevOrdersRef.current)) {
        console.log('[Orders] Saving orders, count:', orders.length);
        prevOrdersRef.current = orders;
        DataService.save('orders', orders, activeTenantId);
      }
    }
  }, [orders, isLoading, activeTenantId]);
  useEffect(() => {
    // Don't save until chat messages have been initially loaded from server
    if (isLoading || !activeTenantId || !chatMessagesLoadedRef.current) return;
    if (skipNextChatSaveRef.current) {
      skipNextChatSaveRef.current = false;
      return;
    }

    let isCancelled = false;

    const persistChats = async () => {
      chatSyncLockRef.current = true;
      try {
        await DataService.save('chat_messages', chatMessages, activeTenantId);
      } catch (error) {
        console.warn('Unable to save chat messages', error);
      } finally {
        chatSyncLockRef.current = false;
      }
    };

    persistChats();

    return () => {
      isCancelled = true;
    };
  }, [chatMessages, isLoading, activeTenantId]);
  
  // OPTIMIZED: Track if initial data is loaded to prevent unnecessary saves
  const initialDataLoadedRef = useRef(false);
  const productsLoadedFromServerRef = useRef(false);
  const prevProductsRef = useRef<Product[]>([]);
  const isFirstProductUpdateRef = useRef(true);
  
  useEffect(() => {
    if (!isLoading && activeTenantId) {
      initialDataLoadedRef.current = true;
    }
  }, [isLoading, activeTenantId]);

  // Reset refs when tenant changes
  useEffect(() => {
    productsLoadedFromServerRef.current = false;
    isFirstProductUpdateRef.current = true;
    ordersLoadedRef.current = false;
    prevProductsRef.current = [];
    prevOrdersRef.current = [];
  }, [activeTenantId]);

  // OPTIMIZED: Only save when data actually changes (not on initial load)
  useEffect(() => { 
    // Don't save while still loading initial data
    if (isLoading || !initialDataLoadedRef.current || !activeTenantId) return;
    
    // Skip if this update came from a socket event
    if (isKeyFromSocket('products', activeTenantId)) {
      clearSocketFlag('products', activeTenantId);
      prevProductsRef.current = products;
      console.log('[Products] Skipped save - update came from socket');
      return;
    }
    
    // Skip the very first update after load - this is the initial data from server
    if (isFirstProductUpdateRef.current) {
      isFirstProductUpdateRef.current = false;
      prevProductsRef.current = products;
      productsLoadedFromServerRef.current = true;
      return;
    }
    
    // Safety check: Never save an empty array if we previously had products
    if (products.length === 0 && prevProductsRef.current.length > 0) {
      console.warn('[DataService] Prevented saving empty products array - possible race condition');
      return;
    }
    
    // Only save if data actually changed
    if (JSON.stringify(products) === JSON.stringify(prevProductsRef.current)) return;
    
    prevProductsRef.current = products;
    // Use saveImmediate for products to prevent race conditions with data refresh
    DataService.saveImmediate('products', products, activeTenantId); 
  }, [products, activeTenantId, isLoading]);
  
  useEffect(() => { if(!isLoading && activeTenantId) DataService.save('roles', roles, activeTenantId); }, [roles, isLoading, activeTenantId]);
  useEffect(() => { if(!isLoading && activeTenantId) DataService.save('users', users, activeTenantId); }, [users, isLoading, activeTenantId]);
  useEffect(() => { if(!isLoading && activeTenantId) DataService.save('logo', logo, activeTenantId); }, [logo, isLoading, activeTenantId]);
  useEffect(() => { if(!isLoading && activeTenantId) DataService.save('delivery_config', deliveryConfig, activeTenantId); }, [deliveryConfig, isLoading, activeTenantId]);
  useEffect(() => { if(!isLoading && activeTenantId && adminDataLoadedRef.current) DataService.save('courier', courierConfig, activeTenantId); }, [courierConfig, isLoading, activeTenantId]);
  useEffect(() => { if(!isLoading && activeTenantId && adminDataLoadedRef.current) DataService.save('facebook_pixel', facebookPixelConfig, activeTenantId); }, [facebookPixelConfig, isLoading, activeTenantId]);
  
  useEffect(() => { if(!isLoading && activeTenantId && adminDataLoadedRef.current) DataService.save('categories', categories, activeTenantId); }, [categories, isLoading, activeTenantId]);
  useEffect(() => { if(!isLoading && activeTenantId && adminDataLoadedRef.current) DataService.save('subcategories', subCategories, activeTenantId); }, [subCategories, isLoading, activeTenantId]);
  useEffect(() => { if(!isLoading && activeTenantId && adminDataLoadedRef.current) DataService.save('childcategories', childCategories, activeTenantId); }, [childCategories, isLoading, activeTenantId]);
  useEffect(() => { if(!isLoading && activeTenantId && adminDataLoadedRef.current) DataService.save('brands', brands, activeTenantId); }, [brands, isLoading, activeTenantId]);
  useEffect(() => { if(!isLoading && activeTenantId && adminDataLoadedRef.current) DataService.save('tags', tags, activeTenantId); }, [tags, isLoading, activeTenantId]);
  useEffect(() => { if(!isLoading && activeTenantId && initialDataLoadedRef.current) DataService.save('landing_pages', landingPages, activeTenantId); }, [landingPages, isLoading, activeTenantId]);

  // OPTIMIZED: Chat polling - only start when chat is opened or user is admin
  const chatPollingActiveRef = useRef(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!activeTenantId || isLoading) return;
    
    // Only start polling when:
    // 1. Chat is open (customer or admin)
    // 2. Or user is admin (need notifications)
    const shouldPoll = isChatOpen || isAdminChatOpen || isAdminRole(user?.role);
    if (!shouldPoll) {
      chatPollingActiveRef.current = false;
      return;
    }

    chatPollingActiveRef.current = true;
    let isMounted = true;
    let isFetching = false;

    const syncChatFromRemote = async () => {
      if (!isMounted || isFetching || chatSyncLockRef.current || !chatPollingActiveRef.current) return;
      isFetching = true;
      try {
        const latest = await DataService.getChatMessages(activeTenantId);
        if (!isMounted) return;
        const normalized = Array.isArray(latest) ? [...latest] : [];
        normalized.sort((a, b) => (a?.timestamp || 0) - (b?.timestamp || 0));

        const localMessages = chatMessagesRef.current;
        const prevIds = new Set(localMessages.map((message) => message.id));
        const newMessages = normalized.filter((message) => !prevIds.has(message.id));

        const hasDifference =
          localMessages.length !== normalized.length ||
          localMessages.some((message, index) => {
            const comparison = normalized[index];
            if (!comparison) return true;
            return (
              message.id !== comparison.id ||
              message.text !== comparison.text ||
              message.timestamp !== comparison.timestamp ||
              message.sender !== comparison.sender ||
              (message.editedAt || 0) !== (comparison.editedAt || 0)
            );
          });

        if (hasDifference) {
          skipNextChatSaveRef.current = true;
          setChatMessages(normalized);
        }

        const shouldNotify = newMessages.some((message) => message.sender === 'customer');
        // Notify any admin role, not just super_admin
        if (shouldNotify && isAdminRole(userRef.current?.role) && !isAdminChatOpenRef.current) {
          setHasUnreadChat(true);
        }
      } catch (error) {
        console.warn('Unable to sync chat messages', error);
      } finally {
        isFetching = false;
      }
    };

    // Increased interval from 3500ms to 5000ms for better performance
    const intervalId = window.setInterval(syncChatFromRemote, 5000);
    syncChatFromRemote();

    return () => {
      isMounted = false;
      chatPollingActiveRef.current = false;
      window.clearInterval(intervalId);
    };
  }, [activeTenantId, isLoading, isChatOpen, isAdminChatOpen, user?.role]);

  // Apply theme colors to CSS variables (always) and save to server (only after initial load)
  const themeLoadedRef = useRef(false);
  const lastSavedThemeRef = useRef<string>('');
  
  useEffect(() => { 
    if(!themeConfig || !activeTenantId) return;
    
    // Always apply CSS variables for visual updates
    const root = document.documentElement;
    root.style.setProperty('--color-primary-rgb', hexToRgb(themeConfig.primaryColor));
    root.style.setProperty('--color-secondary-rgb', hexToRgb(themeConfig.secondaryColor));
    root.style.setProperty('--color-tertiary-rgb', hexToRgb(themeConfig.tertiaryColor));
    root.style.setProperty('--color-font-rgb', hexToRgb(themeConfig.fontColor));
    root.style.setProperty('--color-hover-rgb', hexToRgb(themeConfig.hoverColor));
    root.style.setProperty('--color-surface-rgb', hexToRgb(themeConfig.surfaceColor));
    
    // Apply admin theme colors
    if (themeConfig.adminBgColor) {
      root.style.setProperty('--admin-bg', hexToRgb(themeConfig.adminBgColor));
    }
    if (themeConfig.adminInputBgColor) {
      root.style.setProperty('--admin-bg-input', hexToRgb(themeConfig.adminInputBgColor));
    }
    if (themeConfig.adminBorderColor) {
      root.style.setProperty('--admin-border-rgb', hexToRgb(themeConfig.adminBorderColor));
    }
    if (themeConfig.adminFocusColor) {
      root.style.setProperty('--admin-focus-rgb', hexToRgb(themeConfig.adminFocusColor));
    }
    
    if (themeConfig.darkMode) root.classList.add('dark');
    else root.classList.remove('dark');
    
    // Only save to server AFTER initial data has loaded
    // Skip if this update came from socket (server already has the data)
    if(!isLoading && themeLoadedRef.current) {
      // Check if this update came from socket - don't save back to server
      if (isKeyFromSocket('theme_config', activeTenantId)) {
        clearSocketFlag('theme_config', activeTenantId);
        lastSavedThemeRef.current = JSON.stringify(themeConfig);
        return;
      }
      
      const currentThemeStr = JSON.stringify(themeConfig);
      if (currentThemeStr !== lastSavedThemeRef.current) {
        lastSavedThemeRef.current = currentThemeStr;
        DataService.saveImmediate('theme_config', themeConfig, activeTenantId);
      }
    }
    
    // Mark as loaded after first render with loaded data
    if(!isLoading && !themeLoadedRef.current) {
      themeLoadedRef.current = true;
      lastSavedThemeRef.current = JSON.stringify(themeConfig);
    }
  }, [themeConfig, isLoading, activeTenantId]);

  // Track if website config has been initially loaded to prevent overwriting saved data with defaults
  const websiteConfigLoadedRef = useRef(false);
  const lastSavedWebsiteConfigRef = useRef<string>('');

  useEffect(() => { 
    if(!isLoading && websiteConfig && activeTenantId) {
      // Only save AFTER initial load (to avoid overwriting saved data with defaults)
      // Skip if this update came from socket (server already has the data)
      if (websiteConfigLoadedRef.current) {
        // Check if this update came from socket - don't save back to server
        if (isKeyFromSocket('website_config', activeTenantId)) {
          clearSocketFlag('website_config', activeTenantId);
          lastSavedWebsiteConfigRef.current = JSON.stringify(websiteConfig);
        } else {
          const currentConfigStr = JSON.stringify(websiteConfig);
          if (currentConfigStr !== lastSavedWebsiteConfigRef.current) {
            lastSavedWebsiteConfigRef.current = currentConfigStr;
            // Use immediate save for website config to reflect instantly
            DataService.saveImmediate('website_config', websiteConfig, activeTenantId);
          }
        }
      }
      
      // Mark as loaded after first render with loaded data
      if (!websiteConfigLoadedRef.current) {
        websiteConfigLoadedRef.current = true;
        lastSavedWebsiteConfigRef.current = JSON.stringify(websiteConfig);
      }
      
      if (websiteConfig.favicon) {
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = websiteConfig.favicon;
      }
    }
  }, [websiteConfig, isLoading, activeTenantId]);

  useEffect(() => {
    if (!websiteConfig?.chatGreeting) return;
    if (chatMessages.length > 0) return;
    const tenantKey = activeTenantId || 'default';
    if (chatGreetingSeedRef.current === tenantKey) return;
    const greetingMessage: ChatMessage = {
      id: `greeting-${Date.now()}`,
      sender: 'admin',
      text: websiteConfig.chatGreeting,
      timestamp: Date.now(),
    };
    setChatMessages([greetingMessage]);
    chatGreetingSeedRef.current = tenantKey;
  }, [websiteConfig?.chatGreeting, chatMessages.length, activeTenantId]);

  useEffect(() => {
    const scriptId = 'facebook-pixel-script';
    const noScriptId = 'facebook-pixel-noscript';

    const removePixelArtifacts = () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) existingScript.remove();
      const existingNoScript = document.getElementById(noScriptId);
      if (existingNoScript) existingNoScript.remove();
    };

    if (!facebookPixelConfig?.isEnabled || !facebookPixelConfig.pixelId) {
      removePixelArtifacts();
      return;
    }

    removePixelArtifacts();
    const pixelId = facebookPixelConfig.pixelId.trim();
    const testEventId = facebookPixelConfig.enableTestEvent ? `TEST_${Date.now()}` : null;

    const script = document.createElement('script');
    script.id = scriptId;
    script.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod? n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}'${testEventId ? `, {eventID: '${testEventId}'}` : ''});
fbq('track', 'PageView');`;
    document.head.appendChild(script);

    const noscript = document.createElement('noscript');
    noscript.id = noScriptId;
    noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1${facebookPixelConfig.enableTestEvent ? '&cd[event_source_url]=test' : ''}" />`;
    document.body.appendChild(noscript);

    return removePixelArtifacts;
  }, [facebookPixelConfig]);


  // --- HANDLERS ---

  const handleStoreSearchChange = useCallback((value: string) => {
    setStoreSearchQuery(value);
    if (currentViewRef.current !== 'store') {
      setSelectedProduct(null);
      setCurrentView('store');
    }
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, []);

  const appendChatMessage = useCallback((sender: ChatMessage['sender'], text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const authorName = userRef.current?.name || (sender === 'customer' ? 'Visitor' : 'Support Agent');
    const authorEmail = userRef.current?.email || undefined;
    const authorRole = userRef.current?.role;
    const messageId = `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const message: ChatMessage = {
      id: messageId,
      sender,
      text: trimmed,
      timestamp: Date.now(),
      customerName: sender === 'customer' ? (userRef.current?.name || 'Visitor') : undefined,
      customerEmail: sender === 'customer' ? userRef.current?.email : undefined,
      authorName,
      authorEmail,
      authorRole,
    };
    chatSyncLockRef.current = true;
    setChatMessages((prev) => [...prev, message]);
  }, []);

  const handleCustomerSendChat = useCallback((text: string) => {
    appendChatMessage('customer', text);
    if (!isAdminChatOpen) {
      setHasUnreadChat(true);
    }
  }, [appendChatMessage, isAdminChatOpen]);

  const handleAdminSendChat = useCallback((text: string) => {
    appendChatMessage('admin', text);
  }, [appendChatMessage]);

  const handleEditChatMessage = useCallback((messageId: string, updatedText: string) => {
    const trimmed = updatedText.trim();
    if (!trimmed) return;
    const existing = chatMessagesRef.current.find((message) => message.id === messageId);
    if (!existing || existing.text === trimmed) return;
    chatSyncLockRef.current = true;
    setChatMessages((prev) => prev.map((message) => message.id === messageId ? { ...message, text: trimmed, editedAt: Date.now() } : message));
  }, []);

  const handleDeleteChatMessage = useCallback((messageId: string) => {
    const exists = chatMessagesRef.current.some((message) => message.id === messageId);
    if (!exists) return;
    chatSyncLockRef.current = true;
    setChatMessages((prev) => prev.filter((message) => message.id !== messageId));
  }, []);

  const handleOpenChat = useCallback(() => {
    setIsAdminChatOpen(false);
    setIsChatOpen(true);
  }, []);

  const handleCloseChat = useCallback(() => {
    setIsChatOpen(false);
  }, []);

  const handleOpenAdminChat = useCallback(() => {
    setIsAdminChatOpen(true);
    setIsChatOpen(false);
    setHasUnreadChat(false);
  }, []);

  const handleCloseAdminChat = useCallback(() => {
    setIsAdminChatOpen(false);
  }, []);

  const handleRegister = async (newUser: User) => {
    if (!newUser.email || !newUser.password) {
      throw new Error('Email and password are required');
    }
    const normalizedEmail = newUser.email.trim().toLowerCase();
    if (users.some((u) => u.email?.toLowerCase() === normalizedEmail)) {
      throw new Error('Email already registered. Try logging in instead.');
    }
    try {
      const scopedUser: User = {
        ...newUser,
        email: normalizedEmail,
        tenantId: newUser.tenantId || activeTenantId,
        role: newUser.role || 'customer'
      };
      setUsers((prev) => [...prev.filter((u) => u.email !== scopedUser.email), scopedUser]);
      setUser(scopedUser);
      if (scopedUser.tenantId) {
        setActiveTenantId(scopedUser.tenantId);
      }
      return true;
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    }
  };

  const tryLegacyLogin = (email: string, pass: string) => {
    const formattedEmail = email.trim();
    const formattedPass = pass.trim();
    const formattedEmailLower = formattedEmail.toLowerCase();

    const tenantAdmin = tenants.find(
      (tenant) => tenant.adminEmail?.toLowerCase() === formattedEmailLower && tenant.adminPassword === formattedPass
    );
    if (tenantAdmin) {
      const adminUser: User = {
        name: `${tenantAdmin.name} Admin`,
        email: formattedEmail,
        role: 'tenant_admin',
        tenantId: tenantAdmin.id
      };
      setUser(adminUser);
      setActiveTenantId(tenantAdmin.id);
      setAdminSection('dashboard');
      setCurrentView('admin');
      return true;
    }

    if (formattedEmailLower === 'admin@admin.com' && formattedPass === 'admin121') {
      const admin: User = {
        name: 'Super Admin',
        email: 'admin@admin.com',
        role: 'super_admin',
        tenantId: activeTenantId || DEFAULT_TENANT_ID
      };
      setUser(admin);
      setActiveTenantId(admin.tenantId || activeTenantId || DEFAULT_TENANT_ID);
      setAdminSection('dashboard');
      setCurrentView('admin');
      return true;
    }

    // New super admin login
    if (formattedEmailLower === 'admin@super.com' && formattedPass === 'admin121') {
      const admin: User = {
        name: 'Super Admin',
        email: 'admin@super.com',
        role: 'super_admin',
        tenantId: activeTenantId || DEFAULT_TENANT_ID
      };
      setUser(admin);
      setActiveTenantId(admin.tenantId || activeTenantId || DEFAULT_TENANT_ID);
      setAdminSection('dashboard');
      setCurrentView('admin');
      return true;
    }

    const foundUser = users.find(
      (u) => u.email?.toLowerCase() === formattedEmailLower && u.password === formattedPass
    );
    if (foundUser) {
      const userWithTenant = {
        ...foundUser,
        tenantId: foundUser.tenantId || activeTenantId || DEFAULT_TENANT_ID,
      };
      setUser(userWithTenant);
      setActiveTenantId(userWithTenant.tenantId || activeTenantId || DEFAULT_TENANT_ID);
      if (!foundUser.tenantId) {
        setUsers((prev) => prev.map((u) => (u.email === foundUser.email ? userWithTenant : u)));
      }
      if (isAdminRole(userWithTenant.role)) {
        setCurrentView('admin');
        setAdminSection('dashboard');
      }
      return true;
    }

    return false;
  };

  const handleLogin = async (email: string, pass: string) => {
    const normalizedEmail = email.trim();
    const normalizedPass = pass.trim();
    
    // Use API authentication http://localhost:5001/api/auth/login
    const response = await fetch('https://systemnextit.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail, password: normalizedPass }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Invalid email or password.');
    }
    
    const data = await response.json();
    
    // Block admin login from store - redirect to /admin/login
    if (isAdminRole(data.user.role)) {
      throw new Error('Admin users must login at /admin/login');
    }
    
    // Store JWT token for RBAC API calls (customers only)
    localStorage.setItem('admin_auth_token', data.token);
    localStorage.setItem('admin_auth_user', JSON.stringify(data.user));
    localStorage.setItem('admin_auth_permissions', JSON.stringify(data.permissions || []));
    
    const loggedInUser: User = {
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      tenantId: data.user.tenantId || activeTenantId || DEFAULT_TENANT_ID
    };
    setUser(loggedInUser);
    setActiveTenantId(loggedInUser.tenantId || activeTenantId || DEFAULT_TENANT_ID);
    
    return true;
  };

  const handleGoogleLogin = async () => {
    throw new Error('Google login is not available in this environment.');
  };

  const handleLogout = async () => {
    // Clear JWT tokens
    localStorage.removeItem('admin_auth_token');
    localStorage.removeItem('admin_auth_user');
    localStorage.removeItem('admin_auth_permissions');
    
    setUser(null);
    setCurrentView('store');
    setSelectedVariant(null);
    setAdminSection('dashboard');
  };

  const handleUpdateProfile = (updatedUser: User) => {
    const userWithTenant = { ...updatedUser, tenantId: updatedUser.tenantId || activeTenantId };
    setUser(userWithTenant);
    setUsers(users.map(u => u.email === updatedUser.email ? userWithTenant : u));
  };

  const handleAddRole = (newRole: Role) => {
    const scopedRole = { ...newRole, tenantId: newRole.tenantId || activeTenantId };
    setRoles([...roles, scopedRole]);
  };
  const handleUpdateRole = (updatedRole: Role) => {
    const scopedRole = { ...updatedRole, tenantId: updatedRole.tenantId || activeTenantId };
    setRoles(roles.map(r => r.id === scopedRole.id ? scopedRole : r));
  };
  const handleDeleteRole = (roleId: string) => setRoles(roles.filter(r => r.id !== roleId));
  const handleUpdateUserRole = (userEmail: string, roleId: string) => {
    setUsers(users.map(u => u.email === userEmail ? { ...u, roleId: roleId || undefined } : u));
  };

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

  const handleCreateLandingPage = (page: LandingPage) => {
    const scopedPage = { ...page, tenantId: page.tenantId || activeTenantId };
    setLandingPages(prev => [scopedPage, ...prev]);
  };

  const handleUpsertLandingPage = (page: LandingPage) => {
    const scopedPage = { ...page, tenantId: page.tenantId || activeTenantId };
    setLandingPages(prev => {
      const exists = prev.some(lp => lp.id === scopedPage.id);
      return exists ? prev.map(lp => lp.id === scopedPage.id ? scopedPage : lp) : [scopedPage, ...prev];
    });
  };

  const handleToggleLandingPublish = (pageId: string, status: LandingPage['status']) => {
    const timestamp = new Date().toISOString();
    setLandingPages(prev => prev.map(lp => lp.id === pageId ? {
      ...lp,
      status,
      updatedAt: timestamp,
      publishedAt: status === 'published' ? timestamp : undefined
    } : lp));
  };

  const handlePreviewLandingPage = (page: LandingPage) => {
    setSelectedLandingPage(page);
    setCurrentView('landing_preview');
    window.scrollTo(0,0);
  };

  const handleUpdateLogo = (newLogo: string | null) => setLogo(newLogo);
  const handleUpdateTheme = (newConfig: ThemeConfig) => setThemeConfig(newConfig);
  const handleUpdateWebsiteConfig = (newConfig: WebsiteConfig) => setWebsiteConfig(newConfig);
  const handleUpdateCourierConfig = (config: CourierConfig) => setCourierConfig(config);
  const handleUpdateDeliveryConfig = (configs: DeliveryConfig[]) => setDeliveryConfig(configs);

  const handleTenantChange = (tenantId: string) => {
    if (!tenantId || tenantId === activeTenantId) return;
    if (hostTenantId && tenantId !== hostTenantId) {
      toast.error('This subdomain is locked to its storefront. Use the primary admin domain to switch tenants.');
      return;
    }
    tenantSwitchTargetRef.current = tenantId;
    setIsTenantSwitching(true);
    chatMessagesLoadedRef.current = false; // Reset so we don't save stale messages
    setActiveTenantId(tenantId);
    setAdminSection('dashboard');
    setSelectedProduct(null);
    setSelectedLandingPage(null);
    if (user) {
      const updatedUser = { ...user, tenantId };
      setUser(updatedUser);
    }
    if (!currentView.startsWith('admin')) {
      setCurrentView('admin');
    }
  };

  const handleCreateTenant = async (
    payload: CreateTenantPayload,
    options: { activate?: boolean } = { activate: true }
  ): Promise<Tenant> => {
    setIsTenantSeeding(true);
    try {
      const newTenant = await DataService.seedTenant(payload);
      let resolvedTenant = newTenant;
      try {
        const refreshed = await refreshTenants();
        const matched = refreshed?.find((tenant) => tenant.id === newTenant.id || tenant.subdomain === newTenant.subdomain);
        if (matched) {
          resolvedTenant = matched;
        }
      } catch (refreshError) {
        console.warn('Unable to refresh tenants after creation', refreshError);
        setTenants(prev => {
          const filtered = prev.filter(t => t.id !== newTenant.id);
          return [newTenant, ...filtered];
        });
      }

      if (options.activate && resolvedTenant?.id) {
        handleTenantChange(resolvedTenant.id);
      }

      toast.success(`${resolvedTenant.name} is ready`);
      return resolvedTenant;
    } catch (error) {
      console.error('Failed to create tenant', error);
      const message = error instanceof Error ? error.message : 'Unable to create tenant';
      toast.error(message);
      throw error;
    } finally {
      setIsTenantSeeding(false);
    }
  };

  const handleDeleteTenant = async (tenantId: string) => {
    if (!tenantId) return;
    setDeletingTenantId(tenantId);
    try {
      await DataService.deleteTenant(tenantId);
      let fallbackTenantId: string | null = null;
      try {
        const latest = await refreshTenants();
        fallbackTenantId = latest?.[0]?.id || null;
      } catch (refreshError) {
        console.warn('Unable to refresh tenants after deletion', refreshError);
        let candidateId: string | null = null;
        setTenants(prev => {
          const updated = prev.filter(tenant => tenant.id !== tenantId);
          candidateId = updated[0]?.id || null;
          return updated;
        });
        fallbackTenantId = candidateId;
      }

      if (tenantId === activeTenantId) {
        if (fallbackTenantId) {
          handleTenantChange(fallbackTenantId);
        } else {
          setActiveTenantId(DEFAULT_TENANT_ID);
        }
      }
      toast.success('Tenant removed');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to delete tenant';
      toast.error(message);
      throw error;
    } finally {
      setDeletingTenantId(null);
    }
  };
  
  // Updated to handle partial updates including trackingId
  const handleUpdateOrder = (orderId: string, updates: Partial<Order>) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, ...updates, tenantId: o.tenantId || activeTenantId } : o));
  };

  const addToWishlist = (id: number) => { if (!wishlist.includes(id)) setWishlist([...wishlist, id]); };
  const removeFromWishlist = (id: number) => { setWishlist(wishlist.filter(wId => wId !== id)); };
  const isInWishlist = (id: number) => wishlist.includes(id);

  const ensureVariantSelection = (product?: Product | null, variant?: ProductVariantSelection | null): ProductVariantSelection => ({
    color: variant?.color || product?.variantDefaults?.color || product?.colors?.[0] || FALLBACK_VARIANT.color,
    size: variant?.size || product?.variantDefaults?.size || product?.sizes?.[0] || FALLBACK_VARIANT.size,
  });

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setSelectedVariant(null);
    setCurrentView('detail');
    if (product.slug) {
      window.history.pushState({ slug: product.slug }, '', `/${product.slug}`);
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCartToggle = (productId: number, options?: { silent?: boolean }) => {
    setCartItems(prev => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter(id => id !== productId) : [...prev, productId];
      if (!options?.silent) {
        if (exists) {
          toast('Removed from cart');
        } else {
          toast.success('Added to cart');
        }
      }
      return next;
    });
  };

  const handleAddProductToCart = (
    product: Product,
    quantity: number = 1,
    variant?: ProductVariantSelection | null,
    options?: { silent?: boolean }
  ) => {
    setCartItems(prev => {
      if (prev.includes(product.id)) {
        if (!options?.silent) {
          toast('Already in cart');
        }
        return prev;
      }
      if (!options?.silent) {
        toast.success(`${product.name} added to cart`);
      }
      return [...prev, product.id];
    });
  };

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

  const handleCheckoutFromCart = (productId: number) => {
    const targetProduct = products.find(p => p.id === productId);
    if (!targetProduct) {
      toast.error('Product unavailable for checkout');
      return;
    }
    handleCheckoutStart(targetProduct, 1, ensureVariantSelection(targetProduct));
  };
  // ...existing code...
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

    // POST to backend API - this will create notification and emit socket event
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
      const response = await fetch(`${apiBase}/api/orders/${activeTenantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      
      if (response.ok) {
        const result = await response.json();
        // Use the order from API response (may have server-side modifications)
        setOrders([result.data || newOrder, ...orders]);
        console.log('[Order] Created via API:', result.data?.id || orderId);
      } else {
        // Fallback to local state if API fails
        setOrders([newOrder, ...orders]);
        console.warn('[Order] API failed, using local state');
      }
    } catch (error) {
      // Fallback to local state if API unreachable
      setOrders([newOrder, ...orders]);
      console.warn('[Order] API error, using local state:', error);
    }

    setCurrentView('success');
    window.scrollTo(0, 0);
  };
// ...existing code...

// ...existing code...
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

    // POST to backend API - this will create notification and emit socket event
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
        console.log('[LandingOrder] Created via API:', result.data?.id || orderId);
      } else {
        setOrders(prev => [newOrder, ...prev]);
        console.warn('[LandingOrder] API failed, using local state');
      }
    } catch (error) {
      setOrders(prev => [newOrder, ...prev]);
      console.warn('[LandingOrder] API error, using local state:', error);
    }
  };
// ...existing code...

  const handleCloseLandingPreview = () => {
    setSelectedLandingPage(null);
    setCurrentView(isAdminRole(user?.role) ? 'admin' : 'store');
  };

  const attachTenant = <T extends { tenantId?: string }>(item: T): T => ({ ...item, tenantId: item?.tenantId || activeTenantId });

  // Create CRUD handlers that also persist to backend
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
  const platformOperator = isPlatformOperator(user?.role);
  // Allow any admin role to access the chat, not just super_admin
  const canAccessAdminChat = isAdminRole(user?.role);
  const selectedTenantRecord = tenants.find(t => t.id === activeTenantId) || tenantsRef.current.find(t => t.id === activeTenantId) || null;
  const isTenantLockedByHost = Boolean(hostTenantId);
  const scopedTenants = isTenantLockedByHost ? tenants.filter((tenant) => tenant.id === hostTenantId) : tenants;
  const headerTenants = platformOperator ? scopedTenants : (selectedTenantRecord ? [selectedTenantRecord] : []);
  const tenantSwitcher = platformOperator && !isTenantLockedByHost ? handleTenantChange : undefined;

  const toggleView = () => {
    if (!isAdminRole(user?.role)) return;
    const nextView = currentView.startsWith('admin') ? 'store' : 'admin';
    setCurrentView(nextView);
    setSelectedProduct(null);
  };

  const syncViewWithLocation = useCallback((path?: string) => {
    const trimmedPath = (path ?? window.location.pathname).replace(/^\/+|\/+$/g, '');
    const activeView = currentViewRef.current;
    const activeUser = userRef.current;

    // Handle admin login route FIRST (before empty path check)
    if (trimmedPath === 'admin/login') {
      if (activeView !== 'admin-login') {
        setCurrentView('admin-login');
      }
      return;
    }

    // Handle /products route with optional category filter
    if (trimmedPath === 'products') {
      const searchParams = new URLSearchParams(window.location.search);
      const categorySlug = searchParams.get('categories');
      // Only set filter if category is provided, otherwise redirect to home
      if (categorySlug) {
        setUrlCategoryFilter(categorySlug);
        if (!activeView.startsWith('admin')) {
          setSelectedProduct(null);
          setCurrentView('store');
        }
        return;
      } else {
        // No category specified, redirect to home
        window.history.replaceState({}, '', '/');
        setUrlCategoryFilter(null);
        if (!activeView.startsWith('admin')) {
          setSelectedProduct(null);
          setCurrentView('store');
        }
        return;
      }
    }

    if (!trimmedPath) {
      setUrlCategoryFilter(null);
      if (!activeView.startsWith('admin')) {
        setSelectedProduct(null);
        setCurrentView('store');
      }
      return;
    }

    if (trimmedPath === 'admin') {
      if (isAdminRole(activeUser?.role)) {
        setCurrentView('admin');
      } else {
        window.history.replaceState({}, '', '/');
        if (!activeView.startsWith('admin')) setCurrentView('store');
      }
      return;
    }

    const matchedProduct = products.find(p => p.slug === trimmedPath);
    if (matchedProduct) {
      setSelectedProduct(matchedProduct);
      setSelectedVariant(null);
      setCurrentView('detail');
      return;
    }

    // Don't redirect if we're on admin-login
    if (activeView === 'admin-login') {
      return;
    }

    window.history.replaceState({}, '', '/');
    if (!activeView.startsWith('admin')) {
      setSelectedProduct(null);
      setCurrentView('store');
    }
  }, [products]);

  useEffect(() => {
    const handlePopState = () => syncViewWithLocation();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [syncViewWithLocation]);

  useEffect(() => {
    syncViewWithLocation(window.location.pathname);
  }, [products, syncViewWithLocation]);

  useEffect(() => {
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
    // Don't redirect if we're on admin login page
    if (path === 'admin/login') return;
    
    if (currentView === 'store' && window.location.pathname !== '/') {
      window.history.replaceState({}, '', '/');
    }
  }, [currentView]);

  useEffect(() => {
    if (!currentView.startsWith('admin') && isAdminChatOpen) {
      setIsAdminChatOpen(false);
    }
  }, [currentView, isAdminChatOpen]);

  useEffect(() => {
    if (adminSection === 'tenants' && !isPlatformOperator(user?.role)) {
      setAdminSection('dashboard');
    }
  }, [adminSection, user]);

  if (isLoading) {
    const skeletonVariant: 'store' | 'admin' = currentView.startsWith('admin') || isAdminRole(user?.role)
      ? 'admin'
      : 'store';
    return <SuspenseFallback variant={skeletonVariant} />;
  }

  const suspenseVariant = currentView === 'admin-login' ? 'login' : currentView.startsWith('admin') ? 'admin' : 'store';

  return (
    <ThemeProvider themeConfig={themeConfig || undefined}>
    <Suspense fallback={<SuspenseFallback variant={suspenseVariant} />}>
      <Suspense fallback={null}>
        <Toaster position="top-right" toastOptions={{ duration: 2500 }} />
      </Suspense>
      <div className={`relative ${themeConfig?.darkMode ? 'dark bg-slate-900' : 'bg-gray-50'}`}>
        {isLoginOpen && <LoginModal onClose={() => setIsLoginOpen(false)} onLogin={handleLogin} onRegister={handleRegister} onGoogleLogin={handleGoogleLogin} />}

    {currentView === 'admin-login' ? (
      <Suspense fallback={<LoginSkeleton />}>
        <AdminLogin onLoginSuccess={(user) => {
          setUser(user);
          setActiveTenantId(user.tenantId || activeTenantId || DEFAULT_TENANT_ID);
          setCurrentView('admin');
          setAdminSection('dashboard');
          window.history.pushState({}, '', '/admin');
        }} />
      </Suspense>
    ) : currentView === 'admin' ? (
      <Suspense fallback={<AdminSkeleton />}>
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
              <Suspense fallback={<StoreSkeleton />}>
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
                  onCategoryFilterChange={(categorySlug) => {
                    if (categorySlug) {
                      window.history.pushState({}, '', `/products?categories=${categorySlug}`);
                      setUrlCategoryFilter(categorySlug);
                    } else {
                      window.history.pushState({}, '', '/');
                      setUrlCategoryFilter(null);
                    }
                  }}
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
              <Suspense fallback={<ProductDetailSkeleton />}>
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
              <Suspense fallback={<CheckoutSkeleton />}>
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
              <Suspense fallback={<OrderSuccessSkeleton />}>
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
              <Suspense fallback={<ProfileSkeleton />}>
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
                  onAccountClick={() => {}} // Already on profile
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
              <Suspense fallback={<LandingPageSkeleton />}>
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