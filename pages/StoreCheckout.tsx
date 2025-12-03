import React, { useState } from 'react';
import { Product } from '../types';
import { StoreHeader, StoreFooter } from '../components/StoreComponents';
import { ArrowLeft, Banknote, MapPin, Mail, Phone, User, X } from 'lucide-react';

interface CheckoutProps {
  product: Product;
  quantity: number;
  onBack: () => void;
  onConfirmOrder: (formData: any) => void;
}

const StoreCheckout = ({ product, quantity, onBack, onConfirmOrder }: CheckoutProps) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    division: '',
    email: '',
    address: ''
  });

  const subTotal = product.price * quantity;
  const discount = product.originalPrice ? (product.originalPrice - product.price) * quantity : 0;
  const deliveryCharge = 0; // Free delivery logic for now
  const grandTotal = subTotal + deliveryCharge;

  const handleSubmit = () => {
    // Basic validation
    if (!formData.fullName || !formData.phone || !formData.address) {
      alert('Please fill in all required fields (*)');
      return;
    }
    
    onConfirmOrder({
      ...formData,
      amount: grandTotal,
      productName: product.name,
      quantity
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900">
      <StoreHeader onHomeClick={onBack} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Delivery & Payment */}
          <div className="flex-1 space-y-8">
            {/* Delivery Address */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Delivery Address</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Full Name*" 
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={formData.fullName}
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Enter Your Phone Number*" 
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="email" 
                    placeholder="Enter Your Email*" 
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="relative">
                   <select 
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-600 bg-white"
                      value={formData.division}
                      onChange={e => setFormData({...formData, division: e.target.value})}
                   >
                     <option value="">Select Division</option>
                     <option value="Dhaka">Dhaka</option>
                     <option value="Chittagong">Chittagong</option>
                     <option value="Sylhet">Sylhet</option>
                     <option value="Khulna">Khulna</option>
                     <option value="Rajshahi">Rajshahi</option>
                     <option value="Barisal">Barisal</option>
                     <option value="Rangpur">Rangpur</option>
                     <option value="Mymensingh">Mymensingh</option>
                   </select>
                </div>
              </div>

              <div className="relative mb-2">
                 <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                 <textarea 
                    placeholder="Full Address*" 
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[100px] resize-none"
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                 ></textarea>
              </div>
            </div>

            {/* Payment Option */}
            <div>
               <h2 className="text-xl font-bold text-gray-800 mb-4">Select a Payment Option</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border-2 border-green-500 bg-green-50 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer relative shadow-sm h-32">
                     <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-0.5">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                     </div>
                     <Banknote size={48} className="text-green-600 mb-2" />
                     <span className="font-bold text-gray-800">Cash on Delivery</span>
                  </div>
                  {/* Placeholder for other payment methods */}
                  <div className="border border-gray-200 bg-white rounded-lg p-4 flex flex-col items-center justify-center cursor-not-allowed opacity-50 h-32">
                     <span className="font-bold text-gray-400">Online Payment</span>
                     <span className="text-xs text-gray-400">(Coming Soon)</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-96">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-24">
                <h2 className="text-lg font-bold text-gray-800 mb-6">Order Items ({quantity} Items)</h2>
                
                {/* Item Row */}
                <div className="flex gap-3 mb-6 relative group">
                   <div className="w-16 h-16 bg-gray-50 rounded border border-gray-200 p-1 flex-shrink-0">
                      <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                   </div>
                   <div className="flex-1">
                      <div className="flex justify-between items-start">
                         <h3 className="text-sm font-bold text-gray-800 line-clamp-2 pr-4">{product.name}</h3>
                         <button className="text-gray-400 hover:text-red-500"><X size={16} /></button>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                         <div className="flex items-center border border-gray-200 rounded px-2 py-0.5 text-xs bg-gray-50">
                            <span className="px-2">{quantity}</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <span className="font-bold text-gray-800">৳ {product.price.toLocaleString()}</span>
                           {product.originalPrice && (
                             <span className="text-xs text-gray-400 line-through">৳ {product.originalPrice.toLocaleString()}</span>
                           )}
                         </div>
                      </div>
                   </div>
                </div>

                {/* Totals */}
                <div className="space-y-3 border-t border-gray-100 pt-4 text-sm">
                   <div className="flex justify-between text-gray-600">
                      <span>Sub Total:</span>
                      <span className="font-medium">৳ {subTotal.toLocaleString()}</span>
                   </div>
                   {discount > 0 && (
                      <div className="flex justify-between text-gray-600">
                         <span>Discount:</span>
                         <span className="font-medium text-red-500">-৳ {discount.toLocaleString()}</span>
                      </div>
                   )}
                   <div className="flex justify-between text-gray-600">
                      <span>Delivery Charge:</span>
                      <span className="font-medium">৳ {deliveryCharge}</span>
                   </div>
                   <div className="flex justify-between text-gray-800 text-lg font-bold border-t border-dashed border-gray-200 pt-3 mt-2">
                      <span>GrandTotal:</span>
                      <span>৳ {grandTotal.toLocaleString()}</span>
                   </div>
                </div>

                {/* Coupon */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                   <p className="text-xs text-gray-500 mb-2">Do have any coupon code?</p>
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center justify-between gap-4">
                   <button 
                     onClick={onBack}
                     className="text-gray-600 font-medium hover:text-gray-900 flex items-center gap-1 text-sm"
                   >
                     <ArrowLeft size={16} /> Back to Cart
                   </button>
                   <button 
                     onClick={handleSubmit}
                     className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-orange-200 transition transform active:scale-95 text-sm"
                   >
                     Confirm Order
                   </button>
                </div>

             </div>
          </div>

        </div>
      </main>

      <StoreFooter />
    </div>
  );
};

export default StoreCheckout;
