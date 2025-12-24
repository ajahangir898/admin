import React from 'react';

// Base skeleton block with pulse animation
const Bone: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-gray-200 dark:bg-slate-700 animate-pulse rounded ${className}`} />
);

// Product card skeleton for store
export const ProductCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <Bone className="aspect-square" />
    <div className="p-4 space-y-3">
      <Bone className="h-4 w-3/4" />
      <Bone className="h-4 w-1/2" />
      <div className="flex gap-2 pt-2">
        <Bone className="h-9 flex-1 rounded-md" />
        <Bone className="h-9 flex-1 rounded-md" />
      </div>
    </div>
  </div>
);

// Table skeleton for admin pages
export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 5 }) => (
  <div className="w-full">
    <div className="flex gap-4 p-4 border-b border-gray-200 dark:border-slate-700">
      {Array.from({ length: cols }).map((_, i) => (
        <Bone key={i} className="h-4 flex-1" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, row) => (
      <div key={row} className="flex gap-4 p-4 border-b border-gray-100 dark:border-slate-800">
        {Array.from({ length: cols }).map((_, col) => (
          <Bone key={col} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

// Metric cards skeleton for dashboards
export const MetricsSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
        <Bone className="h-3 w-20 mb-3" />
        <Bone className="h-8 w-24 mb-2" />
        <Bone className="h-3 w-16" />
      </div>
    ))}
  </div>
);

// Image grid skeleton for gallery
export const ImageGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Bone className="aspect-square" />
        <div className="p-3 space-y-2">
          <Bone className="h-3 w-3/4" />
          <Bone className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

// Full page skeleton for admin
export const PageSkeleton: React.FC = () => (
  <div className="space-y-6 p-6">
    <div className="flex justify-between items-center">
      <Bone className="h-8 w-48" />
      <Bone className="h-10 w-32 rounded-lg" />
    </div>
    <MetricsSkeleton count={4} />
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
      <TableSkeleton rows={6} cols={5} />
    </div>
  </div>
);

// Hero banner skeleton
export const HeroSkeleton: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 mt-4">
    <Bone className="w-full aspect-[4/1] rounded-xl" />
  </div>
);

// Product grid skeleton for store home
export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);
