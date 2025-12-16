import React, { memo } from 'react';
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
const productPlaceholders = Array.from({ length: 6 });
const tableRows = Array.from({ length: 5 });

// Shared skeleton theme wrapper
const SkeletonWrapper: React.FC<{ darkMode?: boolean; children: React.ReactNode }> = ({ darkMode = false, children }) => {
  const baseColor = darkMode ? '#825383ff' : '#a2c8faff';
  const highlightColor = darkMode ? '#304841ff' : '#f8fafc';
  return (
    <SkeletonTheme baseColor={baseColor} highlightColor={highlightColor}>
      {children}
    </SkeletonTheme>
  );
};

// Login Skeleton - Lightweight skeleton for login page - memoized for perf
export const LoginSkeleton: React.FC = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a1410]">
    <div className="w-full max-w-md p-8">
      <div className="bg-gradient-to-br from-[#0f0f1a]/90 to-[#0a1410]/90 backdrop-blur-xl rounded-3xl p-8 space-y-6">
        <Skeleton height={64} width={64} circle className="mx-auto mb-4" baseColor="#1f2937" highlightColor="#475569" />
        <Skeleton height={32} width="60%" className="mx-auto mb-2" baseColor="#1f2937" highlightColor="#475569" />
        <Skeleton height={20} width="80%" className="mx-auto mb-8" baseColor="#1f2937" highlightColor="#475569" />
        <Skeleton height={48} className="mb-4" baseColor="#1f2937" highlightColor="#475569" />
        <Skeleton height={48} className="mb-6" baseColor="#1f2937" highlightColor="#475569" />
        <Skeleton height={48} baseColor="#1f2937" highlightColor="#475569" />
      </div>
    </div>
  </div>
));
LoginSkeleton.displayName = 'LoginSkeleton';

