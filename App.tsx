
import React, { useState, useEffect } from 'react';
import StoreHome from './pages/StoreHome';
import StoreProductDetail from './pages/StoreProductDetail';
import StoreCheckout from './pages/StoreCheckout';
import StoreOrderSuccess from './pages/StoreOrderSuccess';
import StoreProfile from './pages/StoreProfile';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminProducts from './pages/AdminProducts';
import AdminCustomization from './pages/AdminCustomization';
import AdminSettings from './pages/AdminSettings';
import AdminControl from './pages/AdminControl';
import { AdminSidebar, AdminHeader } from './components/AdminComponents';
import { Monitor, LayoutDashboard } from 'lucide-react';
import { Product, Order, User, ThemeConfig, WebsiteConfig, Role } from './types';
import { RECENT_ORDERS, PRODUCTS } from './constants';
import { LoginModal } from './components/StoreComponents';

// Wrapper layout for Admin pages
interface AdminLayoutProps {
  children: React.ReactNode;
  onSwitchView: () => void;
  activePage: string;
  onNavigate: (page: string) => void;
  logo: string | null;
  user?: User | null;
  onLogout?: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  onSwitchView, 
  activePage, 
  onNavigate,
  logo,
  user,
  onLogout
}) => {
  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-800">
      <AdminSidebar activePage={activePage} onNavigate={onNavigate} logo={logo} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <AdminHeader onSwitchView={onSwitchView} user={user} onLogout={onLogout} logo={logo} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 bg-gray-50/50">
          {children}
        </main>
      </div>
    </div>
  );
};

type ViewState = 'store' | 'detail' | 'checkout' | 'success' | 'profile' | 'admin';

// Helper to convert Hex to RGB for Tailwind variables
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 0, 0';
};

