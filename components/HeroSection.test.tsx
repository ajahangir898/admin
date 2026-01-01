import { render, screen } from '@testing-library/react';
import { HeroSection } from './store/HeroSection';
import { CarouselItem } from '../types';

const mockItems: CarouselItem[] = [
  { id: '1', name: 'Hero 1', image: '/uploads/images/carousel/test/hero2.webp', url: '#', urlType: 'Internal', status: 'Publish', serial: 1 },
  { id: '2', name: 'Hero 2', image: '/uploads/images/carousel/test/hero2.webp', url: '#', urlType: 'Internal', status: 'Publish', serial: 2 },
  { id: '3', name: 'Draft Item', image: '/uploads/images/carousel/test/draft.webp', url: '#', urlType: 'Internal', status: 'Draft', serial: 3 },
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
            image: '/uploads/images/carousel/test/lower.webp',
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
            image: '/uploads/images/carousel/test/ext.webp',
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
});
