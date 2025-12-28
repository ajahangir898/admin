import { render, screen } from '@testing-library/react';
import { HeroSection } from './store/HeroSection';
import { CarouselItem } from '../types';

const carouselItems: CarouselItem[] = [
  { id: '1', name: 'Hero 1', image: '/uploads/images/carousel/test-tenant/hero1.webp', url: '#', urlType: 'Internal', status: 'Publish', serial: 1 },
  { id: '2', name: 'Hero 2', image: '/uploads/images/carousel/test-tenant/hero2.webp', url: '#', urlType: 'Internal', status: 'Publish', serial: 2 },
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
      { id: '2', name: 'Draft', image: '/test2.webp', url: '#', urlType: 'Internal', status: 'Draft', serial: 2 },
    ];
    
    render(<HeroSection carouselItems={mixedItems} />);
    
    // Should only show published items
    expect(screen.queryByAltText('Draft')).not.toBeInTheDocument();
  });
});
