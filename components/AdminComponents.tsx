import React, { useState } from 'react';
import { 
  LayoutDashboard, ShoppingBag, Box, Settings, Sliders, FolderOpen, 
  FileText, Star, Users, Ticket, Image as ImageIcon, FilePlus, DollarSign,
  Shield, LifeBuoy, BookOpen, LogOut, Bell, Menu, X, Globe
} from 'lucide-react';
import { StatCardProps } from '../types';

export const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false); // Mobile state (not implemented fully for brevity)

  const menuItems = [
    { icon: <LayoutDashboard size={18} />, label: 'Dashboard', active: true },
    { icon: <ShoppingBag size={18} />, label: 'Orders' },
    { icon: <Box size={18} />, label: 'Products' },
    { icon: <Settings size={18} />, label: 'Settings' },
    { icon: <Sliders size={18} />, label: 'Customization' },
    { icon: <FolderOpen size={18} />, label: 'Catalog' },
    { icon: <FileText size={18} />, label: 'Landing page' },
    { icon: <Star size={18} />, label: 'Review' },
    { icon: <Users size={18} />, label: 'Customer' },
    { icon: <Ticket size={18} />, label: 'Coupon' },
    { icon: <ImageIcon size={18} />, label: 'Gallery' },
    { icon: <FilePlus size={18} />, label: 'Additional Pages' },
    { icon: <DollarSign size={18} />, label: 'Expense' },
    { icon: <Shield size={18} />, label: 'Admin Control' },
    { icon: <LifeBuoy size={18} />, label: 'Support' },
    { icon: <BookOpen size={18} />, label: 'Tutorials' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto hidden lg:flex flex-col sticky top-0 scrollbar-hide">
      <div className="p-6 border-b border-gray-100 flex items-center justify-center">
        <h2 className="text-2xl font-bold tracking-tighter">
          <span className="text-gray-800">GADGET</span>
          <span className="text-pink-500">SHOB</span>
        </h2>
      </div>
      
      <div className="p-4 space-y-1 flex-1">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3 mt-2">Main Menu</div>
        {menuItems.map((item, index) => (
          <div 
            key={index} 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 text-sm ${
              item.active 
                ? 'bg-purple-50 text-purple-600 font-bold shadow-sm' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </div>
        ))}
        
        <div className="mt-8 pt-4 border-t border-gray-100">
           <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-600 hover:text-red-500 hover:bg-red-50 transition text-sm">
             <LogOut size={18} />
             <span>Logout</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export const AdminHeader = ({ onSwitchView }: { onSwitchView: () => void }) => {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-4">
        <button className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded">
          <Menu size={20} />
        </button>
        <h2 className="text-xl font-bold text-gray-800 hidden md:block">Dashboard</h2>
        <button onClick={onSwitchView} className="hidden md:flex items-center gap-2 text-xs font-medium text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full border border-purple-100 hover:bg-purple-100 transition">
          <Globe size={14} />
          Go to Website
        </button>
      </div>

      <div className="flex items-center gap-6">
         <div className="bg-red-50 border border-red-100 text-red-500 text-xs font-bold px-3 py-1 rounded hidden md:block animate-pulse">
           Admin Mode
         </div>
         <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition">
               <Bell size={20} />
               <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center text-purple-700 font-bold text-sm cursor-pointer border-2 border-white shadow-sm">
               A
            </div>
         </div>
      </div>
    </header>
  );
};

export const DashboardStatCard = ({ title, value, icon, colorClass }: StatCardProps) => {
  const getColors = (color: string) => {
    switch(color) {
      case 'pink': return 'bg-pink-50 text-pink-600 border-pink-100 hover:border-pink-300';
      case 'purple': return 'bg-purple-50 text-purple-600 border-purple-100 hover:border-purple-300';
      case 'green': return 'bg-green-50 text-green-600 border-green-100 hover:border-green-300';
      case 'orange': return 'bg-orange-50 text-orange-600 border-orange-100 hover:border-orange-300';
      case 'blue': return 'bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-300';
      case 'red': return 'bg-red-50 text-red-600 border-red-100 hover:border-red-300';
      case 'cyan': return 'bg-cyan-50 text-cyan-600 border-cyan-100 hover:border-cyan-300';
      case 'teal': return 'bg-teal-50 text-teal-600 border-teal-100 hover:border-teal-300';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const styleClass = getColors(colorClass);

  return (
    <div className={`p-4 rounded-xl border ${styleClass} transition-all duration-300 hover:shadow-lg flex flex-col justify-between h-32 relative overflow-hidden group`}>
      <div className="z-10 relative">
        <p className="text-xs font-semibold opacity-70 mb-1 uppercase tracking-wide">{title}</p>
        <h3 className="text-2xl font-extrabold">{value}</h3>
      </div>
      <div className="z-10 relative">
          <div className="flex items-center gap-1 text-[10px] font-bold opacity-70 cursor-pointer hover:opacity-100 transition-opacity">
             VIEW ALL &rarr;
          </div>
      </div>
      
      {/* Decorative Icon Background */}
      <div className="absolute -bottom-4 -right-4 opacity-10 transform scale-[2.5] rotate-12 group-hover:scale-[3] group-hover:rotate-6 transition-transform duration-500">
        {icon}
      </div>
    </div>
  );
};