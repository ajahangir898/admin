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

const getIcon = (name: string, size: number, stroke = 1.5) => {
  const Icon = icons[name as keyof typeof icons] || Smartphone;
  return <Icon size={size} strokeWidth={stroke} />;
};

interface Props {
  style?: 'style1' | 'style2' | 'style3' | 'style4' | 'style5';
  categories?: Category[];
  onCategoryClick: (name: string) => void;
  categoryScrollRef?: RefObject<HTMLDivElement>;
  sectionRef?: RefObject<HTMLDivElement>;
}

export const CategoriesSection = memo(({ style = 'style1', categories, onCategoryClick, categoryScrollRef, sectionRef }: Props) => {
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

  if (style === 'style4') return (
    <div ref={sectionRef} className="min-h-screen bg-[#F2F4F8] py-8 px-2 flex items-start justify-center">
      <div className="max-w-6xl w-full mx-auto">
        {/* Categories Grid */}
        <div className="bg-white rounded-md shadow-sm overflow-hidden border-t border-l border-[#eee] grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {processed.map((category, index) => (
            <div
              key={index}
              onClick={() => onCategoryClick(category.name)}
              className="group flex flex-col items-center justify-center p-3 py-6 border-r border-b border-[#eee] hover:bg-[#F2F4F8] transition-all duration-300 cursor-pointer bg-white"
            >
              {/* Image Circle Container */}
              <div className="w-16 h-16 flex items-center justify-center bg-[#F2F4F8] rounded-full mb-3 group-hover:bg-white transition-colors duration-300 overflow-hidden p-2">
                {category.image ? (
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/64?text=Tech';
                    }}
                  />
                ) : (
                  getIcon(category.icon, 32)
                )}
              </div>

              {/* Category Label */}
              <span className="text-[14px] font-semibold text-[#081621] group-hover:text-[#ef4a23] text-center leading-tight transition-colors duration-300 px-1">
                {category.name}
              </span>
            </div>
          ))}
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