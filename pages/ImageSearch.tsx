import React, { useState, useCallback, useRef } from 'react';
import { Camera, Search, X, Loader2, ArrowLeft, Tag, DollarSign, Package, Palette, Box, Target, Sparkles, Copy, Check, Plus } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// Types
interface PriceEstimate {
  min: number;
  max: number;
  suggested: number;
}

interface ProductDetails {
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  estimatedPrice: PriceEstimate;
  brand: string;
  color: string;
  material: string;
  size?: string;
  condition: string;
  tags: string[];
  specifications?: Record<string, string>;
  searchKeywords?: string;
  targetAudience?: string;
  sellingPoints?: string[];
}

interface AnalysisState {
  isAnalyzing: boolean;
  imagePreview: string | null;
  productDetails: ProductDetails | null;
  error: string | null;
}

// API call to analyze image
const analyzeProductImage = async (file: File): Promise<ProductDetails | null> => {
  const formData = new FormData();
  formData.append('image', file);

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://systemnextit.com';
  const response = await fetch(`${apiBase}/api/gemini-image-search`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Analysis failed');
  
  return data.productDetails;
};

// Copy button component
const CopyButton: React.FC<{ text: string; label?: string }> = ({ text, label }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 text-gray-400 hover:text-theme-primary hover:bg-theme-primary/10 rounded-lg transition-all"
      title={label || 'Copy'}
    >
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  );
};

