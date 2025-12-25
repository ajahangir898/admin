/**
 * App utility functions - extracted from App.tsx for better code splitting
 */

import type { Product, User, ProductVariantSelection } from '../types';
import { slugify } from '../services/slugify';
import { DEFAULT_TENANT_ID, RESERVED_TENANT_SLUGS } from '../constants';

// --- Constants ---
export const FALLBACK_VARIANT: ProductVariantSelection = { color: 'Default', size: 'Standard' };
export const SESSION_STORAGE_KEY = 'seven-days-user';
export const ACTIVE_TENANT_STORAGE_KEY = 'seven-days-active-tenant';
export const CART_STORAGE_KEY = 'seven-days-cart';
export const PRIMARY_TENANT_DOMAIN = normalizeDomainValue(import.meta.env.VITE_PRIMARY_DOMAIN);
export const DEFAULT_TENANT_SLUG = sanitizeSubdomainSlug(import.meta.env.VITE_DEFAULT_TENANT_SLUG);

// --- Domain/Tenant utilities ---
export function sanitizeSubdomainSlug(value?: string | null): string {
  if (!value) return '';
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, '')
    .slice(0, 63);
}

export function normalizeDomainValue(value?: string | null): string {
  if (!value) return '';
  return value
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');
}

export function isReservedTenantSlug(slug?: string | null): boolean {
  if (!slug) return false;
  return RESERVED_TENANT_SLUGS.includes(sanitizeSubdomainSlug(slug));
}

export function getHostTenantSlug(): string | null {
  if (typeof window === 'undefined') return null;
  const hostname = window.location.hostname?.toLowerCase() || '';
  const params = new URLSearchParams(window.location.search);
  const forcedSlug = sanitizeSubdomainSlug(params.get('tenant'));
  if (forcedSlug && !isReservedTenantSlug(forcedSlug)) {
    return forcedSlug;
  }

  const hostSegments = hostname.split('.');
  const isLocalhost = hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.startsWith('127.');

  if (isLocalhost) {
    if (hostSegments.length > 1) {
      const candidate = sanitizeSubdomainSlug(hostSegments[0]);
      return candidate || null;
    }
    return DEFAULT_TENANT_SLUG || null;
  }

  if (PRIMARY_TENANT_DOMAIN) {
    if (hostname === PRIMARY_TENANT_DOMAIN || hostname === `www.${PRIMARY_TENANT_DOMAIN}`) {
      return DEFAULT_TENANT_SLUG || null;
    }
    if (hostname.endsWith(`.${PRIMARY_TENANT_DOMAIN}`)) {
      const subdomain = hostname.slice(0, hostname.length - (PRIMARY_TENANT_DOMAIN.length + 1));
      const candidate = sanitizeSubdomainSlug(subdomain);
      if (!candidate || isReservedTenantSlug(candidate)) return null;
      return candidate;
    }
  }

  if (hostSegments.length > 2) {
    const candidate = sanitizeSubdomainSlug(hostSegments[0]);
    if (!candidate || isReservedTenantSlug(candidate)) return null;
    return candidate;
  }

  return DEFAULT_TENANT_SLUG || null;
}

// --- Color utilities ---
export function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 0, 0';
}

// --- Auth utilities ---
export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Something went wrong. Please try again.';
}

export function isAdminRole(role?: User['role'] | null): boolean {
  return role === 'admin' || role === 'tenant_admin' || role === 'super_admin';
}

export function isPlatformOperator(role?: User['role'] | null): boolean {
  return role === 'super_admin';
}

// --- Product utilities ---
export function ensureUniqueProductSlug(
  desired: string, 
  list: Product[], 
  tenantId?: string, 
  ignoreId?: number
): string {
  const base = slugify(desired || '').replace(/--+/g, '-') || `product-${Date.now()}`;
  let candidate = base;
  let counter = 2;
  const hasConflict = (slugValue: string) => list.some(p => {
    const sameTenant = tenantId ? p.tenantId === tenantId : true;
    return sameTenant && p.slug === slugValue && p.id !== ignoreId;
  });
  while (hasConflict(candidate)) {
    candidate = `${base}-${counter++}`;
  }
  return candidate;
}

export function normalizeProductCollection(items: Product[], tenantId?: string): Product[] {
  const normalized: Product[] = [];
  items.forEach(item => {
    const slugSource = item.slug || item.name || `product-${item.id}`;
    const scopedTenantId = item.tenantId || tenantId;
    const slug = ensureUniqueProductSlug(slugSource, normalized, scopedTenantId, item.id);
    normalized.push({ ...item, slug, tenantId: scopedTenantId });
  });
  return normalized;
}

// --- Cache utilities ---

/**
 * Get the tenant scope for cache keys based on hostname/URL.
 * This must match the logic in getHostTenantSlug but returns tenant ID for cache key.
 */
function getInitialTenantScope(): string {
  if (typeof window === 'undefined') return 'public';
  
  try {
    // Check URL param first (for tenant switching/preview)
    const params = new URLSearchParams(window.location.search);
    const forcedTenant = params.get('tenant');
    if (forcedTenant && !isReservedTenantSlug(forcedTenant)) {
      return sanitizeSubdomainSlug(forcedTenant);
    }
    
    // Check localStorage for persisted active tenant
    const cachedTenantId = window.localStorage.getItem(ACTIVE_TENANT_STORAGE_KEY);
    if (cachedTenantId) {
      return cachedTenantId;
    }
    
    // Try to get from session storage (logged in user)
    const sessionData = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (sessionData) {
      const parsed = JSON.parse(sessionData);
      const tenantId = parsed?.tenantId || parsed?.tenant?.id || parsed?.tenant?._id;
      if (tenantId) return tenantId;
    }
  } catch {}
  
  // For subdomain-based tenants, we need to resolve via tenant list
  // Until tenant is resolved, use a placeholder that prevents cross-tenant cache pollution
  const hostSlug = getHostTenantSlug();
  if (hostSlug && hostSlug !== DEFAULT_TENANT_SLUG) {
    // Use the slug itself as cache key prefix to isolate per-subdomain
    return `slug:${hostSlug}`;
  }
  
  return DEFAULT_TENANT_ID || 'public';
}

export function getInitialCachedData<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const tenantScope = getInitialTenantScope();
    const stored = localStorage.getItem(`ds_cache_${tenantScope}::${key}`);
    if (stored) {
      const { data, timestamp } = JSON.parse(stored);
      // Use cache if less than 5 minutes old
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        return data as T;
      }
    }
  } catch {}
  return defaultValue;
}

export function hasCachedData(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const tenantScope = getInitialTenantScope();
    const stored = localStorage.getItem(`ds_cache_${tenantScope}::products`);
    if (stored) {
      const { data, timestamp } = JSON.parse(stored);
      return Array.isArray(data) && data.length > 0 && Date.now() - timestamp < 5 * 60 * 1000;
    }
  } catch {}
  return false;
}

// --- Variant utilities ---
export function ensureVariantSelection(
  product?: Product | null, 
  variant?: ProductVariantSelection | null
): ProductVariantSelection {
  return {
    color: variant?.color || product?.variantDefaults?.color || product?.colors?.[0] || FALLBACK_VARIANT.color,
    size: variant?.size || product?.variantDefaults?.size || product?.sizes?.[0] || FALLBACK_VARIANT.size,
  };
}
