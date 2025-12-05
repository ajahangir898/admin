import React from 'react';
import { Product, LandingPage } from '../types';
import { LandingPagePanel } from '../components/LandingPageComponents';
import { MonitorSmartphone } from 'lucide-react';

interface AdminLandingPageProps {
  products: Product[];
  landingPages: LandingPage[];
  onCreateLandingPage: (page: LandingPage) => void;
  onUpdateLandingPage: (page: LandingPage) => void;
  onTogglePublish: (pageId: string, status: LandingPage['status']) => void;
  onPreviewLandingPage: (page: LandingPage) => void;
}

const AdminLandingPage: React.FC<AdminLandingPageProps> = ({
  products,
  landingPages,
  onCreateLandingPage,
  onUpdateLandingPage,
  onTogglePublish,
  onPreviewLandingPage
}) => {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 text-white rounded-3xl p-6 md:p-10 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Landing Engine</p>
            <h1 className="text-3xl md:text-4xl font-black leading-tight mt-2">Spin up one-page campaigns in minutes</h1>
            <p className="text-white/80 mt-3 max-w-2xl">
              Choose the Ready experience for instant product funnels or craft bespoke narratives with the Customizable editor.
              Each landing stays SEO-friendly, mobile-optimized, and ships with integrated checkout.
            </p>
          </div>
          <div className="bg-white/10 border border-white/30 rounded-2xl p-4 flex items-center gap-3 text-white/80">
            <MonitorSmartphone size={32} />
            <div>
              <p className="text-xs uppercase tracking-widest">Two Modes</p>
              <p className="font-semibold">Ready + Customizable</p>
            </div>
          </div>
        </div>
      </div>

      <LandingPagePanel
        products={products}
        landingPages={landingPages}
        onCreateLandingPage={onCreateLandingPage}
        onUpdateLandingPage={onUpdateLandingPage}
        onTogglePublish={onTogglePublish}
        onPreview={onPreviewLandingPage}
      />
    </div>
  );
};

export default AdminLandingPage;
