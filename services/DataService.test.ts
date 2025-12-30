import { describe, expect, it } from 'vitest';
import { INVALID_CATEGORY_IMAGE_DATA_URL, stripInvalidCategoryImages } from './DataService';

describe('stripInvalidCategoryImages', () => {
  it('clears the known inline WebP data URL from icon and image fields', () => {
    const categories = [
      { id: '1', name: 'Cat', status: 'Active' as const, icon: INVALID_CATEGORY_IMAGE_DATA_URL },
      { id: '2', name: 'Cat2', status: 'Inactive' as const, image: ` ${INVALID_CATEGORY_IMAGE_DATA_URL} ` },
      { id: '3', name: 'Cat3', status: 'Active' as const, icon: 'https://example.com/icon.png' },
    ];

    const cleaned = stripInvalidCategoryImages(categories);

    expect(cleaned[0].icon).toBeUndefined();
    expect(cleaned[1].image).toBeUndefined();
    expect(cleaned[2].icon).toBe('https://example.com/icon.png');
  });

  it('returns the original array when no invalid data URL is present', () => {
    const categories = [{ id: '1', name: 'Ok', status: 'Active' as const, icon: 'https://example.com/icon.png' }];
    const cleaned = stripInvalidCategoryImages(categories);
    expect(cleaned).toBe(categories);
  });
});
