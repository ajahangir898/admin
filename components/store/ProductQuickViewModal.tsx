import React, { useState, useEffect } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import { Product, ProductVariantSelection } from '../../types';
import { formatCurrency } from '../../utils/format';
import { normalizeImageUrl } from '../../utils/imageUrlHelper';

export interface ProductQuickViewModalProps {
    product: Product;
    onClose: () => void;
    onCompleteOrder: (product: Product, quantity: number, variant: ProductVariantSelection) => void;
    onViewDetails?: (product: Product) => void;
}

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({ 
    product, 
    onClose, 
    onCompleteOrder, 
    onViewDetails 
}) => {
    const [selectedColor, setSelectedColor] = useState<string>(product.variantDefaults?.color || product.colors?.[0] || 'Default');
    const [selectedSize, setSelectedSize] = useState<string>(product.variantDefaults?.size || product.sizes?.[0] || 'Standard');
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        setSelectedColor(product.variantDefaults?.color || product.colors?.[0] || 'Default');
        setSelectedSize(product.variantDefaults?.size || product.sizes?.[0] || 'Standard');
        setQuantity(1);
    }, [product]);

    const handleQuantityChange = (delta: number) => {
        setQuantity(prev => Math.max(1, prev + delta));
    };

    const variant: ProductVariantSelection = {
        color: selectedColor || 'Default',
        size: selectedSize || 'Standard'
    };
    const quickPrice = formatCurrency(product.price);
    const quickOriginalPrice = formatCurrency(product.originalPrice, null);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden grid grid-cols-1 lg:grid-cols-2">
                <button aria-label="Close" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={22} />
                </button>
                <div className="p-6 lg:p-10 bg-gray-50 flex flex-col items-center justify-center">
                    <div className="relative w-full max-w-sm">
                        <div className="absolute inset-6 bg-gradient-to-br from-emerald-200/40 via-transparent to-transparent blur-3xl" aria-hidden />
                        <img src={normalizeImageUrl(product.galleryImages?.[0] || product.image)} alt={product.name} className="relative w-full h-80 object-contain" />
                    </div>
                    <div className="mt-4 flex gap-2 text-xs text-gray-500">
                        <span className="px-3 py-1 rounded-full bg-white border border-gray-200">Ships 48h</span>
                        <span className="px-3 py-1 rounded-full bg-white border border-gray-200">Secure Payment</span>
                    </div>
                </div>

                <div className="p-6 lg:p-10 space-y-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Quick view</p>
                        <h3 className="text-2xl font-black text-gray-900 mt-2">{product.name}</h3>
                        <p className="text-sm text-gray-500 mt-2 line-clamp-3">{product.description}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-3xl font-black text-gray-900">৳ {quickPrice}</span>
                        {quickOriginalPrice && (
                            <span className="text-sm line-through text-gray-400">৳ {quickOriginalPrice}</span>
                        )}
                    </div>

                    {product.colors && product.colors.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Color</p>
                            <div className="flex flex-wrap gap-2">
                                {product.colors.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setSelectedColor(color)}
                                        className={`w-8 h-8 rounded-full border-2 ${selectedColor === color ? 'border-emerald-500' : 'border-transparent'} shadow-sm`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {product.sizes && product.sizes.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Size</p>
                            <div className="flex flex-wrap gap-2">
                                {product.sizes.map(size => (
                                    <button
                                        key={size}
                                        type="button"
                                        onClick={() => setSelectedSize(size)}
                                        className={`px-3 py-1.5 rounded-xl border text-sm font-semibold ${selectedSize === size ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 'border-gray-200 text-gray-600'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase">Quantity</p>
                        <div className="flex items-center rounded-full border border-gray-200">
                            <button type="button" onClick={() => handleQuantityChange(-1)} className="p-2 text-gray-500 hover:text-gray-900">
                                <Minus size={16} />
                            </button>
                            <span className="px-4 text-sm font-bold text-gray-900">{quantity}</span>
                            <button type="button" onClick={() => handleQuantityChange(1)} className="p-2 text-gray-500 hover:text-gray-900">
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            type="button"
                            onClick={() => onCompleteOrder(product, quantity, variant)}
                            className="w-full btn-order py-3 rounded-2xl font-bold text-base shadow-[0_18px_28px_rgba(16,185,129,0.25)]"
                        >
                            Complete Order
                        </button>
                        <button
                            type="button"
                            onClick={() => { onViewDetails?.(product); }}
                            className="w-full py-3 rounded-2xl border border-gray-200 text-gray-700 font-semibold hover:border-emerald-400"
                        >
                            View Full Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductQuickViewModal;
