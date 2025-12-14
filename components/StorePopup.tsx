import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Popup } from '../types';

interface StorePopupProps {
  popup: Popup;
  onClose: () => void;
  onNavigate?: (url: string) => void;
}

export const StorePopup: React.FC<StorePopupProps> = ({ popup, onClose, onNavigate }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in animation
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleImageClick = () => {
    if (popup.url) {
      if (popup.urlType === 'External') {
        window.open(popup.url, '_blank');
      } else {
        onNavigate?.(popup.url);
      }
      handleClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0'
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative max-w-2xl w-full transition-all duration-300 transform ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute -top-4 -right-4 z-10 p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition"
          aria-label="Close popup"
        >
          <X size={24} className="text-gray-700 dark:text-gray-300" />
        </button>

        {/* Popup Image */}
        <div
          className={`relative bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-2xl ${
            popup.url ? 'cursor-pointer' : ''
          }`}
          onClick={popup.url ? handleImageClick : undefined}
        >
          <img
            src={popup.image}
            alt={popup.name}
            className="w-full h-auto max-h-[80vh] object-contain"
          />
          
          {popup.url && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-center">
              <p className="text-white text-sm font-medium">Click to learn more</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
