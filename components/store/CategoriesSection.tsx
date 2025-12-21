import React from 'react';
import { Smartphone, Watch, BatteryCharging, Headphones, Zap, Bluetooth, Gamepad2, Camera } from 'lucide-react';
import { CategoryCircle, CategoryPill, SectionHeader } from '../StoreProductComponents';
import { CATEGORIES } from '../../constants';
import { Category } from '../../types';

// Helper map for dynamic icons
const iconMap: Record<string, React.ReactNode> = {
  smartphone: <Smartphone size={28} strokeWidth={1.5} />,
  watch: <Watch size={28} strokeWidth={1.5} />,
  'battery-charging': <BatteryCharging size={28} strokeWidth={1.5} />,
  headphones: <Headphones size={28} strokeWidth={1.5} />,
  zap: <Zap size={28} strokeWidth={1.5} />,
  bluetooth: <Bluetooth size={28} strokeWidth={1.5} />,
  'gamepad-2': <Gamepad2 size={28} strokeWidth={1.5} />,
  camera: <Camera size={28} strokeWidth={1.5} />,
};

interface CategoriesSectionProps {
  style?: 'style1' | 'style2';
  categories?: Category[];
  onCategoryClick: (categoryName: string) => void;
  categoryScrollRef?: React.RefObject<HTMLDivElement>;
  sectionRef?: React.RefObject<HTMLDivElement>;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  style = 'style1',
  categories,
  onCategoryClick,
  categoryScrollRef,
  sectionRef
}) => {
  if (style === 'style2') {
    return (
      <div ref={sectionRef} className="mt-1 -mb-1">
        <div className="flex items-end justify-between border-b border-gray-100 pb-0 md:pb-1">
          <div className="relative pb-1">
            <h2 className="text-[15px] md:text-[20px] font-bold text-gray-800 dark:text-white">
              {/* Categories */}
            </h2>
          </div>
          <a
            href="#"
            className="group mb-1 flex items-center gap-2 text-xs md:text-sm font-bold text-gray-600 px-3 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition dark:text-gray-400"
            role="button"
            aria-label="View all categories"
          >
            {/* View All */}
            <div className="h-0 w-0 border-b-[4px] border-l-[6px] border-t-[4px] border-b-transparent border-l-blue-500 border-t-transparent transition-transform group-hover:translate-x-1" />
          </a>
        </div>
        {/* rolling category pills */}
        <div
          ref={categoryScrollRef}
          className="overflow-x-hidden whitespace-nowrap scrollbar-hide"
          style={{ maskImage: 'linear-gradient(to right, transparent, black 2%, black 98%, transparent)' }}
        >
          <div className="flex gap-6 animate-marquee">
            {[...CATEGORIES, ...CATEGORIES, ...CATEGORIES].map((cat, idx) => (
              <div key={`${cat.name}-${idx}`} onClick={() => onCategoryClick(cat.name)} className="cursor-pointer">
                <CategoryPill
                  name={cat.name}
                  icon={React.cloneElement(iconMap[cat.icon] as React.ReactElement<any>, { size: 20, strokeWidth: 2 })}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default style1
  return (
    <div ref={sectionRef} className="mt-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <SectionHeader title="Categories" />
      <div className="flex flex-wrap justify-center gap-x-8 gap-y-8 overflow-x-auto pb-4 pt-2 scrollbar-hide md:justify-between">
        {(categories && categories.length > 0
          ? categories.filter((c) => c.status === 'Active').map((cat) => ({
              name: cat.name,
              icon: cat.icon || 'smartphone',
              image: cat.image
            }))
          : CATEGORIES
        ).map((cat, idx) => (
          <div 
            key={idx} 
            onClick={() => onCategoryClick(cat.name)} 
            className="cursor-pointer animate-slide-in-right opacity-0"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <CategoryCircle
              name={cat.name}
              icon={React.cloneElement(
                (iconMap[cat.icon as keyof typeof iconMap] || iconMap['smartphone']) as React.ReactElement<any>,
                { size: 32, strokeWidth: 1.5 }
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesSection;
