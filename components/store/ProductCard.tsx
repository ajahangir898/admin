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
            <div className="bg-white rounded-xl border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 group relative overflow-hidden flex flex-col">
                {/* Discount Badge */}
                <div className="absolute top-3 left-3 z-10">
                    {product.discount && (
                        <span className="inline-block bg-gradient-to-r from-theme-secondary to-theme-primary text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
                            {product.discount}
                        </span>
                    )}
                </div>

                {/* Product Image */}
                <div className="relative aspect-square p-4 bg-gradient-to-br from-gray-50 to-white cursor-pointer overflow-hidden" onClick={() => onClick(product)}>
                    <OptimizedImage
                        src={imageSrc}
                        alt={product.name}
                        width={480}
                        height={480}
                        placeholder="blur"
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                    />
                </div>

                {/* Product Details */}
                <div className="p-4 flex-1 flex flex-col border-t border-gray-50">
                    {/* Product Name */}
                    <h3 
                        className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2 min-h-[40px] cursor-pointer hover:text-theme-primary transition-colors"
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
                            className="flex-1 bg-gray-100 text-gray-700 text-sm font-semibold py-2.5 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5 active:scale-95"
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddToCart?.(product);
                            }}
                        >
                            <ShoppingCart size={16} /> Cart
                        </button>
                        <button 
                            className="flex-1 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all transform active:scale-95 btn-order shadow-md hover:shadow-lg"
                            onClick={handleBuyNow}
                        >
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Style 2 (Flash Sale - Pink/Blue) - CART LEFT, BUY NOW RIGHT
    if (variant === 'style2') {
        return (
            <div className="bg-white rounded-xl border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 group relative overflow-hidden flex flex-col">
                <div className="relative aspect-square p-3 bg-gradient-to-br from-gray-50 to-white cursor-pointer" onClick={() => onClick(product)}>
                    <OptimizedImage
                        src={imageSrc}
                        alt={product.name}
                        width={420}
                        height={420}
                        placeholder="blur"
                        className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                    />
                    {product.discount && (
                        <span className="absolute top-2 left-2 bg-gradient-to-r from-theme-primary to-theme-secondary text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">
                            {product.discount}
                        </span>
                    )}
                    <button className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-md hover:bg-white hover:scale-110 transition-all" onClick={(e) => e.stopPropagation()}>
                        <Heart size={14} className="text-gray-500 hover:text-red-500 transition-colors" />
                    </button>
                </div>
                
                <div className="px-3 py-2.5 flex-1 flex flex-col border-t border-gray-50">
                    {/* Rating */}
                    <div className="flex items-center gap-1 text-yellow-400 text-xs mb-1">
                        <Star size={12} fill="currentColor" />
                        <span className="text-gray-500 text-[10px]">({product.reviews || 0})</span>
                        <span className="text-gray-400 text-[10px] ml-1">| 0 Sold</span>
                    </div>

                    <h3 
                        className="font-semibold text-gray-800 text-xs leading-tight line-clamp-2 min-h-[32px] cursor-pointer hover:text-theme-primary transition-colors"
                        onClick={() => onClick(product)}
                    >
                        {product.name}
                    </h3>

                    <div className="mt-auto pt-2">
                        <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-theme-primary font-bold text-sm">৳{product.price}</span>
                            {product.originalPrice && (
                                <span className="text-gray-400 text-[10px] line-through">{product.originalPrice}</span>
                            )}
                            <span className="ml-auto text-[9px] text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded">+50 Coins</span>
                        </div>
                        
                        <div className="flex gap-1.5">
                            <button 
                                className="flex-1 btn-order py-2 text-xs font-semibold rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95"
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
                                className="bg-gray-100 hover:bg-gray-200 px-3 rounded-lg transition-colors active:scale-95"
                                aria-label="Add to cart"
                            >
                                <ShoppingCart size={16} className="text-theme-primary" />
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
};
export default ProductCard;