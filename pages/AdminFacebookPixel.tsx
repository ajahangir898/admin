
import React, { useState } from 'react';
import { Facebook, ArrowLeft } from 'lucide-react';

interface AdminFacebookPixelProps {
  onBack: () => void;
}

const AdminFacebookPixel: React.FC<AdminFacebookPixelProps> = ({ onBack }) => {
  const [pixelId, setPixelId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [enableTestEvent, setEnableTestEvent] = useState(false);

  const handleSave = () => {
    // Validation
    if (!pixelId.trim()) {
      alert("Facebook Pixel ID cannot be empty.");
      return;
    }
    if (!accessToken.trim()) {
      alert("Facebook Pixel Access Token cannot be empty.");
      return;
    }

    const payload = {
      pixelId,
      accessToken,
      enableTestEvent
    };

    console.log("Facebook Pixel Configuration Payload:", payload);
    alert("Settings saved successfully! (Check console for payload)");
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in p-2">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition">
                <ArrowLeft size={20} className="text-gray-600"/>
            </button>
            <h2 className="text-xl font-bold text-gray-900">Facebook Pixel</h2>
        </div>

        {/* Info Section */}
        <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 border-4 border-blue-100 shadow-sm ring-1 ring-blue-500">
                <Facebook size={24} className="text-white" fill="white" />
            </div>
            <div className="pt-1">
                <h3 className="text-lg font-medium text-gray-900">Adjust Facebook Pixel with Server Tracking</h3>
                <p className="text-sm text-gray-500">You can add Facebook Pixel Id and Pixel Access Token</p>
            </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6 max-w-3xl pt-4">
            <div>
                <input
                    type="text"
                    placeholder="Facebook Pixel Id"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-sm text-gray-700 placeholder-gray-400 shadow-sm"
                    value={pixelId}
                    onChange={(e) => setPixelId(e.target.value)}
                />
            </div>

            <div>
                <textarea
                    placeholder="Facebook Pixel Access Token"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-sm text-gray-700 placeholder-gray-400 shadow-sm min-h-[120px] resize-none align-top"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                />
            </div>

            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    id="testEvent"
                    className="w-5 h-5 border-2 border-gray-400 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={enableTestEvent}
                    onChange={(e) => setEnableTestEvent(e.target.checked)}
                />
                <label htmlFor="testEvent" className="text-sm text-gray-600 cursor-pointer select-none">
                    Enable Test Event
                </label>
            </div>

            <button
                onClick={handleSave}
                className="w-full bg-[#0000FF] hover:bg-blue-800 text-white font-bold py-3 rounded-md transition shadow-sm text-sm"
            >
                Save
            </button>
        </div>
    </div>
  );
};

export default AdminFacebookPixel;
