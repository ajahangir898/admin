import { useState, useEffect, RefObject } from 'react';
import { Zap } from 'lucide-react';
import { Product } from '../../types';
import { ProductCard } from '../StoreProductComponents';
import { SectionHeader } from '../StoreComponents';

interface Props { products: Product[]; showCounter: boolean; countdown: { label: string; value: string }[]; onProductClick: (p: Product) => void; onBuyNow: (p: Product) => void; onQuickView: (p: Product) => void; onAddToCart: (p: Product) => void; productCardStyle?: string; sectionRef?: RefObject<HTMLElement>; }

export const FlashSalesSection = ({ products, showCounter, countdown, onProductClick, onBuyNow, onQuickView, onAddToCart, productCardStyle, sectionRef }: Props) => {
  const initCount = () => typeof window === 'undefined' ? Math.min(4, products.length) : Math.min(window.innerWidth >= 1024 ? 6 : 4, products.length);
  const [visible, setVisible] = useState(initCount);

  useEffect(() => { setVisible(initCount()); }, [products.length]);
  useEffect(() => {
    if (typeof window === 'undefined' || visible >= products.length) return;
    const t = setTimeout(() => setVisible(c => Math.min(products.length, c + 2)), 180);
    return () => clearTimeout(t);
  }, [products.length, visible]);

  return (
    <section ref={sectionRef} className="py-2">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-2 rounded-lg">
            <Zap size={20} fill="currentColor" />
          </span>
          <SectionHeader title="Flash Sales" className="text-xl md:text-2xl text-gray-900" />
        </div>
        {showCounter && (
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-theme-primary/10 to-theme-secondary/10 px-4 py-2 ml-auto">
            <span className="text-xs font-semibold text-gray-600 hidden sm:inline">Ends in:</span>
            <div className="flex items-center gap-1">
              {countdown.map((s, idx) => (
                <div key={s.label} className="flex items-center">
                  <span className="flex flex-col items-center justify-center rounded-lg border border-theme-primary/20 bg-white px-2.5 py-1 shadow-sm min-w-[42px]">
                    <span className="text-sm font-black text-theme-primary">{s.value}</span>
                    <span className="text-[8px] font-semibold uppercase tracking-tight text-gray-500">{s.label}</span>
                  </span>
                  {idx < countdown.length - 1 && <span className="text-theme-primary font-bold mx-0.5">:</span>}
                </div>
              ))}
            </div>
            <span className="relative flex h-2.5 w-2.5 ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {products.slice(0, visible).map(p => <ProductCard key={`flash-${p.id}`} product={p} onClick={onProductClick} onBuyNow={onBuyNow} variant={productCardStyle} onQuickView={onQuickView} onAddToCart={onAddToCart}/>)}
      </div>
    </section>
  );
};

export default FlashSalesSection;
