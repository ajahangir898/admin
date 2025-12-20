// MobileDrawer - Mobile navigation drawer
import React from 'react';
import { X, Grid, ChevronDown, Minus, Plus, Gift, Heart, Info } from 'lucide-react';
import { normalizeImageUrl } from '../../../utils/imageUrlHelper';

type CatalogGroup = {
  key: string;
  label: string;
  items: string[];
};

type DrawerLinkItem = {
  key: string;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  action?: () => void;
};

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logo?: string | null;
  logoKey: string;
  catalogGroups: CatalogGroup[];
  activeCatalogSection: string;
  isCatalogDropdownOpen: boolean;
  onCatalogDropdownToggle: () => void;
  onCatalogSectionToggle: (key: string) => void;
  onCatalogItemClick: (item: string) => void;
  onTrackOrder?: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  logo,
  logoKey,
  catalogGroups,
  activeCatalogSection,
  isCatalogDropdownOpen,
  onCatalogDropdownToggle,
  onCatalogSectionToggle,
  onCatalogItemClick,
  onTrackOrder,
}) => {
  const mobileDrawerLinks: DrawerLinkItem[] = [
    { key: 'campaign', label: 'Campaign', icon: () => <Gift size={18} /> },
    { key: 'recommend', label: 'Recommend', icon: () => <Heart size={18} />, action: onTrackOrder },
    { key: 'faqs', label: 'FAQs', icon: () => <Info size={18} /> },
  ];

  const handleDrawerNavClick = (action?: () => void) => {
    onClose();
    action?.();
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose} 
      />
      
      {/* Drawer */}
      <aside className={`fixed inset-y-0 left-0 z-[99] w-[82%] max-w-sm bg-white shadow-2xl md:hidden transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-4 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {logo ? (
              <img key={logoKey} src={normalizeImageUrl(logo)} alt="Store Logo" className="h-8 object-contain" />
            ) : (
              <span className="text-lg font-black tracking-tight text-gray-900">
                GADGET<span className="text-theme-primary">SHOB</span>
              </span>
            )}
          </div>
          <button type="button" className="p-2 rounded-full text-gray-600 hover:bg-gray-50" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        {/* Catalog dropdown */}
        <div className="rounded-2xl border border-gray-200 shadow-sm overflow-hidden mt-2 mx-4">
          <button 
            type="button" 
            className="flex w-full items-center justify-between px-5 py-3 text-sm font-semibold text-gray-900 bg-gray-50" 
            onClick={onCatalogDropdownToggle}
          >
            <div className="flex items-center gap-3"><Grid size={18} /><span>Catalog</span></div>
            <ChevronDown className={`transition-transform ${isCatalogDropdownOpen ? 'rotate-180' : ''}`} size={18} />
          </button>
          <div className={`border-t border-gray-200 transition-[max-height] duration-300 ${isCatalogDropdownOpen ? 'max-h-[520px]' : 'max-h-0'} overflow-hidden`}>
            {catalogGroups.map((group) => (
              <div key={group.key}>
                <button 
                  type="button" 
                  className={`flex w-full items-center justify-between px-4 py-3 text-sm font-semibold ${activeCatalogSection === group.key ? 'text-theme-primary bg-theme-primary/10' : 'text-gray-800'}`} 
                  onClick={() => onCatalogSectionToggle(group.key)}
                >
                  <span>{group.label}</span>
                  {activeCatalogSection === group.key ? <Minus size={16} /> : <Plus size={16} />}
                </button>
                <ul className={`pl-10 pr-6 text-xs text-gray-600 transition-[max-height] duration-300 overflow-hidden ${activeCatalogSection === group.key ? 'max-h-60 py-3 space-y-1.5' : 'max-h-0'}`}>
                  {group.items.map((item) => (
                    <li key={item}>
                      <button type="button" className="w-full text-left hover:text-theme-primary" onClick={() => onCatalogItemClick(item)}>
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          <nav className="space-y-2">
            {mobileDrawerLinks.map((item) => {
              const Icon = item.icon;
              return (
                <button 
                  key={item.key} 
                  type="button" 
                  className="w-full flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 text-left text-sm font-semibold text-gray-800 shadow-sm" 
                  onClick={() => handleDrawerNavClick(item.action)}
                >
                  <Icon /><span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default MobileDrawer;
