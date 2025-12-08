
import React, { useState, useEffect } from 'react';
import { Product, User, WebsiteConfig, ProductVariantSelection, DeliveryConfig } from '../types';
import { StoreHeader, StoreFooter } from '../components/StoreComponents';
import { ArrowLeft, Banknote, MapPin, Mail, Phone, User as UserIcon, X } from 'lucide-react';
import { formatCurrency } from '../utils/format';

interface CheckoutProps {
  product: Product;
  quantity: number;
  variant: ProductVariantSelection;
  onBack: () => void;
  onConfirmOrder: (formData: any) => void;
  user?: User | null;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  onProfileClick?: () => void;
  logo?: string | null;
  websiteConfig?: WebsiteConfig;
  deliveryConfigs?: DeliveryConfig[];
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onOpenChat?: () => void;
}

const StoreCheckout = ({ 
  product, 
  quantity, 
  variant,
  onBack, 
  onConfirmOrder,
  user,
  onLoginClick,
  onLogoutClick,
  onProfileClick,
  logo,
  websiteConfig,
  deliveryConfigs,
  searchValue,
  onSearchChange,
  onOpenChat
}: CheckoutProps) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    division: '',
    email: '',
    address: ''
  });
  const [selectedDeliveryType, setSelectedDeliveryType] = useState<'Regular' | 'Express' | 'Free'>('Regular');

  useEffect(() => {
    if (deliveryConfigs && deliveryConfigs.length) {
      const firstEnabled = deliveryConfigs.find(c => c.isEnabled) || deliveryConfigs[0];
      if (firstEnabled) {
        setSelectedDeliveryType(firstEnabled.type);
      }
    }
  }, [deliveryConfigs]);

  // Pre-fill if user is logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.name,
        email: prev.email || user.email,
        phone: prev.phone || user.phone || '',
        address: prev.address || user.address || ''
      }));
    }
  }, [user]);

  const subTotal = product.price * quantity;
  const discount = product.originalPrice ? (product.originalPrice - product.price) * quantity : 0;
  const activeConfig = deliveryConfigs?.find(c => c.type === selectedDeliveryType) || (deliveryConfigs && deliveryConfigs[0]);
  const computedDeliveryCharge = React.useMemo(() => {
    if (!activeConfig || !activeConfig.isEnabled) return 0;
    if (activeConfig.freeThreshold > 0 && subTotal >= activeConfig.freeThreshold) return 0;
    const division = formData.division || activeConfig.division;
    const isInside = division ? division === activeConfig.division : true;
    return isInside ? activeConfig.insideCharge : activeConfig.outsideCharge;
  }, [activeConfig, formData.division, subTotal]);
  const grandTotal = subTotal + computedDeliveryCharge;
  const formattedProductPrice = formatCurrency(product.price);
  const formattedProductOriginalPrice = formatCurrency(product.originalPrice, null);

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
      quantity,
      variant,
      deliveryType: selectedDeliveryType,
      deliveryCharge: computedDeliveryCharge
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900">
      <StoreHeader 
        onHomeClick={onBack}
        user={user}
        onLoginClick={onLoginClick}
        onLogoutClick={onLogoutClick}
        onProfileClick={onProfileClick}
        logo={logo}
        websiteConfig={websiteConfig}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Delivery & Payment */}
          <div className="flex-1 space-y-8">
            {deliveryConfigs && deliveryConfigs.length > 0 && (
              <div className="store-card p-6 rounded-xl">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Delivery Options</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {deliveryConfigs.map(config => (
                    <button
                      key={config.type}
                      type="button"
                      onClick={() => setSelectedDeliveryType(config.type)}
                      className={`border rounded-xl p-4 text-left transition ${
                        selectedDeliveryType === config.type ? 'border-green-500 bg-green-50 shadow-lg' : 'border-gray-200 bg-white'
                      } ${!config.isEnabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      disabled={!config.isEnabled}
                    >
                      <p className="font-bold text-gray-800 mb-1">{config.type} Delivery</p>
                      <p className="text-sm text-gray-500">Inside: ৳ {config.insideCharge}</p>
                      <p className="text-sm text-gray-500">Outside: ৳ {config.outsideCharge}</p>
                      {config.freeThreshold > 0 && (
                        <p className="text-xs text-green-600 mt-2">Free over ৳ {config.freeThreshold}</p>
                      )}
                    </button>
                  ))}
                </div>
                {activeConfig && (
                  <p className="text-xs text-gray-500 mt-3">{activeConfig.note}</p>
                )}
              </div>
            )}
            {/* Delivery Address */}
            <div className="store-card p-6 rounded-xl">
              <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Delivery Address</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 text-gray-400" size={18} />
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
                  <div className="border border-white/60 bg-white/70 rounded-lg p-4 flex flex-col items-center justify-center cursor-not-allowed opacity-50 h-32 shadow-inner">
                     <span className="font-bold text-gray-400">Online Payment</span>
                     <span className="text-xs text-gray-400">(Coming Soon)</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-96">
             <div className="store-card p-6 rounded-xl sticky top-24">
                <h2 className="text-lg font-bold text-gray-800 mb-6">Order Items ({quantity} Items)</h2>
                
                {/* Item Row */}
                 <div className="flex gap-3 mb-6 relative group">
                   <div className="w-16 h-16 bg-gray-50 rounded border border-gray-200 p-1 flex-shrink-0">
                      <img src={product.galleryImages?.[0] || product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                   </div>
                   <div className="flex-1">
                      <div className="flex justify-between items-start">
                         <h3 className="text-sm font-bold text-gray-800 line-clamp-2 pr-4">{product.name}</h3>
                         <button className="text-gray-400 hover:text-red-500"><X size={16} /></button>
                      </div>
                     <p className="text-xs text-gray-500 mt-1">Variant: <span className="font-semibold text-gray-700">{variant.color} / {variant.size}</span></p>
                      <div className="flex items-center gap-3 mt-2">
                         <div className="flex items-center border border-gray-200 rounded px-2 py-0.5 text-xs bg-gray-50">
                            <span className="px-2">{quantity}</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <span className="font-bold text-gray-800">৳ {formattedProductPrice}</span>
                           {formattedProductOriginalPrice && (
                             <span className="text-xs text-gray-400 line-through">৳ {formattedProductOriginalPrice}</span>
                           )}
                         </div>
                      </div>
                   </div>
                </div>

                 {/* Variant & Totals */}
                 <div className="space-y-3 border-t border-gray-100 pt-4 text-sm">
                   <div className="flex justify-between text-gray-600">
                     <span>Selected Variant:</span>
                     <span className="font-medium text-gray-800">{variant.color} / {variant.size}</span>
                   </div>
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
                     <span>Delivery Charge ({selectedDeliveryType}):</span>
                     <span className="font-medium">৳ {computedDeliveryCharge}</span>
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
                     className="btn-order px-6 py-3 text-sm flex items-center justify-center"
                   >
                     Confirm Order
                   </button>
                </div>

             </div>
          </div>

        </div>
      </main>

      <StoreFooter websiteConfig={websiteConfig} logo={logo} onOpenChat={onOpenChat} />
    </div>
  );
};

export default StoreCheckout;
