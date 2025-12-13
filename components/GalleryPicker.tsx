import React, { useState, useEffect } from 'react';
import { X, Search, CheckCircle, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { GalleryItem } from '../types';
import { DataService } from '../services/DataService';
import { GALLERY_IMAGES } from '../constants';

interface GalleryPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrls: string[]) => void;
  multiSelect?: boolean;
  maxSelection?: number;
  currentImages?: string[];
}

export const GalleryPicker: React.FC<GalleryPickerProps> = ({
  isOpen,
  onClose,
  onSelect,
  multiSelect = true,
  maxSelection = 10,
  currentImages = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImageUrls, setSelectedImageUrls] = useState<string[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryItem[]>(GALLERY_IMAGES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadGallery();
      setSelectedImageUrls([]);
    }
  }, [isOpen]);

  const loadGallery = async () => {
    setIsLoading(true);
    try {
      const stored = await DataService.get<GalleryItem[]>('gallery', GALLERY_IMAGES);
      setGalleryImages(stored);
    } catch (error) {
      console.warn('Failed to load gallery, using defaults', error);
      setGalleryImages(GALLERY_IMAGES);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredImages = galleryImages.filter(img =>
    img.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    img.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleImageSelection = (imageUrl: string) => {
    if (multiSelect) {
      if (selectedImageUrls.includes(imageUrl)) {
        setSelectedImageUrls(selectedImageUrls.filter(url => url !== imageUrl));
      } else {
        if (selectedImageUrls.length < maxSelection) {
          setSelectedImageUrls([...selectedImageUrls, imageUrl]);
        } else {
          toast.error(`You can select up to ${maxSelection} images.`, {
            duration: 3000,
            position: 'top-center'
          });
        }
      }
    } else {
      setSelectedImageUrls([imageUrl]);
    }
  };

  const handleConfirm = () => {
    if (selectedImageUrls.length > 0) {
      onSelect(selectedImageUrls);
      onClose();
    } else {
      toast.error('Please select at least one image.', {
        duration: 3000,
        position: 'top-center'
      });
    }
  };

  const handleCancel = () => {
    setSelectedImageUrls([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-2xl">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <ImageIcon className="text-purple-600" size={28} />
              Choose from Gallery
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Select {multiSelect ? `up to ${maxSelection}` : 'an'} image{multiSelect ? 's' : ''} from your gallery
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition p-2 hover:bg-white rounded-full"
            title="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by title or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading gallery...</p>
              </div>
            </div>
          ) : filteredImages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredImages.map((item) => {
                const isSelected = selectedImageUrls.includes(item.imageUrl);
                const isAlreadyUsed = currentImages.includes(item.imageUrl);

                return (
                  <div
                    key={item.id}
                    onClick={() => !isAlreadyUsed && toggleImageSelection(item.imageUrl)}
                    className={`group relative bg-white rounded-xl overflow-hidden border-2 shadow-sm transition-all duration-200 ${isSelected
                      ? 'border-purple-600 ring-2 ring-purple-300 scale-95'
                      : isAlreadyUsed
                        ? 'border-gray-200 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 hover:border-purple-400 hover:shadow-md cursor-pointer'
                      }`}
                  >
                    <div className="aspect-square bg-gray-100 flex items-center justify-center relative overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className={`w-full h-full object-cover ${isAlreadyUsed ? '' : 'group-hover:scale-105'
                          } transition duration-300`}
                      />

                      {/* Selection Overlay */}
                      <div
                        className={`absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity duration-200 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}
                      >
                        {isSelected && (
                          <div className="bg-purple-600 text-white rounded-full p-2 shadow-lg">
                            <CheckCircle size={28} strokeWidth={2.5} />
                          </div>
                        )}
                      </div>

                      {/* Already Used Badge */}
                      {isAlreadyUsed && (
                        <div className="absolute top-2 right-2 bg-gray-700 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                          In Use
                        </div>
                      )}
                    </div>

                    <div className="p-2">
                      <h4 className="font-semibold text-gray-800 text-xs truncate" title={item.title}>
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full inline-block mt-1">
                        {item.category}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <ImageIcon size={56} className="mb-4 opacity-20" />
              <p className="font-medium text-lg">No images found</p>
              <p className="text-sm">Try a different search term</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-white rounded-b-2xl flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-purple-600">{selectedImageUrls.length}</span> image
            {selectedImageUrls.length !== 1 ? 's' : ''} selected
            {multiSelect && (
              <span className="text-gray-400 ml-2">
                (max {maxSelection})
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedImageUrls.length === 0}
              className={`px-6 py-2.5 rounded-lg font-semibold transition flex items-center gap-2 ${selectedImageUrls.length > 0
                ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
            >
              <CheckCircle size={18} />
              Add Selected ({selectedImageUrls.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
