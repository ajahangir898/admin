import React, { useState, useRef } from 'react';
import { 
  ChevronRight, Shirt, Monitor, Home, ShoppingCart, 
  Sparkles, Smartphone, Heart, Gift, Loader2, Send, Bot, X 
} from 'lucide-react';
import toast from 'react-hot-toast';

// --- Gemini API Configuration ---
// TODO: Move API key to environment variables for production
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ""; 
const API_URL = apiKey 
  ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`
  : '';

const initialCategories = [
  { id: 1, name: "Man Fashion", icon: <Shirt size={14} className="text-blue-500" /> },
  { id: 2, name: "Computer & Gaming", icon: <Monitor size={14} className="text-purple-500" /> },
  { id: 3, name: "Home & Living", icon: <Home size={14} className="text-green-500" /> },
  { id: 4, name: "Grocery & Pet Supplies", icon: <ShoppingCart size={14} className="text-orange-500" /> },
  { id: 5, name: "Health & Beauty", icon: <Sparkles size={14} className="text-pink-500" /> },
  { id: 6, name: "Mobile & Gadgets", icon: <Smartphone size={14} className="text-cyan-500" /> },
  { id: 7, name: "Jewelry", icon: <Heart size={14} className="text-red-400" /> },
  { id: 8, name: "Gift Cards", icon: <Gift size={14} className="text-indigo-500" /> },
  { id: 9, name: "Kids Zone", icon: <span className="text-[14px]">🧸</span> },
  { id: 10, name: "Sports", icon: <span className="text-[14px]">⚽</span> },
];

interface CategorySectionMobileProps {
  onCategoryClick?: (categoryName: string) => void;
}

const CategorySectionMobile: React.FC<CategorySectionMobileProps> = ({ onCategoryClick }) => {
  const [categories, setCategories] = useState(initialCategories);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! I am your ✨ AI Guide. What are you looking for today?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- Gemini API Helper ---
  const callGemini = async (prompt: string, systemPrompt = "", retries = 5, delay = 1000): Promise<string> => {
    if (!API_URL) {
      throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY environment variable.');
    }
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData?.error?.message || `API returned ${response.status}`;
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (error) {
      if (retries > 0) {
        await new Promise(res => setTimeout(res, delay));
        return callGemini(prompt, systemPrompt, retries - 1, delay * 2);
      }
      throw error;
    }
  };

  // Feature 1: ✨ AI Category Suggestion
  const handleAiSuggest = async () => {
    if (!API_URL) {
      toast.error('AI features require API key configuration');
      return;
    }
    
    setIsSuggesting(true);
    const prompt = `Suggest one unique e-commerce category name (max 2 words) not in this list: ${categories.map(c => c.name).join(", ")}. Also provide a matching single emoji. Output format: "Emoji Name"`;
    
    try {
      const result = await callGemini(prompt, "You are a trend-spotting shopping expert.");
      const trimmedResult = result.trim();
      
      // Validate and parse the response
      if (!trimmedResult) {
        throw new Error('Empty response from AI');
      }
      
      const parts = trimmedResult.split(/\s+/);
      if (parts.length < 2) {
        throw new Error('Invalid response format from AI');
      }
      
      const emoji = parts[0];
      const name = parts.slice(1).join(" ");
      
      // Generate unique ID based on max existing ID + 1
      const maxId = categories.reduce((max, cat) => Math.max(max, cat.id), 0);
      
      const newCat = {
        id: maxId + 1,
        name: name || "Trending Now",
        icon: <span className="text-[14px]">{emoji || "✨"}</span>
      };
      
      setCategories(prev => [newCat, ...prev]);
      if (scrollRef.current) scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      toast.success('New category added!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get AI suggestion';
      console.error("AI Suggestion failed:", err);
      toast.error(errorMessage.includes('API key') ? 'API key not configured' : 'AI suggestion failed. Please try again.');
    } finally {
      setIsSuggesting(false);
    }
  };

  // Feature 2: ✨ AI Chat Interaction
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    if (!API_URL) {
      toast.error('AI chat requires API key configuration');
      return;
    }
    
    const userMsg = { role: 'user', text: chatInput };
    setMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsTyping(true);

    try {
      const botResponse = await callGemini(
        chatInput, 
        "You are a shopping assistant for a mobile app. Keep answers under 20 words. Suggest specific categories from our list where relevant."
      );
      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Service unavailable';
      console.error("AI Chat failed:", err);
      const userFriendlyMessage = errorMessage.includes('API key') 
        ? "Sorry, AI chat is not configured." 
        : "Sorry, I'm offline. Please try again!";
      setMessages(prev => [...prev, { role: 'bot', text: userFriendlyMessage }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <section className="w-full bg-white py-4 select-none relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-bold text-gray-900">Category</h2>
          <button 
            onClick={handleAiSuggest}
            disabled={isSuggesting}
            className="flex items-center gap-1 bg-purple-50 text-purple-600 text-[10px] px-2 py-0.5 rounded-full border border-purple-100 active:bg-purple-100 disabled:opacity-50 transition-colors"
          >
            {isSuggesting ? <Loader2 size={10} className="animate-spin" /> : "✨ AI Trend"}
          </button>
        </div>
        <button className="flex items-center text-[11px] font-medium text-gray-400">
          View All <ChevronRight size={12} className="ml-0.5" />
        </button>
      </div>

      {/* 2-Line Horizontal Scroll Grid */}
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto px-4 pb-2 no-scrollbar" 
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="grid grid-rows-2 grid-flow-col gap-x-2 gap-y-2">
          {categories.map((item) => (
            <div
              key={item.id}
              onClick={() => onCategoryClick?.(item.name)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F8F9FA] border border-gray-100 rounded-full whitespace-nowrap shadow-sm active:scale-95 transition-all cursor-pointer min-w-[110px]"
            >
              <div className="flex items-center justify-center shrink-0">
                {item.icon}
              </div>
              <span className="text-[11px] font-semibold text-gray-700 truncate">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Button for AI Guide */}
      <button 
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-gray-900 rounded-full shadow-xl flex items-center justify-center text-white z-40 active:scale-90 transition-transform"
      >
        <Bot size={24} />
      </button>

      {/* AI Chat Drawer */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-t-3xl shadow-2xl flex flex-col max-h-[60vh] overflow-hidden animate-in slide-in-from-bottom">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <span className="font-bold text-sm text-gray-800 flex items-center gap-2">
                <Sparkles size={16} className="text-purple-500" /> Shopping Assistant
              </span>
              <button onClick={() => setIsChatOpen(false)} className="text-gray-400 bg-white rounded-full p-1 shadow-sm">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-[12px] ${
                    m.role === 'user' 
                      ? 'bg-purple-600 text-white rounded-br-none' 
                      : 'bg-gray-100 text-gray-800 rounded-bl-none shadow-sm'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-2xl animate-pulse">
                    <Loader2 size={14} className="animate-spin text-purple-400" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t flex gap-2 bg-white">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask your guide..."
                className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 text-xs focus:ring-1 focus:ring-purple-400 outline-none"
              />
              <button 
                onClick={handleSendMessage}
                className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS to hide scrollbar */}
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </section>
  );
};

export default CategorySectionMobile;
