
import React, { useState, useEffect, useMemo } from 'react';
import { Product, User, WebsiteConfig, Order, ProductVariantSelection } from '../types';
import { StoreHeader, StoreFooter, TrackOrderModal, AIStudioModal, AddToCartSuccessModal, MobileBottomNav } from '../components/StoreComponents';
import { Heart, Star, ShoppingCart, ShoppingBag, Smartphone, Watch, BatteryCharging, Headphones, Zap, Bluetooth, Gamepad2, Camera, ArrowLeft, Share2, AlertCircle, ZoomIn, X } from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '../constants';
import { formatCurrency } from '../utils/format';
import { LazyImage } from '../utils/performanceOptimization';
import { SkeletonCard } from '../components/SkeletonLoaders';

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

type MatchType = 'compatible' | 'complementary' | 'behavioral';

interface RelatedProductMatch {
  product: Product;
  matchType: MatchType;
  reason: string;
  stockCount: number;
  score: number;
}

const MATCH_PRIORITY: Record<MatchType, number> = {
  compatible: 3,
  complementary: 2,
  behavioral: 1,
};

const MATCH_BADGE: Record<MatchType, { label: string; className: string }> = {
  compatible: { label: 'Compatible', className: 'bg-emerald-50 text-emerald-700 border border-emerald-100' },
  complementary: { label: 'Complements', className: 'bg-sky-50 text-sky-700 border border-sky-100' },
  behavioral: { label: 'Trending', className: 'bg-gray-50 text-gray-600 border border-gray-100' },
};

const COMPLEMENTARY_CATEGORY_MAP: Record<string, string[]> = {
  Phones: ['Charger', 'Power Bank', 'Audio', 'Earbuds'],
  Watches: ['Charger', 'Audio', 'Phones'],
  Audio: ['Phones', 'Power Bank', 'Gaming'],
  Gaming: ['Audio', 'Accessories', 'Phones'],
  Charger: ['Phones', 'Power Bank', 'Audio'],
  'Power Bank': ['Phones', 'Audio', 'Watches'],
};

const capitalize = (value?: string) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : '');

const getProductBrandToken = (name?: string) => (name ? name.split(' ')[0].toLowerCase() : '');

const getProductStockCount = (product: Product) => {
  if (product.variantStock?.length) {
    return product.variantStock.reduce((total, variant) => total + (variant.stock || 0), 0);
  }
  return product.stock ?? 0;
};

const buildBehavioralReason = (tags?: string[]) => {
  if (tags?.length) {
    return `Customers eyeing ${tags[0]} accessories often grab this too.`;
  }
  return 'Frequently bought after viewing this item.';
};

