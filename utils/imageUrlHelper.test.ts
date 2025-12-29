import { describe, test, expect, beforeEach, vi } from 'vitest';
import { normalizeImageUrl, getOptimizedImageUrl } from './imageUrlHelper';

describe('imageUrlHelper', () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetModules();
  });

  describe('normalizeImageUrl', () => {
    test('returns empty string for null or undefined', () => {
      expect(normalizeImageUrl(null)).toBe('');
      expect(normalizeImageUrl(undefined)).toBe('');
      expect(normalizeImageUrl('')).toBe('');
    });

    test('returns data URIs as-is', () => {
      const dataUrl = 'data:image/png;base64,iVBORw0KGgo=';
      expect(normalizeImageUrl(dataUrl)).toBe(dataUrl);
    });

    test('handles relative URLs starting with /uploads', () => {
      const relativeUrl = '/uploads/images/carousel/tenant1/image.webp';
      const result = normalizeImageUrl(relativeUrl);
      expect(result).toContain('/uploads/images/carousel/tenant1/image.webp');
    });

    test('handles relative URLs without leading slash', () => {
      const relativeUrl = 'uploads/images/test.jpg';
      const result = normalizeImageUrl(relativeUrl);
      expect(result).toContain('/uploads/images/test.jpg');
    });

    test('returns systemnextit.com URLs as-is', () => {
      const url = 'https://systemnextit.com/uploads/images/test.jpg';
      expect(normalizeImageUrl(url)).toBe(url);
    });

    test('returns full URLs with http/https as-is', () => {
      const url = 'https://example.com/image.jpg';
      expect(normalizeImageUrl(url)).toBe(url);
    });

    test('converts cdn.systemnextit.com to production URL', () => {
      const cdnUrl = 'https://cdn.systemnextit.com/uploads/images/test.jpg';
      const result = normalizeImageUrl(cdnUrl);
      expect(result).toBe('https://systemnextit.com/uploads/images/test.jpg');
    });
  });

  describe('getOptimizedImageUrl', () => {
    test('returns empty string for null or undefined', () => {
      expect(getOptimizedImageUrl(null)).toBe('');
      expect(getOptimizedImageUrl(undefined)).toBe('');
    });

    test('returns data URIs as-is', () => {
      const dataUrl = 'data:image/png;base64,iVBORw0KGgo=';
      expect(getOptimizedImageUrl(dataUrl)).toBe(dataUrl);
    });

    test('adds optimization params for systemnextit.com URLs', () => {
      const url = 'https://systemnextit.com/uploads/images/test.jpg';
      const result = getOptimizedImageUrl(url, 'medium');
      expect(result).toContain('w=400');
      expect(result).toContain('q=75');
    });

    test('uses correct size presets', () => {
      const url = 'https://systemnextit.com/uploads/images/test.jpg';
      
      const thumb = getOptimizedImageUrl(url, 'thumb');
      expect(thumb).toContain('w=100');
      expect(thumb).toContain('q=60');
      
      const small = getOptimizedImageUrl(url, 'small');
      expect(small).toContain('w=200');
      expect(small).toContain('q=70');
      
      const large = getOptimizedImageUrl(url, 'large');
      expect(large).toContain('w=800');
      expect(large).toContain('q=80');
    });

    test('returns external URLs as-is', () => {
      const externalUrl = 'https://example.com/image.jpg';
      const result = getOptimizedImageUrl(externalUrl);
      expect(result).toBe(externalUrl);
    });
  });
});
