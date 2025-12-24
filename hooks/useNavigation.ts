/**
 * useNavigation - URL routing and view navigation extracted from App.tsx
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Product, User } from '../types';
import { isAdminRole } from '../utils/appHelpers';

export type ViewState = 'store' | 'detail' | 'checkout' | 'success' | 'profile' | 'admin' | 'landing_preview' | 'image-search' | 'admin-login';

interface UseNavigationOptions {
  products: Product[];
  user: User | null;
}

export function useNavigation({ products, user }: UseNavigationOptions) {
  const [currentView, setCurrentView] = useState<ViewState>('store');
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
      if (!activeView.startsWith('admin')) {
        setSelectedProduct(null);
        setCurrentView('store');
      }
      return;
    }

    if (trimmedPath === 'admin') {
      if (isAdminRole(activeUser?.role)) {
        setCurrentView('admin');
      } else {
        window.history.replaceState({}, '', '/');
        if (!activeView.startsWith('admin')) setCurrentView('store');
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
    
    if (currentView === 'store' && window.location.pathname !== '/') {
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
