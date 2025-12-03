
import React, { useState, useRef, useEffect } from 'react';
import { Upload, Save, Trash2, Image as ImageIcon, Layout, Palette, Moon, Sun, Globe, MapPin, Mail, Phone, Plus, Facebook, Instagram, Youtube, ShoppingBag, Youtube as YoutubeIcon, Search, Eye, MoreVertical } from 'lucide-react';
import { ThemeConfig, WebsiteConfig, SocialLink, CarouselItem } from '../types';

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
  
  const [config, setConfig] = useState<WebsiteConfig>({
    websiteName: '',
    shortDescription: '',
    whatsappNumber: '',
    favicon: null,
    addresses: [],
    emails: [],
    phones: [],
    socialLinks: [],
    showMobileHeaderCategory: true,
    showNewsSlider: true,
    headerSliderText: '',
    hideCopyright: false,
    hideCopyrightText: false,
    showPoweredBy: false,
    brandingText: '',
    carouselItems: [],
    searchHints: '',
    orderLanguage: 'English'
  });

  // Initialize config from props
  useEffect(() => {
    if (websiteConfig) {
      setConfig(websiteConfig);
    }
  }, [websiteConfig]);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  
  // Theme State
  const [colors, setColors] = useState({
    primary: '#22c55e',
    secondary: '#ec4899',
    tertiary: '#9333ea'
  });
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (themeConfig) {
      setColors({
        primary: themeConfig.primaryColor,
        secondary: themeConfig.secondaryColor,
        tertiary: themeConfig.tertiaryColor
      });
      setIsDarkMode(themeConfig.darkMode);
    }
  }, [themeConfig]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size is too large. Please upload an image under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'logo') {
          onUpdateLogo(reader.result as string);
        } else {
          setConfig(prev => ({ ...prev, favicon: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
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
        darkMode: isDarkMode
      });
    }

    alert('Settings saved successfully!');
  };

  // Carousel Logic
  const handleAddCarousel = () => {
      const newItem: CarouselItem = {
          id: Date.now().toString(),
          image: '',
          name: 'New Slide',
          url: '/',
          urlType: 'Internal',
          serial: config.carouselItems.length + 1,
          status: 'Draft'
      };
      setConfig(prev => ({ ...prev, carouselItems: [...prev.carouselItems, newItem] }));
  };
  
  const socialOptions = ['Facebook', 'Instagram', 'YouTube', 'Daraz', 'Twitter', 'LinkedIn'];

  const TabButton = ({ id, label, icon }: { id: string, label: string, icon?: React.ReactNode }) => (
      <button 
        onClick={() => setActiveTab(id)}
        className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition ${activeTab === id ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
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
           className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition shadow-lg shadow-purple-200"
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
                <div className="flex justify-between items-center">
                    <div className="relative w-64">
                        <input type="text" placeholder="Search" className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"/>
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                    </div>
                    <button onClick={handleAddCarousel} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-purple-700">
                        <Plus size={16}/> Add Carousel
                    </button>
                </div>
                
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-purple-50 text-gray-700 font-semibold text-xs uppercase">
                            <tr>
                                <th className="px-4 py-3"><input type="checkbox"/></th>
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
                            {config.carouselItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3"><input type="checkbox"/></td>
                                    <td className="px-4 py-3">
                                        <div className="w-16 h-10 bg-gray-100 rounded border border-gray-200 overflow-hidden">
                                            {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{item.url}</td>
                                    <td className="px-4 py-3 text-gray-500">{item.urlType}</td>
                                    <td className="px-4 py-3 text-gray-800">{item.serial}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.status === 'Publish' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button className="text-gray-400 hover:text-gray-600"><MoreVertical size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                            {config.carouselItems.length === 0 && (
                                <tr><td colSpan={8} className="text-center py-8 text-gray-400">No carousel items found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-end gap-2 text-sm text-gray-500">
                    <span>1 of 1</span>
                    <button className="w-6 h-6 border rounded flex items-center justify-center hover:bg-gray-50">&lt;</button>
                    <button className="w-6 h-6 border rounded flex items-center justify-center hover:bg-gray-50">&gt;</button>
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
                                <button onClick={() => logoInputRef.current?.click()} className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded font-bold">Select Image</button>
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
                                <button onClick={() => faviconInputRef.current?.click()} className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded font-bold">Select Image</button>
                                {config.favicon && <button onClick={() => handleRemoveImage('favicon')} className="text-xs bg-red-500 text-white px-3 py-1.5 rounded font-bold">Remove</button>}
                            </div>
                            <input type="file" ref={faviconInputRef} onChange={(e) => handleImageUpload(e, 'favicon')} className="hidden" accept="image/*" />
                        </div>
                     </div>

                     <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Website Name*</label>
                            <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-purple-500" 
                                value={config.websiteName} onChange={(e) => setConfig({...config, websiteName: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                            <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-purple-500" 
                                value={config.shortDescription} onChange={(e) => setConfig({...config, shortDescription: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Whatsapp Number</label>
                            <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-purple-500" 
                                value={config.whatsappNumber} onChange={(e) => setConfig({...config, whatsappNumber: e.target.value})} />
                        </div>
                     </div>
                 </div>

                 <div className="space-y-6">
                     {/* Dynamic Addresses */}
                     <div className="space-y-2">
                         <button onClick={() => addArrayItem('addresses')} className="bg-purple-600 text-white px-4 py-2 rounded font-bold text-sm w-full flex items-center justify-center gap-2">
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
                         <button onClick={() => addArrayItem('emails')} className="bg-purple-600 text-white px-4 py-2 rounded font-bold text-sm w-full flex items-center justify-center gap-2">
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
                         <button onClick={() => addArrayItem('phones')} className="bg-purple-600 text-white px-4 py-2 rounded font-bold text-sm w-full flex items-center justify-center gap-2">
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
                         <button onClick={addSocial} className="bg-purple-600 text-white px-4 py-2 rounded font-bold text-sm w-full flex items-center justify-center gap-2">
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
                     
                     <div className="space-y-3 pt-4 border-t">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" className="w-5 h-5 text-purple-600 rounded" checked={config.showMobileHeaderCategory} onChange={e => setConfig({...config, showMobileHeaderCategory: e.target.checked})}/>
                            <span className="text-sm font-medium">isShowMobileHeaderCategoryMenu</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" className="w-5 h-5 text-purple-600 rounded" checked={config.showNewsSlider} onChange={e => setConfig({...config, showNewsSlider: e.target.checked})}/>
                            <span className="text-sm font-medium">Is Show News Slider</span>
                        </label>
                        {config.showNewsSlider && (
                             <div className="ml-8 border border-gray-300 rounded p-2 text-sm bg-gray-50">
                                <p className="text-xs text-gray-500 mb-1">Header Slider Text</p>
                                <textarea className="w-full bg-transparent outline-none resize-none" rows={2} value={config.headerSliderText} onChange={e => setConfig({...config, headerSliderText: e.target.value})} />
                             </div>
                        )}
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" className="w-5 h-5 text-purple-600 rounded" checked={config.hideCopyright} onChange={e => setConfig({...config, hideCopyright: e.target.checked})}/>
                            <span className="text-sm font-medium">Hide Copyright Section in Footer</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" className="w-5 h-5 text-purple-600 rounded" checked={config.hideCopyrightText} onChange={e => setConfig({...config, hideCopyrightText: e.target.checked})}/>
                            <span className="text-sm font-medium">Hide Copyright Text</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" className="w-5 h-5 text-purple-600 rounded" checked={config.showPoweredBy} onChange={e => setConfig({...config, showPoweredBy: e.target.checked})}/>
                            <span className="text-sm font-medium">Powered by Saleecom (Show in footer)</span>
                        </label>
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
                                          className="w-5 h-5 text-purple-600"
                                          checked={!config[section.key as keyof WebsiteConfig]}
                                          onChange={() => setConfig({...config, [section.key]: ''})}
                                        />
                                        <span className="font-bold text-gray-700">None</span>
                                    </div>
                                    <button className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-bold flex items-center gap-1">
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
                                              className="w-5 h-5 text-purple-600"
                                              checked={currentVal === val}
                                              onChange={() => setConfig({...config, [section.key]: val})}
                                            />
                                            <span className="font-bold text-gray-700">{displayTitle}</span>
                                        </div>
                                        <button className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-bold flex items-center gap-1">
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
            <div className="space-y-8 max-w-xl">
                 <div>
                     <h3 className="font-bold text-xl mb-4">Theme Colors</h3>
                     <p className="text-gray-500 text-sm mb-6">Enter primary, secondary and tertiary colors</p>
                     
                     <div className="space-y-4">
                         <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded border shadow-sm" style={{backgroundColor: colors.primary}}></div>
                             <input type="text" value={colors.primary} onChange={(e) => setColors({...colors, primary: e.target.value})} className="flex-1 px-4 py-2 border rounded-lg uppercase"/>
                         </div>
                         <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded border shadow-sm" style={{backgroundColor: colors.secondary}}></div>
                             <input type="text" value={colors.secondary} onChange={(e) => setColors({...colors, secondary: e.target.value})} className="flex-1 px-4 py-2 border rounded-lg uppercase"/>
                         </div>
                         <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded border shadow-sm" style={{backgroundColor: colors.tertiary}}></div>
                             <input type="text" value={colors.tertiary} onChange={(e) => setColors({...colors, tertiary: e.target.value})} className="flex-1 px-4 py-2 border rounded-lg uppercase"/>
                         </div>
                     </div>
                 </div>

                 <div>
                     <h3 className="font-bold text-xl mb-4">Search Hints</h3>
                     <input 
                        type="text" 
                        value={config.searchHints || ''} 
                        onChange={(e) => setConfig({...config, searchHints: e.target.value})}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                        placeholder="gadget item, gift, educational toy..."
                     />
                 </div>

                 <div>
                     <h3 className="font-bold text-xl mb-4">Order Language</h3>
                     <div className="space-y-3">
                         <label className="flex items-center gap-3 border p-4 rounded-lg cursor-pointer hover:bg-gray-50">
                             <input type="radio" name="lang" className="w-5 h-5 text-purple-600" 
                               checked={config.orderLanguage === 'English'} onChange={() => setConfig({...config, orderLanguage: 'English'})}/>
                             <span className="font-bold">English</span>
                         </label>
                         <label className="flex items-center gap-3 border p-4 rounded-lg cursor-pointer hover:bg-gray-50">
                             <input type="radio" name="lang" className="w-5 h-5 text-purple-600" 
                               checked={config.orderLanguage === 'Bangla'} onChange={() => setConfig({...config, orderLanguage: 'Bangla'})}/>
                             <span className="font-bold">Bangla</span>
                         </label>
                     </div>
                 </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default AdminCustomization;
