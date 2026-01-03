import { render, screen } from '@testing-library/react';
import { HeroSection } from './store/HeroSection';
import { CarouselItem } from '../types';
import { act } from 'react';

const mockItems: CarouselItem[] = [
  { id: '1', name: 'Hero 1', image: '/uploads/images/carousel/hero1.webp', url: '#', urlType: 'Internal', status: 'Publish', serial: 1 },
  { id: '2', name: 'Hero 2', image: '/uploads/images/carousel/hero2.webp', url: '#', urlType: 'Internal', status: 'Publish', serial: 2 },
  { id: '3', name: 'Draft Item', image: '/uploads/images/carousel/draft.webp', url: '#', urlType: 'Internal', status: 'Draft', serial: 3 },
];

describe('HeroSection', () => {
  it('renders images when carousel items provided', () => {
    render(<HeroSection carouselItems={mockItems} />);
    expect(screen.getAllByRole('img').length).toBeGreaterThan(0);
  });

  it('treats publish status case-insensitively', () => {
    render(
      <HeroSection
        carouselItems={[
          {
            id: '4',
            name: 'Lowercase Publish',
            image: '/uploads/images/carousel/lower.webp',
            url: '#',
            urlType: 'Internal',
            status: 'publish' as any,
            serial: 1,
          } as any,
        ]}
      />
    );

    expect(screen.getByRole('img', { name: 'Lowercase Publish' })).toBeInTheDocument();
  });

  it('treats urlType case-insensitively for external links', () => {
    render(
      <HeroSection
        carouselItems={[
          {
            id: 'x',
            name: 'External Lowercase',
            image: '/uploads/images/carousel/ext.webp',
            url: 'example.com',
            urlType: 'external' as any,
            status: 'Publish',
            serial: 1,
          } as any,
        ]}
      />
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('returns null when empty', () => {
    const { container } = render(<HeroSection carouselItems={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('filters out draft items', () => {
    render(<HeroSection carouselItems={mockItems} />);
    expect(screen.queryByAltText('Draft Item')).not.toBeInTheDocument();
  });

  it('persists carousel items when props become empty', () => {
    // Render with initial items
    const { rerender } = render(<HeroSection carouselItems={mockItems} />);
    
    // Verify initial items are rendered
    expect(screen.getByAltText('Hero 1')).toBeInTheDocument();
    expect(screen.getByAltText('Hero 2')).toBeInTheDocument();
    
    // Re-render with empty items (simulating products load causing carousel items to temporarily disappear)
    act(() => {
      rerender(<HeroSection carouselItems={[]} />);
    });
    
    // Carousel should still be visible with persisted items
    expect(screen.getByAltText('Hero 1')).toBeInTheDocument();
    expect(screen.getByAltText('Hero 2')).toBeInTheDocument();
  });

  it('persists carousel items when props become undefined', () => {
    // Render with initial items
    const { rerender } = render(<HeroSection carouselItems={mockItems} />);
    
    // Verify initial items are rendered
    expect(screen.getByAltText('Hero 1')).toBeInTheDocument();
    
    // Re-render with undefined items (simulating websiteConfig becoming undefined)
    act(() => {
      rerender(<HeroSection carouselItems={undefined} />);
    });
    
    // Carousel should still be visible with persisted items
    expect(screen.getByAltText('Hero 1')).toBeInTheDocument();
    expect(screen.getByAltText('Hero 2')).toBeInTheDocument();
  });

  it('updates carousel when new valid items are provided', () => {
    const newItems: CarouselItem[] = [
      { id: '4', name: 'New Hero 1', image: '/uploads/images/carousel/new1.webp', url: '#', urlType: 'Internal', status: 'Publish', serial: 1 },
      { id: '5', name: 'New Hero 2', image: '/uploads/images/carousel/new2.webp', url: '#', urlType: 'Internal', status: 'Publish', serial: 2 },
    ];

    // Render with initial items
    const { rerender } = render(<HeroSection carouselItems={mockItems} />);
    expect(screen.getByAltText('Hero 1')).toBeInTheDocument();
    
    // Re-render with new items
    act(() => {
      rerender(<HeroSection carouselItems={newItems} />);
    });
    
    // Should display new items
    expect(screen.getByAltText('New Hero 1')).toBeInTheDocument();
    expect(screen.getByAltText('New Hero 2')).toBeInTheDocument();
    expect(screen.queryByAltText('Hero 1')).not.toBeInTheDocument();
  });
});
