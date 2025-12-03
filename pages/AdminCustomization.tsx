
import React, { useState, useRef, useEffect } from 'react';
import { Upload, Save, Trash2, Image as ImageIcon, Layout, Palette, Moon, Sun } from 'lucide-react';
import { ThemeConfig } from '../types';

interface AdminCustomizationProps {
  logo: string | null;
  onUpdateLogo: (logo: string | null) => void;
  themeConfig?: ThemeConfig;
  onUpdateTheme?: (config: ThemeConfig) => void;
}

const AdminCustomization: React.FC<AdminCustomizationProps> = ({ 
  logo, 
  onUpdateLogo,
  themeConfig,
  onUpdateTheme
}) => {
  const [preview, setPreview] = useState<string | null>(logo);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size is too large. Please upload an image under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = () => {
    // Save Logo
    onUpdateLogo(preview);
    
    // Save Theme
    if (onUpdateTheme) {
      onUpdateTheme({
        primaryColor: colors.primary,
        secondaryColor: colors.secondary,
        tertiaryColor: colors.tertiary,
        darkMode: isDarkMode
      });
    }

    alert('Theme settings saved successfully!');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Customization</h2>
        <p className="text-sm text-gray-500">Manage your store's look and feel</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Brand Identity Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-fit">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
             <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
               <Layout size={24} />
             </div>
             <div>
                <h3 className="font-bold text-gray-800">Brand Identity</h3>
                <p className="text-sm text-gray-500">Update your store logo</p>
             </div>
          </div>
          
          <div className="p-8">
             <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Store Logo</label>
                
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition">
                   {preview ? (
                     <div className="relative group">
                       <img src={preview} alt="Logo Preview" className="h-24 object-contain" />
                       <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded flex items-center justify-center gap-2">
                          <button onClick={handleRemove} className="bg-white text-red-500 p-2 rounded-full shadow-lg hover:bg-red-50">
                            <Trash2 size={16} />
                          </button>
                       </div>
                     </div>
                   ) : (
                     <div className="text-center text-gray-400">
                        <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No logo uploaded</p>
                     </div>
                   )}
                   
                   <div className="mt-6 flex gap-3">
                     <input 
                       type="file" 
                       ref={fileInputRef} 
                       onChange={handleImageUpload} 
                       className="hidden" 
                       accept="image/*"
                     />
                     <button 
                       onClick={() => fileInputRef.current?.click()}
                       className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm"
                     >
                       {preview ? 'Change Logo' : 'Upload Logo'}
                     </button>
                   </div>
                </div>
                <p className="text-xs text-gray-500">Recommended size: 200x60px. Max size: 2MB. Format: PNG, JPG</p>
             </div>
          </div>
        </div>

        {/* Theme Colors Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-fit">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
             <div className="bg-green-100 p-2 rounded-lg text-green-600">
               <Palette size={24} />
             </div>
             <div>
                <h3 className="font-bold text-gray-800">Theme Colors</h3>
                <p className="text-sm text-gray-500">Customize your site's color palette</p>
             </div>
          </div>
          
          <div className="p-8 space-y-6">
             {/* Primary Color */}
             <div className="flex items-center justify-between">
                <div>
                   <label className="block text-sm font-bold text-gray-800">Primary Color</label>
                   <p className="text-xs text-gray-500">Used for main actions and buttons (Green)</p>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-10 h-10 rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
                      <input 
                        type="color" 
                        value={colors.primary}
                        onChange={(e) => setColors({...colors, primary: e.target.value})}
                        className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer p-0 border-0"
                      />
                   </div>
                   <input 
                      type="text" 
                      value={colors.primary}
                      onChange={(e) => setColors({...colors, primary: e.target.value})}
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-sm font-mono uppercase"
                   />
                </div>
             </div>

             {/* Secondary Color */}
             <div className="flex items-center justify-between">
                <div>
                   <label className="block text-sm font-bold text-gray-800">Secondary Color</label>
                   <p className="text-xs text-gray-500">Used for branding and highlights (Pink)</p>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-10 h-10 rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
                      <input 
                        type="color" 
                        value={colors.secondary}
                        onChange={(e) => setColors({...colors, secondary: e.target.value})}
                        className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer p-0 border-0"
                      />
                   </div>
                   <input 
                      type="text" 
                      value={colors.secondary}
                      onChange={(e) => setColors({...colors, secondary: e.target.value})}
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-sm font-mono uppercase"
                   />
                </div>
             </div>

             {/* Tertiary Color */}
             <div className="flex items-center justify-between">
                <div>
                   <label className="block text-sm font-bold text-gray-800">Tertiary Color</label>
                   <p className="text-xs text-gray-500">Used for accents and dark themes (Purple)</p>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-10 h-10 rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
                      <input 
                        type="color" 
                        value={colors.tertiary}
                        onChange={(e) => setColors({...colors, tertiary: e.target.value})}
                        className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer p-0 border-0"
                      />
                   </div>
                   <input 
                      type="text" 
                      value={colors.tertiary}
                      onChange={(e) => setColors({...colors, tertiary: e.target.value})}
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-sm font-mono uppercase"
                   />
                </div>
             </div>
             
             {/* Dark Mode Toggle */}
             <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                <div>
                   <label className="block text-sm font-bold text-gray-800">Dark Mode</label>
                   <p className="text-xs text-gray-500">Enable dark theme for the storefront</p>
                </div>
                <button 
                   onClick={() => setIsDarkMode(!isDarkMode)}
                   className={`relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none ${
                      isDarkMode ? 'bg-purple-600' : 'bg-gray-200'
                   }`}
                >
                   <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-sm transform transition-transform duration-300 flex items-center justify-center ${
                      isDarkMode ? 'translate-x-6' : 'translate-x-0'
                   }`}>
                      {isDarkMode ? <Moon size={12} className="text-purple-600"/> : <Sun size={12} className="text-orange-400"/>}
                   </div>
                </button>
             </div>

          </div>
        </div>

      </div>

      <div className="flex justify-end pt-4">
         <button 
           onClick={handleSave}
           className="flex items-center gap-2 px-8 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition shadow-lg shadow-green-200"
         >
           <Save size={20} /> Save All Changes
         </button>
      </div>
    </div>
  );
};

export default AdminCustomization;
