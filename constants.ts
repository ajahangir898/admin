
import { Product, Order, ChartData, GalleryItem, LandingPage, LandingPageTemplate } from './types';

export const DEFAULT_VARIANT_COLOR = 'Default';
export const DEFAULT_VARIANT_SIZE = 'Standard';

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

const LOREM_DESC = "Experience premium quality with our latest collection. This product features state-of-the-art technology, ergonomic design for comfort, and durable materials that last. Perfect for daily use or special occasions, it delivers exceptional performance and style. Backed by our standard warranty and customer support.";
const toSlug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Apple 20W USB-C Power Adapter',
    price: 2200,
    originalPrice: 3000,
    image: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&q=80&w=960',
    galleryImages: [
      'https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&q=80&w=960',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=960',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=960',
      'https://images.unsplash.com/photo-1505745050311-50c9e02d7b34?auto=format&fit=crop&q=80&w=960',
      'https://images.unsplash.com/photo-1457305237443-44c3d5a30b89?auto=format&fit=crop&q=80&w=960'
    ],
    discount: '26% OFF',
    rating: 4.5,
    reviews: 120,
    category: 'Charger',
    tags: ['Flash Deals', 'Power'],
    description: "The Apple 20W USB-C Power Adapter offers fast, efficient charging at home, in the office, or on the go. While the power adapter is compatible with any USB-C–enabled device, Apple recommends pairing it with the iPad Pro and iPad Air for optimal charging performance. You can also pair it with iPhone 8 or later to take advantage of the fast-charging feature.",
    colors: ['White'],
    variantDefaults: { color: 'White', size: DEFAULT_VARIANT_SIZE },
    variantStock: [
      { color: 'White', size: DEFAULT_VARIANT_SIZE, stock: 40 }
    ],
    stock: 40
  },
  {
    id: 2,
    name: 'Samsung Galaxy Watch 6',
    price: 18500,
    originalPrice: 25000,
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=960',
    galleryImages: [
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=960',
      'https://images.unsplash.com/photo-1518544889280-37f5e7459521?auto=format&fit=crop&q=80&w=960',
      'https://images.unsplash.com/photo-1461141346587-763ab02bced9?auto=format&fit=crop&q=80&w=960',
      'https://images.unsplash.com/photo-1490376840453-5f616fbebe5b?auto=format&fit=crop&q=80&w=960',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=960'
    ],
    discount: '26% OFF',
    rating: 4.8,
    reviews: 45,
    category: 'Watches',
    tags: ['Smart', 'Fitness'],
    description: "Start your everyday wellness journey with Galaxy Watch6. It keeps a watch on your sleep and heart rate, and it's always ready for a workout. The largest screen on a Galaxy Watch yet gives you plenty of room to tap and swipe.",
    colors: ['Graphite', 'Gold', 'Silver'],
    sizes: ['40mm', '44mm'],
    variantDefaults: { color: 'Graphite', size: '44mm' },
    variantStock: [
      { color: 'Graphite', size: '44mm', stock: 15 },
      { color: 'Graphite', size: '40mm', stock: 10 },
      { color: 'Gold', size: '44mm', stock: 6 },
      { color: 'Silver', size: '40mm', stock: 8 }
    ],
    stock: 39
  },
  {
    id: 3,
    name: 'Logitech G Pro X Headset',
    price: 12500,
    originalPrice: 15000,
    image: 'https://images.unsplash.com/photo-1599669454699-248893623040?auto=format&fit=crop&q=80&w=960',
    galleryImages: [
      'https://images.unsplash.com/photo-1599669454699-248893623040?auto=format&fit=crop&q=80&w=960',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=960',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=960&sat=-50',
      'https://images.unsplash.com/photo-1457305237443-44c3d5a30b89?auto=format&fit=crop&q=80&w=960&sat=-100',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=960'
    ],
    discount: '16% OFF',
    rating: 4.7,
    reviews: 89,
    category: 'Gaming',
    tags: ['Audio', 'Pro'],
    description: "Hear and sound like a pro with the PRO X Gaming Headset. Pro-designed with detachable mic and Blue VO!CE software for professional-sounding voice comms. Featuring next-gen 7.1 surround sound and PRO-G 50 mm drivers for amazingly clear sound imaging.",
    sizes: ['Small', 'Medium', 'Large'],
    variantDefaults: { color: DEFAULT_VARIANT_COLOR, size: 'Medium' },
    variantStock: [
      { color: DEFAULT_VARIANT_COLOR, size: 'Small', stock: 5 },
      { color: DEFAULT_VARIANT_COLOR, size: 'Medium', stock: 18 },
      { color: DEFAULT_VARIANT_COLOR, size: 'Large', stock: 9 }
    ],
    stock: 32
  },
  {
    id: 4,
    name: 'iPhone 14 Pro Max 1TB',
    price: 189999,
    originalPrice: 200000,
    image: 'https://images.unsplash.com/photo-1678685888221-c4e9c71a3983?auto=format&fit=crop&q=80&w=960',
    galleryImages: [
      'https://images.unsplash.com/photo-1678685888221-c4e9c71a3983?auto=format&fit=crop&q=80&w=960',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=960',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=960',
      'https://images.unsplash.com/photo-1512499617640-c2f999098c01?auto=format&fit=crop&q=80&w=960',
      'https://images.unsplash.com/photo-1456963802230-1204ad3b8ba0?auto=format&fit=crop&q=80&w=960'
    ],
    discount: '5% OFF',
    rating: 5.0,
    reviews: 12,
    category: 'Phones',
    tags: ['Flagship', 'Apple'],
    description: "iPhone 14 Pro Max. Capture incredible detail with a 48MP Main camera. Experience iPhone in a whole new way with Dynamic Island and Always-On display. Crash Detection, a new safety feature, calls for help when you can't.",
    colors: ['Deep Purple', 'Silver', 'Space Black'],
    sizes: ['128GB', '256GB', '1TB'],
    variantDefaults: { color: 'Deep Purple', size: '256GB' },
    variantStock: [
      { color: 'Deep Purple', size: '256GB', stock: 4 },
      { color: 'Silver', size: '1TB', stock: 2 },
      { color: 'Space Black', size: '128GB', stock: 6 }
    ],
    stock: 12
  },
];

