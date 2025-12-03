import React from 'react';
import { StoreHeader, StoreFooter } from '../components/StoreComponents';
import { CheckCircle, ArrowRight, ShoppingBag } from 'lucide-react';

interface SuccessProps {
  onHome: () => void;
  user?: { name: string } | null;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
}

const StoreOrderSuccess = ({ onHome, user, onLoginClick, onLogoutClick }: SuccessProps) => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900 flex flex-col">
      <StoreHeader 
        onHomeClick={onHome}
        user={user}
        onLoginClick={onLoginClick}
        onLogoutClick={onLogoutClick}
      />
      
      <main className="flex-1 container mx-auto px-4 flex items-center justify-center py-12">
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border border-gray-200 max-w-lg w-full text-center animate-in fade-in zoom-in-95 duration-500">
           <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={48} className="text-green-600" />
           </div>
           
           <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
           <p className="text-gray-500 mb-8">Thank you for your purchase. Your order has been placed successfully and is being processed.</p>
           
           <div className="bg-gray-50 rounded-lg p-4 mb-8 text-left border border-gray-100">
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
                className="bg-white border border-gray-200 text-gray-600 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition"
              >
                 Download Invoice
              </button>
           </div>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
};

export default StoreOrderSuccess;