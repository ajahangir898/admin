import { Product, Order, User, ThemeConfig, WebsiteConfig, Role, DeliveryConfig, LandingPage, Tenant, CreateTenantPayload, ChatMessage, Category, SubCategory, ChildCategory, Brand, Tag } from '../types';
import { PRODUCTS, RECENT_ORDERS, DEFAULT_LANDING_PAGES, DEMO_TENANTS, RESERVED_TENANT_SLUGS, DEFAULT_CAROUSEL_ITEMS } from '../constants';
import { getAuthHeader } from './authService';
import { io, Socket } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Socket.IO connection for real-time updates
let socket: Socket | null = null;
let socketInitAttempted = false;
let pendingTenantJoin: string | null = null;

const initSocket = (): Socket | null => {
  if (typeof window === 'undefined') return null;
  if (socket?.connected) return socket;
  
  // If socket exists but disconnected, try to reconnect
  if (socket && !socket.connected) {
    socket.connect();
    return socket;
  }
  
  // Only create new socket once
  if (socketInitAttempted) return socket;
  
  socketInitAttempted = true;
  const socketUrl = API_BASE_URL || window.location.origin;
  
  console.log('[Socket.IO] Initializing connection to:', socketUrl);
  
  try {
    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      autoConnect: true,
      withCredentials: true
    });
    
    socket.on('connect', () => {
      console.log('[Socket.IO] Connected:', socket?.id);
      // Join pending tenant room after connection
      if (pendingTenantJoin && socket?.connected) {
        socket.emit('join-tenant', pendingTenantJoin);
        console.log('[Socket.IO] Joined pending tenant room:', pendingTenantJoin);
      }
    });
    
    socket.on('disconnect', (reason) => {
      console.log('[Socket.IO] Disconnected:', reason);
    });
    
    socket.on('connect_error', (error) => {
      console.warn('[Socket.IO] Connection error:', error.message);
    });
  
  // Listen for data updates and notify listeners
  socket.on('data-update', (payload: { tenantId: string; key: string; data: unknown }) => {
    console.log('[Socket.IO] Data update received:', payload.tenantId, payload.key);
    // Map server keys to frontend keys if needed
    const keyMap: Record<string, string> = {
      'theme_config': 'theme',
      'website_config': 'website',
      'delivery_config': 'delivery',
      'landing_pages': 'landing_pages',
      'chat_messages': 'chat_messages'
    };
    const mappedKey = keyMap[payload.key] || payload.key;
    // Invalidate cache for this key
    invalidateCache(payload.key, payload.tenantId);
    // Notify UI listeners - mark as from socket to prevent save loops
    notifyDataRefresh(mappedKey, payload.tenantId, true);
  });

  // Listen for chat message updates
  socket.on('chat-update', (payload: { tenantId: string; data: unknown }) => {
    console.log('[Socket.IO] Chat update received:', payload.tenantId);
    invalidateCache('chat_messages', payload.tenantId);
    notifyDataRefresh('chat_messages', payload.tenantId, true);
  });
  
  socket.on('new-order', (payload: { tenantId: string; data: unknown }) => {
    console.log('[Socket.IO] New order received:', payload.tenantId);
    invalidateCache('orders', payload.tenantId);
    notifyDataRefresh('orders', payload.tenantId, true);
  });
  
  socket.on('order-updated', (payload: { tenantId: string; data: unknown }) => {
    console.log('[Socket.IO] Order updated:', payload.tenantId);
    invalidateCache('orders', payload.tenantId);
    notifyDataRefresh('orders', payload.tenantId, true);
  });
  
  } catch (e) {
    console.error('[Socket.IO] Initialization failed:', e);
    return null;
  }
  
  return socket;
};

// Join tenant room for targeted updates
export const joinTenantRoom = (tenantId: string) => {
  pendingTenantJoin = tenantId; // Store for reconnection
  const s = initSocket();
  if (s?.connected) {
    s.emit('join-tenant', tenantId);
    console.log('[Socket.IO] Joined tenant room:', tenantId);
  } else {
    console.log('[Socket.IO] Socket not connected, will join room on connect');
  }
};

// Leave tenant room
export const leaveTenantRoom = (tenantId: string) => {
  if (socket?.connected) {
    socket.emit('leave-tenant', tenantId);
  }
};

const buildApiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (!API_BASE_URL) {
    return normalizedPath;
  }
  const trimmedBase = API_BASE_URL.replace(/\/$/, '');
  return `${trimmedBase}${normalizedPath}`;
};

type TenantApiListResponse = { data?: Array<Partial<Tenant> & { _id?: string }>; error?: string };
type TenantApiItemResponse = { data?: Partial<Tenant> & { _id?: string }; error?: string };
type TenantDataResponse<T = unknown> = { data?: T; error?: string };

type SavePayload = {
  key: string;
  data: unknown;
  tenantId?: string;
};

type SaveQueueEntry = {
  timer: ReturnType<typeof setTimeout>;
  payload: SavePayload;
  resolvers: Array<{ resolve: () => void; reject: (error: unknown) => void }>;
};

// Data refresh event system for cross-component synchronization
type DataRefreshListener = (key: string, tenantId?: string, fromSocket?: boolean) => void;
const dataRefreshListeners = new Set<DataRefreshListener>();

// Track keys that were just updated from socket to prevent save loops
const socketUpdatedKeys = new Set<string>();

