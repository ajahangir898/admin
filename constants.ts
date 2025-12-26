import { Product, Order, ChartData, GalleryItem, LandingPage, LandingPageTemplate, Tenant } from './types';

// ===== TRUE CONSTANTS (These should remain static) =====
export const DEFAULT_VARIANT_COLOR = 'Default';
export const DEFAULT_VARIANT_SIZE = 'Standard';

export const DEFAULT_TENANT_ID = 'tenant-demo';

export const RESERVED_TENANT_SLUGS = [
  'www',
  'admin',
  'adminlogin',
  'login',
  'app',
  'api',
  'dashboard',
  'tenant',
  'support',
  'cdn',
  'static'
];

// Categories - These can be managed from Admin Catalog
export const CATEGORIES = [
  { name: 'Phones', icon: 'smartphone' },
  { name: 'Watches', icon: 'watch' },
  { name: 'Power Bank', icon: 'battery-charging' },
  { name: 'Audio', icon: 'headphones' },
  { name: 'Charger', icon: 'zap' },
  { name: 'Earbuds', icon: 'bluetooth' },
  { name: 'Gaming', icon: 'gamepad-2' },
  { name: 'Camera', icon: 'camera' },
];

// Permission definitions - Used for role management
export const AVAILABLE_PERMISSIONS = [
  { id: 'view_dashboard', label: 'View Dashboard', category: 'General' },
  { id: 'manage_orders', label: 'Manage Orders', category: 'Orders' },
  { id: 'view_orders', label: 'View Orders', category: 'Orders' },
  { id: 'manage_products', label: 'Manage Products', category: 'Products' },
  { id: 'view_products', label: 'View Products', category: 'Products' },
  { id: 'manage_settings', label: 'Manage Settings', category: 'System' },
  { id: 'manage_customization', label: 'Theme Customization', category: 'System' },
  { id: 'manage_users', label: 'Manage Users & Roles', category: 'System' },
];

// Landing page template definitions
export const LANDING_PAGE_TEMPLATES: LandingPageTemplate[] = [
  {
    id: 'focus-split',
    name: 'Focused Split Hero',
    description: 'Two-column hero with sticky checkout and grid-based highlights.',
    accentColor: '--color-primary-rgb',
    heroLayout: 'split',
    featuresLayout: 'grid',
    buttonShape: 'pill'
  },
  {
    id: 'pulse-center',
    name: 'Pulse Center Stage',
    description: 'Centered hero, stacked storytelling blocks, calm gradients.',
    accentColor: '--color-accent-rgb',
    heroLayout: 'center',
    featuresLayout: 'stacked',
    buttonShape: 'rounded'
  }
];

// ===== EMPTY DEFAULTS (Data comes from Database) =====
// These are empty arrays - actual data is loaded from MongoDB

export const DEMO_TENANTS: Tenant[] = [];
export const PRODUCTS: Product[] = [];
export const RECENT_ORDERS: Order[] = [];
export const GALLERY_IMAGES: GalleryItem[] = [];
export const DEFAULT_LANDING_PAGES: LandingPage[] = [];

// Chart data defaults (empty - calculated dynamically from orders)
export const REVENUE_DATA: ChartData[] = [];
export const CATEGORY_DATA: ChartData[] = [];
