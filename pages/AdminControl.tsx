
import React, { useState } from 'react';
import { User, Role } from '../types';
import { AVAILABLE_PERMISSIONS } from '../constants';
import { Shield, Users, Lock, Edit, Trash2, Plus, Check, X, Search } from 'lucide-react';

interface AdminControlProps {
  users: User[];
  roles: Role[];
  onAddRole: (role: Role) => void;
  onUpdateRole: (role: Role) => void;
  onDeleteRole: (roleId: string) => void;
  onUpdateUserRole: (userEmail: string, roleId: string) => void;
}

const AdminControl: React.FC<AdminControlProps> = ({
  users,
  roles,
  onAddRole,
  onUpdateRole,
  onDeleteRole,
  onUpdateUserRole
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Role Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleFormData, setRoleFormData] = useState<Partial<Role>>({
    name: '',
    description: '',
    permissions: []
  });

  // Filter Admin Users
  const formatAdminRole = (role?: User['role']) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'tenant_admin':
        return 'Tenant Admin';
      case 'admin':
        return 'Admin';
      default:
        return 'Staff';
    }
  };

  const adminUsers = users.filter(u => u.role && u.role !== 'customer' && 
    (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenModal = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setRoleFormData(role);
    } else {
      setEditingRole(null);
      setRoleFormData({
        name: '',
        description: '',
        permissions: []
      });
    }
    setIsModalOpen(true);
  };

  const handleTogglePermission = (permissionId: string) => {
    const currentperms = roleFormData.permissions || [];
    if (currentperms.includes(permissionId)) {
      setRoleFormData({
        ...roleFormData,
        permissions: currentperms.filter(p => p !== permissionId)
      });
    } else {
      setRoleFormData({
        ...roleFormData,
        permissions: [...currentperms, permissionId]
      });
    }
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleFormData.name) {
      alert("Role Name is required");
      return;
    }

    const newRole: Role = {
      id: editingRole ? editingRole.id : Date.now().toString(),
      name: roleFormData.name,
      description: roleFormData.description || '',
      permissions: roleFormData.permissions || []
    };

    if (editingRole) {
      onUpdateRole(newRole);
    } else {
      onAddRole(newRole);
    }
    setIsModalOpen(false);
  };

  const handleDeleteClick = (role: Role) => {
    // Check if any user is assigned this role
    const assignedUsers = users.filter(u => u.roleId === role.id);
    if (assignedUsers.length > 0) {
      alert(`Cannot delete role "${role.name}" because it is assigned to ${assignedUsers.length} user(s). Please reassign them first.`);
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      onDeleteRole(role.id);
    }
  };

  // Group permissions by category for the modal
  const permissionsByCategory = AVAILABLE_PERMISSIONS.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_PERMISSIONS>);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Admin Control</h2>
        <p className="text-sm text-gray-500">Manage admin users and role-based permissions</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
         <button 
           onClick={() => setActiveTab('users')}
           className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition ${activeTab === 'users' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
         >
           <Users size={18} /> Admin Users
         </button>
         <button 
           onClick={() => setActiveTab('roles')}
           className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition ${activeTab === 'roles' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
         >
           <Shield size={18} /> Roles & Permissions
         </button>
      </div>

      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
           <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="relative w-full max-w-md">
                 <input 
                   type="text" 
                   placeholder="Search users..." 
                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                 />
                 <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              </div>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
               <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider text-xs border-b border-gray-200">
                 <tr>
                   <th className="px-6 py-4">User</th>
                   <th className="px-6 py-4">Email</th>
                   <th className="px-6 py-4">Current Role</th>
                   <th className="px-6 py-4 text-right">Assign Role</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {adminUsers.map(user => (
                   <tr key={user.email} className="hover:bg-gray-50 transition">
                     <td className="px-6 py-4 font-bold text-gray-800">{user.name}</td>
                     <td className="px-6 py-4 text-gray-600">{user.email}</td>
                     <td className="px-6 py-4">
                       {user.roleId ? (
                         <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">
                           {roles.find(r => r.id === user.roleId)?.name || 'Unknown Role'}
                         </span>
                       ) : (
                         <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                           {formatAdminRole(user.role)}
                         </span>
                       )}
                     </td>
                     <td className="px-6 py-4 text-right">
                       <select 
                         className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                         value={user.roleId || ''}
                         onChange={(e) => onUpdateUserRole(user.email, e.target.value)}
                       >
                         <option value="">Full Access (Built-in)</option>
                         {roles.map(role => (
                           <option key={role.id} value={role.id}>{role.name}</option>
                         ))}
                       </select>
                     </td>
                   </tr>
                 ))}
                 {adminUsers.length === 0 && (
                   <tr>
                     <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                       No admin users found.
                     </td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>
      )}

      {activeTab === 'roles' && (
        <>
          <div className="flex justify-end mb-4">
             <button 
               onClick={() => handleOpenModal()}
               className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium shadow-md"
             >
               <Plus size={16} /> Create New Role
             </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {roles.map(role => (
               <div key={role.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition relative group">
                  <div className="flex justify-between items-start mb-3">
                     <h3 className="font-bold text-lg text-gray-800">{role.name}</h3>
                     <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => handleOpenModal(role)} className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-purple-600">
                           <Edit size={16} />
                        </button>
                        <button onClick={() => handleDeleteClick(role)} className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-red-600">
                           <Trash2 size={16} />
                        </button>
                     </div>
                  </div>
                  <p className="text-gray-500 text-sm mb-4 min-h-[40px]">{role.description || "No description provided."}</p>
                  
                  <div className="border-t border-gray-100 pt-3">
                     <p className="text-xs font-bold text-gray-400 uppercase mb-2">Permissions</p>
                     <div className="flex flex-wrap gap-2">
                        {role.permissions.slice(0, 3).map(p => {
                           const perm = AVAILABLE_PERMISSIONS.find(ap => ap.id === p);
                           return (
                             <span key={p} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                               {perm?.label || p}
                             </span>
                           );
                        })}
                        {role.permissions.length > 3 && (
                           <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs font-bold">
                             +{role.permissions.length - 3} more
                           </span>
                        )}
                        {role.permissions.length === 0 && <span className="text-xs text-gray-400 italic">No permissions assigned</span>}
                     </div>
                  </div>
               </div>
             ))}
          </div>
        </>
      )}

      {/* Role Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                 <h3 className="text-xl font-bold text-gray-800">
                   {editingRole ? 'Edit Role' : 'Create New Role'}
                 </h3>
                 <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                   <X size={24} />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                 <form id="roleForm" onSubmit={handleSaveRole} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-sm font-medium text-gray-700">Role Name*</label>
                       <input 
                         type="text" 
                         required
                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                         value={roleFormData.name}
                         onChange={e => setRoleFormData({...roleFormData, name: e.target.value})}
                         placeholder="e.g. Order Manager"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-medium text-gray-700">Description</label>
                       <textarea 
                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                         rows={2}
                         value={roleFormData.description}
                         onChange={e => setRoleFormData({...roleFormData, description: e.target.value})}
                         placeholder="Briefly describe what this role is for..."
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-sm font-medium text-gray-700">Permissions</label>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                          {Object.entries(permissionsByCategory).map(([category, perms]) => (
                             <div key={category}>
                                <h4 className="font-bold text-gray-800 text-xs uppercase mb-2 border-b border-gray-200 pb-1">{category}</h4>
                                <div className="space-y-2">
                                   {perms.map(perm => (
                                     <label key={perm.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded transition">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition ${roleFormData.permissions?.includes(perm.id) ? 'bg-purple-600 border-purple-600' : 'bg-white border-gray-300'}`}>
                                           <input 
                                             type="checkbox" 
                                             className="hidden" 
                                             checked={roleFormData.permissions?.includes(perm.id)}
                                             onChange={() => handleTogglePermission(perm.id)}
                                           />
                                           {roleFormData.permissions?.includes(perm.id) && <Check size={14} className="text-white" />}
                                        </div>
                                        <span className="text-sm text-gray-700">{perm.label}</span>
                                     </label>
                                   ))}
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 </form>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                 <button 
                   type="button" 
                   onClick={() => setIsModalOpen(false)}
                   className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-white transition"
                 >
                   Cancel
                 </button>
                 <button 
                   type="submit" 
                   form="roleForm"
                   className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg transition text-sm font-medium shadow-lg"
                 >
                   <Check size={18} /> Save Role
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminControl;
