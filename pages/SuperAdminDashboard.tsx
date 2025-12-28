import React, { useState, useEffect, useCallback } from 'react';
import { Building2, CreditCard, AlertTriangle, Rocket, MessageSquare } from 'lucide-react';
import { DataService } from '../services/DataService';
import { SubscriptionService } from '../services/SubscriptionService';
import { getAuthHeader } from '../services/authService';
import { Tenant, CreateTenantPayload, TenantStatus } from '../types';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '../components/LoadingSpinner';

// Import core UI components directly (not through barrel export to enable better code splitting)
import Sidebar from '../components/superadmin/Sidebar';
import TopBar from '../components/superadmin/TopBar';
import type {
  TabType,
  SystemStats,
  TenantStats,
  PlatformConfig,
  Activity,
  AdminNotification,
  TenantThemeConfig,
  ChatConfig,
  BulkAnnouncement,
  SupportTicket,
  TicketMessage,
  MerchantHealth,
  AtRiskMerchant
} from '../components/superadmin/types';

// Lazy load tab components for better performance and code splitting
// Each tab component will be in its own bundle chunk
const OverviewTab = React.lazy(() => import('../components/superadmin/OverviewTab'));
const SettingsTab = React.lazy(() => import('../components/superadmin/SettingsTab'));
const NotificationsTab = React.lazy(() => import('../components/superadmin/NotificationsTab'));
const ThemeConfigTab = React.lazy(() => import('../components/superadmin/ThemeConfigTab'));
const ChatConfigTab = React.lazy(() => import('../components/superadmin/ChatConfigTab'));
const SubscriptionsTab = React.lazy(() => import('../components/superadmin/SubscriptionsTab'));
const BulkAnnouncementsTab = React.lazy(() => import('../components/superadmin/BulkAnnouncementsTab'));
const SupportTicketsTab = React.lazy(() => import('../components/superadmin/SupportTicketsTab'));
const MerchantSuccessTab = React.lazy(() => import('../components/superadmin/MerchantSuccessTab'));

// Lazy load AdminTenantManagement
const AdminTenantManagement = React.lazy(() => import('./AdminTenantManagement'));

// Default platform configuration
const defaultPlatformConfig: PlatformConfig = {
  platformName: 'SystemNext IT',
  platformUrl: 'systemnextit.com',
  supportEmail: 'support@systemnextit.com',
  supportPhone: '+880 1700-000000',
  defaultCurrency: 'BDT',
  defaultLanguage: 'English',
  maintenanceMode: false,
  allowNewRegistrations: true,
  maxTenantsPerUser: 5,
  defaultTrialDays: 14,
  platformLogo: null,
  platformFavicon: null,
  smtpHost: '',
  smtpPort: '587',
  smtpUser: '',
  smtpPassword: '',
  googleAnalyticsId: '',
  facebookPixelId: '',
};

// Default theme configuration
const defaultThemeConfig: TenantThemeConfig = {
  primaryColor: '#22c55e',
  secondaryColor: '#ec4899',
  tertiaryColor: '#9333ea',
  fontColor: '#0f172a',
  hoverColor: '#f97316',
  surfaceColor: '#e2e8f0',
  darkMode: false,
  adminBgColor: '#030407',
  adminInputBgColor: '#0f172a',
  adminBorderColor: '#ffffff',
  adminFocusColor: '#f87171'
};

// Default chat configuration
const defaultChatConfig: ChatConfig = {
  enabled: true,
  whatsappNumber: '',
  messengerPageId: '',
  liveChatEnabled: false,
  supportHoursFrom: '09:00',
  supportHoursTo: '18:00',
  autoReplyMessage: 'Thanks for reaching out! We\'ll get back to you soon.',
  offlineMessage: 'We\'re currently offline. Please leave a message and we\'ll respond during business hours.'
};

// Mock data for top tenants - replace with real API calls
const mockTopTenants: TenantStats[] = [
  { id: '1', name: 'OPBD Fashion', subdomain: 'opbd', plan: 'enterprise', status: 'active', totalOrders: 2450, totalRevenue: 485000, activeUsers: 45, lastActivity: '2 min ago' },
  { id: '2', name: 'StyleHub BD', subdomain: 'stylehub', plan: 'growth', status: 'active', totalOrders: 1820, totalRevenue: 320000, activeUsers: 32, lastActivity: '5 min ago' },
  { id: '3', name: 'TechMart Online', subdomain: 'techmart', plan: 'enterprise', status: 'active', totalOrders: 1560, totalRevenue: 890000, activeUsers: 28, lastActivity: '12 min ago' },
  { id: '4', name: 'FoodieExpress', subdomain: 'foodie', plan: 'starter', status: 'trialing', totalOrders: 245, totalRevenue: 45000, activeUsers: 8, lastActivity: '1 hour ago' },
  { id: '5', name: 'HomeDecor Plus', subdomain: 'homedecor', plan: 'growth', status: 'active', totalOrders: 980, totalRevenue: 210000, activeUsers: 15, lastActivity: '30 min ago' },
];

