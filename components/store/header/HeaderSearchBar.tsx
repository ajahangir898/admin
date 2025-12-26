import React, { useRef, useState } from 'react';
import { Search, Camera, Loader2 } from 'lucide-react';
import {
  VoiceButton,
  SearchSuggestions,
  VoiceStreamOverlay,
  SearchHintOverlay
} from './SearchBar';
import type { HeaderSearchProps } from './headerTypes';
import toast from 'react-hot-toast';

// Camera button that opens file picker for image search
interface CameraButtonProps {
  onSearching?: (isSearching: boolean) => void;
}

const CameraButton: React.FC<CameraButtonProps> = ({ onSearching }) => {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image (JPEG, PNG, WebP, or GIF)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image is too large. Maximum size is 10MB.');
      return;
    }

    setIsLoading(true);
    onSearching?.(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

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
        // Navigate to search results
        const searchUrl = `/search?q=${encodeURIComponent(data.keyword)}`;
        window.history.pushState({}, '', searchUrl);
        window.dispatchEvent(new PopStateEvent('popstate'));
        toast.success(`Searching for "${data.keyword}"`);
      } else {
        toast.error('Could not identify product in image');
      }
    } catch (error: any) {
      console.error('Image search error:', error);
      toast.error(error.message || 'Failed to search by image');
    } finally {
      setIsLoading(false);
      onSearching?.(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
        capture="environment"
      />
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="p-2 text-gray-500 hover:text-theme-primary transition-colors disabled:opacity-50"
        title="Search by Image"
      >
        {isLoading ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <Camera size={20} />
        )}
      </button>
    </>
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
        variant="light"
        supportsVoiceSearch={supportsVoiceSearch}
        isListening={isListening}
        onVoiceSearch={onVoiceSearch}
      />
      <button className="btn-search px-6 py-2 rounded-full flex items-center justify-center">
        <Search size={20} />
      </button>
    </div>
    <VoiceStreamOverlay isListening={isListening} transcript={liveTranscript} />
    <SearchSuggestions
      isOpen={isSuggestionsOpen}
      suggestions={suggestions}
      onSuggestionClick={onSuggestionClick}
    />
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
  <div ref={containerRef} className="flex-1 relative">
    <SearchHintOverlay
      activeSearchValue={activeSearchValue}
      activeHint={activeHint}
      activeHintIndex={activeHintIndex}
      offsetClass="left-3"
      textSizeClass="text-xs"
    />
    <input
      type="text"
      placeholder="Search..."
      value={activeSearchValue}
      onChange={(event) => onInputChange(event.target.value)}
      className="w-full pl-3 pr-28 py-2.5 border border-theme-primary rounded-lg text-sm focus:outline-none placeholder-transparent"
    />
    <div className="absolute right-1 top-1 bottom-1 flex items-center gap-2">
      <CameraButton />
      <VoiceButton
        variant="light"
        supportsVoiceSearch={supportsVoiceSearch}
        isListening={isListening}
        onVoiceSearch={onVoiceSearch}
      />
      <button className="btn-search text-xs font-bold px-2 h-full rounded-md">Search</button>
    </div>
    <VoiceStreamOverlay
      isListening={isListening}
      transcript={liveTranscript}
      positionClass="absolute -bottom-10 left-0 right-0"
    />
    <SearchSuggestions
      isOpen={isSuggestionsOpen}
      suggestions={suggestions}
      onSuggestionClick={onSuggestionClick}
    />
  </div>
);