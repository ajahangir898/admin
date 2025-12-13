import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, Users, Lock, Edit, Trash2, Plus, Check, X, Search, 
  Eye, EyeOff, UserPlus, Mail, Phone, KeyRound, ChevronDown,
  AlertTriangle, Loader2, Save
} from 'lucide-react';

// Types
export type ResourceType = 
  | 'dashboard' | 'orders' | 'products' | 'customers' | 'inventory'
  | 'catalog' | 'landing_pages' | 'gallery' | 'reviews' | 'daily_target'
  | 'business_report' | 'expenses' | 'income' | 'due_book' | 'profit_loss'
  | 'notes' | 'customization' | 'settings' | 'admin_control' | 'tenants';

export type ActionType = 'read' | 'write' | 'edit' | 'delete';

export interface Permission {
  resource: ResourceType;
  actions: ActionType[];
}

export interface Role {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  tenantId?: string;
  isSystem?: boolean;
  permissions: Permission[];
}

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  address?: string;
  username?: string;
  image?: string;
  role: 'customer' | 'admin' | 'tenant_admin' | 'super_admin' | 'staff';
  roleId?: string;
  roleDetails?: Role;
  tenantId?: string;
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Resources configuration
const RESOURCES: Array<{ id: ResourceType; label: string; category: string }> = [
  { id: 'dashboard', label: 'Dashboard', category: 'General' },
  { id: 'orders', label: 'Orders', category: 'Sales' },
  { id: 'products', label: 'Products', category: 'Sales' },
  { id: 'customers', label: 'Customers', category: 'Sales' },
  { id: 'inventory', label: 'Inventory', category: 'Sales' },
  { id: 'catalog', label: 'Catalog', category: 'Content' },
  { id: 'landing_pages', label: 'Landing Pages', category: 'Content' },
  { id: 'gallery', label: 'Gallery', category: 'Content' },
  { id: 'reviews', label: 'Reviews', category: 'Content' },
  { id: 'daily_target', label: 'Daily Target', category: 'Reports' },
  { id: 'business_report', label: 'Business Report', category: 'Reports' },
  { id: 'expenses', label: 'Expenses', category: 'Finance' },
  { id: 'income', label: 'Income', category: 'Finance' },
  { id: 'due_book', label: 'Due Book', category: 'Finance' },
  { id: 'profit_loss', label: 'Profit/Loss', category: 'Finance' },
  { id: 'notes', label: 'Notes', category: 'Finance' },
  { id: 'customization', label: 'Customization', category: 'System' },
  { id: 'settings', label: 'Settings', category: 'System' },
  { id: 'admin_control', label: 'Admin Control', category: 'System' },
  { id: 'tenants', label: 'Tenants', category: 'System' },
];

const ACTIONS: ActionType[] = ['read', 'write', 'edit', 'delete'];

const BUILT_IN_ROLES = ['customer', 'admin', 'tenant_admin', 'super_admin', 'staff'];

interface AdminControlProps {
  users: User[];
  roles: Role[];
  onAddUser?: (user: Omit<User, '_id' | 'id'>) => Promise<void>;
  onUpdateUser?: (userId: string, updates: Partial<User>) => Promise<void>;
  onDeleteUser?: (userId: string) => Promise<void>;
  onAddRole: (role: Omit<Role, '_id' | 'id'>) => Promise<void>;
  onUpdateRole: (roleId: string, updates: Partial<Role>) => Promise<void>;
  onDeleteRole: (roleId: string) => Promise<void>;
  onUpdateUserRole: (userEmail: string, roleId: string) => Promise<void>;
  currentUser?: User | null;
  tenantId?: string;
}

