
import { Product, Order, User, ThemeConfig, WebsiteConfig, Role, Category, SubCategory, ChildCategory, Brand, Tag, DeliveryConfig } from '../types';
import { PRODUCTS, RECENT_ORDERS } from '../constants';
import { db } from './firebaseConfig';
import { collection, getDocs, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

class DataServiceImpl {
  
  // --- Generic Firestore Helpers ---
  
  /**
   * Fetch a single document by ID from a collection.
   * If not found, returns the defaultValue.
   */
  async getDocument<T>(collectionName: string, docId: string, defaultValue: T): Promise<T> {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as T;
      } else {
        // If it doesn't exist, initialize it with default value
        await setDoc(docRef, defaultValue as any);
        return defaultValue;
      }
    } catch (error) {
      console.error(`Error fetching document ${collectionName}/${docId}:`, error);
      return defaultValue;
    }
  }

  /**
   * Save (Overwrite) a single document.
   */
  async saveDocument<T>(collectionName: string, docId: string, data: T): Promise<void> {
    try {
      await setDoc(doc(db, collectionName, docId), data as any);
    } catch (error) {
      console.error(`Error saving document ${collectionName}/${docId}:`, error);
    }
  }

  /**
   * Fetch all documents from a collection as an array.
   * If empty, returns defaultValue.
   */
  async getCollection<T>(collectionName: string, defaultValue: T[]): Promise<T[]> {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      const items: T[] = [];
      querySnapshot.forEach((doc) => {
        // We assume the ID is part of the data or we inject it
        items.push({ id: doc.id, ...doc.data() } as any);
      });
      return items.length > 0 ? items : defaultValue;
    } catch (error) {
      console.error(`Error fetching collection ${collectionName}:`, error);
      return defaultValue;
    }
  }

  /**
   * Overwrite an entire collection (used for syncing array state to DB).
   * Note: In a real app, you'd use add/update/delete individual docs.
   * For this migration, we are syncing the whole list for simplicity matching the previous architecture.
   */
  async saveCollection<T extends { id: string | number }>(collectionName: string, data: T[]): Promise<void> {
    try {
      // 1. Get all existing docs to find deletions
      const snapshot = await getDocs(collection(db, collectionName));
      const batchPromises = [];

      // 2. Update or Create docs
      for (const item of data) {
        const id = String(item.id);
        const docRef = doc(db, collectionName, id);
        batchPromises.push(setDoc(docRef, item));
      }

      // 3. Delete docs that are no longer in the data array
      snapshot.forEach((docSnap) => {
        if (!data.find(d => String(d.id) === docSnap.id)) {
          batchPromises.push(deleteDoc(doc(db, collectionName, docSnap.id)));
        }
      });

      await Promise.all(batchPromises);
    } catch (error) {
      console.error(`Error saving collection ${collectionName}:`, error);
    }
  }

  // --- Wrapper for older key-value style calls (Compatibility) ---
  // We map the old "keys" to Firestore Collections or Documents
  
  async get<T>(key: string, defaultValue: T): Promise<T> {
    // Configs are usually single documents
    if (['theme', 'website_config', 'logo', 'courier'].includes(key)) {
      return this.getDocument('configurations', key, defaultValue);
    }
    // Lists are collections
    if (Array.isArray(defaultValue)) {
        return this.getCollection(key, defaultValue) as any;
    }
    return defaultValue;
  }

  async save<T>(key: string, data: T): Promise<void> {
    if (['theme', 'website_config', 'logo', 'courier'].includes(key)) {
      return this.saveDocument('configurations', key, data);
    }
    if (Array.isArray(data)) {
        return this.saveCollection(key, data as any[]);
    }
  }

  // --- Specific Data Loaders (Optimized for Firestore) ---

  async getProducts(): Promise<Product[]> {
    return this.getCollection<Product>('products', PRODUCTS);
  }

  async getOrders(): Promise<Order[]> {
    return this.getCollection<Order>('orders', RECENT_ORDERS);
  }

  async getUsers(): Promise<User[]> {
    // For users, we might want to key them by email in a real app, 
    // but for this structure, we'll use the collection approach.
    // We need to generate IDs for users if they don't have one, or use email as ID.
    // The current Type has no ID, so we might need to handle that.
    // For now, we fall back to the compatibility layer.
    return this.get<User[]>('users', []);
  }

  async getRoles(): Promise<Role[]> {
    return this.getCollection<Role>('roles', [
      { id: 'manager', name: 'Store Manager', description: 'Can manage products and orders', permissions: ['view_dashboard', 'manage_orders', 'view_orders', 'manage_products', 'view_products'] },
      { id: 'support', name: 'Support Agent', description: 'Can view orders and dashboard', permissions: ['view_dashboard', 'view_orders'] }
    ]);
  }

  async getThemeConfig(): Promise<ThemeConfig> {
    return this.getDocument<ThemeConfig>('configurations', 'theme', {
      primaryColor: '#22c55e',
      secondaryColor: '#ec4899',
      tertiaryColor: '#9333ea',
      darkMode: false
    });
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
        { id: '4', name: 'Gadget', image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=400', url: 'https://www.opbd.shop/products?categories=gadget', urlType: 'External', serial: 5, status: 'Publish' },
        { id: '5', name: 'Toy', image: 'https://images.unsplash.com/photo-1558877385-844da7858812?auto=format&fit=crop&q=80&w=400', url: 'https://www.opbd.shop/products?categories=toy', urlType: 'External', serial: 6, status: 'Publish' },
        { id: '6', name: 'Sfw', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=400', url: 'https://www.opbd.shop/products?categories=sfw', urlType: 'External', serial: 8, status: 'Publish' },
        { id: '7', name: 'Plane', image: 'https://images.unsplash.com/photo-1483304528321-0674f0040030?auto=format&fit=crop&q=80&w=400', url: '/Airplane-launcher-toy', urlType: 'Internal', serial: 4, status: 'Publish' },
        { id: '8', name: '4', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400', url: '', urlType: 'Internal', serial: 9, status: 'Draft' },
        { id: '9', name: '2', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400', url: '', urlType: 'Internal', serial: 10, status: 'Draft' }
      ],
      searchHints: 'gadget item, gift, educational toy, mobile accessories',
      orderLanguage: 'English',
      productCardStyle: 'style1'
    };
    return this.getDocument<WebsiteConfig>('configurations', 'website_config', defaultConfig);
  }

  async getDeliveryConfig(): Promise<DeliveryConfig[]> {
    // Delivery config is a list, but we can store it as a single doc for simpler management in this app structure,
    // or as a collection. Given the App.tsx usage, let's treat it as a collection or a doc array.
    // For consistency with how we handle 'delivery_config' key in App.tsx:
    return this.getDocument<DeliveryConfig[]>('configurations', 'delivery_config', [
      { type: 'Regular', isEnabled: true, division: 'Dhaka', insideCharge: 60, outsideCharge: 120, freeThreshold: 0, note: 'Standard delivery time 2-3 days' },
      { type: 'Express', isEnabled: true, division: 'Dhaka', insideCharge: 100, outsideCharge: 200, freeThreshold: 5000, note: 'Next day delivery available' },
      { type: 'Free', isEnabled: false, division: 'Dhaka', insideCharge: 0, outsideCharge: 0, freeThreshold: 0, note: 'Promotional free shipping' }
    ]);
  }

  // Catalog
  async getCatalog(type: string, defaults: any[]): Promise<any[]> {
    return this.getCollection<any>(type, defaults);
  }
}

export const DataService = new DataServiceImpl();
