import React from 'react';
import { X } from 'lucide-react';

export interface AIStudioModalProps {
  onClose: () => void;
}

export const AIStudioModal: React.FC<AIStudioModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:scale-105 hover:text-gray-700"
        >
          <X size={18} />
        </button>
        <div className="p-6 space-y-4 text-center">
          <h2 className="text-xl font-bold text-gray-900">AI Studio</h2>
          <p className="text-sm text-gray-600">
            AI Studio is coming soon. In the meantime, explore products or reach out via chat.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-theme-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIStudioModal;
