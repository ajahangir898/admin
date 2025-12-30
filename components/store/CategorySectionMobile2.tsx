import React from 'react';
import { Category } from '../../types';

interface CategorySectionMobile2Props {
  categories?: Category[];
  onCategoryClick?: (categoryName: string) => void;
}

const CategorySectionMobile2: React.FC<CategorySectionMobile2Props> = ({ 
  categories = [], 
  onCategoryClick 
}) => {
  return (
    <section className="w-full bg-white py-6 px-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Categories</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => onCategoryClick?.(category.name)}
            className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:border-gray-400 hover:shadow-md transition-all cursor-pointer bg-white group"
          >
            {/* Icon Container */}
            <div className="w-20 h-20 mb-3 flex items-center justify-center bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
              {category.icon ? (
                <img 
                  src={category.icon} 
                  alt={category.name}
                  className="w-12 h-12 object-contain"
                />
              ) : (
                <div className="w-12 h-12 flex items-center justify-center">
                  <svg 
                    className="w-10 h-10 text-gray-600" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Category Name */}
            <span className="text-sm font-semibold text-gray-700 text-center line-clamp-2">
              {category.name}
            </span>
          </div>
        ))}
      </div>

      {/* Navigation Arrows for large screens */}
    
    </section>
  );
};

export default CategorySectionMobile2;
