import { render, screen } from '@testing-library/react';
import { HeroSection } from './store/HeroSection';
import { CarouselItem } from '../types';

const mockItems: CarouselItem[] = [
  { id: '1', name: 'Hero 1', image: '/uploads/images/carousel/695571846e28640aa9476090/61099bc4-aabc-4f89-ab02-6d899de11ff6.webp?w=20&q=10', url: '#', urlType: 'Internal', status: 'Publish', serial: 1 },
  { id: '2', name: 'Hero 2', image: '/uploads/images/carousel/test/hero2.webp', url: '#', urlType: 'Internal', status: 'Publish', serial: 2 },
  { id: '3', name: 'Draft Item', image: '/uploads/images/carousel/test/draft.webp', url: '#', urlType: 'Internal', status: 'Draft', serial: 3 },
];

describe('HeroSection', () => {
  it('renders images when carousel items provided', () => {
    render(<HeroSection carouselItems={mockItems} />);
    expect(screen.getAllByRole('img').length).toBeGreaterThan(0);
  });

  it('treats publish status case-insensitively', () => {
    const mixedCaseItems = [
      ...(mockItems as any),
      { id: '4', name: 'Lowercase Publish', image: '/uploads/images/carousel/test/lower.webp', url: '#', urlType: 'Internal', status: 'publish', serial: 4 },
    ];
    render(<HeroSection carouselItems={mixedCaseItems as any} />);
    expect(screen.queryByAltText('Lowercase Publish')).toBeInTheDocument();
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
