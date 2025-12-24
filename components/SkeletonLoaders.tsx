import React from "react";

// Lightweight skeleton helpers to satisfy imports without heavy dependencies.
const SkeletonBlock = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
);

const SkeletonRows = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonBlock key={i} className="h-4 w-full" />
    ))}
  </div>
);

export const StorePageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-50 p-6 space-y-4">
    <SkeletonBlock className="h-10 w-full" />
    <SkeletonBlock className="h-64 w-full" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonBlock key={i} className="h-48 w-full" />
      ))}
    </div>
  </div>
);

export const SkeletonTable: React.FC = () => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
    <SkeletonBlock className="h-6 w-40" />
    <SkeletonBlock className="h-10 w-full" />
    <SkeletonRows rows={6} />
  </div>
);

export const SkeletonGridMetrics: React.FC = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    {Array.from({ length: 4 }).map((_, i) => (
      <SkeletonBlock key={i} className="h-16 w-full" />
    ))}
  </div>
);

export const SkeletonImageGrid: React.FC = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
    {Array.from({ length: 8 }).map((_, i) => (
      <SkeletonBlock key={i} className="h-24 w-full" />
    ))}
  </div>
);

export const SkeletonCard: React.FC = () => (
  <div className="rounded-xl border border-gray-100 bg-white p-3 space-y-3 shadow-sm">
    <SkeletonBlock className="h-32 w-full" />
    <SkeletonBlock className="h-4 w-3/4" />
    <SkeletonBlock className="h-4 w-1/2" />
  </div>
);

export const AdminPageSkeleton: React.FC = () => (
  <div className="space-y-4">
    <SkeletonGridMetrics />
    <SkeletonTable />
  </div>
);

export const AdminDashboardSkeleton = AdminPageSkeleton;
export const AdminOrdersSkeleton = AdminPageSkeleton;
export const AdminProductsSkeleton = AdminPageSkeleton;
export const AdminSettingsSkeleton = AdminPageSkeleton;
export const AdminSkeleton = AdminPageSkeleton;

export const ImageSearchSkeleton: React.FC = () => (
  <div className="space-y-4">
    <SkeletonBlock className="h-10 w-64" />
    <SkeletonImageGrid />
  </div>
);

export const LandingPageSkeleton: React.FC = () => (
  <div className="space-y-4">
    <SkeletonBlock className="h-12 w-64" />
    <SkeletonBlock className="h-64 w-full" />
  </div>
);

export const OrderSuccessSkeleton: React.FC = () => (
  <div className="space-y-4">
    <SkeletonBlock className="h-12 w-48" />
    <SkeletonBlock className="h-40 w-full" />
  </div>
);

export const MobileNavSkeleton: React.FC = () => (
  <div className="flex items-center justify-around p-3 bg-white shadow">
    {Array.from({ length: 4 }).map((_, i) => (
      <SkeletonBlock key={i} className="h-6 w-6" />
    ))}
  </div>
);

export const StoreHeaderSkeleton: React.FC = () => (
  <div className="flex items-center gap-3 p-4 bg-white shadow-sm">
    <SkeletonBlock className="h-8 w-8" />
    <SkeletonBlock className="h-6 w-24" />
    <SkeletonBlock className="h-8 w-full" />
  </div>
);

export default {
  StorePageSkeleton,
  SkeletonTable,
  SkeletonGridMetrics,
  SkeletonImageGrid,
  SkeletonCard,
  AdminPageSkeleton,
  AdminDashboardSkeleton,
  AdminOrdersSkeleton,
  AdminProductsSkeleton,
  AdminSettingsSkeleton,
  AdminSkeleton,
  ImageSearchSkeleton,
  LandingPageSkeleton,
  OrderSuccessSkeleton,
  MobileNavSkeleton,
  StoreHeaderSkeleton,
};
