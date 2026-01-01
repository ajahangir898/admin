import { useState, useRef, useEffect, memo } from 'react';
import { getCDNImageUrl, isCDNEnabled } from '../config/cdnConfig';

interface Props { src: string; alt: string; className?: string; width?: number; height?: number; priority?: boolean; placeholder?: 'blur' | 'empty'; objectFit?: 'cover' | 'contain'; onLoad?: () => void; onError?: () => void; }

const EMPTY = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const supportsWebP = typeof window !== 'undefined' && document.createElement('canvas').toDataURL('image/webp').includes('data:image/webp');

const generateBlurPlaceholder = (s: string): string => {
  if (s.startsWith('data:')) return s;
  if (s.includes('unsplash.com')) return s.replace(/w=\d+/, 'w=20').replace(/q=\d+/, 'q=10');
  if (s.includes('systemnextit.com')) return `${s}${s.includes('?') ? '&' : '?'}w=20&q=10`;
  return EMPTY;
};

const applyCDN = (url: string, w?: number) => url && isCDNEnabled() ? getCDNImageUrl(url, { width: w, quality: 80, format: supportsWebP ? 'webp' : 'auto', fit: 'cover' }) : url;

const getOptimizedUrl = (src: string, w?: number): string => {
  if (!src || src.startsWith('data:')) return src || EMPTY;
  const tw = w || 640;
  if (src.includes('unsplash.com')) {
    let u = w ? (src.includes('w=') ? src.replace(/w=\d+/, `w=${w}`) : `${src}${src.includes('?') ? '&' : '?'}w=${w}`) : src;
    if (supportsWebP && !u.includes('fm=')) u += `${u.includes('?') ? '&' : '?'}fm=webp`;
    if (!u.includes('q=')) u += `${u.includes('?') ? '&' : '?'}q=80`;
    return applyCDN(u, tw);
  }
  return applyCDN(src, tw);
};

const generateSrcSet = (s: string): string => !s || s.startsWith('data:') || (!s.includes('unsplash.com') && !s.includes('systemnextit.com')) ? '' : [320,640,960,1280,1920].map(w => `${getOptimizedUrl(s, w)} ${w}w`).join(', ');

const OptimizedImage = memo(({ src, alt, className = '', width, height, priority = false, placeholder = 'empty', objectFit = 'cover', onLoad, onError }: Props) => {
  const [loaded, setLoaded] = useState(false), [error, setError] = useState(false), [fallback, setFallback] = useState(false), [inView, setInView] = useState(priority);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority || inView) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { rootMargin: '400px' }); // Increased margin for smoother scrolling
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [priority, inView]);

  const handleLoad = () => { setLoaded(true); onLoad?.(); };
  const handleError = () => { if (!fallback && src && !src.startsWith('data:')) { setFallback(true); return; } setError(true); onError?.(); };

  const optSrc = fallback ? src : getOptimizedUrl(src, width);
  const srcSet = fallback ? '' : generateSrcSet(src);
  const phSrc = placeholder === 'blur' ? generateBlurPlaceholder(src) : EMPTY;
  const sizes = width ? `(max-width: ${width}px) 100vw, ${width}px` : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

  if (error) return <div className={`bg-gray-100 flex items-center justify-center ${className}`} style={{ width, height }}><span className="text-gray-400 text-xs">Failed to load</span></div>;

  return (
    <div className={`relative overflow-hidden ${className}`} ref={ref}>
      {!loaded && placeholder === 'blur' && <img src={phSrc} alt="" className="absolute inset-0 w-full h-full object-cover filter blur-lg scale-110" aria-hidden="true"/>}
      {inView && <img src={optSrc} srcSet={srcSet || undefined} sizes={srcSet ? sizes : undefined} alt={alt} width={width} height={height} loading={priority ? 'eager' : 'lazy'} decoding={priority ? 'sync' : 'async'} onLoad={handleLoad} onError={handleError} className={`w-full h-full transition-opacity duration-300 ${objectFit === 'contain' ? 'object-contain' : 'object-cover'} ${loaded ? 'opacity-100' : 'opacity-0'}`} {...(priority ? { fetchPriority: 'high' as const } : {})}/>}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';
export default OptimizedImage;
export { OptimizedImage, getOptimizedUrl, generateSrcSet };
