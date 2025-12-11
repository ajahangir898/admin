
import React, { useState, useEffect, lazy, Suspense, useCallback, useRef } from 'react';
import { Monitor, LayoutDashboard, Loader2 } from 'lucide-react';
import { Product, Order, User, ThemeConfig, WebsiteConfig, Role, Category, SubCategory, ChildCategory, Brand, Tag, DeliveryConfig, ProductVariantSelection, LandingPage, FacebookPixelConfig, CourierConfig, Tenant, CreateTenantPayload, ChatMessage } from './types';
import type { LandingCheckoutPayload } from './components/LandingPageComponents';
import { DataService } from './services/DataService';
import { slugify } from './services/slugify';
import { DEFAULT_TENANT_ID, RESERVED_TENANT_SLUGS } from './constants';
import { Toaster, toast } from 'react-hot-toast';
import AppSkeleton from './components/SkeletonLoaders';


const StoreHome = lazy(() => import('./pages/StoreHome'));
const StoreProductDetail = lazy(() => import('./pages/StoreProductDetail'));
const StoreCheckout = lazy(() => import('./pages/StoreCheckout'));
const StoreOrderSuccess = lazy(() => import('./pages/StoreOrderSuccess'));
const StoreProfile = lazy(() => import('./pages/StoreProfile'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminOrders = lazy(() => import('./pages/AdminOrders'));
const AdminProducts = lazy(() => import('./pages/AdminProducts'));
const AdminCustomization = lazy(() => import('./pages/AdminCustomization'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));
const AdminControl = lazy(() => import('./pages/AdminControl'));
const AdminCatalog = lazy(() => import('./pages/AdminCatalog'));
const AdminDeliverySettings = lazy(() => import('./pages/AdminDeliverySettings'));
const AdminCourierSettings = lazy(() => import('./pages/AdminCourierSettings'));
const AdminInventory = lazy(() => import('./pages/AdminInventory'));
const AdminReviews = lazy(() => import('./pages/AdminReviews'));
const AdminDailyTarget = lazy(() => import('./pages/AdminDailyTarget'));
const AdminGallery = lazy(() => import('./pages/AdminGallery'));
const AdminFacebookPixel = lazy(() => import('./pages/AdminFacebookPixel'));
const AdminLandingPage = lazy(() => import('./pages/AdminLandingPage'));
const AdminTenantManagement = lazy(() => import('./pages/AdminTenantManagement'));
const LandingPagePreview = lazy(() => import('./pages/LandingPagePreview'));
const StoreImageSearch = lazy(() => import('./pages/StoreImageSearch'));
const loadAdminComponents = () => import('./components/AdminComponents');
const loadStoreComponents = () => import('./components/StoreComponents');
const AdminSidebar = lazy(() => loadAdminComponents().then(module => ({ default: module.AdminSidebar })));
const AdminHeader = lazy(() => loadAdminComponents().then(module => ({ default: module.AdminHeader })));
const LoginModal = lazy(() => loadStoreComponents().then(module => ({ default: module.LoginModal })));
const MobileBottomNav = lazy(() => loadStoreComponents().then(module => ({ default: module.MobileBottomNav })));
const StoreChatModal = lazy(() => loadStoreComponents().then(module => ({ default: module.StoreChatModal })));

// Wrapper layout for Admin pages
interface AdminLayoutProps {
  children: React.ReactNode;
  onSwitchView: () => void;
  activePage: string;
  onNavigate: (page: string) => void;
  logo: string | null;
  user?: User | null;
  onLogout?: () => void;
  tenants?: Tenant[];
  activeTenantId?: string;
  onTenantChange?: (tenantId: string) => void;
  isTenantSwitching?: boolean;
  onOpenChatCenter?: () => void;
  hasUnreadChat?: boolean;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  onSwitchView, 
  activePage, 
  onNavigate,
  logo,
  user,
  onLogout,
  tenants,
  activeTenantId,
  onTenantChange,
  isTenantSwitching,
  onOpenChatCenter,
  hasUnreadChat
}) => {
  const highlightPage = activePage.startsWith('settings') ? 'settings' : activePage;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="admin-theme flex h-screen font-sans text-slate-100 bg-gradient-to-br from-black via-[#0b1a12] to-[#1b0b0f]">
      <AdminSidebar 
        activePage={highlightPage} 
        onNavigate={onNavigate} 
        logo={logo} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        userRole={user?.role}
      />
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gradient-to-b from-[#050407]/80 via-[#07110b]/75 to-[#0e0609]/80 backdrop-blur">
        <AdminHeader 
          onSwitchView={onSwitchView} 
          user={user} 
          onLogout={onLogout} 
          logo={logo}
          tenants={tenants}
          activeTenantId={activeTenantId}
          onTenantChange={onTenantChange}
          isTenantSwitching={isTenantSwitching}
          onOpenChatCenter={onOpenChatCenter}
          hasUnreadChat={hasUnreadChat}
          onMenuClick={() => setIsSidebarOpen(true)} 
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 bg-gradient-to-b from-[#08080f]/80 via-[#0c1a12]/70 to-[#1a0b0f]/60">
          {children}
        </main>
      </div>
    </div>
  );
};

type ViewState = 'store' | 'detail' | 'checkout' | 'success' | 'profile' | 'admin' | 'landing_preview' | 'image-search';

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

const SuspenseFallback = () => (
  <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 text-gray-500 gap-4">
   
    <p className="font-medium animate-pulse"></p>
  </div>
);

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
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>({
    primaryColor: '#ec4899',
    secondaryColor: '#a855f7',
    tertiaryColor: '#c026d3',
    fontColor: '#0f172a',
    hoverColor: '#f97316',
    surfaceColor: '#e2e8f0',
    darkMode: false
  });
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

  useEffect(() => {
    chatGreetingSeedRef.current = null;
  }, [activeTenantId]);

  useEffect(() => {
    activeTenantIdRef.current = activeTenantId;
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

  // --- INITIAL DATA LOADING ---
  useEffect(() => {
    let isMounted = true;
    const loadTenants = async () => {
      try {
        const tenantList = await DataService.listTenants();
        if (!isMounted) return;
        applyTenantList(tenantList);
      } catch (error) {
        console.warn('Unable to load tenants', error);
      }
    };
    loadTenants();
    return () => { isMounted = false; };
  }, [applyTenantList, hostTenantSlug]);
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (!activeTenantId) return;
      setIsLoading(true);
      let loadError: Error | null = null;
      try {
        const [
          productsData,
          ordersData,
          chatMessagesData,
          landingPagesData,
          usersData,
          rolesData,
          logoData,
          themeData,
          websiteData,
          deliveryData,
          courierData,
          facebookPixelData,
          categoriesData,
          subCategoriesData,
          childCategoriesData,
          brandsData,
          tagsData
        ] = await Promise.all([
          DataService.getProducts(activeTenantId),
          DataService.getOrders(activeTenantId),
          DataService.get<ChatMessage[]>('chat_messages', [], activeTenantId),
          DataService.getLandingPages(activeTenantId),
          DataService.getUsers(activeTenantId),
          DataService.getRoles(activeTenantId),
          DataService.get<string | null>('logo', null, activeTenantId),
          DataService.getThemeConfig(activeTenantId),
          DataService.getWebsiteConfig(activeTenantId),
          DataService.getDeliveryConfig(activeTenantId),
          DataService.get('courier', { apiKey: '', secretKey: '', instruction: '' }, activeTenantId),
          DataService.get<FacebookPixelConfig>('facebook_pixel', { pixelId: '', accessToken: '', enableTestEvent: false, isEnabled: false }, activeTenantId),
          DataService.getCatalog('categories', [{ id: '1', name: 'Phones', icon: '', status: 'Active' }, { id: '2', name: 'Watches', icon: '', status: 'Active' }], activeTenantId),
          DataService.getCatalog('subcategories', [{ id: '1', categoryId: '1', name: 'Smartphones', status: 'Active' }, { id: '2', categoryId: '1', name: 'Feature Phones', status: 'Active' }], activeTenantId),
          DataService.getCatalog('childcategories', [], activeTenantId),
          DataService.getCatalog('brands', [{ id: '1', name: 'Apple', logo: '', status: 'Active' }, { id: '2', name: 'Samsung', logo: '', status: 'Active' }], activeTenantId),
          DataService.getCatalog('tags', [{ id: '1', name: 'Flash Deal', status: 'Active' }, { id: '2', name: 'New Arrival', status: 'Active' }], activeTenantId)
        ]);

        if (!isMounted) return;
        const normalizedProducts = normalizeProductCollection(productsData, activeTenantId);
        setProducts(normalizedProducts);
        setOrders(ordersData);
        const hydratedMessages = Array.isArray(chatMessagesData) ? chatMessagesData : [];
        skipNextChatSaveRef.current = true;
        setChatMessages(hydratedMessages);
        chatGreetingSeedRef.current = hydratedMessages.length ? (activeTenantId || 'default') : null;
        setHasUnreadChat(false);
        setIsAdminChatOpen(false);
        setLandingPages(landingPagesData);
        setUsers(usersData);
        setRoles(rolesData);
        setLogo(logoData);
        setThemeConfig(themeData);
        setWebsiteConfig(websiteData);
        setDeliveryConfig(deliveryData);
        setCourierConfig({
          apiKey: courierData?.apiKey || '',
          secretKey: courierData?.secretKey || '',
          instruction: courierData?.instruction || ''
        });
        setFacebookPixelConfig(facebookPixelData);
        setCategories(categoriesData);
        setSubCategories(subCategoriesData);
        setChildCategories(childCategoriesData);
        setBrands(brandsData);
        setTags(tagsData);
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

    loadData();
    return () => { isMounted = false; };
  }, [activeTenantId]);

  // --- PERSISTENCE WRAPPERS (Simulating DB Writes) ---
  
  useEffect(() => { if(!isLoading && activeTenantId) DataService.save('orders', orders, activeTenantId); }, [orders, isLoading, activeTenantId]);
  useEffect(() => {
    if (isLoading || !activeTenantId) return;
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
  useEffect(() => { if(!isLoading && activeTenantId) DataService.save('products', products, activeTenantId); }, [products, isLoading, activeTenantId]);
  useEffect(() => { if(!isLoading && activeTenantId) DataService.save('roles', roles, activeTenantId); }, [roles, isLoading, activeTenantId]);
  useEffect(() => { if(!isLoading && activeTenantId) DataService.save('users', users, activeTenantId); }, [users, isLoading, activeTenantId]);
  useEffect(() => { if(!isLoading && activeTenantId) DataService.save('logo', logo, activeTenantId); }, [logo, isLoading, activeTenantId]);
  useEffect(() => { if(!isLoading && activeTenantId) DataService.save('delivery_config', deliveryConfig, activeTenantId); }, [deliveryConfig, isLoading, activeTenantId]);
  useEffect(() => { if(!isLoading && activeTenantId) DataService.save('courier', courierConfig, activeTenantId); }, [courierConfig, isLoading, activeTenantId]);
  useEffect(() => { if(!isLoading && activeTenantId) DataService.save('facebook_pixel', facebookPixelConfig, activeTenantId); }, [facebookPixelConfig, isLoading, activeTenantId]);
  
  useEffect(() => { if(!isLoading && activeTenantId) DataService.save('categories', categories, activeTenantId); }, [categories, isLoading, activeTenantId]);
  useEffect(() => { if(!isLoading && activeTenantId) DataService.save('subcategories', subCategories, activeTenantId); }, [subCategories, isLoading, activeTenantId]);
  useEffect(() => { if(!isLoading && activeTenantId) DataService.save('childcategories', childCategories, activeTenantId); }, [childCategories, isLoading, activeTenantId]);
  useEffect(() => { if(!isLoading && activeTenantId) DataService.save('brands', brands, activeTenantId); }, [brands, isLoading, activeTenantId]);
  useEffect(() => { if(!isLoading && activeTenantId) DataService.save('tags', tags, activeTenantId); }, [tags, isLoading, activeTenantId]);
  useEffect(() => { if(!isLoading && activeTenantId) DataService.save('landing_pages', landingPages, activeTenantId); }, [landingPages, isLoading, activeTenantId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!activeTenantId || isLoading) return;

    let isMounted = true;
    let isFetching = false;

    const syncChatFromRemote = async () => {
      if (!isMounted || isFetching || chatSyncLockRef.current) return;
      isFetching = true;
      try {
        const latest = await DataService.get<ChatMessage[]>('chat_messages', [], activeTenantId);
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
        const isSuperAdmin = userRef.current?.role === 'super_admin';
        if (shouldNotify && isSuperAdmin && !isAdminChatOpenRef.current) {
          setHasUnreadChat(true);
        }
      } catch (error) {
        console.warn('Unable to sync chat messages', error);
      } finally {
        isFetching = false;
      }
    };

    const intervalId = window.setInterval(syncChatFromRemote, 3500);
    syncChatFromRemote();

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [activeTenantId, isLoading]);

  useEffect(() => { 
    if(!isLoading && themeConfig && activeTenantId) {
      DataService.save('theme', themeConfig, activeTenantId);
      const root = document.documentElement;
      root.style.setProperty('--color-primary-rgb', hexToRgb(themeConfig.primaryColor));
      root.style.setProperty('--color-secondary-rgb', hexToRgb(themeConfig.secondaryColor));
      root.style.setProperty('--color-tertiary-rgb', hexToRgb(themeConfig.tertiaryColor));
      root.style.setProperty('--color-font-rgb', hexToRgb(themeConfig.fontColor));
      root.style.setProperty('--color-hover-rgb', hexToRgb(themeConfig.hoverColor));
      root.style.setProperty('--color-surface-rgb', hexToRgb(themeConfig.surfaceColor));
      if (themeConfig.darkMode) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  }, [themeConfig, isLoading, activeTenantId]);

  useEffect(() => { 
    if(!isLoading && websiteConfig && activeTenantId) {
      DataService.save('website_config', websiteConfig, activeTenantId);
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

    if (formattedEmailLower === 'admin@systemnextit.com' && formattedPass === 'admin121') {
      const admin: User = {
        name: 'Super Admin',
        email: 'admin@systemnextit.com',
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
    if (tryLegacyLogin(normalizedEmail, normalizedPass)) {
      return true;
    }
    throw new Error('Invalid email or password.');
  };

  const handleGoogleLogin = async () => {
    throw new Error('Google login is not available in this environment.');
  };

  const handleLogout = async () => {
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
  const handlePlaceOrder = (formData: any) => {
    const newOrder: Order = {
      id: `#${Math.floor(1000 + Math.random() * 9000)}`,
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
    setOrders([newOrder, ...orders]);
    setCurrentView('success');
    window.scrollTo(0,0);
  };

  const handleLandingOrderSubmit = async (payload: LandingCheckoutPayload & { pageId: string; productId: number }) => {
    const product = products.find(p => p.id === payload.productId);
    if (!product) return;
    const newOrder: Order = {
      id: `LP-${Math.floor(10000 + Math.random() * 90000)}`,
      tenantId: activeTenantId,
      customer: payload.fullName,
      location: payload.address,
      phone: payload.phone,
      amount: product.price * payload.quantity,
      date: new Date().toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: 'Pending',
      email: payload.email,
      variant: ensureVariantSelection(product),
      productId: product.id,
      productName: product.name,
      quantity: payload.quantity
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  const handleCloseLandingPreview = () => {
    setSelectedLandingPage(null);
    setCurrentView(isAdminRole(user?.role) ? 'admin' : 'store');
  };

  const attachTenant = <T extends { tenantId?: string }>(item: T): T => ({ ...item, tenantId: item?.tenantId || activeTenantId });

  const createCrudHandler = (setter: React.Dispatch<React.SetStateAction<any[]>>) => ({
    add: (item: any) => setter(prev => [...prev, attachTenant(item)]),
    update: (item: any) => setter(prev => prev.map(i => i.id === item.id ? attachTenant(item) : i)),
    delete: (id: string) => setter(prev => prev.filter(i => i.id !== id))
  });

  const catHandlers = createCrudHandler(setCategories);
  const subCatHandlers = createCrudHandler(setSubCategories);
  const childCatHandlers = createCrudHandler(setChildCategories);
  const brandHandlers = createCrudHandler(setBrands);
  const tagHandlers = createCrudHandler(setTags);
  const platformOperator = isPlatformOperator(user?.role);
  const canAccessAdminChat = user?.role === 'super_admin';
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

    if (!trimmedPath) {
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
    return <AppSkeleton variant={skeletonVariant} darkMode={themeConfig.darkMode} />;
  }

  return (
    <Suspense fallback={<SuspenseFallback />}>
      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />
      <div className={`relative ${themeConfig.darkMode ? 'dark bg-slate-900' : 'bg-gray-50'}`}>
        {isLoginOpen && <LoginModal onClose={() => setIsLoginOpen(false)} onLogin={handleLogin} onRegister={handleRegister} onGoogleLogin={handleGoogleLogin} />}

        {isAdminRole(user?.role) && (
          <div className="fixed bottom-24 right-6 z-[100] md:bottom-6">
            <button onClick={toggleView} className="bg-slate-800 text-white p-4 rounded-full shadow-2xl hover:bg-slate-700 transition-all flex items-center gap-2 border-4 border-white dark:border-slate-700">
              {currentView.startsWith('admin') ? <Monitor size={24} /> : <LayoutDashboard size={24} />}
              <span className="font-bold hidden md:inline">{currentView.startsWith('admin') ? "View Storefront" : "View Admin Dashboard"}</span>
            </button>
          </div>
        )}

        {currentView === 'admin' ? (
          <AdminLayout onSwitchView={() => setCurrentView('store')} activePage={adminSection} onNavigate={setAdminSection} logo={logo} user={user} onLogout={handleLogout} tenants={headerTenants} activeTenantId={activeTenantId} onTenantChange={tenantSwitcher} onOpenChatCenter={canAccessAdminChat ? handleOpenAdminChat : undefined} hasUnreadChat={canAccessAdminChat ? hasUnreadChat : undefined}>
            {adminSection === 'dashboard' ? <AdminDashboard orders={orders} products={products} /> :
             adminSection === 'orders' ? <AdminOrders orders={orders} courierConfig={courierConfig} onUpdateOrder={handleUpdateOrder} /> :
             adminSection === 'products' ? <AdminProducts products={products} categories={categories} subCategories={subCategories} childCategories={childCategories} brands={brands} tags={tags} onAddProduct={handleAddProduct} onUpdateProduct={handleUpdateProduct} onDeleteProduct={handleDeleteProduct} onBulkDelete={handleBulkDeleteProducts} onBulkUpdate={handleBulkUpdateProducts} /> :
             adminSection === 'landing_pages' ? <AdminLandingPage products={products} landingPages={landingPages} onCreateLandingPage={handleCreateLandingPage} onUpdateLandingPage={handleUpsertLandingPage} onTogglePublish={handleToggleLandingPublish} onPreviewLandingPage={handlePreviewLandingPage} /> :
             adminSection === 'inventory' ? <AdminInventory products={products} /> :
             adminSection === 'reviews' ? <AdminReviews /> :
             adminSection === 'daily_target' ? <AdminDailyTarget /> :
             adminSection === 'gallery' ? <AdminGallery /> :
             adminSection === 'settings' ? <AdminSettings courierConfig={courierConfig} onUpdateCourierConfig={handleUpdateCourierConfig} onNavigate={setAdminSection} user={user} onUpdateProfile={handleUpdateProfile} /> :
             adminSection === 'settings_delivery' ? <AdminDeliverySettings configs={deliveryConfig} onSave={handleUpdateDeliveryConfig} onBack={() => setAdminSection('settings')} /> :
             adminSection === 'settings_courier' ? <AdminCourierSettings config={courierConfig} onSave={handleUpdateCourierConfig} onBack={() => setAdminSection('settings')} /> :
             adminSection === 'settings_facebook_pixel' ? <AdminFacebookPixel config={facebookPixelConfig} onSave={setFacebookPixelConfig} onBack={() => setAdminSection('settings')} /> :
             adminSection === 'admin' ? <AdminControl users={users} roles={roles} onAddRole={handleAddRole} onUpdateRole={handleUpdateRole} onDeleteRole={handleDeleteRole} onUpdateUserRole={handleUpdateUserRole} /> :
             adminSection === 'tenants' ? (platformOperator
               ? <AdminTenantManagement tenants={tenants} onCreateTenant={handleCreateTenant} isCreating={isTenantSeeding} onDeleteTenant={handleDeleteTenant} deletingTenantId={deletingTenantId} />
               : <AdminDashboard orders={orders} products={products} />) :
             adminSection.startsWith('catalog_') ? <AdminCatalog view={adminSection} categories={categories} subCategories={subCategories} childCategories={childCategories} brands={brands} tags={tags} onAddCategory={catHandlers.add} onUpdateCategory={catHandlers.update} onDeleteCategory={catHandlers.delete} onAddSubCategory={subCatHandlers.add} onUpdateSubCategory={subCatHandlers.update} onDeleteSubCategory={subCatHandlers.delete} onAddChildCategory={childCatHandlers.add} onUpdateChildCategory={childCatHandlers.update} onDeleteChildCategory={childCatHandlers.delete} onAddBrand={brandHandlers.add} onUpdateBrand={brandHandlers.update} onDeleteBrand={brandHandlers.delete} onAddTag={tagHandlers.add} onUpdateTag={tagHandlers.update} onDeleteTag={tagHandlers.delete} /> :
             <AdminCustomization logo={logo} onUpdateLogo={handleUpdateLogo} themeConfig={themeConfig} onUpdateTheme={handleUpdateTheme} websiteConfig={websiteConfig} onUpdateWebsiteConfig={handleUpdateWebsiteConfig} initialTab={adminSection === 'customization' ? 'website_info' : adminSection} />
            }
          </AdminLayout>
        ) : (
          <>
            {currentView === 'store' && (
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
            )}
            {currentView === 'detail' && selectedProduct && (
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
            )}
            {currentView === 'checkout' && selectedProduct && (
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
            )}
            {currentView === 'success' && (
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
            )}
            {currentView === 'profile' && user && (
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
            )}
            {currentView === 'landing_preview' && selectedLandingPage && (
              <LandingPagePreview 
                page={selectedLandingPage}
                product={selectedLandingPage.productId ? products.find(p => p.id === selectedLandingPage.productId) : undefined}
                onBack={handleCloseLandingPreview}
                onSubmitLandingOrder={handleLandingOrderSubmit}
              />
            )}
            {currentView === 'image-search' && (
              <StoreImageSearch 
                products={products}
                websiteConfig={websiteConfig}
                user={user}
                onProductClick={handleProductClick}
                onAddToCart={(product, quantity = 1) => handleAddProductToCart(product, quantity)}
                onCheckout={(product, quantity) => handleCheckoutStart(product, quantity)}
                onNavigate={(page) => setCurrentView(page as ViewState)}
              />
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
  );
};

export default App;