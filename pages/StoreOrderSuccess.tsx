
import React from 'react';
import { StoreHeader, StoreFooter } from '../components/StoreComponents';
import { CheckCircle, ArrowRight, ShoppingBag } from 'lucide-react';
import { User, WebsiteConfig, Product } from '../types';

interface SuccessProps {
  onHome: () => void;
  user?: User | null;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  onProfileClick?: () => void;
  logo?: string | null;
  websiteConfig?: WebsiteConfig;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onImageSearchClick?: () => void;
  onOpenChat?: () => void;
  cart?: number[];
  onToggleCart?: (id: number) => void;
  onCheckoutFromCart?: (productId: number) => void;
  productCatalog?: Product[];
}

const StoreOrderSuccess = ({ onHome, user, onLoginClick, onLogoutClick, onProfileClick, logo, websiteConfig, searchValue, onSearchChange, onImageSearchClick, onOpenChat, cart, onToggleCart, onCheckoutFromCart, productCatalog }: SuccessProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-orange-50 font-sans text-slate-900 flex flex-col">
      <StoreHeader 
        onHomeClick={onHome}
        onImageSearchClick={onImageSearchClick}
        user={user}
        onLoginClick={onLoginClick}
        onLogoutClick={onLogoutClick}
        onProfileClick={onProfileClick}
        logo={logo}
        websiteConfig={websiteConfig}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        cart={cart}
        onToggleCart={onToggleCart}
        onCheckoutFromCart={onCheckoutFromCart}
        productCatalog={productCatalog}
      />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 flex items-center justify-center py-12">
        <div className="store-card rounded-2xl p-8 md:p-12 max-w-lg w-full text-center animate-in fade-in zoom-in-95 duration-500">
           <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={48} className="text-green-600" />
           </div>
           
           <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
           <p className="text-gray-500 mb-8">Thank you for your purchase. Your order has been placed successfully and is being processed.</p>
           
           <div className="bg-white/70 rounded-lg p-4 mb-8 text-left border border-white/60 shadow-inner">
             <div className="flex justify-between items-center mb-2">
               <span className="text-sm text-gray-500">Order Status</span>
               <span className="text-sm font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded">Pending</span>
             </div>
             <p className="text-xs text-gray-400">You can track your order status in the "Track Order" section.</p>
           </div>

           <div className="flex flex-col gap-3">
              <button 
                onClick={onHome}
                className="bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-green-200"
              >
                 <ShoppingBag size={20} /> Continue Shopping
              </button>
              <button 
                onClick={() => window.print()}
                className="btn-outline py-3.5 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                 Download Invoice
              </button>
           </div>
        </div>
      </main>

      <StoreFooter websiteConfig={websiteConfig} logo={logo} onOpenChat={onOpenChat} />
    </div>
  );
};

export default StoreOrderSuccess;
