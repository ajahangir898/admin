
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ShoppingCart, Search, User, Facebook, Instagram, Twitter, Linkedin, Truck, X, CheckCircle, Sparkles, Upload, Wand2, Image as ImageIcon, Loader2, ArrowRight, Heart, LogOut, ChevronDown, UserCircle, Phone, Mail, MapPin, Youtube, ShoppingBag, Globe, Star, Eye, Bell, Gift, Users, ChevronLeft, ChevronRight, MessageCircle, Home, Grid, MessageSquare, List, Menu, Smartphone, Mic, Camera, Minus, Plus } from 'lucide-react';
import { Product, User as UserType, WebsiteConfig, CarouselItem, Order, ProductVariantSelection } from '../types';

const SEARCH_HINT_ANIMATION = `
@keyframes searchHintSlideUp {
    0% { opacity: 0; transform: translateY(40%); }
    100% { opacity: 1; transform: translateY(0); }
}
.search-hint-animate {
    animation: searchHintSlideUp 0.45s ease;
    display: inline-block;
}
`;
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
    const facebookLink = websiteConfig?.socialLinks?.find(link => (link.platform || '').toLowerCase().includes('facebook'))?.url;

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
      
            {facebookLink ? (
                <a
                    href={facebookLink}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook Page"
                    className="flex flex-col items-center gap-1 text-gray-500 hover:text-pink-600 transition w-1/5 group"
                >
                    <Facebook size={22} strokeWidth={2} className="text-gray-500 group-hover:text-pink-600" />
                    <span className="text-[10px] font-medium text-gray-500 group-hover:text-pink-600">Page</span>
                </a>
            ) : (
                <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-pink-600 transition w-1/5 group">
                    <Facebook size={22} strokeWidth={2} className="text-gray-500 group-hover:text-pink-600" />
                    <span className="text-[10px] font-medium text-gray-500 group-hover:text-pink-600">Page</span>
                </button>
            )}
      
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
    const [searchQuery, setSearchQuery] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);
    const supportsVoiceSearch = typeof window !== 'undefined' && Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    const parsedHints = useMemo(() => {
        if (websiteConfig?.searchHints) {
            return websiteConfig.searchHints
                .split(/[\n,|]/)
                .map((hint) => hint.trim())
                .filter(Boolean);
        }
        return ['Search smartphones', 'Find the best deals', 'Discover new gadgets'];
    }, [websiteConfig?.searchHints]);
    const [activeHintIndex, setActiveHintIndex] = useState(0);
    useEffect(() => {
        setActiveHintIndex(0);
    }, [parsedHints.length]);
    useEffect(() => {
        if (parsedHints.length <= 1) return;
        const interval = setInterval(() => {
            setActiveHintIndex((prev) => (prev + 1) % parsedHints.length);
        }, 3500);
        return () => clearInterval(interval);
    }, [parsedHints.length]);
    const activeHint = parsedHints[activeHintIndex] || '';
    const renderSearchHintOverlay = (offsetClass = 'left-4', textSizeClass = 'text-sm') => {
        if (searchQuery.trim() || !activeHint) return null;
        return (
            <div
                key={`${offsetClass}-${activeHintIndex}`}
                className={`pointer-events-none absolute inset-y-0 ${offsetClass} flex items-center text-gray-400 ${textSizeClass} z-10`}
            >
                <span className="search-hint-animate">{activeHint}</span>
            </div>
        );
    };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

    useEffect(() => {
        if (!supportsVoiceSearch) return;
        const SpeechRecognitionConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognitionConstructor();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onresult = (event: any) => {
            const transcript = event.results?.[0]?.[0]?.transcript;
            if (transcript) setSearchQuery(transcript);
        };
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);
        recognitionRef.current = recognition;
        return () => {
            recognition.stop?.();
            recognitionRef.current = null;
        };
    }, [supportsVoiceSearch]);

    const handleVoiceSearch = () => {
        if (!recognitionRef.current) {
            alert('Voice search is not supported in this browser.');
            return;
        }
        try {
            recognitionRef.current.start();
        } catch (error) {
            console.error('Voice search failed to start', error);
        }
    };

    const VoiceButton: React.FC<{ variant?: 'light' | 'dark' }> = ({ variant = 'dark' }) => {
        if (!supportsVoiceSearch) return null;
        const baseClasses = variant === 'light'
            ? 'bg-white/90 text-gray-700 hover:bg-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200';
        return (
            <button
                type="button"
                onClick={handleVoiceSearch}
                className={`${baseClasses} border border-gray-200 rounded-full p-2 flex items-center justify-center transition shadow-sm disabled:opacity-50`}
                title="Voice search"
                aria-pressed={isListening}
            >
                {isListening ? <Loader2 size={16} className="animate-spin" /> : <Mic size={16} />}
            </button>
        );
    };

  // Header Style 4: Mobile Exact Search Layout
  if (websiteConfig?.headerStyle === 'style4') {
    return (
            <>
                <style>{SEARCH_HINT_ANIMATION}</style>
                <header className="store-header w-full bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-50 font-sans transition-colors duration-300">
         {/* Mobile Header Style 4 */}
         <div className="md:hidden p-3 flex items-center gap-3 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
            <div className="flex-1 relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <Search size={18} />
               </div>
                    {renderSearchHintOverlay('left-10', 'text-xs')}
               <input 
                  type="text" 
                        placeholder="Search your products" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                                aria-label="Search products"
                                className="w-full bg-gray-100 dark:bg-slate-800 border-none rounded-lg py-2.5 pl-10 pr-14 text-sm text-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500/20 placeholder-transparent"
               />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400">
                        <Camera size={18} />
                        <VoiceButton variant="light" />
                    </div>
            </div>
            
                <button className="p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-full transition flex-shrink-0" onClick={handleVoiceSearch}>
                    {isListening ? <Loader2 size={24} className="text-blue-500 animate-spin" /> : <Mic size={24} className="text-blue-500" />}
                </button>
            
            <button className="p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-full transition relative text-gray-600 dark:text-gray-300 flex-shrink-0">
               <ShoppingCart size={24} />
               <span className="absolute top-1 right-0 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900">0</span>
            </button>
         </div>

         {/* Desktop Header (Reused Standard Logic) */}
         <div className="hidden md:block">
            {websiteConfig?.showNewsSlider && websiteConfig.headerSliderText && (
                <div className="bg-green-600 text-white text-xs py-1.5 px-4 text-center font-medium overflow-hidden whitespace-nowrap">
                <span className="inline-block animate-marquee">{websiteConfig.headerSliderText}</span>
                </div>
            )}
            <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
                <div className="flex items-center justify-between gap-4">
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

                <div className="hidden md:flex flex-1 max-w-2xl relative">
                    {renderSearchHintOverlay('left-4')}
                    <input
                    type="text"
                    placeholder={websiteConfig?.searchHints || "Search product..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search products"
                    className="w-full border-2 border-green-500 rounded-full py-2 pl-4 pr-32 focus:outline-none focus:ring-2 focus:ring-green-200 dark:bg-slate-800 dark:text-white dark:border-green-600 placeholder-transparent"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <VoiceButton />
                                                <button className="btn-search px-6 py-2 rounded-full flex items-center justify-center">
                          <Search size={20} />
                        </button>
                    </div>
                </div>

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

                    {user && isMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-100 dark:border-slate-700 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-4 py-3 border-b border-gray-50 dark:border-slate-700">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        </div>
                        <button onClick={() => { setIsMenuOpen(false); onProfileClick?.(); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-green-600 flex items-center gap-2">
                            <UserCircle size={16} /> My Profile
                        </button>
                        <button onClick={() => { setIsMenuOpen(false); onTrackOrder?.(); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-green-600 flex items-center gap-2">
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
            </>
    );
  }

  // Header Style 2 (Coco Kids Style)
  if (websiteConfig?.headerStyle === 'style2') {
    return (
            <>
                <style>{SEARCH_HINT_ANIMATION}</style>
                <header className="store-header w-full bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-50 font-sans">
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
                 {renderSearchHintOverlay('left-4')}
                 <input 
                   type="text" 
                   placeholder={websiteConfig?.searchHints || "Search..."}
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                     aria-label="Search products"
                     className="w-full border border-blue-400 rounded px-4 py-2.5 pr-32 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm placeholder-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                 />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                          <VoiceButton variant="light" />
                                  <button className="btn-search px-4 py-2 rounded-full flex items-center justify-center">
                             <Search size={20} />
                          </button>
                      </div>
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
            </>
    );
  }

  // Default Style 1 (GadgetShob)
  return (
        <>
            <style>{SEARCH_HINT_ANIMATION}</style>
            <header className="store-header w-full bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-50 transition-colors duration-300">
      
      {/* MOBILE HEADER SPECIFIC LAYOUT */}
            <div className="md:hidden bg-white dark:bg-slate-900 pb-3 pt-2 px-3 border-b border-gray-100 shadow-sm">
                {/* Logo Row - Centered */}
                <div className="flex justify-center mb-3 items-center h-8" onClick={onHomeClick}>
                    {logo ? (
                        <img src={logo} alt="Store Logo" className="h-6 object-contain" />
                    ) : (
                        <div className="flex items-center gap-1">
                            <Smartphone size={20} className="text-gray-800 dark:text-white" strokeWidth={2.5} />
                            <h1 className="text-lg font-bold tracking-tight flex items-center">
                                <span className="text-gray-900 dark:text-white">GADGET</span>
                                <span className="text-pink-500">SHOB</span>
                            </h1>
                        </div>
                    )}
                </div>

                {/* Action Row */}
                <div className="flex items-center gap-3">
                    <button className="text-gray-800 dark:text-white">
                        <Menu size={28} strokeWidth={2} />
                    </button>

                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-800" size={18} strokeWidth={2.5} />
                        {renderSearchHintOverlay('left-10', 'text-xs')}
                        <input
                            type="text"
                            placeholder={websiteConfig?.searchHints || "gadget"}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            aria-label="Search products"
                            className="w-full pl-10 pr-28 py-2.5 border border-gray-900 rounded-lg text-sm focus:outline-none dark:bg-slate-800 dark:border-slate-600 dark:text-white placeholder-transparent font-medium text-gray-700"
                        />
                        <div className="absolute right-1 top-1 bottom-1 flex items-center gap-2">
                            <VoiceButton />
                            <button className="btn-search text-xs font-bold px-4 h-full rounded-md flex items-center justify-center">
                                Search
                            </button>
                        </div>
                    </div>

                    <div className="relative cursor-pointer">
                        <ShoppingCart size={26} className="text-gray-800 dark:text-white" strokeWidth={2} />
                        <span className="absolute -top-1.5 -right-1 bg-black text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white dark:border-slate-900">
                            0
                        </span>
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
                                {renderSearchHintOverlay('left-4')}
                                <input
                                type="text"
                                placeholder={websiteConfig?.searchHints || "Search product..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                aria-label="Search products"
                                className="w-full border-2 border-green-500 rounded-full py-2 pl-4 pr-32 focus:outline-none focus:ring-2 focus:ring-green-200 dark:bg-slate-800 dark:text-white dark:border-green-600 placeholder-transparent"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    <VoiceButton />
                                    <button className="btn-search px-6 py-2 rounded-full flex items-center justify-center gap-2">
                                        <Search size={20} />
                                    </button>
                                </div>
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
                <a href="#" className="hover:text-green-500 transition"></a>
            </nav>
            </div>
        </div>
      </div>
            </header>
        </>
  );
};


export const ProductCard: React.FC<{ product: Product; onClick: (product: Product) => void; variant?: string; onQuickView?: (product: Product) => void }> = ({ product, onClick, variant, onQuickView }) => {
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
                <button className="absolute top-2 right-2 btn-wishlist text-current">
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
                        <span className="text-pink-600 font-bold text-medium"><b>৳</b>{product.price}</span>
                        {product.originalPrice && (
                            <span className="text-gray-400 text-xs line-through">{product.originalPrice}</span>
                        )}
                        <span className="ml-auto text-[10px] text-blue-500 font-medium">Get 50 Coins</span>
                    </div>
                    
                    <div className="flex gap-2">
                                                <button 
                                                    className="flex-1 btn-order py-1.5 text-sm"
                                                    onClick={() => onClick(product)}
                                                >
                            Buy Now
                        </button>
                        <button className="bg-blue-500 hover:bg-blue-600 text-red-600 p-1.5 rounded transition">
                            <ShoppingCart size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
  }

    const formattedPrice = product.price.toLocaleString();
    const formattedOriginalPrice = product.originalPrice?.toLocaleString();
    const tagLabel = product.tag || 'Trending';
    const accentMeta = product.brand || product.category || 'Curated pick';

    // Default Style (Card 1)
    return (
        <div className="group relative flex flex-col rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden">
            <span className="pointer-events-none absolute inset-x-4 top-0 h-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-500 opacity-60 group-hover:opacity-100" />

            <div className="relative px-4 pt-4">
                <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 uppercase tracking-wide dark:bg-emerald-500/10 dark:text-emerald-200">
                        <Sparkles size={12} /> {tagLabel}
                    </span>
                    {typeof product.rating === 'number' ? (
                        <span className="inline-flex items-center gap-1 text-amber-500">
                            <Star size={12} fill="currentColor" className="drop-shadow" />
                            {product.rating.toFixed(1)}
                            {typeof product.reviews === 'number' && (
                                <span className="text-[10px] text-gray-400 dark:text-gray-300 font-normal">({product.reviews})</span>
                            )}
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-sky-600 bg-sky-50 dark:bg-sky-500/10 dark:text-sky-200">
                            <Truck size={12} /> Fast ship
                        </span>
                    )}
                </div>

                <div className="relative mt-4">
                    <div className="absolute inset-x-6 top-2 h-28 bg-gradient-to-br from-emerald-200/40 via-transparent to-transparent blur-3xl opacity-60 group-hover:opacity-90 transition" aria-hidden />
                    <div className="relative h-40 rounded-2xl bg-gray-50 dark:bg-slate-700 flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => onClick(product)}>
                        <img src={product.image} alt={product.name} className="h-full w-full object-contain mix-blend-multiply dark:mix-blend-normal transition duration-500 group-hover:scale-110" />
                    </div>
                    {product.discount && (
                        <span className="absolute top-4 left-6 bg-purple-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                            {product.discount}
                        </span>
                    )}
                    <button className="absolute top-4 right-6 btn-wishlist bg-white/80 dark:bg-slate-800/70 shadow-md backdrop-blur-sm hover:scale-110 transition" aria-label="Save to wishlist">
                        <Heart size={16} />
                    </button>
                </div>
            </div>

            <div className="p-4 flex-1 flex flex-col gap-3">
                <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500 mb-1">{accentMeta}</p>
                    <h3
                        className="font-bold text-gray-900 dark:text-gray-100 text-base leading-tight cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-300 transition line-clamp-2"
                        onClick={() => onClick(product)}
                    >
                        {product.name}
                    </h3>
                    {product.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{product.description}</p>
                    )}
                </div>

                {product.colors && product.colors.length > 0 && (
                    <div className="flex gap-1.5">
                        {product.colors.slice(0, 4).map((c, i) => (
                            <span key={i} className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ backgroundColor: c }}></span>
                        ))}
                        {product.colors.length > 4 && (
                            <span className="text-[10px] text-gray-400">+{product.colors.length - 4}</span>
                        )}
                    </div>
                )}

                <div className="mt-auto flex items-end justify-between gap-3">
                    <div>
                        <p className="text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500">Starting at</p>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-gray-900 dark:text-white">৳ {formattedPrice}</span>
                            {product.originalPrice && (
                                <span className="text-xs text-gray-400 line-through">৳ {formattedOriginalPrice}</span>
                            )}
                        </div>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-300 font-semibold">Instant confirmation</p>
                    </div>

                    <div className="flex flex-col gap-2 w-32">
                        <button
                            onClick={(e) => { e.stopPropagation(); onClick(product); }}
                            className="w-full btn-order py-2 rounded-xl font-bold text-sm"
                        >
                            অর্ডার করুন
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onQuickView) onQuickView(product);
                                else onClick(product);
                            }}
                            className="inline-flex items-center justify-center gap-1 rounded-xl border border-gray-200 dark:border-slate-600 text-xs font-semibold text-gray-600 dark:text-gray-200 py-1.5 hover:border-emerald-400 hover:text-emerald-600 transition"
                        >
                            <Eye size={14} /> Quick view
                        </button>
                    </div>
                </div>
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
            <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden shadow-sm group">
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

    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full shadow-sm hover:border-pink-500 hover:shadow-md cursor-pointer transition whitespace-nowrap group">
        <div className="w-7 h-7 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center group-hover:rotate-6 transition-transform duration-300">
            {icon}
        </div>
        <span className="text-sm font-semibold text-gray-700 group-hover:text-pink-600 tracking-wide">{name}</span>
    </div>
);

