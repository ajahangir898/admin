
import React, { useState, useRef, useEffect } from 'react';
import { Upload, Save, Trash2, Image as ImageIcon, Layout, Palette, Moon, Sun, Globe, MapPin, Mail, Phone, Plus, Facebook, Instagram, Youtube, ShoppingBag, Youtube as YoutubeIcon, Search, Eye, MoreVertical, Edit, Check, X, Filter, ChevronLeft, ChevronRight, Layers, Loader2, CheckCircle2, MessageCircle, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';
import { ThemeConfig, WebsiteConfig, SocialLink, CarouselItem, FooterLink, Popup, Campaign } from '../types';
import { convertFileToWebP, convertCarouselImage, dataUrlToFile, CAROUSEL_WIDTH, CAROUSEL_HEIGHT, CAROUSEL_MOBILE_WIDTH, CAROUSEL_MOBILE_HEIGHT } from '../services/imageUtils';
import { DataService } from '../services/DataService';
import { normalizeImageUrl } from '../utils/imageUrlHelper';
import { uploadPreparedImageToServer } from '../services/imageUploadService';

interface AdminCustomizationProps {
    tenantId: string;
  logo: string | null;
  onUpdateLogo: (logo: string | null) => void;
  themeConfig?: ThemeConfig;
    onUpdateTheme?: (config: ThemeConfig) => Promise<void>;
  websiteConfig?: WebsiteConfig;
    onUpdateWebsiteConfig?: (config: WebsiteConfig) => Promise<void>;
  initialTab?: string;
}

const AdminCustomization: React.FC<AdminCustomizationProps> = ({ 
    tenantId,
  logo, 
  onUpdateLogo,
  themeConfig,
  onUpdateTheme,
  websiteConfig,
  onUpdateWebsiteConfig,
  initialTab = 'website_info'
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Sync tab with prop change (for sidebar navigation)
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  
  const [config, setConfig] = useState<WebsiteConfig>({
    websiteName: '',
    shortDescription: '',
    whatsappNumber: '',
    favicon: null,
    headerLogo: null,
    footerLogo: null,
    addresses: [],
    emails: [],
    phones: [],
    socialLinks: [],
    footerQuickLinks: [],
    footerUsefulLinks: [],
    showMobileHeaderCategory: true,
    showNewsSlider: true,
    headerSliderText: '',
    hideCopyright: false,
    hideCopyrightText: false,
    showPoweredBy: false,
    showFlashSaleCounter: true,
    brandingText: '',
    carouselItems: [],
    campaigns: [],
    searchHints: '',
    orderLanguage: 'English',
    adminNoticeText: ''
  });

  // Initialize config from props
  useEffect(() => {
    if (websiteConfig) {
            setConfig(prev => ({
                ...prev,
                ...websiteConfig,
                footerQuickLinks: websiteConfig.footerQuickLinks || [],
                footerUsefulLinks: websiteConfig.footerUsefulLinks || [],
                showFlashSaleCounter: websiteConfig.showFlashSaleCounter ?? true,
                headerLogo: websiteConfig.headerLogo ?? null,
                footerLogo: websiteConfig.footerLogo ?? null,
                campaigns: websiteConfig.campaigns || []
            }));
    }
  }, [websiteConfig]);

  // Load popups
  useEffect(() => {
    const loadPopups = async () => {
      const data = await DataService.get<Popup[]>('popups', []);
      setPopups(data);
    };
    loadPopups();
  }, []);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
    const headerLogoInputRef = useRef<HTMLInputElement>(null);
    const footerLogoInputRef = useRef<HTMLInputElement>(null);
  
  // Theme State
        type ThemeColorKey = 'primary' | 'secondary' | 'tertiary' | 'font' | 'hover' | 'surface' | 'adminBg' | 'adminInputBg' | 'adminBorder' | 'adminFocus';

        const defaultThemeColors: Record<ThemeColorKey, string> = {
        primary: '#22c55e',
        secondary: '#ec4899',
        tertiary: '#9333ea',
            font: '#0f172a',
            hover: '#f97316',
            surface: '#e2e8f0',
            // Admin theme colors
            adminBg: '#030407',
            adminInputBg: '#0f172a',
            adminBorder: '#ffffff',
            adminFocus: '#f87171'
    };

    const [colors, setColors] = useState({ ...defaultThemeColors });
    const [colorDrafts, setColorDrafts] = useState({ ...defaultThemeColors });
  const [isDarkMode, setIsDarkMode] = useState(false);

    const normalizeHex = (value: string) => {
        const stripped = value.trim().replace(/[^0-9a-fA-F]/g, '');
        if (stripped.length === 3) {
            return `#${stripped.split('').map(char => `${char}${char}`).join('').toUpperCase()}`;
        }
        if (stripped.length === 6) {
            return `#${stripped.toUpperCase()}`;
        }
        return '';
    };

    const updateThemeColor = (key: ThemeColorKey, value: string) => {
        const normalized = normalizeHex(value);
        if (!normalized) return;
        setColors(prev => ({ ...prev, [key]: normalized }));
    };

    // Carousel State
  const [carouselFilter, setCarouselFilter] = useState<'All' | 'Publish' | 'Draft' | 'Trash'>('All');
  const [carouselSearch, setCarouselSearch] = useState('');
  const [isCarouselModalOpen, setIsCarouselModalOpen] = useState(false);
  const [editingCarousel, setEditingCarousel] = useState<CarouselItem | null>(null);
  const [carouselFormData, setCarouselFormData] = useState<Partial<CarouselItem>>({
      name: '', image: '', mobileImage: '', url: '', urlType: 'Internal', serial: 1, status: 'Publish'
  });
  const carouselFileRef = useRef<HTMLInputElement>(null);
  const carouselMobileFileRef = useRef<HTMLInputElement>(null);

  // Popup State
  const [popups, setPopups] = useState<Popup[]>([]);
  const [isPopupModalOpen, setIsPopupModalOpen] = useState(false);
  const [editingPopup, setEditingPopup] = useState<Popup | null>(null);
  const [popupFilter, setPopupFilter] = useState<'All' | 'Publish' | 'Draft'>('All');
  const [popupSearch, setPopupSearch] = useState('');
  const [popupFormData, setPopupFormData] = useState<Partial<Popup>>({
    name: '', image: '', url: '', urlType: 'Internal', priority: 0, status: 'Draft' 
  });
  const popupFileRef = useRef<HTMLInputElement>(null);

  // Campaign State
  const [campaignFilter, setCampaignFilter] = useState<'All' | 'Publish' | 'Draft'>('All');
  const [campaignSearch, setCampaignSearch] = useState('');
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [campaignFormData, setCampaignFormData] = useState<Partial<Campaign>>({
    name: '', logo: '', startDate: '', endDate: '', url: '', status: 'Publish', serial: 1
  });
  const campaignLogoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (themeConfig) {
      setColors({
        primary: themeConfig.primaryColor,
        secondary: themeConfig.secondaryColor,
                tertiary: themeConfig.tertiaryColor,
                font: themeConfig.fontColor || defaultThemeColors.font,
                hover: themeConfig.hoverColor || defaultThemeColors.hover,
                surface: themeConfig.surfaceColor || defaultThemeColors.surface,
                adminBg: themeConfig.adminBgColor || defaultThemeColors.adminBg,
                adminInputBg: themeConfig.adminInputBgColor || defaultThemeColors.adminInputBg,
                adminBorder: themeConfig.adminBorderColor || defaultThemeColors.adminBorder,
                adminFocus: themeConfig.adminFocusColor || defaultThemeColors.adminFocus
      });
      setIsDarkMode(themeConfig.darkMode);
    }
  }, [themeConfig]);

    useEffect(() => {
        setColorDrafts(colors);
    }, [colors]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon' | 'carousel' | 'carouselMobile' | 'popup' | 'headerLogo' | 'footerLogo') => {
        const input = e.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert("File size is too large. Please upload an image under 2MB.");
            if (input) input.value = '';
            return;
        }

        try {
            // Convert to WebP before persisting to keep payloads light.
            let converted: string;
            
            if (type === 'carousel') {
                // Carousel: exact 1280x330 WebP
                converted = await convertCarouselImage(file, { quality: 0.85 });
            } else if (type === 'carouselMobile') {
                // Mobile Carousel: 800x450 WebP (16:9)
                converted = await convertCarouselImage(file, { 
                    width: CAROUSEL_MOBILE_WIDTH, 
                    height: CAROUSEL_MOBILE_HEIGHT, 
                    quality: 0.85 
                });
            } else {
                converted = await convertFileToWebP(file, {
                    quality: type === 'favicon' ? 0.9 : 0.82,
                    maxDimension: type === 'favicon' ? 512 : 2000
                });
            }
            
            if (type === 'carousel' || type === 'carouselMobile') {
                // Upload carousel assets to server (tenant-scoped) instead of storing base64.
                const webpFile = dataUrlToFile(
                    converted,
                    `${type === 'carouselMobile' ? 'carousel-mobile' : 'carousel'}-${Date.now()}.webp`
                );
                const uploadedUrl = await uploadPreparedImageToServer(webpFile, tenantId, 'carousel');

                if (type === 'carousel') {
                    setCarouselFormData(prev => ({ ...prev, image: uploadedUrl }));
                } else {
                    setCarouselFormData(prev => ({ ...prev, mobileImage: uploadedUrl }));
                }
            } else if (type === 'logo') {
                onUpdateLogo(converted);
            } else if (type === 'favicon') {
                setConfig(prev => ({ ...prev, favicon: converted }));
            } else if (type === 'headerLogo') {
                setConfig(prev => ({ ...prev, headerLogo: converted }));
            } else if (type === 'footerLogo') {
                setConfig(prev => ({ ...prev, footerLogo: converted }));
            } else if (type === 'popup') {
                setPopupFormData(prev => ({ ...prev, image: converted }));
            }
        } catch (error) {
            console.error('Failed to process image upload', error);
            alert('Unable to process this image. Please try another file.');
        } finally {
            if (input) input.value = '';
        }
    };

    const handleRemoveImage = (type: 'logo' | 'favicon' | 'headerLogo' | 'footerLogo') => {
        if (type === 'logo') {
            onUpdateLogo(null);
            if (logoInputRef.current) logoInputRef.current.value = '';
            return;
        }

        if (type === 'favicon') {
            setConfig(prev => ({ ...prev, favicon: null }));
            if (faviconInputRef.current) faviconInputRef.current.value = '';
            return;
        }

        if (type === 'headerLogo') {
            setConfig(prev => ({ ...prev, headerLogo: null }));
            if (headerLogoInputRef.current) headerLogoInputRef.current.value = '';
            return;
        }

        setConfig(prev => ({ ...prev, footerLogo: null }));
        if (footerLogoInputRef.current) footerLogoInputRef.current.value = '';
    };

  // Helper for array fields
  const addArrayItem = (field: 'addresses' | 'emails' | 'phones') => {
    setConfig(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };
  const updateArrayItem = (field: 'addresses' | 'emails' | 'phones', index: number, value: string) => {
    const newArray = [...config[field]];
    newArray[index] = value;
    setConfig(prev => ({ ...prev, [field]: newArray }));
  };
  const removeArrayItem = (field: 'addresses' | 'emails' | 'phones', index: number) => {
    setConfig(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  // Social Links Helpers
  const addSocial = () => {
    setConfig(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { id: Date.now().toString(), platform: 'Facebook', url: '' }]
    }));
  };
  const updateSocial = (index: number, key: keyof SocialLink, value: string) => {
    const newLinks = [...config.socialLinks];
    newLinks[index] = { ...newLinks[index], [key]: value };
    setConfig(prev => ({ ...prev, socialLinks: newLinks }));
  };
  const removeSocial = (index: number) => {
    setConfig(prev => ({ ...prev, socialLinks: prev.socialLinks.filter((_, i) => i !== index) }));
  };

    type FooterLinkField = 'footerQuickLinks' | 'footerUsefulLinks';

    const themeColorGuides: Array<{ key: ThemeColorKey; label: string; helper: string }> = [
        { key: 'primary', label: 'Primary Accent', helper: 'Sidebar active state, admin CTAs, storefront hero buttons' },
        { key: 'secondary', label: 'Secondary Accent', helper: 'Warning chips, checkout highlights, floating badges' },
        { key: 'tertiary', label: 'Depth Accent', helper: 'Charts, outlines, subtle gradients' },
        { key: 'font', label: 'Global Font Color', helper: 'Header links, footer text, storefront typography' },
        { key: 'hover', label: 'Hover Accent', helper: 'Header & footer hover states, interactive link highlights' },
        { key: 'surface', label: 'Surface Glow', helper: 'Footer background wash, elevated cards, wishlist buttons' },
        { key: 'adminBg', label: 'Admin Background', helper: 'Admin panel main background color' },
        { key: 'adminInputBg', label: 'Admin Input Background', helper: 'Admin input fields, select boxes, text areas background' },
        { key: 'adminBorder', label: 'Admin Border Color', helper: 'Admin panel borders, dividers, outlines' },
        { key: 'adminFocus', label: 'Admin Focus Color', helper: 'Input focus states, active highlights in admin' }
    ];

    const addFooterLink = (field: FooterLinkField) => {
        setConfig(prev => {
            const nextLinks = [
                ...(((prev[field] as FooterLink[]) || [])),
                { id: Date.now().toString(), label: '', url: '' }
            ];
            return { ...prev, [field]: nextLinks };
        });
    };

    const updateFooterLink = (field: FooterLinkField, index: number, key: keyof FooterLink, value: string) => {
        const current = [...(((config[field] as FooterLink[]) || []))];
        current[index] = { ...current[index], [key]: value };
        setConfig(prev => ({ ...prev, [field]: current }));
    };

    const removeFooterLink = (field: FooterLinkField, index: number) => {
        setConfig(prev => ({
            ...prev,
            [field]: (((prev[field] as FooterLink[]) || []).filter((_, i) => i !== index))
        }));
    };

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      // Save Website Config
      if (onUpdateWebsiteConfig) {
                await onUpdateWebsiteConfig(config);
      }
      
      // Save Theme
      if (onUpdateTheme) {
                await onUpdateTheme({
          primaryColor: colors.primary,
          secondaryColor: colors.secondary,
          tertiaryColor: colors.tertiary,
          fontColor: colors.font,
          hoverColor: colors.hover,
          surfaceColor: colors.surface,
          darkMode: isDarkMode,
          adminBgColor: colors.adminBg,
          adminInputBgColor: colors.adminInputBg,
          adminBorderColor: colors.adminBorder,
          adminFocusColor: colors.adminFocus
        });
      }
      
      setSaveSuccess(true);
      toast.success('Changes saved successfully!');
      
      // Reset success state after animation
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to save changes:', error);
      toast.error('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Carousel Logic
  const openCarouselModal = (item?: CarouselItem) => {
      if (item) {
          setEditingCarousel(item);
          setCarouselFormData({ ...item });
      } else {
          setEditingCarousel(null);
          setCarouselFormData({
              name: '',
              image: '',
              mobileImage: '',
              url: '',
              urlType: 'Internal',
              serial: config.carouselItems.length + 1,
              status: 'Publish'
          });
      }
      setIsCarouselModalOpen(true);
  };

  const saveCarouselItem = (e: React.FormEvent) => {
      e.preventDefault();
      
      const newItem: CarouselItem = {
          id: editingCarousel ? editingCarousel.id : Date.now().toString(),
          name: carouselFormData.name || 'Untitled',
          image: carouselFormData.image || '',
          mobileImage: carouselFormData.mobileImage || '',
          url: carouselFormData.url || '#',
          urlType: carouselFormData.urlType as 'Internal' | 'External',
          serial: Number(carouselFormData.serial),
          status: carouselFormData.status as 'Publish' | 'Draft'
      };

      let newItems;
      if (editingCarousel) {
          newItems = config.carouselItems.map(i => i.id === editingCarousel.id ? newItem : i);
      } else {
          newItems = [...config.carouselItems, newItem];
      }
      
      setConfig(prev => ({ ...prev, carouselItems: newItems }));
      setIsCarouselModalOpen(false);
  };

  const deleteCarouselItem = (id: string) => {
      if(confirm('Are you sure you want to delete this carousel?')) {
          setConfig(prev => ({ ...prev, carouselItems: prev.carouselItems.filter(i => i.id !== id) }));
      }
  };

  // Filter Logic
  const filteredCarouselItems = config.carouselItems.filter(item => {
      const matchesStatus = carouselFilter === 'All' || item.status === carouselFilter;
      const matchesSearch = item.name.toLowerCase().includes(carouselSearch.toLowerCase());
      return matchesStatus && matchesSearch;
  });

  // Campaign Logic
  const openCampaignModal = (campaign?: Campaign) => {
      if (campaign) {
          setEditingCampaign(campaign);
          setCampaignFormData({ ...campaign });
      } else {
          setEditingCampaign(null);
          setCampaignFormData({
              name: '',
              logo: '',
              startDate: '',
              endDate: '',
              url: '',
              serial: (config.campaigns?.length || 0) + 1,
              status: 'Publish'
          });
      }
      setIsCampaignModalOpen(true);
  };

  const saveCampaign = (e: React.FormEvent) => {
      e.preventDefault();
      
      const newCampaign: Campaign = {
          id: editingCampaign ? editingCampaign.id : Date.now().toString(),
          name: campaignFormData.name || 'Untitled',
          logo: campaignFormData.logo || '',
          startDate: campaignFormData.startDate || new Date().toISOString(),
          endDate: campaignFormData.endDate || new Date().toISOString(),
          url: campaignFormData.url || '#',
          serial: Number(campaignFormData.serial),
          status: campaignFormData.status as 'Publish' | 'Draft'
      };

      let newCampaigns;
      if (editingCampaign) {
          newCampaigns = (config.campaigns || []).map(c => c.id === editingCampaign.id ? newCampaign : c);
      } else {
          newCampaigns = [...(config.campaigns || []), newCampaign];
      }
      
      setConfig(prev => ({ ...prev, campaigns: newCampaigns }));
      setIsCampaignModalOpen(false);
  };

  const deleteCampaign = (id: string) => {
      if(confirm('Are you sure you want to delete this campaign?')) {
          setConfig(prev => ({ ...prev, campaigns: (prev.campaigns || []).filter(c => c.id !== id) }));
      }
  };

  const filteredCampaigns = (config.campaigns || []).filter(campaign => {
      const matchesStatus = campaignFilter === 'All' || campaign.status === campaignFilter;
      const matchesSearch = campaign.name.toLowerCase().includes(campaignSearch.toLowerCase());
      return matchesStatus && matchesSearch;
  });

  const handleCampaignLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
          const converted = await convertFileToWebP(file, { quality: 0.85, maxDimension: 400 });
          const webpFile = dataUrlToFile(converted, `campaign-logo-${Date.now()}.webp`);
          const uploadedUrl = await uploadPreparedImageToServer(webpFile, tenantId, 'carousel');
          setCampaignFormData(prev => ({ ...prev, logo: uploadedUrl }));
      } catch (error) {
          console.error('Failed to upload campaign logo', error);
          toast.error('Failed to upload logo');
      }
      if (campaignLogoRef.current) campaignLogoRef.current.value = '';
  };
  
  const socialOptions = ['Facebook', 'Instagram', 'YouTube', 'Daraz', 'Twitter', 'LinkedIn'];
    const footerLinkSections: { field: FooterLinkField; title: string; helper: string }[] = [
        { field: 'footerQuickLinks', title: 'Footer Quick Links', helper: 'Shown in the Quick Links column of Footer 3' },
        { field: 'footerUsefulLinks', title: 'Footer Useful Links', helper: 'Shown in the Useful Links column of Footer 3' }
    ];

  // Popup Handlers
  const openPopupModal = (popup?: Popup) => {
    if (popup) {
      setEditingPopup(popup);
      setPopupFormData(popup);
    } else {
      setEditingPopup(null);
      setPopupFormData({ name: '', image: '', url: '', urlType: 'Internal', priority: 0, status: 'Draft' });
    }
    setIsPopupModalOpen(true);
  };

  const savePopup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!popupFormData.name || !popupFormData.image) {
      alert('Please fill in required fields');
      return;
    }
    let updatedPopups: Popup[];
    if (editingPopup) {
      updatedPopups = popups.map(p => p.id === editingPopup.id ? { ...popupFormData, id: editingPopup.id, updatedAt: new Date().toISOString() } as Popup : p);
    } else {
      const newPopup: Popup = { ...popupFormData, id: Date.now(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Popup;
      updatedPopups = [...popups, newPopup];
    }
    await DataService.save('popups', updatedPopups);
    setPopups(updatedPopups);
    setIsPopupModalOpen(false);
  };

  const deletePopup = async (id: number) => {
    if (confirm('Are you sure you want to delete this popup?')) {
      const updatedPopups = popups.filter(p => p.id !== id);
      await DataService.save('popups', updatedPopups);
      setPopups(updatedPopups);
    }
  };

  const togglePopupStatus = async (popup: Popup) => {
    const newStatus = popup.status === 'Draft' ? 'Publish' : 'Draft';
    const updatedPopups = popups.map(p => p.id === popup.id ? { ...p, status: newStatus, updatedAt: new Date().toISOString() } : p);
    await DataService.save('popups', updatedPopups);
    setPopups(updatedPopups);
  };

  const filteredPopups = popups.filter(popup => {
    const matchesStatus = popupFilter === 'All' || popup.status === popupFilter;
    const matchesSearch = popup.name.toLowerCase().includes(popupSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const TabButton = ({ id, label, icon }: { id: string, label: string, icon?: React.ReactNode }) => (
      <button 
        onClick={() => setActiveTab(id)}
        className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap ${activeTab === id ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
      >
        {icon} {label}
      </button>
  );

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-gray-50 z-30 pt-4 pb-2">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Customization</h2>
           <p className="text-sm text-gray-500">Manage appearance and content</p>
        </div>
        <button 
           onClick={handleSave}
           disabled={isSaving}
           className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all duration-300 shadow-lg min-w-[160px] justify-center ${
             saveSuccess 
               ? 'bg-emerald-500 text-white shadow-emerald-200' 
               : isSaving 
                 ? 'bg-green-500 text-white shadow-green-200 cursor-wait' 
                 : 'bg-green-600 text-white shadow-green-200 hover:bg-green-700 hover:shadow-xl'
           }`}
        >
           {saveSuccess ? (
             <>
               <CheckCircle2 size={18} className="animate-bounce" />
               Saved!
             </>
           ) : isSaving ? (
             <>
               <Loader2 size={18} className="animate-spin" />
               Saving...
             </>
           ) : (
             <>
               <Save size={18} /> Save Changes
             </>
           )}
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide bg-white rounded-t-xl">
         <TabButton id="carousel" label="Carousel" icon={<ImageIcon size={18}/>} />
         <TabButton id="campaigns" label="Campaigns" icon={<CalendarDays size={18}/>} />
         <TabButton id="popup" label="Popup" icon={<Layers size={18}/>} />
         <TabButton id="website_info" label="Website Information" icon={<Globe size={18}/>} />
         <TabButton id="chat_settings" label="Chat Settings" icon={<MessageCircle size={18}/>} />
         <TabButton id="theme_view" label="Theme View" icon={<Layout size={18}/>} />
         <TabButton id="theme_colors" label="Theme Colors" icon={<Palette size={18}/>} />
      </div>

      <div className="bg-white rounded-b-xl border border-t-0 border-gray-200 shadow-sm p-6 min-h-[500px]">
        
        {/* CAROUSEL TAB */}
        {activeTab === 'carousel' && (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        {['All', 'Publish', 'Draft', 'Trash'].map(status => (
                            <button 
                                key={status}
                                onClick={() => setCarouselFilter(status as any)}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                                    carouselFilter === status 
                                    ? 'bg-white text-green-600 shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {status === 'All' ? 'All Data' : status}
                                {status === 'All' && <span className="ml-1 text-xs bg-gray-200 px-1.5 rounded-full">{config.carouselItems.length}</span>}
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <input 
                                type="text" 
                                placeholder="Search" 
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                                value={carouselSearch}
                                onChange={(e) => setCarouselSearch(e.target.value)}
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                        </div>
                        <button 
                            onClick={() => openCarouselModal()} 
                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-green-700 whitespace-nowrap"
                        >
                            <Plus size={16}/> Add Carousel
                        </button>
                    </div>
                </div>
                
                <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-green-50 text-gray-700 font-semibold text-xs uppercase border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 w-10"><input type="checkbox" className="rounded text-green-600 focus:ring-green-500"/></th>
                                <th className="px-4 py-3">Image</th>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Url</th>
                                <th className="px-4 py-3">Url Type</th>
                                <th className="px-4 py-3">Serial</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredCarouselItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition group">
                                    <td className="px-4 py-3"><input type="checkbox" className="rounded text-green-600 focus:ring-green-500"/></td>
                                    <td className="px-4 py-3">
                                        <div className="w-16 h-10 bg-gray-100 rounded border border-gray-200 overflow-hidden relative">
                                            {item.image ? (
                                                <img src={normalizeImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover"/>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={16}/></div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{item.url}</td>
                                    <td className="px-4 py-3 text-gray-500">{item.urlType}</td>
                                    <td className="px-4 py-3 text-gray-800 font-mono">{item.serial}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                            item.status === 'Publish' 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-orange-100 text-orange-700'
                                        }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                                            <button onClick={() => openCarouselModal(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                                                <Edit size={16}/>
                                            </button>
                                            <button onClick={() => deleteCarouselItem(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Delete">
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredCarouselItems.length === 0 && (
                                <tr><td colSpan={8} className="text-center py-12 text-gray-400 flex flex-col items-center justify-center">
                                    <ImageIcon size={32} className="mb-2 opacity-50"/>
                                    No carousel items found matching your criteria.
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Mock) */}
                <div className="flex justify-end items-center gap-2">
                    <span className="text-sm text-gray-600">1 of 1</span>
                    <div className="flex border rounded-lg overflow-hidden">
                        <button disabled className="px-2 py-1 bg-gray-50 text-gray-400 border-r"><ChevronLeft size={16}/></button>
                        <button disabled className="px-2 py-1 bg-gray-50 text-gray-400"><ChevronRight size={16}/></button>
                    </div>
                </div>
            </div>
        )}

        {/* CAMPAIGNS TAB */}
        {activeTab === 'campaigns' && (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        {['All', 'Publish', 'Draft'].map(status => (
                            <button 
                                key={status}
                                onClick={() => setCampaignFilter(status as any)}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                                    campaignFilter === status 
                                    ? 'bg-white text-green-600 shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {status === 'All' ? 'All Campaigns' : status}
                                {status === 'All' && <span className="ml-1 text-xs bg-gray-200 px-1.5 rounded-full">{(config.campaigns || []).length}</span>}
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                            <input 
                                type="text"
                                value={campaignSearch}
                                onChange={(e) => setCampaignSearch(e.target.value)}
                                placeholder="Search campaigns..."
                                className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                        <button onClick={() => openCampaignModal()} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium">
                            <Plus size={18}/> Add Campaign
                        </button>
                    </div>
                </div>

                {/* Campaigns Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCampaigns.map((campaign) => (
                        <div key={campaign.id} className="bg-white border rounded-xl overflow-hidden hover:shadow-lg transition group">
                            <div className="p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    {campaign.logo ? (
                                        <img src={normalizeImageUrl(campaign.logo)} alt={campaign.name} className="w-16 h-10 object-contain rounded" />
                                    ) : (
                                        <div className="w-16 h-10 bg-gray-100 rounded flex items-center justify-center">
                                            <CalendarDays className="text-gray-400" size={20} />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-800 truncate">{campaign.name}</h4>
                                        <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${campaign.status === 'Publish' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {campaign.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p>Starts: {new Date(campaign.startDate).toLocaleDateString()}</p>
                                    <p>Ends: {new Date(campaign.endDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex border-t divide-x">
                                <button onClick={() => openCampaignModal(campaign)} className="flex-1 px-4 py-2 text-blue-600 hover:bg-blue-50 font-medium flex items-center justify-center gap-1">
                                    <Edit size={16}/> Edit
                                </button>
                                <button onClick={() => deleteCampaign(campaign.id)} className="flex-1 px-4 py-2 text-red-600 hover:bg-red-50 font-medium flex items-center justify-center gap-1">
                                    <Trash2 size={16}/> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredCampaigns.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            <CalendarDays size={48} className="mx-auto mb-3 opacity-30"/>
                            <p>No campaigns found. Add your first campaign!</p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* Campaign Modal */}
        {isCampaignModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsCampaignModalOpen(false)}>
                <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                    <div className="p-6 border-b sticky top-0 bg-white z-10">
                        <h3 className="text-xl font-bold">{editingCampaign ? 'Edit Campaign' : 'Add New Campaign'}</h3>
                    </div>
                    <form onSubmit={saveCampaign} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name *</label>
                            <input 
                                type="text" 
                                value={campaignFormData.name || ''} 
                                onChange={e => setCampaignFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Logo</label>
                            <div className="flex items-center gap-4">
                                {campaignFormData.logo ? (
                                    <img src={normalizeImageUrl(campaignFormData.logo)} alt="Logo" className="w-20 h-12 object-contain border rounded" />
                                ) : (
                                    <div className="w-20 h-12 bg-gray-100 rounded flex items-center justify-center">
                                        <ImageIcon className="text-gray-400" size={24} />
                                    </div>
                                )}
                                <input type="file" ref={campaignLogoRef} accept="image/*" onChange={handleCampaignLogoUpload} className="hidden" />
                                <button type="button" onClick={() => campaignLogoRef.current?.click()} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                                    Upload Logo
                                </button>
                                {campaignFormData.logo && (
                                    <button type="button" onClick={() => setCampaignFormData(prev => ({ ...prev, logo: '' }))} className="text-red-500 hover:text-red-700">
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                                <input 
                                    type="datetime-local" 
                                    value={campaignFormData.startDate ? campaignFormData.startDate.slice(0, 16) : ''} 
                                    onChange={e => setCampaignFormData(prev => ({ ...prev, startDate: new Date(e.target.value).toISOString() }))}
                                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                                <input 
                                    type="datetime-local" 
                                    value={campaignFormData.endDate ? campaignFormData.endDate.slice(0, 16) : ''} 
                                    onChange={e => setCampaignFormData(prev => ({ ...prev, endDate: new Date(e.target.value).toISOString() }))}
                                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
                            <input 
                                type="text" 
                                value={campaignFormData.url || ''} 
                                onChange={e => setCampaignFormData(prev => ({ ...prev, url: e.target.value }))}
                                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                                placeholder="https://..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                                <input 
                                    type="number" 
                                    value={campaignFormData.serial || 1} 
                                    onChange={e => setCampaignFormData(prev => ({ ...prev, serial: parseInt(e.target.value) }))}
                                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                                    min={1}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select 
                                    value={campaignFormData.status || 'Publish'} 
                                    onChange={e => setCampaignFormData(prev => ({ ...prev, status: e.target.value as 'Publish' | 'Draft' }))}
                                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="Publish">Publish</option>
                                    <option value="Draft">Draft</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={() => setIsCampaignModalOpen(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">
                                Cancel
                            </button>
                            <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                                {editingCampaign ? 'Update' : 'Create'} Campaign
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* POPUP TAB */}
        {activeTab === 'popup' && (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        {['All', 'Publish', 'Draft'].map(status => (
                            <button 
                                key={status}
                                onClick={() => setPopupFilter(status as any)}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                                    popupFilter === status 
                                    ? 'bg-white text-green-600 shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {status === 'All' ? 'All Data' : status}
                                {status === 'All' && <span className="ml-1 text-xs bg-gray-200 px-1.5 rounded-full">{popups.length}</span>}
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <input 
                                type="text" 
                                placeholder="Search" 
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                                value={popupSearch}
                                onChange={(e) => setPopupSearch(e.target.value)}
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                        </div>
                        <button 
                            onClick={() => openPopupModal()} 
                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-green-700 whitespace-nowrap"
                        >
                            <Plus size={16}/> Add Popup
                        </button>
                    </div>
                </div>
                
                <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Image</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">URL</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Priority</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredPopups.length === 0 ? (
                                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No popups found</td></tr>
                            ) : (
                                filteredPopups.map(popup => (
                                    <tr key={popup.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <img src={popup.image} alt={popup.name} className="h-12 w-16 object-cover rounded border" />
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{popup.name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500 truncate max-w-xs">{popup.url || '-'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-800">{popup.priority || 0}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => togglePopupStatus(popup)}
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    popup.status === 'Publish'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-orange-100 text-orange-800'
                                                }`}
                                            >
                                                {popup.status}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openPopupModal(popup)} className="p-1.5 hover:bg-blue-50 rounded text-blue-600">
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={() => deletePopup(popup.id)} className="p-1.5 hover:bg-red-50 rounded text-red-600">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* WEBSITE INFO TAB */}
        {activeTab === 'website_info' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    {/* Default Logo Section */}
                     <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <ImageIcon size={32} className="text-gray-400"/>
                            <p className="text-sm font-bold text-gray-700">Primary Store Logo (Fallback)</p>
                            {logo ? (
                                <img src={normalizeImageUrl(logo)} alt="Store logo" className="h-12 max-w-[200px] object-contain my-2 border border-gray-200 rounded p-1 bg-gray-50"/>
                            ) : (
                                <p className="text-xs text-gray-400">No logo uploaded</p>
                            )}
                            <div className="flex gap-2">
                                <button onClick={() => logoInputRef.current?.click()} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded font-bold">Select Image</button>
                                {logo && <button onClick={() => handleRemoveImage('logo')} className="text-xs bg-red-500 text-white px-3 py-1.5 rounded font-bold">Remove</button>}
                            </div>
                            <input type="file" ref={logoInputRef} onChange={(e) => handleImageUpload(e, 'logo')} className="hidden" accept="image/*" />
                        </div>
                     </div>

                     {/* Header Logo Section */}
                     <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <ImageIcon size={32} className="text-gray-400"/>
                            <p className="text-sm font-bold text-gray-700">Header Logo Override</p>
                            {config.headerLogo ? (
                                <img src={normalizeImageUrl(config.headerLogo)} alt="Header logo" className="h-12 max-w-[200px] object-contain my-2 border border-gray-200 rounded p-1 bg-gray-50"/>
                            ) : (
                                <p className="text-xs text-gray-400">No header logo uploaded</p>
                            )}
                            <div className="flex gap-2">
                                <button onClick={() => headerLogoInputRef.current?.click()} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded font-bold">Select Image</button>
                                {config.headerLogo && <button onClick={() => handleRemoveImage('headerLogo')} className="text-xs bg-red-500 text-white px-3 py-1.5 rounded font-bold">Remove</button>}
                            </div>
                            <input type="file" ref={headerLogoInputRef} onChange={(e) => handleImageUpload(e, 'headerLogo')} className="hidden" accept="image/*" />
                        </div>
                     </div>

                     {/* Footer Logo Section */}
                     <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <ImageIcon size={32} className="text-gray-400"/>
                            <p className="text-sm font-bold text-gray-700">Footer Logo Override</p>
                            {config.footerLogo ? (
                                <img src={normalizeImageUrl(config.footerLogo)} alt="Footer logo" className="h-12 max-w-[200px] object-contain my-2 border border-gray-200 rounded p-1 bg-gray-50"/>
                            ) : (
                                <p className="text-xs text-gray-400">No footer logo uploaded</p>
                            )}
                            <div className="flex gap-2">
                                <button onClick={() => footerLogoInputRef.current?.click()} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded font-bold">Select Image</button>
                                {config.footerLogo && <button onClick={() => handleRemoveImage('footerLogo')} className="text-xs bg-red-500 text-white px-3 py-1.5 rounded font-bold">Remove</button>}
                            </div>
                            <input type="file" ref={footerLogoInputRef} onChange={(e) => handleImageUpload(e, 'footerLogo')} className="hidden" accept="image/*" />
                        </div>
                     </div>
                     
                     {/* Favicon Section */}
                     <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <Globe size={32} className="text-gray-400"/>
                            <p className="text-sm font-bold text-gray-700">Favicon (32x32px)</p>
                            {config.favicon && <img src={config.favicon} alt="Favicon" className="w-8 h-8 object-contain my-2"/>}
                             <div className="flex gap-2">
                                <button onClick={() => faviconInputRef.current?.click()} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded font-bold">Select Image</button>
                                {config.favicon && <button onClick={() => handleRemoveImage('favicon')} className="text-xs bg-red-500 text-white px-3 py-1.5 rounded font-bold">Remove</button>}
                            </div>
                            <input type="file" ref={faviconInputRef} onChange={(e) => handleImageUpload(e, 'favicon')} className="hidden" accept="image/*" />
                        </div>
                     </div>

                     <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Website Name*</label>
                            <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500" 
                                value={config.websiteName} onChange={(e) => setConfig({...config, websiteName: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                            <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500" 
                                value={config.shortDescription} onChange={(e) => setConfig({...config, shortDescription: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Whatsapp Number</label>
                            <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500" 
                                value={config.whatsappNumber} onChange={(e) => setConfig({...config, whatsappNumber: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notice Text (Scrolling Ticker)</label>
                            <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500" 
                                placeholder="e.g., Easy return policy and complete cash on delivery, ease of shopping!"
                                value={config.adminNoticeText || ''} onChange={(e) => setConfig({...config, adminNoticeText: e.target.value})} />
                            <p className="text-xs text-gray-500 mt-1">This text will scroll from right to left at the top of the store header. Leave empty to hide.</p>
                        </div>
                     </div>
                 </div>

                 <div className="space-y-6">
                     {/* Dynamic Addresses */}
                     <div className="space-y-2">
                         <button onClick={() => addArrayItem('addresses')} className="bg-green-600 text-white px-4 py-2 rounded font-bold text-sm w-full flex items-center justify-center gap-2">
                             <Plus size={16}/> Add New Address
                         </button>
                         {config.addresses.map((addr, idx) => (
                             <div key={idx} className="flex gap-2">
                                 <input type="text" value={addr} onChange={(e) => updateArrayItem('addresses', idx, e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm"/>
                                 <button onClick={() => removeArrayItem('addresses', idx)} className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"><Trash2 size={16}/></button>
                             </div>
                         ))}
                     </div>

                     {/* Dynamic Emails */}
                     <div className="space-y-2">
                         <button onClick={() => addArrayItem('emails')} className="bg-green-600 text-white px-4 py-2 rounded font-bold text-sm w-full flex items-center justify-center gap-2">
                             <Plus size={16}/> Add New Email
                         </button>
                         {config.emails.map((email, idx) => (
                             <div key={idx} className="flex gap-2">
                                 <input type="text" value={email} onChange={(e) => updateArrayItem('emails', idx, e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm"/>
                                 <button onClick={() => removeArrayItem('emails', idx)} className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"><Trash2 size={16}/></button>
                             </div>
                         ))}
                     </div>

                     {/* Dynamic Phones */}
                     <div className="space-y-2">
                         <button onClick={() => addArrayItem('phones')} className="bg-green-600 text-white px-4 py-2 rounded font-bold text-sm w-full flex items-center justify-center gap-2">
                             <Plus size={16}/> Add New Phone No
                         </button>
                         {config.phones.map((phone, idx) => (
                             <div key={idx} className="flex gap-2">
                                 <input type="text" value={phone} onChange={(e) => updateArrayItem('phones', idx, e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm"/>
                                 <button onClick={() => removeArrayItem('phones', idx)} className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"><Trash2 size={16}/></button>
                             </div>
                         ))}
                     </div>

                     {/* Dynamic Social Links */}
                     <div className="space-y-2">
                         <button onClick={addSocial} className="bg-green-600 text-white px-4 py-2 rounded font-bold text-sm w-full flex items-center justify-center gap-2">
                             <Plus size={16}/> Add New Social Link
                         </button>
                         {config.socialLinks.map((link, idx) => (
                             <div key={link.id} className="bg-gray-50 border border-gray-200 p-3 rounded-lg space-y-2 relative">
                                 <div className="flex gap-2">
                                     <select value={link.platform} onChange={(e) => updateSocial(idx, 'platform', e.target.value)} className="w-1/3 text-sm border rounded px-2 py-1">
                                         {socialOptions.map(o => <option key={o} value={o}>{o}</option>)}
                                     </select>
                                     <input type="text" value={link.url} onChange={(e) => updateSocial(idx, 'url', e.target.value)} className="flex-1 text-sm border rounded px-2 py-1" placeholder="URL"/>
                                 </div>
                                 <button onClick={() => removeSocial(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600"><Trash2 size={12}/></button>
                             </div>
                         ))}
                     </div>

                     {/* Footer Link Groups */}
                     <div className="space-y-4">
                        {footerLinkSections.map(section => (
                            <div key={section.field} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white/60">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">{section.title}</p>
                                        <p className="text-xs text-gray-500">{section.helper}</p>
                                    </div>
                                    <button
                                        onClick={() => addFooterLink(section.field)}
                                        className="text-xs bg-green-600 text-white px-3 py-1.5 rounded font-bold flex items-center gap-1 self-start"
                                    >
                                        <Plus size={14}/> Add Link
                                    </button>
                                </div>
                                {((config[section.field] as FooterLink[]) || []).length === 0 && (
                                    <p className="text-xs text-gray-400">No links added yet.</p>
                                )}
                                {((config[section.field] as FooterLink[]) || []).map((link, idx) => (
                                    <div key={link.id} className="grid grid-cols-1 md:grid-cols-[1fr,1fr,auto] gap-2">
                                        <input
                                            type="text"
                                            value={link.label}
                                            onChange={(e) => updateFooterLink(section.field, idx, 'label', e.target.value)}
                                            className="px-3 py-2 border rounded-lg text-sm"
                                            placeholder="Label"
                                        />
                                        <input
                                            type="text"
                                            value={link.url}
                                            onChange={(e) => updateFooterLink(section.field, idx, 'url', e.target.value)}
                                            className="px-3 py-2 border rounded-lg text-sm"
                                            placeholder="https://"
                                        />
                                        <button
                                            onClick={() => removeFooterLink(section.field, idx)}
                                            className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-red-600"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ))}
                     </div>
                     
                     <div className="space-y-3 pt-4 border-t">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" className="w-5 h-5 text-green-600 rounded" checked={config.showMobileHeaderCategory} onChange={e => setConfig({...config, showMobileHeaderCategory: e.target.checked})}/>
                            <span className="text-sm font-medium">isShowMobileHeaderCategoryMenu</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" className="w-5 h-5 text-green-600 rounded" checked={config.showNewsSlider} onChange={e => setConfig({...config, showNewsSlider: e.target.checked})}/>
                            <span className="text-sm font-medium">Is Show News Slider</span>
                        </label>
                        {config.showNewsSlider && (
                             <div className="ml-8 border border-gray-300 rounded p-2 text-sm bg-gray-50">
                                <p className="text-xs text-gray-500 mb-1">Header Slider Text</p>
                                <textarea className="w-full bg-transparent outline-none resize-none" rows={2} value={config.headerSliderText} onChange={e => setConfig({...config, headerSliderText: e.target.value})} />
                             </div>
                        )}
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" className="w-5 h-5 text-green-600 rounded" checked={config.hideCopyright} onChange={e => setConfig({...config, hideCopyright: e.target.checked})}/>
                            <span className="text-sm font-medium">Hide Copyright Section in Footer</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" className="w-5 h-5 text-green-600 rounded" checked={config.hideCopyrightText} onChange={e => setConfig({...config, hideCopyrightText: e.target.checked})}/>
                            <span className="text-sm font-medium">Hide Copyright Text</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" className="w-5 h-5 text-green-600 rounded" checked={config.showPoweredBy} onChange={e => setConfig({...config, showPoweredBy: e.target.checked})}/>
                            <span className="text-sm font-medium">Powered by SystemNext IT (Show in footer)</span>
                        </label>
                        <div className="flex items-center justify-between gap-3 rounded-xl border border-sky-100 bg-sky-50/70 px-4 py-3">
                            <div>
                                <p className="text-sm font-semibold text-gray-800">Flash Sale Counter Tag</p>
                                <p className="text-xs text-gray-500">Show or hide the storefront countdown pill beside Flash Sales.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setConfig(prev => ({ ...prev, showFlashSaleCounter: !prev.showFlashSaleCounter }))}
                                className={`relative inline-flex items-center rounded-full border px-1 py-0.5 text-xs font-bold transition ${config.showFlashSaleCounter ? 'bg-emerald-500/10 text-emerald-700 border-emerald-300' : 'bg-gray-100 text-gray-500 border-gray-300'}`}
                            >
                                <span className={`px-3 py-1 rounded-full transition ${config.showFlashSaleCounter ? 'bg-white shadow' : 'opacity-50'}`}>
                                    {config.showFlashSaleCounter ? 'On' : 'Off'}
                                </span>
                            </button>
                        </div>
                        <div className="pt-2">
                             <label className="block text-xs text-gray-500 mb-1">Branding Text</label>
                             <input type="text" className="w-full px-3 py-2 border rounded text-sm" value={config.brandingText} onChange={e => setConfig({...config, brandingText: e.target.value})}/>
                        </div>
                     </div>
                 </div>
            </div>
        )}

        {/* CHAT SETTINGS TAB */}
        {activeTab === 'chat_settings' && (
            <div className="space-y-6 max-w-2xl">
                <div>
                    <h3 className="font-bold text-xl mb-2">Chat Settings</h3>
                    <p className="text-gray-500 text-sm mb-6">Configure live chat for your store</p>
                </div>

                {/* Chat Enable Toggle */}
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50">
                    <div>
                        <p className="font-semibold text-gray-800">Enable Live Chat</p>
                        <p className="text-sm text-gray-500">Allow customers to chat with you</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={config.chatEnabled ?? false}
                            onChange={(e) => setConfig({...config, chatEnabled: e.target.checked})}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                </div>

                {/* Chat Greeting */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Message</label>
                    <input 
                        type="text" 
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500" 
                        placeholder="Hi! How can we help you today?"
                        value={config.chatGreeting || ''}
                        onChange={(e) => setConfig({...config, chatGreeting: e.target.value})}
                    />
                    <p className="text-xs text-gray-500 mt-1">This message appears when chat opens</p>
                </div>

                {/* Offline Message */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Offline Message</label>
                    <input 
                        type="text" 
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500" 
                        placeholder="We're currently offline. Leave a message!"
                        value={config.chatOfflineMessage || ''}
                        onChange={(e) => setConfig({...config, chatOfflineMessage: e.target.value})}
                    />
                    <p className="text-xs text-gray-500 mt-1">Shown when support is unavailable</p>
                </div>

                {/* Support Hours */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Support Hours From</label>
                        <input 
                            type="time" 
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500" 
                            value={config.chatSupportHours?.from || '09:00'}
                            onChange={(e) => setConfig({...config, chatSupportHours: {...(config.chatSupportHours || {}), from: e.target.value}})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Support Hours To</label>
                        <input 
                            type="time" 
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500" 
                            value={config.chatSupportHours?.to || '18:00'}
                            onChange={(e) => setConfig({...config, chatSupportHours: {...(config.chatSupportHours || {}), to: e.target.value}})}
                        />
                    </div>
                </div>

                {/* WhatsApp Fallback */}
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50">
                    <div>
                        <p className="font-semibold text-gray-800">WhatsApp Fallback</p>
                        <p className="text-sm text-gray-500">Redirect to WhatsApp when chat is disabled</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={config.chatWhatsAppFallback ?? false}
                            onChange={(e) => setConfig({...config, chatWhatsAppFallback: e.target.checked})}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                </div>
            </div>
        )}

        {/* THEME VIEW TAB */}
        {activeTab === 'theme_view' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: 'Header Section', key: 'headerStyle', count: 5 },
                  { title: 'Showcase Section', key: 'showcaseSectionStyle', count: 5 },
                  { title: 'Brand Section', key: 'brandSectionStyle', count: 5, hasNone: true },
                  { title: 'Category Section', key: 'categorySectionStyle', count: 5, hasNone: true },
                  { title: 'Product Section', key: 'productSectionStyle', count: 5 },
                  { title: 'Product Card', key: 'productCardStyle', count: 5 },
                  { title: 'Footer Section', key: 'footerStyle', count: 5 },
                  { title: 'Bottom Nav', key: 'bottomNavStyle', count: 5 }
                ].map((section) => (
                    <div key={section.title} className="space-y-3">
                        <h3 className="font-bold text-gray-800 text-lg border-b pb-2">{section.title}</h3>
                        <div className="space-y-3">
                            {section.hasNone && (
                                <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <input 
                                          type="radio" 
                                          name={section.title} 
                                          className="w-5 h-5 text-green-600"
                                          checked={!config[section.key as keyof WebsiteConfig]}
                                          onChange={() => setConfig({...config, [section.key]: ''})}
                                        />
                                        <span className="font-bold text-gray-700">None</span>
                                    </div>
                                    <button className="bg-green-600 text-white px-4 py-1.5 rounded-md text-sm font-bold flex items-center gap-1">
                                        <Eye size={14} /> View Site
                                    </button>
                                </div>
                            )}
                            {Array.from({length: section.count}).map((_, i) => {
                                const val = `style${i+1}`;
                                const displayTitle = `${section.title.split(' ')[0]} ${i+1}`; // e.g. "Header 1"
                                const currentVal = config[section.key as keyof WebsiteConfig] || 'style1';
                                
                                return (
                                    <div key={i} className={`border rounded-lg p-4 flex items-center justify-between ${currentVal === val ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                                        <div className="flex items-center gap-3">
                                            <input 
                                              type="radio" 
                                              name={section.title}
                                              className="w-5 h-5 text-green-600"
                                              checked={currentVal === val}
                                              onChange={() => setConfig({...config, [section.key]: val})}
                                            />
                                            <span className="font-bold text-gray-700">{displayTitle}</span>
                                        </div>
                                        <button className="bg-green-600 text-white px-4 py-1.5 rounded-md text-sm font-bold flex items-center gap-1">
                                            <Eye size={14} /> View demo
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* THEME COLORS TAB */}
        {activeTab === 'theme_colors' && (
            <div className="space-y-8 max-w-1xl">
                 <div>
                     <h3 className="font-bold text-xl mb-4">Theme Colors</h3>
                     <p className="text-gray-500 text-sm mb-6">Dial in your storefront + admin palette with core accents, typography, hover states, and surface washes.</p>
                     
                     <div className="space-y-4">
                         {themeColorGuides.map(field => (
                             <div key={field.key} className="flex items-center gap-4 p-4 border border-gray-200 rounded-2xl bg-black shadow-sm">
                                 <div className="flex flex-col items-center gap-2">
                                     <input
                                         type="color"
                                         value={colors[field.key]}
                                         onChange={(e) => updateThemeColor(field.key, e.target.value)}
                                         className="w-14 h-14 rounded-full border border-white shadow focus:outline-none cursor-pointer"
                                     />
                                     <span className="text-[10px] uppercase tracking-[0.25em] text-gray-400">Pick</span>
                                 </div>
                                 <div className="flex-1">
                                     <p className="text-sm font-semibold text-gray-800">{field.label}</p>
                                     <p className="text-xs text-gray-500 mb-2">{field.helper}</p>
                                     <input
                                         type="text"
                                         value={colorDrafts[field.key]}
                                         onChange={(e) => setColorDrafts(prev => ({ ...prev, [field.key]: e.target.value }))}
                                         onBlur={() => updateThemeColor(field.key, colorDrafts[field.key])}
                                         className="w-full px-3 py-2 border rounded-lg font-mono uppercase focus:outline-none focus:ring-1 focus:ring-green-500"
                                     />
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>

                 <div>
                     <h3 className="font-bold text-xl mb-4">Search Hints</h3>
                     <input 
                        type="text" 
                        value={config.searchHints || ''} 
                        onChange={(e) => setConfig({...config, searchHints: e.target.value})}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                        placeholder="gadget item, gift, educational toy..."
                     />
                 </div>

                 <div>
                     <h3 className="font-bold text-xl mb-4">Order Language</h3>
                     <div className="space-y-3">
                         <label className="flex items-center gap-3 border p-4 rounded-lg cursor-pointer hover:bg-gray-50">
                             <input type="radio" name="lang" className="w-5 h-5 text-green-600" 
                               checked={config.orderLanguage === 'English'} onChange={() => setConfig({...config, orderLanguage: 'English'})}/>
                             <span className="font-bold">English</span>
                         </label>
                         <label className="flex items-center gap-3 border p-4 rounded-lg cursor-pointer hover:bg-gray-50">
                             <input type="radio" name="lang" className="w-5 h-5 text-green-600" 
                               checked={config.orderLanguage === 'Bangla'} onChange={() => setConfig({...config, orderLanguage: 'Bangla'})}/>
                             <span className="font-bold">Bangla</span>
                         </label>
                     </div>
                 </div>
            </div>
        )}

      </div>

      {/* Add/Edit Carousel Modal */}
      {isCarouselModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                  <div className="p-4 border-b bg-gray-50 flex justify-between items-center sticky top-0">
                      <h3 className="font-bold text-gray-800">{editingCarousel ? 'Edit Carousel' : 'Add New Carousel'}</h3>
                      <button onClick={() => setIsCarouselModalOpen(false)}><X size={20} className="text-gray-500"/></button>
                  </div>
                  <form onSubmit={saveCarouselItem} className="p-6 space-y-4">
                      {/* Desktop Banner */}
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Desktop Banner*</label>
                          <p className="text-xs text-gray-500 mb-2">Recommended: {CAROUSEL_WIDTH} × {CAROUSEL_HEIGHT}px (4:1 ratio). Auto-converted to WebP.</p>
                          <input type="file" ref={carouselFileRef} onChange={(e) => handleImageUpload(e, 'carousel')} className="hidden" accept="image/*" />
                          <div 
                              onClick={() => carouselFileRef.current?.click()}
                              className="border-2 border-dashed rounded-lg p-2 text-center cursor-pointer hover:bg-gray-50 transition h-28"
                          >
                              {carouselFormData.image ? (
                                  <img src={normalizeImageUrl(carouselFormData.image)} alt="Preview" className="w-full h-full object-cover rounded"/>
                              ) : (
                                  <div className="text-gray-400 flex flex-col items-center justify-center h-full">
                                      <Upload size={32} className="mb-2"/>
                                      <p className="text-sm">Click to upload desktop banner</p>
                                      <p className="text-xs mt-1">{CAROUSEL_WIDTH} × {CAROUSEL_HEIGHT}px</p>
                                  </div>
                              )}
                          </div>
                      </div>
                      
                      {/* Mobile Banner */}
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Banner (Optional)</label>
                          <p className="text-xs text-gray-500 mb-2">Recommended: {CAROUSEL_MOBILE_WIDTH} × {CAROUSEL_MOBILE_HEIGHT}px (16:9 ratio). Shows on mobile devices.</p>
                          <input type="file" ref={carouselMobileFileRef} onChange={(e) => handleImageUpload(e, 'carouselMobile')} className="hidden" accept="image/*" />
                          <div 
                              onClick={() => carouselMobileFileRef.current?.click()}
                              className="border-2 border-dashed border-blue-300 rounded-lg p-2 text-center cursor-pointer hover:bg-blue-50 transition h-28"
                          >
                              {carouselFormData.mobileImage ? (
                                  <div className="relative w-full h-full">
                                      <img src={normalizeImageUrl(carouselFormData.mobileImage)} alt="Mobile Preview" className="w-full h-full object-cover rounded"/>
                                      <button 
                                          type="button"
                                          onClick={(e) => { e.stopPropagation(); setCarouselFormData(prev => ({ ...prev, mobileImage: '' })); }}
                                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                      >
                                          <X size={14} />
                                      </button>
                                  </div>
                              ) : (
                                  <div className="text-blue-400 flex flex-col items-center justify-center h-full">
                                      <Upload size={32} className="mb-2"/>
                                      <p className="text-sm">Click to upload mobile banner</p>
                                      <p className="text-xs mt-1">{CAROUSEL_MOBILE_WIDTH} × {CAROUSEL_MOBILE_HEIGHT}px</p>
                                  </div>
                              )}
                          </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                              <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm" value={carouselFormData.name} onChange={e => setCarouselFormData({...carouselFormData, name: e.target.value})} required/>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Serial</label>
                              <input type="number" className="w-full px-3 py-2 border rounded-lg text-sm" value={carouselFormData.serial} onChange={e => setCarouselFormData({...carouselFormData, serial: Number(e.target.value)})} required/>
                          </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Url</label>
                              <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm" value={carouselFormData.url} onChange={e => setCarouselFormData({...carouselFormData, url: e.target.value})}/>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Url Type</label>
                              <select className="w-full px-3 py-2 border rounded-lg text-sm" value={carouselFormData.urlType} onChange={e => setCarouselFormData({...carouselFormData, urlType: e.target.value as any})}>
                                  <option value="Internal">Internal</option>
                                  <option value="External">External</option>
                              </select>
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <select className="w-full px-3 py-2 border rounded-lg text-sm" value={carouselFormData.status} onChange={e => setCarouselFormData({...carouselFormData, status: e.target.value as any})}>
                              <option value="Publish">Publish</option>
                              <option value="Draft">Draft</option>
                          </select>
                      </div>
                      <div className="pt-4 flex justify-end gap-3">
                          <button type="button" onClick={() => setIsCarouselModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700">Save Carousel</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Add/Edit Popup Modal */}
      {isPopupModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                  <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                      <h3 className="font-bold text-gray-800">{editingPopup ? 'Edit Popup' : 'Add New Popup'}</h3>
                      <button onClick={() => setIsPopupModalOpen(false)}><X size={20} className="text-gray-500"/></button>
                  </div>
                  <form onSubmit={savePopup} className="p-6 space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image*</label>
                          <input type="file" ref={popupFileRef} onChange={(e) => handleImageUpload(e, 'popup')} className="hidden" accept="image/*" />
                          <div 
                              onClick={() => popupFileRef.current?.click()}
                              className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition"
                          >
                              {popupFormData.image ? (
                                  <img src={normalizeImageUrl(popupFormData.image)} alt="Preview" className="h-32 mx-auto object-contain"/>
                              ) : (
                                  <div className="text-gray-400">
                                      <Upload size={32} className="mx-auto mb-2"/>
                                      <p className="text-sm">Click to upload image</p>
                                  </div>
                              )}
                          </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Name*</label>
                              <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm" value={popupFormData.name} onChange={e => setPopupFormData({...popupFormData, name: e.target.value})} required/>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                              <input type="number" className="w-full px-3 py-2 border rounded-lg text-sm" value={popupFormData.priority} onChange={e => setPopupFormData({...popupFormData, priority: Number(e.target.value)})} />
                          </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                              <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm" value={popupFormData.url} onChange={e => setPopupFormData({...popupFormData, url: e.target.value})}/>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">URL Type</label>
                              <select className="w-full px-3 py-2 border rounded-lg text-sm" value={popupFormData.urlType} onChange={e => setPopupFormData({...popupFormData, urlType: e.target.value as any})}>
                                  <option value="Internal">Internal</option>
                                  <option value="External">External</option>
                              </select>
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <select className="w-full px-3 py-2 border rounded-lg text-sm" value={popupFormData.status} onChange={e => setPopupFormData({...popupFormData, status: e.target.value as any})}>
                              <option value="Publish">Publish</option>
                              <option value="Draft">Draft</option>
                          </select>
                      </div>
                      <div className="pt-4 flex justify-end gap-3">
                          <button type="button" onClick={() => setIsPopupModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700">Save Popup</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminCustomization;
