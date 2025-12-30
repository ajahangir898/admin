import { render, screen } from '@testing-library/react';
import CategorySectionMobile from './CategorySectionMobile';

describe('CategorySectionMobile', () => {
  it('renders category section with header', () => {
    render(<CategorySectionMobile />);
    expect(screen.getByText('Category')).toBeInTheDocument();
  });

  it('renders AI Trend button', () => {
    render(<CategorySectionMobile />);
    expect(screen.getByText(/AI Trend/i)).toBeInTheDocument();
  });

  it('renders initial categories', () => {
    render(<CategorySectionMobile />);
    expect(screen.getByText('Man Fashion')).toBeInTheDocument();
    expect(screen.getByText('Mobile & Gadgets')).toBeInTheDocument();
  });

  it('does not render duplicate initial categories', () => {
    render(<CategorySectionMobile />);
    expect(screen.getAllByText('Man Fashion')).toHaveLength(1);
  });

  it('renders AI Guide floating button', () => {
    const { container } = render(<CategorySectionMobile />);
    const botButton = container.querySelector('button[class*="fixed"]');
    expect(botButton).toBeInTheDocument();
  });
});
