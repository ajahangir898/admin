
import React, { useState, useRef, useEffect } from 'react';
import { Upload, Save, Trash2, Image as ImageIcon, Layout, Palette, Moon, Sun, Globe, MapPin, Mail, Phone, Plus, Facebook, Instagram, Youtube, ShoppingBag } from 'lucide-react';
import { ThemeConfig, WebsiteConfig, SocialLink } from '../types';

interface AdminCustomizationProps {
  logo: string | null;
  onUpdateLogo: (logo: string | null) => void;
  themeConfig?: ThemeConfig;
  onUpdateTheme?: (config: ThemeConfig) => void;
  websiteConfig?: WebsiteConfig;
  onUpdateWebsiteConfig?: (config: WebsiteConfig) => void;
}

const AdminCustomization: React.FC<AdminCustomizationProps> = ({ 
  logo, 
  onUpdateLogo,
  themeConfig,
  onUpdateTheme,
  websiteConfig,
  onUpdateWebsiteConfig
}) => {
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
    brandingText: ''
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

  const socialOptions = ['Facebook', 'Instagram', 'YouTube', 'Daraz', 'Twitter', 'LinkedIn'];

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex justify-between items-center sticky top-0 bg-gray-50 z-30 py-4 border-b border-gray-200">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Customization</h2>
           <p className="text-sm text-gray-500">Manage your store's appearance and information</p>
        </div>
        <button 
           onClick={handleSave}
           className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition shadow-lg shadow-green-200"
        >
           <Save size={18} /> Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* WEBSITE INFORMATION */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-fit">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
             <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
               <Globe size={24} />
             </div>
             <div>
                <h3 className="font-bold text-gray-800">Website Information</h3>
                <p className="text-sm text-gray-500">General settings and logos</p>
             </div>
          </div>
          <div className="p-8 space-y-6">
             
             {/* Logo Upload */}
             <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Website Logo (Horizontal 256x56px)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition relative">
                   {logo ? (
                     <div className="relative group w-full flex justify-center">
                       <img src={logo} alt="Logo" className="h-14 object-contain" />
                       <button onClick={() => handleRemoveImage('logo')} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600"><Trash2 size={12}/></button>
                     </div>
                   ) : (
                     <div className="text-center text-gray-400 py-2" onClick={() => logoInputRef.current?.click()}>
                        <ImageIcon size={32} className="mx-auto mb-1 opacity-50" />
                        <span className="text-xs cursor-pointer">Upload Logo</span>
                     </div>
                   )}
                   <input type="file" ref={logoInputRef} onChange={(e) => handleImageUpload(e, 'logo')} className="hidden" accept="image/*" />
                </div>
                {!logo && <button onClick={() => logoInputRef.current?.click()} className="w-full py-1 text-xs text-blue-600 font-bold border border-blue-100 rounded hover:bg-blue-50">Select Image</button>}
             </div>

             {/* Favicon Upload */}
             <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Favicon (32x32px)</label>
                <div className="flex items-center gap-4">
                   <div className="w-16 h-16 border rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden relative">
                      {config.favicon ? (
                        <img src={config.favicon} alt="Favicon" className="w-8 h-8 object-contain" />
                      ) : (
                        <Globe size={20} className="text-gray-300"/>
                      )}
                      {config.favicon && <button onClick={() => handleRemoveImage('favicon')} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl"><Trash2 size={10}/></button>}
                   </div>
                   <div className="flex-1">
                      <input type="file" ref={faviconInputRef} onChange={(e) => handleImageUpload(e, 'favicon')} className="hidden" accept="image/*" />
                      <button onClick={() => faviconInputRef.current?.click()} className="px-3 py-1.5 border border-gray-300 rounded text-xs font-medium hover:bg-gray-50">Upload Favicon</button>
                      <p className="text-[10px] text-gray-400 mt-1">Displayed in browser tab</p>
                   </div>
                </div>
             </div>

             <div className="space-y-3">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website Name*</label>
                  <input type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                    value={config.websiteName} onChange={(e) => setConfig({...config, websiteName: e.target.value})} />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                  <input type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                    value={config.shortDescription} onChange={(e) => setConfig({...config, shortDescription: e.target.value})} />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Whatsapp Number</label>
                  <input type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                    value={config.whatsappNumber} onChange={(e) => setConfig({...config, whatsappNumber: e.target.value})} />
               </div>
             </div>
          </div>
        </div>

        {/* CONTACT INFORMATION */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-fit">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
             <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
               <Phone size={24} />
             </div>
             <div>
                <h3 className="font-bold text-gray-800">Contact Information</h3>
                <p className="text-sm text-gray-500">Addresses, emails, and phones</p>
             </div>
          </div>
          <div className="p-8 space-y-6">
             
             {/* Addresses */}
             <div className="space-y-2">
                <div className="flex justify-between items-center">
                   <label className="text-sm font-medium text-gray-700">Addresses</label>
                   <button onClick={() => addArrayItem('addresses')} className="text-xs bg-purple-600 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-purple-700"><Plus size={12}/> Add</button>
                </div>
                {config.addresses.map((addr, idx) => (
                  <div key={idx} className="flex gap-2">
                     <div className="relative flex-1">
                        <MapPin size={14} className="absolute left-3 top-3 text-gray-400"/>
                        <input type="text" value={addr} onChange={(e) => updateArrayItem('addresses', idx, e.target.value)} 
                          className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-purple-500 outline-none" placeholder="Enter address"/>
                     </div>
                     <button onClick={() => removeArrayItem('addresses', idx)} className="bg-red-50 text-red-500 p-2 rounded hover:bg-red-100"><Trash2 size={16}/></button>
                  </div>
                ))}
             </div>

             {/* Emails */}
             <div className="space-y-2">
                <div className="flex justify-between items-center">
                   <label className="text-sm font-medium text-gray-700">Emails</label>
                   <button onClick={() => addArrayItem('emails')} className="text-xs bg-purple-600 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-purple-700"><Plus size={12}/> Add</button>
                </div>
                {config.emails.map((email, idx) => (
                  <div key={idx} className="flex gap-2">
                     <div className="relative flex-1">
                        <Mail size={14} className="absolute left-3 top-3 text-gray-400"/>
                        <input type="text" value={email} onChange={(e) => updateArrayItem('emails', idx, e.target.value)} 
                          className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-purple-500 outline-none" placeholder="Enter email"/>
                     </div>
                     <button onClick={() => removeArrayItem('emails', idx)} className="bg-red-50 text-red-500 p-2 rounded hover:bg-red-100"><Trash2 size={16}/></button>
                  </div>
                ))}
             </div>

             {/* Phones */}
             <div className="space-y-2">
                <div className="flex justify-between items-center">
                   <label className="text-sm font-medium text-gray-700">Phone Numbers</label>
                   <button onClick={() => addArrayItem('phones')} className="text-xs bg-purple-600 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-purple-700"><Plus size={12}/> Add</button>
                </div>
                {config.phones.map((phone, idx) => (
                  <div key={idx} className="flex gap-2">
                     <div className="relative flex-1">
                        <Phone size={14} className="absolute left-3 top-3 text-gray-400"/>
                        <input type="text" value={phone} onChange={(e) => updateArrayItem('phones', idx, e.target.value)} 
                          className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-purple-500 outline-none" placeholder="Enter phone number"/>
                     </div>
                     <button onClick={() => removeArrayItem('phones', idx)} className="bg-red-50 text-red-500 p-2 rounded hover:bg-red-100"><Trash2 size={16}/></button>
                  </div>
                ))}
             </div>

          </div>
        </div>

        {/* SOCIAL LINKS */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-fit">
           <div className="p-6 border-b border-gray-100 flex items-center gap-3">
             <div className="bg-pink-100 p-2 rounded-lg text-pink-600">
               <Instagram size={24} />
             </div>
             <div className="flex-1">
                <h3 className="font-bold text-gray-800">Social Links</h3>
                <p className="text-sm text-gray-500">Connect with your audience</p>
             </div>
             <button onClick={addSocial} className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-purple-700 shadow-sm"><Plus size={14}/> Add New</button>
           </div>
           <div className="p-8 space-y-4">
              {config.socialLinks.map((link, idx) => (
                 <div key={link.id} className="flex flex-col sm:flex-row gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="w-full sm:w-1/3">
                       <select 
                         value={link.platform}
                         onChange={(e) => updateSocial(idx, 'platform', e.target.value)}
                         className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-pink-500"
                       >
                         {socialOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                       </select>
                    </div>
                    <div className="flex-1">
                       <input 
                         type="text" 
                         value={link.url}
                         onChange={(e) => updateSocial(idx, 'url', e.target.value)}
                         placeholder="https://..."
                         className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-pink-500"
                       />
                    </div>
                    <button onClick={() => removeSocial(idx)} className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 self-end sm:self-auto"><Trash2 size={16}/></button>
                 </div>
              ))}
              {config.socialLinks.length === 0 && <p className="text-center text-gray-400 text-sm py-4">No social links added yet.</p>}
           </div>
        </div>

        {/* DISPLAY SETTINGS */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-fit">
           <div className="p-6 border-b border-gray-100 flex items-center gap-3">
             <div className="bg-green-100 p-2 rounded-lg text-green-600">
               <Layout size={24} />
             </div>
             <div>
                <h3 className="font-bold text-gray-800">Display Settings</h3>
                <p className="text-sm text-gray-500">Toggle headers, footers and sliders</p>
             </div>
           </div>
           <div className="p-8 space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                 <input type="checkbox" className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500" 
                   checked={config.showMobileHeaderCategory} onChange={(e) => setConfig({...config, showMobileHeaderCategory: e.target.checked})} />
                 <span className="text-sm font-medium text-gray-700">Show Mobile Header Category Menu</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                 <input type="checkbox" className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500" 
                   checked={config.showNewsSlider} onChange={(e) => setConfig({...config, showNewsSlider: e.target.checked})} />
                 <span className="text-sm font-medium text-gray-700">Show News Slider</span>
              </label>

              {config.showNewsSlider && (
                 <div className="ml-8">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Header Slider Text</label>
                    <textarea className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-purple-500" rows={2}
                      value={config.headerSliderText} onChange={(e) => setConfig({...config, headerSliderText: e.target.value})} />
                 </div>
              )}

              <hr className="border-gray-100 my-2" />

              <label className="flex items-center gap-3 cursor-pointer">
                 <input type="checkbox" className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500" 
                   checked={config.hideCopyright} onChange={(e) => setConfig({...config, hideCopyright: e.target.checked})} />
                 <span className="text-sm font-medium text-gray-700">Hide Copyright Section in Footer</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                 <input type="checkbox" className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500" 
                   checked={config.hideCopyrightText} onChange={(e) => setConfig({...config, hideCopyrightText: e.target.checked})} />
                 <span className="text-sm font-medium text-gray-700">Hide Copyright Text</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                 <input type="checkbox" className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500" 
                   checked={config.showPoweredBy} onChange={(e) => setConfig({...config, showPoweredBy: e.target.checked})} />
                 <span className="text-sm font-medium text-gray-700">Powered by Saleecom (Show in footer)</span>
              </label>

              <div className="pt-2">
                 <label className="block text-sm font-bold text-gray-700 mb-1">Branding Text</label>
                 <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                   value={config.brandingText} onChange={(e) => setConfig({...config, brandingText: e.target.value})} />
              </div>

           </div>
        </div>

        {/* THEME COLORS (Existing) */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-fit">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
             <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
               <Palette size={24} />
             </div>
             <div>
                <h3 className="font-bold text-gray-800">Theme Colors</h3>
                <p className="text-sm text-gray-500">Customize site palette</p>
             </div>
          </div>
          
          <div className="p-8 space-y-6">
             {/* Primary Color */}
             <div className="flex items-center justify-between">
                <div>
                   <label className="block text-sm font-bold text-gray-800">Primary Color</label>
                   <p className="text-xs text-gray-500">Main actions (Green)</p>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-10 h-10 rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
                      <input type="color" value={colors.primary} onChange={(e) => setColors({...colors, primary: e.target.value})} className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer p-0 border-0"/>
                   </div>
                   <input type="text" value={colors.primary} onChange={(e) => setColors({...colors, primary: e.target.value})} className="w-24 px-2 py-1 border border-gray-300 rounded text-sm font-mono uppercase"/>
                </div>
             </div>
             
             {/* Secondary Color */}
             <div className="flex items-center justify-between">
                <div>
                   <label className="block text-sm font-bold text-gray-800">Secondary Color</label>
                   <p className="text-xs text-gray-500">Branding (Pink)</p>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-10 h-10 rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
                      <input type="color" value={colors.secondary} onChange={(e) => setColors({...colors, secondary: e.target.value})} className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer p-0 border-0"/>
                   </div>
                   <input type="text" value={colors.secondary} onChange={(e) => setColors({...colors, secondary: e.target.value})} className="w-24 px-2 py-1 border border-gray-300 rounded text-sm font-mono uppercase"/>
                </div>
             </div>

             {/* Tertiary Color */}
             <div className="flex items-center justify-between">
                <div>
                   <label className="block text-sm font-bold text-gray-800">Tertiary Color</label>
                   <p className="text-xs text-gray-500">Accents (Purple)</p>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-10 h-10 rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
                      <input type="color" value={colors.tertiary} onChange={(e) => setColors({...colors, tertiary: e.target.value})} className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer p-0 border-0"/>
                   </div>
                   <input type="text" value={colors.tertiary} onChange={(e) => setColors({...colors, tertiary: e.target.value})} className="w-24 px-2 py-1 border border-gray-300 rounded text-sm font-mono uppercase"/>
                </div>
             </div>
             
             {/* Dark Mode Toggle */}
             <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                <div>
                   <label className="block text-sm font-bold text-gray-800">Dark Mode</label>
                   <p className="text-xs text-gray-500">Enable dark theme</p>
                </div>
                <button 
                   onClick={() => setIsDarkMode(!isDarkMode)}
                   className={`relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none ${isDarkMode ? 'bg-purple-600' : 'bg-gray-200'}`}
                >
                   <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-sm transform transition-transform duration-300 flex items-center justify-center ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}>
                      {isDarkMode ? <Moon size={12} className="text-purple-600"/> : <Sun size={12} className="text-orange-400"/>}
                   </div>
                </button>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminCustomization;
