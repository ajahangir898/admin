import { useEffect, useCallback, useRef } from 'react';
import { onDataRefresh } from '../services/DataService';

type RefreshHandler = (key: string, tenantId?: string) => void;

/**
 * Hook to subscribe to data refresh events from DataService
 * Use this in components that need to react when Admin updates data
 * 
 * @param handler - Called when any data is saved via DataService
 * @param keys - Optional array of keys to filter (e.g., ['products', 'orders'])
 * @param tenantId - Optional tenant ID to filter by
 */
export const useDataRefresh = (
  handler: RefreshHandler,
  keys?: string[],
  tenantId?: string
) => {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const unsubscribe = onDataRefresh((key, eventTenantId) => {
      // Filter by keys if specified
      if (keys && keys.length > 0 && !keys.includes(key)) {
        return;
      }
      // Filter by tenant if specified
      if (tenantId && eventTenantId && eventTenantId !== tenantId) {
        return;
      }
      handlerRef.current(key, eventTenantId);
    });

    return unsubscribe;
  }, [keys?.join(','), tenantId]);
};

/**
 * Hook that returns a function to trigger a refresh after a short delay
 * Useful for debouncing multiple rapid updates
 */
export const useDataRefreshDebounced = (
  handler: RefreshHandler,
  debounceMs = 500,
  keys?: string[],
  tenantId?: string
) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingKeyRef = useRef<string | null>(null);
  const pendingTenantRef = useRef<string | undefined>(undefined);

  const debouncedHandler = useCallback((key: string, eventTenantId?: string) => {
    pendingKeyRef.current = key;
    pendingTenantRef.current = eventTenantId;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      if (pendingKeyRef.current) {
        handler(pendingKeyRef.current, pendingTenantRef.current);
      }
      timerRef.current = null;
      pendingKeyRef.current = null;
    }, debounceMs);
  }, [handler, debounceMs]);

  useDataRefresh(debouncedHandler, keys, tenantId);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
};