// Mock recent activities
const mockRecentActivities: Activity[] = [
  { id: 1, type: 'new_tenant', message: 'New tenant "FashionBD" registered', time: '5 min ago', icon: Building2 },
  { id: 2, type: 'payment', message: 'Payment received from StyleHub BD - ৳15,000', time: '12 min ago', icon: CreditCard },
  { id: 3, type: 'alert', message: 'High traffic detected on opbd.systemnextit.com', time: '25 min ago', icon: AlertTriangle },
  { id: 4, type: 'upgrade', message: 'TechMart upgraded to Enterprise plan', time: '1 hour ago', icon: Rocket },
  { id: 5, type: 'support', message: 'New support ticket from HomeDecor Plus', time: '2 hours ago', icon: MessageSquare },
];

// Mock announcements
const mockAnnouncements: BulkAnnouncement[] = [
  {
    id: '1',
    title: 'Scheduled Maintenance - December 29th',
    message: 'We will be performing scheduled maintenance on our servers. Expected downtime: 2 hours.',
    type: 'maintenance',
    channel: 'both',
    targetAudience: 'all',
    status: 'scheduled',
    scheduledAt: '2025-12-29T02:00:00',
    createdAt: '2 days ago',
    createdBy: 'Super Admin'
  },
  {
    id: '2',
    title: 'New Feature: Instagram Integration',
    message: 'We are excited to announce Instagram Shopping integration is now available for all Enterprise plans!',
    type: 'feature',
    channel: 'both',
    targetAudience: 'active',
    status: 'sent',
    sentAt: '2025-12-26',
    createdAt: '3 days ago',
    createdBy: 'Super Admin',
    openRate: 78,
    clickRate: 34
  },
  {
    id: '3',
    title: 'Holiday Season Tips',
    message: 'Maximize your sales this holiday season with these proven strategies...',
    type: 'info',
    channel: 'email',
    targetAudience: 'all',
    status: 'draft',
    createdAt: '1 day ago',
    createdBy: 'Super Admin'
  }
];

// Mock support tickets
const mockSupportTickets: SupportTicket[] = [
  {
    id: '1',
    tenantId: '1',
    tenantName: 'OPBD Fashion',
    tenantSubdomain: 'opbd',
    subject: 'Payment gateway not working',
    description: 'Customers are unable to complete payments through bKash. Getting error code 500.',
    category: 'bug',
    priority: 'urgent',
    status: 'in_progress',
    assignedTo: 'Support Team',
    createdAt: '2 hours ago',
    updatedAt: '30 min ago',
    messages: [
      { id: 'm1', senderId: 'tenant1', senderName: 'OPBD Admin', senderType: 'merchant', message: 'This is urgent, we are losing sales!', createdAt: '2 hours ago' },
      { id: 'm2', senderId: 'support', senderName: 'Support Team', senderType: 'support', message: 'We are investigating this issue. Can you provide the error logs?', createdAt: '1 hour ago' }
    ]
  },
  {
    id: '2',
    tenantId: '3',
    tenantName: 'TechMart Online',
    tenantSubdomain: 'techmart',
    subject: 'Request: Bulk product import from CSV',
    description: 'We have 500+ products to add. Need ability to import from CSV file.',
    category: 'feature_request',
    priority: 'medium',
    status: 'open',
    createdAt: '1 day ago',
    updatedAt: '1 day ago',
    messages: [
      { id: 'm3', senderId: 'tenant3', senderName: 'TechMart Admin', senderType: 'merchant', message: 'Adding products one by one is very time consuming. Please add CSV import.', createdAt: '1 day ago' }
    ],
    tags: ['enhancement', 'products']
  },
  {
    id: '3',
    tenantId: '5',
    tenantName: 'HomeDecor Plus',
    tenantSubdomain: 'homedecor',
    subject: 'Billing question - discount not applied',
    description: 'I signed up with a 20% discount code but my invoice shows full price.',
    category: 'billing',
    priority: 'high',
    status: 'waiting_response',
    assignedTo: 'Billing Team',
    createdAt: '5 hours ago',
    updatedAt: '3 hours ago',
    messages: [
      { id: 'm4', senderId: 'tenant5', senderName: 'HomeDecor Admin', senderType: 'merchant', message: 'The code was HOLIDAY20. Please check.', createdAt: '5 hours ago' },
      { id: 'm5', senderId: 'support', senderName: 'Billing Team', senderType: 'support', message: 'We\'ve applied the discount. Please confirm on your next invoice.', createdAt: '3 hours ago' }
    ]
  }
];

