
import React from 'react';
import { 
  Truck, Key, Lock, CheckCircle, AlertCircle, MessageCircle, 
  CreditCard, Facebook, Globe, ShoppingBag, Settings, Search, 
  BarChart, Smartphone, DollarSign, FileText, ArrowRight 
} from 'lucide-react';
import { CourierConfig } from '../types';

interface AdminSettingsProps {
  courierConfig: CourierConfig;
  onUpdateCourierConfig: (config: CourierConfig) => void;
  onNavigate: (page: string) => void;
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

const AdminSettings: React.FC<AdminSettingsProps> = ({ courierConfig, onNavigate }) => {
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">System Settings</h2>
          <p className="text-sm text-gray-500">Configure global settings for your store</p>
        </div>
        
        <div className="relative">
           <input 
             type="text" 
             placeholder="Search setting..." 
             className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white"
           />
           <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Delivery Settings - Navigates to new page */}
        <SettingsCard 
          title="Delivery Charge" 
          icon={<Truck size={24} className="text-blue-600"/>} 
          colorClass="bg-blue-50 border-blue-100 hover:border-blue-300"
          onClick={() => onNavigate('settings_delivery')}
        />

        {/* Payment Methods */}
        <SettingsCard 
          title="Payment Methods" 
          icon={<CreditCard size={24} className="text-green-600"/>} 
          colorClass="bg-green-50 border-green-100 hover:border-green-300"
        />

        {/* SMS Settings */}
        <SettingsCard 
          title="SMS" 
          icon={<MessageCircle size={24} className="text-orange-600"/>} 
          colorClass="bg-orange-50 border-orange-100 hover:border-orange-300"
        />

        {/* Courier Settings - Opens existing courier config */}
        <SettingsCard 
          title="Courier API" 
          icon={<Settings size={24} className="text-purple-600"/>} 
          colorClass="bg-purple-50 border-purple-100 hover:border-purple-300"
          onClick={() => onNavigate('settings_courier')}
        />

        {/* Social Login */}
        <SettingsCard 
          title="Social Login" 
          icon={<Globe size={24} className="text-red-600"/>} 
          colorClass="bg-red-50 border-red-100 hover:border-red-300"
        />

        {/* Facebook Pixel */}
        <SettingsCard 
          title="Facebook Pixel" 
          icon={<Facebook size={24} className="text-blue-700"/>} 
          colorClass="bg-blue-50 border-blue-100 hover:border-blue-300"
          onClick={() => onNavigate('settings_facebook_pixel')}
        />

        {/* Analytics */}
        <SettingsCard 
          title="Analytics" 
          icon={<BarChart size={24} className="text-indigo-600"/>} 
          colorClass="bg-indigo-50 border-indigo-100 hover:border-indigo-300"
        />

        {/* Facebook Catalog */}
        <SettingsCard 
          title="Facebook Catalog" 
          icon={<ShoppingBag size={24} className="text-blue-600"/>} 
          colorClass="bg-blue-50 border-blue-100 hover:border-blue-300"
        />

        {/* Chat Manage */}
        <SettingsCard 
          title="Chat Manage" 
          icon={<MessageCircle size={24} className="text-cyan-600"/>} 
          colorClass="bg-cyan-50 border-cyan-100 hover:border-cyan-300"
        />

        {/* Currency */}
        <SettingsCard 
          title="Shop Currency" 
          icon={<DollarSign size={24} className="text-yellow-600"/>} 
          colorClass="bg-yellow-50 border-yellow-100 hover:border-yellow-300"
        />

        {/* Order Setting */}
        <SettingsCard 
          title="Order Setting" 
          icon={<FileText size={24} className="text-teal-600"/>} 
          colorClass="bg-teal-50 border-teal-100 hover:border-teal-300"
        />

        {/* Product Setting */}
        <SettingsCard 
          title="Product Setting" 
          icon={<Settings size={24} className="text-green-700"/>} 
          colorClass="bg-green-50 border-green-100 hover:border-green-300"
        />

        {/* Google Search Console */}
        <SettingsCard 
          title="Search Console" 
          icon={<Search size={24} className="text-blue-500"/>} 
          colorClass="bg-blue-50 border-blue-100 hover:border-blue-300"
        />

      </div>
    </div>
  );
};

export default AdminSettings;
