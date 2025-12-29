import React from 'react';

interface AdminNoticeTickerProps {
  noticeText?: string | null;
}

export const AdminNoticeTicker: React.FC<AdminNoticeTickerProps> = ({ noticeText }) => {
  if (!noticeText) return null;

  return (
    <div className="w-full bg-white border-b border-gray-100 py-1.5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-3">
        <div className="flex-1 overflow-hidden relative">
          <div className="admin-notice-ticker text-sm" style={{ color: 'rgb(var(--color-font-rgb))' }}>
            {noticeText}
          </div>
        </div>
      </div>
    </div>
  );
};

// RR