// Detail Card Component
const DetailCard: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  value: string;
  copyable?: boolean;
  className?: string;
}> = ({ icon, label, value, copyable = true, className = '' }) => (
  <div className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 ${className}`}>
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
        {icon}
        <span>{label}</span>
      </div>
      {copyable && <CopyButton text={value} />}
    </div>
    <p className="text-gray-900 font-medium">{value}</p>
  </div>
);

// Price Card Component
const PriceCard: React.FC<{ price: PriceEstimate }> = ({ price }) => (
  <div className="bg-gradient-to-br from-theme-primary/10 to-theme-primary/5 rounded-xl p-5 border border-theme-primary/20">
    <div className="flex items-center gap-2 text-theme-primary mb-3">
      <DollarSign size={18} />
      <span className="font-semibold">Estimated Price (BDT)</span>
    </div>
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center">
        <p className="text-xs text-gray-500 mb-1">Minimum</p>
        <p className="text-lg font-bold text-gray-700">৳{price.min.toLocaleString()}</p>
      </div>
      <div className="text-center border-x border-gray-200">
        <p className="text-xs text-theme-primary mb-1">Suggested</p>
        <p className="text-2xl font-bold text-theme-primary">৳{price.suggested.toLocaleString()}</p>
      </div>
      <div className="text-center">
        <p className="text-xs text-gray-500 mb-1">Maximum</p>
        <p className="text-lg font-bold text-gray-700">৳{price.max.toLocaleString()}</p>
      </div>
    </div>
  </div>
);

// Tags Component
const TagsSection: React.FC<{ tags: string[] }> = ({ tags }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <Tag size={16} />
        <span>Tags</span>
      </div>
      <CopyButton text={tags.join(', ')} />
    </div>
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <span
          key={index}
          className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-theme-primary/10 hover:text-theme-primary transition-colors cursor-pointer"
        >
          {tag}
        </span>
      ))}
    </div>
  </div>
);

// Selling Points Component
const SellingPointsSection: React.FC<{ points: string[] }> = ({ points }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
    <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
      <Sparkles size={16} />
      <span>Selling Points</span>
    </div>
    <ul className="space-y-2">
      {points.map((point, index) => (
        <li key={index} className="flex items-start gap-2">
          <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">✓</span>
          <span className="text-gray-700 text-sm">{point}</span>
        </li>
      ))}
    </ul>
  </div>
);

// Specifications Component
const SpecificationsSection: React.FC<{ specs: Record<string, string> }> = ({ specs }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
    <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
      <Box size={16} />
      <span>Specifications</span>
    </div>
    <div className="space-y-2">
      {Object.entries(specs).map(([key, value]) => (
        <div key={key} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
          <span className="text-gray-500 text-sm capitalize">{key.replace(/_/g, ' ')}</span>
          <span className="text-gray-900 text-sm font-medium">{value}</span>
        </div>
      ))}
    </div>
  </div>
);

// Main Component
const ImageSearchPage: React.FC = () => {
  const [state, setState] = useState<AnalysisState>({
    isAnalyzing: false,
    imagePreview: null,
    productDetails: null,
    error: null,
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback(async (file: File) => {
    // Create preview
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setState({
        isAnalyzing: true,
        imagePreview: base64,
        productDetails: null,
        error: null,
      });

      try {
        toast.loading('AI is analyzing your product...', { id: 'analyze' });
        const details = await analyzeProductImage(file);
        toast.dismiss('analyze');
        
        if (details) {
          toast.success('Product analyzed successfully!');
          setState(prev => ({
            ...prev,
            isAnalyzing: false,
            productDetails: details,
          }));
        } else {
          throw new Error('No details returned');
        }
      } catch (error: any) {
        toast.dismiss('analyze');
        toast.error(error.message || 'Failed to analyze image');
        setState(prev => ({
          ...prev,
          isAnalyzing: false,
          error: error.message,
        }));
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    e.target.value = '';
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  const handleClear = () => {
    setState({
      isAnalyzing: false,
      imagePreview: null,
      productDetails: null,
      error: null,
    });
  };

  const handleUseForProduct = () => {
    if (state.productDetails) {
      // Store in sessionStorage for admin product page
      sessionStorage.setItem('ai_product_data', JSON.stringify(state.productDetails));
      sessionStorage.setItem('ai_product_image', state.imagePreview || '');
      toast.success('Product data ready! Redirecting to add product...');
      // Redirect to admin products page
      setTimeout(() => {
        window.location.href = '/admin';
      }, 1000);
    }
  };

  const { isAnalyzing, imagePreview, productDetails } = state;

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-gray-600 hover:text-theme-primary transition-colors">
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </a>
          <h1 className="text-lg font-bold text-gray-900">AI Product Scanner</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Upload Section */}
        {!imagePreview && (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-theme-primary/50 transition-all cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="py-16 px-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-theme-primary/10 rounded-2xl flex items-center justify-center">
                <Camera size={40} className="text-theme-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Upload Product Image
              </h2>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                AI will automatically detect product name, category, description, price estimate and more!
              </p>
              <button className="bg-theme-primary text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-2">
                <Camera size={20} />
                Choose Image
              </button>
              <p className="text-xs text-gray-400 mt-4">
                Supports JPG, PNG, WebP • Max 10MB
              </p>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />

        {/* Results Section */}
        {imagePreview && (
          <div className="space-y-6">
            {/* Image Preview */}
            <div className="bg-white rounded-2xl p-4 shadow-sm relative">
              <button
                onClick={handleClear}
                className="absolute top-6 right-6 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <X size={20} />
              </button>
              <div className="relative rounded-xl overflow-hidden bg-gray-100 max-h-80 flex items-center justify-center">
                <img
                  src={imagePreview}
                  alt="Product"
                  className="max-h-80 w-auto object-contain"
                />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Loader2 size={40} className="animate-spin mx-auto mb-3" />
                      <p className="font-medium">Analyzing product...</p>
                      <p className="text-sm text-white/70">This may take a few seconds</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Re-upload button */}
              {!isAnalyzing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-theme-primary hover:text-theme-primary transition-all flex items-center justify-center gap-2"
                >
                  <Camera size={18} />
                  Upload Different Image
                </button>
              )}
            </div>

            {/* Product Details */}
            {productDetails && (
              <>
                {/* Product Name & Category */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs text-theme-primary font-semibold uppercase tracking-wide mb-1">
                        {productDetails.category} {productDetails.subcategory && `› ${productDetails.subcategory}`}
                      </p>
                      <h2 className="text-2xl font-bold text-gray-900">{productDetails.name}</h2>
                    </div>
                    <CopyButton text={productDetails.name} label="Copy name" />
                  </div>
                  <p className="text-gray-600 leading-relaxed">{productDetails.description}</p>
                  <div className="flex items-center justify-end mt-2">
                    <CopyButton text={productDetails.description} label="Copy description" />
                  </div>
                </div>

                {/* Price Estimate */}
                {productDetails.estimatedPrice && (
                  <PriceCard price={productDetails.estimatedPrice} />
                )}

                {/* Quick Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <DetailCard icon={<Package size={16} />} label="Brand" value={productDetails.brand} />
                  <DetailCard icon={<Palette size={16} />} label="Color" value={productDetails.color} />
                  <DetailCard icon={<Box size={16} />} label="Material" value={productDetails.material} />
                  <DetailCard icon={<Target size={16} />} label="Condition" value={productDetails.condition} />
                </div>

                {/* Tags */}
                {productDetails.tags?.length > 0 && (
                  <TagsSection tags={productDetails.tags} />
                )}

                {/* Selling Points */}
                {productDetails.sellingPoints?.length > 0 && (
                  <SellingPointsSection points={productDetails.sellingPoints} />
                )}

                {/* Specifications */}
                {productDetails.specifications && Object.keys(productDetails.specifications).length > 0 && (
                  <SpecificationsSection specs={productDetails.specifications} />
                )}

                {/* Target Audience */}
                {productDetails.targetAudience && (
                  <DetailCard 
                    icon={<Target size={16} />} 
                    label="Target Audience" 
                    value={productDetails.targetAudience}
                    className="bg-blue-50/50"
                  />
                )}

                {/* Search Keywords */}
                {productDetails.searchKeywords && (
                  <DetailCard 
                    icon={<Search size={16} />} 
                    label="SEO Keywords" 
                    value={productDetails.searchKeywords}
                    className="bg-green-50/50"
                  />
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleUseForProduct}
                    className="flex-1 bg-theme-primary text-white py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <Plus size={20} />
                    Use for New Product
                  </button>
                  <button
                    onClick={() => {
                      const allText = `
Product Name: ${productDetails.name}
Category: ${productDetails.category}
Description: ${productDetails.description}
Price Range: ৳${productDetails.estimatedPrice?.min} - ৳${productDetails.estimatedPrice?.max}
Suggested Price: ৳${productDetails.estimatedPrice?.suggested}
Brand: ${productDetails.brand}
Color: ${productDetails.color}
Material: ${productDetails.material}
Tags: ${productDetails.tags?.join(', ')}
                      `.trim();
                      navigator.clipboard.writeText(allText);
                      toast.success('All details copied!');
                    }}
                    className="px-6 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Copy size={20} />
                    Copy All
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ImageSearchPage;