// Store Skeleton - Optimized for store pages - memoized
export const StoreSkeleton: React.FC<SkeletonVariantProps> = memo(({ darkMode = false }) => (
  <SkeletonWrapper darkMode={darkMode}>
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-gray-50'} pb-20`}>
      {/* Header */}
      <div className={`shadow-sm border-b ${darkMode ? 'bg-slate-800/70' : 'bg-white/90'} p-4`}>
        <Skeleton height={32} width={180} className="mb-3" />
        <Skeleton height={40} width="100%" />
      </div>
      
      {/* Content Grid */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {productPlaceholders.map((_, i) => (
            <div key={i} className={`rounded-lg p-3 ${darkMode ? 'bg-slate-800/70' : 'bg-white'}`}>
              <Skeleton height={140} className="mb-3" />
              <Skeleton height={18} className="mb-2" />
              <Skeleton height={14} width="70%" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </SkeletonWrapper>
));
StoreSkeleton.displayName = 'StoreSkeleton';

// Admin Skeleton - Optimized for admin dashboard - memoized
export const AdminSkeleton: React.FC<SkeletonVariantProps> = memo(({ darkMode = true }) => (
  <SkeletonWrapper darkMode={true}>
    <div className="min-h-screen flex bg-gradient-to-br from-black via-[#0b1a12] to-[#1b0b0f]">
      {/* Sidebar */}
      <div className="hidden lg:block w-64 bg-[#0a0a0f]/90 border-r border-slate-800/50 p-4">
        <Skeleton height={40} className="mb-8" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="mb-2">
            <Skeleton height={40} />
          </div>
        ))}
      </div>
      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Skeleton height={32} width={200} />
          <div className="flex gap-3">
            <Skeleton height={40} width={40} circle />
            <Skeleton height={40} width={120} />
          </div>
        </div>
        {/* Metrics */}
        <div className="grid gap-4 grid-cols-2 xl:grid-cols-4 mb-6">
          {metricPlaceholders.map((_, i) => (
            <div key={i} className="rounded-xl p-4 bg-slate-800/50 border border-slate-700/50">
              <Skeleton height={16} width="50%" className="mb-3" />
              <Skeleton height={28} />
            </div>
          ))}
        </div>
        {/* Table */}
        <div className="rounded-xl p-5 bg-slate-800/50 border border-slate-700/50">
          <Skeleton height={24} width="30%" className="mb-4" />
          {tableRows.map((_, i) => (
            <div key={i}>
              <Skeleton height={16} className="mb-3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </SkeletonWrapper>
));
AdminSkeleton.displayName = 'AdminSkeleton';

// Admin Page Content Skeleton - for lazy loaded admin sections
export const AdminPageSkeleton: React.FC<SkeletonVariantProps> = memo(({ darkMode = true }) => (
  <SkeletonWrapper darkMode={true}>
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <Skeleton height={32} width={200} />
        <Skeleton height={40} width={120} />
      </div>
      {/* Metrics Row */}
      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        {metricPlaceholders.map((_, i) => (
          <div key={i} className="rounded-xl p-4 bg-slate-800/50 border border-slate-700/50">
            <Skeleton height={14} width="50%" className="mb-2" />
            <Skeleton height={24} width="70%" />
          </div>
        ))}
      </div>
      {/* Content Area */}
      <div className="rounded-xl p-5 bg-slate-800/50 border border-slate-700/50">
        <Skeleton height={20} width="25%" className="mb-4" />
        {tableRows.map((_, i) => (
          <div key={i} className="mb-2">
            <Skeleton height={48} />
          </div>
        ))}
      </div>
    </div>
  </SkeletonWrapper>
));
AdminPageSkeleton.displayName = 'AdminPageSkeleton';

// Admin Orders Skeleton
export const AdminOrdersSkeleton: React.FC = memo(() => (
  <SkeletonWrapper darkMode={true}>
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Skeleton height={32} width={150} />
        <div className="flex gap-2">
          <Skeleton height={40} width={200} />
          <Skeleton height={40} width={120} />
        </div>
      </div>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {metricPlaceholders.map((_, i) => (
          <div key={i} className="rounded-xl p-4 bg-slate-800/50 border border-slate-700/50">
            <Skeleton height={12} width="60%" className="mb-2" />
            <Skeleton height={28} width="50%" />
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 overflow-hidden">
        <div className="p-4 border-b border-slate-700/50">
          <Skeleton height={40} />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-4 border-b border-slate-700/30 flex items-center gap-4">
            <Skeleton height={16} width={80} />
            <Skeleton height={16} width={120} />
            <Skeleton height={16} width={100} />
            <Skeleton height={24} width={80} />
            <Skeleton height={16} width={60} />
          </div>
        ))}
      </div>
    </div>
  </SkeletonWrapper>
));
AdminOrdersSkeleton.displayName = 'AdminOrdersSkeleton';

// Admin Products Skeleton
export const AdminProductsSkeleton: React.FC = memo(() => (
  <SkeletonWrapper darkMode={true}>
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Skeleton height={32} width={150} />
        <div className="flex gap-2">
          <Skeleton height={40} width={150} />
          <Skeleton height={40} width={120} />
        </div>
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {productPlaceholders.map((_, i) => (
          <div key={i} className="rounded-xl bg-slate-800/50 border border-slate-700/50 overflow-hidden">
            <Skeleton height={180} />
            <div className="p-4 space-y-2">
              <Skeleton height={18} width="80%" />
              <Skeleton height={14} width="50%" />
              <div className="flex justify-between pt-2">
                <Skeleton height={20} width="35%" />
                <Skeleton height={28} width={28} circle />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </SkeletonWrapper>
));
AdminProductsSkeleton.displayName = 'AdminProductsSkeleton';

// Admin Dashboard Skeleton
export const AdminDashboardSkeleton: React.FC = memo(() => (
  <SkeletonWrapper darkMode={true}>
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex justify-between items-center">
        <div>
          <Skeleton height={28} width={250} className="mb-2" />
          <Skeleton height={16} width={180} />
        </div>
        <Skeleton height={40} width={140} />
      </div>
      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        {metricPlaceholders.map((_, i) => (
          <div key={i} className="rounded-xl p-5 bg-gradient-to-br from-slate-800/60 to-slate-800/30 border border-slate-700/50">
            <div className="flex justify-between items-start mb-3">
              <Skeleton height={14} width="50%" />
              <Skeleton height={36} width={36} circle />
            </div>
            <Skeleton height={32} width="60%" className="mb-1" />
            <Skeleton height={12} width="40%" />
          </div>
        ))}
      </div>
      {/* Charts Row */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <div className="rounded-xl p-5 bg-slate-800/50 border border-slate-700/50">
          <Skeleton height={20} width="40%" className="mb-4" />
          <Skeleton height={200} />
        </div>
        <div className="rounded-xl p-5 bg-slate-800/50 border border-slate-700/50">
          <Skeleton height={20} width="40%" className="mb-4" />
          <Skeleton height={200} />
        </div>
      </div>
      {/* Recent Orders */}
      <div className="rounded-xl p-5 bg-slate-800/50 border border-slate-700/50">
        <Skeleton height={20} width="25%" className="mb-4" />
        {tableRows.map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3 border-b border-slate-700/30 last:border-0">
            <Skeleton height={40} width={40} circle />
            <div className="flex-1">
              <Skeleton height={16} width="60%" className="mb-1" />
              <Skeleton height={12} width="40%" />
            </div>
            <Skeleton height={24} width={80} />
          </div>
        ))}
      </div>
    </div>
  </SkeletonWrapper>
));
AdminDashboardSkeleton.displayName = 'AdminDashboardSkeleton';

// Admin Settings Skeleton
export const AdminSettingsSkeleton: React.FC = memo(() => (
  <SkeletonWrapper darkMode={true}>
    <div className="p-6 space-y-6">
      <Skeleton height={32} width={180} />
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Form Section */}
        <div className="rounded-xl p-6 bg-slate-800/50 border border-slate-700/50 space-y-4">
          <Skeleton height={20} width="40%" className="mb-4" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton height={14} width="25%" />
              <Skeleton height={44} />
            </div>
          ))}
          <Skeleton height={44} width="30%" className="mt-4" />
        </div>
        {/* Preview Section */}
        <div className="rounded-xl p-6 bg-slate-800/50 border border-slate-700/50">
          <Skeleton height={20} width="30%" className="mb-4" />
          <Skeleton height={200} />
        </div>
      </div>
    </div>
  </SkeletonWrapper>
));
AdminSettingsSkeleton.displayName = 'AdminSettingsSkeleton';

// Image Search Skeleton
export const ImageSearchSkeleton: React.FC<SkeletonVariantProps> = memo(({ darkMode = false }) => (
  <SkeletonWrapper darkMode={darkMode}>
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`p-4 ${darkMode ? 'bg-slate-800' : 'bg-white'} border-b`}>
        <Skeleton height={32} width={180} />
      </div>
      {/* Upload Area */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className={`rounded-2xl p-8 ${darkMode ? 'bg-slate-800/50' : 'bg-white'} border-2 border-dashed text-center`}>
          <Skeleton height={64} width={64} circle className="mx-auto mb-4" />
          <Skeleton height={24} width="60%" className="mx-auto mb-2" />
          <Skeleton height={16} width="80%" className="mx-auto" />
        </div>
        {/* Results Grid */}
        <div className="mt-8 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {productPlaceholders.map((_, i) => (
            <div key={i} className={`rounded-lg overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
              <Skeleton height={140} />
              <div className="p-3">
                <Skeleton height={16} className="mb-2" />
                <Skeleton height={14} width="60%" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </SkeletonWrapper>
));
ImageSearchSkeleton.displayName = 'ImageSearchSkeleton';

// Landing Page Skeleton
export const LandingPageSkeleton: React.FC<SkeletonVariantProps> = memo(({ darkMode = false }) => (
  <SkeletonWrapper darkMode={darkMode}>
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
      {/* Hero Section */}
      <div className="relative h-[60vh] bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <Skeleton height={48} width={300} className="mx-auto mb-4" />
            <Skeleton height={24} width={400} className="mx-auto mb-6" />
            <Skeleton height={50} width={180} className="mx-auto" />
          </div>
        </div>
      </div>
      {/* Product Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <Skeleton height={400} className="rounded-2xl" />
          <div className="space-y-4">
            <Skeleton height={32} width="80%" />
            <Skeleton height={20} count={3} />
            <Skeleton height={40} width="50%" />
            <Skeleton height={50} width="60%" />
          </div>
        </div>
      </div>
    </div>
  </SkeletonWrapper>
));
LandingPageSkeleton.displayName = 'LandingPageSkeleton';

// Order Success Skeleton
export const OrderSuccessSkeleton: React.FC<SkeletonVariantProps> = memo(({ darkMode = false }) => (
  <SkeletonWrapper darkMode={darkMode}>
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-gray-50'} flex items-center justify-center`}>
      <div className={`max-w-md w-full mx-4 p-8 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-white'} text-center`}>
        <Skeleton height={80} width={80} circle className="mx-auto mb-6" />
        <Skeleton height={28} width="70%" className="mx-auto mb-3" />
        <Skeleton height={18} width="90%" className="mx-auto mb-2" />
        <Skeleton height={18} width="60%" className="mx-auto mb-6" />
        <Skeleton height={48} width="70%" className="mx-auto" />
      </div>
    </div>
  </SkeletonWrapper>
));
OrderSuccessSkeleton.displayName = 'OrderSuccessSkeleton';

// Mobile Bottom Nav Skeleton
export const MobileNavSkeleton: React.FC = memo(() => (
  <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t p-2 flex justify-around lg:hidden">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="flex flex-col items-center p-2">
        <Skeleton height={24} width={24} circle />
        <Skeleton height={10} width={40} className="mt-1" />
      </div>
    ))}
  </div>
));
MobileNavSkeleton.displayName = 'MobileNavSkeleton';

