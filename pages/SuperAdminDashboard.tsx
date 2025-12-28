import React, { useState, useEffect, useCallback } from 'react';
import { Building2, CreditCard, AlertTriangle, Rocket, MessageSquare } from 'lucide-react';
import { DataService } from '../services/DataService';
import { Tenant, CreateTenantPayload, TenantStatus } from '../types';
import { toast } from 'react-hot-toast';

// Import components from superadmin folder
import {
  Sidebar,
  TopBar,
  OverviewTab,
  SettingsTab,
  NotificationsTab,
  ThemeConfigTab,
  ChatConfigTab,
  CommunicationTab,
  TabType,
  SystemStats,
  TenantStats,
  PlatformConfig,
  Activity,
  AdminNotification,
  TenantThemeConfig,
  ChatConfig
} from '../components/superadmin';

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

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'tenants':
        return (
          <React.Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          }>
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

      case 'settings':
        return (
          <SettingsTab
            platformConfig={platformConfig}
            setPlatformConfig={setPlatformConfig}
            isSavingSettings={isSavingSettings}
            onSave={handleSavePlatformSettings}
          />
        );

      case 'notifications':
        return (
          <NotificationsTab
            notifications={notifications}
            onSendNotification={handleSendNotification}
            onDeleteNotification={handleDeleteNotification}
            tenants={tenants}
          />
        );

      case 'theme-config':
        return (
          <ThemeConfigTab
            config={themeConfig}
            onSave={handleSaveTheme}
            onApplyToTenant={handleApplyThemeToTenant}
            onApplyToAll={handleApplyThemeToAll}
            tenants={tenants}
          />
        );

      case 'chat-config':
        return (
          <ChatConfigTab
            config={chatConfig}
            onSave={handleSaveChatConfig}
            onApplyToTenant={handleApplyChatToTenant}
            onApplyToAll={handleApplyChatToAll}
            tenants={tenants}
          />
        );

      case 'communication':
        return <CommunicationTab />;

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
          <OverviewTab
            systemStats={systemStats}
            topTenants={mockTopTenants}
            recentActivities={mockRecentActivities}
            onViewAllTenants={() => setActiveTab('tenants')}
          />
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
