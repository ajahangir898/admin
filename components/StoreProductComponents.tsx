import React, { useState, useEffect } from 'react';
import { ShoppingCart, Heart, Star, Truck, Sparkles, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product, CarouselItem, WebsiteConfig } from '../types';
import { formatCurrency } from '../utils/format';
import { LazyImage } from '../utils/performanceOptimization';
import { normalizeImageUrl } from '../utils/imageUrlHelper';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
  variant?: string;
  onQuickView?: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

const getImage = (p: Product) => normalizeImageUrl(p.galleryImages?.[0] || p.image);

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, variant, onQuickView, onBuyNow, onAddToCart }) => {
  const handleBuyNow = (e?: React.MouseEvent) => { e?.stopPropagation(); onBuyNow ? onBuyNow(product) : onClick(product); };
  const handleCart = (e: React.MouseEvent) => { e.stopPropagation(); onAddToCart?.(product); };

  // Style 1 - Clean Card
  if (variant === 'style1') return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group overflow-hidden flex flex-col">
      {product.discount && <span className="absolute top-3 left-3 z-10 bg-theme-secondary text-white text-xs font-bold px-2 py-1 rounded-md">{product.discount}</span>}
      <div className="relative aspect-square p-4 bg-gray-50 cursor-pointer overflow-hidden" onClick={() => onClick(product)}>
        <LazyImage src={getImage(product)} alt={product.name} className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" />
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 cursor-pointer hover:text-theme-primary transition" onClick={() => onClick(product)}>{product.name}</h3>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900">৳{product.price}</span>
          {product.originalPrice && <span className="text-sm text-gray-400 line-through">৳{product.originalPrice}</span>}
        </div>
        <div className="flex gap-2 mt-auto">
          <button className="flex-1 bg-gray-200 text-gray-700 text-xs font-semibold py-2 rounded-md hover:bg-gray-300 transition flex items-center justify-center gap-1" onClick={handleCart}>
            <ShoppingCart size={17} /> Cart
          </button>
          <button className="flex-1 py-3 rounded-lg font-bold btn-order" onClick={handleBuyNow}>Buy Now</button>
        </div>
      </div>
    </div>
  );

  // Style 2 - Flash Sale
  if (variant === 'style2') return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition group overflow-hidden flex flex-col">
      <div className="relative aspect-square p-2 bg-gray-50 cursor-pointer" onClick={() => onClick(product)}>
        <LazyImage src={getImage(product)} alt={product.name} className="w-full h-full object-contain mix-blend-multiply transition duration-500 group-hover:scale-105" />
        {product.discount && <span className="absolute top-1.5 left-1.5 bg-secondary-500 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded">{product.discount}</span>}
        <button className="absolute top-1.5 right-1.5 btn-wishlist" onClick={e => e.stopPropagation()}><Heart size={16} /></button>
      </div>
      <div className="px-2 py-1.5 flex-1 flex flex-col">
        <div className="flex items-center gap-0.5 text-yellow-400 text-xs">
          <Star size={10} fill="currentColor" />
          <span className="text-gray-400 text-[10px]">({product.reviews || 0}) | 0 Sold</span>
        </div>
        <h3 className="font-bold text-gray-800 text-xs line-clamp-1 cursor-pointer hover:text-secondary-600 transition" onClick={() => onClick(product)}>{product.name}</h3>
        <div className="mt-auto">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-secondary-500 font-bold text-sm">৳{product.price}</span>
            {product.originalPrice && <span className="text-gray-400 text-[10px] line-through">{product.originalPrice}</span>}
            <span className="ml-auto text-[9px] text-blue-500 font-medium">Get 50 Coins</span>
          </div>
          <div className="flex gap-1.5">
            <button className="flex-1 btn-order py-1 text-xs" onClick={handleBuyNow}>Buy Now</button>
            <button className="cart_btn px-2" onClick={handleCart}><ShoppingCart size={16} className="text-rose-500" /></button>
          </div>
        </div>
      </div>
    </div>
  );

  // Style 3 - Minimal
  if (variant === 'style3') return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 group overflow-hidden flex flex-col">
      <div className="relative aspect-square p-4 bg-gray-50 cursor-pointer overflow-hidden" onClick={() => onClick(product)}>
        <LazyImage src={getImage(product)} alt={product.name} className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" />
      </div>
      <div className="px-4 pt-2 pb-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-800 text-xs mb-2 line-clamp-1 cursor-pointer hover:text-primary-500 transition" onClick={() => onClick(product)}>{product.name}</h3>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-base font-bold text-primary-500">৳{product.price}</span>
          {product.originalPrice && <span className="text-xs text-gray-400 line-through">৳{product.originalPrice}</span>}
        </div>
        <div className="flex flex-col gap-2 mt-auto">
          <button className="w-full text-xs font-bold py-2 rounded-md btn-order" onClick={handleBuyNow}>Buy Now</button>
          <button className="w-full text-xs font-bold py-1.5 rounded-md border-2 border-primary-500 text-primary-500 hover:bg-primary-50 transition" onClick={handleCart}>Add to Cart</button>
        </div>
      </div>
    </div>
  );

  // Default Style
  const tagLabel = product.tag || 'Trending';
  const accentMeta = product.brand || product.category || 'Curated pick';

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
              <Star size={12} fill="currentColor" /> {product.rating.toFixed(1)}
              {typeof product.reviews === 'number' && <span className="text-[10px] text-gray-400 font-normal">({product.reviews})</span>}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-sky-600 bg-sky-50 dark:bg-sky-500/10 dark:text-sky-200">
              <Truck size={12} /> Fast ship
            </span>
          )}
        </div>
        <div className="relative mt-4">
          <div className="relative h-40 rounded-2xl bg-gray-50 dark:bg-slate-700 flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => onClick(product)}>
            <LazyImage src={getImage(product)} alt={product.name} className="h-full w-full object-contain mix-blend-multiply dark:mix-blend-normal transition duration-500 group-hover:scale-110" />
          </div>
          {product.discount && <span className="absolute top-4 left-6 bg-purple-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm">{product.discount}</span>}
          <button className="absolute top-4 right-6 btn-wishlist bg-white/80 dark:bg-slate-800/70 shadow-md backdrop-blur-sm hover:scale-110 transition"><Heart size={16} /></button>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500 mb-1">{accentMeta}</p>
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base leading-tight cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-300 transition line-clamp-2" onClick={() => onClick(product)}>{product.name}</h3>
          {product.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{product.description}</p>}
        </div>
        {product.colors?.length > 0 && (
          <div className="flex gap-1.5">
            {product.colors.slice(0, 4).map((c, i) => <span key={i} className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ backgroundColor: c }} />)}
            {product.colors.length > 4 && <span className="text-[10px] text-gray-400">+{product.colors.length - 4}</span>}
          </div>
        )}
        <div className="mt-auto flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500">Starting at</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-gray-900 dark:text-white">৳ {formatCurrency(product.price)}</span>
              {product.originalPrice && <span className="text-xs text-gray-400 line-through">৳ {formatCurrency(product.originalPrice, null)}</span>}
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-300 font-semibold">Instant confirmation</p>
          </div>
          <div className="flex flex-col gap-2 w-32">
            <button onClick={handleBuyNow} className="w-full btn-order py-2 rounded-xl font-bold text-sm">অর্ডার করুন</button>
            <button onClick={handleCart} className="w-full rounded-xl border border-emerald-200 text-xs font-semibold text-emerald-600 py-1.5 flex items-center justify-center gap-1 hover:bg-emerald-50 transition">
              <ShoppingCart size={14} /> Add to cart
            </button>
            <button onClick={e => { e.stopPropagation(); onQuickView ? onQuickView(product) : onClick(product); }} className="inline-flex items-center justify-center gap-1 rounded-xl border border-gray-200 dark:border-slate-600 text-xs font-semibold text-gray-600 dark:text-gray-200 py-1.5 hover:border-emerald-400 hover:text-emerald-600 transition">
              <Eye size={14} /> Quick view
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const normalizeCarouselStatus = (value: unknown): string => String(value ?? '').trim().toLowerCase();

