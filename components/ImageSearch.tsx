import React, { useState, useRef, useCallback } from 'react';
import { Upload, Image as ImageIcon, Search, AlertCircle, X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export interface ImageSearchConfig {
  maxFileSize: number; // bytes
  acceptedFormats: string[];
}

export interface ImageSearchResult {
  imageId: string;
  imageUrl: string;
  uploadedAt: string;
  results: Array<{
    productId: number;
    name: string;
    price: number;
    image: string;
    relevancyScore: number;
    category?: string;
    stock?: number;
  }>;
}

interface ImageSearchProps {
  onSearch: (imageId: string, imageUrl: string) => Promise<ImageSearchResult>;
  onResultsReceived?: (results: ImageSearchResult) => void;
  config?: Partial<ImageSearchConfig>;
  variant?: 'minimal' | 'full';
}

const DEFAULT_CONFIG: ImageSearchConfig = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  acceptedFormats: ['image/jpeg', 'image/png', 'image/webp']
};

export const ImageSearch: React.FC<ImageSearchProps> = ({
  onSearch,
  onResultsReceived,
  config = {},
  variant = 'full'
}) => {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [inputMethod, setInputMethod] = useState<'file' | 'url'>('file');
  const [searchResults, setSearchResults] = useState<ImageSearchResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  const validateFile = useCallback((file: File): boolean => {
    // Check file type
    if (!mergedConfig.acceptedFormats.includes(file.type)) {
      toast.error(`Invalid file type. Accepted: ${mergedConfig.acceptedFormats.join(', ')}`);
      return false;
    }

    // Check file size
    if (file.size > mergedConfig.maxFileSize) {
      toast.error(`File size exceeds ${mergedConfig.maxFileSize / (1024 * 1024)}MB limit`);
      return false;
    }

    return true;
  }, [mergedConfig]);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!validateFile(file)) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadedImage(dataUrl);
      setInputMethod('file');
    };
    reader.readAsDataURL(file);
  }, [validateFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleUrlSubmit = useCallback(() => {
    if (!imageUrl.trim()) {
      toast.error('Please enter an image URL');
      return;
    }

    try {
      new URL(imageUrl); // Validate URL format
      setUploadedImage(imageUrl);
      setInputMethod('url');
    } catch {
      toast.error('Invalid URL format');
    }
  }, [imageUrl]);

  const handleSearch = useCallback(async () => {
    if (!uploadedImage) {
      toast.error('Please upload or paste an image first');
      return;
    }

    setIsLoading(true);
    try {
      // For file uploads, we'd normally send to backend first
      // For this implementation, we use the data URL directly
      const results = await onSearch(
        `img-${Date.now()}`,
        uploadedImage
      );
      
      setSearchResults(results);
      setShowResults(true);
      onResultsReceived?.(results);
      toast.success('Search completed!');
    } catch (error) {
      console.error('Image search error:', error);
      toast.error('Failed to search. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [uploadedImage, onSearch, onResultsReceived]);

  const clearImage = useCallback(() => {
    setUploadedImage(null);
    setImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  if (variant === 'minimal') {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          title="Search by image"
          aria-label="Search by image"
        >
          <ImageIcon size={20} className="text-gray-600" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          aria-label="Upload image for search"
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Tabs for input method */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setInputMethod('file')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            inputMethod === 'file'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          <Upload size={16} className="inline mr-2" />
          Upload File
        </button>
        <button
          onClick={() => setInputMethod('url')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            inputMethod === 'url'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          <Link size={16} className="inline mr-2" />
          Paste URL
        </button>
      </div>

      {/* File Upload Area */}
      {inputMethod === 'file' && (
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer ${
            isDragging
              ? 'border-orange-500 bg-orange-50'
              : uploadedImage
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-orange-400 bg-gray-50 hover:bg-orange-50'
          }`}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              fileInputRef.current?.click();
            }
          }}
          aria-label="Drag and drop image or click to upload"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
            aria-label="Upload image file"
          />

          {uploadedImage ? (
            <div className="space-y-4">
              <img
                src={uploadedImage}
                alt="Selected image"
                className="max-h-48 mx-auto rounded-lg border border-green-300"
              />
              <p className="text-sm text-green-700 font-medium">Image selected ✓</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearImage();
                }}
                className="text-sm text-gray-600 hover:text-red-600 transition"
              >
                Clear and select another
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <Upload size={48} className="mx-auto text-gray-400" />
              <div>
                <p className="text-lg font-semibold text-gray-700">Drag and drop an image</p>
                <p className="text-sm text-gray-500 mt-1">or click to browse your files</p>
              </div>
              <p className="text-xs text-gray-500">
                Supported formats: JPEG, PNG, WebP (Max {mergedConfig.maxFileSize / (1024 * 1024)}MB)
              </p>
            </div>
          )}
        </div>
      )}

      {/* URL Input Area */}
      {inputMethod === 'url' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste image URL here (e.g., from Instagram, Pinterest, etc.)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
              aria-label="Image URL input"
            />
            <button
              onClick={handleUrlSubmit}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
            >
              Load
            </button>
          </div>

          {uploadedImage && inputMethod === 'url' && (
            <div className="space-y-4">
              <img
                src={uploadedImage}
                alt="URL image"
                className="max-h-48 mx-auto rounded-lg border border-green-300"
              />
              <p className="text-sm text-green-700 font-medium">Image loaded ✓</p>
              <button
                onClick={clearImage}
                className="text-sm text-gray-600 hover:text-red-600 transition"
              >
                Clear and try another URL
              </button>
            </div>
          )}
        </div>
      )}

      {/* Search Button */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={handleSearch}
          disabled={!uploadedImage || isLoading}
          className={`flex-1 py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
            isLoading || !uploadedImage
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Analyzing your image...
            </>
          ) : (
            <>
              <Search size={20} />
              Find Similar Products
            </>
          )}
        </button>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex gap-3">
          <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">How it works:</p>
            <ul className="space-y-1 text-blue-700">
              <li>• Upload a photo of a product you like</li>
              <li>• Our AI analyzes the image and finds visually similar items</li>
              <li>• Browse and filter results by price, category, or brand</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageSearch;

// Icon helper
const Link = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
  </svg>
);
