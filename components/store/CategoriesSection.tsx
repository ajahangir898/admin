import { memo, useMemo, RefObject, useRef, useState, useEffect } from 'react';
import { Smartphone, Watch, BatteryCharging, Headphones, Zap, Bluetooth, Gamepad2, Camera, Grid, Baby, Dog, BookOpen, Package, Shirt, Utensils, Heart, ChevronLeft, ChevronRight, ShoppingBag, Sparkles, Gift, Home, Car, Dumbbell, Palette, Music, Coffee, Leaf, Star } from 'lucide-react';
import { Category } from '../../types';

const icons: Record<string, typeof Smartphone> = { 
  smartphone: Smartphone, 
  watch: Watch, 
  'battery-charging': BatteryCharging, 
  headphones: Headphones, 
  zap: Zap, 
  bluetooth: Bluetooth, 
  'gamepad-2': Gamepad2, 
  camera: Camera,
  grid: Grid,
  baby: Baby,
  dog: Dog,
  'book-open': BookOpen,
  package: Package,
  shirt: Shirt,
  utensils: Utensils,
  heart: Heart,
  'shopping-bag': ShoppingBag,
  sparkles: Sparkles,
  gift: Gift,
  home: Home,
  car: Car,
  dumbbell: Dumbbell,
  palette: Palette,
  music: Music,
  coffee: Coffee,
  leaf: Leaf,
  star: Star
};

const getIcon = (name: string, size: number, stroke = 1.5) => {
  const Icon = icons[name?.toLowerCase()] || Grid;
  return <Icon size={size} strokeWidth={stroke} />;
};

// Check if icon is a URL or base64 image
const isImageUrl = (icon?: string) => {
  if (!icon) return false;
  return icon.startsWith('http') || icon.startsWith('/') || icon.startsWith('data:');
};

interface Props {
  categories?: Category[];
  onCategoryClick: (name: string) => void;
  sectionRef?: RefObject<HTMLDivElement>;
}

export const CategoriesSection = memo(({ categories, onCategoryClick, sectionRef }: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const processed = useMemo(() => 
    categories?.filter(c => !c.status || c.status === 'Active' || c.status?.toLowerCase() === 'active').map(c => ({ 
      name: c.name, 
      icon: c.icon || 'grid', 
      image: c.image,
      slug: c.slug
    })) || []
  , [categories]);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      return () => el.removeEventListener('scroll', checkScroll);
    }
  }, [processed]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!processed.length) return null;

  return (
    <div ref={sectionRef} className="relative py-3">
      {/* Left Arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all border border-gray-200"
        >
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
      )}

      {/* Right Arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all border border-gray-200"
        >
          <ChevronRight size={18} className="text-gray-600" />
        </button>
      )}

      {/* Scrollable Categories */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide px-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {processed.map((category, index) => (
          <button
            key={category.name}
            onClick={() => onCategoryClick(category.slug || category.name)}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full border-2 border-cyan-400 bg-white hover:bg-cyan-50 transition-all duration-200 hover:shadow-md hover:border-cyan-500 group"
          >
            {/* Icon */}
            <div className="w-6 h-6 flex items-center justify-center text-cyan-600 group-hover:text-cyan-700 transition-colors">
              {isImageUrl(category.icon) ? (
                <img 
                  src={category.icon} 
                  alt={category.name} 
                  className="w-5 h-5 object-contain"
                />
              ) : (
                getIcon(category.icon, 18, 2)
              )}
            </div>
            {/* Name */}
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap group-hover:text-gray-900">
              {category.name}
            </span>
          </button>
        ))}
      </div>

      {/* Hide scrollbar CSS */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
});

CategoriesSection.displayName = 'CategoriesSection';
export default CategoriesSection;
