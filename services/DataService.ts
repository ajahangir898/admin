import { Product, Order, User, ThemeConfig, WebsiteConfig, Role, DeliveryConfig, LandingPage, Tenant, CreateTenantPayload } from '../types';
import { PRODUCTS, RECENT_ORDERS, DEFAULT_LANDING_PAGES, DEMO_TENANTS, RESERVED_TENANT_SLUGS } from '../constants';
import { getAuthHeader } from './authService';
import { io, Socket } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Socket.IO connection for real-time updates
let socket: Socket | null = null;
let socketInitAttempted = false;

const initSocket = (): Socket | null => {
  if (typeof window === 'undefined') return null;
  if (socket?.connected) return socket;
  if (socketInitAttempted && !socket?.connected) return null; // Don't retry if already failed
  
  socketInitAttempted = true;
  const socketUrl = API_BASE_URL || window.location.origin;
  
  try {
    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 2, // Reduced from 5
      reconnectionDelay: 2000,
      timeout: 5000,
      autoConnect: true
    });
    
    socket.on('connect', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Socket.IO] Connected:', socket?.id);
      }
    });
    
    socket.on('disconnect', (reason) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Socket.IO] Disconnected:', reason);
      }
    });
    
    socket.on('connect_error', () => {
      // Silently handle connection errors in production
      // Socket.IO will fallback to HTTP polling or just not use real-time features
    });
  
  // Listen for data updates and notify listeners
  socket.on('data-update', (payload: { tenantId: string; key: string; data: unknown }) => {
    console.log('[Socket.IO] Data update received:', payload.tenantId, payload.key);
    // Invalidate cache for this key
    invalidateCache(payload.key, payload.tenantId);
    // Notify UI listeners
    notifyDataRefresh(payload.key, payload.tenantId);
  });
  
  socket.on('new-order', (payload: { tenantId: string; data: unknown }) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Socket.IO] New order received:', payload.tenantId);
    }
    invalidateCache('orders', payload.tenantId);
    notifyDataRefresh('orders', payload.tenantId);
  });
  
  socket.on('order-updated', (payload: { tenantId: string; data: unknown }) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Socket.IO] Order updated:', payload.tenantId);
    }
    invalidateCache('orders', payload.tenantId);
    notifyDataRefresh('orders', payload.tenantId);
  });
  
  } catch (e) {
    // Socket initialization failed, continue without real-time features
    return null;
  }
  
  return socket;
};

