import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center gap-2 text-sm ${className}`}
    >
      <ol className="flex items-center gap-2 flex-wrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isFirst = index === 0;

          return (
            <li key={index} className="flex items-center gap-2 animate-fadeIn" style={{ animationDelay: `${index * 0.05}s` }}>
              {index > 0 && (
                <ChevronRight 
                  size={14} 
                  className="text-gray-400 dark:text-gray-500 flex-shrink-0" 
                  aria-hidden="true"
                />
              )}
              
              {isLast ? (
                <span 
                  className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[200px]"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <button
                  onClick={item.onClick}
                  className={`
                    flex items-center gap-1.5 text-gray-500 dark:text-gray-400 
                    hover:text-gray-900 dark:hover:text-gray-100 
                    transition-colors duration-200 
                    hover:underline truncate max-w-[200px]
                    ${isFirst ? 'font-semibold' : ''}
                  `}
                  aria-label={isFirst ? `Go to ${item.label}` : item.label}
                >
                  {isFirst && <Home size={14} className="flex-shrink-0" />}
                  <span>{item.label}</span>
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
