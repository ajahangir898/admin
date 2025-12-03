
import React, { useState, useEffect } from 'react';
import { Save, Truck, Key, Lock, CheckCircle, AlertCircle } from 'lucide-react';

interface CourierConfig {
  apiKey: string;
  secretKey: string;
}

interface AdminSettingsProps {
  courierConfig: CourierConfig;
  onUpdateCourierConfig: (config: CourierConfig) => void;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ courierConfig, onUpdateCourierConfig }) => {
  const [formData, setFormData] = useState<CourierConfig>({ apiKey: '', secretKey: '' });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setFormData(courierConfig);
  }, [courierConfig]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCourierConfig(formData);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
        <p className="text-sm text-gray-500">Manage system configurations and integrations</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden max-w-2xl">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
           <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
             <Truck size={24} />
           </div>
           <div>
              <h3 className="font-bold text-gray-800">Courier Integration</h3>
              <p className="text-sm text-gray-500">Configure Steadfast Courier API</p>
           </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
           {showSuccess && (
             <div className="bg-green-50 border border-green-100 text-green-600 px-4 py-3 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
               <CheckCircle size={18} /> Settings saved successfully!
             </div>
           )}

           <div className="space-y-4">
              <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                   <Key size={16} className="text-gray-400"/> API Key
                 </label>
                 <input 
                   type="text" 
                   required
                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition font-mono text-sm"
                   placeholder="Enter your Steadfast API Key"
                   value={formData.apiKey}
                   onChange={e => setFormData({...formData, apiKey: e.target.value})}
                 />
              </div>

              <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                   <Lock size={16} className="text-gray-400"/> Secret Key
                 </label>
                 <input 
                   type="password" 
                   required
                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition font-mono text-sm"
                   placeholder="Enter your Steadfast Secret Key"
                   value={formData.secretKey}
                   onChange={e => setFormData({...formData, secretKey: e.target.value})}
                 />
              </div>
           </div>

           <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
              <AlertCircle size={20} className="text-blue-500 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-bold mb-1">How it works:</p>
                <p>Once configured, you can send orders directly to Steadfast Courier from the "Orders" page. The system will automatically create a booking and update the order status to "Shipped".</p>
              </div>
           </div>

           <div className="pt-4 flex justify-end">
              <button 
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition shadow-lg shadow-purple-200"
              >
                <Save size={18} /> Save Configuration
              </button>
           </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
