import React, { useState } from 'react';
import StoreHome from './pages/StoreHome';
import AdminDashboard from './pages/AdminDashboard';
import { AdminSidebar, AdminHeader } from './components/AdminComponents';
import { Monitor, LayoutDashboard } from 'lucide-react';

// Wrapper layout for Admin pages
const AdminLayout = ({ children, onSwitchView }: { children: React.ReactNode, onSwitchView: () => void }) => {
  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-800">
      <AdminSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <AdminHeader onSwitchView={onSwitchView} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  const [currentView, setCurrentView] = useState<'store' | 'admin'>('store');

  const toggleView = () => {
    setCurrentView(prev => prev === 'store' ? 'admin' : 'store');
  };

  return (
    <div className="relative">
      {/* Floating Toggle Button for Demo Purposes */}
      <div className="fixed bottom-6 right-6 z-[100]">
        <button 
          onClick={toggleView}
          className="bg-slate-800 text-white p-4 rounded-full shadow-2xl hover:bg-slate-700 transition-all flex items-center gap-2 border-4 border-white"
          title={currentView === 'store' ? "Switch to Admin Dashboard" : "Switch to Storefront"}
        >
          {currentView === 'store' ? <LayoutDashboard size={24} /> : <Monitor size={24} />}
          <span className="font-bold hidden md:inline">
            {currentView === 'store' ? "View Admin Dashboard" : "View Storefront"}
          </span>
        </button>
      </div>

      {currentView === 'store' ? (
        <StoreHome />
      ) : (
        <AdminLayout onSwitchView={() => setCurrentView('store')}>
          <AdminDashboard />
        </AdminLayout>
      )}
    </div>
  );
};

export default App;