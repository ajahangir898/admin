import React from 'react';
import { Product } from '../../types';
import { ProductCard, SectionHeader } from '../StoreProductComponents';

interface ProductGridSectionProps {
  title: string;
  products: Product[];
  accentColor?: 'green' | 'purple' | 'orange' | 'blue';
  onProductClick: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  productCardStyle?: string;
  keyPrefix: string;
  maxProducts?: number;
  reverseOrder?: boolean;
}

const accentColors = {
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  blue: 'bg-blue-500'
};

export const ProductGridSection: React.FC<ProductGridSectionProps> = ({
  title,
  products,
  accentColor = 'green',
  onProductClick,
  onBuyNow,
  onQuickView,
  onAddToCart,
  productCardStyle,
  keyPrefix,
  maxProducts = 10,
  reverseOrder = false
}) => {
  const displayProducts = reverseOrder 
    ? products.slice().reverse().slice(0, maxProducts)
    : products.slice(0, maxProducts);

  const computeInitialCount = React.useCallback(() => {
    const total = displayProducts.length;
    if (typeof window === 'undefined') {
      return Math.min(6, total);
    }
    const width = window.innerWidth;
    if (width >= 1280) return Math.min(8, total);
    if (width >= 768) return Math.min(6, total);
    return Math.min(4, total);
  }, [displayProducts.length]);

  const [visibleCount, setVisibleCount] = React.useState(() => computeInitialCount());

  React.useEffect(() => {
    setVisibleCount(computeInitialCount());
  }, [computeInitialCount]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (visibleCount >= displayProducts.length) return;

    const chunkSize = displayProducts.length > 12 ? 4 : 2;
    const timer = window.setTimeout(() => {
      setVisibleCount((current) => Math.min(displayProducts.length, current + chunkSize));
    }, 180);

    return () => window.clearTimeout(timer);
  }, [displayProducts.length, visibleCount]);

  const productsToRender = displayProducts.slice(0, visibleCount);

  return (
    <section>
      <div className="mb-1 flex items-center gap-3">
        <div className={`h-8 w-1.5 rounded-full ${accentColors[accentColor]}`}></div>
        <SectionHeader title={title} className="text-xl text-red-600" />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
        {productsToRender.map((product) => (
          <ProductCard
            key={`${keyPrefix}-${product.id}`}
            product={product}
            onClick={onProductClick}
            onBuyNow={onBuyNow}
            variant={productCardStyle}
            onQuickView={onQuickView}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </section>
  );
};

export default ProductGridSection;
