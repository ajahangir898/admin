import React, { useState } from 'react';
import StoreHome from './pages/StoreHome';
import StoreProductDetail from './pages/StoreProductDetail';
import StoreCheckout from './pages/StoreCheckout';
import StoreOrderSuccess from './pages/StoreOrderSuccess';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import { AdminSidebar, AdminHeader } from './components/AdminComponents';
import { Monitor, LayoutDashboard } from 'lucide-react';
import { Product, Order } from './types';
import { RECENT_ORDERS } from './constants';
import { LoginModal } from './components/StoreComponents';

// Wrapper layout for Admin pages
interface AdminLayoutProps {
  children: React.ReactNode;
  onSwitchView: () => void;
  activePage: string;
  onNavigate: (page: string) => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  onSwitchView, 
  activePage, 
  onNavigate 
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

type ViewState = 'store' | 'detail' | 'checkout' | 'success' | 'admin';

const App = () => {
  // Global Data State
  const [orders, setOrders] = useState<Order[]>(RECENT_ORDERS);
  const [wishlist, setWishlist] = useState<number[]>([]);
  
  // Auth State
  const [user, setUser] = useState<{name: string} | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  
  // Navigation State
  const [currentView, setCurrentView] = useState<ViewState>('store');
  const [adminSection, setAdminSection] = useState('dashboard');
  
  // Transaction State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutQuantity, setCheckoutQuantity] = useState(1);

  // Auth Handlers
  const handleLogin = (name: string) => {
    setUser({ name });
    setIsLoginOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // Wishlist Handlers
  const addToWishlist = (id: number) => {
    if (!wishlist.includes(id)) setWishlist([...wishlist, id]);
  };
  const removeFromWishlist = (id: number) => {
    setWishlist(wishlist.filter(wId => wId !== id));
  };
  const isInWishlist = (id: number) => wishlist.includes(id);

  // Navigation Handlers
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('detail');
    window.scrollTo(0,0);
  };

  const handleCheckoutStart = (product: Product, quantity: number = 1) => {
    setSelectedProduct(product);
    setCheckoutQuantity(quantity);
    setCurrentView('checkout');
    window.scrollTo(0,0);
  };

  const handlePlaceOrder = (formData: any) => {
    const newOrder: Order = {
      id: `#${Math.floor(1000 + Math.random() * 9000)}`,
      customer: formData.fullName,
      location: formData.address,
      amount: formData.amount,
      date: new Date().toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: 'Pending'
    };
    
    setOrders([newOrder, ...orders]);
    setCurrentView('success');
    window.scrollTo(0,0);
  };

  const toggleView = () => {
    setCurrentView(prev => prev.startsWith('admin') ? 'store' : 'admin');
    setSelectedProduct(null);
  };

  return (
    <div className="relative">
      {/* Login Modal Overlay */}
      {isLoginOpen && (
        <LoginModal onClose={() => setIsLoginOpen(false)} onLogin={handleLogin} />
      )}

      {/* Floating Toggle Button for Demo Purposes */}
      <div className="fixed bottom-6 right-6 z-[100]">
        <button 
          onClick={toggleView}
          className="bg-slate-800 text-white p-4 rounded-full shadow-2xl hover:bg-slate-700 transition-all flex items-center gap-2 border-4 border-white"
          title={currentView.startsWith('admin') ? "Switch to Storefront" : "Switch to Admin Dashboard"}
        >
          {currentView.startsWith('admin') ? <Monitor size={24} /> : <LayoutDashboard size={24} />}
          <span className="font-bold hidden md:inline">
            {currentView.startsWith('admin') ? "View Storefront" : "View Admin Dashboard"}
          </span>
        </button>
      </div>

      {currentView === 'admin' ? (
        <AdminLayout 
          onSwitchView={() => setCurrentView('store')}
          activePage={adminSection}
          onNavigate={(page) => setAdminSection(page)}
        >
          {adminSection === 'dashboard' ? (
            <AdminDashboard orders={orders} />
          ) : adminSection === 'orders' ? (
            <AdminOrders orders={orders} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                 <h2 className="text-xl font-bold mb-2">Page Under Construction</h2>
                 <p>The {adminSection} page is currently being built.</p>
              </div>
            </div>
          )}
        </AdminLayout>
      ) : (
        // Storefront Views
        <>
          {currentView === 'store' && (
             <StoreHome 
                onProductClick={handleProductClick} 
                wishlistCount={wishlist.length}
                wishlist={wishlist}
                onToggleWishlist={(id) => isInWishlist(id) ? removeFromWishlist(id) : addToWishlist(id)}
                user={user}
                onLoginClick={() => setIsLoginOpen(true)}
                onLogoutClick={handleLogout}
             />
          )}
          
          {currentView === 'detail' && selectedProduct && (
            <StoreProductDetail 
              product={selectedProduct} 
              onBack={() => setCurrentView('store')}
              onProductClick={handleProductClick}
              wishlistCount={wishlist.length}
              isWishlisted={isInWishlist(selectedProduct.id)}
              onToggleWishlist={() => isInWishlist(selectedProduct.id) ? removeFromWishlist(selectedProduct.id) : addToWishlist(selectedProduct.id)}
              onCheckout={(prod, qty) => handleCheckoutStart(prod, qty)}
              user={user}
              onLoginClick={() => setIsLoginOpen(true)}
              onLogoutClick={handleLogout}
            />
          )}

          {currentView === 'checkout' && selectedProduct && (
            <StoreCheckout 
              product={selectedProduct} 
              quantity={checkoutQuantity}
              onBack={() => setCurrentView('detail')}
              onConfirmOrder={handlePlaceOrder}
              user={user}
              onLoginClick={() => setIsLoginOpen(true)}
              onLogoutClick={handleLogout}
            />
          )}

          {currentView === 'success' && (
            <StoreOrderSuccess 
              onHome={() => setCurrentView('store')}
              user={user}
              onLoginClick={() => setIsLoginOpen(true)}
              onLogoutClick={handleLogout} 
            />
          )}
        </>
      )}
    </div>
  );
};

export default App;