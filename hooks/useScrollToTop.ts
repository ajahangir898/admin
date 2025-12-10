import { useEffect } from 'react';

/**
 * Hook to scroll to top when component mounts or dependencies change
 */
export const useScrollToTop = (deps: any[] = []) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, deps);
};
