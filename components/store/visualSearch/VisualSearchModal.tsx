import React from 'react';
import { Loader2, Sparkles, X } from 'lucide-react';
import { Product } from '../../../types';
import { normalizeImageUrl } from '../../../utils/imageUrlHelper';
import CameraCapture from './CameraCapture';
import type { VisualSearchResult } from '../../../services/visualSearch';

interface VisualSearchModalProps {
  isOpen: boolean;
  isProcessing: boolean;
  capturedImage?: string | null;
  result?: VisualSearchResult | null;
  matches?: Product[];
  errorMessage?: string | null;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
  onAddToCart?: (productId: number) => void;
  onViewProduct?: (product: Product) => void;
}

const VisualSearchModal: React.FC<VisualSearchModalProps> = ({
  isOpen,
  isProcessing,
  capturedImage,
  result,
  matches = [],
  errorMessage,
  onClose,
  onCapture,
  onAddToCart,
  onViewProduct,
}) => {
  if (!isOpen) return null;

  const topMatch = matches[0];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 backdrop-blur-xl px-4 py-6">
      <div className="relative w-full max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-white/85 shadow-[0_40px_120px_-40px_rgba(15,23,42,0.8)] backdrop-blur-2xl transition-all">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/80 text-white shadow-lg transition hover:bg-slate-900"
          aria-label="Close visual search"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col gap-6 p-6 md:flex-row md:gap-8 md:p-10">
          <div className="w-full md:w-[46%]">
            <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
              <Sparkles className="h-4 w-4 text-purple-500" /> Visual Product Search
            </p>
            <CameraCapture onCapture={onCapture} isProcessing={isProcessing} />
            {capturedImage && (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/40 bg-white/40 p-3 text-xs text-slate-600">
                <img src={capturedImage} alt="Captured product" className="h-12 w-12 rounded-xl object-cover shadow-inner" />
                <div>
                  <p className="font-semibold text-slate-800">Snapshot ready</p>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Rescan to update</p>
                </div>
              </div>
            )}
            {errorMessage && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50/80 p-3 text-sm font-medium text-red-600">
                {errorMessage}
              </div>
            )}
          </div>

          <div className="flex-1 space-y-5">
            <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Product detail</p>
              {isProcessing && (
                <div className="mt-5 flex items-center gap-3 rounded-2xl bg-slate-900/80 p-4 text-white">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm font-medium tracking-wide">Scanning the product…</span>
                </div>
              )}

              {!isProcessing && result && (
                <div className="mt-5 space-y-4 text-slate-800">
                  <h3 className="text-2xl font-semibold text-slate-900">{result.productName}</h3>
                  <p className="text-sm text-slate-600">{result.description || 'We could not craft a description for this product.'}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="rounded-2xl bg-white/80 p-4">
                      <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Brand</p>
                      <p className="mt-2 text-base font-semibold text-slate-900">{result.brand || 'Unknown'}</p>
                    </div>
                    <div className="rounded-2xl bg-white/80 p-4">
                      <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Category</p>
                      <p className="mt-2 text-base font-semibold text-slate-900">{result.category || 'Uncategorized'}</p>
                    </div>
                    <div className="rounded-2xl bg-white/80 p-4">
                      <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Estimated price</p>
                      <p className="mt-2 text-base font-semibold text-slate-900">{result.estimatedPrice || '—'}</p>
                    </div>
                    <div className="rounded-2xl bg-white/80 p-4">
                      <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Accuracy tip</p>
                      <p className="mt-2 text-xs text-slate-600">Rescan with good lighting if details look off.</p>
                    </div>
                  </div>
                  {topMatch && onAddToCart && (
                    <button
                      type="button"
                      onClick={() => onAddToCart(topMatch.id)}
                      className="mt-4 w-full rounded-full bg-slate-900 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800"
                    >
                      Add {topMatch.name} to cart
                    </button>
                  )}
                </div>
              )}

              {!isProcessing && !result && !errorMessage && (
                <p className="mt-5 text-sm text-slate-500">
                  Capture a product photo to see AI-powered identification and store matches.
                </p>
              )}
            </div>

            <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">In stock matches</p>
              {matches.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">No close matches yet. Try another angle or ensure the full product is visible.</p>
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {matches.map((product) => (
                    <div
                      key={product.id}
                      className="group flex flex-col gap-3 rounded-2xl border border-white/50 bg-white/80 p-4 shadow transition hover:-translate-y-1 hover:shadow-xl"
                    >
                      <img
                        src={normalizeImageUrl(product.image)}
                        alt={product.name}
                        className="h-32 w-full rounded-2xl object-cover shadow-inner"
                        loading="lazy"
                      />
                      <div className="flex-1 space-y-1">
                        <h4 className="text-base font-semibold text-slate-900 line-clamp-2">{product.name}</h4>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{product.brand || product.category || 'Catalog item'}</p>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                          onClick={() => onAddToCart?.(product.id)}
                        >
                          Add to cart
                        </button>
                        <button
                          type="button"
                          className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 transition hover:text-slate-900"
                          onClick={() => onViewProduct?.(product)}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualSearchModal;
