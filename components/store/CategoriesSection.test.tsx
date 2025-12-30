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

  it('renders the refreshed default style (style5)', () => {
    render(
      <CategoriesSection
        categories={mockCategories}
        onCategoryClick={mockOnCategoryClick}
      />
    );
    expect(screen.getByText('Shop by category')).toBeInTheDocument();
    expect(screen.getByText('Smartphones')).toBeInTheDocument();
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
    // Style4 should render categories in the DOM
    expect(screen.getByText('Smartphones')).toBeInTheDocument();
    expect(screen.getByText('Watches')).toBeInTheDocument();
    expect(screen.getByText('Headphones')).toBeInTheDocument();
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

  it('renders default style4 icons when no custom image is provided', () => {
    render(
      <CategoriesSection
        style="style4"
        categories={mockCategories}
        onCategoryClick={mockOnCategoryClick}
      />
    );
    const images = screen.getAllByRole('img');
    // Should have images for all active categories (3 active categories in mockCategories)
    expect(images.length).toBe(3);
    // First category should use first default icon
    expect(images[0]).toHaveAttribute('src', '/category-icons/category-1.webp');
    // Second category should use second default icon
    expect(images[1]).toHaveAttribute('src', '/category-icons/category-2.webp');
    // Third category should use third default icon
    expect(images[2]).toHaveAttribute('src', '/category-icons/category-3.webp');
  });
});
