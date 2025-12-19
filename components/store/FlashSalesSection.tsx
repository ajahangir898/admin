import React from 'react';
import { Product, WebsiteConfig } from '../../types';
import { ProductCard, SectionHeader } from '../StoreProductComponents';
import { SkeletonCard } from '../SkeletonLoaders';

interface FlashSalesSectionProps {
  products: Product[];
  isLoading: boolean;
  showCounter: boolean;
  countdown: { label: string; value: string }[];
  onProductClick: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  productCardStyle?: string;
  sectionRef?: React.RefObject<HTMLElement>;
}

export const FlashSalesSection: React.FC<FlashSalesSectionProps> = ({
  products,
  isLoading,
  showCounter,
  countdown,
  onProductClick,
  onBuyNow,
  onQuickView,
  onAddToCart,
  productCardStyle,
  sectionRef
}) => {
  return (
    <section ref={sectionRef}>
      <div className="mb-1 flex items-center gap-3">
        <SectionHeader title="⚡Flash Sales" className="text-xl text-red-600" />
        {showCounter && (
          <div className="inline-flex items-center gap-2 rounded-full bg-theme-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-theme-font">
            <div className="flex items-center gap-1 text-theme-primary">
              {countdown.map((segment) => (
                <span
                  key={segment.label}
                  className="flex min-w-[44px] flex-col items-center justify-center rounded-md border border-theme-primary/30 bg-white px-2 py-0.5 text-theme-primary shadow-sm leading-tight"
                >
                  <span className="text-[11px] font-black">{segment.value}</span>
                  <span className="text-[7px] font-semibold uppercase tracking-tight text-theme-primary/70">
                    {segment.label}
                  </span>
                </span>
              ))}
            </div>
            <span className="relative flex items-center gap-2 text-theme-primary">
              <span className="h-2 w-2 animate-ping rounded-full bg-theme-primary" />
            </span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
        {isLoading ? (
          [...Array(5)].map((_, i) => <SkeletonCard key={`skeleton-${i}`} />)
        ) : (
          products.map((product) => (
            <ProductCard
              key={`flash-${product.id}`}
              product={product}
              onClick={onProductClick}
              onBuyNow={onBuyNow}
              variant={productCardStyle}
              onQuickView={onQuickView}
              onAddToCart={onAddToCart}
            />
          ))
        )}
      </div>
    </section>
  );
};

export default FlashSalesSection;
