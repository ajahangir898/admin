
import React, { useState, useRef, useEffect } from 'react';
import { Upload, Save, Trash2, Image as ImageIcon, Layout, Palette, Moon, Sun, Globe, MapPin, Mail, Phone, Plus, Facebook, Instagram, Youtube, ShoppingBag, Youtube as YoutubeIcon, Search, Eye, MoreVertical, Edit, Check, X, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { ThemeConfig, WebsiteConfig, SocialLink, CarouselItem, FooterLink } from '../types';
import { convertFileToWebP } from '../services/imageUtils';

interface AdminCustomizationProps {
  logo: string | null;
  onUpdateLogo: (logo: string | null) => void;
  themeConfig?: ThemeConfig;
  onUpdateTheme?: (config: ThemeConfig) => void;
  websiteConfig?: WebsiteConfig;
  onUpdateWebsiteConfig?: (config: WebsiteConfig) => void;
  initialTab?: string;
}

const AdminCustomization: React.FC<AdminCustomizationProps> = ({ 
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
    searchHints: '',
    orderLanguage: 'English'
  });

  // Initialize config from props
  useEffect(() => {
    if (websiteConfig) {
            setConfig(prev => ({
                ...prev,
                ...websiteConfig,
                footerQuickLinks: websiteConfig.footerQuickLinks || [],
                footerUsefulLinks: websiteConfig.footerUsefulLinks || [],
                showFlashSaleCounter: websiteConfig.showFlashSaleCounter ?? true
            }));
    }
  }, [websiteConfig]);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  
  // Theme State
        type ThemeColorKey = 'primary' | 'secondary' | 'tertiary' | 'font' | 'hover' | 'surface';

        const defaultThemeColors: Record<ThemeColorKey, string> = {
        primary: '#22c55e',
        secondary: '#ec4899',
        tertiary: '#9333ea',
            font: '#0f172a',
            hover: '#f97316',
            surface: '#e2e8f0'
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
      name: '', image: '', url: '', urlType: 'Internal', serial: 1, status: 'Publish'
  });
  const carouselFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (themeConfig) {
      setColors({
        primary: themeConfig.primaryColor,
        secondary: themeConfig.secondaryColor,
                tertiary: themeConfig.tertiaryColor,
                font: themeConfig.fontColor || defaultThemeColors.font,
                hover: themeConfig.hoverColor || defaultThemeColors.hover,
                surface: themeConfig.surfaceColor || defaultThemeColors.surface
      });
      setIsDarkMode(themeConfig.darkMode);
    }
  }, [themeConfig]);

    useEffect(() => {
        setColorDrafts(colors);
    }, [colors]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon' | 'carousel') => {
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
            const converted = await convertFileToWebP(file, {
                quality: type === 'favicon' ? 0.9 : 0.82,
                maxDimension: type === 'favicon' ? 512 : 2000
            });
            if (type === 'logo') {
                onUpdateLogo(converted);
            } else if (type === 'favicon') {
                setConfig(prev => ({ ...prev, favicon: converted }));
            } else if (type === 'carousel') {
                setCarouselFormData(prev => ({ ...prev, image: converted }));
            }
        } catch (error) {
            console.error('Failed to process image upload', error);
            alert('Unable to process this image. Please try another file.');
        } finally {
            if (input) input.value = '';
        }
    };

  const handleRemoveImage = (type: 'logo' | 'favicon') => {
    if (type === 'logo') {
      onUpdateLogo(null);
      if (logoInputRef.current) logoInputRef.current.value = '';
    } else {
      setConfig(prev => ({ ...prev, favicon: null }));
      if (faviconInputRef.current) faviconInputRef.current.value = '';
    }
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
        { key: 'surface', label: 'Surface Glow', helper: 'Footer background wash, elevated cards, wishlist buttons' }
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

  const handleSave = () => {
    // Save Website Config
    if (onUpdateWebsiteConfig) {
      onUpdateWebsiteConfig(config);
    }
    
    // Save Theme
    if (onUpdateTheme) {
      onUpdateTheme({
        primaryColor: colors.primary,
        secondaryColor: colors.secondary,
                tertiaryColor: colors.tertiary,
                fontColor: colors.font,
                hoverColor: colors.hover,
                surfaceColor: colors.surface,
        darkMode: isDarkMode
      });
    }

    alert('Settings saved successfully!');
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
  
  const socialOptions = ['Facebook', 'Instagram', 'YouTube', 'Daraz', 'Twitter', 'LinkedIn'];
    const footerLinkSections: { field: FooterLinkField; title: string; helper: string }[] = [
        { field: 'footerQuickLinks', title: 'Footer Quick Links', helper: 'Shown in the Quick Links column of Footer 3' },
        { field: 'footerUsefulLinks', title: 'Footer Useful Links', helper: 'Shown in the Useful Links column of Footer 3' }
    ];

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
           className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition shadow-lg shadow-green-200"
        >
           <Save size={18} /> Save Changes
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide bg-white rounded-t-xl">
         <TabButton id="carousel" label="Carousel" icon={<ImageIcon size={18}/>} />
         <TabButton id="website_info" label="Website Information" icon={<Globe size={18}/>} />
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
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>
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

        {/* WEBSITE INFO TAB */}
        {activeTab === 'website_info' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    {/* Logo Section */}
                     <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <ImageIcon size={32} className="text-gray-400"/>
                            <p className="text-sm font-bold text-gray-700">Website Logo (Horizontal 256x56px)</p>
                            {logo && <img src={logo} alt="Logo" className="h-10 object-contain my-2"/>}
                            <div className="flex gap-2">
                                <button onClick={() => logoInputRef.current?.click()} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded font-bold">Select Image</button>
                                {logo && <button onClick={() => handleRemoveImage('logo')} className="text-xs bg-red-500 text-white px-3 py-1.5 rounded font-bold">Remove</button>}
                            </div>
                            <input type="file" ref={logoInputRef} onChange={(e) => handleImageUpload(e, 'logo')} className="hidden" accept="image/*" />
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
                            <span className="text-sm font-medium">Powered by Saleecom (Show in footer)</span>
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

        {/* THEME VIEW TAB */}
        {activeTab === 'theme_view' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: 'Header Section', key: 'headerStyle', count: 2 },
                  { title: 'Showcase Section', key: 'showcaseSectionStyle', count: 4 },
                  { title: 'Brand Section', key: 'brandSectionStyle', count: 1, hasNone: true },
                  { title: 'Category Section', key: 'categorySectionStyle', count: 4, hasNone: true },
                  { title: 'Product Section', key: 'productSectionStyle', count: 1 },
                  { title: 'Product Card', key: 'productCardStyle', count: 5 },
                  { title: 'Footer Section', key: 'footerStyle', count: 4 },
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
                                        <Eye size={14} /> View demo
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
            <div className="space-y-8 max-w-2xl">
                 <div>
                     <h3 className="font-bold text-xl mb-4">Theme Colors</h3>
                     <p className="text-gray-500 text-sm mb-6">Dial in your storefront + admin palette with core accents, typography, hover states, and surface washes.</p>
                     
                     <div className="space-y-4">
                         {themeColorGuides.map(field => (
                             <div key={field.key} className="flex items-center gap-4 p-4 border border-gray-200 rounded-2xl bg-white/70 shadow-sm">
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
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                  <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                      <h3 className="font-bold text-gray-800">{editingCarousel ? 'Edit Carousel' : 'Add New Carousel'}</h3>
                      <button onClick={() => setIsCarouselModalOpen(false)}><X size={20} className="text-gray-500"/></button>
                  </div>
                  <form onSubmit={saveCarouselItem} className="p-6 space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image*</label>
                          <input type="file" ref={carouselFileRef} onChange={(e) => handleImageUpload(e, 'carousel')} className="hidden" accept="image/*" />
                          <div 
                              onClick={() => carouselFileRef.current?.click()}
                              className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition"
                          >
                              {carouselFormData.image ? (
                                  <img src={carouselFormData.image} alt="Preview" className="h-32 mx-auto object-contain"/>
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
    </div>
  );
};

export default AdminCustomization;
