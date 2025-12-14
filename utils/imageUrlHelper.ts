/**
 * Normalizes image URLs to use production domain
 * Fixes legacy localhost URLs from development
 */
const PRODUCTION_URL = 'https://systemnextit.com';

export const normalizeImageUrl = (url: string | undefined | null): string => {
  if (!url) return '';
  
  // If it's a localhost URL, replace with production domain
  if (url.includes('systemnextit.com')) {
    return url.replace('https://systemnextit.com', PRODUCTION_URL);
  }
  
  // If it's a relative URL (starts with /uploads), prepend the base URL
  if (url.startsWith('/uploads')) {
    return `${PRODUCTION_URL}${url}`;
  }
  
  // Return as-is if already a valid URL
  return url;
};

/**
 * Normalizes an array of image URLs
 */
export const normalizeImageUrls = (urls: (string | undefined | null)[] | undefined): string[] => {
  if (!urls || !Array.isArray(urls)) return [];
  return urls.map(normalizeImageUrl).filter(Boolean);
};