const selectRelatedProducts = (current: Product, catalog: Product[]): RelatedProductMatch[] => {
  const baseBrand = getProductBrandToken(current.name);
  const baseCategory = current.category || '';
  const baseTags = [...(current.tags || []), ...(current.searchTags || [])];
  const complementCategories = COMPLEMENTARY_CATEGORY_MAP[baseCategory] || [];

  const candidates = catalog.filter(
    (candidate) => candidate.id !== current.id && candidate.tenantId === current.tenantId
  );

  const scored: RelatedProductMatch[] = candidates.map((candidate) => {
    const candidateBrand = getProductBrandToken(candidate.name);
    const sameBrand = baseBrand && candidateBrand && baseBrand === candidateBrand;
    const sameCategory = baseCategory && candidate.category === baseCategory;
    const isComplement = complementCategories.includes(candidate.category || '');
    const candidateAllTags = [...(candidate.tags || []), ...(candidate.searchTags || [])];
    const tagOverlap = baseTags.filter((tag) => candidateAllTags.includes(tag)).length;
    const stockCount = getProductStockCount(candidate);
    const inStock = stockCount > 0;

    let matchType: MatchType = 'behavioral';
    let reason = buildBehavioralReason(candidate.tags);
    let score = (candidate.rating || 0) * 6 + (candidate.reviews || 0) * 0.08;

    if (sameBrand) {
      matchType = 'compatible';
      score += 60;
      reason = `Complete your ${capitalize(baseBrand)} ecosystem.`;
    } else if (sameCategory) {
      matchType = 'compatible';
      score += 40;
      reason = `Explore more top-rated ${(candidate.category || 'tech').toLowerCase()} gear.`;
    } else if (isComplement) {
      matchType = 'complementary';
      score += 45;
      const formattedCategory = candidate.category || 'Accessory';
      const baseLabel = baseCategory ? baseCategory.toLowerCase() : 'setup';
      reason = `${capitalize(formattedCategory)} that pairs with your ${baseLabel}.`;
    }

    if (tagOverlap > 0) {
      score += tagOverlap * 8;
      if (matchType === 'behavioral') {
        reason = `Shoppers interested in ${baseTags.slice(0, 2).join(', ')} also add this.`;
      }
    }

    if (inStock) {
      score += Math.min(stockCount, 80) * 0.4;
    } else {
      score -= 200;
    }

    return { product: candidate, matchType, reason, stockCount, score };
  });

  const sortByPriority = (a: RelatedProductMatch, b: RelatedProductMatch) => {
    if (MATCH_PRIORITY[b.matchType] !== MATCH_PRIORITY[a.matchType]) {
      return MATCH_PRIORITY[b.matchType] - MATCH_PRIORITY[a.matchType];
    }
    if (b.score === a.score) {
      return b.stockCount - a.stockCount;
    }
    return b.score - a.score;
  };

  const compatibilityFirst = scored.filter((item) => item.matchType !== 'behavioral').sort(sortByPriority);
  const behavioralFallback = scored.filter((item) => item.matchType === 'behavioral').sort(sortByPriority);
  const combined = [...compatibilityFirst, ...behavioralFallback];
  return combined.slice(0, 6);
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
  onAddToCart?: (p: Product, quantity: number, variant: ProductVariantSelection) => void;
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

const StoreProductDetail = ({ 
  product, 
  orders,
  onBack, 
  onProductClick, 
  wishlistCount, 
  isWishlisted, 
  onToggleWishlist,
  onCheckout,
  onAddToCart,
  user,
  onLoginClick,
  onLogoutClick,
  onProfileClick,
  logo,
  websiteConfig,
  searchValue,
  onSearchChange,
  onImageSearchClick,
  onOpenChat,
  cart,
  onToggleCart,
  onCheckoutFromCart,
  productCatalog
}: StoreProductDetailProps) => {
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [isAIStudioOpen, setIsAIStudioOpen] = useState(false);
  const [showCartSuccess, setShowCartSuccess] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial data loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, [product.id]);
  const galleryImages = product.galleryImages && product.galleryImages.length ? product.galleryImages : [product.image];
  const [selectedImage, setSelectedImage] = useState(galleryImages[0]);
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
  const shareBase = typeof window !== 'undefined' ? window.location.origin : 'https://mydomain.com';
  const shareUrl = `${shareBase}/${product.slug || `product-${product.id}`}`;

  useEffect(() => {
    const refreshGallery = product.galleryImages && product.galleryImages.length ? product.galleryImages : [product.image];
    setSelectedImage(refreshGallery[0]);
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

  const additionalImages = galleryImages;

  const catalogProducts = useMemo(() => (Array.isArray(productCatalog) && productCatalog.length ? productCatalog : PRODUCTS), [productCatalog]);

  const relatedProducts = useMemo(() => selectRelatedProducts(product, catalogProducts), [product, catalogProducts]);

  const currentVariant: ProductVariantSelection = useMemo(() => ({
    color: selectedColor || fallbackColor,
    size: selectedSize || fallbackSize,
  }), [selectedColor, selectedSize, fallbackColor, fallbackSize]);

  const variantStockEntry = product.variantStock?.find(v => v.color === currentVariant.color && v.size === currentVariant.size);
  const availableStock = variantStockEntry?.stock ?? product.stock ?? Infinity;
  const isOutOfStock = !Number.isFinite(availableStock) ? false : availableStock <= 0;
  const atStockLimit = Number.isFinite(availableStock) && quantity >= (availableStock as number);

  const formattedPrice = formatCurrency(product.price);
  const formattedOriginalPrice = formatCurrency(product.originalPrice, null);

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
    onAddToCart?.(product, quantity, currentVariant);
    setLastAddedVariant(currentVariant);
    setShowCartSuccess(true);
  };

  const handleBuyNow = () => {
    if (!validateVariant()) return;
    onCheckout(product, quantity, currentVariant);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleShareLink = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url: shareUrl });
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        alert('Product link copied to clipboard');
        return;
      }
      window.prompt('Copy this product link', shareUrl);
    } catch (error) {
      console.warn('Share cancelled', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 font-sans text-slate-900 pb-20 md:pb-0">
      <StoreHeader 
        onTrackOrder={() => setIsTrackOrderOpen(true)} 
        onOpenAIStudio={() => setIsAIStudioOpen(true)}
        onHomeClick={onBack}
        onImageSearchClick={onImageSearchClick}
        wishlistCount={wishlistCount}
        cart={cart}
        onToggleCart={onToggleCart}
        onCheckoutFromCart={onCheckoutFromCart}
        productCatalog={catalogProducts}
        user={user}
        onLoginClick={onLoginClick}
        onLogoutClick={onLogoutClick}
        onProfileClick={onProfileClick}
        logo={logo}
        websiteConfig={websiteConfig}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        onProductClick={onProductClick}
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

      {/* Image Zoom Modal */}
      {isZoomOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl max-h-[90vh]">
            <button
              onClick={() => setIsZoomOpen(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition p-2"
              aria-label="Close zoom"
            >
              <X size={28} />
            </button>
            
            <div className="w-full h-full max-h-[90vh] overflow-auto bg-black rounded-lg">
              <div className="relative w-full bg-black flex items-center justify-center min-h-[90vh]">
                <img 
                  src={selectedImage} 
                  alt={product.name}
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>

            {/* Thumbnail Gallery in Zoom Modal */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {additionalImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`flex-shrink-0 w-12 h-12 rounded border-2 p-0.5 transition-all ${
                    selectedImage === img
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-600 hover:border-orange-400'
                  }`}
                  aria-label={`View image ${idx + 1}`}
                >
                  <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Content: Product Details */}
          <div className="flex-1">
            {/* Product Hero Block */}
            <div className="store-card rounded-xl p-6 flex flex-col md:flex-row gap-8">
              
              {/* Image Section */}
              <div className="w-full md:w-1/2 flex flex-col gap-4">
                 <div className="flex flex-col md:flex-row gap-4 md:gap-3 h-full">
                    {/* Thumbnail Gallery - Left Side */}
                    <div className="flex md:flex-col gap-2 md:gap-3 order-2 md:order-1 md:w-20">
                      {additionalImages.length > 0 && additionalImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage(img)}
                          className={`flex-shrink-0 w-16 h-16 md:w-full md:h-20 rounded-lg border-2 p-1 transition-all overflow-hidden hover:border-orange-400 ${
                            selectedImage === img
                              ? 'border-orange-500 bg-orange-50 shadow-md'
                              : 'border-gray-200 shadow-sm hover:shadow'
                          }`}
                          aria-label={`View image ${idx + 1}`}
                          aria-pressed={selectedImage === img}
                          title={`View image ${idx + 1}`}
                        >
                          <LazyImage src={img} alt={`View ${idx + 1}`} className="w-full h-full object-contain mix-blend-multiply" />
                        </button>
                      ))}
                    </div>

                    {/* Main Product Image - Right Side */}
                    <div className="flex-1 order-1 md:order-2">
                      <div
                        className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden relative group border border-gray-100 shadow-sm hover:shadow-lg transition-shadow cursor-zoom-in"
                        onMouseMove={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = ((e.clientX - rect.left) / rect.width) * 100;
                          const y = ((e.clientY - rect.top) / rect.height) * 100;
                          setZoomPosition({ x, y });
                        }}
                        onClick={() => setIsZoomOpen(true)}
                      >
                        <LazyImage
                          src={selectedImage}
                          alt={product.name}
                          className="w-full h-full object-contain p-4 mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                        />
                        {/* Zoom Icon */}
                        <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm text-gray-700 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                          <ZoomIn size={20} />
                        </div>
                        {product.discount && (
                          <span className="absolute top-4 left-4 bg-gradient-to-r from-green-400 to-emerald-500 text-red-600 text-xs font-bold px-3 py-1 rounded-full shadow-md">
                            {product.discount}
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleWishlist();
                          }}
                          className={`absolute top-4 right-4 p-2 rounded-full transition-all ${
                            isWishlisted
                              ? 'bg-rose-100 text-rose-600 shadow-md'
                              : 'bg-white text-gray-600 shadow hover:bg-rose-50'
                          }`}
                          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                          <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                        </button>
                      </div>
                    </div>
                 </div>
              </div>

              {/* Info Section */}
              <div className="w-full md:w-1/2 flex flex-col">
                 <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h1>
                 
                 <div className="mb-4">
                   <StarRating rating={product.rating || 0} count={product.reviews} />
                 </div>

                  <div className="flex items-end gap-3 mb-6">
                    <span className="text-4xl font-bold text-orange-500">৳ {formattedPrice}</span>
                    {formattedOriginalPrice && (
                      <span className="text-lg text-gray-400 line-through mb-1">৳ {formattedOriginalPrice}</span>
                    )}
                 </div>

                   <div className="flex flex-wrap items-center gap-3 mb-6">
                    <button
                      type="button"
                      onClick={handleShareLink}
                      className="inline-flex items-center gap-2 rounded-full bg-[#0064d1] hover:bg-[#0055b2] text-white text-sm font-semibold px-4 py-2 shadow-sm"
                    >
                        <Share2 size={16} /> Share now
                     </button>
                     <span className="text-xs text-gray-500 break-all">
                       
                     </span>
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

                    <div className="space-y-4">
                      {showColorSelector ? (
                        <div>
                          <label className="block text-sm font-bold text-gray-800 mb-3">
                            Color
                            <span className="text-xs font-normal text-gray-500 ml-2">
                              {selectedColor}
                            </span>
                          </label>
                          <div className="flex flex-wrap gap-3">
                            {colorOptions.map(color => (
                              <button
                                key={color}
                                onClick={() => setSelectedColor(color)}
                                aria-pressed={selectedColor === color}
                                className={`px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all transform ${
                                  selectedColor === color 
                                    ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-md scale-105' 
                                    : 'border-gray-200 text-gray-600 hover:border-orange-300 hover:shadow'
                                }`}
                              >
                                {color}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">Color: {fallbackColor}</p>
                      )}

                      {showSizeSelector ? (
                        <div>
                          <label className="block text-sm font-bold text-gray-800 mb-3">
                            Size
                            <span className="text-xs font-normal text-gray-500 ml-2">
                              {selectedSize}
                            </span>
                          </label>
                          <div className="flex flex-wrap gap-3">
                            {sizeOptions.map(size => (
                              <button
                                key={size}
                                onClick={() => setSelectedSize(size)}
                                aria-pressed={selectedSize === size}
                                className={`px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all transform ${
                                  selectedSize === size 
                                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md scale-105' 
                                    : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:shadow'
                                }`}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">Size: {fallbackSize}</p>
                      )}
                    </div>

                    {variantError && (
                      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-2">
                        <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                        <span>{variantError}</span>
                      </div>
                    )}
                 </div>

                 {/* Desktop Buttons */}
                 <div className="hidden md:flex gap-3 mb-8">
                    <button 
                      onClick={handleAddToCart}
                      disabled={isOutOfStock}
                      className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition transform active:scale-95 ${isOutOfStock ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 'btn-cart'}`}
                    >
                       <ShoppingCart size={20} /> Add to cart
                    </button>
                    <button 
                      onClick={handleBuyNow}
                      disabled={isOutOfStock}
                      className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition transform active:scale-95 ${isOutOfStock ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 'btn-order'}`}
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
            <div className="mt-8 store-card rounded-xl overflow-hidden border border-gray-100">
              <div className="flex border-b border-gray-100 bg-gray-50/50">
                  <button 
                    onClick={() => setActiveTab('description')}
                    className={`flex-1 px-6 py-4 font-bold text-sm transition ${
                      activeTab === 'description' 
                        ? 'text-orange-600 border-b-2 border-orange-500 bg-white' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                    aria-selected={activeTab === 'description'}
                    role="tab"
                  >
                    Description
                  </button>
                  <button 
                    onClick={() => setActiveTab('reviews')}
                    className={`flex-1 px-6 py-4 font-bold text-sm transition ${
                      activeTab === 'reviews' 
                        ? 'text-orange-600 border-b-2 border-orange-500 bg-white' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                    aria-selected={activeTab === 'reviews'}
                    role="tab"
                  >
                    Reviews
                    <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 text-xs font-bold text-orange-700">
                      {product.reviews || 0}
                    </span>
                  </button>
               </div>
               <div className="p-8 min-h-[200px]">
                  {activeTab === 'description' ? (
                    <div className="text-gray-600 leading-relaxed space-y-4">
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: product.description || "No description available for this product." 
                        }}
                      />
                      <p className="text-sm italic text-gray-500">Experience premium quality with our latest collection. This product features state-of-the-art technology, ergonomic design for comfort, and durable materials that last. Perfect for daily use or special occasions.</p>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      {product.reviews && product.reviews > 0 ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-center gap-2">
                            <div className="flex text-yellow-400">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} size={28} fill="currentColor" />
                              ))}
                            </div>
                          </div>
                          <p className="text-2xl font-bold text-gray-800">{product.rating || 4.5}/5</p>
                          <p className="text-gray-600">Based on {product.reviews} customer reviews</p>
                          <button className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition">
                            Write a Review
                          </button>
                        </div>
                      ) : (
                        <div className="py-8 space-y-3">
                          <Star size={48} className="mx-auto text-gray-300" />
                          <p className="text-gray-500 font-medium">No reviews yet</p>
                          <p className="text-gray-400 text-sm">Be the first to review this product and help others make informed decisions.</p>
                          <button className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition">
                            Write a Review
                          </button>
                        </div>
                      )}
                    </div>
                  )}
               </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <aside className="w-full lg:w-80 space-y-8">
            
            {/* Related Products Widget */}
            <div className="store-card rounded-xl p-5">
               <h3 className="font-bold text-lg text-gray-800 mb-4 pb-2 border-b border-gray-100">Related Products</h3>
               <div className="space-y-4">
                  {isLoading ? (
                    [...Array(3)].map((_, i) => <div key={`skeleton-${i}`} className="h-20 bg-gray-100 rounded animate-pulse" />)
                  ) : (
                  relatedProducts.map(({ product: related, matchType, reason, stockCount }) => (
                    <div 
                      key={related.id} 
                      onClick={() => onProductClick(related)}
                      className="flex gap-3 group cursor-pointer"
                    >
                       <div className="w-16 h-16 bg-gray-50 rounded border border-gray-100 overflow-hidden flex-shrink-0">
                          <LazyImage src={related.image} alt={related.name} className="w-full h-full object-cover" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-orange-500 transition">
                              {related.name}
                            </h4>
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${MATCH_BADGE[matchType].className}`}>
                              {MATCH_BADGE[matchType].label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{reason}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-orange-500 font-bold text-sm">৳ {formatCurrency(related.price)}</span>
                            <div className="text-[11px] text-gray-500">
                              {stockCount > 0 ? `${stockCount} in stock` : 'Restocking soon'}
                            </div>
                          </div>
                       </div>
                    </div>
                  ))
                  )}
               </div>
            </div>

            {/* Category Widget */}
            <div className="store-card rounded-xl p-5">
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
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 md:hidden z-50 flex items-center gap-3 shadow-[0_-6px_25px_rgba(15,23,42,0.08)]">
        <button
          onClick={onBack}
          className="h-12 w-12 flex items-center justify-center rounded-xl text-gray-600 border border-slate-200 bg-white shadow-sm"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 grid grid-cols-2 gap-3">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`h-12 rounded-xl text-base font-semibold flex items-center justify-center gap-2 transition ${
              isOutOfStock
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-sky-500 text-white shadow-lg shadow-sky-200 active:scale-95'
            }`}
          >
            <ShoppingCart size={20} />
            <span>Add to cart</span>
          </button>
          <button
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className={`h-12 rounded-xl text-base font-semibold flex items-center justify-center gap-2 transition ${
              isOutOfStock
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-[#F3356B] text-white shadow-lg shadow-pink-200 active:scale-95'
            }`}
          >
            <ShoppingBag size={20} />
            <span>Buy Now</span>
          </button>
        </div>
      </div>

      <div className="hidden md:block">
        <StoreFooter websiteConfig={websiteConfig} logo={logo} onOpenChat={onOpenChat} />
      </div>
    </div>
  );
};

export default StoreProductDetail;
