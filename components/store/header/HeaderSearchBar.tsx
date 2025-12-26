import React, { useState } from 'react';
import { Search, Camera } from 'lucide-react';
import {
  VoiceButton,
  SearchSuggestions,
  VoiceStreamOverlay,
  SearchHintOverlay
} from './SearchBar';
import type { HeaderSearchProps } from './headerTypes';
import toast from 'react-hot-toast';

// Camera button for AI-powered image search
const CameraButton: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://systemnextit.com';
      const response = await fetch(`${apiBase}/api/gemini-image-search`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to analyze image');
      }

      if (data.keyword) {
        toast.success(`Searching for "${data.keyword}"`);
        window.location.href = `/search?q=${encodeURIComponent(data.keyword)}`;
      } else {
        toast.error('Could not identify product in image');
      }
    } catch (error: any) {
      console.error('Image search error:', error);
      toast.error(error.message || 'Something went wrong!');
    } finally {
      setLoading(false);
      // Reset input
      e.target.value = '';
    }
  };

  return (
    <label className="cursor-pointer p-2 text-gray-500 hover:text-theme-primary transition-colors">
      {loading ? (
        <div className="w-5 h-5 border-2 border-theme-primary border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <Camera size={20} />
      )}
      <input 
        type="file" 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange} 
        disabled={loading} 
      />
    </label>
  );
};

export const DesktopSearchBar: React.FC<HeaderSearchProps> = ({
  containerRef,
  activeSearchValue,
  onInputChange,
  suggestions,
  isSuggestionsOpen,
  onSuggestionClick,
  activeHint,
  activeHintIndex,
  isListening,
  liveTranscript,
  supportsVoiceSearch,
  onVoiceSearch,
  onVisualSearch
}) => (
  <div ref={containerRef} className="hidden md:flex flex-1 max-w-2xl relative">
    <SearchHintOverlay
      activeSearchValue={activeSearchValue}
      activeHint={activeHint}
      activeHintIndex={activeHintIndex}
      offsetClass="left-4"
    />
    <input
      type="text"
      placeholder="Search product..."
      value={activeSearchValue}
      onChange={(event) => onInputChange(event.target.value)}
      className="w-full border-2 border-theme-primary rounded-full py-2 pl-4 pr-32 focus:outline-none focus:ring-2 focus:ring-theme-primary/20 placeholder-transparent"
    />
    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
      <CameraButton />
      <VoiceButton
        isListening={isListening}
        supportsVoiceSearch={supportsVoiceSearch}
        onVoiceSearch={onVoiceSearch}
      />
      <button className="bg-theme-primary text-white px-6 py-2 rounded-full font-semibold hover:opacity-90 transition-opacity">
        <Search size={18} />
      </button>
    </div>
    {isSuggestionsOpen && suggestions.length > 0 && (
      <SearchSuggestions suggestions={suggestions} onSuggestionClick={onSuggestionClick} />
    )}
    <VoiceStreamOverlay isListening={isListening} liveTranscript={liveTranscript} />
  </div>
);

export const MobileSearchBar: React.FC<HeaderSearchProps> = ({
  containerRef,
  activeSearchValue,
  onInputChange,
  suggestions,
  isSuggestionsOpen,
  onSuggestionClick,
  activeHint,
  activeHintIndex,
  isListening,
  liveTranscript,
  supportsVoiceSearch,
  onVoiceSearch,
  onVisualSearch
}) => (
  <div ref={containerRef} className="md:hidden fixed left-0 right-0 top-[60px] bg-white shadow-lg z-30 p-3 flex gap-2 animate-slideIn">
    <div className="relative flex-1">
      <SearchHintOverlay
        activeSearchValue={activeSearchValue}
        activeHint={activeHint}
        activeHintIndex={activeHintIndex}
        offsetClass="left-4"
      />
      <input
        type="text"
        placeholder="Search product..."
        value={activeSearchValue}
        onChange={(event) => onInputChange(event.target.value)}
        className="w-full border-2 border-theme-primary rounded-full py-2 pl-4 pr-24 text-sm focus:outline-none placeholder-transparent"
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        <CameraButton />
        <VoiceButton
          isListening={isListening}
          supportsVoiceSearch={supportsVoiceSearch}
          onVoiceSearch={onVoiceSearch}
        />
        <button className="bg-theme-primary text-white p-1.5 rounded-full">
          <Search size={16} />
        </button>
      </div>
      {isSuggestionsOpen && suggestions.length > 0 && (
        <SearchSuggestions suggestions={suggestions} onSuggestionClick={onSuggestionClick} />
      )}
      <VoiceStreamOverlay isListening={isListening} liveTranscript={liveTranscript} />
    </div>
  </div>
);
