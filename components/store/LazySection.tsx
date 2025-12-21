import React, { useEffect, useRef, useState } from 'react';
import { useIntersectionObserver } from '../../utils/performanceHelpers';

interface LazySectionProps {
  fallback: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  rootMargin?: string;
  threshold?: number;
}

/**
 * LazySection defers rendering its children until the container is near the viewport.
 * Mobile devices benefit the most, because below-the-fold sections wait until the user scrolls.
 */
export const LazySection: React.FC<LazySectionProps> = ({
  fallback,
  children,
  className,
  rootMargin = '0px 0px 200px',
  threshold = 0.05,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
    }
  }, []);

  useIntersectionObserver(
    containerRef,
    (visible) => {
      if (visible) setIsVisible(true);
    },
    { rootMargin, threshold }
  );

  return (
    <div ref={containerRef} className={className}>
      {isVisible ? children : fallback}
    </div>
  );
};

export default LazySection;
