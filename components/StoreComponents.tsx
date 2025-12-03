import React, { useState } from 'react';
import { ShoppingCart, Search, User, Facebook, Instagram, Twitter, Truck, X, CheckCircle } from 'lucide-react';
import { Product } from '../types';
import { RECENT_ORDERS } from '../constants';

export const StoreHeader = ({ onTrackOrder }: { onTrackOrder?: () => void }) => {
  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center cursor-pointer">
            <h1 className="text-2xl font-bold tracking-tighter">
              <span className="text-gray-800">GADGET</span>
              <span className="text-pink-500">SHOB</span>
            </h1>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl relative">
            <input
              type="text"
              placeholder="Search product..."
              className="w-full border-2 border-green-500 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-green-200"
            />
            <button className="absolute right-0 top-0 h-full bg-green-500 text-white px-6 rounded-r-full hover:bg-green-600 transition flex items-center justify-center">
              <Search size={20} />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-6 text-gray-600">
            <div className="flex items-center gap-2 cursor-pointer hover:text-green-600 transition">
              <div className="relative">
                <ShoppingCart size={24} />
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">0</span>
              </div>
              <span className="hidden sm:inline text-sm font-medium">Cart</span>
            </div>
            <div className="flex items-center gap-2 cursor-pointer hover:text-green-600 transition">
              <User size={24} />
              <span className="hidden sm:inline text-sm font-medium">Login/Register</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-4">
        <div className="relative">
          <input
             type="text"
             placeholder="Search product..."
             className="w-full border border-green-500 rounded-lg py-2 px-3 focus:outline-none"
          />
          <button className="absolute right-0 top-0 h-full bg-green-500 text-white px-3 rounded-r-lg">
            <Search size={18} />
          </button>
        </div>
      </div>
      
      {/* Navigation Bar */}
      <div className="border-t border-gray-100 hidden md:block">
        <div className="container mx-auto px-4">
          <nav className="flex gap-8 py-3 text-sm font-medium text-gray-700">
             <a href="#" className="hover:text-green-500 transition">Home</a>
             <a href="#" className="hover:text-green-500 transition">Products</a>
             <button onClick={onTrackOrder} className="hover:text-green-500 transition">Track Order</button>
             <a href="#" className="hover:text-green-500 transition">Wishlist</a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export const TrackOrderModal = ({ onClose }: { onClose: () => void }) => {
  const [orderId, setOrderId] = useState('');
  const [result, setResult] = useState<typeof RECENT_ORDERS[0] | null>(null);
  const [searched, setSearched] = useState(false);

  const handleTrack = () => {
    if (!orderId.trim()) return;
    setSearched(true);
    // Simulate finding order from mock data (insensitive case and handle optional '#')
    const order = RECENT_ORDERS.find(o => 
      o.id.toLowerCase() === orderId.toLowerCase() || 
      o.id.replace('#', '').toLowerCase() === orderId.toLowerCase()
    );
    setResult(order || null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-green-500 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg flex items-center gap-2"><Truck size={20}/> Track Your Order</h3>
          <button onClick={onClose} className="hover:bg-green-600 p-1 rounded transition"><X size={20}/></button>
        </div>
        <div className="p-6">
          <div className="flex gap-2 mb-6">
            <input 
              type="text" 
              placeholder="Enter Order ID (e.g. 0024)" 
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
            />
            <button onClick={handleTrack} className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-600 transition">
              Track
            </button>
          </div>

          {searched && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 animate-in slide-in-from-top-2">
              {result ? (
                <div className="space-y-4">
                   <div className="flex justify-between items-start border-b border-gray-200 pb-3">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Order ID</p>
                        <p className="font-bold text-gray-800 text-lg">{result.id}</p>
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
                       <p className="text-xs text-gray-500">Customer</p>
                       <p className="text-sm font-medium text-gray-800">{result.customer}</p>
                     </div>
                     <div>
                       <p className="text-xs text-gray-500">Amount</p>
                       <p className="text-sm font-medium text-gray-800">৳ {result.amount.toLocaleString()}</p>
                     </div>
                     <div className="col-span-2">
                       <p className="text-xs text-gray-500">Date</p>
                       <p className="text-sm font-medium text-gray-800">{result.date}</p>
                     </div>
                   </div>
                   
                   {result.status !== 'Delivered' && (
                     <div className="bg-white p-3 rounded border border-gray-100 flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-full text-green-600">
                          <CheckCircle size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-700">Estimated Delivery</p>
                          <p className="text-xs text-gray-500">3-5 Business Days</p>
                        </div>
                     </div>
                   )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <div className="bg-red-50 text-red-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search size={24} />
                  </div>
                  <p className="font-bold text-gray-800 mb-1">Order not found</p>
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

export const HeroSection = () => {
  return (
    <div className="bg-gradient-to-r from-pink-500 to-purple-600 h-64 md:h-[400px] w-full relative overflow-hidden text-white">
      <div className="container mx-auto h-full flex items-center px-4 relative z-10">
        <div className="max-w-lg animate-fade-in-up pt-8 md:pt-0">
          <span className="bg-white/20 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider mb-3 inline-block">Best Electronics</span>
          <h2 className="text-4xl md:text-7xl font-bold mb-4 leading-tight">50% OFF</h2>
          <p className="text-lg md:text-xl mb-8 opacity-90 max-w-sm">On all wireless headphones this weekend only. Don't miss out!</p>
          <button className="bg-white text-purple-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition shadow-lg transform hover:scale-105 active:scale-95">
            SHOP NOW
          </button>
        </div>
        {/* Abstract decorative elements */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-50px] left-[-50px] w-40 h-40 bg-yellow-400/20 rounded-full blur-2xl"></div>
      </div>
       {/* Mock Product Image in Hero */}
       <img 
         src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800" 
         alt="Hero Product" 
         className="absolute right-[5%] bottom-[-10%] h-[120%] object-contain hidden md:block drop-shadow-2xl transform -rotate-12 hover:rotate-0 transition duration-700" 
       />
    </div>
  );
};

export const CategoryCircle = ({ name, icon }: { name: string; icon: React.ReactNode }) => (
  <div className="flex flex-col items-center gap-3 group cursor-pointer min-w-[80px]">
    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-gray-100 flex items-center justify-center text-gray-500 group-hover:border-green-500 group-hover:text-green-500 transition bg-white shadow-sm group-hover:shadow-md">
      {icon}
    </div>
    <span className="text-xs md:text-sm font-medium text-gray-700 group-hover:text-green-600">{name}</span>
  </div>
);

export const ProductCard = ({ product }: { product: Product }) => {
  return (
    <div className="bg-white border border-gray-100 rounded-lg p-3 hover:shadow-xl transition duration-300 group relative flex flex-col h-full">
      {product.discount && (
        <span className="absolute top-3 left-3 bg-purple-600 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-sm z-10 shadow-md">
          {product.discount}
        </span>
      )}
      <div className="relative h-40 md:h-48 mb-3 overflow-hidden rounded-md bg-gray-50">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
      </div>
      <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 h-10 leading-snug" title={product.name}>
        {product.name}
      </h3>
      <div className="flex items-center gap-2 mb-4 mt-auto">
        <span className="text-green-600 font-bold text-lg">৳{product.price.toLocaleString()}</span>
        {product.originalPrice && (
          <span className="text-gray-400 text-xs line-through decoration-red-400">৳{product.originalPrice.toLocaleString()}</span>
        )}
      </div>
      <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded text-sm font-bold transition flex items-center justify-center gap-2 active:bg-green-700">
        অর্ডার করুন
      </button>
    </div>
  );
};

export const SectionHeader = ({ title, linkText = "View All" }: { title: string; linkText?: string }) => (
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-lg md:text-2xl font-bold text-gray-800">{title}</h2>
    <a href="#" className="text-xs md:text-sm text-gray-500 hover:text-green-600 flex items-center gap-1 transition">
      {linkText} <span>&rsaquo;</span>
    </a>
  </div>
);

export const StoreFooter = () => (
  <footer className="bg-white pt-16 pb-8 border-t border-gray-200 mt-12">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div>
          <h1 className="text-2xl font-bold mb-4">
            <span className="text-gray-800">GADGET</span>
            <span className="text-pink-500">SHOB</span>
          </h1>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Best Online shop in Bangladesh for authentic gadgets and electronics. Trusted by thousands.
          </p>
          <div className="flex gap-4">
            <div className="w-9 h-9 rounded-full bg-green-50 text-green-600 flex items-center justify-center cursor-pointer hover:bg-green-500 hover:text-white transition"><Facebook size={18} /></div>
            <div className="w-9 h-9 rounded-full bg-green-50 text-green-600 flex items-center justify-center cursor-pointer hover:bg-green-500 hover:text-white transition"><Instagram size={18} /></div>
            <div className="w-9 h-9 rounded-full bg-green-50 text-green-600 flex items-center justify-center cursor-pointer hover:bg-green-500 hover:text-white transition"><Twitter size={18} /></div>
          </div>
        </div>
        
        <div>
          <h3 className="font-bold text-gray-800 mb-4 uppercase text-xs tracking-wider">Contact Us</h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> mail@gmail.com</li>
            <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> +8801700000000</li>
            <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> Mirpur 10, Dhaka</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-gray-800 mb-4 uppercase text-xs tracking-wider">Quick Links</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><a href="#" className="hover:text-green-600 transition">Return & Refund Policy</a></li>
            <li><a href="#" className="hover:text-green-600 transition">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-green-600 transition">Terms and Conditions</a></li>
            <li><a href="#" className="hover:text-green-600 transition">About us</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-gray-800 mb-4 uppercase text-xs tracking-wider">Useful Links</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><a href="#" className="hover:text-green-600 transition">Why Shop Online with Us</a></li>
            <li><a href="#" className="hover:text-green-600 transition">Online Payment Methods</a></li>
            <li><a href="#" className="hover:text-green-600 transition">After Sales Support</a></li>
            <li><a href="#" className="hover:text-green-600 transition">FAQ</a></li>
          </ul>
        </div>
      </div>
      <div className="text-center text-xs text-gray-400 border-t border-gray-100 pt-8">
        <p>Copyright © 2025 gadgetshob.com</p>
      </div>
    </div>
  </footer>
);