
import { Product, Order, User, ThemeConfig, WebsiteConfig, Role, Category, SubCategory, ChildCategory, Brand, Tag, DeliveryConfig, LandingPage } from '../types';
import { PRODUCTS, RECENT_ORDERS, DEFAULT_LANDING_PAGES } from '../constants';
import { db } from './firebaseConfig';
import { collection, getDocs, doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

class DataServiceImpl {
  private get canUseLocalStorage() {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  private getFromLocal<T>(key: string): T | null {
    if (!this.canUseLocalStorage) return null;
    try {
        const raw = localStorage.getItem(`gadgetshob_${key}`);
        return raw ? JSON.parse(raw) as T : null;
    } catch (err) {
        console.warn(`Failed to parse local cache for ${key}`, err);
        return null;
    }
  }
  
  // --- Generic Helpers with Fallback ---
  
  private async safeFirebaseCall<T>(operation: () => Promise<T>, fallback: T, key?: string): Promise<T> {
    try {
      if (!db) throw new Error("Firebase DB not initialized");
      return await operation();
    } catch (error) {
      console.warn(`Firebase operation failed, falling back to local storage/defaults.`, error);
      // Attempt Local Storage Fallback
      if (key && this.canUseLocalStorage) {
        const local = localStorage.getItem(`gadgetshob_${key}`);
        if (local) {
            try { return JSON.parse(local); } catch(e) {}
        }
      }
      return fallback;
    }
  }

  private saveToLocal(key: string, data: any) {
    if (!this.canUseLocalStorage) return;
    try {
        localStorage.setItem(`gadgetshob_${key}`, JSON.stringify(data));
    } catch (e) {
        console.error("Local storage save failed", e);
    }
  }

  // --- Data Access Methods ---

  async getProducts(): Promise<Product[]> {
    return this.safeFirebaseCall(async () => {
      const snapshot = await getDocs(collection(db, 'products'));
      const items = snapshot.docs.map(d => ({ id: Number(d.id), ...d.data() } as any));
      if (items.length === 0) {
        const cached = this.getFromLocal<Product[]>('products');
        if (cached && cached.length) return cached;
      }
      return items.length ? items : PRODUCTS;
    }, PRODUCTS, 'products');
  }

  async getOrders(): Promise<Order[]> {
    return this.safeFirebaseCall(async () => {
      const snapshot = await getDocs(collection(db, 'orders'));
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));
    }, RECENT_ORDERS, 'orders');
  }

  async getLandingPages(): Promise<LandingPage[]> {
    return this.get<LandingPage[]>('landing_pages', DEFAULT_LANDING_PAGES);
  }

  async getUsers(): Promise<User[]> {
    return this.safeFirebaseCall(async () => {
      const snapshot = await getDocs(collection(db, 'users'));
      return snapshot.docs.map(d => d.data() as User);
    }, [], 'users');
  }

  async getRoles(): Promise<Role[]> {
    const defaultRoles: Role[] = [
      { id: 'manager', name: 'Store Manager', description: 'Can manage products and orders', permissions: ['view_dashboard', 'manage_orders', 'view_orders', 'manage_products', 'view_products'] },
      { id: 'support', name: 'Support Agent', description: 'Can view orders and dashboard', permissions: ['view_dashboard', 'view_orders'] }
    ];
    return this.safeFirebaseCall(async () => {
      const snapshot = await getDocs(collection(db, 'roles'));
      const roles = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));
      return roles.length ? roles : defaultRoles;
    }, defaultRoles, 'roles');
  }

  async get<T>(key: string, defaultValue: T): Promise<T> {
    // Determine if we should look for a Doc or a Collection based on default value type
    const isArray = Array.isArray(defaultValue);
    
    return this.safeFirebaseCall(async () => {
      if (['theme', 'website_config', 'logo', 'courier', 'delivery_config', 'facebook_pixel'].includes(key)) {
        const docRef = doc(db, 'configurations', key);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return defaultValue;
        if (key === 'logo') {
          const data = docSnap.data() as { value?: T };
          return (data?.value ?? defaultValue) as T;
        }
        if (key === 'delivery_config') {
          const data = docSnap.data();
          if (Array.isArray(data)) return data as T; // legacy flat array stored at root
          if (Array.isArray((data as any)?.items)) {
            return (data as any).items as T;
          }
          return defaultValue;
        }
        return docSnap.data() as T;
      }
      
      // Fallback for generic collections
      if (isArray) {
         const snapshot = await getDocs(collection(db, key));
         const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        if (items.length === 0) {
          const cached = this.getFromLocal<T>(key);
          if (cached) return cached;
        }
        return items.length > 0 ? items as unknown as T : defaultValue;
      }
      
      return defaultValue;
    }, defaultValue, key);
  }

  // --- Config Specific Loaders ---

  async getThemeConfig(): Promise<ThemeConfig> {
    const defaults: ThemeConfig = {
      primaryColor: '#ec4899', // Pink-500
      secondaryColor: '#a855f7', // Purple-500
      tertiaryColor: '#c026d3', // Fuchsia-600
      fontColor: '#0f172a',
      hoverColor: '#f97316',
      surfaceColor: '#e2e8f0',
      darkMode: false
    };
    const config = await this.get<ThemeConfig>('theme', defaults);
    return { ...defaults, ...config };
  }

  async getWebsiteConfig(): Promise<WebsiteConfig> {
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
        { id: '3', name: 'Gift', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=400', url: 'https://www.opbd.shop/products?categories=gift', urlType: 'External', serial: 7, status: 'Publish' },
      ],
      searchHints: 'gadget item, gift, educational toy, mobile accessories',
      orderLanguage: 'English',
      productCardStyle: 'style1'
    };
    return this.get<WebsiteConfig>('website_config', defaultConfig);
  }

  async getDeliveryConfig(): Promise<DeliveryConfig[]> {
    const defaults: DeliveryConfig[] = [
      { type: 'Regular', isEnabled: true, division: 'Dhaka', insideCharge: 60, outsideCharge: 120, freeThreshold: 0, note: 'Standard delivery time 2-3 days' },
      { type: 'Express', isEnabled: true, division: 'Dhaka', insideCharge: 100, outsideCharge: 200, freeThreshold: 5000, note: 'Next day delivery available' },
      { type: 'Free', isEnabled: false, division: 'Dhaka', insideCharge: 0, outsideCharge: 0, freeThreshold: 0, note: 'Promotional free shipping' }
    ];
    // Try to get from 'configurations/delivery_config' doc first, if fail, check if it's a collection? 
    // Stick to doc for configs
    return this.get<DeliveryConfig[]>('delivery_config', defaults);
  }

  // --- Saving Methods ---

  async save<T>(key: string, data: T): Promise<void> {
    // Save to local storage first for immediate UI feedback / offline capability
    // Simple debounce check to avoid spamming (optional optimization)
    const now = Date.now();
    const lastSave = this.canUseLocalStorage ? parseInt(localStorage.getItem(`last_save_${key}`) || '0') : 0;
    if (this.canUseLocalStorage && now - lastSave < 1000) {
        // Skip if saved less than 1 second ago
        return; 
    }
    if (this.canUseLocalStorage) {
      localStorage.setItem(`last_save_${key}`, now.toString());
    }

    this.saveToLocal(key, data);

    try {
        if (!db) return;

        // Configs -> Single Doc
        if (['theme', 'website_config', 'logo', 'courier', 'delivery_config', 'facebook_pixel'].includes(key)) {
          const docRef = doc(db, 'configurations', key);
          if (key === 'logo') {
            await setDoc(docRef, { value: data ?? null });
          } else if (key === 'delivery_config') {
            await setDoc(docRef, { items: Array.isArray(data) ? data : [] });
          } else {
            await setDoc(docRef, data as any);
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
                    batchPromises.push(setDoc(doc(db, key, id), item));
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
  async getCatalog(type: string, defaults: any[]): Promise<any[]> {
    return this.get<any[]>(type, defaults);
  }
}

export const DataService = new DataServiceImpl();