export const HeroSection: React.FC<{ carouselItems?: CarouselItem[]; websiteConfig?: WebsiteConfig }> = ({ carouselItems }) => {
  const items = carouselItems
    ?.filter(i => normalizeCarouselStatus(i.status) === 'publish')
    .sort((a, b) => Number(a.serial ?? 0) - Number(b.serial ?? 0)) || [];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => setCurrentIndex(p => (p + 1) % items.length), 5000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (!items.length) return null;

  const navigate = (dir: number) => (e: React.MouseEvent) => { e.preventDefault(); setCurrentIndex(p => (p + dir + items.length) % items.length); };

  return (
    <div className="max-w-7xl mx-auto px-4 mt-4">
      <div className="relative w-full aspect-[5/2] sm:aspect-[3/1] md:aspect-[7/2] lg:aspect-[4/1] rounded-xl overflow-hidden shadow-lg group bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
        {items.map((item, index) => (
          <a key={item.id} href={item.url || '#'} className={`absolute inset-0 transition-opacity duration-700 ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
            <LazyImage src={normalizeImageUrl(item.image)} alt={item.name} className="absolute inset-0" size="full" priority={index === currentIndex} optimizationOptions={{ width: 1600, quality: 85 }} />
          </a>
        ))}
        {items.length > 1 && (
          <>
            <button onClick={navigate(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 w-9 h-9 rounded-full shadow-lg z-20 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center hover:scale-110">
              <ChevronLeft size={20} />
            </button>
            <button onClick={navigate(1)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 w-9 h-9 rounded-full shadow-lg z-20 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center hover:scale-110">
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
              {items.map((_, i) => (
                <button key={i} onClick={e => { e.preventDefault(); setCurrentIndex(i); }} className={`h-2 rounded-full transition-all duration-300 shadow-sm ${i === currentIndex ? 'bg-white w-6' : 'bg-white/50 w-2 hover:bg-white/80'}`} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
