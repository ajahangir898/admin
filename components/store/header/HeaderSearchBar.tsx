import React from 'react';
import { Search, Camera } from 'lucide-react';
import {
  VoiceButton,
  SearchSuggestions,
  VoiceStreamOverlay,
  SearchHintOverlay
} from './SearchBar';
import type { HeaderSearchProps } from './headerTypes';

// Camera button that navigates to visual search
const CameraButton: React.FC = () => {
  const handleClick = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };
  
  return (
    <button
      onClick={handleClick}
      className="p-2 text-gray-500 hover:text-theme-primary transition-colors"
      title="Visual Search"
    >
      <Camera size={20} />
    </button>
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