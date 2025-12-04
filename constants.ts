
import { Product, Order, ChartData, GalleryItem } from './types';

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

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Apple 20W USB-C Power Adapter',
    price: 2200,
    originalPrice: 3000,
    image: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&q=80&w=400',
    discount: '26% OFF',
    rating: 4.5,
    reviews: 120,
    category: 'Charger',
    tags: ['Flash Deals', 'Power'],
    description: "The Apple 20W USB-C Power Adapter offers fast, efficient charging at home, in the office, or on the go. While the power adapter is compatible with any USB-C–enabled device, Apple recommends pairing it with the iPad Pro and iPad Air for optimal charging performance. You can also pair it with iPhone 8 or later to take advantage of the fast-charging feature."
  },
  {
    id: 2,
    name: 'Samsung Galaxy Watch 6',
    price: 18500,
    originalPrice: 25000,
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=400',
    discount: '26% OFF',
    rating: 4.8,
    reviews: 45,
    category: 'Watches',
    tags: ['Smart', 'Fitness'],
    description: "Start your everyday wellness journey with Galaxy Watch6. It keeps a watch on your sleep and heart rate, and it's always ready for a workout. The largest screen on a Galaxy Watch yet gives you plenty of room to tap and swipe."
  },
  {
    id: 3,
    name: 'Logitech G Pro X Headset',
    price: 12500,
    originalPrice: 15000,
    image: 'https://images.unsplash.com/photo-1599669454699-248893623040?auto=format&fit=crop&q=80&w=400',
    discount: '16% OFF',
    rating: 4.7,
    reviews: 89,
    category: 'Gaming',
    tags: ['Audio', 'Pro'],
    description: "Hear and sound like a pro with the PRO X Gaming Headset. Pro-designed with detachable mic and Blue VO!CE software for professional-sounding voice comms. Featuring next-gen 7.1 surround sound and PRO-G 50 mm drivers for amazingly clear sound imaging."
  },
  {
    id: 4,
    name: 'iPhone 14 Pro Max 1TB',
    price: 189999,
    originalPrice: 200000,
    image: 'https://images.unsplash.com/photo-1678685888221-c4e9c71a3983?auto=format&fit=crop&q=80&w=400',
    discount: '5% OFF',
    rating: 5.0,
    reviews: 12,
    category: 'Phones',
    tags: ['Flagship', 'Apple'],
    description: "iPhone 14 Pro Max. Capture incredible detail with a 48MP Main camera. Experience iPhone in a whole new way with Dynamic Island and Always-On display. Crash Detection, a new safety feature, calls for help when you can't."
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