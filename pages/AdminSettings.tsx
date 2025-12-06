
import React, { useEffect, useRef, useState } from 'react';
import { 
  Truck, Lock, CheckCircle, AlertCircle, MessageCircle, 
  CreditCard, Facebook, Globe, ShoppingBag, Settings, Search, 
  BarChart, DollarSign, FileText, ArrowRight, UploadCloud, 
  Camera, Shield, Clock3, UserCircle, Phone, Mail, MapPin, Loader2, AtSign 
} from 'lucide-react';
import { CourierConfig, User } from '../types';
import { convertFileToWebP } from '../services/imageUtils';

interface AdminSettingsProps {
  courierConfig: CourierConfig;
  onUpdateCourierConfig: (config: CourierConfig) => void;
  onNavigate: (page: string) => void;
  user?: User | null;
  onUpdateProfile?: (updatedUser: User) => void;
}

const SettingsCard: React.FC<{ 
  title: string; 
  icon: React.ReactNode; 
  colorClass: string; 
  onClick?: () => void 
}> = ({ title, icon, colorClass, onClick }) => (
  <div 
    onClick={onClick}
    className={`p-6 rounded-xl border transition-all duration-300 hover:shadow-lg cursor-pointer group flex items-center gap-4 ${colorClass}`}
  >
    <div className="p-3 rounded-full bg-white/80 shadow-sm group-hover:scale-110 transition">
      {icon}
    </div>
    <div className="flex-1">
      <h3 className="font-bold text-gray-800 group-hover:text-black">{title}</h3>
      <div className="flex items-center gap-1 text-xs font-medium opacity-60 mt-1">
        Manage <ArrowRight size={12} />
      </div>
    </div>
  </div>
);

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=400&q=80';

