import React, { memo, useMemo, useState, useEffect } from 'react';
import { Smartphone, Watch, BatteryCharging, Headphones, Zap, Bluetooth, Gamepad2, Camera } from 'lucide-react';
import { CategoryCircle, CategoryPill, SectionHeader } from '../StoreComponents';
import { CATEGORIES } from '../../constants';
import { Category } from '../../types';
import { CategorySkeleton } from '../SkeletonLoaders';

// Pre-rendered icon map for faster access
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

// Pre-rendered small icons for style2
const smallIconMap: Record<string, React.ReactNode> = {
  smartphone: <Smartphone size={20} strokeWidth={2} />,
  watch: <Watch size={20} strokeWidth={2} />,
  'battery-charging': <BatteryCharging size={20} strokeWidth={2} />,
  headphones: <Headphones size={20} strokeWidth={2} />,
  zap: <Zap size={20} strokeWidth={2} />,
  bluetooth: <Bluetooth size={20} strokeWidth={2} />,
  'gamepad-2': <Gamepad2 size={20} strokeWidth={2} />,
  camera: <Camera size={20} strokeWidth={2} />,
};

// Pre-rendered large icons for style1
// const largeIconMap: Record<string, React.ReactNode> = {
//   smartphone: <Smartphone size={32} strokeWidth={1.5} />,
//   watch: <Watch size={32} strokeWidth={1.5} />,
//   'battery-charging': <BatteryCharging size={32} strokeWidth={1.5} />,
//   headphones: <Headphones size={32} strokeWidth={1.5} />,
//   zap: <Zap size={32} strokeWidth={1.5} />,
//   bluetooth: <Bluetooth size={32} strokeWidth={1.5} />,
//   'gamepad-2': <Gamepad2 size={32} strokeWidth={1.5} />,
//   camera: <Camera size={32} strokeWidth={1.5} />,
// };

interface CategoriesSectionProps {
  style?: 'style1' | 'style2';
  categories?: Category[];
  onCategoryClick: (categoryName: string) => void;
  categoryScrollRef?: React.RefObject<HTMLDivElement>;
  sectionRef?: React.RefObject<HTMLDivElement>;
  isLoading?: boolean;
}

// Pre-compute rolling categories for style2 to avoid recreation on each render
const rollingCategories = [...CATEGORIES, ...CATEGORIES, ...CATEGORIES];

export const CategoriesSection: React.FC<CategoriesSectionProps> = memo(({
  style = 'style1',
  categories,
  onCategoryClick,
  categoryScrollRef,
  sectionRef,
  isLoading = false
}) => {
  // Memoize processed categories for style1
  const processedCategories = useMemo(() => {
    if (categories && categories.length > 0) {
      return categories.filter((c) => c.status === 'Active').map((cat) => ({
        name: cat.name,
        icon: cat.icon || 'smartphone',
        image: cat.image
      }));
    }
    return CATEGORIES;
  }, [categories]);

  // Show skeleton during loading
  if (isLoading) {
    return <CategorySkeleton count={8} />;
  }

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
          className="flex gap-6 overflow-x-hidden whitespace-nowrap scrollbar-hide"
          style={{ maskImage: 'linear-gradient(to right, transparent, black 2%, black 98%, transparent)' }}
        >
          {rollingCategories.map((cat, idx) => (
            <div key={`${cat.name}-${idx}`} onClick={() => onCategoryClick(cat.name)} className="cursor-pointer inline-block">
              <CategoryPill
                name={cat.name}
                icon={smallIconMap[cat.icon] || smallIconMap['smartphone']}
              />
            </div>
          ))}
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
          <div key={idx} onClick={() => onCategoryClick(cat.name)} className="cursor-pointer">
            <CategoryCircle
              name={cat.name}
              // icon={largeIconMap[cat.icon as keyof typeof largeIconMap] || largeIconMap['smartphone']}
            />
          </div>
        ))}
      </div>
    </div>
  );
});

CategoriesSection.displayName = 'CategoriesSection';

export default CategoriesSection;