const StoreSkeletonOld: React.FC<SkeletonVariantProps> = ({ darkMode }) => (
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

const AdminSkeletonOld: React.FC<SkeletonVariantProps> = ({ darkMode }) => (
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
export const SkeletonImageGrid: React.FC<{ count?: number; cols?: string; darkMode?: boolean }> = memo(({ count = 6, cols = 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4', darkMode }) => (
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
));
SkeletonImageGrid.displayName = 'SkeletonImageGrid';

// Product Detail Skeleton - for product detail pages
export const ProductDetailSkeleton: React.FC<SkeletonVariantProps> = memo(({ darkMode = false }) => {
  const baseColor = darkMode ? '#1f2937' : '#e2e8f0';
  const highlightColor = darkMode ? '#475569' : '#f8fafc';
  
  return (
    <SkeletonTheme baseColor={baseColor} highlightColor={highlightColor}>
      <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        {/* Header */}
        <div className={`p-4 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <Skeleton height={32} width={180} />
        </div>
        {/* Product Layout */}
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image */}
            <Skeleton height={400} className="rounded-xl" />
            {/* Details */}
            <div className="space-y-4">
              <Skeleton height={28} width="80%" />
              <Skeleton height={32} width="30%" />
              <Skeleton height={16} count={3} />
              <Skeleton height={48} width="50%" />
            </div>
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
});
ProductDetailSkeleton.displayName = 'ProductDetailSkeleton';

// Checkout Skeleton - for checkout pages
export const CheckoutSkeleton: React.FC<SkeletonVariantProps> = memo(({ darkMode = false }) => {
  const baseColor = darkMode ? '#1f2937' : '#e2e8f0';
  const highlightColor = darkMode ? '#475569' : '#f8fafc';
  
  return (
    <SkeletonTheme baseColor={baseColor} highlightColor={highlightColor}>
      <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          {/* Order Summary */}
          <div className={`rounded-xl p-6 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <Skeleton height={24} width="40%" className="mb-4" />
            <div className="flex gap-4">
              <Skeleton height={80} width={80} className="rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton height={18} width="60%" />
                <Skeleton height={14} width="30%" />
                <Skeleton height={20} width="25%" />
              </div>
            </div>
          </div>
          {/* Form Fields */}
          <div className={`rounded-xl p-6 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <Skeleton height={24} width="35%" className="mb-4" />
            <div className="space-y-4">
              <Skeleton height={44} />
              <Skeleton height={44} />
              <Skeleton height={44} />
              <Skeleton height={80} />
            </div>
          </div>
          {/* Submit Button */}
          <Skeleton height={52} className="rounded-xl" />
        </div>
      </div>
    </SkeletonTheme>
  );
});
CheckoutSkeleton.displayName = 'CheckoutSkeleton';

// Dashboard Stats Skeleton - for admin dashboard metrics
export const DashboardStatsSkeleton: React.FC<SkeletonVariantProps> = memo(({ darkMode = false }) => {
  const baseColor = darkMode ? '#1f2937' : '#e2e8f0';
  const highlightColor = darkMode ? '#475569' : '#f8fafc';
  
  return (
    <SkeletonTheme baseColor={baseColor} highlightColor={highlightColor}>
      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        {metricPlaceholders.map((_, i) => (
          <div key={i} className={`rounded-xl p-5 ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
            <div className="flex justify-between items-start mb-3">
              <Skeleton height={14} width="50%" />
              <Skeleton height={32} width={32} circle />
            </div>
            <Skeleton height={28} width="60%" />
            <Skeleton height={12} width="40%" className="mt-2" />
          </div>
        ))}
      </div>
    </SkeletonTheme>
  );
});
DashboardStatsSkeleton.displayName = 'DashboardStatsSkeleton';

// Profile Skeleton - for user profile pages
export const ProfileSkeleton: React.FC<SkeletonVariantProps> = memo(({ darkMode = false }) => {
  const baseColor = darkMode ? '#1f2937' : '#e2e8f0';
  const highlightColor = darkMode ? '#475569' : '#f8fafc';
  
  return (
    <SkeletonTheme baseColor={baseColor} highlightColor={highlightColor}>
      <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-gray-50'} py-8`}>
        <div className="max-w-2xl mx-auto px-4 space-y-6">
          {/* Profile Header */}
          <div className={`rounded-xl p-6 ${darkMode ? 'bg-slate-800' : 'bg-white'} text-center`}>
            <Skeleton height={96} width={96} circle className="mx-auto mb-4" />
            <Skeleton height={24} width="40%" className="mx-auto mb-2" />
            <Skeleton height={16} width="30%" className="mx-auto" />
          </div>
          {/* Profile Form */}
          <div className={`rounded-xl p-6 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <Skeleton height={20} width="25%" className="mb-4" />
            <div className="space-y-4">
              <Skeleton height={44} />
              <Skeleton height={44} />
              <Skeleton height={44} />
            </div>
            <Skeleton height={44} width="30%" className="mt-6" />
          </div>
          {/* Order History */}
          <div className={`rounded-xl p-6 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <Skeleton height={20} width="30%" className="mb-4" />
            {tableRows.slice(0, 3).map((_, i) => (
              <div key={i} className="py-3 border-b last:border-0">
                <div className="flex justify-between">
                  <Skeleton height={16} width="40%" />
                  <Skeleton height={16} width="20%" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
});
ProfileSkeleton.displayName = 'ProfileSkeleton';

export default AppSkeleton;
