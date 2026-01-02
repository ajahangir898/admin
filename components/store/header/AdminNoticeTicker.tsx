import React from 'react';

interface AdminNoticeTickerProps {
  noticeText?: string | null;
}

export const AdminNoticeTicker: React.FC<AdminNoticeTickerProps> = ({ noticeText }) => {
  if (!noticeText) return null;

  return (
    <div className="w-full bg-white border-b border-gray-100 py-1.5 overflow-hidden">
      <div className="relative overflow-hidden">
        <div className="flex animate-marquee-seamless" style={{ color: 'rgb(var(--color-font-rgb))' }}>
          <span className="text-sm whitespace-nowrap px-8">{noticeText}</span>
          <span className="text-sm whitespace-nowrap px-8">{noticeText}</span>
          <span className="text-sm whitespace-nowrap px-8">{noticeText}</span>
          <span className="text-sm whitespace-nowrap px-8">{noticeText}</span>
        </div>
      </div>
    </div>
  );
};

// RR