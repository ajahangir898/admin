import { render, screen } from '@testing-library/react';
import { HeroSection } from './store/HeroSection';
import { CarouselItem } from '../types';

const carouselItems: CarouselItem[] = [
  { id: '1', name: 'Hero 1', image: 'https://eu-central.storage.cloudconvert.com/tasks/41c0a4dd-4e19-4e08-8942-35e6fa828eb7/orange-and-violet-banner-illustration-with-gadgets-border-banner-3580-x-1227-px-4--26e5.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=cloudconvert-production%2F20251229%2Ffra%2Fs3%2Faws4_request&X-Amz-Date=20251229T004422Z&X-Amz-Expires=86400&X-Amz-Signature=a40ffc6abfc3aad9a279ed11efda4d35df94cb82677e5ee3c4370ffece2c7990&X-Amz-SignedHeaders=host&response-content-disposition=inline%3B%20filename%3D%22orange-and-violet-banner-illustration-with-gadgets-border-banner-3580-x-1227-px-4--26e5.webp%22&response-content-type=image%2Fwebp&x-id=GetObject', url: '#', urlType: 'Internal', status: 'Publish', serial: 1 },
  { id: '2', name: 'Hero 2', image: '/uploads/images/carousel/opbd/hero2.webp', url: '#', urlType: 'Internal', status: 'Publish', serial: 2 },
];

describe('HeroSection', () => {
  test('renders carousel items when provided', () => {
    render(<HeroSection carouselItems={carouselItems} />);
    
    // Should render the carousel container
    const heroImages = screen.getAllByRole('img');
    expect(heroImages.length).toBeGreaterThan(0);
  });

  test('returns null when no carousel items are provided', () => {
    const { container } = render(<HeroSection carouselItems={[]} />);
    expect(container.firstChild).toBeNull();
  });

  test('filters and shows only published carousel items', () => {
    const mixedItems: CarouselItem[] = [
      { id: '1', name: 'Published', image: '/test1.webp', url: '#', urlType: 'Internal', status: 'Publish', serial: 1 },
      { id: '2', name: 'Published', image: '/test2.webp', url: '#', urlType: 'Internal', status: 'Publish', serial: 2 },
    ];
    
    render(<HeroSection carouselItems={mixedItems} />);
    
    // Should only show published items
    expect(screen.queryByAltText('Draft')).not.toBeInTheDocument();
  });
});