// Join tenant room for targeted updates
export const joinTenantRoom = (tenantId: string) => {
  const s = initSocket();
  if (s?.connected) {
    s.emit('join-tenant', tenantId);
    if (process.env.NODE_ENV === 'development') {
      console.log('[Socket.IO] Joined tenant room:', tenantId);
    }
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
type DataRefreshListener = (key: string, tenantId?: string) => void;
const dataRefreshListeners = new Set<DataRefreshListener>();

export const onDataRefresh = (listener: DataRefreshListener): (() => void) => {
  dataRefreshListeners.add(listener);
  return () => dataRefreshListeners.delete(listener);
};

const notifyDataRefresh = (key: string, tenantId?: string) => {
  dataRefreshListeners.forEach(listener => {
    try {
      listener(key, tenantId);
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
const CACHE_TTL_MS = 30000; // 30 seconds cache

const getCacheKey = (key: string, tenantId?: string) => `${tenantId || 'public'}::${key}`;

// LocalStorage cache for instant loads
const LOCAL_CACHE_PREFIX = 'ds_cache_';
const LOCAL_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes for localStorage

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
    console.log(`[DataService] Bootstrap loading for tenant: ${scope}`);
    
    try {
      const response = await this.requestTenantApi<{
        data: {
          products: Product[] | null;
          theme_config: ThemeConfig | null;
          website_config: WebsiteConfig | null;
        };
      }>(`/api/tenant-data/${scope}/bootstrap`);
      
      const { products, theme_config, website_config } = response.data;
      console.log(`[DataService] Bootstrap received website_config:`, website_config);
      console.log(`[DataService] Bootstrap carouselItems:`, website_config?.carouselItems);
      
      // Cache the results
      if (products) setCachedData('products', products, tenantId);
      if (theme_config) setCachedData('theme_config', theme_config, tenantId);
      if (website_config) setCachedData('website_config', website_config, tenantId);
      
      // Return server data AS-IS - only use fallback defaults if server returns nothing
      const defaultWebsite = this.getDefaultWebsiteConfig();
      
      return {
        products: products?.length ? products.map((p, i) => ({ ...p, id: p.id ?? i + 1 })) : this.filterByTenant(PRODUCTS, tenantId),
        themeConfig: theme_config || null, // Return null if no theme saved - let admin set it
        websiteConfig: website_config ? { ...defaultWebsite, ...website_config } : defaultWebsite
      };
    } catch (error) {
      console.warn('Bootstrap failed, falling back to individual requests', error);
      // Fallback to individual requests
      const [products, themeConfig, websiteConfig] = await Promise.all([
        this.getProducts(tenantId),
        this.getThemeConfig(tenantId),
        this.getWebsiteConfig(tenantId)
      ]);
      return { products, themeConfig, websiteConfig };
    }
  }

  // Default website config - used as fallback for new tenants (minimal defaults, all content is dynamic)
  private getDefaultWebsiteConfig(): WebsiteConfig {
    return {
      websiteName: '',
      shortDescription: '',
      whatsappNumber: '',
      favicon: null,
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
      carouselItems: [],
      searchHints: '',
      orderLanguage: 'English',
      productCardStyle: 'style2',
      categorySectionStyle: 'style2',
      productSectionStyle: 'style2',
      footerStyle: 'style2',
      chatEnabled: true,
      chatGreeting: '',
      chatOfflineMessage: '',
      chatSupportHours: { from: '09:00', to: '18:00' },
      chatWhatsAppFallback: false
    };
  }

  private async getCollection<T>(key: string, defaultValue: T[], tenantId?: string): Promise<T[]> {
    // Check cache first
    const cached = getCachedData<T[]>(key, tenantId);
    if (cached) return this.filterByTenant(cached as Array<T & { tenantId?: string }>, tenantId);
    
    const remote = await this.fetchTenantDocument<T[]>(key, tenantId);
    if (Array.isArray(remote) && remote.length) {
      setCachedData(key, remote, tenantId);
      return this.filterByTenant(remote as Array<T & { tenantId?: string }>, tenantId);
    }
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

  async get<T>(key: string, defaultValue: T, tenantId?: string): Promise<T> {
    // Check cache for simple gets
    const cached = getCachedData<T>(key, tenantId);
    if (cached !== null) return cached;
    
    const remote = await this.fetchTenantDocument<T>(key, tenantId);
    if (remote === null || remote === undefined) {
      return defaultValue;
    }
    if (Array.isArray(defaultValue) && Array.isArray(remote)) {
      setCachedData(key, remote, tenantId);
      return this.filterByTenant(remote as Array<{ tenantId?: string }> as any, tenantId) as unknown as T;
    }
    setCachedData(key, remote, tenantId);
    return remote;
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
    const remote = await this.get<any[]>(type, defaults, tenantId);
    return remote.length ? remote : defaults;
  }

  async save<T>(key: string, data: T, tenantId?: string): Promise<void> {
    if (DISABLE_REMOTE_SAVE) {
      if (!this.hasLoggedSaveBlock && SHOULD_LOG_SAVE_SKIP) {
        console.info('[DataService] Remote saves are disabled via VITE_DISABLE_REMOTE_SAVE flag.');
        this.hasLoggedSaveBlock = true;
      }
      return;
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
    console.log(`[DataService] Saving ${key} for tenant ${scope}`, data);
    try {
      await this.persistTenantDocument(key, data, tenantId);
      // Invalidate cache when data is saved
      invalidateCache(key, tenantId);
      // Notify listeners that data has been updated
      notifyDataRefresh(key, tenantId);
      console.log(`[DataService] Successfully saved ${key} for tenant ${scope}`);
    } catch (error) {
      console.error(`Failed to persist ${key}`, error);
    }
  }

  async listTenants(): Promise<Tenant[]> {
    try {
      const response = await this.requestTenantApi<TenantApiListResponse>('/api/tenants');
      const tenants = Array.isArray(response?.data)
        ? response.data.map(doc => this.normalizeTenantDocument(doc))
        : [];
      if (tenants.length) {
        return tenants.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      }
    } catch (error) {
      console.warn('Unable to load tenants from backend API', error);
    }

    return this.fetchMockTenants();
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
