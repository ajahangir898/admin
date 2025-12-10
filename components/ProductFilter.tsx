import React, { useState } from 'react';
import { ChevronDown, Sliders } from 'lucide-react';
import { Product } from '../types';

export type SortOption = 'relevance' | 'price-low' | 'price-high' | 'rating' | 'newest';

interface ProductFilterProps {
  products: Product[];
  onSortChange: (sortBy: SortOption, products: Product[]) => void;
  sortBy: SortOption;
}

export const ProductFilter: React.FC<ProductFilterProps> = ({ products, onSortChange, sortBy }) => {
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest First' }
  ];

  const handleSort = (option: SortOption) => {
    let sorted = [...products];

    switch (option) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        sorted.reverse();
        break;
      case 'relevance':
      default:
        break;
    }

    onSortChange(option, sorted);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition"
      >
        <Sliders size={16} />
        <span className="text-sm font-medium">{sortOptions.find(o => o.value === sortBy)?.label || 'Sort'}</span>
        <ChevronDown size={16} className={`transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg z-10">
          {sortOptions.map(option => (
            <button
              key={option.value}
              onClick={() => handleSort(option.value)}
              className={`block w-full text-left px-4 py-3 text-sm font-medium transition ${
                sortBy === option.value
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
