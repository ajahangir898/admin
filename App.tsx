import React, { useState } from 'react';
import StoreHome from './pages/StoreHome';
import StoreProductDetail from './pages/StoreProductDetail';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import { AdminSidebar, AdminHeader } from './components/AdminComponents';
import { Monitor, LayoutDashboard } from 'lucide-react';
import { Product } from './types';

// Wrapper layout for Admin pages
const AdminLayout = ({ 
  children, 
  onSwitchView, 
  activePage, 
  onNavigate 
}: { 
  children: React.ReactNode, 
  onSwitchView: () => void,
  activePage: string,
  onNavigate: (page: string) => void
}) => {
  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-800">
      <AdminSidebar activePage={activePage} onNavigate={onNavigate} />
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
  const [adminSection, setAdminSection] = useState('dashboard');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const toggleView = () => {
    setCurrentView(prev => prev === 'store' ? 'admin' : 'store');
    // Reset product selection when switching main views
    setSelectedProduct(null);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    window.scrollTo(0,0);
  };

  const handleBackToHome = () => {
    setSelectedProduct(null);
    window.scrollTo(0,0);
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
        selectedProduct ? (
          <StoreProductDetail 
            product={selectedProduct} 
            onBack={handleBackToHome}
            onProductClick={handleProductClick}
          />
        ) : (
          <StoreHome onProductClick={handleProductClick} />
        )
      ) : (
        <AdminLayout 
          onSwitchView={() => setCurrentView('store')}
          activePage={adminSection}
          onNavigate={(page) => setAdminSection(page)}
        >
          {adminSection === 'dashboard' ? (
            <AdminDashboard />
          ) : adminSection === 'orders' ? (
            <AdminOrders />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                 <h2 className="text-xl font-bold mb-2">Page Under Construction</h2>
                 <p>The {adminSection} page is currently being built.</p>
              </div>
            </div>
          )}
        </AdminLayout>
      )}
    </div>
  );
};

export default App;