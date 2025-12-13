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
          <div key={`store-card-${index}`} className={`rounded-2xl p-4 shadow-lg ${darkMode ? 'bg-slate-800/70 shadow-black/30' : 'bg-white/90 shadow-slate-900/5'}`}>
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
  <div className={`rounded-2xl p-4 shadow-lg ${darkMode ? 'bg-slate-800/70 shadow-black/30' : 'bg-white/90 shadow-slate-900/5'}`}>
    <Skeleton height={180} className="rounded-xl" />
    <Skeleton height={20} className="mt-4" />
    <Skeleton height={16} width="70%" className="mt-2" />
    <div className="flex items-center justify-between mt-4">
      <Skeleton height={30} width="40%" />
      <Skeleton height={36} width="36%" />
    </div>
  </div>
);

// SkeletonTableRow - Skeleton for table rows
export const SkeletonTableRow: React.FC<{ columns: number; darkMode?: boolean }> = ({ columns, darkMode }) => (
  <div className={`flex items-center justify-between border-b pb-4 last:pb-0 last:border-b-0 ${darkMode ? 'border-slate-700/70' : 'border-slate-100/60'}`}>
    {Array.from({ length: columns }).map((_, i) => (
      <span key={i}>
        <Skeleton height={18} width={`${Math.random() * 30 + 20}%`} />
      </span>
    ))}
  </div>
);

// SkeletonTable - Full table skeleton
export const SkeletonTable: React.FC<{ rows?: number; columns?: number; darkMode?: boolean }> = ({ rows = 5, columns = 4, darkMode }) => (
  <div className={`rounded-3xl p-6 shadow-xl ${darkMode ? 'bg-slate-800/70 shadow-black/40' : 'bg-white/95 shadow-slate-900/10'}`}>
    <Skeleton height={26} width="30%" className="mb-6" />
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonTableRow key={index} columns={columns} darkMode={darkMode} />
      ))}
    </div>
  </div>
);

// SkeletonMetricCard - Skeleton for stat/metric cards
export const SkeletonMetricCard: React.FC<{ darkMode?: boolean }> = ({ darkMode }) => (
  <div className={`rounded-2xl p-5 shadow-lg ${darkMode ? 'bg-slate-800/70 shadow-black/30' : 'bg-white/95 shadow-slate-900/5'}`}>
    <Skeleton height={16} width="50%" />
    <Skeleton height={32} className="mt-4" />
    <Skeleton height={14} width="40%" className="mt-3" />
  </div>
);

// SkeletonGridMetrics - Skeleton grid for metric cards
export const SkeletonGridMetrics: React.FC<{ count?: number; darkMode?: boolean }> = ({ count = 4, darkMode }) => (
  <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonMetricCard key={index} darkMode={darkMode} />
    ))}
  </div>
);

// SkeletonForm - Skeleton for form fields
export const SkeletonForm: React.FC<{ fields?: number; darkMode?: boolean }> = ({ fields = 5, darkMode }) => (
  <div className={`rounded-2xl p-6 space-y-4 ${darkMode ? 'bg-slate-800/70' : 'bg-white/95'}`}>
    {Array.from({ length: fields }).map((_, index) => (
      <div key={index} className="space-y-2">
        <Skeleton height={14} width="20%" />
        <Skeleton height={40} />
      </div>
    ))}
    <div className="flex gap-2 pt-4">
      <Skeleton height={40} width="30%" />
      <Skeleton height={40} width="30%" />
    </div>
  </div>
);

// SkeletonImageGrid - Skeleton for image grid layouts
export const SkeletonImageGrid: React.FC<{ count?: number; cols?: string; darkMode?: boolean }> = ({ count = 6, cols = 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4', darkMode }) => (
  <div className={`grid ${cols} gap-4`}>
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className={`rounded-lg overflow-hidden ${darkMode ? 'bg-slate-800/70' : 'bg-slate-100'}`}>
        <Skeleton height={200} className="w-full" />
        <div className="p-3 space-y-2">
          <Skeleton height={14} />
          <Skeleton height={12} width="60%" />
        </div>
      </div>
    ))}
  </div>
);

export default AppSkeleton;
