
import React from 'react';
import { Copy, CheckCircle, Code2, Terminal } from 'lucide-react';

const IntegrationGuide: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto my-12 p-8 bg-white rounded-3xl border border-gray-100 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <Code2 className="text-indigo-600" size={32} />
        <h2 className="text-2xl font-bold text-gray-900">আপনার সাইটে যুক্ত করার গাইড (Developer Mode)</h2>
      </div>

      <div className="space-y-8">
        <section>
          <div className="flex items-center gap-2 mb-3 text-indigo-600 font-semibold">
            <Terminal size={18} />
            <span>Step 1: Install Dependencies</span>
          </div>
          <div className="bg-gray-900 text-gray-300 p-4 rounded-xl font-mono text-sm relative group">
            <code>npm install @google/genai lucide-react</code>
            <button className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Copy size={16} />
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
            <h3 className="font-bold text-indigo-900 mb-2">১. কম্পোনেন্ট কপি করুন</h3>
            <p className="text-sm text-indigo-700 leading-relaxed">
              আপনার প্রজেক্টের <code>src/components</code> ফোল্ডারে <code>SearchBar.tsx</code> এবং <code>ImageEditor.tsx</code> ফাইলগুলো পেস্ট করুন।
            </p>
          </div>
          <div className="p-5 bg-purple-50 rounded-2xl border border-purple-100">
            <h3 className="font-bold text-purple-900 mb-2">২. সার্ভিস কানেক্ট করুন</h3>
            <p className="text-sm text-purple-700 leading-relaxed">
              <code>geminiService.ts</code> ফাইলটি আপনার <code>src/services</code> ফোল্ডারে নিয়ে আপনার Gemini API Key কনফিগার করুন।
            </p>
          </div>
        </section>

        <div className="bg-green-50 border border-green-100 p-4 rounded-2xl flex gap-3">
          <CheckCircle className="text-green-600 shrink-0" />
          <p className="text-sm text-green-800">
            <strong>টিপস:</strong> আপনার ডাটাবেসের <code>tags</code> ফিল্ডের সাথে Gemini এর জেনারেট করা কি-ওয়ার্ডগুলো ম্যাচ করালে সবথেকে নির্ভুল রেজাল্ট পাবেন।
          </p>
        </div>
      </div>
    </div>
  );
};

export default IntegrationGuide;
