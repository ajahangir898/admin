import React, { useState, useCallback, useRef, useEffect, memo } from 'react';
import { Camera, Search, X, Loader2, ArrowLeft, Tag, DollarSign, Package, Palette, Box, Target, Sparkles, Copy, Check, Plus, Wifi, WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_YOLO_API_URL || 'http://localhost:8001';

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
  condition: string;
  tags: string[];
  specifications?: Record<string, string>;
  searchKeywords?: string;
  targetAudience?: string;
  sellingPoints?: string[];
}

type ApiStatusType = 'checking' | 'ready' | 'error' | 'offline';

interface ApiStatus {
  status: ApiStatusType;
  message: string;
}

// API Functions
const checkApiStatus = async (): Promise<ApiStatus> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/model-status`, {
      headers: { 'Accept': 'application/json' },
    });
    
    if (!response.ok) return { status: 'error', message: 'API returned error' };
    
    const data = await response.json();
    return data.status === 'ready' 
      ? { status: 'ready', message: data.message || 'YOLO API Ready' }
      : { status: 'error', message: data.message || 'Model not ready' };
  } catch {
    return { status: 'offline', message: 'Cannot connect to YOLO API server' };
  }
};

const analyzeProductImage = async (file: File): Promise<ProductDetails> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API error: ${response.status}`);
  }
  
  const result = await response.json();
  if (result.success && result.data) return result.data;
  throw new Error(result.error || 'Could not analyze the image');
};

// Reusable Components
const CopyButton = memo<{ text: string; label?: string }>(({ text, label }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 text-gray-400 hover:text-theme-primary hover:bg-theme-primary/10 rounded-lg transition-all"
      title={label || 'Copy'}
    >
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  );
});

const DetailCard = memo<{ 
  icon: React.ReactNode; 
  label: string; 
  value: string;
  copyable?: boolean;
  className?: string;
}>(({ icon, label, value, copyable = true, className = '' }) => (
  <div className={`bg-white rounded-xl p-4 shadow-lg border border-gray-200 ${className}`}>
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
        {icon}
        <span>{label}</span>
      </div>
      {copyable && <CopyButton text={value} />}
    </div>
    <p className="text-gray-900 font-medium">{value}</p>
  </div>
));

