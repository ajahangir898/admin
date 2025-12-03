
import React, { useState, useRef } from 'react';
import { Upload, Save, Trash2, Image as ImageIcon, Layout } from 'lucide-react';

interface AdminCustomizationProps {
  logo: string | null;
  onUpdateLogo: (logo: string | null) => void;
}

const AdminCustomization: React.FC<AdminCustomizationProps> = ({ logo, onUpdateLogo }) => {
  const [preview, setPreview] = useState<string | null>(logo);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    onUpdateLogo(preview);
    alert('Theme settings saved successfully!');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Customization</h2>
        <p className="text-sm text-gray-500">Manage your store's look and feel</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
           <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
             <Layout size={24} />
           </div>
           <div>
              <h3 className="font-bold text-gray-800">Brand Identity</h3>
              <p className="text-sm text-gray-500">Update your store logo and branding</p>
           </div>
        </div>
        
        <div className="p-8">
           <div className="max-w-md space-y-4">
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

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
           <button 
             onClick={handleSave}
             className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition shadow-lg shadow-purple-200"
           >
             <Save size={18} /> Save Changes
           </button>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomization;
