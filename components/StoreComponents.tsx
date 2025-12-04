import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Search, User, Facebook, Instagram, Twitter, Truck, X, CheckCircle, Sparkles, Upload, Wand2, Image as ImageIcon, Loader2, ArrowRight, Heart, LogOut, ChevronDown, UserCircle, Phone, Mail, MapPin, Youtube, ShoppingBag, Globe, Star, Eye, Bell, Gift, Users, ChevronLeft, ChevronRight, MessageCircle, Home, Grid, MessageSquare, List, Menu, Smartphone } from 'lucide-react';
import { Product, User as UserType, WebsiteConfig, CarouselItem, Order } from '../types';
import { GoogleGenAI } from "@google/genai";

interface StoreHeaderProps { 
  onTrackOrder?: () => void;
  onOpenAIStudio?: () => void;
  onHomeClick?: () => void;
  wishlistCount?: number;
  user?: UserType | null;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  onProfileClick?: () => void;
  logo?: string | null;
  websiteConfig?: WebsiteConfig;
}

export const MobileBottomNav: React.FC<{
  onHomeClick: () => void;
  onCartClick: () => void;
  onAccountClick: () => void;
  cartCount?: number;
  websiteConfig?: WebsiteConfig;
  activeTab?: string;
}> = ({ onHomeClick, onCartClick, onAccountClick, cartCount, websiteConfig, activeTab = 'home' }) => {
  
  const style = websiteConfig?.bottomNavStyle || 'style1';

  // Style 2: Floating Center Home Button (Light Pink Circle with Dark Pink Icon)
  if (style === 'style2') {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 h-[70px] flex items-end px-2 md:hidden z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-1">
        
        {/* Left Side */}
        <div className="flex-1 flex justify-around items-center h-full pb-2 pr-10">
           <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-pink-600 transition group">
              <MessageSquare size={20} strokeWidth={1.5} />
              <span className="text-[10px] font-medium">Chat</span>
           </button>
           <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-pink-600 transition group">
              <List size={22} strokeWidth={1.5} />
              <span className="text-[10px] font-medium">Categories</span>
           </button>
        </div>

        {/* Floating Home Button */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
           <button 
             onClick={onHomeClick}
             className="w-16 h-16 rounded-full bg-pink-100 text-pink-600 flex flex-col items-center justify-center border-[4px] border-white shadow-lg transform active:scale-95 transition-transform"
           >
              <Home size={24} strokeWidth={2.5} className="mb-0.5" />
              <span className="text-[10px] font-bold">Home</span>
           </button>
        </div>

        {/* Right Side */}
        <div className="flex-1 flex justify-around items-center h-full pb-2 pl-10">
           <button onClick={onAccountClick} className={`flex flex-col items-center gap-1 transition group ${activeTab === 'account' ? 'text-pink-600' : 'text-gray-500 hover:text-pink-600'}`}>
              <User size={22} strokeWidth={1.5} />
              <span className="text-[10px] font-medium">Account</span>
           </button>
           <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-pink-600 transition group">
              <Menu size={22} strokeWidth={1.5} />
              <span className="text-[10px] font-medium">Menu</span>
           </button>
        </div>
      </div>
    );
  }

  // Style 3: Clean 4 Columns
  if (style === 'style3') {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2.5 px-6 grid grid-cols-4 items-center md:hidden z-50 shadow-lg pb-safe">
        <button onClick={onHomeClick} className={`flex flex-col items-center gap-1 transition ${activeTab === 'home' ? 'text-pink-600' : 'text-gray-500'}`}>
          <Home size={22} strokeWidth={2} className={activeTab === 'home' ? 'fill-pink-100' : ''} />
          <span className="text-[10px] font-medium">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-pink-600 transition">
          <List size={22} strokeWidth={1.5} />
          <span className="text-[10px] font-medium">Categories</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-pink-600 transition">
          <MessageSquare size={22} strokeWidth={1.5} />
          <span className="text-[10px] font-medium">Chat</span>
        </button>
        <button onClick={onAccountClick} className={`flex flex-col items-center gap-1 transition ${activeTab === 'account' ? 'text-pink-600' : 'text-gray-500'}`}>
          <User size={22} strokeWidth={1.5} />
          <span className="text-[10px] font-medium">Account</span>
        </button>
      </div>
    );
  }

  // Style 1 (Default): 5 Columns (Messenger, Call, Home, Page, Account)
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-1 px-2 flex justify-between items-center md:hidden z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-safe h-[60px]">
      <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-pink-600 transition w-1/5 group">
        <div className="relative">
           {/* Custom Messenger Icon SVG */}
           <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 group-hover:text-pink-600"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/></svg>
        </div>
        <span className="text-[10px] font-medium text-gray-500 group-hover:text-pink-600">Messenger</span>
      </button>
      
      <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-pink-600 transition w-1/5 group">
        <Phone size={22} strokeWidth={2} className="text-gray-500 group-hover:text-pink-600" />
        <span className="text-[10px] font-medium text-gray-500 group-hover:text-pink-600">Call</span>
      </button>
      
      <button onClick={onHomeClick} className="flex flex-col items-center gap-1 text-pink-600 transition w-1/5">
        <Home size={26} strokeWidth={2.5} className="fill-pink-600 text-pink-600" />
        <span className="text-[10px] font-bold text-pink-600">Home</span>
      </button>
      
      <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-pink-600 transition w-1/5 group">
        <Facebook size={22} strokeWidth={2} className="text-gray-500 group-hover:text-pink-600" />
        <span className="text-[10px] font-medium text-gray-500 group-hover:text-pink-600">Page</span>
      </button>
      
      <button onClick={onAccountClick} className="flex flex-col items-center gap-1 text-gray-500 hover:text-pink-600 transition w-1/5 group">
        <User size={22} strokeWidth={2} className="text-gray-500 group-hover:text-pink-600" />
        <span className="text-[10px] font-medium text-gray-500 group-hover:text-pink-600">Account</span>
      </button>
    </div>
  );
};