export const isKeyFromSocket = (key: string, tenantId?: string): boolean => {
  const cacheKey = `${tenantId || 'public'}::${key}`;
  return socketUpdatedKeys.has(cacheKey);
};

export const clearSocketFlag = (key: string, tenantId?: string): void => {
  const cacheKey = `${tenantId || 'public'}::${key}`;
  socketUpdatedKeys.delete(cacheKey);
};

export const onDataRefresh = (listener: DataRefreshListener): (() => void) => {
  dataRefreshListeners.add(listener);
  return () => dataRefreshListeners.delete(listener);
};

const notifyDataRefresh = (key: string, tenantId?: string, fromSocket = false) => {
  if (fromSocket) {
    const cacheKey = `${tenantId || 'public'}::${key}`;
    socketUpdatedKeys.add(cacheKey);
    // Clear flag after a short delay to allow state to settle
    setTimeout(() => socketUpdatedKeys.delete(cacheKey), 2000);
  }
  dataRefreshListeners.forEach(listener => {
    try {
      listener(key, tenantId, fromSocket);
    } catch (error) {
      console.error('Data refresh listener error:', error);
    }
  });
};

const SAVE_DEBOUNCE_MS = Math.max(0, Number(import.meta.env?.VITE_REMOTE_SAVE_DEBOUNCE_MS ?? 1200));
const DISABLE_REMOTE_SAVE = String(import.meta.env?.VITE_DISABLE_REMOTE_SAVE ?? '').toLowerCase() === 'true';
const SHOULD_LOG_SAVE_SKIP = Boolean(import.meta.env?.DEV);

// Simple memory cache for frequently accessed data
type CacheEntry<T> = { data: T; timestamp: number; tenantId?: string };
const dataCache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache - increased to prevent frequent resets

const getCacheKey = (key: string, tenantId?: string) => `${tenantId || 'public'}::${key}`;

// LocalStorage cache for instant loads
const LOCAL_CACHE_PREFIX = 'ds_cache_';
const LOCAL_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours for localStorage - user data should persist

const getLocalCache = <T>(key: string, tenantId?: string): T | null => {
  if (typeof window === 'undefined') return null;
  try {
    const cacheKey = LOCAL_CACHE_PREFIX + getCacheKey(key, tenantId);
    const stored = localStorage.getItem(cacheKey);
    if (!stored) return null;
    const { data, timestamp } = JSON.parse(stored);
    if (Date.now() - timestamp > LOCAL_CACHE_TTL_MS) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    return data as T;
  } catch {
    return null;
  }
};

const setLocalCache = <T>(key: string, data: T, tenantId?: string): void => {
  if (typeof window === 'undefined') return;
  try {
    const cacheKey = LOCAL_CACHE_PREFIX + getCacheKey(key, tenantId);
    localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // localStorage full or unavailable
  }
};

const getCachedData = <T>(key: string, tenantId?: string): T | null => {
  const cacheKey = getCacheKey(key, tenantId);
  // Check memory cache first
  const entry = dataCache.get(cacheKey) as CacheEntry<T> | undefined;
  if (entry && Date.now() - entry.timestamp <= CACHE_TTL_MS) {
    return entry.data;
  }
  if (entry) dataCache.delete(cacheKey);
  // Fallback to localStorage for instant loads
  const localData = getLocalCache<T>(key, tenantId);
  if (localData !== null) {
    // Restore to memory cache
    dataCache.set(cacheKey, { data: localData, timestamp: Date.now(), tenantId });
    return localData;
  }
  return null;
};

const setCachedData = <T>(key: string, data: T, tenantId?: string): void => {
  const cacheKey = getCacheKey(key, tenantId);
  dataCache.set(cacheKey, { data, timestamp: Date.now(), tenantId });
  // Also persist to localStorage for instant next load
  setLocalCache(key, data, tenantId);
};

const invalidateCache = (key: string, tenantId?: string): void => {
  const cacheKey = getCacheKey(key, tenantId);
  dataCache.delete(cacheKey);
  if (typeof window !== 'undefined') {
    try { localStorage.removeItem(LOCAL_CACHE_PREFIX + cacheKey); } catch {}
  }
};

// Request deduplication - prevent multiple concurrent requests for the same data
const pendingRequests = new Map<string, Promise<unknown>>();

const deduplicateRequest = async <T>(
  key: string,
  tenantId: string | undefined,
  requestFn: () => Promise<T>
): Promise<T> => {
  const cacheKey = getCacheKey(key, tenantId);
  
  // Check if there's already a pending request for this data
  const pending = pendingRequests.get(cacheKey);
  if (pending) {
    return pending as Promise<T>;
  }
  
  // Create new request and track it
  const promise = requestFn().finally(() => {
    pendingRequests.delete(cacheKey);
  });
  
  pendingRequests.set(cacheKey, promise);
  return promise;
};

class DataServiceImpl {
  private saveQueue = new Map<string, SaveQueueEntry>();
  private hasLoggedSaveBlock = false;

