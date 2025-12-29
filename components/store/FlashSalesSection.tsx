import { useState, useEffect, RefObject } from 'react';
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
    <section ref={sectionRef}>
      <div className="mb-1 flex items-center gap-3">
        <SectionHeader title="⚡Flash Sales" className="text-xl text-red-600" />
        {showCounter && <div className="inline-flex items-center gap-2 rounded-full bg-theme-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-theme-font">
          <div className="flex items-center gap-1 text-theme-primary">
            {countdown.map(s => <span key={s.label} className="flex min-w-[44px] flex-col items-center justify-center rounded-md border border-theme-primary/30 bg-white px-2 py-0.5 text-theme-primary shadow-sm leading-tight"><span className="text-[11px] font-black">{s.value}</span><span className="text-[7px] font-semibold uppercase tracking-tight text-theme-primary/70">{s.label}</span></span>)}
          </div>
          <span className="relative flex items-center gap-2 text-theme-primary"><span className="h-2 w-2 animate-ping rounded-full bg-theme-primary"/></span>
        </div>}
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
        {products.slice(0, visible).map(p => <ProductCard key={`flash-${p.id}`} product={p} onClick={onProductClick} onBuyNow={onBuyNow} variant={productCardStyle} onQuickView={onQuickView} onAddToCart={onAddToCart}/>)}
      </div>
    </section>
  );
};

export default FlashSalesSection;
