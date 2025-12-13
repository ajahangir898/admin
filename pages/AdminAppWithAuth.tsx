// AdminAppWithAuth.tsx - Wrapper component that integrates authentication with AdminApp
import React, { useState, useEffect, useCallback } from 'react';
import AdminApp from './AdminApp';
import AdminLogin from './AdminLogin';
import * as authService from '../services/authService';
import { User, Tenant, Order, Product, ThemeConfig, WebsiteConfig, DeliveryConfig, CourierConfig, FacebookPixelConfig, ChatMessage } from '../types';
import { Loader2 } from 'lucide-react';

interface AdminAppWithAuthProps {
  activeTenantId: string;
  tenants: Tenant[];
  orders: Order[];
  products: Product[];
  logo: string | null;
  themeConfig: ThemeConfig;
  websiteConfig?: WebsiteConfig;
  deliveryConfig: DeliveryConfig[];
  courierConfig: CourierConfig;
  facebookPixelConfig: FacebookPixelConfig;
  chatMessages: ChatMessage[];
  onLogout: () => void;
  onUpdateOrder: (orderId: string, updates: Partial<Order>) => void;
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: number) => void;
  onBulkDeleteProducts: (ids: number[]) => void;
  onBulkUpdateProducts: (ids: number[], updates: Partial<Product>) => void;
  onUpdateLogo: (logo: string | null) => void;
  onUpdateTheme: (config: ThemeConfig) => void;
  onUpdateWebsiteConfig: (config: WebsiteConfig) => void;
  onUpdateDeliveryConfig: (configs: DeliveryConfig[]) => void;
  onUpdateCourierConfig: (config: CourierConfig) => void;
  onUpdateProfile: (user: User) => void;
  onTenantChange: (tenantId: string) => void;
  isTenantSwitching: boolean;
  onSwitchToStore: () => void;
  onOpenAdminChat: () => void;
  hasUnreadChat: boolean;
}

const AdminAppWithAuth: React.FC<AdminAppWithAuthProps> = (props) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isValidating, setIsValidating] = useState(true);

  // Validate session on mount
  useEffect(() => {
    const validateSession = async () => {
      try {
        if (!authService.isAuthenticated()) {
          setIsAuthenticated(false);
          setIsValidating(false);
          return;
        }

        // Validate token with backend
        const { user: currentUser } = await authService.getCurrentUser();
        setUser(currentUser as User);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Session validation failed:', error);
        authService.logout();
        setIsAuthenticated(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateSession();
  }, []);

  // Handle successful login
  const handleLoginSuccess = useCallback(async () => {
    const storedUser = authService.getStoredUser();
    setUser(storedUser as User);
    setIsAuthenticated(true);
  }, []);

  // Handle logout
  const handleLogout = useCallback(() => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    props.onLogout();
  }, [props.onLogout]);

  // Show loading state while validating
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a1410]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Validating session...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  // Show admin app with authenticated user
  return (
    <AdminApp
      {...props}
      user={user}
      onLogout={handleLogout}
    />
  );
};

export default AdminAppWithAuth;
