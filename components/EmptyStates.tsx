import React from 'react';
import { ShoppingCart, Search, AlertTriangle, Home } from 'lucide-react';

export const EmptyCartState: React.FC<{ onShop: () => void }> = ({ onShop }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
      <ShoppingCart size={40} className="text-blue-500" />
    </div>
    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
    <p className="text-gray-500 mb-6 max-w-sm">Explore our collection of amazing products and add your favorites to get started!</p>
    <button
      onClick={onShop}
      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full font-semibold hover:shadow-lg transition transform hover:-translate-y-1"
    >
      Start Shopping
    </button>
  </div>
);

export const EmptySearchState: React.FC<{ query: string; onClear: () => void }> = ({ query, onClear }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mb-4">
      <Search size={40} className="text-amber-600" />
    </div>
    <h2 className="text-2xl font-bold text-gray-900 mb-2">No results for "{query}"</h2>
    <p className="text-gray-500 mb-6 max-w-sm">Try adjusting your search terms, filters, or browse our categories below.</p>
    <button
      onClick={onClear}
      className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition"
    >
      Clear Search
    </button>
  </div>
);

export const ErrorState: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-20 h-20 bg-gradient-to-br from-rose-100 to-red-100 rounded-full flex items-center justify-center mb-4">
      <AlertTriangle size={40} className="text-rose-600" />
    </div>
    <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
    <p className="text-gray-500 mb-6 max-w-sm">{message}</p>
    <div className="flex gap-3">
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-full font-semibold hover:shadow-lg transition transform hover:-translate-y-1"
        >
          Try Again
        </button>
      )}
      <button
        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition flex items-center gap-2"
      >
        <Home size={16} /> Go Home
      </button>
    </div>
  </div>
);

export const LoadingState: React.FC = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="h-48 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded-2xl animate-pulse" />
    ))}
  </div>
);
