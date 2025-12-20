import { render, screen } from '@testing-library/react';
import { HeroSection } from './StoreProductComponents';

const carouselItems = [
  { id: '1', name: 'Hero 1', image: 'https://example.com/hero1.jpg', status: 'Publish', serial: 1 },
  { id: '2', name: 'Hero 2', image: 'https://example.com/hero2.jpg', status: 'Publish', serial: 2 },
];

describe('HeroSection performance hints', () => {
  test('prioritizes the first hero image to improve LCP', () => {
    render(<HeroSection carouselItems={carouselItems} />);

    const firstHero = screen.getByAltText('Hero 1') as HTMLImageElement;
    const secondHero = screen.getByAltText('Hero 2') as HTMLImageElement;

    expect(firstHero).toHaveAttribute('fetchpriority', 'high');
    expect(firstHero).toHaveAttribute('loading', 'eager');
    expect(firstHero).toHaveAttribute('width', '1600');
    expect(firstHero).toHaveAttribute('height', '400');

    expect(secondHero).toHaveAttribute('fetchpriority', 'low');
    expect(secondHero).toHaveAttribute('loading', 'lazy');
  });
});
