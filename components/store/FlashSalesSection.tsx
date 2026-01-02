import { useState, useEffect, RefObject } from 'react';
import { ChevronRight } from 'lucide-react';
import { Product } from '../../types';
import { ProductCard } from '../StoreProductComponents';

interface Props { 
  products: Product[]; 
  showCounter: boolean; 
  countdown: { label: string; value: string }[]; 
  onProductClick: (p: Product) => void; 
  onBuyNow: (p: Product) => void; 
  onQuickView: (p: Product) => void; 
  onAddToCart: (p: Product) => void; 
  productCardStyle?: string; 
  sectionRef?: RefObject<HTMLElement>;
  onViewAll?: () => void;
}

export const FlashSalesSection = ({ products, showCounter, countdown, onProductClick, onBuyNow, onQuickView, onAddToCart, productCardStyle, sectionRef, onViewAll }: Props) => {
  const initCount = () => typeof window === 'undefined' ? Math.min(4, products.length) : Math.min(window.innerWidth >= 1024 ? 6 : 4, products.length);
  const [visible, setVisible] = useState(initCount);

  useEffect(() => { setVisible(initCount()); }, [products.length]);
  useEffect(() => {
    if (typeof window === 'undefined' || visible >= products.length) return;
    const t = setTimeout(() => setVisible(c => Math.min(products.length, c + 2)), 180);
    return () => clearTimeout(t);
  }, [products.length, visible]);

  return (
    <section ref={sectionRef} className="py-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-4">
        {/* Left: Title + Timer */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Flash Sale Title */}
          <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white drop-shadow-sm text-xl text-red-600">
            Flash Sale
          </h2>
          
          {/* Countdown Timer */}
          {showCounter && (
            <div className="flex items-center gap-1.5">
              {countdown.map((s, idx) => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <div className="border border-gray-300 rounded px-2 py-1 bg-white min-w-[45px] text-center">
                    <span className="text-sm font-bold text-gray-800">{s.value}</span>
                    <span className="text-[10px] text-gray-500 ml-0.5">{s.label}</span>
                  </div>
                  {idx < countdown.length - 1 && (
                    <span className="text-gray-400 font-light">|</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: View All */}
        <button 
          onClick={onViewAll}
          className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
        >
          View All
          <ChevronRight size={16} className="text-blue-600" />
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {products.slice(0, visible).map(p => (
          <ProductCard 
            key={`flash-${p.id}`} 
            product={p} 
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

export default FlashSalesSection;
