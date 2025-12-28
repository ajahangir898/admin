/**
 * Normalizes image URLs to use current domain or production domain
 * Fixes legacy localhost URLs from development
 */
const getBaseUrl = (): string => {
  // In browser, use current origin for uploads to avoid CORS issues
  if (typeof window !== 'undefined') {
    // Get the backend API URL from environment or use current origin
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    if (apiUrl) {
      return apiUrl;
    }
    // Use current origin for same-domain requests
    return window.location.origin;
  }
  // Fallback to production URL during SSR
  return 'https://systemnextit.com';
};

const PRODUCTION_URL = 'https://systemnextit.com';
// Use function to get dynamic base URL for uploads to work across environments
const getUploadsBaseUrl = (): string => getBaseUrl();

// Image size presets for different use cases
export type ImageSize = 'thumb' | 'small' | 'medium' | 'large' | 'full';

const IMAGE_SIZES: Record<ImageSize, { width: number; quality: number }> = {
  thumb: { width: 100, quality: 60 },   // For tiny thumbnails
  small: { width: 200, quality: 70 },   // For cart items, lists
  medium: { width: 400, quality: 75 },  // For product cards
  large: { width: 800, quality: 80 },   // For product details
  full: { width: 1200, quality: 85 },   // For hero images
};

export const normalizeImageUrl = (url: string | undefined | null): string => {
  if (!url) return '';
  
  // Data URIs are already complete - return as-is
  if (url.startsWith('data:')) {
    return url;
  }
  
  // Convert cdn.systemnextit.com URLs to production URL (CDN may not have the files)
  if (url.includes('cdn.systemnextit.com')) {
    return url.replace('https://cdn.systemnextit.com', PRODUCTION_URL);
  }
  
  // If it's already a full URL with systemnextit.com, keep it
  if (url.includes('systemnextit.com')) {
    return url;
  }
  
  // If it's a relative URL (starts with /uploads), prepend the base URL
  if (url.startsWith('/uploads')) {
    return `${getUploadsBaseUrl()}${url}`;
  }
  
  // Handle relative URLs without leading slash (e.g., uploads/...)
  if (url.startsWith('uploads/')) {
    return `${getUploadsBaseUrl()}/${url}`;
  }
  
  // If it's a localhost URL, replace with current origin or production
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    const baseUrl = getBaseUrl();
    return url.replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, baseUrl);
  }
  
  // If it's already a full URL (http:// or https://), return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Return as-is if it doesn't match any pattern
  return url;
};

/**
 * Get optimized image URL with size parameters
 * Falls back to original if optimization not available
 */
export const getOptimizedImageUrl = (
  url: string | undefined | null, 
  size: ImageSize = 'medium'
): string => {
  const normalizedUrl = normalizeImageUrl(url);
  if (!normalizedUrl) return '';
  
  // For data URIs, return as-is
  if (normalizedUrl.startsWith('data:')) {
    return normalizedUrl;
  }
  
  // For external URLs (not on our domain), return as-is
  const baseUrl = getBaseUrl();
  if (!normalizedUrl.includes(baseUrl) && !normalizedUrl.includes(PRODUCTION_URL) && !normalizedUrl.includes('systemnextit.com')) {
    return normalizedUrl;
  }
  
  const { width, quality } = IMAGE_SIZES[size];
  
  // Add optimization params (will work if backend supports it)
  // Format: /uploads/image.jpg?w=400&q=75
  const separator = normalizedUrl.includes('?') ? '&' : '?';
  return `${normalizedUrl}${separator}w=${width}&q=${quality}`;
};

/**
 * Normalizes an array of image URLs
 */
export const normalizeImageUrls = (urls: (string | undefined | null)[] | undefined): string[] => {
  if (!urls || !Array.isArray(urls)) return [];
  return urls.map(normalizeImageUrl).filter(Boolean);
};

/**
 * Get optimized image URLs array
 */
export const getOptimizedImageUrls = (
  urls: (string | undefined | null)[] | undefined,
  size: ImageSize = 'medium'
): string[] => {
  if (!urls || !Array.isArray(urls)) return [];
  return urls.map(url => getOptimizedImageUrl(url, size)).filter(Boolean);
};
