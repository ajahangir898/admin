/**
 * useNavigation - URL routing and view navigation extracted from App.tsx
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Product, User } from '../types';
import { isAdminRole } from '../utils/appHelpers';

export type ViewState = 'store' | 'detail' | 'checkout' | 'success' | 'profile' | 'admin' | 'landing_preview' | 'admin-login';

// Parse order ID from URL for success page
export function getOrderIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('orderId');
}

// Check if we're on the admin subdomain
const isAdminSubdomain = typeof window !== 'undefined' && 
  (window.location.hostname === 'admin.systemnextit.com' || 
   window.location.hostname.startsWith('admin.'));

interface UseNavigationOptions {
  products: Product[];
  user: User | null;
}

export function useNavigation({ products, user }: UseNavigationOptions) {
  // Start with admin-login if on admin subdomain, otherwise store
  const [currentView, setCurrentView] = useState<ViewState>(isAdminSubdomain ? 'admin-login' : 'store');
  const [adminSection, setAdminSection] = useState('dashboard');
  const [urlCategoryFilter, setUrlCategoryFilter] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [storeSearchQuery, setStoreSearchQuery] = useState('');

  const currentViewRef = useRef<ViewState>(currentView);
  const userRef = useRef<User | null>(user);

  useEffect(() => { currentViewRef.current = currentView; }, [currentView]);
  useEffect(() => { userRef.current = user; }, [user]);

  const handleStoreSearchChange = useCallback((value: string) => {
    setStoreSearchQuery(value);
    if (currentViewRef.current !== 'store') {
      setSelectedProduct(null);
      setCurrentView('store');
    }
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, []);

  const syncViewWithLocation = useCallback((path?: string) => {
    const trimmedPath = (path ?? window.location.pathname).replace(/^\/+|\/+$/g, '');
    const activeView = currentViewRef.current;
    const activeUser = userRef.current;

    // Handle admin login route FIRST
    if (trimmedPath === 'admin/login') {
      if (activeView !== 'admin-login') {
        setCurrentView('admin-login');
      }
      return;
    }

    // Handle checkout route
    if (trimmedPath === 'checkout') {
      if (activeView !== 'checkout') {
        setCurrentView('checkout');
      }
      return;
    }

    // Handle success-order route
    if (trimmedPath === 'success-order') {
      if (activeView !== 'success') {
        setCurrentView('success');
      }
      return;
    }

    // Handle /products route with optional category filter
    if (trimmedPath === 'products') {
      const searchParams = new URLSearchParams(window.location.search);
      const categorySlug = searchParams.get('categories');
      if (categorySlug) {
        setUrlCategoryFilter(categorySlug);
        if (!activeView.startsWith('admin')) {
          setSelectedProduct(null);
          setCurrentView('store');
        }
        return;
      } else {
        window.history.replaceState({}, '', '/');
        setUrlCategoryFilter(null);
        if (!activeView.startsWith('admin')) {
          setSelectedProduct(null);
          setCurrentView('store');
        }
        return;
      }
    }

    if (!trimmedPath) {
      setUrlCategoryFilter(null);
      // On admin subdomain, stay on admin-login if not logged in
      if (isAdminSubdomain) {
        if (!activeView.startsWith('admin') && activeView !== 'admin-login') {
          setCurrentView('admin-login');
        }
        return;
      }
      if (!activeView.startsWith('admin')) {
        setSelectedProduct(null);
        setCurrentView('store');
      }
      return;
    }

    if (trimmedPath === 'admin') {
      // Only allow admin access on admin subdomain
      if (isAdminSubdomain && isAdminRole(activeUser?.role)) {
        setCurrentView('admin');
      } else if (!isAdminSubdomain) {
        // Redirect to admin subdomain
        window.location.href = 'https://admin.systemnextit.com';
      } else {
        setCurrentView('admin-login');
      }
      return;
    }

    const matchedProduct = products.find(p => p.slug === trimmedPath);
    if (matchedProduct) {
      setSelectedProduct(matchedProduct);
      setCurrentView('detail');
      return;
    }

    if (activeView === 'admin-login') {
      return;
    }

    window.history.replaceState({}, '', '/');
    if (!activeView.startsWith('admin')) {
      setSelectedProduct(null);
      setCurrentView('store');
    }
  }, [products]);

  // Listen for popstate
  useEffect(() => {
    const handlePopState = () => syncViewWithLocation();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [syncViewWithLocation]);

  // Initial sync
  useEffect(() => {
    syncViewWithLocation(window.location.pathname);
  }, [products, syncViewWithLocation]);

  // Ensure URL matches view
  useEffect(() => {
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
    if (path === 'admin/login') return;
    
    if (currentView === 'store' && window.location.pathname !== '/' && !window.location.pathname.includes('checkout') && !window.location.pathname.includes('success-order')) {
      window.history.replaceState({}, '', '/');
    }
  }, [currentView]);

  // Handle notification navigation
  useEffect(() => {
    const handleNavigateToOrder = (event: CustomEvent<{ orderId: string; tenantId?: string }>) => {
      const { orderId } = event.detail;
      console.log('[App] Navigate to order:', orderId);
      setCurrentView('admin');
      setAdminSection('orders');
      window.sessionStorage.setItem('highlightOrderId', orderId);
    };
    
    window.addEventListener('navigate-to-order', handleNavigateToOrder as EventListener);
    return () => {
      window.removeEventListener('navigate-to-order', handleNavigateToOrder as EventListener);
    };
  }, []);

  const handleProductClick = useCallback((product: Product) => {
    setSelectedProduct(product);
    setCurrentView('detail');
    if (product.slug) {
      window.history.pushState({ slug: product.slug }, '', `/${product.slug}`);
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleCategoryFilterChange = useCallback((categorySlug: string | null) => {
    if (categorySlug) {
      window.history.pushState({}, '', `/products?categories=${categorySlug}`);
      setUrlCategoryFilter(categorySlug);
    } else {
      window.history.pushState({}, '', '/');
      setUrlCategoryFilter(null);
    }
  }, []);

  return {
    // State
    currentView,
    setCurrentView,
    adminSection,
    setAdminSection,
    urlCategoryFilter,
    setUrlCategoryFilter,
    selectedProduct,
    setSelectedProduct,
    storeSearchQuery,
    setStoreSearchQuery,
    // Handlers
    handleStoreSearchChange,
    syncViewWithLocation,
    handleProductClick,
    handleCategoryFilterChange,
    // Refs
    currentViewRef,
  };
}
