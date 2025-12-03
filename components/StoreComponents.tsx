
import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Search, User, Facebook, Instagram, Twitter, Truck, X, CheckCircle, Sparkles, Upload, Wand2, Image as ImageIcon, Loader2, ArrowRight, Heart, LogOut, ChevronDown, UserCircle, Phone, Mail, MapPin, Youtube, ShoppingBag, Globe, Star, Eye, Bell, Gift, Users, ChevronLeft, ChevronRight } from 'lucide-react';
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
        <div className="bg-white border-b border-gray-100 dark:bg-slate-900 dark:border-slate-800">
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
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-5">
           <div className="flex items-center justify-between gap-4 md:gap-8">
              
              {/* Logo */}
              <div className="cursor-pointer shrink-0" onClick={onHomeClick}>
                {logo ? (
                  <img src={logo} alt="Store Logo" className="h-10 md:h-12 object-contain" />
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
              <div className="flex items-center gap-6 md:gap-8 shrink-0">
                 {/* Mobile Search Icon */}
                 <button className="md:hidden text-gray-600 dark:text-gray-300">
                    <Search size={24} />
                 </button>

                 {/* Cart */}
                 <div className="relative cursor-pointer group">
                    <ShoppingCart size={28} className="text-gray-700 dark:text-gray-200 group-hover:text-blue-600 transition" strokeWidth={1.5} />
                    <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                       0
                    </span>
                 </div>

                 {/* User / Login */}
                 <div className="relative" ref={menuRef}>
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

                    {/* User Dropdown (Same as Style 1) */}
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

  // Default Style 1
  return (
    <header className="w-full bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-50 transition-colors duration-300">
      {websiteConfig?.showNewsSlider && websiteConfig.headerSliderText && (
        <div className="bg-green-600 text-white text-xs py-1.5 px-4 text-center font-medium overflow-hidden whitespace-nowrap">
           <span className="inline-block animate-marquee">{websiteConfig.headerSliderText}</span>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 py-4">
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
            <div className="flex items-center gap-2 cursor-pointer hover:text-green-600 dark:hover:text-green-400 transition">
              <div className="relative">
                <Heart size={24} />
                {wishlistCount !== undefined && wishlistCount > 0 && (
                   <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{wishlistCount}</span>
                )}
              </div>
              <span className="hidden sm:inline text-sm font-medium">Wishlist</span>
            </div>
            
            <div className="flex items-center gap-2 cursor-pointer hover:text-green-600 dark:hover:text-green-400 transition">
              <div className="relative">
                <ShoppingCart size={24} />
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">0</span>
              </div>
              <span className="hidden sm:inline text-sm font-medium">Cart</span>
            </div>
            
            <div className="relative" ref={menuRef}>
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
      
      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-4">
        <div className="relative">
          <input
             type="text"
             placeholder={websiteConfig?.searchHints || "Search product..."}
             className="w-full border border-green-500 rounded-lg py-2 px-3 focus:outline-none dark:bg-slate-800 dark:text-white dark:border-green-600"
          />
          <button className="absolute right-0 top-0 h-full bg-green-500 text-white px-3 rounded-r-lg">
            <Search size={18} />
          </button>
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
    </header>
  );
};

export const LoginModal: React.FC<{ 
  onClose: () => void, 
  onLogin: (email: string, pass: string) => boolean,
  onRegister: (data: UserType) => boolean 
}> = ({ onClose, onLogin, onRegister }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegister) {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      const success = onRegister({ 
        name: formData.name, 
        email: formData.email, 
        password: formData.password 
      });
      if (!success) setError("Email already registered");
    } else {
      const success = onLogin(formData.email, formData.password);
      if (!success) setError("Invalid email or password");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"><X size={24}/></button>
        
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {isRegister ? 'Join us to manage orders and checkout faster' : 'Please enter your details to sign in'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg mb-4 text-center border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition dark:bg-slate-700 dark:text-white"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition dark:bg-slate-700 dark:text-white"
                placeholder="mail@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input 
                type="password" 
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition dark:bg-slate-700 dark:text-white"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                <input 
                  type="password" 
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition dark:bg-slate-700 dark:text-white"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>
            )}

            <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition shadow-lg shadow-green-200 dark:shadow-none mt-2 transform active:scale-95">
              {isRegister ? 'Register' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <button 
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="text-green-600 dark:text-green-400 font-bold hover:underline"
            >
              {isRegister ? 'Login' : 'Register'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AddToCartSuccessModal: React.FC<{ product: Product, onClose: () => void, onCheckout: () => void }> = ({ product, onClose, onCheckout }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-green-500 p-4 text-white flex justify-between items-center">
           <h3 className="font-bold flex items-center gap-2">
             <CheckCircle size={20} /> Added to Cart
           </h3>
           <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full"><X size={20}/></button>
        </div>
        <div className="p-6">
           <div className="flex gap-4 items-center mb-6">
              <div className="w-16 h-16 bg-gray-50 dark:bg-slate-700 rounded border border-gray-200 dark:border-slate-600 p-1">
                 <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
              </div>
              <div className="flex-1">
                 <h4 className="font-bold text-gray-800 dark:text-white text-sm line-clamp-2">{product.name}</h4>
                 <p className="text-orange-500 font-bold mt-1">৳ {product.price.toLocaleString()}</p>
              </div>
           </div>
           
           <div className="space-y-3">
              <button onClick={onCheckout} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition">
                 Checkout Now <ArrowRight size={18} />
              </button>
              <button onClick={onClose} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-gray-300 py-3 rounded-lg font-bold transition">
                 Continue Shopping
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export const AIStudioModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [resultImage, setResultImage] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setResultImage(''); // Clear previous result
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile || !prompt.trim()) return;

    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = imagePreview.split(',')[1];
      const mimeType = selectedFile.type;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: `Edit this image: ${prompt}`,
            },
          ],
        },
      });

      let generatedImageBase64 = '';
      if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
             generatedImageBase64 = part.inlineData.data;
             const resultUrl = `data:image/png;base64,${generatedImageBase64}`;
             setResultImage(resultUrl);
             break;
          }
        }
      }
      
      if (!generatedImageBase64) {
          alert("Could not generate image. Please try a different prompt.");
      }

    } catch (error) {
      console.error("Error generating image:", error);
      alert("Something went wrong. Please check your API key and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-4 flex justify-between items-center text-white shrink-0">
          <h3 className="font-bold text-xl flex items-center gap-2">
            <Sparkles size={24} className="text-yellow-300"/> 
            AI Magic Studio
          </h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition"><X size={24}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
              <div className="flex flex-col gap-4">
                 <div className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                   <span className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                   Upload Image
                 </div>
                 
                 <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer transition relative overflow-hidden group dark:border-slate-600 ${imagePreview ? 'border-purple-300 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                 >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-2" />
                    ) : (
                      <div className="text-center text-gray-400 group-hover:text-purple-500 transition">
                         <Upload size={48} className="mx-auto mb-2" />
                         <p className="font-medium">Click to upload</p>
                         <p className="text-xs">JPG, PNG supported</p>
                      </div>
                    )}
                 </div>

                 <div className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mt-2">
                   <span className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                   Describe Changes
                 </div>
                 <textarea
                   className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none h-24"
                   placeholder="E.g., Change background to a beach at sunset, make it look cinematic..."
                   value={prompt}
                   onChange={(e) => setPrompt(e.target.value)}
                 ></textarea>

                 <button 
                    onClick={handleGenerate}
                    disabled={!selectedFile || !prompt || loading}
                    className={`py-3 rounded-lg font-bold text-white shadow-lg transition flex items-center justify-center gap-2 ${
                      !selectedFile || !prompt || loading 
                        ? 'bg-gray-300 dark:bg-slate-600 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-[1.02]'
                    }`}
                 >
                    {loading ? (
                      <>
                        <Loader2 size={20} className="animate-spin" /> Generating Magic...
                      </>
                    ) : (
                      <>
                        <Wand2 size={20} /> Generate
                      </>
                    )}
                 </button>
              </div>

              <div className="flex flex-col gap-4 border-l border-gray-100 dark:border-slate-700 md:pl-8">
                 <div className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                   <span className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
                   Result
                 </div>
                 
                 <div className="bg-gray-100 dark:bg-slate-700 rounded-xl flex-1 flex items-center justify-center min-h-[300px] border border-gray-200 dark:border-slate-600 relative overflow-hidden">
                    {loading && (
                      <div className="absolute inset-0 bg-black/10 flex flex-col items-center justify-center backdrop-blur-[1px] z-10">
                        <Loader2 size={48} className="text-purple-600 animate-spin mb-4" />
                        <p className="text-purple-800 dark:text-purple-300 font-bold animate-pulse">Processing Image...</p>
                      </div>
                    )}

                    {resultImage ? (
                      <img src={resultImage} alt="Generated Result" className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-center text-gray-400">
                        <ImageIcon size={64} className="mx-auto mb-3 opacity-50" />
                        <p>Your masterpiece will appear here</p>
                      </div>
                    )}
                 </div>
                 
                 {resultImage && (
                    <a 
                      href={resultImage} 
                      download="magic-edit.png"
                      className="text-center text-purple-600 dark:text-purple-400 font-bold hover:underline py-2"
                    >
                      Download Image
                    </a>
                 )}
              </div>

           </div>
        </div>
      </div>
    </div>
  );
};

