
import React from 'react';

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  discount?: string;
  tag?: string;
  description?: string;
  rating?: number;
  reviews?: number;
  category?: string;
  tags?: string[];
}

export interface Order {
  id: string;
  customer: string;
  location: string;
  amount: number;
  date: string;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  email?: string; // To link with registered user
}

export interface User {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  address?: string;
  role?: 'customer' | 'admin';
  roleId?: string; // ID of the custom role defined in AdminControl
  username?: string; // Added for admin profile
  image?: string; // Added for admin profile
  createdAt?: string; // Added for admin profile
  updatedAt?: string; // Added for admin profile
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass: string;
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  darkMode: boolean;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

export interface CarouselItem {
  id: string;
  image: string;
  name: string;
  url: string;
  urlType: 'Internal' | 'External';
  serial: number;
  status: 'Publish' | 'Draft';
}

export interface WebsiteConfig {
  websiteName: string;
  shortDescription: string;
  whatsappNumber: string;
  favicon: string | null;
  addresses: string[];
  emails: string[];
  phones: string[];
  socialLinks: SocialLink[];
  // Display Toggles
  showMobileHeaderCategory: boolean;
  showNewsSlider: boolean;
  headerSliderText: string;
  hideCopyright: boolean;
  hideCopyrightText: boolean;
  showPoweredBy: boolean;
  brandingText: string;
  // Visual Toggles
  bottomNavStyle?: string;
  footerStyle?: string;
  productCardStyle?: string;
  headerStyle?: string;
  categorySectionStyle?: string;
  showcaseSectionStyle?: string;
  brandSectionStyle?: string;
  productSectionStyle?: string;
  // New Additions
  carouselItems: CarouselItem[];
  searchHints?: string;
  orderLanguage?: 'English' | 'Bangla';
}
