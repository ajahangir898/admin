import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullScreen?: boolean;
  minHeight?: string;
}

/**
 * Reusable loading spinner component
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '',
  fullScreen = false,
  minHeight
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4'
  };

  const containerClasses = fullScreen 
    ? 'flex items-center justify-center min-h-screen bg-slate-50'
    : `flex items-center justify-center ${minHeight ? minHeight : ''}`;

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className={`${sizeClasses[size]} border-emerald-500 border-t-transparent rounded-full animate-spin`} />
    </div>
  );
};

export default LoadingSpinner;