const App = () => {
  // Global Data State
  const [orders, setOrders] = useState<Order[]>(RECENT_ORDERS);
  
  // Products State with LocalStorage Persistence (Simulating Database)
  const [products, setProducts] = useState<Product[]>(() => {
    const savedProducts = localStorage.getItem('gadgetshob_products');
    return savedProducts ? JSON.parse(savedProducts) : PRODUCTS;
  });

  // Logo State Persistence
  const [logo, setLogo] = useState<string | null>(() => {
    return localStorage.getItem('gadgetshob_logo');
  });

  // Theme Config Persistence
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(() => {
    const savedTheme = localStorage.getItem('gadgetshob_theme');
    return savedTheme ? JSON.parse(savedTheme) : {
      primaryColor: '#22c55e',   // Green-500
      secondaryColor: '#ec4899', // Pink-500
      tertiaryColor: '#9333ea',  // Purple-600
      darkMode: false
    };
  });

  // Website Config Persistence (New)
  const [websiteConfig, setWebsiteConfig] = useState<WebsiteConfig>(() => {
    const savedConfig = localStorage.getItem('gadgetshob_website_config');
    const defaultConfig: WebsiteConfig = {
      websiteName: 'Overseas Products',
      shortDescription: 'Get the best for less',
      whatsappNumber: '+8801615332701',
      favicon: null,
      addresses: ['D-14/3, Bank Colony, Savar, Dhaka'],
      emails: ['opbd.shop@gmail.com', 'lunik.hasan@gmail.com'],
      phones: ['+8801615332701', '+8801611053430'],
      socialLinks: [
        { id: '1', platform: 'Facebook', url: 'https://facebook.com' },
        { id: '2', platform: 'Instagram', url: 'https://instagram.com' }
      ],
      showMobileHeaderCategory: true,
      showNewsSlider: true,
      headerSliderText: 'Easy return policy and complete cash on delivery, ease of shopping!',
      hideCopyright: false,
      hideCopyrightText: false,
      showPoweredBy: false,
      brandingText: 'Overseas Products',
      carouselItems: [
        { id: '1', name: 'Main Banner', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1200', url: '/products', urlType: 'Internal', serial: 1, status: 'Publish' },
        { id: '2', name: 'Gadget Sale', image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=1200', url: '/category/gadget', urlType: 'Internal', serial: 2, status: 'Publish' }
      ],
      searchHints: 'gadget item, gift, educational toy, mobile accessories',
      orderLanguage: 'English',
      productCardStyle: 'style1'
    };
    return savedConfig ? { ...defaultConfig, ...JSON.parse(savedConfig) } : defaultConfig;
  });

  // Roles Persistence
  const [roles, setRoles] = useState<Role[]>(() => {
    const savedRoles = localStorage.getItem('gadgetshob_roles');
    return savedRoles ? JSON.parse(savedRoles) : [
      { id: 'manager', name: 'Store Manager', description: 'Can manage products and orders', permissions: ['view_dashboard', 'manage_orders', 'view_orders', 'manage_products', 'view_products'] },
      { id: 'support', name: 'Support Agent', description: 'Can view orders and dashboard', permissions: ['view_dashboard', 'view_orders'] }
    ];
  });

  useEffect(() => {
    localStorage.setItem('gadgetshob_roles', JSON.stringify(roles));
  }, [roles]);

  // Apply Theme Side Effects
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary-rgb', hexToRgb(themeConfig.primaryColor));
    root.style.setProperty('--color-secondary-rgb', hexToRgb(themeConfig.secondaryColor));
    root.style.setProperty('--color-tertiary-rgb', hexToRgb(themeConfig.tertiaryColor));

    if (themeConfig.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    localStorage.setItem('gadgetshob_theme', JSON.stringify(themeConfig));
  }, [themeConfig]);

  // Apply Favicon Side Effect
  useEffect(() => {
    if (websiteConfig.favicon) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = websiteConfig.favicon;
    }
    // Also save to local storage on change
    localStorage.setItem('gadgetshob_website_config', JSON.stringify(websiteConfig));
  }, [websiteConfig]);

  // Courier Config State Persistence
  const [courierConfig, setCourierConfig] = useState({ apiKey: '', secretKey: '' });
  
  useEffect(() => {
    const savedCourier = localStorage.getItem('gadgetshob_courier');
    if (savedCourier) {
      setCourierConfig(JSON.parse(savedCourier));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('gadgetshob_products', JSON.stringify(products));
  }, [products]);
  
  const [wishlist, setWishlist] = useState<number[]>([]);
  
  // Auth State
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  
  // Navigation State
  const [currentView, setCurrentView] = useState<ViewState>('store');
  const [adminSection, setAdminSection] = useState('dashboard');
  
  // Transaction State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutQuantity, setCheckoutQuantity] = useState(1);

  // Initialize from LocalStorage
  useEffect(() => {
    const storedUsers = localStorage.getItem('gadgetshob_users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
    const storedSession = localStorage.getItem('gadgetshob_session');
    if (storedSession) {
      setUser(JSON.parse(storedSession));
    } else {
      // Mock Admin User if not exists for demo
      const mockAdmin: User = { 
        name: 'H M Liakat', 
        email: 'opbd.shop@gmail.com', 
        role: 'admin', 
        username: 'Opbd01', 
        phone: '01715332701',
        createdAt: 'Sep 6, 2025',
        updatedAt: 'Dec 4, 2025'
      };
      if (currentView === 'admin' && !user) setUser(mockAdmin);
    }
  }, [currentView]);

  // Auth Handlers
  const handleRegister = (newUser: User) => {
    // Check if email exists
    if (users.some(u => u.email === newUser.email)) {
      return false;
    }
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('gadgetshob_users', JSON.stringify(updatedUsers));
    
    // Auto login after register
    setUser(newUser);
    localStorage.setItem('gadgetshob_session', JSON.stringify(newUser));
    setIsLoginOpen(false);
    return true;
  };

  const handleLogin = (email: string, pass: string) => {
    const foundUser = users.find(u => u.email === email && u.password === pass);
    // Backdoor for demo admin
    if (email === 'admin' && pass === 'admin') {
       const admin: User = { name: 'Super Admin', email: 'admin@gadgetshob.com', role: 'admin' };
       setUser(admin);
       localStorage.setItem('gadgetshob_session', JSON.stringify(admin));
       setIsLoginOpen(false);
       return true;
    }
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('gadgetshob_session', JSON.stringify(foundUser));
      setIsLoginOpen(false);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('gadgetshob_session');
    setCurrentView('store');
  };

  const handleUpdateProfile = (updatedUser: User) => {
    // Update local state
    setUser(updatedUser);
    localStorage.setItem('gadgetshob_session', JSON.stringify(updatedUser));
    
    // Update users list
    const updatedUsers = users.map(u => u.email === updatedUser.email ? updatedUser : u);
    setUsers(updatedUsers);
    localStorage.setItem('gadgetshob_users', JSON.stringify(updatedUsers));
  };

  // Role Handlers
  const handleAddRole = (newRole: Role) => {
    setRoles([...roles, newRole]);
  };
  const handleUpdateRole = (updatedRole: Role) => {
    setRoles(roles.map(r => r.id === updatedRole.id ? updatedRole : r));
  };
  const handleDeleteRole = (roleId: string) => {
    setRoles(roles.filter(r => r.id !== roleId));
  };
  const handleUpdateUserRole = (userEmail: string, roleId: string) => {
    const updatedUsers = users.map(u => u.email === userEmail ? { ...u, roleId: roleId || undefined } : u);
    setUsers(updatedUsers);
    localStorage.setItem('gadgetshob_users', JSON.stringify(updatedUsers));
  };

  // Product Handlers
  const handleAddProduct = (newProduct: Product) => {
    setProducts([...products, newProduct]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter(p => p.id !== id));
  };

  // Bulk Product Handlers
  const handleBulkDeleteProducts = (ids: number[]) => {
    setProducts(products.filter(p => !ids.includes(p.id)));
  };

  const handleBulkUpdateProducts = (ids: number[], updates: Partial<Product>) => {
    setProducts(products.map(p => ids.includes(p.id) ? { ...p, ...updates } : p));
  };

  // Logo Handler
  const handleUpdateLogo = (newLogo: string | null) => {
    setLogo(newLogo);
    if (newLogo) {
      localStorage.setItem('gadgetshob_logo', newLogo);
    } else {
      localStorage.removeItem('gadgetshob_logo');
    }
  };

  // Theme Handler
  const handleUpdateTheme = (newConfig: ThemeConfig) => {
    setThemeConfig(newConfig);
  };

  // Website Config Handler
  const handleUpdateWebsiteConfig = (newConfig: WebsiteConfig) => {
    setWebsiteConfig(newConfig);
  };

  // Courier Config Handler
  const handleUpdateCourierConfig = (config: { apiKey: string, secretKey: string }) => {
    setCourierConfig(config);
    localStorage.setItem('gadgetshob_courier', JSON.stringify(config));
  };
  
  // Order Status Handler
  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
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
      status: 'Pending',
      email: formData.email
    };
    
    setOrders([newOrder, ...orders]);
    setCurrentView('success');
    window.scrollTo(0,0);
  };

  const toggleView = () => {
    const nextView = currentView.startsWith('admin') ? 'store' : 'admin';
    setCurrentView(nextView);
    setSelectedProduct(null);
    // Ensure an admin user is set when switching to admin for demo
    if (nextView === 'admin' && !user) {
        setUser({ 
           name: 'H M Liakat', 
           email: 'opbd.shop@gmail.com', 
           role: 'admin', 
           username: 'Opbd01',
           phone: '01715332701',
           createdAt: 'Sep 6, 2025',
           updatedAt: 'Dec 4, 2025'
        });
    }
  };

  return (
    <div className={`relative ${themeConfig.darkMode ? 'dark bg-slate-900' : 'bg-gray-50'}`}>
      {/* Login Modal Overlay */}
      {isLoginOpen && (
        <LoginModal 
          onClose={() => setIsLoginOpen(false)} 
          onLogin={handleLogin} 
          onRegister={handleRegister} 
        />
      )}

      {/* Floating Toggle Button for Demo Purposes */}
      <div className="fixed bottom-6 right-6 z-[100]">
        <button 
          onClick={toggleView}
          className="bg-slate-800 text-white p-4 rounded-full shadow-2xl hover:bg-slate-700 transition-all flex items-center gap-2 border-4 border-white dark:border-slate-700"
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
          logo={logo}
          user={user}
          onLogout={handleLogout}
        >
          {adminSection === 'dashboard' ? (
            <AdminDashboard orders={orders} />
          ) : adminSection === 'orders' ? (
            <AdminOrders 
              orders={orders} 
              courierConfig={courierConfig}
              onUpdateStatus={handleUpdateOrderStatus}
            />
          ) : adminSection === 'products' ? (
            <AdminProducts 
              products={products}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onBulkDelete={handleBulkDeleteProducts}
              onBulkUpdate={handleBulkUpdateProducts}
            />
          ) : adminSection === 'customization' ? (
            <AdminCustomization 
              logo={logo} 
              onUpdateLogo={handleUpdateLogo} 
              themeConfig={themeConfig}
              onUpdateTheme={handleUpdateTheme}
              websiteConfig={websiteConfig}
              onUpdateWebsiteConfig={handleUpdateWebsiteConfig}
            />
          ) : adminSection === 'settings' ? (
            <AdminSettings courierConfig={courierConfig} onUpdateCourierConfig={handleUpdateCourierConfig} />
          ) : adminSection === 'admin' ? (
            <AdminControl 
              users={users}
              roles={roles}
              onAddRole={handleAddRole}
              onUpdateRole={handleUpdateRole}
              onDeleteRole={handleDeleteRole}
              onUpdateUserRole={handleUpdateUserRole}
            />
          ) : (
            // Fallback for sub-menus like 'carousel', 'banner' if we used detailed routing, but we are using tabs in Customization
            <AdminCustomization 
              logo={logo} 
              onUpdateLogo={handleUpdateLogo} 
              themeConfig={themeConfig}
              onUpdateTheme={handleUpdateTheme}
              websiteConfig={websiteConfig}
              onUpdateWebsiteConfig={handleUpdateWebsiteConfig}
              initialTab={adminSection === 'carousel' ? 'carousel' : 'website_info'}
            />
          )}
        </AdminLayout>
      ) : (
        // Storefront Views
        <>
          {currentView === 'store' && (
             <StoreHome 
                products={products}
                onProductClick={handleProductClick} 
                wishlistCount={wishlist.length}
                wishlist={wishlist}
                onToggleWishlist={(id) => isInWishlist(id) ? removeFromWishlist(id) : addToWishlist(id)}
                user={user}
                onLoginClick={() => setIsLoginOpen(true)}
                onLogoutClick={handleLogout}
                onProfileClick={() => setCurrentView('profile')}
                logo={logo}
                websiteConfig={websiteConfig}
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
              onProfileClick={() => setCurrentView('profile')}
              logo={logo}
              websiteConfig={websiteConfig}
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
              onProfileClick={() => setCurrentView('profile')}
              logo={logo}
              websiteConfig={websiteConfig}
            />
          )}

          {currentView === 'success' && (
            <StoreOrderSuccess 
              onHome={() => setCurrentView('store')}
              user={user}
              onLoginClick={() => setIsLoginOpen(true)}
              onLogoutClick={handleLogout}
              onProfileClick={() => setCurrentView('profile')} 
              logo={logo}
              websiteConfig={websiteConfig}
            />
          )}

          {currentView === 'profile' && user && (
            <StoreProfile 
              user={user}
              onUpdateProfile={handleUpdateProfile}
              orders={orders}
              onHome={() => setCurrentView('store')}
              onLoginClick={() => setIsLoginOpen(true)}
              onLogoutClick={handleLogout}
              logo={logo}
              websiteConfig={websiteConfig}
            />
          )}
        </>
      )}
    </div>
  );
};

export default App;
