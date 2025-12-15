
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

const DEFAULT_AVATAR = 'data:image/webp;base64,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';

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
          {/* <SettingsCard 
            title="Payment Methods" 
            icon={<CreditCard size={24} className="text-green-600"/>} 
            colorClass="bg-green-50 border-green-100 hover:border-green-300"
          /> */}
          {/* <SettingsCard 
            title="SMS" 
            icon={<MessageCircle size={24} className="text-orange-600"/>} 
            colorClass="bg-orange-50 border-orange-100 hover:border-orange-300"
          /> */}
          <SettingsCard 
            title="Courier API" 
            icon={<Settings size={24} className="text-purple-600"/>} 
            colorClass="bg-purple-50 border-purple-100 hover:border-purple-300"
            onClick={() => onNavigate('settings_courier')}
          />
          {/* <SettingsCard 
            title="Social Login" 
            icon={<Globe size={24} className="text-red-600"/>} 
            colorClass="bg-red-50 border-red-100 hover:border-red-300"
          /> */}
          <SettingsCard 
            title="Facebook Pixel" 
            icon={<Facebook size={24} className="text-blue-700"/>} 
            colorClass="bg-blue-50 border-blue-100 hover:border-blue-300"
            onClick={() => onNavigate('settings_facebook_pixel')}
          />
          {/* <SettingsCard 
            title="Analytics" 
            icon={<BarChart size={24} className="text-indigo-600"/>} 
            colorClass="bg-indigo-50 border-indigo-100 hover:border-indigo-300"
          /> */}
          {/* <SettingsCard 
            title="Facebook Catalog" 
            icon={<ShoppingBag size={24} className="text-blue-600"/>} 
            colorClass="bg-blue-50 border-blue-100 hover:border-blue-300"
          /> */}
          {/* <SettingsCard 
            title="Chat Manage" 
            icon={<MessageCircle size={24} className="text-cyan-600"/>} 
            colorClass="bg-cyan-50 border-cyan-100 hover:border-cyan-300"
          /> */}
          {/* <SettingsCard 
            title="Shop Currency" 
            icon={<DollarSign size={24} className="text-yellow-600"/>} 
            colorClass="bg-yellow-50 border-yellow-100 hover:border-yellow-300"
          /> */}
          {/* <SettingsCard 
            title="Order Setting" 
            icon={<FileText size={24} className="text-teal-600"/>} 
            colorClass="bg-teal-50 border-teal-100 hover:border-teal-300"
          /> */}
          {/* <SettingsCard 
            title="Product Setting" 
            icon={<Settings size={24} className="text-green-700"/>} 
            colorClass="bg-green-50 border-green-100 hover:border-green-300"
          /> */}
          {/* <SettingsCard 
            title="Search Console" 
            icon={<Search size={24} className="text-blue-500"/>} 
            colorClass="bg-blue-50 border-blue-100 hover:border-blue-300"
          /> */}
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
