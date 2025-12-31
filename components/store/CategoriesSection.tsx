import { memo, useMemo, RefObject, ReactNode } from 'react';
import { Smartphone, Watch, BatteryCharging, Headphones, Zap, Bluetooth, Gamepad2, Camera } from 'lucide-react';
import { Category } from '../../types';

const SectionHeader = ({ title }: { title: string }) => (
  <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">{title}</h2>
);

const CategoryCircle = ({ name, icon }: { name: string; icon: ReactNode }) => (
  <div className="flex flex-col items-center gap-2">
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300">{icon}</div>
    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{name}</span>
  </div>
);

const CategoryPill = ({ name, icon }: { name: string; icon: ReactNode }) => (
  <div className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-gray-700 dark:bg-slate-700 dark:text-gray-300">
    {icon}
    <span className="text-sm font-medium">{name}</span>
  </div>
);

const icons = { smartphone: Smartphone, watch: Watch, 'battery-charging': BatteryCharging, headphones: Headphones, zap: Zap, bluetooth: Bluetooth, 'gamepad-2': Gamepad2, camera: Camera };

// Default style4 category icons - these images will cycle through categories when no custom image is set
const STYLE4_DEFAULT_ICONS = [
  '/category-icons/category-1.webp',
  '/category-icons/category-2.webp',
  '/category-icons/category-3.webp',
  '/category-icons/category-4.webp',
  '/category-icons/category-5.webp',
  '/category-icons/category-6.webp',
  'https://i.postimg.cc/Z5drVGCD/watches_6753_(1).webp',
  'https://i.postimg.cc/pLFDqwmb/4_36f7.webp',
];

const getIcon = (name: string, size: number, stroke = 1.5) => {
  const Icon = icons[name as keyof typeof icons] || Smartphone;
  return <Icon size={size} strokeWidth={stroke} />;
};

const getStyle4DefaultIcon = (index: number): string => {
  return STYLE4_DEFAULT_ICONS[index % STYLE4_DEFAULT_ICONS.length];
};

interface Props {
  style?: 'style1' | 'style2' | 'style3' | 'style4' | 'style5';
  categories?: Category[];
  onCategoryClick: (name: string) => void;
  categoryScrollRef?: RefObject<HTMLDivElement>;
  sectionRef?: RefObject<HTMLDivElement>;
}

