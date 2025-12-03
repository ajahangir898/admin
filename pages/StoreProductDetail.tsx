import React, { useState } from 'react';
import { Product } from '../types';
import { StoreHeader, StoreFooter, TrackOrderModal, AIStudioModal } from '../components/StoreComponents';
import { Heart, Star, ShoppingCart, ShoppingBag, Smartphone, Watch, BatteryCharging, Headphones, Zap, Bluetooth, Gamepad2, Camera } from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '../constants';

// Helper for stars
const StarRating = ({ rating, count }: { rating: number, count?: number }) => (
  <div className="flex items-center gap-1">
    <div className="flex text-yellow-400">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={14} fill={s <= rating ? "currentColor" : "none"} className={s <= rating ? "text-yellow-400" : "text-gray-300"} />
      ))}
    </div>
    {count !== undefined && <span className="text-xs text-gray-400">({count} reviews)</span>}
  </div>
);

const iconMap: Record<string, React.ReactNode> = {
  smartphone: <Smartphone size={20} strokeWidth={1.5} />,
  watch: <Watch size={20} strokeWidth={1.5} />,
  'battery-charging': <BatteryCharging size={20} strokeWidth={1.5} />,
  headphones: <Headphones size={20} strokeWidth={1.5} />,
  zap: <Zap size={20} strokeWidth={1.5} />,
  bluetooth: <Bluetooth size={20} strokeWidth={1.5} />,
  'gamepad-2': <Gamepad2 size={20} strokeWidth={1.5} />,
  camera: <Camera size={20} strokeWidth={1.5} />,
};

const StoreProductDetail = ({ product, onBack, onProductClick }: { product: Product, onBack: () => void, onProductClick: (p: Product) => void }) => {
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [isAIStudioOpen, setIsAIStudioOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');

  const relatedProducts = PRODUCTS.filter(p => p.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <StoreHeader 
        onTrackOrder={() => setIsTrackOrderOpen(true)} 
        onOpenAIStudio={() => setIsAIStudioOpen(true)}
        onHomeClick={onBack}
      />
      
      {isTrackOrderOpen && <TrackOrderModal onClose={() => setIsTrackOrderOpen(false)} />}
      {isAIStudioOpen && <AIStudioModal onClose={() => setIsAIStudioOpen(false)} />}

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Content: Product Details */}
          <div className="flex-1">
            {/* Product Hero Block */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col md:flex-row gap-8 shadow-sm">
              
              {/* Image Section */}
              <div className="w-full md:w-1/2 relative">
                 <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden relative group">
                    <img src={product.image} alt={product.name} className="w-full h-full object-contain p-4 mix-blend-multiply" />
                    {product.discount && (
                      <span className="absolute top-4 left-4 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                        {product.discount}
                      </span>
                    )}
                    <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md text-gray-400 hover:text-pink-500 transition">
                      <Heart size={20} />
                    </button>
                 </div>
              </div>

              {/* Info Section */}
              <div className="w-full md:w-1/2 flex flex-col">
                 <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h1>
                 
                 <div className="mb-4">
                   <StarRating rating={product.rating || 0} count={product.reviews} />
                 </div>

                 <div className="flex items-end gap-3 mb-6">
                    <span className="text-4xl font-bold text-orange-500">৳ {product.price.toLocaleString()}</span>
                    {product.originalPrice && (
                      <span className="text-lg text-gray-400 line-through mb-1">৳ {product.originalPrice.toLocaleString()}</span>
                    )}
                 </div>

                 <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center border border-orange-200 rounded-lg">
                       <button 
                         onClick={() => setQuantity(Math.max(1, quantity - 1))}
                         className="px-4 py-2 text-orange-500 hover:bg-orange-50 font-bold transition"
                       >-</button>
                       <span className="px-4 py-2 font-bold text-gray-700 w-12 text-center">{quantity}</span>
                       <button 
                         onClick={() => setQuantity(quantity + 1)}
                         className="px-4 py-2 text-orange-500 hover:bg-orange-50 font-bold transition"
                       >+</button>
                    </div>
                 </div>

                 <div className="flex gap-3 mb-8">
                    <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-bold shadow-lg shadow-orange-200 flex items-center justify-center gap-2 transition transform active:scale-95">
                       <ShoppingCart size={20} /> Add to cart
                    </button>
                    <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-bold shadow-lg shadow-green-200 flex items-center justify-center gap-2 transition transform active:scale-95">
                       <ShoppingBag size={20} /> Buy Now
                    </button>
                 </div>

                 <div className="space-y-2 text-sm text-gray-600 border-t border-gray-100 pt-4 mt-auto">
                    <p><span className="font-semibold text-gray-800 w-24 inline-block">Category:</span> <span className="text-orange-500">{product.category || 'Electronics'}</span></p>
                    {product.tags && (
                      <p><span className="font-semibold text-gray-800 w-24 inline-block">Tags:</span> {product.tags.join(', ')}</p>
                    )}
                 </div>
              </div>
            </div>

            {/* Tabs Section */}
            <div className="mt-8 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
               <div className="flex border-b border-gray-200">
                  <button 
                    onClick={() => setActiveTab('description')}
                    className={`px-8 py-4 font-bold text-sm transition ${activeTab === 'description' ? 'text-orange-500 border-b-2 border-orange-500 bg-orange-50' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                    Description
                  </button>
                  <button 
                    onClick={() => setActiveTab('reviews')}
                    className={`px-8 py-4 font-bold text-sm transition ${activeTab === 'reviews' ? 'text-orange-500 border-b-2 border-orange-500 bg-orange-50' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                    Reviews({product.reviews || 0})
                  </button>
               </div>
               <div className="p-8 min-h-[200px] text-gray-600 leading-relaxed">
                  {activeTab === 'description' ? (
                    <div>
                      <p className="mb-4">{product.description || "No description available for this product."}</p>
                      <p>Experience premium quality with our latest collection. This product features state-of-the-art technology, ergonomic design for comfort, and durable materials that last. Perfect for daily use or special occasions.</p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Star size={48} className="mx-auto mb-3 opacity-20" />
                      <p>No reviews yet. Be the first to review!</p>
                    </div>
                  )}
               </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <aside className="w-full lg:w-80 space-y-8">
            
            {/* Related Products Widget */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
               <h3 className="font-bold text-lg text-gray-800 mb-4 pb-2 border-b border-gray-100">Related Products</h3>
               <div className="space-y-4">
                  {relatedProducts.map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => onProductClick(p)}
                      className="flex gap-3 group cursor-pointer"
                    >
                       <div className="w-16 h-16 bg-gray-50 rounded border border-gray-100 overflow-hidden">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                       </div>
                       <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-orange-500 transition mb-1">{p.name}</h4>
                          <div className="flex items-center justify-between">
                            <span className="text-orange-500 font-bold text-sm">৳ {p.price}</span>
                            <StarRating rating={4} />
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Category Widget */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
               <h3 className="font-bold text-lg text-gray-800 mb-4 pb-2 border-b border-gray-100">Category</h3>
               <div className="space-y-2">
                 {CATEGORIES.slice(0, 6).map((cat, idx) => (
                   <div key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded transition cursor-pointer group">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-orange-100 group-hover:text-orange-500 transition">
                        {iconMap[cat.icon]}
                      </div>
                      <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">{cat.name}</span>
                   </div>
                 ))}
               </div>
            </div>

          </aside>

        </div>
      </main>
      <StoreFooter />
    </div>
  );
};

export default StoreProductDetail;