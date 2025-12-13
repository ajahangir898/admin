import { useCallback } from 'react';
import { useAuth, ResourceType, ActionType } from '../context/AuthContext';

/**
 * usePermissions Hook
 * 
 * A custom hook to quickly check if the current user has
 * the required permission for a specific resource and action.
 * 
 * @example
 * // Check single permission
 * const canEditProducts = usePermissions('products', 'edit');
 * 
 * @example
 * // In a component
 * const ProductsPage = () => {
 *   const canEdit = usePermissions('products', 'edit');
 *   const canDelete = usePermissions('products', 'delete');
 * 
 *   return (
 *     <div>
 *       {canEdit && <button>Edit Product</button>}
 *       {canDelete && <button>Delete Product</button>}
 *     </div>
 *   );
 * };
 */
export const usePermissions = (resource: ResourceType, action: ActionType): boolean => {
  const { hasPermission, isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated || !user) return false;
  
  return hasPermission(resource, action);
};

/**
 * useResourceAccess Hook
 * 
 * Get all permission levels for a specific resource.
 * Useful when you need to check multiple actions at once.
 * 
 * @example
 * const { canRead, canWrite, canEdit, canDelete } = useResourceAccess('orders');
 */
export const useResourceAccess = (resource: ResourceType) => {
  const { 
    hasPermission, 
    isAuthenticated, 
    user,
    permissions 
  } = useAuth();
  
  return {
    canRead: hasPermission(resource, 'read'),
    canWrite: hasPermission(resource, 'write'),
    canEdit: hasPermission(resource, 'edit'),
    canDelete: hasPermission(resource, 'delete'),
    isAuthenticated,
    userRole: user?.role,
    // Get raw permissions for this resource
    rawPermissions: permissions[resource] || []
  };
};

/**
 * useAdminAccess Hook
 * 
 * Check if user has admin-level access (admin, tenant_admin, or super_admin).
 */
export const useAdminAccess = () => {
  const { user, isAuthenticated } = useAuth();
  
  const adminRoles = ['admin', 'tenant_admin', 'super_admin'];
  const isAdmin = isAuthenticated && user && adminRoles.includes(user.role);
  const isSuperAdmin = isAuthenticated && user?.role === 'super_admin';
  const isTenantAdmin = isAuthenticated && user?.role === 'tenant_admin';
  
  return {
    isAdmin,
    isSuperAdmin,
    isTenantAdmin,
    userRole: user?.role,
    isAuthenticated
  };
};

/**
 * useCanAccess Hook
 * 
 * Generic hook to check if user can access a specific page/section.
 * Returns both the permission status and a reason if denied.
 */
export const useCanAccess = (resource: ResourceType) => {
  const { hasPermission, isAuthenticated, user } = useAuth();
  
  const canAccess = isAuthenticated && hasPermission(resource, 'read');
  
  let reason = '';
  if (!isAuthenticated) {
    reason = 'You must be logged in to access this page.';
  } else if (!canAccess) {
    reason = `You don't have permission to access this section.`;
  }
  
  return {
    canAccess,
    reason,
    userRole: user?.role
  };
};

/**
 * usePermissionCheck Hook
 * 
 * A versatile hook for checking multiple permissions with different logic (AND/OR).
 * 
 * @example
 * const { hasAny, hasAll } = usePermissionCheck([
 *   { resource: 'products', action: 'edit' },
 *   { resource: 'orders', action: 'write' }
 * ]);
 */
export const usePermissionCheck = (
  permissions: Array<{ resource: ResourceType; action: ActionType }>
) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();
  
  return {
    hasAny: hasAnyPermission(permissions),
    hasAll: hasAllPermissions(permissions),
    checkSpecific: useCallback(
      (resource: ResourceType, action: ActionType) => hasPermission(resource, action),
      [hasPermission]
    )
  };
};

export default usePermissions;
