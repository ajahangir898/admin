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

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Apple 20W USB-C Power Adapter',
    price: 2200,
    originalPrice: 3000,
    image: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&q=80&w=400',
    discount: '26% OFF',
  },
  {
    id: 2,
    name: 'Samsung Galaxy Watch 6',
    price: 18500,
    originalPrice: 25000,
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=400',
    discount: '26% OFF',
  },
  {
    id: 3,
    name: 'Logitech G Pro X Headset',
    price: 12500,
    originalPrice: 15000,
    image: 'https://images.unsplash.com/photo-1599669454699-248893623040?auto=format&fit=crop&q=80&w=400',
    discount: '16% OFF',
  },
  {
    id: 4,
    name: 'iPhone 14 Pro Max 1TB',
    price: 189999,
    originalPrice: 200000,
    image: 'https://images.unsplash.com/photo-1678685888221-c4e9c71a3983?auto=format&fit=crop&q=80&w=400',
    discount: '5% OFF',
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