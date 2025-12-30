import React from 'react';
import { ShoppingCart, Heart, Sparkles, Star, Truck, Eye } from 'lucide-react';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/format';
import { normalizeImageUrl } from '../../utils/imageUrlHelper';
import { OptimizedImage } from '../OptimizedImage';

export interface ProductCardProps {
    product: Product;
    onClick: (product: Product) => void;
    variant?: string;
    onQuickView?: (product: Product) => void;
    onBuyNow?: (product: Product) => void;
    onAddToCart?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
    product, 
    onClick, 
    variant, 
    onQuickView, 
    onBuyNow, 
    onAddToCart 
}) => {
    const imageSrc = normalizeImageUrl(product.galleryImages?.[0] || product.image);
    const handleBuyNow = (event?: React.MouseEvent) => {
        event?.stopPropagation();
        if (onBuyNow) {
            onBuyNow(product);
        } else {
            onClick(product);
        }
    };

    // Style 1 (Clean Card Design)
    if (variant === 'style1') {
        return (
            <div className="bg-white rounded-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group relative overflow-hidden flex flex-col">
                {/* Discount Badge */}
                <div className="absolute top-3 left-3 z-10">
                    {product.discount && (
                        <span className="inline-block bg-theme-secondary text-white text-xs font-bold px-2 py-1 rounded-md">
                            {product.discount}
                        </span>
                    )}
                </div>

                {/* Product Image */}
                <div className="relative aspect-square p-4 bg-gray-50 cursor-pointer overflow-hidden" onClick={() => onClick(product)}>
                    <OptimizedImage
                        src={imageSrc}
                        alt={product.name}
                        width={480}
                        height={480}
                        placeholder="blur"
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                </div>

                {/* Product Details */}
                <div className="p-4 flex-1 flex flex-col">
                    {/* Product Name */}
                    <h3 
                        className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 min-h-[40px] cursor-pointer hover:text-theme-primary transition"
                        onClick={() => onClick(product)}
                    >
                        {product.name}
                    </h3>

                    {/* Price Section */}
                    <div className="flex items-center gap-2 mb-3 min-h-[24px]">
                        <span className="text-lg font-bold text-gray-900">৳{product.price}</span>
                        {product.originalPrice && (
                            <span className="text-sm text-gray-400 line-through">৳{product.originalPrice}</span>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-auto">
                        <button 
                            className="flex-1 bg-gray-200 text-gray-700 text-xs font-semibold py-2 rounded-md hover:bg-gray-300 transition flex items-center justify-center gap-1 text-[16px]"
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddToCart?.(product);
                            }}
                        >
                            <ShoppingCart size={17} /> Cart
                        </button>
                        <button 
                            className="flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition transform active:scale-95 btn-order"
                            onClick={handleBuyNow}
                        >
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Style 2 (Flash Sale - Pink/Blue)
    if (variant === 'style2') {
        return (
            <div className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition group relative overflow-hidden flex flex-col">
                <div className="relative aspect-square p-2 bg-gray-50 cursor-pointer" onClick={() => onClick(product)}>
                    <OptimizedImage
                        src={imageSrc}
                        alt={product.name}
                        width={420}
                        height={420}
                        placeholder="blur"
                        className="w-full h-full object-contain mix-blend-multiply transition duration-500 group-hover:scale-105"
                    />
                    {product.discount && (
                        <span className="absolute top-1.5 left-1.5 bg-theme-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                            {product.discount}
                        </span>
                    )}
                    <button className="absolute top-1.5 right-1.5 btn-wishlist text-current" onClick={(e) => e.stopPropagation()}>
                        <Heart size={16} />
                    </button>
                </div>
                
                <div className="px-2 py-1.5 flex-1 flex flex-col">
                    {/* Rating */}
                    <div className="flex items-center gap-0.5 text-yellow-400 text-xs">
                        <Star size={10} fill="currentColor" />
                        <span className="text-gray-400 text-[10px]">({product.reviews || 0})</span>
                        <span className="text-gray-400 text-[10px] ml-0.5">| 0 Sold</span>
                    </div>

                    <h3 
                        className="font-bold text-gray-800 text-xs leading-tight line-clamp-1 min-h-[32px] cursor-pointer hover:text-theme-primary transition"
                        onClick={() => onClick(product)}
                    >
                        {product.name}
                    </h3>

                    <div className="mt-auto">
                        <div className="flex items-center gap-1 mb-1">
                            <span className="text-theme-primary font-bold text-sm"><b>৳</b>{product.price}</span>
                            {product.originalPrice && (
                                <span className="text-gray-400 text-[10px] line-through">{product.originalPrice}</span>
                            )}
                            <span className="ml-auto text-[9px] text-blue-500 font-medium">Get 50 Coins</span>
                        </div>
                        
                        <div className="flex gap-1.5">
                            <button 
                                className="flex-1 btn-order py-1 text-xs"
                                onClick={handleBuyNow}
                            >
                                Buy Now
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAddToCart?.(product);
                                }}
                                className="cart_btn px-2"
                                aria-label="Add to cart"
                            >
                                <ShoppingCart size={16} className="text-rose-500" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Style 3 (Minimal Clean Design)
    if (variant === 'style3') {
        return (
            <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 group relative overflow-hidden flex flex-col">
                {/* Product Image */}
                <div className="relative aspect-square p-4 bg-gray-50 cursor-pointer overflow-hidden" onClick={() => onClick(product)}>
                    <OptimizedImage
                        src={imageSrc}
                        alt={product.name}
                        width={420}
                        height={420}
                        placeholder="blur"
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                </div>

                {/* Product Details */}
                <div className="px-4 pt-2 pb-4 flex-1 flex flex-col">
                    {/* Product Name */}
                    <h3 
                        className="font-semibold text-gray-800 text-xs mb-2 line-clamp-1 min-h-[28px] cursor-pointer transition"
                        style={{ '--hover-color': 'rgba(var(--color-primary-rgb), 1)' } as React.CSSProperties}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(var(--color-primary-rgb), 1)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '')}
                        onClick={() => onClick(product)}
                    >
                        {product.name}
                    </h3>

                    {/* Price Section */}
                    <div className="flex items-center gap-2 mb-4 min-h-[22px]">
                        <span 
                            className="text-base font-bold"
                            style={{ color: 'rgba(var(--color-primary-rgb), 1)' }}
                        >
                            ৳{product.price}
                        </span>
                        {product.originalPrice && (
                            <span className="text-xs text-gray-400 line-through">৳{product.originalPrice}</span>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 mt-auto">
                        <button 
                            className="w-full text-white text-xs font-bold py-2 rounded-md transition btn-order"
                            onClick={handleBuyNow}
                        >
                            Buy Now
                        </button>
                        <button 
                            className="w-full text-xs font-bold py-1.5 rounded-md transition border-2"
                            style={{ 
                                borderColor: 'rgba(var(--color-primary-rgb), 1)', 
                                color: 'rgba(var(--color-primary-rgb), 1)',
                                backgroundColor: 'transparent'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(var(--color-primary-rgb), 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddToCart?.(product);
                            }}
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Style 5 (E-commerce Design)
    if (variant === 'style5') {
        return (
            <div className="bg-white rounded-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group relative overflow-hidden flex flex-col">
                {/* Product Image Container */}
                <div className="relative aspect-square p-4 bg-gray-50 cursor-pointer overflow-hidden" onClick={() => onClick(product)}>
                    {/* Discount Badge - Top Left */}
                    {product.discount && (
                        <div className="absolute top-3 left-3 z-10">
                            <span className="inline-block bg-red-500 text-white text-xs font-bold px-3 py-1 rounded">
                                {product.discount}
                            </span>
                        </div>
                    )}

                    {/* Wishlist Button - Top Right */}
                    <button 
                        className="absolute top-3 right-3 z-10 bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-shadow"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Add to wishlist"
                    >
                        <Heart size={18} className="text-gray-600 hover:text-red-500 transition-colors" />
                    </button>

                    {/* Product Image */}
                    <OptimizedImage
                        src={imageSrc}
                        alt={product.name}
                        width={480}
                        height={480}
                        placeholder="blur"
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                    />
                </div>

                {/* Product Details */}
                <div className="p-4 flex-1 flex flex-col">
                    {/* Star Rating */}
                    <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                            <Star 
                                key={i} 
                                size={14} 
                                className={i < Math.floor(product.rating || 5) ? "text-yellow-400" : "text-gray-300"}
                                fill={i < Math.floor(product.rating || 5) ? "currentColor" : "none"}
                            />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">
                            ({product.reviews || 0} reviews)
                        </span>
                    </div>

                    {/* Product Name */}
                    <h3 
                        className="font-semibold text-gray-900 text-sm mb-3 line-clamp-2 min-h-[40px] cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => onClick(product)}
                    >
                        {product.name}
                    </h3>

                    {/* Price Section */}
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl font-bold text-gray-900">৳{product.price}</span>
                        {product.originalPrice && (
                            <span className="text-sm text-gray-400 line-through">৳{product.originalPrice}</span>
                        )}
                    </div>

                    {/* Rewards System */}
                    <div className="mb-4">
                        <span className="text-xs text-blue-600 font-medium">Get 50 coins</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-auto">
                        <button 
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2.5 rounded-md transition-colors flex items-center justify-center gap-2"
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddToCart?.(product);
                            }}
                        >
                            <ShoppingCart size={18} /> Cart
                        </button>
                        <button 
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-md transition-colors"
                            onClick={handleBuyNow}
                        >
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const formattedPrice = formatCurrency(product.price);
    const formattedOriginalPrice = formatCurrency(product.originalPrice, null);
    const tagLabel = product.tag || 'Trending';
    const accentMeta = product.brand || product.category || 'Curated pick';

    // Default Style (Card 0)
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
                            <Star size={12} fill="currentColor" className="drop-shadow" />
                            {product.rating.toFixed(1)}
                            {typeof product.reviews === 'number' && (
                                <span className="text-[10px] text-gray-400 dark:text-gray-300 font-normal">({product.reviews})</span>
                            )}
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-sky-600 bg-sky-50 dark:bg-sky-500/10 dark:text-sky-200">
                            <Truck size={12} /> Fast ship
                        </span>
                    )}
                </div>

                <div className="relative mt-4">
                    <div className="absolute inset-x-6 top-2 h-28 bg-gradient-to-br from-emerald-200/40 via-transparent to-transparent blur-3xl opacity-60 group-hover:opacity-90 transition" aria-hidden />
                    <div className="relative h-40 rounded-2xl bg-gray-50 dark:bg-slate-700 flex items center justify-center overflow-hidden cursor-pointer" onClick={() => onClick(product)}>
                        <OptimizedImage
                            src={imageSrc}
                            alt={product.name}
                            width={420}
                            height={420}
                            placeholder="blur"
                            className="h-full w-full object-contain mix-blend-multiply dark:mix-blend-normal transition duration-500 group-hover:scale-110"
                        />
                    </div>
                    {product.discount && (
                        <span className="absolute top-4 left-6 bg-purple-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                            {product.discount}
                        </span>
                    )}
                    <button className="absolute top-4 right-6 btn-wishlist bg-white/80 dark:bg-slate-800/70 shadow-md backdrop-blur-sm hover:scale-110 transition" aria-label="Save to wishlist">
                        <Heart size={16} />
                    </button>
                </div>
            </div>

            <div className="p-4 flex-1 flex flex-col gap-3">
                <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500 mb-1">{accentMeta}</p>
                    <h3
                        className="font-bold text-gray-900 dark:text-gray-100 text-base leading-tight cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-300 transition line-clamp-2"
                        onClick={() => onClick(product)}
                    >
                        {product.name}
                    </h3>
                    {product.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{product.description}</p>
                    )}
                </div>

                {product.colors && product.colors.length > 0 && (
                    <div className="flex gap-1.5">
                        {product.colors.slice(0, 4).map((c, i) => (
                            <span key={i} className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ backgroundColor: c }}></span>
                        ))}
                        {product.colors.length > 4 && (
                            <span className="text-[10px] text-gray-400">+{product.colors.length - 4}</span>
                        )}
                    </div>
                )}

                <div className="mt-auto flex items-end justify-between gap-3">
                    <div>
                        <p className="text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500">Starting at</p>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-gray-900 dark:text-white">৳ {formattedPrice}</span>
                            {formattedOriginalPrice && (
                                <span className="text-xs text-gray-400 line-through">৳ {formattedOriginalPrice}</span>
                            )}
                        </div>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-300 font-semibold">Instant confirmation</p>
                    </div>

                    <div className="flex flex-col gap-2 w-32">
                        <button
                            onClick={handleBuyNow}
                            className="w-full btn-order py-2 rounded-xl font-bold text-sm"
                        >
                            অর্ডার করুন
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddToCart?.(product);
                            }}
                            className="w-full rounded-xl border border-emerald-200 text-xs font-semibold text-emerald-600 py-1.5 flex items-center justify-center gap-1 hover:bg-emerald-50 transition"
                        >
                            <ShoppingCart size={14} /> Add to cart
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onQuickView) onQuickView(product);
                                else onClick(product);
                            }}
                            className="inline-flex items-center justify-center gap-1 rounded-xl border border-gray-200 dark:border-slate-600 text-xs font-semibold text-gray-600 dark:text-gray-200 py-1.5 hover:border-emerald-400 hover:text-emerald-600 transition"
                        >
                            <Eye size={14} /> Quick view
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
