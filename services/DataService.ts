
import { Product, Order, User, ThemeConfig, WebsiteConfig, Role, Category, SubCategory, ChildCategory, Brand, Tag, DeliveryConfig } from '../types';
import { PRODUCTS, RECENT_ORDERS } from '../constants';
import { db } from './firebaseConfig';
import { collection, getDocs, doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

class DataServiceImpl {
  
  // --- Generic Helpers with Fallback ---
  
  private async safeFirebaseCall<T>(operation: () => Promise<T>, fallback: T, key?: string): Promise<T> {
    try {
      if (!db) {
        throw new Error("Firebase DB not initialized - check firebaseConfig.ts");
      }
      const result = await operation();
      if (key) {
        console.log(`✓ Firebase: Successfully loaded ${key}`);
      }
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn(`⚠ Firebase operation failed for '${key}': ${errorMsg}`);
      console.warn('Falling back to local storage/defaults', error);
      
      // Attempt Local Storage Fallback
      if (key) {
        const local = localStorage.getItem(`gadgetshob_${key}`);
        if (local) {
            try { 
              const parsed = JSON.parse(local);
              console.log(`✓ Loaded '${key}' from localStorage (offline mode)`);
              return parsed;
            } catch(e) {
              console.error(`Failed to parse cached ${key} from localStorage`, e);
            }
        }
      }
      console.log(`↪ Using fallback data for '${key}'`);
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
      if (['theme', 'website_config', 'logo', 'courier', 'delivery_config'].includes(key)) {
        const docRef = doc(db, 'configurations', key);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const raw = docSnap.data();
          // If stored as { value: primitive } unwrap it for backward compatibility
          if (raw && Object.prototype.hasOwnProperty.call(raw, 'value') && Object.keys(raw).length === 1) {
            return (raw.value as unknown) as T;
          }
          return raw as T;
        }
        return defaultValue;
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
      primaryColor: '#ec4899', // Pink-500
      secondaryColor: '#a855f7', // Purple-500
      tertiaryColor: '#c026d3', // Fuchsia-600
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
    // Simple debounce check to avoid spamming (optional optimization)
    const now = Date.now();
    const lastSave = parseInt(localStorage.getItem(`last_save_${key}`) || '0');
    if (now - lastSave < 1000) {
        // Skip if saved less than 1 second ago
        return; 
    }
    localStorage.setItem(`last_save_${key}`, now.toString());

    this.saveToLocal(key, data);

    try {
        if (!db) return;

        // Configs -> Single Doc
        if (['theme', 'website_config', 'logo', 'courier', 'delivery_config'].includes(key)) {
          // Firestore documents must be objects; wrap primitives in { value: ... }
          let payload: any = data;
          if (data === null || typeof data !== 'object' || Array.isArray(data)) {
            payload = { value: data };
          }
          await setDoc(doc(db, 'configurations', key), payload);
          return;
        }

        // Arrays -> Collection (Sync Strategy: Overwrite items)
          if (Array.isArray(data)) {
            const batchPromises: Promise<any>[] = [];
            // We iterate and save each item as a doc (upsert)
            const idsToKeep: string[] = [];
            for (const item of data) {
              if (item && (item.id || item.id === 0)) {
                const id = String(item.id);
                idsToKeep.push(id);
                batchPromises.push(setDoc(doc(db, key, id), item));
              }
            }
            await Promise.all(batchPromises);

            // Cleanup: remove any documents in the Firestore collection that are not in idsToKeep
            try {
              const snapshot = await getDocs(collection(db, key));
              const deletePromises: Promise<any>[] = [];
              snapshot.docs.forEach(d => {
                if (!idsToKeep.includes(d.id)) {
                  deletePromises.push(deleteDoc(doc(db, key, d.id)));
                }
              });
              if (deletePromises.length) {
                await Promise.all(deletePromises);
              }
            } catch (e) {
              console.warn(`Failed to cleanup removed docs in collection '${key}'`, e);
            }
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
