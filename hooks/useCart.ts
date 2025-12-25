/**
 * useCart - Cart state and handlers extracted from App.tsx
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import type { Product, User, ProductVariantSelection } from '../types';
import { DataService } from '../services/DataService';
import { toast } from 'react-hot-toast';
import { CART_STORAGE_KEY, ensureVariantSelection } from '../utils/appHelpers';

interface UseCartOptions {
  user: User | null;
  products: Product[];
  tenantId?: string;
}

// Get tenant-specific cart storage key
const getCartStorageKey = (tenantId?: string) => {
  if (!tenantId) return CART_STORAGE_KEY;
  return `${CART_STORAGE_KEY}-${tenantId}`;
};

export function useCart({ user, products, tenantId }: UseCartOptions) {
  const cartStorageKey = useMemo(() => getCartStorageKey(tenantId), [tenantId]);
  
  const [cartItems, setCartItems] = useState<number[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = window.localStorage.getItem(cartStorageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Unable to parse stored cart', error);
      return [];
    }
  });

  // Re-load cart when tenant changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(cartStorageKey);
      setCartItems(stored ? JSON.parse(stored) : []);
    } catch (error) {
      console.warn('Unable to parse stored cart', error);
      setCartItems([]);
    }
  }, [cartStorageKey]);

  // Persist cart to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(cartStorageKey, JSON.stringify(cartItems));
    } catch (error) {
      console.warn('Unable to persist cart locally', error);
    }
  }, [cartItems, cartStorageKey]);

  // Load cart from server when user logs in
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const remoteCart = await DataService.get('cart', [], user.id);
        if (!cancelled && Array.isArray(remoteCart)) {
          setCartItems(remoteCart);
        }
      } catch (error) {
        console.warn('Failed to load remote cart', error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Persist cart to server
  const persistCartRemotely = useCallback(async (items: number[]) => {
    if (!user?.id) return;
    try {
      await DataService.save('cart', items, user.id);
    } catch (error) {
      console.warn('Failed to sync cart', error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    void persistCartRemotely(cartItems);
  }, [cartItems, persistCartRemotely, user?.id]);

  // Handlers
  const handleCartToggle = useCallback((productId: number, options?: { silent?: boolean }) => {
    setCartItems(prev => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter(id => id !== productId) : [...prev, productId];
      if (!options?.silent) {
        if (exists) {
          toast('Removed from cart');
        } else {
          toast.success('Added to cart');
        }
      }
      return next;
    });
  }, []);

  const handleAddProductToCart = useCallback((
    product: Product,
    quantity: number = 1,
    variant?: ProductVariantSelection | null,
    options?: { silent?: boolean }
  ) => {
    setCartItems(prev => {
      if (prev.includes(product.id)) {
        if (!options?.silent) {
          toast('Already in cart');
        }
        return prev;
      }
      if (!options?.silent) {
        toast.success(`${product.name} added to cart`);
      }
      return [...prev, product.id];
    });
  }, []);

  const handleCheckoutFromCart = useCallback((
    productId: number,
    onCheckout: (product: Product, quantity: number, variant: ProductVariantSelection) => void
  ) => {
    const targetProduct = products.find(p => p.id === productId);
    if (!targetProduct) {
      toast.error('Product unavailable for checkout');
      return;
    }
    onCheckout(targetProduct, 1, ensureVariantSelection(targetProduct));
  }, [products]);

  return {
    cartItems,
    setCartItems,
    handleCartToggle,
    handleAddProductToCart,
    handleCheckoutFromCart,
  };
}
