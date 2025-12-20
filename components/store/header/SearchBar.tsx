// SearchBar - Search input with voice and camera buttons
import React from 'react';
import { Loader2, Mic, Camera } from 'lucide-react';
import { Product } from '../../../types';
import { formatCurrency } from '../../../utils/format';
import { normalizeImageUrl } from '../../../utils/imageUrlHelper';

interface VoiceButtonProps {
  variant?: 'light' | 'dark';
  supportsVoiceSearch: boolean;
  isListening: boolean;
  onVoiceSearch: () => void;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({ 
  variant = 'dark', 
  supportsVoiceSearch, 
  isListening, 
  onVoiceSearch 
}) => {
  if (!supportsVoiceSearch) return null;
  const baseClasses = variant === 'light'
    ? 'bg-white/90 text-gray-700 hover:bg-white'
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200';
  return (
    <button
      type="button"
      onClick={onVoiceSearch}
      className={`${baseClasses} border border-gray-200 rounded-full p-2 flex items-center justify-center transition shadow-sm disabled:opacity-50`}
      title="Voice search"
      aria-pressed={isListening}
    >
      {isListening ? <Loader2 size={16} className="animate-spin" /> : <Mic size={16} />}
    </button>
  );
};

interface CameraButtonProps {
  variant?: 'light' | 'dark';
}

export const CameraButton: React.FC<CameraButtonProps> = ({ variant = 'dark' }) => {
  const baseClasses = variant === 'light'
    ? 'bg-white/90 text-gray-700 hover:bg-white'
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200';
  return (
    <button
      type="button"
      className={`${baseClasses} border border-gray-200 rounded-full p-2 flex items-center justify-center transition shadow-sm`}
      title="Visual search"
      aria-label="Visual search"
    >
      <Camera size={16} />
    </button>
  );
};

interface SearchSuggestionsProps {
  isOpen: boolean;
  suggestions: Product[];
  onSuggestionClick: (product: Product) => void;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  isOpen,
  suggestions,
  onSuggestionClick,
}) => {
  if (!isOpen || suggestions.length === 0) return null;
  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
      {suggestions.map((product) => (
        <button 
          key={product.id} 
          onClick={() => onSuggestionClick(product)} 
          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition border-b border-gray-100 last:border-0 text-left"
        >
          <img 
            src={normalizeImageUrl(product.image)} 
            alt={product.name} 
            className="w-14 h-14 object-cover rounded" 
            loading="lazy"
            decoding="async"
          />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">{product.name}</div>
            <div className="text-xs text-gray-500">{product.category}</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-green-600">{formatCurrency(product.price)}</div>
          </div>
        </button>
      ))}
    </div>
  );
};

interface VoiceStreamOverlayProps {
  isListening: boolean;
  transcript: string;
  positionClass?: string;
}

export const VoiceStreamOverlay: React.FC<VoiceStreamOverlayProps> = ({
  isListening,
  transcript,
  positionClass = 'absolute -bottom-11 left-0 right-0',
}) => {
  if (!isListening) return null;
  return (
    <div className={`pointer-events-none ${positionClass}`}>
      <div className="flex items-center gap-2 rounded-full border border-blue-200 bg-white/95 px-3 py-1 text-xs font-semibold text-blue-600 shadow-sm">
        <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
        <span className="truncate">{transcript || 'Listening…'}</span>
      </div>
    </div>
  );
};

interface SearchHintOverlayProps {
  activeSearchValue: string;
  activeHint: string;
  activeHintIndex: number;
  offsetClass?: string;
  textSizeClass?: string;
}

export const SearchHintOverlay: React.FC<SearchHintOverlayProps> = ({
  activeSearchValue,
  activeHint,
  activeHintIndex,
  offsetClass = 'left-4',
  textSizeClass = 'text-sm',
}) => {
  if (activeSearchValue.trim() || !activeHint) return null;
  return (
    <div 
      key={`${offsetClass}-${activeHintIndex}`} 
      className={`pointer-events-none absolute inset-y-0 ${offsetClass} flex items-center text-gray-400 ${textSizeClass} z-10`}
    >
      <span className="search-hint-animate">{activeHint}</span>
    </div>
  );
};
