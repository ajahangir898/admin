
import { Product, Order, User, ThemeConfig, WebsiteConfig, Role, Category, SubCategory, ChildCategory, Brand, Tag, DeliveryConfig } from '../types';
import { PRODUCTS, RECENT_ORDERS } from '../constants';
import { db } from './firebaseConfig';
import { collection, getDocs, doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

class DataServiceImpl {
  
  // --- Generic Helpers with Fallback ---
  
  private async safeFirebaseCall<T>(operation: () => Promise<T>, fallback: T, key?: string): Promise<T> {
    try {
      if (!db) throw new Error("Firebase DB not initialized");
      return await operation();
    } catch (error) {
      console.warn(`Firebase operation failed, falling back to local storage/defaults.`, error);
      // Attempt Local Storage Fallback
      if (key) {
        const local = localStorage.getItem(`gadgetshob_${key}`);
        if (local) {
            try { return JSON.parse(local); } catch(e) {}
        }
      }
      return fallback;
    }
  }

  private saveToLocal(key: string, data: any) {
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
      return snapshot.docs.map(d => ({ id: Number(d.id), ...d.data() } as any));
    }, PRODUCTS, 'products');
  }

  async getOrders(): Promise<Order[]> {
    return this.safeFirebaseCall(async () => {
      const snapshot = await getDocs(collection(db, 'orders'));
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));
    }, RECENT_ORDERS, 'orders');
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
      if (['theme', 'website_config', 'logo', 'courier'].includes(key)) {
        const docRef = doc(db, 'configurations', key);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? (docSnap.data() as T) : defaultValue;
      }
      
      // Fallback for generic collections
      if (isArray) {
         const snapshot = await getDocs(collection(db, key));
         const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
         return items.length > 0 ? items as unknown as T : defaultValue;
      }
      
      return defaultValue;
    }, defaultValue, key);
  }

  // --- Config Specific Loaders ---

  async getThemeConfig(): Promise<ThemeConfig> {
    const defaults: ThemeConfig = {
      primaryColor: '#22c55e',
      secondaryColor: '#ec4899',
      tertiaryColor: '#9333ea',
      darkMode: false
    };
    return this.get<ThemeConfig>('theme', defaults);
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
    this.saveToLocal(key, data);

    try {
        if (!db) return;

        // Configs -> Single Doc
        if (['theme', 'website_config', 'logo', 'courier', 'delivery_config'].includes(key)) {
            await setDoc(doc(db, 'configurations', key), data as any);
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
