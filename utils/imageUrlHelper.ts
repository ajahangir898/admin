/**
 * Normalizes image URLs to use production domain
 * Fixes legacy localhost URLs from development
 */
const PRODUCTION_URL = 'https://systemnextit.com';
const UPLOADS_BASE_URL = 'https://cdn.systemnextit.com';

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
  
  // If it's already a full URL with systemnextit.com, return as-is
  if (url.includes('systemnextit.com')) {
    return url;
  }
  
  // If it's a relative URL (starts with /uploads), prepend the base URL
  if (url.startsWith('/uploads')) {
    return `${UPLOADS_BASE_URL}${url}`;
  }
  
  // Handle relative URLs without leading slash (e.g., uploads/...)
  if (url.startsWith('uploads/')) {
    return `${UPLOADS_BASE_URL}/${url}`;
  }
  
  // If it's a localhost URL, replace with production domain
  if (url.includes('localhost')) {
    return url.replace(/https?:\/\/localhost:\d+/, PRODUCTION_URL);
  }
  
  // Return as-is if already a valid URL or other format
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
  
  // For data URIs or external URLs, return as-is
  if (normalizedUrl.startsWith('data:') || !normalizedUrl.includes(PRODUCTION_URL)) {
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
