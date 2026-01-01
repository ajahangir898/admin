import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../../types';
import { normalizeImageUrl } from '../../utils/imageUrlHelper';
import { OptimizedImage } from '../OptimizedImage';

export interface ProductCardProps {
    product: Product;
    onClick: (product: Product) => void;
    onBuyNow?: (product: Product) => void;
    onAddToCart?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
    product, 
    onClick, 
    onBuyNow, 
    onAddToCart 
}) => {
    const imageSrc = normalizeImageUrl(product.galleryImages?.[0] || product.image);
    
    const handleBuyNow = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        onBuyNow ? onBuyNow(product) : onClick(product);
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 group overflow-hidden flex flex-col relative">
            {/* Discount Badge */}
            {product.discount && (
                <div className="absolute top-2 left-2 z-10">
                    <span className="inline-block bg-orange-500 text-white text-[11px] font-bold px-2 py-0.5 rounded">
                        {product.discount}
                    </span>
                </div>
            )}

            {/* Product Image */}
            <div className="relative aspect-square p-3 bg-white cursor-pointer" onClick={() => onClick(product)}>
                <OptimizedImage
                    src={imageSrc}
                    alt={product.name}
                    width={400}
                    height={400}
                    placeholder="blur"
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
            </div>

            {/* Product Details */}
            <div className="px-3 pb-3 flex-1 flex flex-col">
                <h3 
                    className="font-medium text-gray-800 text-sm mb-2 line-clamp-2 min-h-[40px] cursor-pointer hover:text-orange-500 transition-colors"
                    onClick={() => onClick(product)}
                >
                    {product.name}
                </h3>

                <div className="flex items-center gap-2 mb-3">
                    <span className="text-base font-bold text-gray-900">৳{product.price}</span>
                    {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">৳{product.originalPrice}</span>
                    )}
                </div>

                <div className="flex gap-2 mt-auto">
                    <button 
                        className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2 rounded hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
                        onClick={(e) => { e.stopPropagation(); onAddToCart?.(product); }}
                    >
                        <ShoppingCart size={16} /> Cart
                    </button>
                    <button 
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-2 rounded transition-colors"
                        onClick={handleBuyNow}
                    >
                        Buy Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;