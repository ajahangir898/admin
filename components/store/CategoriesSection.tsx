import { memo, useMemo, RefObject } from 'react';
import { Smartphone, Watch, BatteryCharging, Headphones, Zap, Bluetooth, Gamepad2, Camera } from 'lucide-react';
import { Category } from '../../types';

const icons = { smartphone: Smartphone, watch: Watch, 'battery-charging': BatteryCharging, headphones: Headphones, zap: Zap, bluetooth: Bluetooth, 'gamepad-2': Gamepad2, camera: Camera };

const getIcon = (name: string, size: number, stroke = 1.5) => {
  const Icon = icons[name as keyof typeof icons] || Smartphone;
  return <Icon size={size} strokeWidth={stroke} />;
};

interface Props {
  categories?: Category[];
  onCategoryClick: (name: string) => void;
  sectionRef?: RefObject<HTMLDivElement>;
}

export const CategoriesSection = memo(({ categories, onCategoryClick, sectionRef }: Props) => {
  const processed = useMemo(() => 
    categories?.filter(c => !c.status || c.status === 'Active' || c.status?.toLowerCase() === 'active').map(c => ({ name: c.name, icon: c.icon || 'smartphone', image: c.image })) || []
  , [categories]);

  if (!processed.length) return null;

  return (
    <div ref={sectionRef} className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-blue-50 shadow-sm dark:border-slate-700 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800">
      <div className="absolute inset-0 pointer-events-none opacity-60 bg-[radial-gradient(circle_at_10%_20%,rgba(16,185,129,0.15),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.15),transparent_25%)]" />
      <div className="relative p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Shop by category</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {processed.map((category) => (
            <button
              key={category.name}
              onClick={() => onCategoryClick(category.name)}
              className="group relative flex items-center gap-4 rounded-xl border border-white/60 bg-white/90 p-4 text-left shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700/60 dark:bg-slate-800/80"
            >
              <div className="relative">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-100 to-blue-50 ring-1 ring-emerald-100/60 shadow-inner overflow-hidden flex items-center justify-center dark:from-slate-700 dark:to-slate-800 dark:ring-slate-600">
                  <div className="text-emerald-700 dark:text-emerald-200">
                    {getIcon(category.icon, 22, 2)}
                  </div>
                </div>
                <span className="absolute -bottom-1 -right-1 rounded-full bg-white text-[10px] font-semibold text-emerald-600 px-1.5 py-0.5 shadow-sm border border-emerald-100/70 dark:bg-slate-900 dark:text-emerald-300 dark:border-slate-700">New</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate dark:text-white">{category.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-300">Discover curated picks</p>
              </div>
              <span className="text-emerald-600 font-bold text-lg opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5 dark:text-emerald-300">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

CategoriesSection.displayName = 'CategoriesSection';
export default CategoriesSection;