const PriceCard = memo<{ price: PriceEstimate }>(({ price }) => (
  <div className="bg-gradient-to-br from-theme-primary/10 to-theme-primary/5 rounded-xl p-5 border border-theme-primary/30 shadow-lg">
    <div className="flex items-center gap-2 text-theme-primary mb-3">
      <DollarSign size={18} />
      <span className="font-semibold">Estimated Price (BDT)</span>
    </div>
    <div className="grid grid-cols-3 gap-4">
      {[
        { label: 'Minimum', value: price.min, highlight: false },
        { label: 'Suggested', value: price.suggested, highlight: true },
        { label: 'Maximum', value: price.max, highlight: false },
      ].map(({ label, value, highlight }) => (
        <div key={label} className={`text-center ${label === 'Suggested' ? 'border-x border-gray-200' : ''}`}>
          <p className={`text-xs mb-1 ${highlight ? 'text-theme-primary' : 'text-gray-500'}`}>{label}</p>
          <p className={`font-bold ${highlight ? 'text-2xl text-theme-primary' : 'text-lg text-gray-700'}`}>
            ৳{value.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  </div>
));

const TagsSection = memo<{ tags: string[] }>(({ tags }) => (
  <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <Tag size={16} />
        <span>Tags</span>
      </div>
      <CopyButton text={tags.join(', ')} />
    </div>
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, i) => (
        <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-theme-primary/10 hover:text-theme-primary transition-colors">
          {tag}
        </span>
      ))}
    </div>
  </div>
));

const SellingPointsSection = memo<{ points: string[] }>(({ points }) => (
  <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
    <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
      <Sparkles size={16} />
      <span>Selling Points</span>
    </div>
    <ul className="space-y-2">
      {points.map((point, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">✓</span>
          <span className="text-gray-700 text-sm">{point}</span>
        </li>
      ))}
    </ul>
  </div>
));

const SpecificationsSection = memo<{ specs: Record<string, string> }>(({ specs }) => (
  <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
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
));

// Status Badge Component
const StatusBadge = memo<{ status: ApiStatus; onRetry: () => void }>(({ status, onRetry }) => {
  const configs: Record<ApiStatusType, { bg: string; icon: React.ReactNode; showRetry?: boolean }> = {
    checking: { bg: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: <Loader2 size={14} className="animate-spin" /> },
    ready: { bg: 'bg-green-50 text-green-700 border-green-200', icon: <Wifi size={14} /> },
    offline: { bg: 'bg-red-50 text-red-700 border-red-200', icon: <WifiOff size={14} />, showRetry: true },
    error: { bg: 'bg-red-50 text-red-700 border-red-200', icon: <WifiOff size={14} />, showRetry: true },
  };
  
  const config = configs[status.status];
  const displayMessage = status.status === 'ready' ? 'YOLO API Ready • Fast server analysis' : status.message;
  
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm border ${config.bg}`}>
      {config.icon}
      <span>{displayMessage}</span>
      {config.showRetry && (
        <button onClick={onRetry} className="ml-2 px-2 py-0.5 bg-red-100 hover:bg-red-200 rounded text-xs font-medium transition-colors">
          Retry
        </button>
      )}
    </div>
  );
});

// Product Details Display Component
const ProductDetailsDisplay = memo<{ details: ProductDetails; imagePreview: string | null }>(({ details, imagePreview }) => {
  const handleUseForProduct = useCallback(() => {
    sessionStorage.setItem('ai_product_data', JSON.stringify(details));
    sessionStorage.setItem('ai_product_image', imagePreview || '');
    toast.success('Product data ready! Redirecting...');
    setTimeout(() => { window.location.href = '/admin'; }, 1000);
  }, [details, imagePreview]);

  const handleCopyAll = useCallback(() => {
    const allText = `Product Name: ${details.name}
Category: ${details.category}
Description: ${details.description}
Price Range: ৳${details.estimatedPrice?.min} - ৳${details.estimatedPrice?.max}
Suggested Price: ৳${details.estimatedPrice?.suggested}
Brand: ${details.brand}
Color: ${details.color}
Material: ${details.material}
Tags: ${details.tags?.join(', ')}`;
    navigator.clipboard.writeText(allText);
    toast.success('All details copied!');
  }, [details]);

  return (
    <>
      {/* Product Name & Category */}
      <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-theme-primary font-semibold uppercase tracking-wide mb-1">
              {details.category}{details.subcategory && ` › ${details.subcategory}`}
            </p>
            <h2 className="text-2xl font-bold text-gray-900">{details.name}</h2>
          </div>
          <CopyButton text={details.name} label="Copy name" />
        </div>
        <p className="text-gray-600 leading-relaxed">{details.description}</p>
        <div className="flex items-center justify-end mt-2">
          <CopyButton text={details.description} label="Copy description" />
        </div>
      </div>

      {details.estimatedPrice && <PriceCard price={details.estimatedPrice} />}

      <div className="grid grid-cols-2 gap-4">
        <DetailCard icon={<Package size={16} />} label="Brand" value={details.brand} />
        <DetailCard icon={<Palette size={16} />} label="Color" value={details.color} />
        <DetailCard icon={<Box size={16} />} label="Material" value={details.material} />
        <DetailCard icon={<Target size={16} />} label="Condition" value={details.condition} />
      </div>

      {details.tags?.length > 0 && <TagsSection tags={details.tags} />}
      {details.sellingPoints?.length > 0 && <SellingPointsSection points={details.sellingPoints} />}
      {details.specifications && Object.keys(details.specifications).length > 0 && (
        <SpecificationsSection specs={details.specifications} />
      )}
      {details.targetAudience && (
        <DetailCard icon={<Target size={16} />} label="Target Audience" value={details.targetAudience} className="bg-blue-50/50" />
      )}
      {details.searchKeywords && (
        <DetailCard icon={<Search size={16} />} label="SEO Keywords" value={details.searchKeywords} className="bg-green-50/50" />
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button onClick={handleUseForProduct} className="flex-1 bg-theme-primary text-white py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
          <Plus size={20} />
          Use for New Product
        </button>
        <button onClick={handleCopyAll} className="px-6 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
          <Copy size={20} />
          Copy All
        </button>
      </div>
    </>
  );
});

// Main Component
const ImageSearchPage: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [productDetails, setProductDetails] = useState<ProductDetails | null>(null);
  const [apiStatus, setApiStatus] = useState<ApiStatus>({ status: 'checking', message: 'Connecting to YOLO API...' });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toastIdRef = useRef<string | null>(null);

  // Check API status
  useEffect(() => {
    let mounted = true;
    
    const check = async () => {
      const status = await checkApiStatus();
      if (mounted) setApiStatus(status);
    };
    
    check();
    const interval = setInterval(() => {
      if (apiStatus.status === 'offline' || apiStatus.status === 'error') check();
    }, 10000);
    
    return () => { mounted = false; clearInterval(interval); };
  }, [apiStatus.status]);

  const handleRetryConnection = useCallback(async () => {
    setApiStatus({ status: 'checking', message: 'Reconnecting...' });
    const status = await checkApiStatus();
    setApiStatus(status);
    toast[status.status === 'ready' ? 'success' : 'error'](
      status.status === 'ready' ? 'Connected to YOLO API!' : 'Still cannot connect to API'
    );
  }, []);

  const handleImageUpload = useCallback(async (file: File) => {
    if (apiStatus.status !== 'ready') {
      toast.error('YOLO API is not available. Please wait or check connection.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setIsAnalyzing(true);
      setProductDetails(null);

      try {
        toastIdRef.current = toast.loading('YOLO AI is analyzing your product...');
        const details = await analyzeProductImage(file);
        
        if (toastIdRef.current) toast.dismiss(toastIdRef.current);
        toast.success('Product analyzed successfully!');
        setProductDetails(details);
      } catch (error: any) {
        if (toastIdRef.current) toast.dismiss(toastIdRef.current);
        toast.error(error.message || 'Failed to analyze image');
      } finally {
        setIsAnalyzing(false);
        toastIdRef.current = null;
      }
    };
    reader.readAsDataURL(file);
  }, [apiStatus.status]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
    e.target.value = '';
  }, [handleImageUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) handleImageUpload(file);
  }, [handleImageUpload]);

  const handleClear = useCallback(() => {
    setImagePreview(null);
    setProductDetails(null);
    setIsAnalyzing(false);
  }, []);

  const openFilePicker = useCallback(() => fileInputRef.current?.click(), []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-gray-600 hover:text-theme-primary transition-colors">
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </a>
          <h1 className="text-lg font-bold text-gray-900">AI Product Scanner</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* API Status */}
        <div className="mb-4 flex justify-center">
          <StatusBadge status={apiStatus} onRetry={handleRetryConnection} />
        </div>

        {/* Upload Section */}
        {!imagePreview && (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={openFilePicker}
            className="bg-white rounded-2xl border-2 border-dashed border-gray-300 hover:border-theme-primary/50 transition-all cursor-pointer shadow-lg"
          >
            <div className="py-16 px-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-theme-primary/10 rounded-2xl flex items-center justify-center">
                <Camera size={40} className="text-theme-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Product Image</h2>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                AI will automatically detect product name, category, description, price estimate and more!
              </p>
              <button className="bg-theme-primary text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-2">
                <Camera size={20} />
                Choose Image
              </button>
              <p className="text-xs text-gray-400 mt-4">Supports JPG, PNG, WebP • Max 10MB</p>
            </div>
          </div>
        )}

        <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />

        {/* Results Section */}
        {imagePreview && (
          <div className="space-y-6">
            {/* Image Preview */}
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200 relative">
              <button
                onClick={handleClear}
                className="absolute top-6 right-6 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <X size={20} />
              </button>
              <div className="relative rounded-xl overflow-hidden bg-gray-100 max-h-80 flex items-center justify-center">
                <img src={imagePreview} alt="Product" className="max-h-80 w-auto object-contain" />
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
              
              {!isAnalyzing && (
                <button
                  onClick={openFilePicker}
                  className="mt-4 w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-theme-primary hover:text-theme-primary transition-all flex items-center justify-center gap-2"
                >
                  <Camera size={18} />
                  Upload Different Image
                </button>
              )}
            </div>

            {productDetails && <ProductDetailsDisplay details={productDetails} imagePreview={imagePreview} />}
          </div>
        )}
      </main>
    </div>
  );
};

export default ImageSearchPage;