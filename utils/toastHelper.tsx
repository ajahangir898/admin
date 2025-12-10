import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import toast from 'react-hot-toast';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastContentProps {
  type: ToastType;
  message: string;
  details?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const iconMap = {
  success: <CheckCircle2 size={20} className="text-emerald-500" />,
  error: <AlertCircle size={20} className="text-rose-500" />,
  info: <Info size={20} className="text-blue-500" />,
  warning: <AlertTriangle size={20} className="text-amber-500" />
};

const bgMap = {
  success: 'bg-emerald-50 border-emerald-200',
  error: 'bg-rose-50 border-rose-200',
  info: 'bg-blue-50 border-blue-200',
  warning: 'bg-amber-50 border-amber-200'
};

const textMap = {
  success: 'text-emerald-800',
  error: 'text-rose-800',
  info: 'text-blue-800',
  warning: 'text-amber-800'
};

export const showToast = (config: ToastContentProps) => {
  toast.custom((t) => (
    <div
      className={`flex items-start gap-3 rounded-xl border ${bgMap[config.type]} p-4 shadow-lg max-w-md animate-in fade-in slide-in-from-right-full`}
      style={{
        opacity: t.visible ? 1 : 0,
        transition: 'opacity 0.3s'
      }}
    >
      <div className="flex-shrink-0 mt-0.5">{iconMap[config.type]}</div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold ${textMap[config.type]}`}>{config.message}</p>
        {config.details && (
          <p className={`text-sm mt-1 opacity-75 ${textMap[config.type]}`}>{config.details}</p>
        )}
      </div>
      {config.action && (
        <button
          onClick={config.action.onClick}
          className={`flex-shrink-0 font-semibold ${textMap[config.type]} hover:opacity-75 transition`}
        >
          {config.action.label}
        </button>
      )}
      <button
        onClick={() => t.dismiss()}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600"
      >
        <X size={16} />
      </button>
    </div>
  ), { duration: 4000 });
};

export const showSuccessToast = (message: string, details?: string) => {
  showToast({ type: 'success', message, details });
};

export const showErrorToast = (message: string, details?: string) => {
  showToast({ type: 'error', message, details });
};

export const showInfoToast = (message: string, details?: string) => {
  showToast({ type: 'info', message, details });
};

export const showWarningToast = (message: string, details?: string) => {
  showToast({ type: 'warning', message, details });
};