const AdminControl: React.FC<AdminControlProps> = ({
  users,
  roles = [],
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onAddRole,
  onUpdateRole,
  onDeleteRole,
  onUpdateUserRole,
  currentUser,
  tenantId
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // User Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [userFormData, setUserFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'staff',
    roleId: '',
    isActive: true
  });
  
  // Role Modal State
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleFormData, setRoleFormData] = useState<Partial<Role>>({
    name: '',
    description: '',
    permissions: []
  });

  // Filter users
  const adminUsers = useMemo(() => {
    return users.filter(u => 
      u.role && u.role !== 'customer' && 
      (u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [users, searchTerm]);

  // Group resources by category
  const resourcesByCategory = useMemo(() => {
    return RESOURCES.reduce((acc, resource) => {
      if (!acc[resource.category]) acc[resource.category] = [];
      acc[resource.category].push(resource);
      return acc;
    }, {} as Record<string, typeof RESOURCES>);
  }, []);

  // Role label formatter
  const formatRoleLabel = (role?: User['role']) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'tenant_admin': return 'Tenant Admin';
      case 'admin': return 'Admin';
      case 'staff': return 'Staff';
      default: return role || 'Unknown';
    }
  };

  // Get role badge color
  const getRoleBadgeClass = (role?: User['role']) => {
    switch (role) {
      case 'super_admin':
        return 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-200 border-purple-500/40';
      case 'tenant_admin':
        return 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-200 border-blue-500/40';
      case 'admin':
        return 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-200 border-emerald-500/40';
      case 'staff':
        return 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-200 border-amber-500/40';
      default:
        return 'bg-white/10 text-slate-300 border-white/20';
    }
  };

  // ============ USER HANDLERS ============

  const handleOpenUserModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setUserFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        roleId: user.roleId || '',
        isActive: user.isActive !== false
      });
    } else {
      setEditingUser(null);
      setUserFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'staff',
        roleId: '',
        isActive: true
      });
    }
    setShowPassword(false);
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.name || !userFormData.email) {
      alert('Name and Email are required');
      return;
    }

    if (!editingUser && !userFormData.password) {
      alert('Password is required for new users');
      return;
    }

    setIsLoading(true);
    try {
      // Ensure role is a string, not an object
      const sanitizedData = {
        ...userFormData,
        role: String(userFormData.role || 'staff') as User['role'],
        roleId: userFormData.roleId || undefined
      };

      if (editingUser) {
        await onUpdateUser?.(editingUser._id || editingUser.id || '', sanitizedData);
      } else {
        await onAddUser?.({ ...sanitizedData, tenantId } as Omit<User, '_id' | 'id'>);
      }
      setIsUserModalOpen(false);
    } catch (error) {
      console.error('Error saving user:', error);
      alert(error instanceof Error ? error.message : 'Failed to save user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    const userId = user._id || user.id;
    if (!userId) return;

    if (user.email === currentUser?.email) {
      alert("You cannot delete your own account");
      return;
    }

    if (window.confirm(`Are you sure you want to delete user "${user.name}"?`)) {
      setIsLoading(true);
      try {
        await onDeleteUser?.(userId);
      } catch (error) {
        console.error('Error deleting user:', error);
        alert(error instanceof Error ? error.message : 'Failed to delete user');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // ============ ROLE HANDLERS ============

  const handleOpenRoleModal = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setRoleFormData({
        name: role.name,
        description: role.description,
        permissions: role.permissions || []
      });
    } else {
      setEditingRole(null);
      setRoleFormData({
        name: '',
        description: '',
        permissions: []
      });
    }
    setIsRoleModalOpen(true);
  };

  const handleTogglePermission = (resourceId: ResourceType, action: ActionType) => {
    const currentPermissions = roleFormData.permissions || [];
    const existingPermIndex = currentPermissions.findIndex(p => p.resource === resourceId);
    
    if (existingPermIndex >= 0) {
      const existingPerm = currentPermissions[existingPermIndex];
      const hasAction = existingPerm.actions.includes(action);
      
      if (hasAction) {
        // Remove action
        const newActions = existingPerm.actions.filter(a => a !== action);
        if (newActions.length === 0) {
          // Remove entire permission if no actions left
          setRoleFormData({
            ...roleFormData,
            permissions: currentPermissions.filter((_, i) => i !== existingPermIndex)
          });
        } else {
          const newPermissions = [...currentPermissions];
          newPermissions[existingPermIndex] = { ...existingPerm, actions: newActions };
          setRoleFormData({ ...roleFormData, permissions: newPermissions });
        }
      } else {
        // Add action
        const newPermissions = [...currentPermissions];
        newPermissions[existingPermIndex] = { 
          ...existingPerm, 
          actions: [...existingPerm.actions, action] 
        };
        setRoleFormData({ ...roleFormData, permissions: newPermissions });
      }
    } else {
      // Add new permission with this action
      setRoleFormData({
        ...roleFormData,
        permissions: [...currentPermissions, { resource: resourceId, actions: [action] }]
      });
    }
  };

  const hasPermissionAction = (resourceId: ResourceType, action: ActionType): boolean => {
    const perm = roleFormData.permissions?.find(p => p.resource === resourceId);
    return perm?.actions.includes(action) ?? false;
  };

  const handleSelectAllForResource = (resourceId: ResourceType) => {
    const currentPermissions = roleFormData.permissions || [];
    const existingPermIndex = currentPermissions.findIndex(p => p.resource === resourceId);
    
    if (existingPermIndex >= 0) {
      const existingPerm = currentPermissions[existingPermIndex];
      if (existingPerm.actions.length === ACTIONS.length) {
        // Deselect all
        setRoleFormData({
          ...roleFormData,
          permissions: currentPermissions.filter((_, i) => i !== existingPermIndex)
        });
      } else {
        // Select all
        const newPermissions = [...currentPermissions];
        newPermissions[existingPermIndex] = { resource: resourceId, actions: [...ACTIONS] };
        setRoleFormData({ ...roleFormData, permissions: newPermissions });
      }
    } else {
      // Add all actions
      setRoleFormData({
        ...roleFormData,
        permissions: [...currentPermissions, { resource: resourceId, actions: [...ACTIONS] }]
      });
    }
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleFormData.name) {
      alert('Role Name is required');
      return;
    }

    setIsLoading(true);
    try {
      if (editingRole) {
        await onUpdateRole(editingRole._id || editingRole.id || '', roleFormData);
      } else {
        await onAddRole({ ...roleFormData, tenantId } as Omit<Role, '_id' | 'id'>);
      }
      setIsRoleModalOpen(false);
    } catch (error) {
      console.error('Error saving role:', error);
      alert(error instanceof Error ? error.message : 'Failed to save role');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRole = async (role: Role) => {
    const roleId = role._id || role.id;
    if (!roleId) return;

    if (role.isSystem) {
      alert('System roles cannot be deleted');
      return;
    }

    const assignedUsers = users.filter(u => u.roleId === roleId);
    if (assignedUsers.length > 0) {
      alert(`Cannot delete role "${role.name}" because it is assigned to ${assignedUsers.length} user(s). Please reassign them first.`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      setIsLoading(true);
      try {
        await onDeleteRole(roleId);
      } catch (error) {
        console.error('Error deleting role:', error);
        alert(error instanceof Error ? error.message : 'Failed to delete role');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Shield className="text-emerald-400" size={28} />
            Admin Control
          </h2>
          <p className="text-sm text-slate-400 mt-1">Manage admin users, roles, and permissions</p>
        </div>
        
        {activeTab === 'users' && onAddUser && (
          <button 
            onClick={() => handleOpenUserModal()}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition text-sm font-semibold shadow-lg shadow-emerald-900/30"
          >
            <UserPlus size={18} /> Add User
          </button>
        )}
        
        {activeTab === 'roles' && (
          <button 
            onClick={() => handleOpenRoleModal()}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition text-sm font-semibold shadow-lg shadow-emerald-900/30"
          >
            <Plus size={18} /> Create Role
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition ${
            activeTab === 'users' 
              ? 'border-emerald-400 text-emerald-400' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Users size={18} /> Admin Users
        </button>
        <button 
          onClick={() => setActiveTab('roles')}
          className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition ${
            activeTab === 'roles' 
              ? 'border-emerald-400 text-emerald-400' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Shield size={18} /> Roles & Permissions
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-gradient-to-br from-[#0f0f1a]/80 to-[#0a1410]/80 rounded-2xl border border-white/10 shadow-xl overflow-hidden">
          {/* Search */}
          <div className="p-6 border-b border-white/10 bg-white/5">
            <div className="relative w-full max-w-md">
              <input 
                type="text" 
                placeholder="Search users by name or email..." 
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-sm text-white placeholder-slate-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-3.5 text-slate-500" size={18} />
            </div>
          </div>
          
          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/5 text-slate-400 font-semibold uppercase tracking-wider text-xs border-b border-white/10">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Built-in Role</th>
                  <th className="px-6 py-4">Custom Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {adminUsers.map(user => {
                  const userId = user._id || user.id || user.email;
                  const customRole = roles.find(r => r && (r._id || r.id) === user.roleId);
                  
                  return (
                    <tr key={userId} className="hover:bg-white/5 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/30">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-white">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getRoleBadgeClass(user.role)}`}>
                          {formatRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 min-w-[150px]"
                          value={user.roleId || ''}
                          onChange={(e) => onUpdateUserRole(user.email, e.target.value)}
                        >
                          <option value="" className="bg-[#1a1a2e]">No Custom Role</option>
                          {roles
                            .filter(role => role && (role._id || role.id) && role.name && role.name.toLowerCase() !== 'no custom role')
                            .map(role => (
                              <option key={role._id || role.id} value={role._id || role.id} className="bg-[#1a1a2e]">
                                {role.name}
                              </option>
                            ))
                          }
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                          user.isActive !== false
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-red-500/20 text-red-300 border border-red-500/40'
                        }`}>
                          {user.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {onUpdateUser && (
                            <button 
                              onClick={() => handleOpenUserModal(user)}
                              className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-emerald-400 transition"
                              title="Edit user"
                            >
                              <Edit size={16} />
                            </button>
                          )}
                          {onDeleteUser && user.email !== currentUser?.email && (
                            <button 
                              onClick={() => handleDeleteUser(user)}
                              className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-red-400 transition"
                              title="Delete user"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {adminUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <Users size={40} className="mx-auto mb-3 opacity-30" />
                      <p>No admin users found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.filter(role => role && (role._id || role.id)).map(role => {
            const roleId = role._id || role.id;
            const assignedUsersCount = users.filter(u => u.roleId === roleId).length;
            const permissions = role.permissions || [];
            const permCount = permissions.reduce((acc, p) => acc + (p.actions?.length || 0), 0);
            
            return (
              <div 
                key={roleId} 
                className="bg-gradient-to-br from-[#0f0f1a]/80 to-[#0a1410]/80 rounded-2xl border border-white/10 p-6 hover:border-emerald-500/30 transition relative group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                      <KeyRound size={18} className="text-emerald-400" />
                      {role.name}
                    </h3>
                    {role.isSystem && (
                      <span className="text-xs text-amber-400 font-semibold">System Role</span>
                    )}
                  </div>
                  {!role.isSystem && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button 
                        onClick={() => handleOpenRoleModal(role)} 
                        className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-emerald-400 transition"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteRole(role)} 
                        className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-red-400 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
                
                <p className="text-slate-400 text-sm mb-4 min-h-[40px]">
                  {role.description || 'No description provided.'}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-slate-500 border-t border-white/10 pt-4">
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>{assignedUsersCount} users</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Lock size={14} />
                    <span>{permCount} permissions</span>
                  </div>
                </div>
                
                {/* Permission preview */}
                {permissions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Permissions</p>
                    <div className="flex flex-wrap gap-1.5">
                      {permissions.slice(0, 4).map((p, idx) => (
                        <span key={p.resource || idx} className="bg-white/5 text-slate-300 px-2 py-1 rounded text-xs border border-white/10">
                          {(p.resource || 'unknown').replace(/_/g, ' ')}
                        </span>
                      ))}
                      {permissions.length > 4 && (
                        <span className="bg-emerald-500/10 text-emerald-300 px-2 py-1 rounded text-xs border border-emerald-500/30">
                          +{permissions.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          {roles.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500">
              <Shield size={40} className="mx-auto mb-3 opacity-30" />
              <p>No roles created yet. Click "Create Role" to add one.</p>
            </div>
          )}
        </div>
      )}

      {/* User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-gradient-to-br from-[#0f0f1a] to-[#0a1410] rounded-2xl shadow-2xl w-full max-w-lg border border-white/10">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <UserPlus size={22} className="text-emerald-400" />
                {editingUser ? 'Edit User' : 'Create New User'}
              </h3>
              <button 
                onClick={() => setIsUserModalOpen(false)} 
                className="text-slate-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Full Name*</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 focus:outline-none text-white placeholder-slate-500"
                  value={userFormData.name}
                  onChange={e => setUserFormData({...userFormData, name: e.target.value})}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Email*</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-3.5 text-slate-500" />
                  <input 
                    type="email" 
                    required
                    disabled={!!editingUser}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 focus:outline-none text-white placeholder-slate-500 disabled:opacity-50"
                    value={userFormData.email}
                    onChange={e => setUserFormData({...userFormData, email: e.target.value})}
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {!editingUser && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Password*</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-3.5 text-slate-500" />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      required={!editingUser}
                      className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 focus:outline-none text-white placeholder-slate-500"
                      value={userFormData.password}
                      onChange={e => setUserFormData({...userFormData, password: e.target.value})}
                      placeholder="Min. 6 characters"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Phone</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-3.5 text-slate-500" />
                  <input 
                    type="tel" 
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 focus:outline-none text-white placeholder-slate-500"
                    value={userFormData.phone}
                    onChange={e => setUserFormData({...userFormData, phone: e.target.value})}
                    placeholder="+880 1XXX-XXXXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Built-in Role</label>
                  <select
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:outline-none text-white"
                    value={userFormData.role}
                    onChange={e => setUserFormData({...userFormData, role: e.target.value as User['role']})}
                  >
                    <option value="staff" className="bg-[#1a1a2e]">Staff</option>
                    <option value="admin" className="bg-[#1a1a2e]">Admin</option>
                    {currentUser?.role === 'super_admin' && (
                      <>
                        <option value="tenant_admin" className="bg-[#1a1a2e]">Tenant Admin</option>
                        <option value="super_admin" className="bg-[#1a1a2e]">Super Admin</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Custom Role</label>
                  <select
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:outline-none text-white"
                    value={userFormData.roleId}
                    onChange={e => setUserFormData({...userFormData, roleId: e.target.value})}
                  >
                    <option value="" className="bg-[#1a1a2e]">No Custom Role</option>
                    {roles
                      .filter(role => role && (role._id || role.id) && role.name && role.name.toLowerCase() !== 'no custom role')
                      .map(role => (
                        <option key={role._id || role.id} value={role._id || role.id} className="bg-[#1a1a2e]">
                          {role.name}
                        </option>
                      ))
                    }
                  </select>
                </div>
              </div>

              {editingUser && (
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={userFormData.isActive}
                    onChange={e => setUserFormData({...userFormData, isActive: e.target.checked})}
                    className="w-5 h-5 rounded border-white/30 bg-white/5 text-emerald-500 focus:ring-emerald-500/50"
                  />
                  <label htmlFor="isActive" className="text-sm text-slate-300">
                    User is active and can login
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button 
                  type="button" 
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-6 py-2.5 border border-white/20 rounded-xl text-slate-300 font-medium hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition shadow-lg shadow-emerald-900/30 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-gradient-to-br from-[#0f0f1a] to-[#0a1410] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-white/10">
            <div className="p-6 border-b border-white/10 flex justify-between items-center flex-shrink-0">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <KeyRound size={22} className="text-emerald-400" />
                {editingRole ? 'Edit Role' : 'Create New Role'}
              </h3>
              <button 
                onClick={() => setIsRoleModalOpen(false)} 
                className="text-slate-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form id="roleForm" onSubmit={handleSaveRole} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Role Name*</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 focus:outline-none text-white placeholder-slate-500"
                      value={roleFormData.name}
                      onChange={e => setRoleFormData({...roleFormData, name: e.target.value})}
                      placeholder="e.g. Order Manager"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Description</label>
                    <input 
                      type="text"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 focus:outline-none text-white placeholder-slate-500"
                      value={roleFormData.description}
                      onChange={e => setRoleFormData({...roleFormData, description: e.target.value})}
                      placeholder="Briefly describe this role..."
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-300">Permissions Matrix</label>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded">R</span> Read
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded">W</span> Write
                      <span className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded">E</span> Edit
                      <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded">D</span> Delete
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                    {Object.entries(resourcesByCategory).map(([category, resources]: [string, typeof RESOURCES]) => (
                      <div key={category} className="border-b border-white/10 last:border-b-0">
                        <div className="px-4 py-3 bg-white/5 border-b border-white/10">
                          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{category}</h4>
                        </div>
                        <div className="divide-y divide-white/5">
                          {resources.map(resource => {
                            const perm = roleFormData.permissions?.find(p => p.resource === resource.id);
                            const selectedCount = perm?.actions.length || 0;
                            
                            return (
                              <div key={resource.id} className="px-4 py-3 flex items-center justify-between hover:bg-white/5 transition">
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => handleSelectAllForResource(resource.id)}
                                    className={`w-6 h-6 rounded flex items-center justify-center border transition ${
                                      selectedCount === 4 
                                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                                        : selectedCount > 0 
                                          ? 'bg-emerald-500/30 border-emerald-500/50 text-emerald-400'
                                          : 'bg-white/5 border-white/20 text-slate-500'
                                    }`}
                                  >
                                    {selectedCount === 4 ? <Check size={14} /> : selectedCount > 0 ? <span className="text-xs">{selectedCount}</span> : null}
                                  </button>
                                  <span className="text-sm text-white">{resource.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {ACTIONS.map(action => (
                                    <button
                                      key={action}
                                      type="button"
                                      onClick={() => handleTogglePermission(resource.id, action)}
                                      className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                                        hasPermissionAction(resource.id, action)
                                          ? action === 'read' ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                                            : action === 'write' ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                                            : action === 'edit' ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                                            : 'bg-red-500/30 text-red-300 border border-red-500/50'
                                          : 'bg-white/5 text-slate-500 border border-white/10 hover:bg-white/10'
                                      }`}
                                    >
                                      {action.charAt(0).toUpperCase()}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3 flex-shrink-0">
              <button 
                type="button" 
                onClick={() => setIsRoleModalOpen(false)}
                className="px-6 py-2.5 border border-white/20 rounded-xl text-slate-300 font-medium hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="roleForm"
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition shadow-lg shadow-emerald-900/30 disabled:opacity-50"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {editingRole ? 'Update Role' : 'Create Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminControl;