export const StoreHeader: React.FC<StoreHeaderProps> = ({ 
  onTrackOrder, 
  onOpenAIStudio, 
  onHomeClick, 
  wishlistCount, 
  user, 
  onLoginClick, 
  onLogoutClick, 
  onProfileClick,
  logo,
  websiteConfig
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Header Style 2 (Coco Kids Style)
  if (websiteConfig?.headerStyle === 'style2') {
    return (
      <header className="w-full bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-50 font-sans">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-100 dark:bg-slate-900 dark:border-slate-800 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 py-2 text-[11px] md:text-xs font-medium text-gray-600 dark:text-gray-400 flex flex-col md:flex-row justify-between items-center gap-2">
            <div className="flex items-center gap-4 md:gap-6">
               <div className="flex items-center gap-1.5">
                  <Mail size={14} className="text-gray-800 dark:text-gray-200" />
                  <span>{websiteConfig.emails?.[0] || 'info@example.com'}</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <Phone size={14} className="text-gray-800 dark:text-gray-200" />
                  <span>{websiteConfig.phones?.[0] || '09638-000000'}</span>
               </div>
            </div>
            <div className="flex items-center gap-4 md:gap-6">
               <a href="#" className="flex items-center gap-1 hover:text-blue-600 transition">
                  <Gift size={14} className="text-blue-600" /> Daily Reward
               </a>
               <a href="#" className="hover:text-blue-600 transition hidden sm:inline-block">Community</a>
               <button onClick={onTrackOrder} className="hover:text-blue-600 transition">Track Order</button>
               <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition">
                  <span>My Wishlist ({wishlistCount || 0})</span>
               </div>
               <a href="#" className="hover:text-blue-600 transition hidden sm:inline-block">Seller Registration</a>
               <div className="border-l pl-4 border-gray-200 ml-2">
                 <Bell size={16} className="text-gray-600 dark:text-gray-300 hover:text-blue-600 cursor-pointer" />
               </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-5">
           <div className="flex items-center justify-between gap-4 md:gap-8">
              
              {/* Logo */}
              <div className="cursor-pointer shrink-0" onClick={onHomeClick}>
                {logo ? (
                  <img src={logo} alt="Store Logo" className="h-8 md:h-12 object-contain" />
                ) : (
                  <div className="flex flex-col leading-none">
                     <span className="text-2xl font-black text-blue-500 tracking-tight">COCO</span>
                     <span className="text-xl font-bold text-pink-500 tracking-widest -mt-1">KIDS</span>
                  </div>
                )}
              </div>

              {/* Search Bar - Center */}
              <div className="hidden md:block flex-1 max-w-2xl relative">
                 <input 
                   type="text" 
                   placeholder={websiteConfig?.searchHints || "Search..."}
                   className="w-full border border-blue-400 rounded px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm placeholder-gray-400 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                 />
                 <button className="absolute right-0 top-0 h-full px-4 text-blue-500 hover:text-blue-600 transition">
                    <Search size={20} />
                 </button>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-4 md:gap-8 shrink-0">
                 {/* Mobile Search Icon */}
                 <button className="md:hidden text-gray-600 dark:text-gray-300">
                    <Search size={24} />
                 </button>

                 {/* Cart */}
                 <div className="relative cursor-pointer group hidden md:block">
                    <ShoppingCart size={28} className="text-gray-700 dark:text-gray-200 group-hover:text-blue-600 transition" strokeWidth={1.5} />
                    <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                       0
                    </span>
                 </div>

                 {/* User / Login */}
                 <div className="relative hidden md:block" ref={menuRef}>
                    <div 
                      className="flex items-center gap-2 cursor-pointer group"
                      onClick={user ? () => setIsMenuOpen(!isMenuOpen) : onLoginClick}
                    >
                       <User size={28} className="text-gray-700 dark:text-gray-200 group-hover:text-blue-600 transition" strokeWidth={1.5} />
                       <div className="hidden sm:flex flex-col leading-tight">
                          {user ? (
                             <>
                               <span className="text-xs text-gray-500 dark:text-gray-400">Welcome,</span>
                               <span className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-0.5">
                                 {user.name.split(' ')[0]} <ChevronDown size={12}/>
                               </span>
                             </>
                          ) : (
                             <span className="text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-blue-600 transition whitespace-nowrap">
                                Login / SignUp
                             </span>
                          )}
                       </div>
                    </div>

                    {/* User Dropdown */}
                    {user && isMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-100 dark:border-slate-700 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                         <div className="px-4 py-3 border-b border-gray-50 dark:border-slate-700">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                         </div>
                         <button onClick={() => { setIsMenuOpen(false); onProfileClick?.(); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-blue-600 flex items-center gap-2">
                            <UserCircle size={16} /> My Profile
                         </button>
                         <button onClick={() => { setIsMenuOpen(false); onTrackOrder?.(); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-blue-600 flex items-center gap-2">
                            <Truck size={16} /> My Orders
                         </button>
                         <div className="border-t border-gray-50 dark:border-slate-700 mt-1">
                           <button onClick={() => { setIsMenuOpen(false); onLogoutClick?.(); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                              <LogOut size={16} /> Logout
                           </button>
                         </div>
                      </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      </header>
    );
  }

  // Default Style 1 (GadgetShob)
  return (
    <header className="w-full bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-50 transition-colors duration-300">
      
      {/* MOBILE HEADER SPECIFIC LAYOUT */}
      <div className="md:hidden bg-white dark:bg-slate-900 pb-3 pt-2 px-3 border-b border-gray-100">
        {/* Logo Row - Centered */}
        <div className="flex justify-center mb-3 items-center h-10" onClick={onHomeClick}>
        {logo ? (
            <img src={logo} alt="Store Logo" className="h-8 object-contain" />
        ) : (
            <div className="flex flex-col items-center leading-none">
                <div className="relative mb-0.5">
                    <Smartphone size={24} className="text-gray-800 dark:text-white absolute -left-7 top-0.5 opacity-0" strokeWidth={2.5}/> {/* Hidden spacer if needed, or rely on flex col */}
                    <div className="flex items-center">
                        <Smartphone size={20} className="text-gray-800 dark:text-white mr-1" strokeWidth={2.5}/>
                        <h1 className="text-xl font-bold tracking-tight flex items-center">
                            <span className="text-gray-900 dark:text-white">GADGET</span>
                            <span className="text-pink-500">SHOB</span>
                        </h1>
                    </div>
                </div>
            </div>
        )}
        </div>

        {/* Action Row */}
        <div className="flex items-center gap-3">
            <button className="text-gray-800 dark:text-white p-1">
                <Menu size={26} strokeWidth={2} />
            </button>

            <div className="flex-1 relative h-10">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} strokeWidth={2} />
                <input 
                type="text" 
                placeholder={websiteConfig?.searchHints || "gadget"} 
                className="w-full h-full pl-10 pr-20 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black dark:bg-slate-800 dark:border-slate-600 dark:text-white placeholder-gray-400 font-normal text-gray-700"
                />
                <button className="absolute right-1 top-1 bottom-1 bg-black text-white text-xs font-bold px-4 rounded-[4px] hover:bg-gray-800 transition">
                Search
                </button>
            </div>

            <div className="relative cursor-pointer p-1">
                <ShoppingCart size={26} className="text-gray-800 dark:text-white" strokeWidth={2} />
                <span className="absolute -top-0 -right-0 bg-black text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white dark:border-slate-900">0</span>
            </div>
        </div>
      </div>

      {/* DESKTOP HEADER (Hidden on Mobile) */}
      <div className="hidden md:block">
        {websiteConfig?.showNewsSlider && websiteConfig.headerSliderText && (
            <div className="bg-green-600 text-white text-xs py-1.5 px-4 text-center font-medium overflow-hidden whitespace-nowrap">
            <span className="inline-block animate-marquee">{websiteConfig.headerSliderText}</span>
            </div>
        )}
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
            <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center cursor-pointer" onClick={onHomeClick}>
                {logo ? (
                <img src={logo} alt="Store Logo" className="h-8 md:h-10 object-contain" />
                ) : (
                <h1 className="text-2xl font-bold tracking-tighter">
                    {websiteConfig?.brandingText ? (
                    <span className="text-gray-800 dark:text-white">{websiteConfig.brandingText}</span>
                    ) : (
                    <>
                        <span className="text-gray-800 dark:text-white">GADGET</span>
                        <span className="text-pink-500">SHOB</span>
                    </>
                    )}
                </h1>
                )}
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-2xl relative">
                <input
                type="text"
                placeholder={websiteConfig?.searchHints || "Search product..."}
                className="w-full border-2 border-green-500 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-green-200 dark:bg-slate-800 dark:text-white dark:border-green-600"
                />
                <button className="absolute right-0 top-0 h-full bg-green-500 text-white px-6 rounded-r-full hover:bg-green-600 transition flex items-center justify-center">
                <Search size={20} />
                </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6 text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2 cursor-pointer hover:text-green-600 dark:hover:text-green-400 transition hidden md:flex">
                <div className="relative">
                    <Heart size={24} />
                    {wishlistCount !== undefined && wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{wishlistCount}</span>
                    )}
                </div>
                <span className="hidden sm:inline text-sm font-medium">Wishlist</span>
                </div>
                
                <div className="flex items-center gap-2 cursor-pointer hover:text-green-600 dark:hover:text-green-400 transition hidden md:flex">
                <div className="relative">
                    <ShoppingCart size={24} />
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">0</span>
                </div>
                <span className="hidden sm:inline text-sm font-medium">Cart</span>
                </div>
                
                <div className="relative hidden md:block" ref={menuRef}>
                <div 
                    className="flex items-center gap-2 cursor-pointer hover:text-green-600 dark:hover:text-green-400 transition" 
                    onClick={user ? () => setIsMenuOpen(!isMenuOpen) : onLoginClick}
                >
                    <div className="bg-gray-100 dark:bg-slate-800 p-1 rounded-full">
                    <User size={20} />
                    </div>
                    {user ? (
                    <div className="hidden sm:flex flex-col items-start leading-tight">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Hello,</span>
                        <span className="text-sm font-bold flex items-center gap-1 dark:text-white">
                            {user.name.split(' ')[0]} 
                            <ChevronDown size={12} />
                        </span>
                    </div>
                    ) : (
                    <span className="hidden sm:inline text-sm font-medium">Login/Register</span>
                    )}
                </div>

                {/* User Dropdown */}
                {user && isMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-100 dark:border-slate-700 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 border-b border-gray-50 dark:border-slate-700">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                    <button 
                        onClick={() => { setIsMenuOpen(false); onProfileClick?.(); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-green-600 flex items-center gap-2"
                    >
                        <UserCircle size={16} /> My Profile
                    </button>
                    <button 
                        onClick={() => { setIsMenuOpen(false); onTrackOrder?.(); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-green-600 flex items-center gap-2"
                    >
                        <Truck size={16} /> My Orders
                    </button>
                    <div className="border-t border-gray-50 dark:border-slate-700 mt-1">
                        <button 
                            onClick={() => { setIsMenuOpen(false); onLogoutClick?.(); }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                    </div>
                )}
                </div>
            </div>
            </div>
        </div>
        
        {/* Navigation Bar */}
        <div className="border-t border-gray-100 dark:border-slate-800 hidden md:block">
            <div className="max-w-7xl mx-auto px-4">
            <nav className="flex gap-8 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 items-center">
                <button onClick={onHomeClick} className="hover:text-green-500 transition">Home</button>
                {websiteConfig?.showMobileHeaderCategory && <a href="#" className="hover:text-green-500 transition">Categories</a>}
                <a href="#" className="hover:text-green-500 transition">Products</a>
                <button onClick={onTrackOrder} className="hover:text-green-500 transition">Track Order</button>
                <button onClick={onOpenAIStudio} className="flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:text-purple-700 transition font-bold">
                <Sparkles size={16} /> AI Image Studio
                </button>
                <a href="#" className="hover:text-green-500 transition">Wishlist</a>
            </nav>
            </div>
        </div>
      </div>
    </header>
  );
};

export const ProductCard: React.FC<{ product: Product; onClick: (product: Product) => void; variant?: string }> = ({ product, onClick, variant }) => {
  // Style 2 (Flash Sale - Pink/Blue)
  if (variant === 'style2') {
    return (
        <div className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition group relative overflow-hidden flex flex-col">
            <div className="relative aspect-square p-4 bg-gray-50">
                <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply transition duration-500 group-hover:scale-105" />
                {product.discount && (
                    <span className="absolute top-2 left-2 bg-pink-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        {product.discount}
                    </span>
                )}
                <button className="absolute top-2 right-2 text-gray-400 hover:text-pink-500 transition">
                    <Heart size={18} />
                </button>
            </div>
            
            <div className="p-3 flex-1 flex flex-col">
                {/* Rating */}
                <div className="flex items-center gap-1 text-yellow-400 text-xs mb-1">
                    <Star size={12} fill="currentColor" />
                    <span className="text-gray-400">({product.reviews || 0})</span>
                    <span className="text-gray-400 text-[10px] ml-1">| 0 Sold</span>
                </div>

                <h3 
                  className="font-bold text-gray-800 text-sm mb-1 line-clamp-2 cursor-pointer hover:text-pink-600 transition"
                  onClick={() => onClick(product)}
                >
                    {product.name}
                </h3>
                
                <p className="text-xs text-gray-500 mb-2 line-clamp-2">{product.description?.substring(0, 50)}...</p>

                <div className="mt-auto">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-pink-600 font-bold text-lg">৳ {product.price}</span>
                        {product.originalPrice && (
                            <span className="text-gray-400 text-xs line-through">৳ {product.originalPrice}</span>
                        )}
                        <span className="ml-auto text-[10px] text-blue-500 font-medium">Get 50 Coins</span>
                    </div>
                    
                    <div className="flex gap-2">
                        <button 
                          className="flex-1 bg-pink-600 hover:bg-pink-700 text-white py-1.5 rounded text-sm font-bold transition"
                          onClick={() => onClick(product)}
                        >
                            Buy Now
                        </button>
                        <button className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded transition">
                            <ShoppingCart size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  // Default Style (Green)
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:shadow-xl transition duration-300 group overflow-hidden flex flex-col relative">
      <div className="relative h-48 bg-gray-50 dark:bg-slate-700 p-4 cursor-pointer" onClick={() => onClick(product)}>
        <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition duration-500 group-hover:scale-110" />
        {product.discount && (
          <span className="absolute top-3 left-3 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
            {product.discount}
          </span>
        )}
        <button className="absolute top-3 right-3 p-1.5 bg-white dark:bg-slate-800 rounded-full shadow-md text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 duration-300">
           <Heart size={16} />
        </button>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <h3 
          className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-1 cursor-pointer hover:text-green-600 dark:hover:text-green-400 transition line-clamp-2"
          onClick={() => onClick(product)}
        >
          {product.name}
        </h3>
        
        {/* Variants Preview */}
        {product.colors && product.colors.length > 0 && (
            <div className="flex gap-1 mb-2">
                {product.colors.slice(0, 3).map((c, i) => (
                    <span key={i} className="w-2 h-2 rounded-full border border-gray-200" style={{backgroundColor: c}}></span>
                ))}
            </div>
        )}

        <div className="flex items-center gap-2 mb-3">
           <span className="text-lg font-bold text-gray-900 dark:text-white">৳ {product.price.toLocaleString()}</span>
           {product.originalPrice && (
             <span className="text-xs text-gray-400 line-through">৳ {product.originalPrice.toLocaleString()}</span>
           )}
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); onClick(product); }}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold text-sm transition shadow-lg shadow-green-100 dark:shadow-none mt-auto"
        >
          অর্ডার করুন
        </button>
      </div>
    </div>
  );
};

export const HeroSection: React.FC<{ carouselItems?: CarouselItem[] }> = ({ carouselItems }) => {
  const items = carouselItems?.filter(i => i.status === 'Publish').sort((a,b) => a.serial - b.serial) || [];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 mt-4">
        <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden shadow-sm">
            {items.map((item, index) => (
                <a 
                href={item.url || '#'}
                key={item.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </a>
            ))}
            
            {items.length > 1 && (
                <>
                    <button 
                        onClick={() => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md z-20 transition opacity-0 group-hover:opacity-100 md:opacity-100"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button 
                        onClick={() => setCurrentIndex((prev) => (prev + 1) % items.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md z-20 transition opacity-0 group-hover:opacity-100 md:opacity-100"
                    >
                        <ChevronRight size={20} />
                    </button>

                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                        {items.map((_, idx) => (
                            <button 
                            key={idx} 
                            onClick={() => setCurrentIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 shadow-sm ${idx === currentIndex ? 'bg-white w-6' : 'bg-white/60 hover:bg-white'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    </div>
  );
};

export const CategoryCircle: React.FC<{ name: string; icon: React.ReactNode }> = ({ name, icon }) => (
    <div className="flex flex-col items-center gap-2 cursor-pointer group min-w-[80px]">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-green-500 group-hover:text-white group-hover:border-green-500 transition duration-300 shadow-sm hover:shadow-lg transform group-hover:-translate-y-1">
            {icon}
        </div>
        <span className="text-xs md:text-sm font-medium text-gray-700 group-hover:text-green-600 text-center transition-colors">{name}</span>
    </div>
);

export const CategoryPill: React.FC<{ name: string; icon: React.ReactNode }> = ({ name, icon }) => (
    <div className="flex items-center gap-3 pl-2 pr-6 py-2 bg-white border border-gray-200 rounded-full shadow-sm hover:border-pink-500 hover:shadow-md cursor-pointer transition whitespace-nowrap group">
        <div className="w-8 h-8 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
            {icon}
        </div>
        <span className="text-sm font-bold text-gray-700 group-hover:text-pink-600 tracking-wide">{name}</span>
    </div>
);

export const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 relative inline-block">
        {title}
        <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-purple-500 rounded-full"></span>
    </h2>
);

export const StoreFooter: React.FC<{ websiteConfig?: WebsiteConfig }> = ({ websiteConfig }) => {
    // Style 2 (Coco Kids Footer)
    if (websiteConfig?.footerStyle === 'style2') {
        return (
            <footer className="bg-white border-t border-gray-100 pt-8 pb-4 relative mt-auto">
                <div className="max-w-7xl mx-auto px-4">
                    {/* Centered Contact Bar */}
                    <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-12 mb-12 border-b border-gray-100 pb-8">
                        <div className="flex items-center gap-2">
                            <Mail size={18} className="text-blue-500" />
                            <span className="text-gray-600 text-sm font-medium">{websiteConfig.emails?.[0] || 'info@cocokids.com.bd'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone size={18} className="text-blue-500" />
                            <span className="text-gray-600 text-sm font-medium">{websiteConfig.phones?.[0] || '09638-866300'}</span>
                        </div>
                        <div className="flex items-center gap-2 max-w-xs text-center md:text-left">
                            <MapPin size={18} className="text-blue-500 shrink-0" />
                            <span className="text-gray-600 text-sm font-medium">{websiteConfig.addresses?.[0] || 'Dhaka-1230'}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
                        {/* Logo & Social */}
                        <div className="flex flex-col items-center md:items-start">
                            <div className="mb-4">
                                <span className="text-2xl font-black text-blue-500 tracking-tight">COCO</span>
                                <span className="text-xl font-bold text-pink-500 tracking-widest -mt-1 block">KIDS</span>
                            </div>
                            <p className="text-sm text-gray-500 mb-4">Every Smile Matters</p>
                            <div className="flex gap-3">
                                <a href="#" className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition">
                                    <Facebook size={16} />
                                </a>
                                <a href="#" className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition">
                                    <MessageCircle size={16} /> {/* WhatsApp placeholder */}
                                </a>
                            </div>
                        </div>

                        {/* Columns */}
                        <div>
                            <h4 className="font-bold text-gray-800 mb-4">Contact Us</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>{websiteConfig.emails?.[0]}</li>
                                <li>{websiteConfig.phones?.[0]}</li>
                                <li>{websiteConfig.addresses?.[0]}</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><a href="#" className="hover:text-blue-600">Return & Refund Policy</a></li>
                                <li><a href="#" className="hover:text-blue-600">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-blue-600">Terms and Conditions</a></li>
                                <li><a href="#" className="hover:text-blue-600">About us</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 mb-4">Useful Links</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><a href="#" className="hover:text-blue-600">Why Shop Online with Us</a></li>
                                <li><a href="#" className="hover:text-blue-600">Online Payment Methods</a></li>
                                <li><a href="#" className="hover:text-blue-600">After Sales Support</a></li>
                                <li><a href="#" className="hover:text-blue-600">Faq</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 mt-12 pt-6 text-center text-xs text-gray-500">
                        &copy; All Copyrights Reserved by Cocokids
                    </div>
                </div>

                {/* Floating Chat Button */}
                <button className="fixed bottom-20 right-6 md:bottom-6 w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600 transition z-40">
                    <MessageSquare size={24} />
                </button>
            </footer>
        );
    }

    // Default Footer
    return (
        <footer className={`bg-white border-t border-gray-100 pt-12 pb-6 text-gray-600 max-w-7xl mx-auto px-4`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 dark:text-white">{websiteConfig?.websiteName || 'GadgetShob'}</h3>
                    <p className="text-sm leading-relaxed mb-4">{websiteConfig?.shortDescription}</p>
                    <div className="flex gap-3">
                    {websiteConfig?.socialLinks?.map(link => (
                        <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-purple-600 hover:text-white transition">
                            <Globe size={16} />
                        </a>
                    ))}
                    </div>
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 mb-4 dark:text-white">Quick Links</h4>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#" className="hover:text-purple-600">About Us</a></li>
                        <li><a href="#" className="hover:text-purple-600">Contact</a></li>
                        <li><a href="#" className="hover:text-purple-600">Terms & Conditions</a></li>
                        <li><a href="#" className="hover:text-purple-600">Privacy Policy</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 mb-4 dark:text-white">Customer Area</h4>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#" className="hover:text-purple-600">My Account</a></li>
                        <li><a href="#" className="hover:text-purple-600">Orders</a></li>
                        <li><a href="#" className="hover:text-purple-600">Tracking</a></li>
                        <li><a href="#" className="hover:text-purple-600">Returns</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 mb-4 dark:text-white">Contact Us</h4>
                    <ul className="space-y-3 text-sm">
                        {websiteConfig?.addresses?.map((addr, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <MapPin size={16} className="mt-0.5 shrink-0" />
                                <span>{addr}</span>
                            </li>
                        ))}
                        {websiteConfig?.phones?.map((phone, i) => (
                            <li key={i} className="flex items-center gap-2">
                                <Phone size={16} />
                                <span>{phone}</span>
                            </li>
                        ))}
                        {websiteConfig?.emails?.map((email, i) => (
                            <li key={i} className="flex items-center gap-2">
                                <Mail size={16} />
                                <span>{email}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            {!websiteConfig?.hideCopyright && (
                <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row justify-between items-center text-xs">
                    {!websiteConfig?.hideCopyrightText && (
                        <p>&copy; {new Date().getFullYear()} {websiteConfig?.websiteName}. All rights reserved.</p>
                    )}
                    {websiteConfig?.showPoweredBy && (
                        <p>Powered by Saleecom</p>
                    )}
                </div>
            )}
        </footer>
    );
};

export const LoginModal: React.FC<{ onClose: () => void, onLogin: (e: string, p: string) => boolean, onRegister: (u: UserType) => boolean }> = ({ onClose, onLogin, onRegister }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', address: '' });
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLogin) {
            if(onLogin(formData.email, formData.password)) {
                 onClose();
            } else {
                 alert("Invalid credentials. Try admin/admin");
            }
        } else {
             if(onRegister({ ...formData, role: 'customer' })) {
                 onClose();
             } else {
                 alert("User already exists!");
             }
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
                <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
                <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    <p className="text-gray-500 mb-6 text-sm">{isLogin ? 'Login to continue shopping' : 'Sign up to get started'}</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <>
                                <input type="text" placeholder="Full Name" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                                <input type="text" placeholder="Phone" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                            </>
                        )}
                        <input type="email" placeholder="Email Address" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                        <input type="password" placeholder="Password" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                        
                        <button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition shadow-lg shadow-purple-200">
                            {isLogin ? 'Login' : 'Register'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button onClick={() => setIsLogin(!isLogin)} className="text-purple-600 font-bold hover:underline">
                            {isLogin ? 'Sign Up' : 'Login'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const TrackOrderModal: React.FC<{ onClose: () => void, orders?: Order[] }> = ({ onClose, orders }) => {
    const [orderId, setOrderId] = useState('');
    const [result, setResult] = useState<Order | null>(null);
    const [searched, setSearched] = useState(false);

    const handleTrack = () => {
        setSearched(true);
        const found = orders?.find(o => o.id === orderId);
        setResult(found || null);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
                <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Truck size={28} className="text-purple-600" />
                        <h2 className="text-2xl font-bold text-gray-800">Track Order</h2>
                    </div>
                    
                    <div className="flex gap-2 mb-6">
                        <input 
                          type="text" 
                          placeholder="Enter Order ID (e.g. #0024)" 
                          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={orderId}
                          onChange={e => setOrderId(e.target.value)}
                        />
                        <button onClick={handleTrack} className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-700">Track</button>
                    </div>

                    {searched && (
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            {result ? (
                                <div className="space-y-2">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 text-green-600">
                                        <CheckCircle size={24} />
                                    </div>
                                    <p className="font-bold text-gray-800">Order Found!</p>
                                    <p className="text-sm text-gray-600">Status: <span className="font-bold text-purple-600">{result.status}</span></p>
                                    <p className="text-xs text-gray-500">Date: {result.date}</p>
                                    <p className="text-xs text-gray-500">Amount: ৳{result.amount}</p>
                                </div>
                            ) : (
                                <div className="text-gray-500">
                                    <p>Order not found. Please check the ID.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const AIStudioModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const generateImage = async () => {
        if (!prompt) return;
        setLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: prompt }] }
            });

            if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        const base64EncodeString = part.inlineData.data;
                        setImageUrl(`data:image/png;base64,${base64EncodeString}`);
                        break;
                    }
                }
            }
        } catch (error) {
            console.error("AI Generation failed", error);
            alert("Failed to generate image. Please check API Key configuration.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex overflow-hidden border border-gray-800">
                <div className="w-80 bg-gray-800 p-6 flex flex-col border-r border-gray-700">
                    <div className="flex items-center gap-2 mb-6 text-white">
                        <Sparkles className="text-purple-400" />
                        <h2 className="font-bold text-lg">AI Studio</h2>
                    </div>
                    
                    <div className="space-y-4 flex-1">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Prompt</label>
                            <textarea 
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-purple-500 focus:outline-none resize-none h-32"
                                placeholder="Describe the image you want to generate..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={generateImage}
                            disabled={loading || !prompt}
                            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold transition flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                            Generate
                        </button>
                    </div>
                </div>
                <div className="flex-1 bg-black flex items-center justify-center relative">
                    {imageUrl ? (
                        <img src={imageUrl} alt="Generated" className="max-w-full max-h-full object-contain" />
                    ) : (
                        <div className="text-center text-gray-600">
                            <ImageIcon size={64} className="mx-auto mb-4 opacity-20" />
                            <p>Generated image will appear here</p>
                        </div>
                    )}
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export const AddToCartSuccessModal: React.FC<{ product: Product; onClose: () => void; onCheckout: () => void }> = ({ product, onClose, onCheckout }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                    <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Added to Cart!</h3>
                <p className="text-gray-600 text-sm mb-6">{product.name} has been added to your cart.</p>
                
                <div className="flex gap-3">
                    <button 
                        onClick={onClose} 
                        className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition"
                    >
                        Continue Shopping
                    </button>
                    <button 
                        onClick={onCheckout} 
                        className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 transition"
                    >
                        Checkout
                    </button>
                </div>
            </div>
        </div>
    );
};