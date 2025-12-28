import React, { useState, useRef, useEffect, memo } from 'react';
import { getCDNImageUrl, isCDNEnabled } from '../config/cdnConfig';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean; // Load immediately (above-the-fold images)
  placeholder?: 'blur' | 'empty';
  objectFit?: 'cover' | 'contain';
  onLoad?: () => void;
  onError?: () => void;
}

// Tiny 1x1 transparent placeholder
const PLACEHOLDER_EMPTY = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

// Low quality blur placeholder generator
const generateBlurPlaceholder = (src: string): string => {
  // Don't process data URLs
  if (src.startsWith('data:')) {
    return src;
  }
  // For external images, use a small version if CDN supports it
  if (src.includes('unsplash.com')) {
    return src.replace(/w=\d+/, 'w=20').replace(/q=\d+/, 'q=10');
  }
  // For API images, add size params
  if (src.includes('systemnextit.com')) {
    const separator = src.includes('?') ? '&' : '?';
    return `${src}${separator}w=20&q=10`;
  }
  return PLACEHOLDER_EMPTY;
};

// Check if image URL can use WebP
const supportsWebP = (() => {
  if (typeof window === 'undefined') return false;
  const canvas = document.createElement('canvas');
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
})();

// Transform image URL for optimization
const getOptimizedUrl = (src: string, width?: number): string => {
  if (!src) return PLACEHOLDER_EMPTY;
  
  // Don't process data URLs (base64 images)
  if (src.startsWith('data:')) {
    return src;
  }
  
  const targetWidth = width || 640;

  const applyCDN = (url: string, requestedWidth?: number) => {
    if (!url) return url;
    if (isCDNEnabled()) {
      return getCDNImageUrl(url, {
        width: requestedWidth,
        quality: 80,
        format: supportsWebP ? 'webp' : 'auto',
        fit: 'cover'
      });
    }
    return url;
  };
  
  // Handle Unsplash images
  if (src.includes('unsplash.com')) {
    let url = src;
    if (width) {
      url = url.replace(/w=\d+/, `w=${width}`);
      if (!url.includes('w=')) {
        url += `${url.includes('?') ? '&' : '?'}w=${width}`;
      }
    }
    // Request WebP format
    if (supportsWebP && !url.includes('fm=')) {
      url += `${url.includes('?') ? '&' : '?'}fm=webp`;
    }
    // Add quality
    if (!url.includes('q=')) {
      url += `${url.includes('?') ? '&' : '?'}q=80`;
    }
    return applyCDN(url, width || targetWidth);
  }
  
  // Handle your CDN images
  if (src.includes('systemnextit.com') || src.includes('cdn.')) {
    let url = src;
    return applyCDN(url, width || targetWidth);
  }
  
  return applyCDN(src, targetWidth);
};

// Generate srcset for responsive images
const generateSrcSet = (src: string): string => {
  if (!src || src.startsWith('data:')) return '';
  
  const widths = [320, 640, 960, 1280, 1920];
  
  if (src.includes('unsplash.com') || src.includes('systemnextit.com')) {
    return widths
      .map(w => `${getOptimizedUrl(src, w)} ${w}w`)
      .join(', ');
  }
  
  return '';
};

const OptimizedImage = memo(({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  placeholder = 'empty',
  objectFit = 'cover',
  onLoad,
  onError
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Start loading 200px before visible
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, [priority, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    // Log error for debugging
    console.error('[OptimizedImage] Failed to load image:', {
      originalSrc: src,
      optimizedSrc: useFallback ? src : getOptimizedUrl(src, width),
      useFallback
    });
    
    // Try fallback to original src if optimized version fails
    if (!useFallback && src && !src.startsWith('data:')) {
      console.log('[OptimizedImage] Attempting fallback to original src');
      setUseFallback(true);
      return;
    }
    setHasError(true);
    onError?.();
  };

  const optimizedSrc = useFallback ? src : getOptimizedUrl(src, width);
  const srcSet = useFallback ? '' : generateSrcSet(src);
  const placeholderSrc = placeholder === 'blur' 
    ? generateBlurPlaceholder(src) 
    : PLACEHOLDER_EMPTY;

  // Sizes attribute for responsive images
  const sizes = width 
    ? `(max-width: ${width}px) 100vw, ${width}px`
    : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

  if (hasError) {
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-400 text-xs">Failed to load</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} ref={imgRef}>
      {/* Blur placeholder */}
      {!isLoaded && placeholder === 'blur' && (
        <img
          src={placeholderSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-lg scale-110"
          aria-hidden="true"
        />
      )}
      
      {/* Main image */}
      {isInView && (
        <img
          src={optimizedSrc}
          srcSet={srcSet || undefined}
          sizes={srcSet ? sizes : undefined}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full transition-opacity duration-300 ${
            objectFit === 'contain' ? 'object-contain' : 'object-cover'
          } ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          {...(priority ? { fetchPriority: 'high' } : {})}
        />
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
export { OptimizedImage, getOptimizedUrl, generateSrcSet };
