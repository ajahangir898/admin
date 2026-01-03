import { useState, useEffect, useCallback } from 'react';
import { Product } from '../../types';
import { ProductCard } from '../StoreProductComponents';
import { SectionHeader } from '../StoreComponents';
import { getViewportWidth } from '../../utils/viewportHelpers';

interface Props { title: string; products: Product[]; accentColor?: 'green' | 'purple' | 'orange' | 'blue'; onProductClick: (p: Product) => void; onBuyNow: (p: Product) => void; onQuickView: (p: Product) => void; onAddToCart: (p: Product) => void; productCardStyle?: string; keyPrefix: string; maxProducts?: number; reverseOrder?: boolean; }
const colors = { green: 'bg-green-500', purple: 'bg-purple-500', orange: 'bg-orange-500', blue: 'bg-blue-500' };

export const ProductGridSection = ({ title, products, accentColor = 'green', onProductClick, onBuyNow, onQuickView, onAddToCart, productCardStyle, keyPrefix, maxProducts = 10, reverseOrder = false }: Props) => {
  const display = reverseOrder ? products.slice().reverse().slice(0, maxProducts) : products.slice(0, maxProducts);
  const initCount = useCallback(() => {
    const t = display.length;
    if (typeof window === 'undefined') return Math.min(6, t);
    const w = getViewportWidth();
    return w >= 1280 ? Math.min(8, t) : w >= 768 ? Math.min(6, t) : Math.min(4, t);
  }, [display.length]);

  const [visible, setVisible] = useState(initCount);
  useEffect(() => { setVisible(initCount()); }, [initCount]);
  useEffect(() => {
    if (typeof window === 'undefined' || visible >= display.length) return;
    const t = setTimeout(() => setVisible(c => Math.min(display.length, c + (display.length > 12 ? 4 : 2))), 180);
    return () => clearTimeout(t);
  }, [display.length, visible]);

  return (
    <section style={{ minHeight: '400px' }}>
      <div className="mb-1 flex items-center gap-3"><div className={`h-8 w-1.5 rounded-full ${colors[accentColor]}`}/><SectionHeader title={title} className="text-xl text-red-600"/></div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
        {display.slice(0, visible).map(p => <ProductCard key={`${keyPrefix}-${p.id}`} product={p} onClick={onProductClick} onBuyNow={onBuyNow} variant={productCardStyle} onQuickView={onQuickView} onAddToCart={onAddToCart}/>)}
      </div>
    </section>
  );
};

export default ProductGridSection;
