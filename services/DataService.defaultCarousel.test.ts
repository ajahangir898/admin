import { describe, it, expect } from 'vitest';
import { DataService } from './DataService';
import { DEFAULT_CAROUSEL_ITEMS } from '../constants';

describe('DataService default carousel items', () => {
  it('exposes the provided defaults in website config fallback', () => {
    const defaults = (DataService as any).getDefaultWebsiteConfig();
    expect(defaults.carouselItems).toEqual(DEFAULT_CAROUSEL_ITEMS);
  });
});
