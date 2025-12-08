
import React from 'react';

export type TenantPlan = 'starter' | 'growth' | 'enterprise';
export type TenantStatus = 'active' | 'trialing' | 'suspended' | 'inactive';

export interface TenantBranding {
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  customDomain?: string;
  contactEmail: string;
  contactName?: string;
  adminEmail?: string;
  adminPassword?: string;
  adminAuthUid?: string;
  plan: TenantPlan;
  status: TenantStatus;
  createdAt: string;
  updatedAt: string;
  onboardingCompleted: boolean;
  locale?: string;
  currency?: string;
  branding?: TenantBranding;
  settings?: Record<string, any>;
}

export interface CreateTenantPayload {
  name: string;
  contactEmail: string;
  contactName?: string;
  subdomain: string;
  plan?: TenantPlan;
  adminEmail: string;
  adminPassword: string;
}

export interface ProductVariantSelection {
  color: string;
  size: string;
}

export interface ProductVariantStock extends ProductVariantSelection {
  stock: number;
  sku?: string;
}

export interface Product {
  id: number;
  name: string;
  tenantId?: string;
  price: number;
  originalPrice?: number;
  image: string;
  galleryImages?: string[];
  slug?: string;
  discount?: string;
  tag?: string;
  description?: string;
  rating?: number;
  reviews?: number;
  category?: string;
  subCategory?: string; // Added
  childCategory?: string; // Added
  brand?: string; // Added
  tags?: string[];
  colors?: string[]; // Added: Array of color codes or names
  sizes?: string[]; // Added: Array of size strings (S, M, L, XL etc)
  status?: 'Active' | 'Draft'; // Added for filtering
  stock?: number;
  variantDefaults?: Partial<ProductVariantSelection>;
  variantStock?: ProductVariantStock[];
}

export interface Order {
  id: string;
  tenantId?: string;
  customer: string;
  location: string;
  amount: number;
  date: string;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  email?: string; // To link with registered user
  trackingId?: string; // Added for Courier Integration
  phone?: string;
  division?: string;
  variant?: ProductVariantSelection;
  productId?: number;
  productName?: string;
  quantity?: number;
  deliveryType?: 'Regular' | 'Express' | 'Free';
  deliveryCharge?: number;
  courierProvider?: 'Steadfast' | 'Pathao';
  courierMeta?: Record<string, any>;
}

export interface User {
  name: string;
  tenantId?: string;
  email: string;
  password?: string;
  phone?: string;
  address?: string;
  role?: 'customer' | 'admin' | 'tenant_admin' | 'super_admin';
  roleId?: string; // ID of the custom role defined in AdminControl
  username?: string; // Added for admin profile
  image?: string; // Added for admin profile
  createdAt?: string; // Added for admin profile
  updatedAt?: string; // Added for admin profile
}

export interface Role {
  id: string;
  tenantId?: string;
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
  fontColor: string;
  hoverColor: string;
  surfaceColor: string;
  darkMode: boolean;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

export interface FooterLink {
  id: string;
  label: string;
  url: string;
}

export interface ChatSupportHours {
  from: string;
  to: string;
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'admin';
  text: string;
  timestamp: number;
  customerName?: string;
  customerEmail?: string;
  authorName?: string;
  authorEmail?: string;
  editedAt?: number;
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
  tenantId?: string;
  websiteName: string;
  shortDescription: string;
  whatsappNumber: string;
  favicon: string | null;
  addresses: string[];
  emails: string[];
  phones: string[];
  socialLinks: SocialLink[];
  footerQuickLinks: FooterLink[];
  footerUsefulLinks: FooterLink[];
  // Display Toggles
  showMobileHeaderCategory: boolean;
  showNewsSlider: boolean;
  headerSliderText: string;
  hideCopyright: boolean;
  hideCopyrightText: boolean;
  showPoweredBy: boolean;
  showFlashSaleCounter?: boolean;
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
  chatEnabled?: boolean;
  chatGreeting?: string;
  chatOfflineMessage?: string;
  chatSupportHours?: ChatSupportHours;
  chatWhatsAppFallback?: boolean;
}

export interface DeliveryConfig {
  type: 'Regular' | 'Express' | 'Free';
  isEnabled: boolean;
  division: string;
  insideCharge: number;
  outsideCharge: number;
  freeThreshold: number;
  note: string;
  tenantId?: string;
}

export interface CourierConfig {
  apiKey: string;
  secretKey: string;
  instruction?: string;
}

export interface FacebookPixelConfig {
  pixelId: string;
  accessToken: string;
  enableTestEvent: boolean;
  isEnabled: boolean;
}

// Catalog Types
export interface Category {
  id: string;
  tenantId?: string;
  name: string;
  icon?: string;
  image?: string;
  status: 'Active' | 'Inactive';
}

export interface SubCategory {
  id: string;
  tenantId?: string;
  categoryId: string;
  name: string;
  status: 'Active' | 'Inactive';
}

export interface ChildCategory {
  id: string;
  tenantId?: string;
  subCategoryId: string;
  name: string;
  status: 'Active' | 'Inactive';
}

export interface Brand {
  id: string;
  tenantId?: string;
  name: string;
  logo: string;
  status: 'Active' | 'Inactive';
}

export interface Tag {
  id: string;
  tenantId?: string;
  name: string;
  status: 'Active' | 'Inactive';
}

export interface GalleryItem {
  id: number;
  tenantId?: string;
  title: string;
  category: string;
  imageUrl: string;
  dateAdded: string;
}

export type LandingPageMode = 'ready' | 'custom';
export type LandingPageStatus = 'draft' | 'published';
export type LandingBlockType = 'hero' | 'features' | 'reviews' | 'faq' | 'cta';

export interface LandingBlockItem {
  id: string;
  title: string;
  description?: string;
  icon?: string;
}

export interface LandingPageBlock {
  id: string;
  type: LandingBlockType;
  title?: string;
  subtitle?: string;
  description?: string;
  mediaUrl?: string;
  ctaLabel?: string;
  ctaLink?: string;
  items?: LandingBlockItem[];
  style?: {
    background?: string;
    textColor?: string;
    accentColor?: string;
    layout?: 'split' | 'stacked';
  };
}

export interface LandingPageSEO {
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  keywords?: string[];
}

export interface LandingPageStyle {
  fontFamily?: string;
  primaryColor?: string;
  accentColor?: string;
  background?: string;
  buttonShape?: 'pill' | 'rounded' | 'square';
}

export interface LandingPageTemplate {
  id: string;
  name: string;
  description: string;
  accentColor: string;
  heroLayout: 'split' | 'center';
  featuresLayout: 'grid' | 'stacked';
  buttonShape: 'pill' | 'rounded' | 'square';
}

export interface LandingPage {
  id: string;
  tenantId?: string;
  name: string;
  mode: LandingPageMode;
  productId?: number;
  templateId?: string;
  status: LandingPageStatus;
  urlSlug: string;
  seo: LandingPageSEO;
  blocks: LandingPageBlock[];
  style: LandingPageStyle;
  onePageCheckout: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}
