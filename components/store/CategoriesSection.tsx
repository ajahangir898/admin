import { memo, useMemo, RefObject, useRef, useState } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const processed = useMemo(() => 
    categories?.filter(c => !c.status || c.status === 'Active' || c.status?.toLowerCase() === 'active').map(c => ({ 
      name: c.name, 
      icon: c.icon || 'grid', 
      image: c.image,
      slug: c.slug
    })) || []
  , [categories]);

  if (!processed.length) return null;

  // Duplicate items for seamless loop
  const duplicatedItems = [...processed, ...processed];

  const CategoryButton = ({ category }: { category: typeof processed[0] }) => (
    <button
      onClick={() => onCategoryClick(category.slug || category.name)}
      className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full border-2 border-cyan-400 bg-white hover:bg-cyan-50 transition-all duration-200 hover:shadow-md hover:border-cyan-500 group"
    >
      <div className="w-6 h-6 flex items-center justify-center text-cyan-600 group-hover:text-cyan-700 transition-colors">
        {isImageUrl(category.icon) ? (
          <img src={category.icon} alt={category.name} className="w-5 h-5 object-contain" />
        ) : (
          getIcon(category.icon, 18, 2)
        )}
      </div>
      <span className="text-sm font-medium text-gray-700 whitespace-nowrap group-hover:text-gray-900">
        {category.name}
      </span>
    </button>
  );

  return (
    <div ref={sectionRef} className="relative py-3 overflow-hidden">
      {/* Auto-scrolling marquee */}
      <div 
        ref={containerRef}
        className="marquee-container"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className={`marquee-content ${isPaused ? 'paused' : ''}`}>
          {duplicatedItems.map((category, index) => (
            <CategoryButton key={`${category.name}-${index}`} category={category} />
          ))}
        </div>
      </div>

      {/* Right Arrow for manual scroll hint */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 rounded-full shadow-lg flex items-center justify-center border border-gray-200 pointer-events-none">
        <ChevronRight size={18} className="text-gray-400" />
      </div>

      {/* CSS for marquee animation */}
      <style>{`
        .marquee-container {
          overflow: hidden;
          mask-image: linear-gradient(to right, transparent, black 20px, black calc(100% - 40px), transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 20px, black calc(100% - 40px), transparent);
        }
        .marquee-content {
          display: flex;
          gap: 0.75rem;
          width: max-content;
          animation: marquee 30s linear infinite;
          padding: 0 0.5rem;
        }
        .marquee-content.paused {
          animation-play-state: paused;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
});

CategoriesSection.displayName = 'CategoriesSection';
export default CategoriesSection;
