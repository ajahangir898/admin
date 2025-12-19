import React, { useState } from 'react';
import { X, Sparkles, Wand2, Image as ImageIcon, Loader2 } from 'lucide-react';

let cachedGoogleGenAI: typeof import('@google/generative-ai').GoogleGenerativeAI | null = null;

const loadGoogleGenAI = async () => {
    if (cachedGoogleGenAI) return cachedGoogleGenAI;
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    cachedGoogleGenAI = GoogleGenerativeAI;
    return cachedGoogleGenAI;
};

export interface AIStudioModalProps {
    onClose: () => void;
}

export const AIStudioModal: React.FC<AIStudioModalProps> = ({ onClose }) => {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const defaultEnvKey =
        import.meta.env.VITE_GOOGLE_AI_API_KEY ||
        import.meta.env.VITE_GOOGLE_API_KEY ||
        process.env.VITE_GOOGLE_AI_API_KEY ||
        process.env.VITE_GOOGLE_API_KEY ||
        process.env.API_KEY ||
        '';
    const [customKey, setCustomKey] = useState('');
    const activeApiKey = customKey || defaultEnvKey;

    const generateImage = async () => {
        if (!prompt) return;
        if (!activeApiKey) {
            setErrorMessage('No Google AI API key configured. Add VITE_GOOGLE_AI_API_KEY to your .env or paste a key below.');
            return;
        }
        setLoading(true);
        setErrorMessage(null);
        try {
            const GoogleGenAI = await loadGoogleGenAI();
            if (!GoogleGenAI) {
                setErrorMessage('Failed to load Google GenAI SDK. Please refresh and try again.');
                return;
            }
            const ai = new GoogleGenAI(activeApiKey);
            const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash-image' });

            const result = await model.generateContent([{ text: prompt }]);
            const response = result.response;

            const parts = response?.candidates?.[0]?.content?.parts;
            if (parts) {
                for (const part of parts) {
                    if (part.inlineData?.data) {
                        const base64EncodeString = part.inlineData.data;
                        setImageUrl(`data:image/png;base64,${base64EncodeString}`);
                        break;
                    }
                }
            }
        } catch (error: any) {
            console.error("AI Generation failed", error);
            const status = error?.status || error?.response?.status;
            if (status === 403 && error?.error?.error?.status !== 'RESOURCE_EXHAUSTED') {
                setErrorMessage('This API key is blocked from calling the Generative Language API. Enable the API for your Google Cloud project or use a different unrestricted key.');
            } else {
                setErrorMessage(`Failed to generate image. ${error?.message || 'Check API key configuration.'}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex overflow-hidden border border-gray-800">
                <div className="w-80 bg-gray-800 p-6 flex flex-col border-r border-gray-700">
                    <div className="flex items-center gap-2 mb-6 text-white">
                        <Sparkles className="text-purple-400" />
                        <h2 className="font-bold text-lg">AI Studio</h2>
                    </div>
                    
                    <div className="space-y-4 flex-1">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Google AI API Key</label>
                            <input
                                type="password"
                                placeholder="Paste VITE_GOOGLE_AI_API_KEY"
                                value={customKey}
                                onChange={(e) => setCustomKey(e.target.value.trim())}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                            />
                            <p className="text-[11px] text-gray-500 mt-1">Key is held in memory for this session only. Leave blank to use the bundled env key.</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Prompt</label>
                            <textarea
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500 focus:outline-none resize-none h-32"
                                placeholder="Describe the image you want to generate..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={generateImage}
                            disabled={loading || !prompt}
                            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold transition flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                            Generate
                        </button>
                        {errorMessage && (
                            <div className="text-xs text-red-400 bg-red-950/30 border border-red-500/30 rounded-lg p-3">
                                {errorMessage}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex-1 bg-black flex items-center justify-center relative">
                    {imageUrl ? (
                        <img src={imageUrl} alt="Generated" className="max-w-full max-h-full object-contain" />
                    ) : (
                        <div className="text-center text-gray-600">
                            <ImageIcon size={64} className="mx-auto mb-4 opacity-20" />
                            <p>Generated image will appear here</p>
                        </div>
                    )}
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIStudioModal;
