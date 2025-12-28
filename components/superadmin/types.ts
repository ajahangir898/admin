// Types for Super Admin Dashboard
import React from 'react';

export interface TenantStats {
  id: string;
  name: string;
  subdomain: string;
  plan: 'starter' | 'growth' | 'enterprise';
  status: 'active' | 'trialing' | 'suspended';
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  lastActivity: string;
}

export interface SystemStats {
  totalTenants: number;
  activeTenants: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalOrders: number;
  totalUsers: number;
  serverLoad: number;
  uptime: string;
  diskUsage: number;
  memoryUsage: number;
}

export interface PlatformConfig {
  platformName: string;
  platformUrl: string;
  supportEmail: string;
  supportPhone: string;
  defaultCurrency: string;
  defaultLanguage: string;
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  maxTenantsPerUser: number;
  defaultTrialDays: number;
  platformLogo: string | null;
  platformFavicon: string | null;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  googleAnalyticsId: string;
  facebookPixelId: string;
}

// Theme Configuration for Tenants
export interface TenantThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  fontColor: string;
  hoverColor: string;
  surfaceColor: string;
  darkMode: boolean;
  adminBgColor?: string;
  adminInputBgColor?: string;
  adminBorderColor?: string;
  adminFocusColor?: string;
}

// Chat Settings
export interface ChatConfig {
  enabled: boolean;
  whatsappNumber: string;
  messengerPageId: string;
  liveChatEnabled: boolean;
  supportHoursFrom: string;
  supportHoursTo: string;
  autoReplyMessage: string;
  offlineMessage: string;
}

// Notification for Admins
export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  targetTenants: string[] | 'all';
  createdAt: string;
  expiresAt?: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

// Website Config managed by SuperAdmin
export interface GlobalWebsiteConfig {
  defaultTheme: TenantThemeConfig;
  chatConfig: ChatConfig;
  allowCustomThemes: boolean;
  allowCustomChat: boolean;
  enforceSSL: boolean;
  maxFileUploadSize: number;
  allowedFileTypes: string[];
  defaultLanguage: string;
  supportedLanguages: string[];
}

export interface Activity {
  id: number;
  type: string;
  message: string;
  time: string;
  icon: React.ElementType;
}

export type TabType = 
  | 'overview' 
  | 'tenants' 
  | 'users' 
  | 'orders' 
  | 'subscriptions' 
  | 'analytics' 
  | 'server' 
  | 'database' 
  | 'security' 
  | 'settings'
  | 'notifications'
  | 'theme-config'
  | 'chat-config'
  | 'website-config';