export const CategoriesSection = memo(({ style = 'style5', categories, onCategoryClick, categoryScrollRef, sectionRef }: Props) => {
  const processed = useMemo(() => 
    categories?.filter(c => c.status === 'Active').map(c => ({ name: c.name, icon: c.icon || 'smartphone', image: c.image })) || []
  , [categories]);

  const rolling = useMemo(() => processed.length ? [...processed, ...processed, ...processed] : [], [processed]);

  if (!processed.length) return null;

  if (style === 'style2') return (
    <div ref={sectionRef} className="mt-1 -mb-1">
      <div className="flex items-end justify-between border-b border-gray-100 pb-0 md:pb-1">
        <div className="relative pb-1"><h2 className="text-[15px] md:text-[20px] font-bold text-gray-800 dark:text-white" /></div>
        <a href="#" className="group mb-1 flex items-center gap-2 text-xs md:text-sm font-bold text-gray-600 px-3 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition dark:text-gray-400">
          <div className="h-0 w-0 border-b-[4px] border-l-[6px] border-t-[4px] border-b-transparent border-l-blue-500 border-t-transparent transition-transform group-hover:translate-x-1" />
        </a>
      </div>
      <div ref={categoryScrollRef} className="flex gap-6 overflow-x-hidden whitespace-nowrap scrollbar-hide" style={{ maskImage: 'linear-gradient(to right, transparent, black 2%, black 98%, transparent)' }}>
        {rolling.map((cat, i) => (
          <div key={`${cat.name}-${i}`} onClick={() => onCategoryClick(cat.name)} className="cursor-pointer inline-block">
            <CategoryPill name={cat.name} icon={getIcon(cat.icon, 20, 2)} />
          </div>
        ))}
      </div>
    </div>
  );

  if (style === 'style5') return (
    <div ref={sectionRef} className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-blue-50 shadow-sm dark:border-slate-700 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800">
      <div className="absolute inset-0 pointer-events-none opacity-60 bg-[radial-gradient(circle_at_10%_20%,rgba(16,185,129,0.15),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.15),transparent_25%)]" />
      <div className="relative p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Fresh look</p>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">Shop by category</h2>
          </div>
        </div>
        <div ref={categoryScrollRef} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {processed.map((category, index) => {
            const displayImage = category.image || getStyle4DefaultIcon(index);
            return (
              <button
                key={category.name}
                onClick={() => onCategoryClick(category.name)}
                className="group relative flex items-center gap-4 rounded-xl border border-white/60 bg-white/90 p-4 text-left shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700/60 dark:bg-slate-800/80"
              >
                <div className="relative">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-100 to-blue-50 ring-1 ring-emerald-100/60 shadow-inner overflow-hidden flex items-center justify-center dark:from-slate-700 dark:to-slate-800 dark:ring-slate-600">
                    <img
                      src={displayImage}
                      alt={category.name}
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = `https://via.placeholder.com/64?text=${encodeURIComponent(category.name.charAt(0))}`;
                      }}
                    />
                  </div>
                  <span className="absolute -bottom-1 -right-1 rounded-full bg-white text-[10px] font-semibold text-emerald-600 px-1.5 py-0.5 shadow-sm border border-emerald-100/70 dark:bg-slate-900 dark:text-emerald-300 dark:border-slate-700">New</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate dark:text-white">{category.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-300">Discover curated picks</p>
                </div>
                <span className="text-emerald-600 font-bold text-lg opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5 dark:text-emerald-300">→</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (style === 'style4') return (
    <div ref={sectionRef} className="bg-[#F2F4F8] py-6 px-2">
      <div className="max-w-7xl w-full mx-auto">
        {/* Categories Grid */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-[#e5e7eb] grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-0">
          {processed.map((category, index) => {
            // Use custom image if available, otherwise use default style4 icons
            const displayImage = category.image || getStyle4DefaultIcon(index);
            
            return (
              <div
                key={index}
                onClick={() => onCategoryClick(category.name)}
                className="group flex flex-col items-center justify-center p-4 py-5 border-r border-b border-[#e5e7eb] last:border-r-0 [&:nth-child(2n)]:border-r-0 sm:[&:nth-child(2n)]:border-r sm:[&:nth-child(4n)]:border-r-0 md:[&:nth-child(4n)]:border-r md:[&:nth-child(6n)]:border-r-0 lg:[&:nth-child(6n)]:border-r lg:[&:nth-child(8n)]:border-r-0 hover:bg-[#F9FAFB] transition-all duration-200 cursor-pointer bg-white relative"
              >
                {/* Image Circle Container */}
                <div className="w-14 h-14 flex items-center justify-center bg-[#F3F4F6] rounded-full mb-2.5 group-hover:bg-white transition-colors duration-200 overflow-hidden p-2 ring-1 ring-gray-100 group-hover:ring-[#ef4a23]/20">
                  <img 
                    src={displayImage} 
                    alt={category.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      e.currentTarget.src = `https://via.placeholder.com/56?text=${encodeURIComponent(category.name.charAt(0))}`;
                    }}
                  />
                </div>

                {/* Category Label */}
                <span className="text-[13px] font-semibold text-[#1F2937] group-hover:text-[#ef4a23] text-center leading-snug transition-colors duration-200 px-1 line-clamp-2">
                  {category.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div ref={sectionRef} className="mt-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <SectionHeader title="Categories" />
      <div className="flex flex-wrap justify-center gap-x-8 gap-y-8 overflow-x-auto pb-4 pt-2 scrollbar-hide md:justify-between">
        {processed.map((cat, i) => (
          <div key={i} onClick={() => onCategoryClick(cat.name)} className="cursor-pointer">
            <CategoryCircle name={cat.name} icon={getIcon(cat.icon, 32)} />
          </div>
        ))}
      </div>
    </div>
  );
});

CategoriesSection.displayName = 'CategoriesSection';
export default CategoriesSection;
// RR