// Mock merchant health data
const mockMerchantHealth: MerchantHealth[] = [
  {
    tenantId: '1',
    tenantName: 'OPBD Fashion',
    tenantSubdomain: 'opbd',
    plan: 'enterprise',
    healthScore: 92,
    riskLevel: 'healthy',
    lastLoginAt: '2025-12-28T10:30:00',
    daysSinceLastLogin: 0,
    salesTrend: 'growing',
    salesChangePercent: 15,
    currentMonthRevenue: 485000,
    previousMonthRevenue: 421000,
    totalOrders30Days: 245,
    totalOrdersPrevious30Days: 210,
    activeProducts: 156,
    supportTicketsOpen: 1,
    alerts: []
  },
  {
    tenantId: '2',
    tenantName: 'StyleHub BD',
    tenantSubdomain: 'stylehub',
    plan: 'growth',
    healthScore: 78,
    riskLevel: 'healthy',
    lastLoginAt: '2025-12-27T14:20:00',
    daysSinceLastLogin: 1,
    salesTrend: 'stable',
    salesChangePercent: 3,
    currentMonthRevenue: 320000,
    previousMonthRevenue: 310000,
    totalOrders30Days: 182,
    totalOrdersPrevious30Days: 175,
    activeProducts: 89,
    supportTicketsOpen: 0,
    alerts: []
  },
  {
    tenantId: '3',
    tenantName: 'TechMart Online',
    tenantSubdomain: 'techmart',
    plan: 'enterprise',
    healthScore: 45,
    riskLevel: 'at_risk',
    lastLoginAt: '2025-12-20T09:00:00',
    daysSinceLastLogin: 8,
    salesTrend: 'declining',
    salesChangePercent: -35,
    currentMonthRevenue: 578000,
    previousMonthRevenue: 890000,
    totalOrders30Days: 98,
    totalOrdersPrevious30Days: 156,
    activeProducts: 234,
    supportTicketsOpen: 1,
    alerts: [
      { id: 'a1', type: 'sales_drop', severity: 'critical', message: 'Sales dropped 35% compared to last month', triggeredAt: '3 days ago', acknowledged: false },
      { id: 'a2', type: 'no_login', severity: 'warning', message: 'No login for 8 days', triggeredAt: '1 day ago', acknowledged: false }
    ]
  },
  {
    tenantId: '4',
    tenantName: 'FoodieExpress',
    tenantSubdomain: 'foodie',
    plan: 'starter',
    healthScore: 28,
    riskLevel: 'critical',
    lastLoginAt: '2025-12-10T11:45:00',
    daysSinceLastLogin: 18,
    salesTrend: 'inactive',
    salesChangePercent: -80,
    currentMonthRevenue: 9000,
    previousMonthRevenue: 45000,
    totalOrders30Days: 12,
    totalOrdersPrevious30Days: 58,
    activeProducts: 23,
    supportTicketsOpen: 0,
    alerts: [
      { id: 'a3', type: 'no_login', severity: 'critical', message: 'No login for 18 days', triggeredAt: '4 days ago', acknowledged: false },
      { id: 'a4', type: 'sales_drop', severity: 'critical', message: 'Sales dropped 80% - merchant may be churning', triggeredAt: '5 days ago', acknowledged: false },
      { id: 'a5', type: 'subscription_expiring', severity: 'warning', message: 'Trial expires in 5 days', triggeredAt: '2 days ago', acknowledged: false }
    ]
  },
  {
    tenantId: '5',
    tenantName: 'HomeDecor Plus',
    tenantSubdomain: 'homedecor',
    plan: 'growth',
    healthScore: 65,
    riskLevel: 'at_risk',
    lastLoginAt: '2025-12-25T16:00:00',
    daysSinceLastLogin: 3,
    salesTrend: 'declining',
    salesChangePercent: -20,
    currentMonthRevenue: 168000,
    previousMonthRevenue: 210000,
    totalOrders30Days: 78,
    totalOrdersPrevious30Days: 98,
    activeProducts: 67,
    supportTicketsOpen: 1,
    alerts: [
      { id: 'a6', type: 'sales_drop', severity: 'warning', message: 'Sales declined 20% this month', triggeredAt: '1 week ago', acknowledged: true }
    ]
  }
];

// Mock at-risk merchants
const mockAtRiskMerchants: AtRiskMerchant[] = [
  {
    tenantId: '4',
    tenantName: 'FoodieExpress',
    tenantSubdomain: 'foodie',
    plan: 'starter',
    riskScore: 85,
    riskFactors: ['No login for 18 days', 'Sales dropped 80%', 'Trial expiring soon'],
    status: 'needs_attention'
  },
  {
    tenantId: '3',
    tenantName: 'TechMart Online',
    tenantSubdomain: 'techmart',
    plan: 'enterprise',
    riskScore: 55,
    riskFactors: ['Sales dropped 35%', 'Reduced login frequency'],
    lastContact: '2025-12-22',
    nextFollowUp: '2025-12-30',
    notes: 'Merchant mentioned they are restructuring their business',
    status: 'contacted'
  }
];

// Loading fallback for lazy-loaded tabs
const TabLoadingFallback = () => <LoadingSpinner minHeight="min-h-[400px]" />;

