
import { Product, Order, User, ThemeConfig, WebsiteConfig, Role, Category, SubCategory, ChildCategory, Brand, Tag, DeliveryConfig } from '../types';
import { PRODUCTS, RECENT_ORDERS } from '../constants';

// Set this to TRUE when your PHP/Node backend is ready
const USE_API = false;
const API_BASE_URL = 'http://localhost/api'; // Update with your actual API URL

class DataServiceImpl {
  
  // --- Generic Helpers ---
  
  async get<T>(key: string, defaultValue: T): Promise<T> {
    if (USE_API) {
      try {
        const res = await fetch(`${API_BASE_URL}/${key}`);
        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
      } catch (error) {
        console.error(`API Error fetching ${key}:`, error);
        return defaultValue;
      }
    } else {
      // LocalStorage Fallback
      const stored = localStorage.getItem(`gadgetshob_${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    }
  }

  async save<T>(key: string, data: T): Promise<void> {
    if (USE_API) {
      try {
        await fetch(`${API_BASE_URL}/${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } catch (error) {
        console.error(`API Error saving ${key}:`, error);
      }
    } else {
      localStorage.setItem(`gadgetshob_${key}`, JSON.stringify(data));
    }
  }

  // --- Specific Data Loaders ---

  async getProducts(): Promise<Product[]> {
    return this.get<Product[]>('products', PRODUCTS);
  }

  async getOrders(): Promise<Order[]> {
    return this.get<Order[]>('orders', RECENT_ORDERS);
  }

  async getUsers(): Promise<User[]> {
    return this.get<User[]>('users', []);
  }

  async getRoles(): Promise<Role[]> {
    return this.get<Role[]>('roles', [
      { id: 'manager', name: 'Store Manager', description: 'Can manage products and orders', permissions: ['view_dashboard', 'manage_orders', 'view_orders', 'manage_products', 'view_products'] },
      { id: 'support', name: 'Support Agent', description: 'Can view orders and dashboard', permissions: ['view_dashboard', 'view_orders'] }
    ]);
  }

  async getThemeConfig(): Promise<ThemeConfig> {
    return this.get<ThemeConfig>('theme', {
      primaryColor: '#22c55e',
      secondaryColor: '#ec4899',
      tertiaryColor: '#9333ea',
      darkMode: false
    });
  }

  async getWebsiteConfig(): Promise<WebsiteConfig> {
    // Default config logic from App.tsx moved here
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
    return this.get<WebsiteConfig>('website_config', defaultConfig);
  }

  async getDeliveryConfig(): Promise<DeliveryConfig[]> {
    return this.get<DeliveryConfig[]>('delivery_config', [
      { type: 'Regular', isEnabled: true, division: 'Dhaka', insideCharge: 60, outsideCharge: 120, freeThreshold: 0, note: 'Standard delivery time 2-3 days' },
      { type: 'Express', isEnabled: true, division: 'Dhaka', insideCharge: 100, outsideCharge: 200, freeThreshold: 5000, note: 'Next day delivery available' },
      { type: 'Free', isEnabled: false, division: 'Dhaka', insideCharge: 0, outsideCharge: 0, freeThreshold: 0, note: 'Promotional free shipping' }
    ]);
  }

  // Catalog
  async getCatalog(type: string, defaults: any[]): Promise<any[]> {
    return this.get<any[]>(type, defaults);
  }
}

export const DataService = new DataServiceImpl();
