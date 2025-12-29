import { render, screen } from '@testing-library/react';
import { CategoriesSection } from './CategoriesSection';
import { Category } from '../../types';

const mockCategories: Category[] = [
  { id: '1', name: 'Smartphones', icon: 'smartphone', status: 'Active' },
  { id: '2', name: 'Watches', icon: 'watch', status: 'Active' },
  { id: '3', name: 'Headphones', icon: 'headphones', status: 'Active' },
  { id: '4', name: 'Inactive', icon: 'camera', status: 'Inactive' },
];

const mockOnCategoryClick = vi.fn();

describe('CategoriesSection', () => {
  it('renders categories with style1 (default)', () => {
    const { container } = render(
      <CategoriesSection
        style="style1"
        categories={mockCategories}
        onCategoryClick={mockOnCategoryClick}
      />
    );
    expect(container.firstChild).toBeTruthy();
    expect(screen.getByText('Smartphones')).toBeInTheDocument();
  });

  it('renders categories with style2', () => {
    const { container } = render(
      <CategoriesSection
        style="style2"
        categories={mockCategories}
        onCategoryClick={mockOnCategoryClick}
      />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders categories with style4', () => {
    const { container } = render(
      <CategoriesSection
        style="style4"
        categories={mockCategories}
        onCategoryClick={mockOnCategoryClick}
      />
    );
    expect(container.firstChild).toBeTruthy();
    // Style4 should have the full-width background wrapper
    expect(container.querySelector('.bg-\\[\\#F2F4F8\\]')).toBeInTheDocument();
    expect(screen.getByText('Smartphones')).toBeInTheDocument();
  });

  it('filters out inactive categories', () => {
    render(
      <CategoriesSection
        style="style4"
        categories={mockCategories}
        onCategoryClick={mockOnCategoryClick}
      />
    );
    expect(screen.queryByText('Inactive')).not.toBeInTheDocument();
  });

  it('returns null when no active categories', () => {
    const { container } = render(
      <CategoriesSection
        style="style4"
        categories={[{ id: '1', name: 'Test', icon: 'smartphone', status: 'Inactive' }]}
        onCategoryClick={mockOnCategoryClick}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders category images when provided', () => {
    const categoriesWithImages: Category[] = [
      { id: '1', name: 'Smartphones', icon: 'smartphone', image: '/test.jpg', status: 'Active' },
    ];
    render(
      <CategoriesSection
        style="style4"
        categories={categoriesWithImages}
        onCategoryClick={mockOnCategoryClick}
      />
    );
    const img = screen.getByAltText('Smartphones') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain('test.jpg');
  });
});
