
import { Product, Order, User, ThemeConfig, WebsiteConfig, Role, Category, SubCategory, ChildCategory, Brand, Tag, DeliveryConfig, LandingPage, Tenant, CreateTenantPayload } from '../types';
import { PRODUCTS, RECENT_ORDERS, DEFAULT_LANDING_PAGES, DEMO_TENANTS } from '../constants';
import { db } from './firebaseConfig';
import { collection, getDocs, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore/lite';

class DataServiceImpl {
  private filterByTenant<T extends { tenantId?: string }>(items: T[], tenantId?: string): T[] {
    if (!tenantId) return items;
    return items.filter(item => !item.tenantId || item.tenantId === tenantId);
  }

  // --- Generic Helpers with Fallback ---
  
  private async safeFirebaseCall<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
    try {
      if (!db) throw new Error("Firebase DB not initialized");
      return await operation();
    } catch (error) {
      console.warn(`Firebase operation failed, falling back to defaults.`, error);
      return fallback;
    }
  }

  private async fetchMockTenants(): Promise<Tenant[]> {
    if (typeof fetch === 'undefined') {
      return DEMO_TENANTS;
    }
    try {
      const response = await fetch('/api/tenants');
      if (!response.ok) {
        throw new Error(`Unable to load tenants (${response.status})`);
      }
      const payload = await response.json();
      return Array.isArray(payload?.data) ? payload.data as Tenant[] : DEMO_TENANTS;
    } catch (error) {
      console.warn('Falling back to demo tenants', error);
      return DEMO_TENANTS;
    }
  }

  // --- Data Access Methods ---

  async getProducts(tenantId?: string): Promise<Product[]> {
    const fallback = this.filterByTenant(PRODUCTS, tenantId);
    return this.safeFirebaseCall(async () => {
      const snapshot = await getDocs(collection(db, 'products'));
      const items = snapshot.docs.map(d => ({ id: Number(d.id), ...d.data() } as Product));
      const filtered = this.filterByTenant(items, tenantId);
      return filtered.length ? filtered : fallback;
    }, fallback);
  }

  async getOrders(tenantId?: string): Promise<Order[]> {
    const fallback = this.filterByTenant(RECENT_ORDERS, tenantId);
    return this.safeFirebaseCall(async () => {
      const snapshot = await getDocs(collection(db, 'orders'));
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
      const filtered = this.filterByTenant(items, tenantId);
      return filtered.length ? filtered : fallback;
    }, fallback);
  }

  async getLandingPages(tenantId?: string): Promise<LandingPage[]> {
    return this.get<LandingPage[]>('landing_pages', DEFAULT_LANDING_PAGES, tenantId);
  }

  async getUsers(tenantId?: string): Promise<User[]> {
    return this.safeFirebaseCall(async () => {
      const snapshot = await getDocs(collection(db, 'users'));
      const items = snapshot.docs.map(d => d.data() as User);
      const filtered = this.filterByTenant(items, tenantId);
      return filtered;
    }, []);
  }

  async getRoles(tenantId?: string): Promise<Role[]> {
    const defaultRoles: Role[] = [
      { id: 'manager', name: 'Store Manager', description: 'Can manage products and orders', permissions: ['view_dashboard', 'manage_orders', 'view_orders', 'manage_products', 'view_products'] },
      { id: 'support', name: 'Support Agent', description: 'Can view orders and dashboard', permissions: ['view_dashboard', 'view_orders'] }
    ];
    return this.safeFirebaseCall(async () => {
      const snapshot = await getDocs(collection(db, 'roles'));
      const roles = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Role));
      const filtered = tenantId ? roles.filter(role => !(role as any).tenantId || (role as any).tenantId === tenantId) : roles;
      return filtered.length ? filtered : defaultRoles;
    }, defaultRoles);
  }

  async get<T>(key: string, defaultValue: T, tenantId?: string): Promise<T> {
    const isArray = Array.isArray(defaultValue);
    
    return this.safeFirebaseCall(async () => {
      if (['theme', 'website_config', 'logo', 'courier', 'delivery_config', 'facebook_pixel'].includes(key)) {
        const docRef = doc(db, 'configurations', key);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          return defaultValue;
        }
        if (key === 'logo') {
          const data = docSnap.data() as { value?: T };
          if (tenantId && data && (data as any).tenantId && (data as any).tenantId !== tenantId) {
            return defaultValue;
          }
          return (data?.value ?? defaultValue) as T;
        }
        if (key === 'delivery_config') {
          const data = docSnap.data();
          if (Array.isArray(data)) return data as T;
          if (Array.isArray((data as any)?.items)) {
            const scopedArray = (data as any).items as any[];
            return isArray ? this.filterByTenant(scopedArray, tenantId) as unknown as T : scopedArray as unknown as T;
          }
          return defaultValue;
        }
        const docData = docSnap.data() as T & { tenantId?: string };
        if (tenantId && docData?.tenantId && docData.tenantId !== tenantId) {
          return defaultValue;
        }
        return docData as T;
      }
      
      if (isArray) {
         const snapshot = await getDocs(collection(db, key));
         const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        const filteredItems = this.filterByTenant(items as any[], tenantId);
        return filteredItems.length ? filteredItems as unknown as T : defaultValue;
      }
      
      return defaultValue;
    }, defaultValue);
  }

  // --- Config Specific Loaders ---

  async getThemeConfig(tenantId?: string): Promise<ThemeConfig> {
    const defaults: ThemeConfig = {
      primaryColor: '#ec4899', // Pink-500
      secondaryColor: '#a855f7', // Purple-500
      tertiaryColor: '#c026d3', // Fuchsia-600
      fontColor: '#0f172a',
      hoverColor: '#f97316',
      surfaceColor: '#e2e8f0',
      darkMode: false
    };
    const config = await this.get<ThemeConfig>('theme', defaults, tenantId);
    return { ...defaults, ...config };
  }

  async getWebsiteConfig(tenantId?: string): Promise<WebsiteConfig> {
    const defaultConfig: WebsiteConfig = {
      websiteName: 'Overseas Products',
      shortDescription: 'Get the best for less',
      whatsappNumber: '+8801615332701',
      favicon: null,
      addresses: ['D-14/3, Bank Colony, Savar, Dhaka'],
      emails: ['opbd.shop@gmail.com', 'lunik.hasan@gmail.com'],
      phones: ['+8801615332701', '+8801611053430'],
      socialLinks: [
        { id: '1', platform: 'Facebook', url: 'https://facebook.com' },
        { id: '2', platform: 'Instagram', url: 'https://instagram.com' }
      ],
      footerQuickLinks: [
        { id: 'quick-1', label: 'About Us', url: '#' },
        { id: 'quick-2', label: 'Contact', url: '#' },
        { id: 'quick-3', label: 'Terms & Conditions', url: '#' }
      ],
      footerUsefulLinks: [
        { id: 'useful-1', label: 'Returns & Refunds', url: '#' },
        { id: 'useful-2', label: 'Privacy Policy', url: '#' },
        { id: 'useful-3', label: 'FAQ', url: '#' }
      ],
      showMobileHeaderCategory: true,
      showNewsSlider: true,
      headerSliderText: 'Easy return policy and complete cash on delivery, ease of shopping!',
      hideCopyright: false,
      hideCopyrightText: false,
      showPoweredBy: false,
      brandingText: 'Overseas Products',
      carouselItems: [
        { id: '1', name: 'Mobile Holder', image: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&q=80&w=400', url: '/magnetic-suction-vacuum', urlType: 'Internal', serial: 3, status: 'Publish' },
        { id: '2', name: 'Main', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=400', url: '/Product-categories', urlType: 'Internal', serial: 1, status: 'Publish' },
        { id: '3', name: 'Gift', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=400', url: 'https://www.opbd.shop/products?categories=gift', urlType: 'External', serial: 7, status: 'Publish' }
      ],
      searchHints: 'gadget item, gift, educational toy, mobile accessories',
      orderLanguage: 'English',
      productCardStyle: 'style1'
    };
    return this.get<WebsiteConfig>('website_config', defaultConfig, tenantId);
  }

  async getDeliveryConfig(tenantId?: string): Promise<DeliveryConfig[]> {
    const defaults: DeliveryConfig[] = [
      { type: 'Regular', isEnabled: true, division: 'Dhaka', insideCharge: 60, outsideCharge: 120, freeThreshold: 0, note: 'Standard delivery time 2-3 days' },
      { type: 'Express', isEnabled: true, division: 'Dhaka', insideCharge: 100, outsideCharge: 200, freeThreshold: 5000, note: 'Next day delivery available' },
      { type: 'Free', isEnabled: false, division: 'Dhaka', insideCharge: 0, outsideCharge: 0, freeThreshold: 0, note: 'Promotional free shipping' }
    ];
    // Try to get from 'configurations/delivery_config' doc first, if fail, check if it's a collection? 
    // Stick to doc for configs
    return this.get<DeliveryConfig[]>('delivery_config', defaults, tenantId);
  }

  // --- Saving Methods ---

  async save<T>(key: string, data: T, tenantId?: string): Promise<void> {
    try {
        if (!db) return;

        // Configs -> Single Doc
        if (['theme', 'website_config', 'logo', 'courier', 'delivery_config', 'facebook_pixel'].includes(key)) {
          const docRef = doc(db, 'configurations', key);
          if (key === 'logo') {
            await setDoc(docRef, { value: data ?? null, tenantId: tenantId || null });
          } else if (key === 'delivery_config') {
            const scopedItems = Array.isArray(data)
              ? data.map(item => ({ ...item, tenantId: tenantId || (item as any)?.tenantId || null }))
              : [];
            await setDoc(docRef, { items: scopedItems, tenantId: tenantId || null });
          } else {
            await setDoc(docRef, { ...(data as any), tenantId: tenantId || (data as any)?.tenantId || null });
          }
          return;
        }

        // Arrays -> Collection (Sync Strategy: Overwrite items)
        if (Array.isArray(data)) {
            const batchPromises = [];
            // We iterate and save each item as a doc
            for (const item of data) {
                if (item && (item.id || item.id === 0)) {
                    const id = String(item.id);
                    const payload = tenantId ? { ...item, tenantId } : item;
                    batchPromises.push(setDoc(doc(db, key, id), payload));
                }
            }
            // Note: In a real app, handling deletions is complex with this pattern.
            // For now, we assume this is an upsert.
            await Promise.all(batchPromises);
        }
    } catch (e) {
        console.error(`Failed to sync ${key} to Firebase`, e);
    }
  }

  // Helper for Catalog which shares same logic
  async getCatalog(type: string, defaults: any[], tenantId?: string): Promise<any[]> {
    return this.get<any[]>(type, defaults, tenantId);
  }

  async listTenants(): Promise<Tenant[]> {
    if (db) {
      try {
        const snapshot = await getDocs(collection(db, 'tenants'));
        const tenants = snapshot.docs.map(docSnap => {
          const data = docSnap.data() as Tenant;
          return { ...data, id: data?.id || docSnap.id };
        });
        if (tenants.length) {
          const sorted = tenants.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
          return sorted;
        }
      } catch (error) {
        console.warn('Unable to load tenants from Firestore, falling back to mock endpoint', error);
      }
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

    const normalizedSubdomain = payload.subdomain.trim().toLowerCase();
    if (!normalizedSubdomain) {
      throw new Error('subdomain must include alphanumeric characters');
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
    const baseTenant: Omit<Tenant, 'id'> = {
      name: payload.name.trim(),
      subdomain: normalizedSubdomain,
      customDomain: undefined,
      contactEmail: payload.contactEmail.trim(),
      contactName: payload.contactName?.trim(),
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
    };

    if (db) {
      try {
        const tenantRef = doc(collection(db, 'tenants'));
        const tenant: Tenant = { ...baseTenant, id: tenantRef.id };
        await setDoc(tenantRef, tenant);
        return tenant;
      } catch (error) {
        console.warn('Failed to persist tenant to Firestore, attempting mock API fallback', error);
      }
    }

    if (typeof fetch === 'undefined') {
      throw new Error('Tenant seeding is only available in browser runtime');
    }

    const response = await fetch('/api/tenants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorResponse = await response.json().catch(() => ({}));
      throw new Error(errorResponse?.error || 'Unable to create tenant');
    }

    const body = await response.json();
    const tenant = body?.data as Tenant;
    return tenant;
  }

  async deleteTenant(tenantId: string): Promise<void> {
    if (!tenantId) {
      throw new Error('tenantId is required');
    }

    if (db) {
      try {
        await deleteDoc(doc(db, 'tenants', tenantId));
        return;
      } catch (error) {
        console.warn('Failed to delete tenant from Firestore, attempting mock API fallback', error);
      }
    }

    if (typeof fetch === 'undefined') {
      throw new Error('Tenant deletion is only available in browser runtime');
    }

    const response = await fetch(`/api/tenants/${tenantId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorResponse = await response.json().catch(() => ({}));
      throw new Error(errorResponse?.error || 'Unable to delete tenant');
    }
  }
}

export const DataService = new DataServiceImpl();