export const RECENT_ORDERS: Order[] = [
  { id: '#0024', customer: 'Fahim', location: 'Dhaka', amount: 4300, date: '28 Nov, 2025, 11:43 PM', status: 'Pending' },
  { id: '#0023', customer: 'Durjoy Roy', location: 'Mirpur 6, Dhaka', amount: 29999, date: '28 Nov, 2025, 08:54 PM', status: 'Confirmed' },
  { id: '#0022', customer: 'Sabbir Ahmed', location: 'Sylhet', amount: 14700, date: '25 Nov, 2025, 07:49 AM', status: 'Delivered' },
  { id: '#0021', customer: 'Tanvir Hasan', location: 'Chittagong', amount: 5500, date: '24 Nov, 2025, 03:20 PM', status: 'Shipped' },
  { id: '#0020', customer: 'Nusrat Jahan', location: 'Uttara, Dhaka', amount: 8200, date: '24 Nov, 2025, 10:15 AM', status: 'Confirmed' },
  { id: '#0019', customer: 'Karim Ullah', location: 'Rajshahi', amount: 1250, date: '23 Nov, 2025, 06:45 PM', status: 'Delivered' },
  { id: '#0018', customer: 'Rahim Sheikh', location: 'Khulna', amount: 21000, date: '23 Nov, 2025, 09:30 AM', status: 'Pending' },
  { id: '#0017', customer: 'Samiul Islam', location: 'Barisal', amount: 3400, date: '22 Nov, 2025, 04:10 PM', status: 'Shipped' },
];

export const REVENUE_DATA: ChartData[] = [
  { name: 'Sun', value: 200 },
  { name: 'Mon', value: 400 },
  { name: 'Tue', value: 300 },
  { name: 'Wed', value: 550 },
  { name: 'Thu', value: 450 },
  { name: 'Fri', value: 700 },
  { name: 'Sat', value: 600 },
];

export const CATEGORY_DATA: ChartData[] = [
  { name: 'Camera', value: 400 },
  { name: 'Watches', value: 300 },
  { name: 'Phones', value: 300 },
  { name: 'Audio', value: 200 },
];

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