  private sanitizeTenantSlug(value?: string | null): string {
    if (!value) return '';
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/^-+|-+$/g, '')
      .slice(0, 63);
  }

  private omitUndefined<T extends Record<string, any>>(payload: T): T {
    const sanitized: Record<string, any> = {};
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined) {
        sanitized[key] = value;
      }
    });
    return sanitized as T;
  }

  private filterByTenant<T extends { tenantId?: string }>(items: T[], tenantId?: string): T[] {
    if (!tenantId) return items;
    return items.filter(item => !item.tenantId || item.tenantId === tenantId);
  }

  private resolveTenantScope(tenantId?: string) {
    return tenantId?.trim() ? tenantId.trim() : 'public';
  }

  private getSaveQueueKey(key: string, tenantId?: string) {
    return `${this.resolveTenantScope(tenantId)}::${key}`;
  }

  private enqueueSave<T>(key: string, data: T, tenantId?: string): Promise<void> {
    const queueKey = this.getSaveQueueKey(key, tenantId);
    return new Promise((resolve, reject) => {
      const existing = this.saveQueue.get(queueKey);
      if (existing) {
        clearTimeout(existing.timer);
        existing.payload = { key, data, tenantId };
        existing.resolvers.push({ resolve, reject });
        existing.timer = setTimeout(() => this.flushQueuedSave(queueKey), SAVE_DEBOUNCE_MS);
        return;
      }

      const timer = setTimeout(() => this.flushQueuedSave(queueKey), SAVE_DEBOUNCE_MS);
      this.saveQueue.set(queueKey, {
        timer,
        payload: { key, data, tenantId },
        resolvers: [{ resolve, reject }]
      });
    });
  }

  private async flushQueuedSave(queueKey: string) {
    const entry = this.saveQueue.get(queueKey);
    if (!entry) return;
    clearTimeout(entry.timer);
    this.saveQueue.delete(queueKey);
    try {
      await this.commitSave(entry.payload.key, entry.payload.data, entry.payload.tenantId);
      entry.resolvers.forEach(({ resolve }) => resolve());
    } catch (error) {
      entry.resolvers.forEach(({ reject }) => reject(error));
    }
  }

  private normalizeHeaders(headers?: HeadersInit) {
    if (!headers) return {} as Record<string, string>;
    if (headers instanceof Headers) {
      return Object.fromEntries(headers.entries());
    }
    if (Array.isArray(headers)) {
      return headers.reduce<Record<string, string>>((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});
    }
    return { ...headers };
  }

  private async requestTenantApi<T>(path: string, init?: RequestInit): Promise<T> {
    if (typeof fetch === 'undefined') {
      throw new Error('Fetch API is not available in this environment');
    }
    const { headers, body, ...rest } = init || {};
    const normalizedHeaders = this.normalizeHeaders(headers);
    const authHeaders = this.normalizeHeaders(getAuthHeader());
    
    const response = await fetch(buildApiUrl(path), {
      credentials: 'include',
      ...rest,
      headers: {
        ...authHeaders,
        ...normalizedHeaders
      },
      body
    });
    const raw = await response.text();
    const payload = raw ? JSON.parse(raw) : null;
    if (!response.ok) {
      const message = (payload as { error?: string } | null)?.error || `Request failed (${response.status})`;
      throw new Error(message);
    }
    return payload as T;
  }

  private async fetchTenantDocument<T>(key: string, tenantId?: string): Promise<T | null> {
    const scope = this.resolveTenantScope(tenantId);
    try {
      const response = await this.requestTenantApi<TenantDataResponse<T>>(`/api/tenant-data/${scope}/${key}`);
      if (response && 'data' in response) {
        return (response.data ?? null) as T | null;
      }
      return null;
    } catch (error) {
      console.warn(`Unable to load ${key} for tenant ${scope}`, error);
      return null;
    }
  }

  private async persistTenantDocument<T>(key: string, data: T, tenantId?: string): Promise<void> {
    const scope = this.resolveTenantScope(tenantId);
    await this.requestTenantApi(`/api/tenant-data/${scope}/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ data })
    });
  }

  private normalizeTenantDocument(doc: Partial<Tenant> & { _id?: string }): Tenant {
    const idValue = doc.id || doc._id || doc.subdomain || `tenant-${Date.now()}`;
    return { ...(doc as Tenant), id: String(idValue) };
  }

  private async fetchMockTenants(): Promise<Tenant[]> {
    if (typeof fetch === 'undefined') {
      return DEMO_TENANTS;
    }
    try {
      const response = await fetch(buildApiUrl('/api/tenants'));
      if (!response.ok) {
        throw new Error(`Unable to load tenants (${response.status})`);
      }
      const payload = await response.json();
      return Array.isArray(payload?.data) ? (payload.data as Tenant[]) : DEMO_TENANTS;
    } catch (error) {
      console.warn('Falling back to demo tenants', error);
      return DEMO_TENANTS;
    }
  }

  // Bootstrap: Fetch all critical data in ONE API call
  async bootstrap(tenantId?: string): Promise<{
    products: Product[];
    themeConfig: ThemeConfig | null;
    websiteConfig: WebsiteConfig;
  }> {
    const scope = this.resolveTenantScope(tenantId);
    const defaultWebsite = this.getDefaultWebsiteConfig();

    // Serve cached data instantly to avoid blocking paint, then revalidate in background
    const cachedProducts = getCachedData<Product[]>('products', tenantId);
    const cachedTheme = getCachedData<ThemeConfig | null>('theme_config', tenantId);
    const cachedWebsite = getCachedData<WebsiteConfig>('website_config', tenantId);
    
    // Only use cache if we have actual products (not empty array)
    const hasValidProductCache = cachedProducts && cachedProducts.length > 0;
    const hasOtherCache = Boolean(cachedTheme || cachedWebsite);

    if (hasValidProductCache) {
      // Kick off background revalidation without blocking UI
      this.revalidateBootstrap(scope, tenantId, defaultWebsite, cachedProducts).catch(err => {
        console.warn('[DataService] Bootstrap revalidation failed', err);
      });

      return {
        products: cachedProducts.map((p, i) => ({ ...p, id: p.id ?? i + 1 })),
        themeConfig: cachedTheme ?? null,
        websiteConfig: cachedWebsite ? { ...defaultWebsite, ...cachedWebsite } : defaultWebsite
      };
    }
    
    // If no product cache but have other cached data, still fetch fresh but use other caches
    if (hasOtherCache) {
      const freshData = await this.fetchFreshBootstrap(scope, tenantId, defaultWebsite);
      return {
        products: freshData.products,
        themeConfig: freshData.themeConfig ?? cachedTheme ?? null,
        websiteConfig: freshData.websiteConfig ?? (cachedWebsite ? { ...defaultWebsite, ...cachedWebsite } : defaultWebsite)
      };
    }

    return this.fetchFreshBootstrap(scope, tenantId, defaultWebsite);
  }

  private async revalidateBootstrap(scope: string, tenantId: string | undefined, defaultWebsite: WebsiteConfig, cachedProducts?: Product[]) {
    const freshData = await this.fetchFreshBootstrap(scope, tenantId, defaultWebsite, true);
    
    // If fresh data has different products than cached, notify UI to refresh
    if (freshData.products.length !== (cachedProducts?.length || 0) ||
        JSON.stringify(freshData.products.map(p => p.id).sort()) !== JSON.stringify((cachedProducts || []).map(p => p.id).sort())) {
      console.log('[DataService] Background revalidation found new products, notifying UI');
      notifyDataRefresh('products', tenantId, false);
    }
  }

  private async fetchFreshBootstrap(scope: string, tenantId: string | undefined, defaultWebsite: WebsiteConfig, isBackground = false) {
    console.log(`[DataService] Bootstrap loading for tenant: ${scope}${isBackground ? ' (background)' : ''}`);

    try {
      // Check if we have prefetched data from entry-client.tsx
      let responseData: { data: { products: Product[] | null; theme_config: ThemeConfig | null; website_config: WebsiteConfig | null } } | null = null;
      
      if (!isBackground && typeof window !== 'undefined' && (window as any).__PREFETCHED_BOOTSTRAP__) {
        try {
          const prefetched = await (window as any).__PREFETCHED_BOOTSTRAP__;
          if (prefetched?.data) {
            console.log('[DataService] Using prefetched bootstrap data');
            responseData = prefetched;
            // Clear prefetch to avoid reuse
            delete (window as any).__PREFETCHED_BOOTSTRAP__;
          }
        } catch (e) {
          console.warn('[DataService] Prefetch failed, fetching fresh');
        }
      }
      
      if (!responseData) {
        responseData = await this.requestTenantApi<{
          data: {
            products: Product[] | null;
            theme_config: ThemeConfig | null;
            website_config: WebsiteConfig | null;
          };
        }>(`/api/tenant-data/${scope}/bootstrap`);
      }
      
      const { products, theme_config, website_config } = responseData.data;

      // Cache the results for subsequent fast loads
      if (products) setCachedData('products', products, tenantId);
      if (theme_config) setCachedData('theme_config', theme_config, tenantId);
      if (website_config) setCachedData('website_config', website_config, tenantId);
      
      return {
        products: products?.length ? products.map((p, i) => ({ ...p, id: p.id ?? i + 1 })) : this.filterByTenant(PRODUCTS, tenantId),
        themeConfig: theme_config || null,
        websiteConfig: website_config ? { ...defaultWebsite, ...website_config } : defaultWebsite
      };
    } catch (error) {
      if (!isBackground) {
        console.warn('Bootstrap failed, falling back to individual requests', error);
        const [products, themeConfig, websiteConfig] = await Promise.all([
          this.getProducts(tenantId),
          this.getThemeConfig(tenantId),
          this.getWebsiteConfig(tenantId)
        ]);
        return { products, themeConfig, websiteConfig };
      }
      throw error;
    }
  }

  // Default website config - used as fallback for new tenants (minimal defaults, all content is dynamic)
  private getDefaultWebsiteConfig(): WebsiteConfig {
    return {
      websiteName: '',
      shortDescription: '',
      whatsappNumber: '',
      favicon: null,
      headerLogo: null,
      footerLogo: null,
      addresses: [],
      emails: [],
      phones: [],
      socialLinks: [],
      footerQuickLinks: [],
      footerUsefulLinks: [],
      showMobileHeaderCategory: true,
      showNewsSlider: false,
      headerSliderText: '',
      hideCopyright: false,
      hideCopyrightText: false,
      showPoweredBy: false,
      brandingText: '',
      carouselItems: DEFAULT_CAROUSEL_ITEMS.map(item => ({ ...item })),
      searchHints: '',
      orderLanguage: 'English',
      productCardStyle: 'style2',
      categorySectionStyle: 'style5',
      productSectionStyle: 'style2',
      footerStyle: 'style2',
      chatEnabled: true,
      chatGreeting: '',
      chatOfflineMessage: '',
      chatSupportHours: { from: '09:00', to: '18:00' },
      chatWhatsAppFallback: false
    };
  }

  // Secondary data: Fetch all secondary data in ONE API call
  async getSecondaryData(tenantId?: string): Promise<{
    orders: Order[];
    logo: string | null;
    deliveryConfig: DeliveryConfig[];
    chatMessages: ChatMessage[];
    landingPages: LandingPage[];
    categories: Category[];
    subcategories: SubCategory[];
    childcategories: ChildCategory[];
    brands: Brand[];
    tags: Tag[];
  }> {
    const scope = this.resolveTenantScope(tenantId);
    console.log(`[DataService] Loading secondary data for tenant: ${scope}`);
    
    // Default catalog data for auto-population
    const defaultCategories = [
      { id: '1', name: 'Phones', icon: '', status: 'Active' as const },
      { id: '2', name: 'Watches', icon: '', status: 'Active' as const }
    ];
    const defaultSubCategories = [
      { id: '1', categoryId: '1', name: 'Smartphones', status: 'Active' as const },
      { id: '2', categoryId: '1', name: 'Feature Phones', status: 'Active' as const }
    ];
    const defaultBrands = [
      { id: '1', name: 'Apple', logo: '', status: 'Active' as const },
      { id: '2', name: 'Samsung', logo: '', status: 'Active' as const }
    ];
    const defaultTags = [
      { id: '1', name: 'Flash Deal', status: 'Active' as const },
      { id: '2', name: 'New Arrival', status: 'Active' as const }
    ];

    // Serve cached data immediately
    const cachedOrders = getCachedData<Order[]>('orders', tenantId);
    const cachedLogo = getCachedData<string | null>('logo', tenantId);
    const cachedDelivery = getCachedData<DeliveryConfig[]>('delivery_config', tenantId);
    const cachedChat = getCachedData<ChatMessage[]>('chat_messages', tenantId);
    const cachedLanding = getCachedData<LandingPage[]>('landing_pages', tenantId);
    const cachedCategories = getCachedData<Category[]>('categories', tenantId);
    const cachedSubcategories = getCachedData<SubCategory[]>('subcategories', tenantId);
    const cachedChildCategories = getCachedData<ChildCategory[]>('childcategories', tenantId);
    const cachedBrands = getCachedData<Brand[]>('brands', tenantId);
    const cachedTags = getCachedData<Tag[]>('tags', tenantId);

    const hasCachedSecondary = Boolean(
      (cachedOrders && cachedOrders.length) || cachedLogo || (cachedDelivery && cachedDelivery.length) ||
      (cachedChat && cachedChat.length) || (cachedLanding && cachedLanding.length) ||
      (cachedCategories && cachedCategories.length) || (cachedSubcategories && cachedSubcategories.length) ||
      (cachedChildCategories && cachedChildCategories.length) || (cachedBrands && cachedBrands.length) ||
      (cachedTags && cachedTags.length)
    );

    if (hasCachedSecondary) {
      this.revalidateSecondary(scope, tenantId, {
        defaultBrands,
        defaultCategories,
        defaultSubCategories,
        defaultTags
      }).catch(err => console.warn('[DataService] Secondary revalidation failed', err));

      return {
        orders: cachedOrders || [],
        logo: cachedLogo || null,
        deliveryConfig: cachedDelivery || [],
        chatMessages: cachedChat || [],
        landingPages: cachedLanding || [],
        categories: cachedCategories && cachedCategories.length ? cachedCategories : defaultCategories,
        subcategories: cachedSubcategories && cachedSubcategories.length ? cachedSubcategories : defaultSubCategories,
        childcategories: cachedChildCategories || [],
        brands: cachedBrands && cachedBrands.length ? cachedBrands : defaultBrands,
        tags: cachedTags && cachedTags.length ? cachedTags : defaultTags
      };
    }
    
    return this.fetchFreshSecondary(scope, tenantId, {
      defaultBrands,
      defaultCategories,
      defaultSubCategories,
      defaultTags
    });
  }

  private async revalidateSecondary(scope: string, tenantId: string | undefined, defaults: { defaultCategories: Category[]; defaultSubCategories: SubCategory[]; defaultBrands: Brand[]; defaultTags: Tag[]; }) {
    await this.fetchFreshSecondary(scope, tenantId, defaults, true);
  }

  private async fetchFreshSecondary(
    scope: string,
    tenantId: string | undefined,
    defaults: { defaultCategories: Category[]; defaultSubCategories: SubCategory[]; defaultBrands: Brand[]; defaultTags: Tag[]; },
    isBackground = false
  ) {
    try {
      const response = await this.requestTenantApi<{
        data: {
          orders: Order[] | null;
          logo: string | null;
          delivery_config: DeliveryConfig[] | null;
          chat_messages: ChatMessage[] | null;
          landing_pages: LandingPage[] | null;
          categories: Category[] | null;
          subcategories: SubCategory[] | null;
          childcategories: ChildCategory[] | null;
          brands: Brand[] | null;
          tags: Tag[] | null;
        };
      }>(`/api/tenant-data/${scope}/secondary`);

      const data = response.data;

      // Cache results for quick subsequent loads
      setCachedData('orders', data.orders || [], tenantId);
      setCachedData('logo', data.logo || null, tenantId);
      setCachedData('delivery_config', data.delivery_config || [], tenantId);
      setCachedData('chat_messages', data.chat_messages || [], tenantId);
      setCachedData('landing_pages', data.landing_pages || [], tenantId);
      setCachedData('categories', data.categories || [], tenantId);
      setCachedData('subcategories', data.subcategories || [], tenantId);
      setCachedData('childcategories', data.childcategories || [], tenantId);
      setCachedData('brands', data.brands || [], tenantId);
      setCachedData('tags', data.tags || [], tenantId);
      
      return {
        orders: data.orders || [],
        logo: data.logo || null,
        deliveryConfig: data.delivery_config || [],
        chatMessages: data.chat_messages || [],
        landingPages: data.landing_pages || [],
        categories: (data.categories && data.categories.length > 0) ? data.categories : defaults.defaultCategories,
        subcategories: (data.subcategories && data.subcategories.length > 0) ? data.subcategories : defaults.defaultSubCategories,
        childcategories: data.childcategories || [],
        brands: (data.brands && data.brands.length > 0) ? data.brands : defaults.defaultBrands,
        tags: (data.tags && data.tags.length > 0) ? data.tags : defaults.defaultTags
      };
    } catch (error) {
      if (isBackground) throw error;
      console.warn('[DataService] Secondary data fetch failed', error);
      return {
        orders: [],
        logo: null,
        deliveryConfig: [],
        chatMessages: [],
        landingPages: [],
        categories: defaults.defaultCategories,
        subcategories: defaults.defaultSubCategories,
        childcategories: [],
        brands: defaults.defaultBrands,
        tags: defaults.defaultTags
      };
    }
  }

  private async getCollection<T>(key: string, defaultValue: T[], tenantId?: string): Promise<T[]> {
    // Check cache first
    const cached = getCachedData<T[]>(key, tenantId);
    if (cached && cached.length > 0) return this.filterByTenant(cached as Array<T & { tenantId?: string }>, tenantId);
    
    const remote = await this.fetchTenantDocument<T[]>(key, tenantId);
    if (Array.isArray(remote) && remote.length > 0) {
      setCachedData(key, remote, tenantId);
      return this.filterByTenant(remote as Array<T & { tenantId?: string }>, tenantId);
    }
    
    // If remote is empty but we have cached data (even if expired), prefer cache over defaults
    if (cached && cached.length > 0) {
      console.warn(`[DataService] Remote ${key} is empty, using cached data`);
      return this.filterByTenant(cached as Array<T & { tenantId?: string }>, tenantId);
    }
    
    // Only return defaults if we have no cached data at all
    console.info(`[DataService] No data for ${key}, using defaults`);
    return defaultValue;
  }

  async getProducts(tenantId?: string): Promise<Product[]> {
    const fallback = this.filterByTenant(PRODUCTS, tenantId);
    const remote = await this.getCollection<Product>('products', [], tenantId);
    const normalized = remote.length ? remote : fallback;
    return normalized.map((product, index) => ({ ...product, id: product.id ?? index + 1 }));
  }

  async getOrders(tenantId?: string): Promise<Order[]> {
    const fallback = this.filterByTenant(RECENT_ORDERS, tenantId);
    const remote = await this.getCollection<Order>('orders', [], tenantId);
    return remote.length ? remote : fallback;
  }

  async getLandingPages(tenantId?: string): Promise<LandingPage[]> {
    const remote = await this.getCollection<LandingPage>('landing_pages', [], tenantId);
    return remote.length ? remote : DEFAULT_LANDING_PAGES;
  }

  async getUsers(tenantId?: string): Promise<User[]> {
    return this.getCollection<User>('users', [], tenantId);
  }

  async getRoles(tenantId?: string): Promise<Role[]> {
    const defaultRoles: Role[] = [
      { id: 'manager', name: 'Store Manager', description: 'Can manage products and orders', permissions: [
        { resource: 'dashboard', actions: ['read'] },
        { resource: 'orders', actions: ['read', 'write', 'edit'] },
        { resource: 'products', actions: ['read', 'write', 'edit'] }
      ] },
      { id: 'support', name: 'Support Agent', description: 'Can view orders and dashboard', permissions: [
        { resource: 'dashboard', actions: ['read'] },
        { resource: 'orders', actions: ['read'] }
      ] }
    ];
    const remote = await this.getCollection<Role>('roles', [], tenantId);
    return remote.length ? remote : defaultRoles;
  }

  async get<T>(key: string, defaultValue: T, tenantId?: string, skipCache = false): Promise<T> {
    // Check cache for simple gets (skip for real-time data like chat)
    if (!skipCache) {
      const cached = getCachedData<T>(key, tenantId);
      if (cached !== null) return cached;
    }
    
    // Deduplicate concurrent requests for the same data
    return deduplicateRequest(key, tenantId, async () => {
      const remote = await this.fetchTenantDocument<T>(key, tenantId);
      if (remote === null || remote === undefined) {
        return defaultValue;
      }
      if (Array.isArray(defaultValue) && Array.isArray(remote)) {
        if (!skipCache) setCachedData(key, remote, tenantId);
        return this.filterByTenant(remote as Array<{ tenantId?: string }> as any, tenantId) as unknown as T;
      }
      if (!skipCache) setCachedData(key, remote, tenantId);
      return remote;
    });
  }

  // Get chat messages - always fresh, no cache
  async getChatMessages(tenantId?: string): Promise<ChatMessage[]> {
    return this.get<ChatMessage[]>('chat_messages', [], tenantId, true);
  }

  async getThemeConfig(tenantId?: string): Promise<ThemeConfig | null> {
    // Return server data AS-IS - no defaults, fully dynamic from admin settings
    const remote = await this.get<ThemeConfig | null>('theme_config', null, tenantId);
    return remote;
  }

  async getWebsiteConfig(tenantId?: string): Promise<WebsiteConfig> {
    // Use minimal defaults - all content should come from the database
    const defaultConfig = this.getDefaultWebsiteConfig();
    return this.get<WebsiteConfig>('website_config', defaultConfig, tenantId);
  }

  async getDeliveryConfig(tenantId?: string): Promise<DeliveryConfig[]> {
    const defaults: DeliveryConfig[] = [
      { type: 'Regular', isEnabled: true, division: 'Dhaka', insideCharge: 60, outsideCharge: 120, freeThreshold: 0, note: 'Standard delivery time 2-3 days' },
      { type: 'Express', isEnabled: true, division: 'Dhaka', insideCharge: 100, outsideCharge: 200, freeThreshold: 5000, note: 'Next day delivery available' },
      { type: 'Free', isEnabled: false, division: 'Dhaka', insideCharge: 0, outsideCharge: 0, freeThreshold: 0, note: 'Promotional free shipping' }
    ];
    const remote = await this.get<DeliveryConfig[]>('delivery_config', defaults, tenantId);
    return remote.length ? remote : defaults;
  }

  async getCatalog(type: string, defaults: any[], tenantId?: string): Promise<any[]> {
    // Check cache first to avoid unnecessary API calls
    const cached = getCachedData<any[]>(type, tenantId);
    if (cached && cached.length > 0) {
      console.log(`[DataService] Using cached ${type}`);
      return cached;
    }
    
    const remote = await this.get<any[]>(type, [], tenantId);
    
    // If we got remote data, use it
    if (remote && remote.length > 0) {
      return remote;
    }
    
    // If remote is empty but we have cached data, prefer cache
    if (cached && cached.length > 0) {
      console.warn(`[DataService] Remote ${type} is empty, preserving cached data`);
      return cached;
    }
    
    // Only use defaults if we have no data at all (new tenant)
    console.info(`[DataService] No ${type} found, using defaults for new tenant`);
    return defaults;
  }

  async save<T>(key: string, data: T, tenantId?: string): Promise<void> {
    if (DISABLE_REMOTE_SAVE) {
      if (!this.hasLoggedSaveBlock && SHOULD_LOG_SAVE_SKIP) {
        console.info('[DataService] Remote saves are disabled via VITE_DISABLE_REMOTE_SAVE flag.');
        this.hasLoggedSaveBlock = true;
      }
      return;
    }

    // Safety check: Prevent saving empty products array to avoid data loss
    if (key === 'products' && Array.isArray(data) && data.length === 0) {
      const cached = getCachedData<T[]>('products', tenantId);
      if (cached && cached.length > 0) {
        console.warn('[DataService] Blocked enqueueing empty products save - cache has data. This prevents accidental data loss.');
        return;
      }
    }

    if (SAVE_DEBOUNCE_MS <= 0) {
      await this.commitSave(key, data, tenantId);
      return;
    }

    await this.enqueueSave(key, data, tenantId);
  }

  /**
   * Save immediately without debounce - use for critical updates like theme changes
   * that need to reflect instantly on the storefront
   */
  async saveImmediate<T>(key: string, data: T, tenantId?: string): Promise<void> {
    if (DISABLE_REMOTE_SAVE) {
      return;
    }

    // Safety check: Prevent saving empty products array to avoid data loss
    if (key === 'products' && Array.isArray(data) && data.length === 0) {
      const cached = getCachedData<T[]>('products', tenantId);
      if (cached && cached.length > 0) {
        console.warn('[DataService] Blocked saving empty products array - cache has data. This prevents accidental data loss.');
        return;
      }
    }
    
    // Cancel any pending debounced save for this key
    const queueKey = this.getSaveQueueKey(key, tenantId);
    const existing = this.saveQueue.get(queueKey);
    if (existing) {
      clearTimeout(existing.timer);
      this.saveQueue.delete(queueKey);
      // Resolve pending promises since we're saving now
      existing.resolvers.forEach(({ resolve }) => resolve());
    }
    
    await this.commitSave(key, data, tenantId);
  }

  private async commitSave<T>(key: string, data: T, tenantId?: string): Promise<void> {
    const scope = this.resolveTenantScope(tenantId);
    
    // Safety check: Prevent saving empty products array when cache has data
    // This prevents race conditions from wiping out product data
    if (key === 'products' && Array.isArray(data) && data.length === 0) {
      const cached = getCachedData<T[]>('products', tenantId);
      if (cached && cached.length > 0) {
        console.warn(`[DataService] Blocked saving empty products array for tenant ${scope} - cache has ${cached.length} products`);
        return;
      }
    }
    
    console.log(`[DataService] Saving ${key} for tenant ${scope}`, Array.isArray(data) ? `(${data.length} items)` : data);
    try {
      await this.persistTenantDocument(key, data, tenantId);
      // Update cache with new data
      setCachedData(key, data, tenantId);
      // NOTE: Don't call notifyDataRefresh here - the server will emit a socket event
      // that triggers the refresh. Calling it here causes infinite save loops.
      console.log(`[DataService] Successfully saved ${key} for tenant ${scope}`);
    } catch (error) {
      console.error(`Failed to persist ${key}`, error);
    }
  }

  async listTenants(forceRefresh = false): Promise<Tenant[]> {
    // Check cache first for instant load (skip if force refresh)
    if (!forceRefresh) {
      const cached = getCachedData<Tenant[]>('tenants', 'global');
      if (cached && cached.length) {
        console.log('[DataService] Using cached tenant list');
        return cached;
      }
    }
    
    try {
      const response = await this.requestTenantApi<TenantApiListResponse>('/api/tenants');
      const tenants = Array.isArray(response?.data)
        ? response.data.map(doc => this.normalizeTenantDocument(doc))
        : [];
      // Always cache the result (even empty) and return it
      const sorted = tenants.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setCachedData('tenants', sorted, 'global');
      return sorted;
    } catch (error) {
      console.warn('Unable to load tenants from backend API', error);
    }

    return this.fetchMockTenants();
  }

  // Fast subdomain resolution - single API call instead of loading all tenants
  async resolveTenantBySubdomain(subdomain: string): Promise<{ id: string; name: string; subdomain: string } | null> {
    if (!subdomain) return null;
    
    // Check cache first for instant resolution
    const cached = getCachedData<{ id: string; name: string; subdomain: string }>(`tenant_resolve_${subdomain}`, 'global');
    if (cached) {
      console.log('[DataService] Using cached tenant resolution for:', subdomain);
      return cached;
    }
    
    try {
      const response = await this.requestTenantApi<{ data: { id?: unknown; _id?: unknown; name: string; subdomain: string; status: string } }>(
        `/api/tenants/resolve/${encodeURIComponent(subdomain)}`
      );
      const raw = response?.data as any;
      const rawId = raw?.id ?? raw?._id;
      const id = rawId != null ? String(rawId) : '';
      if (id) {
        const normalized = { id, name: String(raw?.name ?? ''), subdomain: String(raw?.subdomain ?? subdomain) };
        // Cache the resolved tenant for future loads
        setCachedData(`tenant_resolve_${subdomain}`, normalized, 'global');
        return normalized;
      }
    } catch (error) {
      console.warn('[DataService] Failed to resolve tenant by subdomain:', subdomain, error);
    }
    return null;
  }

  async seedTenant(payload: CreateTenantPayload): Promise<Tenant> {
    if (!payload?.name || !payload?.subdomain || !payload?.contactEmail) {
      throw new Error('name, subdomain and contactEmail are required');
    }
    if (!payload?.adminEmail || !payload?.adminPassword) {
      throw new Error('adminEmail and adminPassword are required');
    }

    const normalizedSubdomain = this.sanitizeTenantSlug(payload.subdomain);
    if (!normalizedSubdomain) {
      throw new Error('Subdomain must contain letters, numbers, or dashes.');
    }
    if (RESERVED_TENANT_SLUGS.includes(normalizedSubdomain)) {
      throw new Error('This subdomain is reserved. Choose another.');
    }

    const existingTenants = await this.listTenants();
    const slugConflict = existingTenants.some(
      tenant => this.sanitizeTenantSlug(tenant.subdomain) === normalizedSubdomain
    );
    if (slugConflict) {
      throw new Error('Subdomain already in use. Pick a different slug.');
    }
    const adminEmail = payload.adminEmail.trim().toLowerCase();
    const adminPassword = payload.adminPassword.trim();
    if (!/\S+@\S+\.\S+/.test(adminEmail)) {
      throw new Error('Provide a valid admin email');
    }
    if (adminPassword.length < 6) {
      throw new Error('Admin password must be at least 6 characters');
    }
    const now = new Date().toISOString();
    const baseTenant = this.omitUndefined<Omit<Tenant, 'id'>>({
      name: payload.name.trim(),
      subdomain: normalizedSubdomain,
      customDomain: null,
      contactEmail: payload.contactEmail.trim(),
      contactName: payload.contactName?.trim() || undefined,
      adminEmail,
      adminPassword,
      plan: payload.plan || 'starter',
      status: 'trialing',
      createdAt: now,
      updatedAt: now,
      onboardingCompleted: false,
      locale: 'en-US',
      currency: 'USD',
      branding: {},
      settings: {}
    });

    const apiPayload = {
      name: baseTenant.name,
      subdomain: normalizedSubdomain,
      contactEmail: baseTenant.contactEmail,
      contactName: baseTenant.contactName,
      adminEmail,
      adminPassword,
      plan: baseTenant.plan
    } satisfies CreateTenantPayload;

    const apiResponse = await this.requestTenantApi<TenantApiItemResponse>('/api/tenants', {
      method: 'POST',
      body: JSON.stringify(apiPayload)
    });
    if (apiResponse?.data) {
      return this.normalizeTenantDocument(apiResponse.data);
    }

    throw new Error('Unable to create tenant. Backend API is unavailable.');
  }

  async deleteTenant(tenantId: string): Promise<void> {
    if (!tenantId) {
      throw new Error('tenantId is required');
    }

    await this.requestTenantApi(`/api/tenants/${tenantId}`, {
      method: 'DELETE'
    });
  }
}

export const DataService = new DataServiceImpl();