const SuperAdminDashboard: React.FC = () => {
  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  // Tenant management state
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isTenantCreating, setIsTenantCreating] = useState(false);
  const [deletingTenantId, setDeletingTenantId] = useState<string | null>(null);

  // Platform settings state
  const [platformConfig, setPlatformConfig] = useState<PlatformConfig>(defaultPlatformConfig);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Theme configuration state
  const [themeConfig, setThemeConfig] = useState<TenantThemeConfig>(defaultThemeConfig);

  // Chat configuration state
  const [chatConfig, setChatConfig] = useState<ChatConfig>(defaultChatConfig);

  // Announcements state
  const [announcements, setAnnouncements] = useState<BulkAnnouncement[]>(mockAnnouncements);

  // Support tickets state
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);

  // Merchant health state
  const [merchantHealth, setMerchantHealth] = useState<MerchantHealth[]>(mockMerchantHealth);
  const [atRiskMerchants, setAtRiskMerchants] = useState<AtRiskMerchant[]>(mockAtRiskMerchants);

  // Notifications state
  const [notifications, setNotifications] = useState<AdminNotification[]>([
    {
      id: '1',
      title: 'System Update Available',
      message: 'A new version of the platform is available. Please update at your earliest convenience.',
      type: 'info',
      targetTenants: 'all',
      createdAt: '2 hours ago',
      read: false,
      priority: 'medium'
    },
    {
      id: '2',
      title: 'Payment Processing Issue',
      message: 'We detected an issue with payment processing. Our team is working on resolving it.',
      type: 'warning',
      targetTenants: 'all',
      createdAt: '5 hours ago',
      read: false,
      priority: 'high'
    }
  ]);

  // Helper to get API URL
  const getApiUrl = (): string => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3001/api';
      }
      return 'https://systemnextit.com/api';
    }
    return 'https://systemnextit.com/api';
  };

  const API_URL = getApiUrl();

  // Load tenants on mount
  useEffect(() => {
    const loadTenants = async () => {
      try {
        const data = await DataService.listTenants();
        setTenants(data);
      } catch (error) {
        console.error('Failed to load tenants:', error);
      }
    };
    loadTenants();
  }, []);

  // Load support tickets from API
  useEffect(() => {
    const loadSupportTickets = async () => {
      setIsLoadingTickets(true);
      try {
        const response = await fetch(`${API_URL}/support`, {
          headers: getAuthHeader()
        });
        
        if (response.ok) {
          const result = await response.json();
          // Transform backend tickets to frontend format
          const tickets: SupportTicket[] = (result.data || []).map((ticket: any) => ({
            id: ticket.id || ticket._id,
            tenantId: ticket.tenantId,
            tenantName: ticket.submittedBy?.name || 'Unknown Merchant',
            tenantSubdomain: ticket.tenantId,
            subject: ticket.title || getTicketSubject(ticket.type),
            description: ticket.description,
            category: mapTicketType(ticket.type),
            priority: ticket.priority || 'medium',
            status: mapTicketStatus(ticket.status),
            assignedTo: ticket.assignedTo?.name,
            createdAt: formatTimeAgo(ticket.createdAt),
            updatedAt: formatTimeAgo(ticket.updatedAt),
            messages: (ticket.comments || []).map((c: any) => ({
              id: c.id || c._id,
              senderId: c.userId,
              senderName: c.userName || 'Unknown',
              senderType: c.userId === ticket.submittedBy?.userId ? 'merchant' : 'support',
              message: c.message,
              createdAt: formatTimeAgo(c.createdAt)
            })),
            tags: ticket.images?.length > 0 ? ['has-attachments'] : []
          }));
          setSupportTickets(tickets);
        }
      } catch (error) {
        console.error('Failed to load support tickets:', error);
      } finally {
        setIsLoadingTickets(false);
      }
    };
    loadSupportTickets();
  }, [API_URL]);

  // Helper functions for ticket data transformation
  const getTicketSubject = (type: string): string => {
    switch (type) {
      case 'issue': return 'Issue Report';
      case 'feedback': return 'Feedback';
      case 'feature': return 'Feature Request';
      default: return 'Support Request';
    }
  };

  const mapTicketType = (type: string): 'bug' | 'feature_request' | 'billing' | 'technical' | 'general' => {
    switch (type) {
      case 'issue': return 'bug';
      case 'feature': return 'feature_request';
      case 'feedback': return 'general';
      default: return 'general';
    }
  };

  const mapTicketStatus = (status: string): 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed' => {
    switch (status) {
      case 'pending': return 'open';
      case 'in-progress': return 'in_progress';
      case 'resolved': return 'resolved';
      case 'closed': return 'closed';
      default: return 'open';
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  // System stats derived from tenants
  const systemStats: SystemStats = {
    totalTenants: tenants.length || 156,
    activeTenants: tenants.filter(t => t.status === 'active').length || 142,
    totalRevenue: 4250000,
    monthlyRevenue: 485000,
    totalOrders: 28450,
    totalUsers: 1250,
    serverLoad: 34,
    uptime: '99.98%',
    diskUsage: 45,
    memoryUsage: 62
  };

  // Tenant handlers
  const handleCreateTenant = useCallback(async (
    payload: CreateTenantPayload,
    options?: { activate?: boolean }
  ): Promise<Tenant> => {
    setIsTenantCreating(true);
    try {
      const newTenant = await DataService.seedTenant(payload);
      const refreshed = await DataService.listTenants();
      setTenants(refreshed);
      toast.success(`${newTenant.name} created successfully`);
      return newTenant;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create tenant';
      toast.error(message);
      throw error;
    } finally {
      setIsTenantCreating(false);
    }
  }, []);

  const handleDeleteTenant = useCallback(async (tenantId: string): Promise<void> => {
    setDeletingTenantId(tenantId);
    try {
      await DataService.deleteTenant(tenantId);
      const refreshed = await DataService.listTenants();
      setTenants(refreshed);
      toast.success('Tenant deleted successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete tenant';
      toast.error(message);
      throw error;
    } finally {
      setDeletingTenantId(null);
    }
  }, []);

  const handleRefreshTenants = useCallback(async (): Promise<Tenant[]> => {
    try {
      const data = await DataService.listTenants();
      setTenants(data);
      return data;
    } catch (error) {
      console.error('Failed to refresh tenants:', error);
      throw error;
    }
  }, []);

  // Save platform settings
  const handleSavePlatformSettings = useCallback(async () => {
    setIsSavingSettings(true);
    try {
      // In production, this would save to backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Platform settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSavingSettings(false);
    }
  }, []);

  // Notification handlers
  const handleSendNotification = useCallback(async (notification: Omit<AdminNotification, 'id' | 'createdAt' | 'read'>) => {
    try {
      // In production, this would call an API
      await new Promise(resolve => setTimeout(resolve, 500));
      const newNotification: AdminNotification = {
        ...notification,
        id: Date.now().toString(),
        createdAt: 'Just now',
        read: false
      };
      setNotifications(prev => [newNotification, ...prev]);
      toast.success('Notification sent successfully');
    } catch (error) {
      toast.error('Failed to send notification');
      throw error;
    }
  }, []);

  const handleDeleteNotification = useCallback(async (notificationId: string) => {
    try {
      // In production, this would call an API
      await new Promise(resolve => setTimeout(resolve, 300));
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
      throw error;
    }
  }, []);

  // Theme configuration handlers
  const handleSaveTheme = useCallback(async (config: TenantThemeConfig) => {
    try {
      // In production, this would save to backend
      await new Promise(resolve => setTimeout(resolve, 500));
      setThemeConfig(config);
      toast.success('Default theme saved successfully');
    } catch (error) {
      toast.error('Failed to save theme');
      throw error;
    }
  }, []);

  const handleApplyThemeToTenant = useCallback(async (tenantId: string, config: TenantThemeConfig) => {
    try {
      // In production, this would call an API to update tenant theme
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('Theme applied to tenant');
    } catch (error) {
      toast.error('Failed to apply theme');
      throw error;
    }
  }, []);

  const handleApplyThemeToAll = useCallback(async (config: TenantThemeConfig) => {
    try {
      // In production, this would call an API to update all tenants
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Theme applied to all tenants');
    } catch (error) {
      toast.error('Failed to apply theme to all tenants');
      throw error;
    }
  }, []);

  // Chat configuration handlers
  const handleSaveChatConfig = useCallback(async (config: ChatConfig) => {
    try {
      // In production, this would save to backend
      await new Promise(resolve => setTimeout(resolve, 500));
      setChatConfig(config);
      toast.success('Chat configuration saved');
    } catch (error) {
      toast.error('Failed to save chat configuration');
      throw error;
    }
  }, []);

  const handleApplyChatToTenant = useCallback(async (tenantId: string, config: ChatConfig) => {
    try {
      // In production, this would call an API to update tenant chat settings
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('Chat settings applied to tenant');
    } catch (error) {
      toast.error('Failed to apply chat settings');
      throw error;
    }
  }, []);

  const handleApplyChatToAll = useCallback(async (config: ChatConfig) => {
    try {
      // In production, this would call an API to update all tenants
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Chat settings applied to all tenants');
    } catch (error) {
      toast.error('Failed to apply chat settings to all tenants');
      throw error;
    }
  }, []);

  // Tenant status update handler
  const handleUpdateTenantStatus = useCallback(async (tenantId: string, status: Tenant['status'], reason?: string): Promise<void> => {
    try {
      // In production, this would call an API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedTenants = tenants.map(t => 
        t.id === tenantId 
          ? { 
              ...t, 
              status,
              ...(status === 'active' && { approvedAt: new Date().toISOString(), approvedBy: 'super_admin' }),
              ...(status === 'inactive' && reason && { rejectedAt: new Date().toISOString(), rejectedBy: 'super_admin', rejectionReason: reason }),
              ...(status === 'suspended' && { suspendedAt: new Date().toISOString(), suspendedBy: 'super_admin', suspensionReason: reason }),
            }
          : t
      );
      
      setTenants(updatedTenants);
      toast.success(`Tenant status updated to ${status}`);
    } catch (error) {
      toast.error('Failed to update tenant status');
      throw error;
    }
  }, [tenants]);

  // Login as merchant handler
  const handleLoginAsMerchant = useCallback(async (tenantId: string): Promise<void> => {
    try {
      const tenant = tenants.find(t => t.id === tenantId);
      if (!tenant) throw new Error('Tenant not found');
      
      // In production, this would:
      // 1. Create a temporary admin session for the tenant
      // 2. Redirect to the tenant's admin dashboard
      // 3. Log the superadmin action for audit
      
      toast.success(`Ghosting as ${tenant.name}...`);
      
      // Simulate redirect delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, show what would happen
      console.log(`Would redirect to: https://${tenant.subdomain}.systemnextit.com/admin with impersonation token`);
      
      // In production: window.location.href = impersonationUrl;
    } catch (error) {
      toast.error('Failed to login as merchant');
      throw error;
    }
  }, [tenants]);

  // Domain update handler
  const handleUpdateDomain = useCallback(async (tenantId: string, domain: string, type: 'subdomain' | 'custom'): Promise<void> => {
    try {
      // In production, this would call an API and update DNS records
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedTenants = tenants.map(t => 
        t.id === tenantId 
          ? { 
              ...t, 
              customDomain: type === 'custom' ? domain : t.customDomain,
            }
          : t
      );
      
      setTenants(updatedTenants);
      toast.success(`Domain ${domain} added successfully`);
    } catch (error) {
      toast.error('Failed to update domain');
      throw error;
    }
  }, [tenants]);

  // Announcement handlers
  const handleCreateAnnouncement = useCallback(async (announcement: Omit<BulkAnnouncement, 'id' | 'createdAt' | 'status'>) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newAnnouncement: BulkAnnouncement = {
        ...announcement,
        id: Date.now().toString(),
        createdAt: 'Just now',
        status: announcement.scheduledAt ? 'scheduled' : 'draft'
      };
      setAnnouncements(prev => [newAnnouncement, ...prev]);
      toast.success('Announcement created successfully');
    } catch (error) {
      toast.error('Failed to create announcement');
      throw error;
    }
  }, []);

  const handleUpdateAnnouncement = useCallback(async (id: string, updates: Partial<BulkAnnouncement>) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
      toast.success('Announcement updated');
    } catch (error) {
      toast.error('Failed to update announcement');
      throw error;
    }
  }, []);

  const handleDeleteAnnouncement = useCallback(async (id: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      toast.success('Announcement deleted');
    } catch (error) {
      toast.error('Failed to delete announcement');
      throw error;
    }
  }, []);

  const handleSendAnnouncement = useCallback(async (id: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setAnnouncements(prev => prev.map(a => 
        a.id === id ? { ...a, status: 'sent' as const, sentAt: new Date().toISOString() } : a
      ));
      toast.success('Announcement sent successfully');
    } catch (error) {
      toast.error('Failed to send announcement');
      throw error;
    }
  }, []);

  // Support ticket handlers
  const handleCreateTicket = useCallback(async (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'messages'>) => {
    try {
      const response = await fetch(`${API_URL}/support`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: ticket.category === 'bug' ? 'issue' : ticket.category === 'feature_request' ? 'feature' : 'feedback',
          title: ticket.subject,
          description: ticket.description,
          priority: ticket.priority,
          tenantId: ticket.tenantId
        })
      });
      
      if (!response.ok) throw new Error('Failed to create ticket');
      
      // Refresh tickets list
      const refreshResponse = await fetch(`${API_URL}/support`, { headers: getAuthHeader() });
      if (refreshResponse.ok) {
        const result = await refreshResponse.json();
        const tickets: SupportTicket[] = (result.data || []).map((t: any) => ({
          id: t.id || t._id,
          tenantId: t.tenantId,
          tenantName: t.submittedBy?.name || 'Unknown Merchant',
          tenantSubdomain: t.tenantId,
          subject: t.title || getTicketSubject(t.type),
          description: t.description,
          category: mapTicketType(t.type),
          priority: t.priority || 'medium',
          status: mapTicketStatus(t.status),
          assignedTo: t.assignedTo?.name,
          createdAt: formatTimeAgo(t.createdAt),
          updatedAt: formatTimeAgo(t.updatedAt),
          messages: (t.comments || []).map((c: any) => ({
            id: c.id || c._id,
            senderId: c.userId,
            senderName: c.userName || 'Unknown',
            senderType: c.userId === t.submittedBy?.userId ? 'merchant' : 'support',
            message: c.message,
            createdAt: formatTimeAgo(c.createdAt)
          })),
          tags: t.images?.length > 0 ? ['has-attachments'] : []
        }));
        setSupportTickets(tickets);
      }
      toast.success('Ticket created');
    } catch (error) {
      toast.error('Failed to create ticket');
      throw error;
    }
  }, [API_URL]);

  const handleUpdateTicket = useCallback(async (id: string, updates: Partial<SupportTicket>) => {
    try {
      const backendUpdates: any = {};
      if (updates.status) {
        backendUpdates.status = updates.status === 'open' ? 'pending' 
          : updates.status === 'in_progress' ? 'in-progress' 
          : updates.status;
      }
      if (updates.priority) backendUpdates.priority = updates.priority;
      
      const response = await fetch(`${API_URL}/support/${id}`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(backendUpdates)
      });
      
      if (!response.ok) throw new Error('Failed to update ticket');
      
      setSupportTickets(prev => prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: 'Just now' } : t));
      toast.success('Ticket updated');
    } catch (error) {
      toast.error('Failed to update ticket');
      throw error;
    }
  }, [API_URL]);

  const handleReplyTicket = useCallback(async (ticketId: string, message: Omit<TicketMessage, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch(`${API_URL}/support/${ticketId}/comments`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: message.message })
      });
      
      if (!response.ok) throw new Error('Failed to send reply');
      
      const result = await response.json();
      const newMessage: TicketMessage = {
        id: result.data?.id || Date.now().toString(),
        senderId: message.senderId,
        senderName: message.senderName,
        senderType: 'support',
        message: message.message,
        createdAt: 'Just now'
      };
      
      setSupportTickets(prev => prev.map(t => 
        t.id === ticketId 
          ? { ...t, messages: [...t.messages, newMessage], updatedAt: 'Just now', status: 'waiting_response' as const }
          : t
      ));
      toast.success('Reply sent');
    } catch (error) {
      toast.error('Failed to send reply');
      throw error;
    }
  }, [API_URL]);

  const handleCloseTicket = useCallback(async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/support/${id}`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'closed' })
      });
      
      if (!response.ok) throw new Error('Failed to close ticket');
      
      setSupportTickets(prev => prev.map(t => 
        t.id === id ? { ...t, status: 'closed' as const, resolvedAt: new Date().toISOString() } : t
      ));
      toast.success('Ticket closed');
    } catch (error) {
      toast.error('Failed to close ticket');
      throw error;
    }
  }, [API_URL]);

  // Merchant success handlers
  const handleAcknowledgeAlert = useCallback(async (merchantId: string, alertId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setMerchantHealth(prev => prev.map(m => 
        m.tenantId === merchantId 
          ? { ...m, alerts: m.alerts.map(a => a.id === alertId ? { ...a, acknowledged: true, acknowledgedAt: new Date().toISOString() } : a) }
          : m
      ));
      toast.success('Alert acknowledged');
    } catch (error) {
      toast.error('Failed to acknowledge alert');
      throw error;
    }
  }, []);

  const handleContactMerchant = useCallback(async (merchantId: string, method: 'email' | 'phone' | 'message') => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      toast.success(`Opening ${method} for merchant...`);
      // In production, this would open email client, phone dialer, or messaging interface
    } catch (error) {
      toast.error('Failed to contact merchant');
      throw error;
    }
  }, []);

  const handleScheduleFollowUp = useCallback(async (merchantId: string, date: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setAtRiskMerchants(prev => prev.map(m => 
        m.tenantId === merchantId ? { ...m, nextFollowUp: date } : m
      ));
      toast.success('Follow-up scheduled');
    } catch (error) {
      toast.error('Failed to schedule follow-up');
      throw error;
    }
  }, []);

  const handleUpdateMerchantStatus = useCallback(async (merchantId: string, status: AtRiskMerchant['status']) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setAtRiskMerchants(prev => prev.map(m => 
        m.tenantId === merchantId ? { ...m, status } : m
      ));
      toast.success('Merchant status updated');
    } catch (error) {
      toast.error('Failed to update status');
      throw error;
    }
  }, []);

  const handleAddNote = useCallback(async (merchantId: string, note: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setAtRiskMerchants(prev => prev.map(m => 
        m.tenantId === merchantId ? { ...m, notes: note } : m
      ));
      toast.success('Note saved');
    } catch (error) {
      toast.error('Failed to save note');
      throw error;
    }
  }, []);

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'tenants':
        return (
          <React.Suspense fallback={<TabLoadingFallback />}>
            <AdminTenantManagement
              tenants={tenants}
              onCreateTenant={handleCreateTenant}
              onDeleteTenant={handleDeleteTenant}
              onRefreshTenants={handleRefreshTenants}
              onUpdateTenantStatus={handleUpdateTenantStatus}
              onLoginAsMerchant={handleLoginAsMerchant}
              onUpdateDomain={handleUpdateDomain}
              isCreating={isTenantCreating}
              deletingTenantId={deletingTenantId}
            />
          </React.Suspense>
        );

      case 'subscriptions':
        return (
          <React.Suspense fallback={<TabLoadingFallback />}>
            <SubscriptionsTab
              onLoadPlans={async () => await SubscriptionService.getPlans()}
              onCreatePlan={async (plan) => {
                await SubscriptionService.createPlan(plan);
              }}
              onUpdatePlan={async (id, plan) => {
                await SubscriptionService.updatePlan(id, plan);
              }}
              onDeletePlan={async (id) => {
                await SubscriptionService.deletePlan(id);
              }}
              onLoadTransactions={async () => {
                const result = await SubscriptionService.getTransactions();
                return result.data;
              }}
              onRefundTransaction={async (id, reason) => {
                await SubscriptionService.refundTransaction(id, reason);
              }}
              onLoadInvoices={async () => {
                const result = await SubscriptionService.getInvoices();
                return result.data;
              }}
              onLoadTrialSettings={async () => await SubscriptionService.getTrialSettings()}
              onUpdateTrialSettings={async (settings) => {
                await SubscriptionService.updateTrialSettings(settings);
              }}
            />
          </React.Suspense>
        );

      case 'settings':
        return (
          <React.Suspense fallback={<TabLoadingFallback />}>
            <SettingsTab
              platformConfig={platformConfig}
              setPlatformConfig={setPlatformConfig}
              isSavingSettings={isSavingSettings}
              onSave={handleSavePlatformSettings}
            />
          </React.Suspense>
        );

      case 'notifications':
        return (
          <React.Suspense fallback={<TabLoadingFallback />}>
            <NotificationsTab
              notifications={notifications}
              onSendNotification={handleSendNotification}
              onDeleteNotification={handleDeleteNotification}
              tenants={tenants}
            />
          </React.Suspense>
        );

      case 'theme-config':
        return (
          <React.Suspense fallback={<TabLoadingFallback />}>
            <ThemeConfigTab
              config={themeConfig}
              onSave={handleSaveTheme}
              onApplyToTenant={handleApplyThemeToTenant}
              onApplyToAll={handleApplyThemeToAll}
              tenants={tenants}
            />
          </React.Suspense>
        );

      case 'chat-config':
        return (
          <React.Suspense fallback={<TabLoadingFallback />}>
            <ChatConfigTab
              config={chatConfig}
              onSave={handleSaveChatConfig}
              onApplyToTenant={handleApplyChatToTenant}
              onApplyToAll={handleApplyChatToAll}
              tenants={tenants}
            />
          </React.Suspense>
        );

      case 'announcements':
        return (
          <React.Suspense fallback={<TabLoadingFallback />}>
            <BulkAnnouncementsTab
              announcements={announcements}
              tenants={tenants}
              onCreateAnnouncement={handleCreateAnnouncement}
              onUpdateAnnouncement={handleUpdateAnnouncement}
              onDeleteAnnouncement={handleDeleteAnnouncement}
              onSendAnnouncement={handleSendAnnouncement}
            />
          </React.Suspense>
        );

      case 'support-tickets':
        return (
          <React.Suspense fallback={<TabLoadingFallback />}>
            <SupportTicketsTab
              tickets={supportTickets}
              tenants={tenants}
              onCreateTicket={handleCreateTicket}
              onUpdateTicket={handleUpdateTicket}
              onReplyTicket={handleReplyTicket}
              onCloseTicket={handleCloseTicket}
            />
          </React.Suspense>
        );

      case 'merchant-success':
        return (
          <React.Suspense fallback={<TabLoadingFallback />}>
            <MerchantSuccessTab
              merchantHealth={merchantHealth}
              atRiskMerchants={atRiskMerchants}
              tenants={tenants}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onContactMerchant={handleContactMerchant}
              onScheduleFollowUp={handleScheduleFollowUp}
              onUpdateMerchantStatus={handleUpdateMerchantStatus}
              onAddNote={handleAddNote}
            />
          </React.Suspense>
        );

      case 'website-config':
        return (
          <div className="p-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Website Configuration</h2>
              <p className="text-slate-600 mb-6">
                Configure global website settings for all tenants. This includes SEO, meta tags, and other website-wide settings.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="font-semibold text-slate-700 mb-2">Theme Settings</h3>
                  <p className="text-sm text-slate-500 mb-3">Configure default themes for tenant stores</p>
                  <button
                    onClick={() => setActiveTab('theme-config')}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition-colors"
                  >
                    Go to Theme Config
                  </button>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="font-semibold text-slate-700 mb-2">Chat Settings</h3>
                  <p className="text-sm text-slate-500 mb-3">Configure chat widgets for tenant stores</p>
                  <button
                    onClick={() => setActiveTab('chat-config')}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition-colors"
                  >
                    Go to Chat Config
                  </button>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="font-semibold text-slate-700 mb-2">Notifications</h3>
                  <p className="text-sm text-slate-500 mb-3">Send notifications to tenant admins</p>
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition-colors"
                  >
                    Go to Notifications
                  </button>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="font-semibold text-slate-700 mb-2">Platform Settings</h3>
                  <p className="text-sm text-slate-500 mb-3">Configure global platform settings</p>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition-colors"
                  >
                    Go to Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <React.Suspense fallback={<TabLoadingFallback />}>
            <OverviewTab
              systemStats={systemStats}
              topTenants={mockTopTenants}
              recentActivities={mockRecentActivities}
              onViewAllTenants={() => setActiveTab('tenants')}
            />
          </React.Suspense>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalTenants={systemStats.totalTenants}
      />

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-20'} ml-0`}>
        {/* Top Bar */}
        <TopBar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
        />

        {/* Tab Content */}
        {renderTabContent()}
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
