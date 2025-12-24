import React, { memo } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const metricPlaceholders = Array.from({ length: 4 });
const productPlaceholders = Array.from({ length: 6 });
const tableRows = Array.from({ length: 5 });

// Shared skeleton theme wrapper
const SkeletonWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SkeletonTheme baseColor="#acf9ffff" highlightColor="#dadadaff">
    {children}
  </SkeletonTheme>
);

// Login Skeleton - Lightweight skeleton for login page
export const LoginSkeleton: React.FC = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
    <div className="w-full max-w-md p-8">
      <div className="bg-white rounded-3xl p-8 space-y-6 shadow-lg">
        <Skeleton height={64} width={64} circle className="mx-auto mb-4" />
        <Skeleton height={32} width="60%" className="mx-auto mb-2" />
        <Skeleton height={20} width="80%" className="mx-auto mb-8" />
        <Skeleton height={48} className="mb-4" />
        <Skeleton height={48} className="mb-6" />
        <Skeleton height={48} />
      </div>
    </div>
  </div>
));
LoginSkeleton.displayName = 'LoginSkeleton';

// Store Skeleton - Optimized for store pages (Legacy - keep for backwards compatibility)
export const StoreSkeleton: React.FC = memo(() => (
  <SkeletonWrapper>
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="shadow-sm border-b bg-white p-4">
        <Skeleton height={32} width={180} className="mb-3" />
        <Skeleton height={40} width="100%" />
      </div>
      
      {/* Content Grid */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {productPlaceholders.map((_, i) => (
            <div key={i} className="rounded-lg p-3 bg-white">
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

// StorePageSkeleton - Full page skeleton with actual header and footer structure
// This matches the real site design during initial load
export const StorePageSkeleton: React.FC = memo(() => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    {/* ===== HEADER SKELETON - Matches actual StoreHeader structure ===== */}
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Desktop Header */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          {/* Top Row: Logo, Search, Actions */}
          <div className="flex items-center justify-between gap-6 py-3">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-6 w-32 rounded bg-gray-200 animate-pulse" />
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="flex items-center h-11 rounded-full border-2 border-green-500 bg-white overflow-hidden">
                <div className="flex-1 px-4">
                  <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
                </div>
                <div className="flex items-center gap-2 px-3 border-l border-gray-200">
                  <div className="h-6 w-6 rounded bg-gray-200 animate-pulse" />
                  <div className="h-6 w-6 rounded bg-gray-200 animate-pulse" />
                </div>
                <div className="h-11 w-11 bg-green-500 flex items-center justify-center">
                  <div className="h-5 w-5 rounded bg-green-400" />
                </div>
              </div>
            </div>
            
            {/* Actions: Wishlist, Cart, Login */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-gray-200 animate-pulse" />
                <div className="h-4 w-14 rounded bg-gray-200 animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-gray-200 animate-pulse" />
                <div className="h-4 w-8 rounded bg-gray-200 animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-gray-200 animate-pulse" />
                <div className="h-4 w-10 rounded bg-gray-200 animate-pulse" />
              </div>
            </div>
          </div>
          
          {/* Navigation Row */}
          <div className="flex items-center gap-8 py-2 border-t border-gray-100">
            {['Home', 'Categories', 'Products', 'Track Order'].map((item, i) => (
              <div key={i} className="h-4 rounded bg-gray-200 animate-pulse" style={{ width: item.length * 8 + 16 }} />
            ))}
          </div>
        </div>
      </div>
      
      {/* Mobile Header */}
      <div className="md:hidden px-4 py-3 space-y-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-5 w-24 rounded bg-gray-200 animate-pulse" />
          </div>
          {/* Actions */}
          <div className="flex items-center gap-4">
            <div className="h-6 w-6 rounded bg-gray-200 animate-pulse" />
            <div className="h-6 w-6 rounded bg-gray-200 animate-pulse" />
            <div className="h-6 w-6 rounded bg-gray-200 animate-pulse" />
          </div>
        </div>
        {/* Mobile Search */}
        <div className="flex items-center h-10 rounded-full border border-gray-200 bg-white overflow-hidden">
          <div className="flex-1 px-4">
            <div className="h-3 w-28 rounded bg-gray-200 animate-pulse" />
          </div>
          <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center mr-0.5">
            <div className="h-4 w-4 rounded bg-green-400" />
          </div>
        </div>
      </div>
    </header>

    {/* ===== MAIN CONTENT SKELETON ===== */}
    <main className="flex-1">
      {/* Hero/Carousel Skeleton */}
      <div className="relative h-48 md:h-80 lg:h-96 bg-gradient-to-r from-gray-100 to-gray-200 overflow-hidden">
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <div className="max-w-lg space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gray-300 animate-pulse" />
                <div className="h-4 w-24 rounded bg-gray-300 animate-pulse" />
              </div>
              <div className="h-10 w-64 rounded bg-gray-300 animate-pulse" />
              <div className="h-5 w-80 rounded bg-gray-300 animate-pulse" />
              <div className="h-11 w-32 rounded-full bg-green-500 animate-pulse" />
            </div>
          </div>
        </div>
        {/* Carousel dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className={`h-2 w-2 rounded-full ${i === 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Categories Section */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {['Earbuds', 'Gaming', 'Camera', 'Phones', 'Watches', 'Power Bank', 'Audio', 'Charger'].map((cat, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white whitespace-nowrap">
              <div className="h-5 w-5 rounded bg-gray-200 animate-pulse" />
              <div className="h-4 rounded bg-gray-200 animate-pulse" style={{ width: cat.length * 7 + 8 }} />
            </div>
          ))}
        </div>

        {/* Flash Sales Section */}
        <section className="rounded-2xl border border-red-100 bg-white p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 rounded bg-red-200 animate-pulse" />
              <div className="h-6 w-28 rounded bg-gray-200 animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="h-10 w-12 rounded-lg bg-green-100 animate-pulse flex items-center justify-center">
                  <div className="h-5 w-6 rounded bg-green-200" />
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((_, i) => (
              <div key={i} className="rounded-xl bg-gray-50 p-3 space-y-3">
                <div className="aspect-square rounded-lg bg-gray-200 animate-pulse" />
                <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
                <div className="h-3 w-2/3 rounded bg-gray-200 animate-pulse" />
                <div className="flex items-center justify-between">
                  <div className="h-5 w-16 rounded bg-gray-200 animate-pulse" />
                  <div className="h-8 w-20 rounded-full bg-green-500 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Best Sale Products */}
        <section className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 w-40 rounded bg-gray-200 animate-pulse" />
            <div className="h-8 w-20 rounded-full bg-gray-200 animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((_, i) => (
              <div key={i} className="rounded-xl bg-gray-50 p-3 space-y-3">
                <div className="aspect-square rounded-lg bg-gray-200 animate-pulse" />
                <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
                <div className="h-3 w-2/3 rounded bg-gray-200 animate-pulse" />
                <div className="flex items-center justify-between">
                  <div className="h-5 w-16 rounded bg-gray-200 animate-pulse" />
                  <div className="h-8 w-20 rounded-full bg-green-500 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>

    {/* ===== FOOTER SKELETON - Matches Style 3 Footer structure ===== */}
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr,1fr,1fr] gap-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse" />
              <div className="space-y-1">
                <div className="h-3 w-24 rounded bg-gray-200 animate-pulse" />
                <div className="h-4 w-48 rounded bg-gray-200 animate-pulse" />
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-4">
            <div className="h-5 w-24 rounded bg-green-200 animate-pulse" />
            <div className="space-y-3">
              {['About Us', 'Order Tracking', 'Shipping & Delivery', 'Contact'].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-4 rounded bg-gray-200 animate-pulse" style={{ width: 80 + i * 20 }} />
                  <div className="h-4 w-4 rounded bg-gray-200 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Useful Links */}
          <div className="space-y-4">
            <div className="h-5 w-24 rounded bg-green-200 animate-pulse" />
            <div className="space-y-3">
              {['Return & Refund', 'Privacy Policy', 'FAQ', 'Why Shop With Us'].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-4 rounded bg-gray-200 animate-pulse" style={{ width: 100 + i * 15 }} />
                  <div className="h-4 w-4 rounded bg-gray-200 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <div className="h-4 w-64 mx-auto rounded bg-gray-200 animate-pulse" />
        </div>
      </div>
    </footer>

    {/* Mobile Bottom Nav Skeleton */}
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-100 h-16 flex justify-around items-center md:hidden z-50">
      {[1, 2, 3, 4, 5].map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div className="h-6 w-6 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-2 w-10 rounded bg-gray-200 animate-pulse" />
        </div>
      ))}
    </div>
  </div>
));
StorePageSkeleton.displayName = 'StorePageSkeleton';

const productCardPlaceholders = Array.from({ length: 8 });

export const HeroSectionSkeleton: React.FC = memo(() => (
  <SkeletonWrapper>
    <section className="relative overflow-hidden">
      <Skeleton height={420} className="w-full" />
      <div className="absolute inset-0 flex flex-col justify-end gap-4 p-6 md:p-10">
        <Skeleton height={24} width="18%" />
        <Skeleton height={48} width="40%" />
        <div className="flex flex-wrap gap-3">
          <Skeleton height={44} width={140} />
          <Skeleton height={44} width={140} />
        </div>
      </div>
    </section>
  </SkeletonWrapper>
));
HeroSectionSkeleton.displayName = 'HeroSectionSkeleton';

export const CategoriesSectionSkeleton: React.FC = memo(() => (
  <SkeletonWrapper>
    <section className="rounded-3xl border border-gray-200 bg-white/70 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <Skeleton height={28} width="18%" />
        <Skeleton height={36} width={100} />
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {Array.from({ length: 16 }).map((_, index) => (
          <div key={index} className="flex flex-col items-center gap-3 rounded-2xl bg-white/90 p-4 shadow">
            <Skeleton height={60} width={60} circle />
            <Skeleton height={14} width="80%" />
          </div>
        ))}
      </div>
    </section>
  </SkeletonWrapper>
));
CategoriesSectionSkeleton.displayName = 'CategoriesSectionSkeleton';

export const FlashSalesSkeleton: React.FC = memo(() => (
  <SkeletonWrapper>
    <section className="rounded-3xl border border-red-100 bg-white/80 p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton height={24} width={24} circle />
          <Skeleton height={26} width={160} />
        </div>
        <div className="flex gap-3">
          <Skeleton height={44} width={60} />
          <Skeleton height={44} width={60} />
          <Skeleton height={44} width={60} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {productCardPlaceholders.map((_, index) => (
          <div key={index} className="rounded-2xl bg-white p-4 shadow">
            <Skeleton height={160} className="rounded-xl mb-3" />
            <Skeleton height={18} className="mb-2" />
            <Skeleton height={14} width="80%" className="mb-2" />
            <div className="flex items-center justify-between pt-2">
              <Skeleton height={20} width="30%" />
              <Skeleton height={36} width="40%" />
            </div>
          </div>
        ))}
      </div>
    </section>
  </SkeletonWrapper>
));
FlashSalesSkeleton.displayName = 'FlashSalesSkeleton';

export const ProductGridSkeleton: React.FC = memo(() => (
  <SkeletonWrapper>
    <section className="rounded-3xl border border-gray-200 bg-white/80 p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <Skeleton height={26} width={200} />
        <Skeleton height={36} width={100} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {productCardPlaceholders.map((_, index) => (
          <div key={index} className="rounded-2xl bg-white p-4 shadow">
            <Skeleton height={160} className="rounded-xl mb-3" />
            <Skeleton height={18} className="mb-2" />
            <Skeleton height={14} width="75%" className="mb-2" />
            <div className="flex items-center justify-between pt-2">
              <Skeleton height={20} width="32%" />
              <Skeleton height={36} width="42%" />
            </div>
          </div>
        ))}
      </div>
    </section>
  </SkeletonWrapper>
));
ProductGridSkeleton.displayName = 'ProductGridSkeleton';

export const PromoBannerSkeleton: React.FC = memo(() => (
  <SkeletonWrapper>
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-500/60 to-pink-500/60 p-8">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <Skeleton height={20} width="30%" />
          <Skeleton height={36} width="70%" />
          <Skeleton height={16} count={3} />
          <div className="flex gap-3">
            <Skeleton height={44} width={140} />
            <Skeleton height={44} width={140} />
          </div>
        </div>
        <div className="flex items-center justify-center">
          <Skeleton height={220} width={220} circle />
        </div>
      </div>
    </section>
  </SkeletonWrapper>
));
PromoBannerSkeleton.displayName = 'PromoBannerSkeleton';

export const SearchResultsSkeleton: React.FC = memo(() => (
  <SkeletonWrapper>
    <section className="rounded-3xl border border-gray-200 bg-white/80 p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Skeleton height={28} width={240} />
        <Skeleton height={40} width={180} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {productCardPlaceholders.map((_, index) => (
          <div key={index} className="rounded-2xl bg-white p-4 shadow">
            <Skeleton height={160} className="rounded-xl mb-3" />
            <Skeleton height={18} className="mb-2" />
            <Skeleton height={14} width="70%" className="mb-2" />
            <div className="flex items-center justify-between pt-2">
              <Skeleton height={20} width="32%" />
              <Skeleton height={36} width="42%" />
            </div>
          </div>
        ))}
      </div>
    </section>
  </SkeletonWrapper>
));
SearchResultsSkeleton.displayName = 'SearchResultsSkeleton';

// Admin Skeleton - Optimized for admin dashboard
export const AdminSkeleton: React.FC = memo(() => (
  <SkeletonWrapper>
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="hidden lg:block w-64 bg-white border-r border-gray-200 p-4">
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
            <div key={i} className="rounded-xl p-4 bg-white border border-gray-200">
              <Skeleton height={16} width="50%" className="mb-3" />
              <Skeleton height={28} />
            </div>
          ))}
        </div>
        {/* Table */}
        <div className="rounded-xl p-5 bg-white border border-gray-200">
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
export const AdminPageSkeleton: React.FC = memo(() => (
  <SkeletonWrapper>
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <Skeleton height={32} width={200} />
        <Skeleton height={40} width={120} />
      </div>
      {/* Metrics Row */}
      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        {metricPlaceholders.map((_, i) => (
          <div key={i} className="rounded-xl p-4 bg-white border border-gray-200">
            <Skeleton height={14} width="50%" className="mb-2" />
            <Skeleton height={24} width="70%" />
          </div>
        ))}
      </div>
      {/* Content Area */}
      <div className="rounded-xl p-5 bg-white border border-gray-200">
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
  <SkeletonWrapper>
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
          <div key={i} className="rounded-xl p-4 bg-white border border-gray-200">
            <Skeleton height={12} width="60%" className="mb-2" />
            <Skeleton height={28} width="50%" />
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-white border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <Skeleton height={40} />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-4 border-b border-gray-100 flex items-center gap-4">
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
  <SkeletonWrapper>
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
          <div key={i} className="rounded-xl bg-white border border-gray-200 overflow-hidden">
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
  <SkeletonWrapper>
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
          <div key={i} className="rounded-xl p-5 bg-white border border-gray-200">
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
        <div className="rounded-xl p-5 bg-white border border-gray-200">
          <Skeleton height={20} width="40%" className="mb-4" />
          <Skeleton height={200} />
        </div>
        <div className="rounded-xl p-5 bg-white border border-gray-200">
          <Skeleton height={20} width="40%" className="mb-4" />
          <Skeleton height={200} />
        </div>
      </div>
      {/* Recent Orders */}
      <div className="rounded-xl p-5 bg-white border border-gray-200">
        <Skeleton height={20} width="25%" className="mb-4" />
        {tableRows.map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
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
  <SkeletonWrapper>
    <div className="p-6 space-y-6">
      <Skeleton height={32} width={180} />
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Form Section */}
        <div className="rounded-xl p-6 bg-white border border-gray-200 space-y-4">
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
        <div className="rounded-xl p-6 bg-white border border-gray-200">
          <Skeleton height={20} width="30%" className="mb-4" />
          <Skeleton height={200} />
        </div>
      </div>
    </div>
  </SkeletonWrapper>
));
AdminSettingsSkeleton.displayName = 'AdminSettingsSkeleton';

// Image Search Skeleton
export const ImageSearchSkeleton: React.FC = memo(() => (
  <SkeletonWrapper>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white border-b">
        <Skeleton height={32} width={180} />
      </div>
      {/* Upload Area */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="rounded-2xl p-8 bg-white border-2 border-dashed text-center">
          <Skeleton height={64} width={64} circle className="mx-auto mb-4" />
          <Skeleton height={24} width="60%" className="mx-auto mb-2" />
          <Skeleton height={16} width="80%" className="mx-auto" />
        </div>
        {/* Results Grid */}
        <div className="mt-8 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {productPlaceholders.map((_, i) => (
            <div key={i} className="rounded-lg overflow-hidden bg-white">
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
export const LandingPageSkeleton: React.FC = memo(() => (
  <SkeletonWrapper>
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[60vh] bg-gradient-to-b from-gray-100 to-gray-200">
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
export const OrderSuccessSkeleton: React.FC = memo(() => (
  <SkeletonWrapper>
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4 p-8 rounded-2xl bg-white text-center">
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
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-2 flex justify-around lg:hidden">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="flex flex-col items-center p-2">
        <Skeleton height={24} width={24} circle />
        <Skeleton height={10} width={40} className="mt-1" />
      </div>
    ))}
  </div>
));
MobileNavSkeleton.displayName = 'MobileNavSkeleton';

// SkeletonCard - Individual product card skeleton for grids
export const SkeletonCard: React.FC = () => (
  <div className="rounded-2xl p-4 shadow-lg bg-white">
    <Skeleton height={180} className="rounded-xl" />
    <Skeleton height={20} className="mt-4" />
    <Skeleton height={16} width="70%" className="mt-2" />
    <div className="flex items-center justify-between mt-4">
      <Skeleton height={30} width="40%" />
      <Skeleton height={36} width="36%" />
    </div>
  </div>
);

// StoreHeaderSkeleton - Skeleton for store header during lazy load
export const StoreHeaderSkeleton: React.FC = memo(() => (
  <div className="sticky top-0 z-50 bg-white shadow-sm">
    {/* Admin notice bar placeholder */}
    <div className="h-8 bg-gray-50 animate-pulse" />
    
    {/* Mobile Header */}
    <div className="md:hidden px-3 py-2 space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-8 w-28 rounded bg-gray-200 animate-pulse" />
        <div className="flex gap-3">
          <div className="h-6 w-6 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-6 w-6 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-6 w-6 rounded-full bg-gray-200 animate-pulse" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-6 rounded bg-gray-200 animate-pulse" />
        <div className="flex-1 h-10 rounded-lg bg-gray-200 animate-pulse" />
      </div>
    </div>
    
    {/* Desktop Header */}
    <div className="hidden md:block">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="h-10 w-36 rounded bg-gray-200 animate-pulse" />
          <div className="flex-1 max-w-2xl h-10 rounded-full bg-gray-200 animate-pulse" />
          <div className="flex gap-6">
            <div className="h-8 w-20 rounded bg-gray-200 animate-pulse" />
            <div className="h-8 w-16 rounded bg-gray-200 animate-pulse" />
            <div className="h-8 w-16 rounded bg-gray-200 animate-pulse" />
          </div>
        </div>
      </div>
      <div className="border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex gap-8">
          {[80, 100, 70, 90].map((w, i) => (
            <div key={i} className="h-4 rounded bg-gray-200 animate-pulse" style={{ width: w }} />
          ))}
        </div>
      </div>
    </div>
  </div>
));
StoreHeaderSkeleton.displayName = 'StoreHeaderSkeleton';

// StoreFooterSkeleton - Skeleton for store footer during lazy load
export const StoreFooterSkeleton: React.FC = memo(() => (
  <div className="bg-gray-100 mt-auto">
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map((col) => (
          <div key={col} className="space-y-4">
            <div className="h-5 w-24 rounded bg-gray-300 animate-pulse" />
            {[1, 2, 3, 4].map((row) => (
              <div key={row} className="h-3 rounded bg-gray-200 animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-8 pt-8 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="h-4 w-48 rounded bg-gray-300 animate-pulse" />
          <div className="flex gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 w-8 rounded-full bg-gray-300 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
));
StoreFooterSkeleton.displayName = 'StoreFooterSkeleton';

// MobileBottomNavSkeleton - Skeleton for mobile bottom navigation
export const MobileBottomNavSkeleton: React.FC = memo(() => (
  <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200 h-[60px] flex justify-around items-center md:hidden z-50">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex flex-col items-center gap-1">
        <div className="h-6 w-6 rounded-full bg-gray-200 animate-pulse" />
        <div className="h-2 w-8 rounded bg-gray-200 animate-pulse" />
      </div>
    ))}
  </div>
));
MobileBottomNavSkeleton.displayName = 'MobileBottomNavSkeleton';

// SkeletonTableRow - Skeleton for table rows
export const SkeletonTableRow: React.FC<{ columns: number }> = ({ columns }) => (
  <div className="flex items-center justify-between border-b pb-4 last:pb-0 last:border-b-0 border-gray-100">
    {Array.from({ length: columns }).map((_, i) => (
      <span key={i}>
        <Skeleton height={18} width={`${Math.random() * 30 + 20}%`} />
      </span>
    ))}
  </div>
);

// SkeletonTable - Full table skeleton
export const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({ rows = 5, columns = 4 }) => (
  <div className="rounded-3xl p-6 shadow-xl bg-white">
    <Skeleton height={26} width="30%" className="mb-6" />
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonTableRow key={index} columns={columns} />
      ))}
    </div>
  </div>
);

// SkeletonMetricCard - Skeleton for stat/metric cards
export const SkeletonMetricCard: React.FC = () => (
  <div className="rounded-2xl p-5 shadow-lg bg-white">
    <Skeleton height={16} width="50%" />
    <Skeleton height={32} className="mt-4" />
    <Skeleton height={14} width="40%" className="mt-3" />
  </div>
);

// SkeletonGridMetrics - Skeleton grid for metric cards
export const SkeletonGridMetrics: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonMetricCard key={index} />
    ))}
  </div>
);

// SkeletonForm - Skeleton for form fields
export const SkeletonForm: React.FC<{ fields?: number }> = ({ fields = 5 }) => (
  <div className="rounded-2xl p-6 space-y-4 bg-white">
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
export const SkeletonImageGrid: React.FC<{ count?: number; cols?: string }> = memo(({ count = 6, cols = 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' }) => (
  <div className={`grid ${cols} gap-4`}>
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="rounded-lg overflow-hidden bg-gray-100">
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
export const ProductDetailSkeleton: React.FC = memo(() => (
  <SkeletonWrapper>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white">
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
  </SkeletonWrapper>
));
ProductDetailSkeleton.displayName = 'ProductDetailSkeleton';

// Checkout Skeleton - for checkout pages
export const CheckoutSkeleton: React.FC = memo(() => (
  <SkeletonWrapper>
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Order Summary */}
        <div className="rounded-xl p-6 bg-white">
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
        <div className="rounded-xl p-6 bg-white">
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
  </SkeletonWrapper>
));
CheckoutSkeleton.displayName = 'CheckoutSkeleton';

// Dashboard Stats Skeleton - for admin dashboard metrics
export const DashboardStatsSkeleton: React.FC = memo(() => (
  <SkeletonWrapper>
    <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
      {metricPlaceholders.map((_, i) => (
        <div key={i} className="rounded-xl p-5 bg-white shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <Skeleton height={14} width="50%" />
            <Skeleton height={32} width={32} circle />
          </div>
          <Skeleton height={28} width="60%" />
          <Skeleton height={12} width="40%" className="mt-2" />
        </div>
      ))}
    </div>
  </SkeletonWrapper>
));
DashboardStatsSkeleton.displayName = 'DashboardStatsSkeleton';

// Profile Skeleton - for user profile pages
export const ProfileSkeleton: React.FC = memo(() => (
  <SkeletonWrapper>
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        {/* Profile Header */}
        <div className="rounded-xl p-6 bg-white text-center">
          <Skeleton height={96} width={96} circle className="mx-auto mb-4" />
          <Skeleton height={24} width="40%" className="mx-auto mb-2" />
          <Skeleton height={16} width="30%" className="mx-auto" />
        </div>
        {/* Profile Form */}
        <div className="rounded-xl p-6 bg-white">
          <Skeleton height={20} width="25%" className="mb-4" />
          <div className="space-y-4">
            <Skeleton height={44} />
            <Skeleton height={44} />
            <Skeleton height={44} />
          </div>
          <Skeleton height={44} width="30%" className="mt-6" />
        </div>
        {/* Order History */}
        <div className="rounded-xl p-6 bg-white">
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
  </SkeletonWrapper>
));
ProfileSkeleton.displayName = 'ProfileSkeleton';
