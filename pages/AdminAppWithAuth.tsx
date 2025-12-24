// AdminAppWithAuth.tsx - Wrapper component that integrates authentication with AdminApp
import React, { useState, useEffect, useCallback } from 'react';
import AdminApp, { preloadAdminChunks } from './AdminApp';
import AdminLogin from './AdminLogin';
import * as authService from '../services/authService';
import { User, Tenant, Order, Product, ThemeConfig, WebsiteConfig, DeliveryConfig, CourierConfig, FacebookPixelConfig, ChatMessage } from '../types';
import { Loader2 } from 'lucide-react';

// Permission map type
type PermissionMap = Record<string, string[]>;

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
  const [userPermissions, setUserPermissions] = useState<PermissionMap>({});
  const [isValidating, setIsValidating] = useState(true);

  // Validate session on mount
  useEffect(() => {
    // Start preloading admin chunks
    preloadAdminChunks();
    
    const validateSession = async () => {
      try {
        if (!authService.isAuthenticated()) {
          setIsAuthenticated(false);
          setIsValidating(false);
          return;
        }

        // Validate token with backend
        const { user: currentUser, permissions } = await authService.getCurrentUser();
        setUser(currentUser as User);
        
        // Convert permissions array to map if needed
        if (Array.isArray(permissions)) {
          const permMap: PermissionMap = {};
          permissions.forEach((p: any) => {
            permMap[p.resource] = p.actions;
          });
          setUserPermissions(permMap);
        } else if (permissions && typeof permissions === 'object') {
          setUserPermissions(permissions as PermissionMap);
        }
        
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
    const storedPerms = authService.getStoredPermissions();
    
    setUser(storedUser as User);
    
    // Convert permissions
    if (Array.isArray(storedPerms)) {
      const permMap: PermissionMap = {};
      storedPerms.forEach((p: any) => {
        permMap[p.resource] = p.actions;
      });
      setUserPermissions(permMap);
    } else if (storedPerms && typeof storedPerms === 'object') {
      setUserPermissions(storedPerms as PermissionMap);
    }
    
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
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
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
      userPermissions={userPermissions}
      onLogout={handleLogout}
    />
  );
};

export default AdminAppWithAuth;