const AdminSettings: React.FC<AdminSettingsProps> = ({ onNavigate, user, onUpdateProfile }) => {
  const getProfileSnapshot = (target?: User | null) => ({
    name: target?.name || 'Unnamed Admin',
    username: target?.username || '',
    email: target?.email || '',
    phone: target?.phone || '',
    role: target?.role || 'admin',
    address: target?.address || ''
  });

  const formatRoleLabel = (role?: User['role']) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'tenant_admin':
        return 'Tenant Admin';
      case 'admin':
        return 'Admin';
      case 'customer':
        return 'Customer';
      default:
        return 'Admin';
    }
  };

  const [profileForm, setProfileForm] = useState(getProfileSnapshot(user));
  const [avatarPreview, setAvatarPreview] = useState<string>(user?.image || DEFAULT_AVATAR);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [statusBanner, setStatusBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [passwordBanner, setPasswordBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setProfileForm(getProfileSnapshot(user));
    setAvatarPreview(user?.image || DEFAULT_AVATAR);
  }, [user]);

  const formatDate = (value?: string) => {
    if (!value) return 'Not recorded';
    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  const handleResetForm = () => {
    setProfileForm(getProfileSnapshot(user));
    setAvatarPreview(user?.image || DEFAULT_AVATAR);
    setStatusBanner(null);
  };

  const handleProfileSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !onUpdateProfile) {
      setStatusBanner({ type: 'error', message: 'You need an active admin session to update the profile.' });
      return;
    }
    setIsSaving(true);
    const payload: User = {
      ...user,
      ...profileForm,
      image: avatarPreview,
      updatedAt: new Date().toISOString()
    };
    onUpdateProfile(payload);
    setStatusBanner({ type: 'success', message: 'Profile updated successfully.' });
    setTimeout(() => setStatusBanner(null), 4000);
    setIsSaving(false);
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarLoading(true);
    try {
      const optimized = await convertFileToWebP(file, { quality: 0.82, maxDimension: 600 });
      setAvatarPreview(optimized);
      setStatusBanner({ type: 'success', message: 'Photo ready. Do not forget to save changes.' });
    } catch (error) {
      console.error('Avatar upload failed', error);
      setStatusBanner({ type: 'error', message: 'Failed to process the selected image.' });
    } finally {
      setAvatarLoading(false);
      event.target.value = '';
    }
  };

  const handlePasswordSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !onUpdateProfile) {
      setPasswordBanner({ type: 'error', message: 'No admin session detected. Please log in again.' });
      return;
    }
    if (passwordForm.next.length < 6) {
      setPasswordBanner({ type: 'error', message: 'Use at least 6 characters for the new password.' });
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordBanner({ type: 'error', message: 'New password and confirmation must match.' });
      return;
    }
    const payload: User = {
      ...user,
      password: passwordForm.next,
      updatedAt: new Date().toISOString()
    };
    onUpdateProfile(payload);
    setPasswordBanner({ type: 'success', message: 'Password updated successfully.' });
    setPasswordForm({ current: '', next: '', confirm: '' });
    setTimeout(() => {
      setPasswordBanner(null);
      setIsPasswordModalOpen(false);
    }, 1200);
  };

  const profileName = profileForm.name || 'Admin';
  const usernameLabel = profileForm.username ? `@${profileForm.username}` : 'username not set';

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-800">Admin Preferences</h2>
        <p className="text-sm text-gray-500">Update your profile and manage every store-level control in a single view.</p>
      </div>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white rounded-2xl p-6 relative overflow-hidden border border-purple-500/30 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="relative">
              <img src={avatarPreview} alt="Admin avatar" className="w-28 h-28 rounded-2xl object-cover border-4 border-white/40 shadow-2xl" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 bg-white text-purple-600 rounded-full p-2 shadow-md hover:scale-105 transition"
                aria-label="Change profile photo"
              >
                {avatarLoading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.3em] text-white/70 mb-1">{formatRoleLabel(profileForm.role)}</p>
              <h3 className="text-2xl font-bold leading-tight">{profileName}</h3>
              <p className="text-white/80 text-sm">{profileForm.email || 'No email on file'}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="bg-white/15 px-3 py-1 rounded-full inline-flex items-center gap-1">
                  <Shield size={14} /> {user?.roleId ? 'Custom Role' : 'Full Access'}
                </span>
                <span className="bg-white/15 px-3 py-1 rounded-full inline-flex items-center gap-1">
                  <Clock3 size={14} /> {formatDate(user?.updatedAt || user?.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-white/60">Username</p>
              <p className="font-semibold">{usernameLabel}</p>
            </div>
            <div>
              <p className="text-white/60">Primary contact</p>
              <p className="font-semibold">{profileForm.phone || 'Not added'}</p>
            </div>
            <div>
              <p className="text-white/60">Role</p>
              <p className="font-semibold">{user?.roleId || formatRoleLabel(user?.role)}</p>
            </div>
            <div>
              <p className="text-white/60">Joined</p>
              <p className="font-semibold">{formatDate(user?.createdAt)}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 text-sm font-semibold">
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(true)}
              className="flex items-center justify-between bg-white/15 rounded-xl px-4 py-3 hover:bg-white/20 transition"
            >
              <span className="flex items-center gap-2"><Lock size={16} /> Change password</span>
              <ArrowRight size={14} />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-between bg-white/15 rounded-xl px-4 py-3 hover:bg-white/20 transition"
            >
              <span className="flex items-center gap-2"><UploadCloud size={16} /> Upload new photo</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <div className="xl:col-span-2 space-y-6">
          <form onSubmit={handleProfileSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Profile details</h3>
                <p className="text-sm text-gray-500">Information used across the admin dashboard and outgoing assets.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-700"
              >
                <Lock size={16} /> Update password
              </button>
            </div>

            {statusBanner && (
              <div className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium ${statusBanner.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                {statusBanner.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                <span>{statusBanner.message}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Full name</label>
                <div className="relative">
                  <UserCircle size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 text-sm"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Username</label>
                <div className="relative">
                  <AtSign size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 text-sm"
                    value={profileForm.username}
                    onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value.replace(/\s+/g, '').toLowerCase() })}
                    placeholder="team.gadget"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="email"
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 text-sm"
                    value={profileForm.email}
                    readOnly
                    title="Primary email cannot be changed from this panel"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="tel"
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 text-sm"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="e.g. +880 1790-000000"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</label>
                <div className="relative">
                  <Shield size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 text-sm"
                    value={formatRoleLabel(profileForm.role)}
                    readOnly
                  />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Office address</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                  <textarea
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 text-sm h-24 resize-none"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    placeholder="House / Street, City, Postal Code"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={handleResetForm}
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 font-medium hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 shadow-lg shadow-purple-200 flex items-center gap-2"
                disabled={isSaving}
              >
                {isSaving ? (<><Loader2 size={16} className="animate-spin" /> Saving...</>) : 'Save changes'}
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <div>
                <h4 className="text-base font-bold text-gray-800">Contact channels</h4>
                <p className="text-sm text-gray-500">Keep these up-to-date so the team can reach you quickly.</p>
              </div>
              <div className="space-y-4 text-sm font-medium text-gray-700">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-purple-50 text-purple-600 rounded-xl"><Mail size={16} /></span>
                  <div>
                    <p className="text-xs uppercase text-gray-400">Email</p>
                    <p>{profileForm.email || 'not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Phone size={16} /></span>
                  <div>
                    <p className="text-xs uppercase text-gray-400">Phone</p>
                    <p>{profileForm.phone || 'not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-green-50 text-green-600 rounded-xl"><MapPin size={16} /></span>
                  <div>
                    <p className="text-xs uppercase text-gray-400">Address</p>
                    <p className="line-clamp-2">{profileForm.address || 'Add a mailing address for invoices'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <div>
                <h4 className="text-base font-bold text-gray-800">Account security</h4>
                <p className="text-sm text-gray-500">Monitor login activity and protect sensitive data.</p>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Last updated</span>
                  <span className="font-semibold">{formatDate(user?.updatedAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Role access</span>
                  <span className="font-semibold">{user?.roleId ? 'Custom permissions' : 'All modules'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Two-factor auth</span>
                  <span className="font-semibold text-orange-600">Coming soon</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="w-full mt-2 px-4 py-2.5 rounded-lg border border-purple-200 text-purple-600 font-semibold hover:bg-purple-50"
              >
                Secure account
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800">System settings</h3>
            <p className="text-sm text-gray-500">Configure global controls for your storefront.</p>
          </div>
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search setting..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SettingsCard 
            title="Delivery Charge" 
            icon={<Truck size={24} className="text-blue-600"/>} 
            colorClass="bg-blue-50 border-blue-100 hover:border-blue-300"
            onClick={() => onNavigate('settings_delivery')}
          />
          <SettingsCard 
            title="Payment Methods" 
            icon={<CreditCard size={24} className="text-green-600"/>} 
            colorClass="bg-green-50 border-green-100 hover:border-green-300"
          />
          <SettingsCard 
            title="SMS" 
            icon={<MessageCircle size={24} className="text-orange-600"/>} 
            colorClass="bg-orange-50 border-orange-100 hover:border-orange-300"
          />
          <SettingsCard 
            title="Courier API" 
            icon={<Settings size={24} className="text-purple-600"/>} 
            colorClass="bg-purple-50 border-purple-100 hover:border-purple-300"
            onClick={() => onNavigate('settings_courier')}
          />
          <SettingsCard 
            title="Social Login" 
            icon={<Globe size={24} className="text-red-600"/>} 
            colorClass="bg-red-50 border-red-100 hover:border-red-300"
          />
          <SettingsCard 
            title="Facebook Pixel" 
            icon={<Facebook size={24} className="text-blue-700"/>} 
            colorClass="bg-blue-50 border-blue-100 hover:border-blue-300"
            onClick={() => onNavigate('settings_facebook_pixel')}
          />
          <SettingsCard 
            title="Analytics" 
            icon={<BarChart size={24} className="text-indigo-600"/>} 
            colorClass="bg-indigo-50 border-indigo-100 hover:border-indigo-300"
          />
          <SettingsCard 
            title="Facebook Catalog" 
            icon={<ShoppingBag size={24} className="text-blue-600"/>} 
            colorClass="bg-blue-50 border-blue-100 hover:border-blue-300"
          />
          <SettingsCard 
            title="Chat Manage" 
            icon={<MessageCircle size={24} className="text-cyan-600"/>} 
            colorClass="bg-cyan-50 border-cyan-100 hover:border-cyan-300"
          />
          <SettingsCard 
            title="Shop Currency" 
            icon={<DollarSign size={24} className="text-yellow-600"/>} 
            colorClass="bg-yellow-50 border-yellow-100 hover:border-yellow-300"
          />
          <SettingsCard 
            title="Order Setting" 
            icon={<FileText size={24} className="text-teal-600"/>} 
            colorClass="bg-teal-50 border-teal-100 hover:border-teal-300"
          />
          <SettingsCard 
            title="Product Setting" 
            icon={<Settings size={24} className="text-green-700"/>} 
            colorClass="bg-green-50 border-green-100 hover:border-green-300"
          />
          <SettingsCard 
            title="Search Console" 
            icon={<Search size={24} className="text-blue-500"/>} 
            colorClass="bg-blue-50 border-blue-100 hover:border-blue-300"
          />
        </div>
      </section>

      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold text-gray-800">Change password</h4>
                <p className="text-sm text-gray-500">Use a strong password with a mix of letters, numbers, and symbols.</p>
              </div>
              <button onClick={() => setIsPasswordModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold" aria-label="Close password modal">×</button>
            </div>
            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              {passwordBanner && (
                <div className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium ${passwordBanner.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                  {passwordBanner.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                  <span>{passwordBanner.message}</span>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Current password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 text-sm"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">New password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 text-sm"
                  value={passwordForm.next}
                  onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })}
                  placeholder="At least 6 characters"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Confirm password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 text-sm"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  placeholder="Repeat new password"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 shadow-lg shadow-purple-200">Save password</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
