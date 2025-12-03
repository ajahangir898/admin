import { Product, Order, ChartData } from './types';

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