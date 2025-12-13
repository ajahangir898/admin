import React, { ReactNode } from 'react';
import { useAuth, ResourceType, ActionType } from '../context/AuthContext';
import { Shield, Lock, AlertTriangle, LogIn } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  resource: ResourceType;
  action?: ActionType;
  fallback?: ReactNode;
  showAccessDenied?: boolean;
}

interface AccessDeniedProps {
  reason?: string;
  onLogin?: () => void;
  isAuthRequired?: boolean;
}

/**
 * AccessDenied Component
 * Shown when user doesn't have required permissions
 */
export const AccessDenied: React.FC<AccessDeniedProps> = ({ 
  reason = "You don't have permission to access this page.",
  onLogin,
  isAuthRequired = false
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="bg-gradient-to-br from-[#1a0b0f]/80 via-[#0f0810]/90 to-[#0a0f14]/80 backdrop-blur-xl rounded-3xl border border-red-500/20 p-12 max-w-lg text-center shadow-2xl">
        <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-900/30">
          {isAuthRequired ? (
            <LogIn className="text-red-400" size={40} />
          ) : (
            <Lock className="text-red-400" size={40} />
          )}
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-3">
          {isAuthRequired ? 'Authentication Required' : 'Access Denied'}
        </h2>
        
        <p className="text-slate-400 mb-6">{reason}</p>
        
        {isAuthRequired && onLogin && (
          <button
            onClick={onLogin}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-900/30"
          >
            Sign In
          </button>
        )}
        
        {!isAuthRequired && (
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mt-4">
            <AlertTriangle size={16} />
            <span>Contact your administrator for access</span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * ProtectedRoute Component
 * 
 * Wraps content that requires specific permissions to access.
 * If user lacks permission, shows AccessDenied or custom fallback.
 * 
 * @example
 * <ProtectedRoute resource="products" action="edit">
 *   <ProductEditForm />
 * </ProtectedRoute>
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  resource,
  action = 'read' as ActionType,
  fallback,
  showAccessDenied = true
}) => {
  const { hasPermission, isAuthenticated, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500/30 border-t-emerald-500"></div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    if (fallback) return <>{fallback}</>;
    if (showAccessDenied) {
      return (
        <AccessDenied 
          reason="You must be logged in to access this page."
          isAuthRequired={true}
        />
      );
    }
    return null;
  }

  // Check if user has permission
  const hasAccess = hasPermission(resource, action);

  if (!hasAccess) {
    if (fallback) return <>{fallback}</>;
    if (showAccessDenied) {
      return (
        <AccessDenied 
          reason={`You don't have ${action} permission for ${resource.replace(/_/g, ' ')}.`}
        />
      );
    }
    return null;
  }

  return <>{children}</>;
};

/**
 * ProtectedElement Component
 * 
 * For conditionally rendering UI elements based on permissions.
 * If user lacks permission, renders nothing (or fallback).
 * 
 * @example
 * <ProtectedElement resource="products" action="delete">
 *   <button>Delete Product</button>
 * </ProtectedElement>
 */
interface ProtectedElementProps {
  children: ReactNode;
  resource: ResourceType;
  action: ActionType;
  fallback?: ReactNode;
}

export const ProtectedElement: React.FC<ProtectedElementProps> = ({
  children,
  resource,
  action,
  fallback = null
}) => {
  const { hasPermission, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <>{fallback}</>;
  if (!hasPermission(resource, action)) return <>{fallback}</>;

  return <>{children}</>;
};

/**
 * withPermission HOC
 * 
 * Higher-order component to wrap entire components with permission checks.
 * 
 * @example
 * const ProtectedProductEdit = withPermission(ProductEditForm, 'products', 'edit');
 */
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  resource: ResourceType,
  action: ActionType = 'read'
) {
  const WithPermission: React.FC<P> = (props) => {
    return (
      <ProtectedRoute resource={resource} action={action}>
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };

  WithPermission.displayName = `withPermission(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  
  return WithPermission;
}

/**
 * RequireRole Component
 * 
 * Shows content only if user has one of the required roles.
 * 
 * @example
 * <RequireRole roles={['admin', 'super_admin']}>
 *   <AdminSettings />
 * </RequireRole>
 */
interface RequireRoleProps {
  children: ReactNode;
  roles: Array<'customer' | 'admin' | 'tenant_admin' | 'super_admin' | 'staff'>;
  fallback?: ReactNode;
}

export const RequireRole: React.FC<RequireRoleProps> = ({
  children,
  roles,
  fallback = null
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) return <>{fallback}</>;
  if (!roles.includes(user.role)) return <>{fallback}</>;

  return <>{children}</>;
};

export default ProtectedRoute;