export const SectionHeader: React.FC<{ title: string; className?: string }> = ({ title, className }) => (
    <div className="inline-flex flex-col gap-1">
        <div className="flex items-center gap-3">
            
            <h2 className={`text-2xl font-black tracking-tight text-gray-900 dark:text-white drop-shadow-sm ${className ?? ''}`}>
                {title}
            </h2>
        </div>
        <span className="h-1 w-24 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full" />
    </div>
);


export const StoreFooter: React.FC<{ websiteConfig?: WebsiteConfig; logo?: string | null }> = ({ websiteConfig, logo }) => {
    const resolveSocialIcon = (platform?: string): React.ReactNode => {
        const key = platform?.toLowerCase() || '';
        if (key.includes('facebook') || key === 'fb') return <Facebook size={18} className="text-current" />;
        if (key.includes('instagram') || key === 'ig') return <Instagram size={18} className="text-current" />;
        if (key.includes('twitter') || key === 'x') return <Twitter size={18} className="text-current" />;
        if (key.includes('youtube') || key.includes('yt')) return <Youtube size={18} className="text-current" />;
        if (key.includes('linkedin')) return <Linkedin size={18} className="text-current" />;
        if (key.includes('whatsapp') || key.includes('messenger')) return <MessageCircle size={18} className="text-current" />;
        return <Globe size={18} className="text-current" />;
    };

    // Style 2 (Coco Kids Footer)
    if (websiteConfig?.footerStyle === 'style2') {
        return (
            <footer className="store-footer surface-panel bg-white border-t border-gray-100 pt-8 pb-4 relative mt-auto max-w-7xl mx-auto px-4">
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
                            <div className="mb-4 flex flex-col items-center md:items-start">
                                {logo ? (
                                    <img src={logo} alt={`${websiteConfig?.websiteName || 'Store'} logo`} className="h-12 object-contain" />
                                ) : (
                                    <>
                                        <span className="text-2xl font-black text-blue-500 tracking-tight">COCO</span>
                                        <span className="text-xl font-bold text-pink-500 tracking-widest -mt-1 block">KIDS</span>
                                    </>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mb-4">{websiteConfig?.shortDescription || 'Every Smile Matters'}</p>
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

    if (websiteConfig?.footerStyle === 'style3') {
        const quickLinksSource = websiteConfig?.footerQuickLinks;
        const quickLinks = quickLinksSource && quickLinksSource.length
            ? quickLinksSource
            : [
                { id: 'quick-1', label: 'About Us', url: '#' },
                { id: 'quick-2', label: 'Order Tracking', url: '#' },
                { id: 'quick-3', label: 'Shipping & Delivery', url: '#' },
                { id: 'quick-4', label: 'Contact', url: '#' }
            ];
        const usefulLinksSource = websiteConfig?.footerUsefulLinks;
        const usefulLinks = usefulLinksSource && usefulLinksSource.length
            ? usefulLinksSource
            : [
                { id: 'useful-1', label: 'Return & Refund Policy', url: '#' },
                { id: 'useful-2', label: 'Privacy Policy', url: '#' },
                { id: 'useful-3', label: 'FAQ', url: '#' },
                { id: 'useful-4', label: 'Why Shop With Us', url: '#' }
            ];
        const socialLinks = websiteConfig?.socialLinks || [];
        const contactCards = [
            websiteConfig?.phones?.[0]
                ? { label: 'Call us', value: websiteConfig.phones[0], icon: <Phone size={16} className="text-[color:var(--color-primary)]" /> }
                : null,
            websiteConfig?.emails?.[0]
                ? { label: 'Mail us', value: websiteConfig.emails[0], icon: <Mail size={16} className="text-[color:var(--color-primary)]" /> }
                : null,
            websiteConfig?.addresses?.[0]
                ? { label: 'Visit us', value: websiteConfig.addresses[0], icon: <MapPin size={16} className="text-[color:var(--color-primary)]" /> }
                : null
        ].filter((card): card is { label: string; value: string; icon: React.ReactNode } => Boolean(card));

        return (
            <footer className="store-footer surface-panel bg-white/95 border-t border-gray-100 mt-auto">
                <div className="max-w-7xl mx-auto px-4 py-12 space-y-10">
                    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr,0.8fr,0.8fr]">
                        <div className="space-y-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                {logo ? (
                                    <img src={logo} alt={`${websiteConfig?.websiteName || 'Store'} logo`} className="h-12 object-contain" />
                                ) : (
                                    <div className="text-3xl font-black tracking-tight text-gray-900">
                                        {websiteConfig?.websiteName || 'Your Store'}
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs uppercase tracking-[0.4em] text-gray-400">{websiteConfig?.brandingText || 'Stay Inspired'}</p>
                                    <p className="text-sm text-gray-500 mt-2 max-w-md">{websiteConfig?.shortDescription || 'Discover curated picks and seasonal favorites in one place.'}</p>
                                </div>
                            </div>
                            {contactCards.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {contactCards.map(card => (
                                        <div key={card.label} className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 shadow-sm">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                                                {card.icon}
                                                <span>{card.label}</span>
                                            </div>
                                            <p className="text-sm font-bold text-gray-900 mt-1 break-words">{card.value}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {socialLinks.length > 0 && (
                                <div className="flex flex-wrap items-center gap-3">
                                    {socialLinks.map(link => (
                                        <a
                                            key={link.id}
                                            href={link.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            aria-label={link.platform}
                                            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:text-white hover:bg-[color:var(--color-primary)] transition"
                                        >
                                            {resolveSocialIcon(link.platform)}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h4>
                            <ul className="space-y-2">
                                {quickLinks.map(link => (
                                    <li key={link.id}>
                                        <a href={link.url || '#'} className="flex items-center justify-between gap-4 text-sm text-gray-600 hover:text-[color:var(--color-primary)] transition">
                                            <span>{link.label}</span>
                                            <ArrowRight size={16} className="text-gray-400" />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Useful Links</h4>
                            <ul className="space-y-2">
                                {usefulLinks.map(link => (
                                    <li key={link.id}>
                                        <a href={link.url || '#'} className="flex items-center justify-between gap-4 text-sm text-gray-600 hover:text-[color:var(--color-secondary)] transition">
                                            <span>{link.label}</span>
                                            <ArrowRight size={16} className="text-gray-300" />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 border-t border-gray-100 pt-6 text-xs text-gray-500 md:flex-row md:items-center md:justify-between">
                        <p>
                            &copy; {new Date().getFullYear()} {websiteConfig?.websiteName || 'Store'}. All rights reserved.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            {websiteConfig?.addresses?.slice(0, 2).map((addr, idx) => (
                                <span key={`${addr}-${idx}`} className="inline-flex items-center gap-1">
                                    <MapPin size={14} className="text-gray-400" />
                                    <span>{addr}</span>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        );
    }

    // Default Footer
    return (
        <footer className={`store-footer surface-panel bg-white border-t border-gray-100 pt-12 pb-6 text-gray-600 max-w-7xl mx-auto px-4`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div>
                    {logo ? (
                        <img src={logo} alt={`${websiteConfig?.websiteName || 'Store'} logo`} className="h-10 object-contain mb-4" />
                    ) : (
                        <h3 className="text-lg font-bold text-gray-900 mb-4 dark:text-white">{websiteConfig?.websiteName || 'GadgetShob'}</h3>
                    )}
                    <p className="text-sm leading-relaxed mb-4">{websiteConfig?.shortDescription}</p>
                    <div className="flex gap-3">
                    {websiteConfig?.socialLinks?.map(link => (
                        <a key={link.id} href={link.url} target="_blank" rel="noreferrer" aria-label={link.platform} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-purple-600 hover:text-white transition">
                            {resolveSocialIcon(link.platform)}
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
                <div className="max-w-7xl mx-auto px-4 border-t border-gray-100 pt-6 flex flex-col md:flex-row justify-between items-center text-xs">
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

export const ProductQuickViewModal: React.FC<{
    product: Product;
    onClose: () => void;
    onCompleteOrder: (product: Product, quantity: number, variant: ProductVariantSelection) => void;
    onViewDetails?: (product: Product) => void;
}> = ({ product, onClose, onCompleteOrder, onViewDetails }) => {
    const [selectedColor, setSelectedColor] = useState<string>(product.variantDefaults?.color || product.colors?.[0] || 'Default');
    const [selectedSize, setSelectedSize] = useState<string>(product.variantDefaults?.size || product.sizes?.[0] || 'Standard');
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        setSelectedColor(product.variantDefaults?.color || product.colors?.[0] || 'Default');
        setSelectedSize(product.variantDefaults?.size || product.sizes?.[0] || 'Standard');
        setQuantity(1);
    }, [product]);

    const handleQuantityChange = (delta: number) => {
        setQuantity(prev => Math.max(1, prev + delta));
    };

    const variant: ProductVariantSelection = {
        color: selectedColor || 'Default',
        size: selectedSize || 'Standard'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden grid grid-cols-1 lg:grid-cols-2">
                <button aria-label="Close" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={22} />
                </button>
                <div className="p-6 lg:p-10 bg-gray-50 flex flex-col items-center justify-center">
                    <div className="relative w-full max-w-sm">
                        <div className="absolute inset-6 bg-gradient-to-br from-emerald-200/40 via-transparent to-transparent blur-3xl" aria-hidden />
                        <img src={product.image} alt={product.name} className="relative w-full h-80 object-contain" />
                    </div>
                    <div className="mt-4 flex gap-2 text-xs text-gray-500">
                        <span className="px-3 py-1 rounded-full bg-white border border-gray-200">Ships 48h</span>
                        <span className="px-3 py-1 rounded-full bg-white border border-gray-200">Secure Payment</span>
                    </div>
                </div>

                <div className="p-6 lg:p-10 space-y-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Quick view</p>
                        <h3 className="text-2xl font-black text-gray-900 mt-2">{product.name}</h3>
                        <p className="text-sm text-gray-500 mt-2 line-clamp-3">{product.description}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-3xl font-black text-gray-900">৳ {product.price.toLocaleString()}</span>
                        {product.originalPrice && (
                            <span className="text-sm line-through text-gray-400">৳ {product.originalPrice.toLocaleString()}</span>
                        )}
                    </div>

                    {product.colors && product.colors.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Color</p>
                            <div className="flex flex-wrap gap-2">
                                {product.colors.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setSelectedColor(color)}
                                        className={`w-8 h-8 rounded-full border-2 ${selectedColor === color ? 'border-emerald-500' : 'border-transparent'} shadow-sm`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {product.sizes && product.sizes.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Size</p>
                            <div className="flex flex-wrap gap-2">
                                {product.sizes.map(size => (
                                    <button
                                        key={size}
                                        type="button"
                                        onClick={() => setSelectedSize(size)}
                                        className={`px-3 py-1.5 rounded-xl border text-sm font-semibold ${selectedSize === size ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 'border-gray-200 text-gray-600'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase">Quantity</p>
                        <div className="flex items-center rounded-full border border-gray-200">
                            <button type="button" onClick={() => handleQuantityChange(-1)} className="p-2 text-gray-500 hover:text-gray-900">
                                <Minus size={16} />
                            </button>
                            <span className="px-4 text-sm font-bold text-gray-900">{quantity}</span>
                            <button type="button" onClick={() => handleQuantityChange(1)} className="p-2 text-gray-500 hover:text-gray-900">
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            type="button"
                            onClick={() => onCompleteOrder(product, quantity, variant)}
                            className="w-full btn-order py-3 rounded-2xl font-bold text-base shadow-[0_18px_28px_rgba(16,185,129,0.25)]"
                        >
                            Complete Order
                        </button>
                        <button
                            type="button"
                            onClick={() => { onViewDetails?.(product); }}
                            className="w-full py-3 rounded-2xl border border-gray-200 text-gray-700 font-semibold hover:border-emerald-400"
                        >
                            View Full Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
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
                                <input type="text" placeholder="Full Name" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgba(var(--color-primary-rgb),0.4)]" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                                <input type="text" placeholder="Phone" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgba(var(--color-primary-rgb),0.4)]" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                            </>
                        )}
                        <input type="email" placeholder="Email Address" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgba(var(--color-primary-rgb),0.4)]" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                        <input type="password" placeholder="Password" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgba(var(--color-primary-rgb),0.4)]" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                        
                        <button type="submit" className="w-full btn-order py-3 rounded-xl font-bold shadow-[0_18px_28px_rgba(var(--color-primary-rgb),0.25)]">
                            {isLogin ? 'Login' : 'Register'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button onClick={() => setIsLogin(!isLogin)} className="text-[rgb(var(--color-primary-rgb))] font-bold hover:underline">
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
                    <div className="flex items-center gap-3 mb-1">
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

let cachedGoogleGenAI: typeof import('@google/generative-ai').GoogleGenerativeAI | null = null; // eslint-disable-line import/no-unresolved
const loadGoogleGenAI = async () => {
    if (cachedGoogleGenAI) return cachedGoogleGenAI;
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    cachedGoogleGenAI = GoogleGenerativeAI;
    return cachedGoogleGenAI;
};

export const AIStudioModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const defaultEnvKey =
        import.meta.env.VITE_GOOGLE_AI_API_KEY ||
        import.meta.env.VITE_GOOGLE_API_KEY ||
        process.env.VITE_GOOGLE_AI_API_KEY ||
        process.env.VITE_GOOGLE_API_KEY ||
        process.env.API_KEY ||
        '';
    const [customKey, setCustomKey] = useState(() => {
        if (typeof window === 'undefined') return '';
        return localStorage.getItem('gadgetshob_ai_key') || defaultEnvKey;
    });
    const activeApiKey = customKey || defaultEnvKey;

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (customKey) {
            localStorage.setItem('gadgetshob_ai_key', customKey);
        } else {
            localStorage.removeItem('gadgetshob_ai_key');
        }
    }, [customKey]);

    const generateImage = async () => {
        if (!prompt) return;
        if (!activeApiKey) {
            setErrorMessage('No Google AI API key configured. Add VITE_GOOGLE_AI_API_KEY to your .env or paste a key below.');
            return;
        }
        setLoading(true);
        setErrorMessage(null);
        try {
            const GoogleGenAI = await loadGoogleGenAI();
            if (!GoogleGenAI) {
                setErrorMessage('Failed to load Google GenAI SDK. Please refresh and try again.');
                return;
            }
            const ai = new GoogleGenAI(activeApiKey);
            const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash-image' });

            const result = await model.generateContent([{ text: prompt }]);
            const response = result.response;

            // Extract image from response parts
            // Guidelines say: The output response may contain both image and text parts; you must iterate...
            const parts = response?.candidates?.[0]?.content?.parts;
            if (parts) {
                for (const part of parts) {
                    if (part.inlineData?.data) {
                        const base64EncodeString = part.inlineData.data;
                        setImageUrl(`data:image/png;base64,${base64EncodeString}`);
                        break;
                    }
                }
            }
        } catch (error: any) {
            console.error("AI Generation failed", error);
            const status = error?.status || error?.response?.status;
            if (status === 403 && error?.error?.error?.status !== 'RESOURCE_EXHAUSTED') {
                setErrorMessage('This API key is blocked from calling the Generative Language API. Enable the API for your Google Cloud project or use a different unrestricted key.');
            } else {
                setErrorMessage(`Failed to generate image. ${error?.message || 'Check API key configuration.'}`);
            }
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
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Google AI API Key</label>
                            <input
                                type="password"
                                placeholder="Paste VITE_GOOGLE_AI_API_KEY"
                                value={customKey}
                                onChange={(e) => setCustomKey(e.target.value.trim())}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                            />
                            <p className="text-[11px] text-gray-500 mt-1">Key stays in this browser only (localStorage). Leave blank to use the bundled env key.</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Prompt</label>
                            <textarea
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500 focus:outline-none resize-none h-32"
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
                        {errorMessage && (
                            <div className="text-xs text-red-400 bg-red-950/30 border border-red-500/30 rounded-lg p-3">
                                {errorMessage}
                            </div>
                        )}
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

export const AddToCartSuccessModal: React.FC<{ product: Product; onClose: () => void; onCheckout: () => void; variant?: ProductVariantSelection | null; quantity?: number }> = ({ product, onClose, onCheckout, variant, quantity }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                    <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Added to Cart!</h3>
                <p className="text-gray-600 text-sm mb-2">{product.name} has been added to your cart.</p>
                {variant && (
                    <p className="text-xs text-gray-500 mb-4">Variant: <span className="font-semibold text-gray-700">{variant.color} / {variant.size}</span>{quantity ? ` • Qty: ${quantity}` : ''}</p>
                )}
                
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