export const GALLERY_IMAGES: GalleryItem[] = [
  { id: 101, title: 'GadgetShob Logo', category: 'Branding', imageUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400', dateAdded: '2025-01-01' },
  { id: 102, title: 'Congratulations Banner', category: 'Banners', imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400', dateAdded: '2025-01-02' },
  { id: 103, title: 'Winner Roksana', category: 'Events', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', dateAdded: '2025-01-03' },
  { id: 104, title: 'Diamond Winner', category: 'Events', imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400', dateAdded: '2025-01-04' },
  { id: 105, title: 'Imran Hossain', category: 'Events', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', dateAdded: '2025-01-05' },
  { id: 106, title: 'Misty Roy', category: 'Events', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', dateAdded: '2025-01-06' },
  { id: 107, title: 'T-Shirt Combo', category: 'Products', imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', dateAdded: '2025-01-07' },
  { id: 108, title: 'Sunglass + Wallet', category: 'Products', imageUrl: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400', dateAdded: '2025-01-08' },
  { id: 109, title: 'Leather Wallet', category: 'Products', imageUrl: 'https://images.unsplash.com/photo-1627123424574-18bd75847b47?w=400', dateAdded: '2025-01-09' },
  { id: 110, title: 'Women Smart Purse', category: 'Products', imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400', dateAdded: '2025-01-10' },
  { id: 111, title: 'Vip-kem cot combo', category: 'Products', imageUrl: 'https://images.unsplash.com/photo-1556228720-1957be83d2bf?w=400', dateAdded: '2025-01-11' },
  { id: 112, title: 'Mega Campaign', category: 'Banners', imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400', dateAdded: '2025-01-12' },
];

export const LANDING_PAGE_TEMPLATES: LandingPageTemplate[] = [
  {
    id: 'focus-split',
    name: 'Focused Split Hero',
    description: 'Two-column hero with sticky checkout and grid-based highlights.',
    accentColor: '#7c3aed',
    heroLayout: 'split',
    featuresLayout: 'grid',
    buttonShape: 'pill'
  },
  {
    id: 'pulse-center',
    name: 'Pulse Center Stage',
    description: 'Centered hero, stacked storytelling blocks, calm gradients.',
    accentColor: '#f97316',
    heroLayout: 'center',
    featuresLayout: 'stacked',
    buttonShape: 'rounded'
  }
];

const firstProduct = PRODUCTS[0];

export const DEFAULT_LANDING_PAGES: LandingPage[] = firstProduct ? [
  {
    id: 'lp-ready-1',
    name: `${firstProduct.name} Instant Page`,
    mode: 'ready',
    productId: firstProduct.id,
    templateId: 'focus-split',
    status: 'published',
    urlSlug: `${toSlug(firstProduct.name)}-page`,
    seo: {
      metaTitle: `${firstProduct.name} | Buy Online`,
      metaDescription: firstProduct.description?.slice(0, 140) || 'Instant landing experience.',
      canonicalUrl: `https://demo.gadgetshob.com/${toSlug(firstProduct.name)}-page`,
      keywords: ['gadget', 'deal', firstProduct.name]
    },
    blocks: [
      {
        id: 'hero-1',
        type: 'hero',
        title: firstProduct.name,
        subtitle: 'Fast-charge your day with confidence.',
        description: firstProduct.description,
        mediaUrl: firstProduct.galleryImages?.[0] || firstProduct.image,
        ctaLabel: 'Checkout in 1 Page',
        style: { background: '#f5f3ff', layout: 'split', accentColor: '#7c3aed' }
      },
      {
        id: 'features-1',
        type: 'features',
        title: 'Why shoppers love it',
        items: [
          { id: 'f1', title: 'Official Warranty', description: '12 months service coverage nationwide.' },
          { id: 'f2', title: 'Next-day Delivery', description: 'Inside Dhaka metro within 24 hours.' },
          { id: 'f3', title: 'Easy COD', description: 'Pay after inspection at your doorstep.' }
        ],
        style: { background: '#ffffff', accentColor: '#7c3aed' }
      },
      {
        id: 'faq-1',
        type: 'faq',
        title: 'Questions? We got answers',
        items: [
          { id: 'q1', title: 'Is it original?', description: 'Yes, sourced directly from Apple-authorized distributor.' },
          { id: 'q2', title: 'Return policy?', description: '7-day easy replacement if factory issues appear.' }
        ]
      }
    ],
    style: {
      primaryColor: '#7c3aed',
      accentColor: '#a855f7',
      background: '#f9f5ff',
      buttonShape: 'pill',
      fontFamily: 'Inter, sans-serif'
    },
    onePageCheckout: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString()
  }
] : [];