export const TrackOrderModal: React.FC<{ onClose: () => void, orders?: Order[] }> = ({ onClose, orders = [] }) => {
  const [orderId, setOrderId] = useState('');
  const [result, setResult] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);

  const handleTrack = () => {
    if (!orderId.trim()) return;
    setSearched(true);
    // Find order in dynamic prop orders
    const order = orders.find(o => 
      o.id.toLowerCase() === orderId.toLowerCase() || 
      o.id.replace('#', '').toLowerCase() === orderId.toLowerCase()
    );
    setResult(order || null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-green-500 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg flex items-center gap-2"><Truck size={20}/> Track Your Order</h3>
          <button onClick={onClose} className="hover:bg-green-600 p-1 rounded transition"><X size={20}/></button>
        </div>
        <div className="p-6">
          <div className="flex gap-2 mb-6">
            <input 
              type="text" 
              placeholder="Enter Order ID (e.g. 0024)" 
              className="flex-1 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none dark:bg-slate-700 dark:text-white"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
            />
            <button onClick={handleTrack} className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-600 transition">
              Track
            </button>
          </div>

          {searched && (
            <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 border border-gray-100 dark:border-slate-600 animate-in slide-in-from-top-2">
              {result ? (
                <div className="space-y-4">
                   <div className="flex justify-between items-start border-b border-gray-200 dark:border-slate-600 pb-3">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Order ID</p>
                        <p className="font-bold text-gray-800 dark:text-white text-lg">{result.id}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        result.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                        result.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {result.status}
                      </span>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <p className="text-xs text-gray-500 dark:text-gray-400">Customer</p>
                       <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{result.customer}</p>
                     </div>
                     <div>
                       <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
                       <p className="text-sm font-medium text-gray-800 dark:text-gray-200">৳ {result.amount.toLocaleString()}</p>
                     </div>
                     <div className="col-span-2">
                       <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                       <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{result.date}</p>
                     </div>
                   </div>
                   
                   {result.status !== 'Delivered' && (
                     <div className="bg-white dark:bg-slate-600 p-3 rounded border border-gray-100 dark:border-slate-500 flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-full text-green-600">
                          <CheckCircle size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-700 dark:text-gray-200">Estimated Delivery</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">3-5 Business Days</p>
                        </div>
                     </div>
                   )}
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                  <div className="bg-red-50 dark:bg-red-900/20 text-red-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search size={24} />
                  </div>
                  <p className="font-bold text-gray-800 dark:text-white mb-1">Order not found</p>
                  <p className="text-sm">Please check your Order ID and try again.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const HeroSection: React.FC<{ carouselItems?: CarouselItem[] }> = ({ carouselItems }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Filter only published items and sort by serial
  const slides = carouselItems?.filter(i => i.status === 'Publish').sort((a, b) => (a.serial || 0) - (b.serial || 0)) || [];
  
  // Default mock slides if no data
  const displaySlides = slides.length > 0 ? slides : [
      { id: 'mock1', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1200', name: 'Premium Headphones', url: '#', serial: 1, status: 'Publish' },
      { id: 'mock2', image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=1200', name: 'Smart Gadgets', url: '#', serial: 2, status: 'Publish' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % displaySlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [displaySlides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % displaySlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + displaySlides.length) % displaySlides.length);

  return (
    <div className="relative w-full group">
       {/* Container for aspect ratio. Using a common banner ratio like 21:9 */}
       <div className="relative w-full overflow-hidden aspect-[16/9] md:aspect-[21/9] max-h-[500px] mx-auto md:max-w-7xl md:rounded-xl shadow-sm">
          {displaySlides.map((slide, index) => (
            <div 
              key={slide.id || index}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
               {/* Clickable Banner Image */}
               <a href={slide.url || '#'} className="block w-full h-full cursor-pointer">
                  <img 
                    src={slide.image} 
                    alt={slide.name} 
                    className="w-full h-full object-cover" 
                  />
               </a>
            </div>
          ))}
       </div>

       {/* Navigation Buttons - Style match: White circle, gray icon */}
       {displaySlides.length > 1 && (
        <>
          <button 
            onClick={(e) => { e.preventDefault(); prevSlide(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/90 text-gray-700 rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100 transform -translate-x-4 group-hover:translate-x-0"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); nextSlide(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/90 text-gray-700 rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Indicators */}
      {displaySlides.length > 1 && (
         <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
            {displaySlides.map((_, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-300 shadow-sm ${currentSlide === idx ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80 w-2'}`}
                />
            ))}
         </div>
      )}
    </div>
  );
};

export const CategoryCircle: React.FC<{ name: string; icon: React.ReactNode }> = ({ name, icon }) => (
  <div className="flex flex-col items-center gap-3 group cursor-pointer min-w-[80px]">
    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-gray-100 dark:border-slate-700 flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:border-green-500 group-hover:text-green-500 transition bg-white dark:bg-slate-800 shadow-sm group-hover:shadow-md">
      {icon}
    </div>
    <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-green-600">{name}</span>
  </div>
);

export const ProductCard: React.FC<{ product: Product, onClick?: (p: Product) => void, variant?: string }> = ({ product, onClick, variant = 'style1' }) => {
  
  // Style 2: Flash Sale (Pink/Blue Theme)
  if (variant === 'style2') {
     return (
        <div 
          className="bg-white rounded-xl border border-gray-100 hover:border-pink-200 overflow-hidden hover:shadow-xl transition-all duration-300 group relative flex flex-col h-full cursor-pointer"
          onClick={() => onClick && onClick(product)}
        >
           <div className="relative p-4 pb-0 h-48 flex items-center justify-center bg-white">
               <button className="absolute top-3 left-3 text-gray-300 hover:text-pink-500 transition z-10">
                   <Heart size={20} />
               </button>
               {product.discount && (
                   <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                       SALE
                   </span>
               )}
               <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain transform group-hover:scale-110 transition duration-500" />
           </div>
           
           <div className="p-4 flex flex-col flex-1">
               <div className="flex gap-1 mb-2">
                   {[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= (product.rating||0) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} />)}
                   <span className="text-xs text-gray-400 ml-1">({product.reviews})</span>
               </div>
               <h3 className="font-bold text-gray-800 text-sm line-clamp-2 mb-1 group-hover:text-pink-600 transition" title={product.name}>{product.name}</h3>
               <p className="text-xs text-gray-500 line-clamp-2 mb-3 h-8 overflow-hidden">{product.description || "Premium quality product."}</p>
               
               <div className="mt-auto">
                   <div className="flex items-center gap-2 mb-1">
                       <span className="text-pink-600 font-bold text-lg">৳ {product.price.toLocaleString()}</span>
                       {product.originalPrice && (
                           <span className="text-gray-400 text-xs line-through">৳ {product.originalPrice.toLocaleString()}</span>
                       )}
                   </div>
                   <div className="text-[10px] text-blue-500 font-bold mb-3">Get 50 Coins</div>
                   
                   <div className="flex gap-2">
                       <button className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-2 rounded text-xs font-bold transition shadow-md shadow-pink-200">
                           Buy Now
                       </button>
                       <button className="bg-blue-100 text-blue-600 hover:bg-blue-200 p-2 rounded transition">
                           <ShoppingCart size={18} />
                       </button>
                   </div>
               </div>
           </div>
        </div>
     );
  }

  // Style 3: Minimalist Bordered
  if (variant === 'style3') {
    return (
      <div 
        className="bg-white rounded border border-gray-200 p-2 hover:shadow-lg transition-all duration-300 group cursor-pointer h-full flex flex-col"
        onClick={() => onClick && onClick(product)}
      >
        <div className="relative h-40 bg-gray-50 mb-3 overflow-hidden rounded-sm">
          {product.discount && (
            <span className="absolute top-0 left-0 bg-black text-white text-[10px] font-bold px-2 py-1 z-10">
              {product.discount}
            </span>
          )}
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
          
          {/* Quick Actions Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-2 translate-y-full group-hover:translate-y-0 transition duration-300 flex justify-center gap-4">
             <button className="text-gray-600 hover:text-green-600"><Eye size={18} /></button>
             <button className="text-gray-600 hover:text-green-600"><Heart size={18} /></button>
          </div>
        </div>
        
        <div className="flex flex-col flex-1">
          <h3 className="text-sm text-gray-700 line-clamp-2 mb-1 group-hover:text-green-600 transition" title={product.name}>{product.name}</h3>
          <div className="mt-auto pt-2 flex justify-between items-center border-t border-gray-100">
             <span className="font-bold text-gray-900">৳{product.price.toLocaleString()}</span>
             <button className="text-green-600 hover:bg-green-50 p-1 rounded-full"><ShoppingCart size={18} /></button>
          </div>
        </div>
      </div>
    );
  }

  // Style 1: Default (Classic Green)
  return (
    <div 
      className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg p-3 hover:shadow-xl hover:border-green-400 hover:scale-[1.02] transition-all duration-300 group relative flex flex-col h-full cursor-pointer transform"
      onClick={() => onClick && onClick(product)}
    >
      {product.discount && (
        <span className="absolute top-3 left-3 bg-green-600 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-sm z-10 shadow-md">
          {product.discount}
        </span>
      )}
      <div className="relative h-40 md:h-48 mb-3 overflow-hidden rounded-md bg-gray-50 dark:bg-slate-700">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
      </div>
      <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100 line-clamp-2 mb-2 h-10 leading-snug group-hover:text-green-600 transition" title={product.name}>
        {product.name}
      </h3>
      <div className="flex items-center gap-2 mb-4 mt-auto">
        <span className="text-green-600 dark:text-green-400 font-bold text-lg">৳{product.price.toLocaleString()}</span>
        {product.originalPrice && (
          <span className="text-gray-400 text-xs line-through decoration-red-400">৳{product.originalPrice.toLocaleString()}</span>
        )}
      </div>
      <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded text-sm font-bold transition flex items-center justify-center gap-2 active:bg-green-700 shadow-sm hover:shadow">
        অর্ডার করুন
      </button>
    </div>
  );
};

export const SectionHeader: React.FC<{ title: string; linkText?: string }> = ({ title, linkText = "View All" }) => (
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">{title}</h2>
    <a href="#" className="text-xs md:text-sm text-gray-500 dark:text-gray-400 hover:text-green-600 flex items-center gap-1 transition">
      {linkText} <span>&rsaquo;</span>
    </a>
  </div>
);

export const StoreFooter: React.FC<{ websiteConfig?: WebsiteConfig }> = ({ websiteConfig }) => {
  const socialIcons: Record<string, React.ReactNode> = {
    'Facebook': <Facebook size={18} />,
    'Instagram': <Instagram size={18} />,
    'Twitter': <Twitter size={18} />,
    'YouTube': <Youtube size={18} />,
    'Daraz': <ShoppingBag size={18} />,
  };

  if (websiteConfig?.footerStyle === 'style2') {
    return (
      <footer className="bg-white border-t border-gray-100 font-sans">
        {/* Contact Bar */}
        <div className="bg-gray-50 border-b border-gray-100 py-6">
           <div className="container mx-auto px-4 flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm border border-gray-100">
                    <Mail size={18} />
                 </div>
                 <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Email Support</p>
                    <p className="text-sm font-medium text-gray-800">{websiteConfig.emails?.[0] || 'support@example.com'}</p>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm border border-gray-100">
                    <Phone size={18} />
                 </div>
                 <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Phone Support</p>
                    <p className="text-sm font-medium text-gray-800">{websiteConfig.phones?.[0] || '+880 1234 567 890'}</p>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm border border-gray-100">
                    <MapPin size={18} />
                 </div>
                 <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Location</p>
                    <p className="text-sm font-medium text-gray-800 line-clamp-1 max-w-[200px]">{websiteConfig.addresses?.[0] || 'Dhaka, Bangladesh'}</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Main Footer */}
        <div className="container mx-auto px-4 py-12">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
              <div className="flex flex-col items-center md:items-start">
                 <div className="flex flex-col leading-none mb-4">
                     <span className="text-2xl font-black text-blue-500 tracking-tight">COCO</span>
                     <span className="text-xl font-bold text-pink-500 tracking-widest -mt-1">KIDS</span>
                 </div>
                 <p className="text-sm font-medium text-gray-600 mb-6">Every Smile Matters</p>
                 <div className="flex gap-3">
                    <a href="#" className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition"><Facebook size={16}/></a>
                    <a href="#" className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center hover:bg-green-600 hover:text-white transition"><MessageCircle size={16}/></a> 
                    {/* Using MessageCircle as WhatsApp placeholder or import MessageCircle if available, using standard lucide icons */}
                 </div>
              </div>

              <div>
                 <h3 className="font-bold text-gray-800 mb-4 text-lg">Contact Us</h3>
                 <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-center gap-2 justify-center md:justify-start"><Mail size={16} className="text-blue-500"/> {websiteConfig.emails?.[0]}</li>
                    <li className="flex items-center gap-2 justify-center md:justify-start"><Phone size={16} className="text-blue-500"/> {websiteConfig.phones?.[0]}</li>
                    <li className="flex items-start gap-2 justify-center md:justify-start text-left"><MapPin size={16} className="text-blue-500 shrink-0 mt-0.5"/> {websiteConfig.addresses?.[0]}</li>
                 </ul>
              </div>

              <div>
                 <h3 className="font-bold text-gray-800 mb-4 text-lg">Quick Links</h3>
                 <ul className="space-y-2 text-sm text-gray-600">
                    <li><a href="#" className="hover:text-blue-600 transition">Return & Refund Policy</a></li>
                    <li><a href="#" className="hover:text-blue-600 transition">Privacy Policy</a></li>
                    <li><a href="#" className="hover:text-blue-600 transition">Terms and Conditions</a></li>
                    <li><a href="#" className="hover:text-blue-600 transition">About us</a></li>
                 </ul>
              </div>

              <div>
                 <h3 className="font-bold text-gray-800 mb-4 text-lg">Useful Links</h3>
                 <ul className="space-y-2 text-sm text-gray-600">
                    <li><a href="#" className="hover:text-blue-600 transition">Why Shop Online with Us</a></li>
                    <li><a href="#" className="hover:text-blue-600 transition">Online Payment Methods</a></li>
                    <li><a href="#" className="hover:text-blue-600 transition">After Sales Support</a></li>
                    <li><a href="#" className="hover:text-blue-600 transition">FAQ</a></li>
                 </ul>
              </div>
           </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-100 py-6 text-center text-sm text-gray-500">
           <p>© All Copyrights Reserved by {websiteConfig.brandingText || 'Cocokids'}</p>
        </div>

        {/* Floating Chat Button */}
        <button className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600 transition z-40 animate-bounce-slow">
           <MessageCircle size={28} />
        </button>
      </footer>
    );
  }

  // Default Footer
  return (
    <footer className="bg-white dark:bg-slate-900 pt-16 pb-8 border-t border-gray-200 dark:border-slate-800 mt-12 transition-colors duration-300">
      <div className="container mx-auto px-4">
        {!websiteConfig?.hideCopyright && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h1 className="text-2xl font-bold mb-4">
                {websiteConfig?.brandingText ? (
                  <span className="text-gray-800 dark:text-white">{websiteConfig.brandingText}</span>
                ) : (
                  <>
                    <span className="text-gray-800 dark:text-white">GADGET</span>
                    <span className="text-pink-500">SHOB</span>
                  </>
                )}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                {websiteConfig?.shortDescription || "Best Online shop in Bangladesh for authentic gadgets and electronics. Trusted by thousands."}
              </p>
              <div className="flex gap-4">
                {websiteConfig?.socialLinks.map(link => (
                  <a href={link.url} key={link.id} className="w-9 h-9 rounded-full bg-green-50 dark:bg-slate-800 text-green-600 dark:text-green-400 flex items-center justify-center cursor-pointer hover:bg-green-500 hover:text-white transition">
                    {socialIcons[link.platform] || <Globe size={18}/>}
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4 uppercase text-xs tracking-wider">Contact Us</h3>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                {websiteConfig?.emails.map((email, idx) => (
                  <li key={idx} className="flex items-center gap-2"><Mail size={14} className="text-green-500"/> {email}</li>
                ))}
                {websiteConfig?.phones.map((phone, idx) => (
                  <li key={idx} className="flex items-center gap-2"><Phone size={14} className="text-green-500"/> {phone}</li>
                ))}
                {websiteConfig?.addresses.map((addr, idx) => (
                   <li key={idx} className="flex items-center gap-2"><MapPin size={14} className="text-green-500"/> {addr}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4 uppercase text-xs tracking-wider">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-green-600 transition">Return & Refund Policy</a></li>
                <li><a href="#" className="hover:text-green-600 transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-green-600 transition">Terms and Conditions</a></li>
                <li><a href="#" className="hover:text-green-600 transition">About us</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4 uppercase text-xs tracking-wider">Useful Links</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-green-600 transition">Why Shop Online with Us</a></li>
                <li><a href="#" className="hover:text-green-600 transition">Online Payment Methods</a></li>
                <li><a href="#" className="hover:text-green-600 transition">After Sales Support</a></li>
                <li><a href="#" className="hover:text-green-600 transition">FAQ</a></li>
              </ul>
            </div>
          </div>
        )}
        
        {!websiteConfig?.hideCopyrightText && (
          <div className="text-center text-xs text-gray-400 border-t border-gray-100 dark:border-slate-800 pt-8">
            <p>Copyright © 2025 {websiteConfig?.brandingText || 'gadgetshob.com'}</p>
            {websiteConfig?.showPoweredBy && <p className="mt-1">Powered by Saleecom</p>}
          </div>
        )}
      </div>
    </footer>
  );
};

// Helper for Footer Style 2
import { MessageCircle } from 'lucide-react';
