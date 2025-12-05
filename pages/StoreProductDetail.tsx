
import React, { useState, useEffect, useMemo } from 'react';
import { Product, User, WebsiteConfig, Order, ProductVariantSelection } from '../types';
import { StoreHeader, StoreFooter, TrackOrderModal, AIStudioModal, AddToCartSuccessModal, MobileBottomNav } from '../components/StoreComponents';
import { Heart, Star, ShoppingCart, ShoppingBag, Smartphone, Watch, BatteryCharging, Headphones, Zap, Bluetooth, Gamepad2, Camera, ArrowLeft } from 'lucide-react';
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

interface StoreProductDetailProps {
  product: Product;
  orders?: Order[];
  onBack: () => void;
  onProductClick: (p: Product) => void;
  wishlistCount: number;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
  onCheckout: (p: Product, quantity: number, variant: ProductVariantSelection) => void;
  user?: User | null;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  onProfileClick?: () => void;
  logo?: string | null;
  websiteConfig?: WebsiteConfig;
}

const StoreProductDetail = ({ 
  product, 
  orders,
  onBack, 
  onProductClick, 
  wishlistCount, 
  isWishlisted, 
  onToggleWishlist,
  onCheckout,
  user,
  onLoginClick,
  onLogoutClick,
  onProfileClick,
  logo,
  websiteConfig
}: StoreProductDetailProps) => {
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [isAIStudioOpen, setIsAIStudioOpen] = useState(false);
  const [showCartSuccess, setShowCartSuccess] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  const [selectedImage, setSelectedImage] = useState(product.image);
  const fallbackColor = product.variantDefaults?.color || 'Default';
  const fallbackSize = product.variantDefaults?.size || 'Standard';
  const colorOptions = product.colors && product.colors.length ? product.colors : [fallbackColor];
  const sizeOptions = product.sizes && product.sizes.length ? product.sizes : [fallbackSize];
  const showColorSelector = (product.colors?.length || 0) > 0;
  const showSizeSelector = (product.sizes?.length || 0) > 0;
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [selectedSize, setSelectedSize] = useState(sizeOptions[0]);
  const [variantError, setVariantError] = useState<string | null>(null);
  const [lastAddedVariant, setLastAddedVariant] = useState<ProductVariantSelection | null>(null);

  useEffect(() => {
    setSelectedImage(product.image);
    setSelectedColor(colorOptions[0]);
    setSelectedSize(sizeOptions[0]);
    setQuantity(1);
    setVariantError(null);
  }, [product.id]);

  useEffect(() => {
    if (variantError) {
      setVariantError(null);
    }
  }, [selectedColor, selectedSize, quantity, variantError]);

  // Mock additional images based on the main image for demo purposes
  const additionalImages = [
    product.image,
    `${product.image}&w=401`, // Hack to get a "different" image from Unsplash for demo
    `${product.image}&w=402`,
    `${product.image}&w=403`,
  ];

  const relatedProducts = PRODUCTS.filter(p => p.id !== product.id).slice(0, 4);

  const currentVariant: ProductVariantSelection = useMemo(() => ({
    color: selectedColor || fallbackColor,
    size: selectedSize || fallbackSize,
  }), [selectedColor, selectedSize, fallbackColor, fallbackSize]);

  const variantStockEntry = product.variantStock?.find(v => v.color === currentVariant.color && v.size === currentVariant.size);
  const availableStock = variantStockEntry?.stock ?? product.stock ?? Infinity;
  const isOutOfStock = !Number.isFinite(availableStock) ? false : availableStock <= 0;
  const atStockLimit = Number.isFinite(availableStock) && quantity >= (availableStock as number);

  const decreaseQuantity = () => setQuantity(prev => Math.max(1, prev - 1));
  const increaseQuantity = () => {
    if (!Number.isFinite(availableStock) || quantity < (availableStock as number)) {
      setQuantity(prev => prev + 1);
    }
  };

  const validateVariant = () => {
    if ((showColorSelector && !selectedColor) || (showSizeSelector && !selectedSize)) {
      setVariantError('Please choose a color and size option.');
      return false;
    }
    if (isOutOfStock) {
      setVariantError('Selected variant is currently out of stock.');
      return false;
    }
    if (Number.isFinite(availableStock) && quantity > (availableStock as number)) {
      setVariantError('Reduce quantity to match available stock.');
      return false;
    }
    setVariantError(null);
    return true;
  };

  const handleAddToCart = () => {
    if (!validateVariant()) return;
    setLastAddedVariant(currentVariant);
    setShowCartSuccess(true);
  };

  const handleBuyNow = () => {
    if (!validateVariant()) return;
    onCheckout(product, quantity, currentVariant);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-20 md:pb-0">
      <StoreHeader 
        onTrackOrder={() => setIsTrackOrderOpen(true)} 
        onOpenAIStudio={() => setIsAIStudioOpen(true)}
        onHomeClick={onBack}
        wishlistCount={wishlistCount}
        user={user}
        onLoginClick={onLoginClick}
        onLogoutClick={onLogoutClick}
        onProfileClick={onProfileClick}
        logo={logo}
        websiteConfig={websiteConfig}
      />
      
      {isTrackOrderOpen && <TrackOrderModal onClose={() => setIsTrackOrderOpen(false)} orders={orders} />}
      {isAIStudioOpen && <AIStudioModal onClose={() => setIsAIStudioOpen(false)} />}
      {showCartSuccess && (
        <AddToCartSuccessModal 
          product={product} 
          variant={lastAddedVariant || currentVariant}
          quantity={quantity}
          onClose={() => setShowCartSuccess(false)} 
          onCheckout={() => onCheckout(product, quantity, lastAddedVariant || currentVariant)} 
        />
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Content: Product Details */}
          <div className="flex-1">
            {/* Product Hero Block */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col md:flex-row gap-8 shadow-sm">
              
              {/* Image Section */}
              <div className="w-full md:w-1/2 flex flex-col gap-4">
                 <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden relative group border border-gray-100">
                    <img src={selectedImage} alt={product.name} className="w-full h-full object-contain p-4 mix-blend-multiply" />
                    {product.discount && (
                      <span className="absolute top-4 left-4 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                        {product.discount}
                      </span>
                    )}
                    <button 
                      onClick={onToggleWishlist}
                      className={`absolute top-4 right-4 p-2 rounded-full shadow-md transition ${isWishlisted ? 'bg-pink-50 text-pink-500' : 'bg-white text-gray-400 hover:text-pink-500'}`}
                    >
                      <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                    </button>
                 </div>
                 {/* Thumbnail Gallery */}
                 <div className="flex gap-2 overflow-x-auto pb-2">
                   {additionalImages.map((img, idx) => (
                     <div 
                       key={idx} 
                       className={`w-16 h-16 rounded-md border-2 cursor-pointer p-1 transition ${
                         selectedImage === img ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
                       }`}
                       onClick={() => setSelectedImage(img)}
                     >
                       <img src={img} alt={`View ${idx}`} className="w-full h-full object-contain mix-blend-multiply" />
                     </div>
                   ))}
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

                 <div className="space-y-5 mb-6">
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Quantity</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-orange-200 rounded-lg">
                           <button 
                             onClick={decreaseQuantity}
                             className="px-4 py-2 text-orange-500 hover:bg-orange-50 font-bold transition"
                           >-</button>
                           <span className="px-4 py-2 font-bold text-gray-700 w-12 text-center">{quantity}</span>
                           <button 
                             onClick={increaseQuantity}
                             className={`px-4 py-2 font-bold transition ${atStockLimit ? 'text-gray-400 cursor-not-allowed' : 'text-orange-500 hover:bg-orange-50'}`}
                             disabled={atStockLimit}
                           >+</button>
                        </div>
                        {Number.isFinite(availableStock) && (
                          <span className={`text-xs font-medium ${isOutOfStock ? 'text-red-500' : 'text-gray-500'}`}>
                            {isOutOfStock ? 'Out of stock' : `${availableStock} pcs available`}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {showColorSelector ? (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">Color</p>
                          <div className="flex flex-wrap gap-2">
                            {colorOptions.map(color => (
                              <button
                                key={color}
                                onClick={() => setSelectedColor(color)}
                                className={`px-3 py-1.5 rounded-full border text-sm font-medium transition ${selectedColor === color ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-600 hover:border-orange-200'}`}
                              >
                                {color}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">Color: {fallbackColor}</p>
                      )}

                      {showSizeSelector ? (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">Size</p>
                          <div className="flex flex-wrap gap-2">
                            {sizeOptions.map(size => (
                              <button
                                key={size}
                                onClick={() => setSelectedSize(size)}
                                className={`px-3 py-1.5 rounded border text-sm font-medium transition ${selectedSize === size ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-200'}`}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">Size: {fallbackSize}</p>
                      )}
                    </div>

                    {variantError && (
                      <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-md px-3 py-2">{variantError}</p>
                    )}
                 </div>

                 {/* Desktop Buttons */}
                 <div className="hidden md:flex gap-3 mb-8">
                    <button 
                      onClick={handleAddToCart}
                      disabled={isOutOfStock}
                      className={`flex-1 py-3 rounded-lg font-bold shadow-lg shadow-orange-200 flex items-center justify-center gap-2 transition transform active:scale-95 ${isOutOfStock ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
                    >
                       <ShoppingCart size={20} /> Add to cart
                    </button>
                    <button 
                      onClick={handleBuyNow}
                      disabled={isOutOfStock}
                      className={`flex-1 py-3 rounded-lg font-bold shadow-lg shadow-green-200 flex items-center justify-center gap-2 transition transform active:scale-95 ${isOutOfStock ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                    >
                       <ShoppingBag size={20} /> Buy Now
                    </button>
                 </div>

                 <div className="text-xs text-gray-500 mb-4">
                    Selected: <span className="font-semibold text-gray-700">{currentVariant.color} / {currentVariant.size}</span>
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
      
      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 md:hidden z-50 flex gap-3 shadow-lg">
         <button onClick={onBack} className="p-3 bg-gray-100 rounded-lg text-gray-600">
            <ArrowLeft size={24} />
         </button>
         <button 
            onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`flex-1 rounded-lg flex flex-col items-center justify-center leading-none ${isOutOfStock ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-orange-500 text-white font-bold'}`}
         >
            <span className="text-xs font-normal">Add to</span>
            <span>Cart</span>
         </button>
         <button 
          onClick={handleBuyNow}
          disabled={isOutOfStock}
          className={`flex-1 rounded-lg flex flex-col items-center justify-center leading-none ${isOutOfStock ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white font-bold'}`}
         >
            <span className="text-xs font-normal">Buy</span>
            <span>Now</span>
         </button>
      </div>

      <div className="hidden md:block">
        <StoreFooter websiteConfig={websiteConfig} logo={logo} />
      </div>
    </div>
  );
};

export default StoreProductDetail;
