import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface AppSkeletonProps {
  variant?: 'store' | 'admin';
  darkMode?: boolean;
}

interface SkeletonVariantProps {
  darkMode?: boolean;
}

const metricPlaceholders = Array.from({ length: 4 });
const productPlaceholders = Array.from({ length: 8 });
const tableRows = Array.from({ length: 5 });

const StoreSkeleton: React.FC<SkeletonVariantProps> = ({ darkMode }) => (
  <div className={`min-h-screen ${darkMode ? 'bg-slate-900 text-slate-200' : 'bg-gray-50 text-slate-600'} pb-20`}>
    <div className={`shadow-sm border-b ${darkMode ? 'bg-slate-800/70 border-slate-700/60' : 'bg-white/90 border-white/40'}`}>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-4">
        <Skeleton height={32} width={220} />
        <div className="flex flex-wrap gap-3">
          <Skeleton height={38} width={200} />
          <Skeleton height={38} width={180} />
          <Skeleton height={38} width={160} />
        </div>
      </div>
    </div>

    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {metricPlaceholders.map((_, index) => (
          <div key={`store-chip-${index}`} className={`rounded-xl p-4 shadow-sm ${darkMode ? 'bg-slate-800/70 shadow-black/20' : 'bg-white/90'}`}>
            <Skeleton height={20} width="60%" />
            <Skeleton height={14} width="80%" className="mt-3" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {productPlaceholders.map((_, index) => (
          <div 
            key={`store-card-${index}`} 
            className={`rounded-2xl p-4 shadow-lg animate-fadeInUp ${darkMode ? 'bg-slate-800/70 shadow-black/30' : 'bg-white/90 shadow-slate-900/5'}`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <Skeleton height={180} className="rounded-xl" />
            <Skeleton height={20} className="mt-4" />
            <Skeleton height={16} width="70%" className="mt-2" />
            <div className="flex items-center justify-between mt-4">
              <Skeleton height={30} width="40%" />
              <Skeleton height={36} width="36%" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AdminSkeleton: React.FC<SkeletonVariantProps> = ({ darkMode }) => (
  <div className={`min-h-screen ${darkMode ? 'bg-slate-900 text-slate-200' : 'bg-slate-50 text-slate-700'} py-10`}>
    <div className="max-w-6xl mx-auto px-4 space-y-10">
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {metricPlaceholders.map((_, index) => (
          <div key={`admin-card-${index}`} className={`rounded-2xl p-5 shadow-lg ${darkMode ? 'bg-slate-800/70 shadow-black/30' : 'bg-white/95 shadow-slate-900/5'}`}>
            <Skeleton height={16} width="50%" />
            <Skeleton height={32} className="mt-4" />
            <Skeleton height={14} width="40%" className="mt-3" />
          </div>
        ))}
      </div>

      <div className={`rounded-3xl p-6 shadow-xl ${darkMode ? 'bg-slate-800/70 shadow-black/40' : 'bg-white/95 shadow-slate-900/10'}`}>
        <Skeleton height={26} width="30%" className="mb-6" />
        <div className="space-y-4">
          {tableRows.map((_, index) => (
            <div key={`admin-row-${index}`} className={`flex items-center justify-between border-b pb-4 last:pb-0 last:border-b-0 ${darkMode ? 'border-slate-700/70' : 'border-slate-100/60'}`}>
              <Skeleton height={18} width="45%" />
              <div className="flex items-center gap-6">
                <Skeleton height={18} width={80} />
                <Skeleton height={18} width={60} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const AppSkeleton: React.FC<AppSkeletonProps> = ({ variant = 'store', darkMode = false }) => {
  const baseColor = darkMode ? '#1f2937' : '#e2e8f0';
  const highlightColor = darkMode ? '#475569' : '#f8fafc';

  return (
    <SkeletonTheme baseColor={baseColor} highlightColor={highlightColor}>
      {variant === 'admin' ? <AdminSkeleton darkMode={darkMode} /> : <StoreSkeleton darkMode={darkMode} />}
    </SkeletonTheme>
  );
};

// SkeletonCard - Individual product card skeleton for grids
export const SkeletonCard: React.FC<{ darkMode?: boolean }> = ({ darkMode }) => (
  <div className={`rounded-2xl p-4 shadow-lg animate-fadeInUp shimmer-effect ${darkMode ? 'bg-slate-800/70 shadow-black/30' : 'bg-white/90 shadow-slate-900/5'}`}>
    <Skeleton height={180} className="rounded-xl" />
    <Skeleton height={20} className="mt-4" />
    <Skeleton height={16} width="70%" className="mt-2" />
    <div className="flex items-center justify-between mt-4">
      <Skeleton height={30} width="40%" />
      <Skeleton height={36} width="36%" />
    </div>
  </div>
);

export default AppSkeleton;
