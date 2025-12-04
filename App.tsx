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
import AdminCatalog from './pages/AdminCatalog';
import AdminDeliverySettings from './pages/AdminDeliverySettings';
import AdminCourierSettings from './pages/AdminCourierSettings';
import { AdminSidebar, AdminHeader } from './components/AdminComponents';
import { Monitor, LayoutDashboard, Loader2 } from 'lucide-react';
import { Product, Order, User, ThemeConfig, WebsiteConfig, Role, Category, SubCategory, ChildCategory, Brand, Tag, DeliveryConfig } from './types';
import { LoginModal, MobileBottomNav } from './components/StoreComponents';
import { DataService } from './services/DataService';

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
  const highlightPage = activePage.startsWith('settings') ? 'settings' : activePage;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-800">
      <AdminSidebar 
        activePage={highlightPage} 
        onNavigate={onNavigate} 
        logo={logo} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <AdminHeader 
          onSwitchView={onSwitchView} 
          user={user} 
          onLogout={onLogout} 
          logo={logo}
          onMenuClick={() => setIsSidebarOpen(true)} 
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 bg-gray-50/50">
          {children}
        </main>
      </div>
    </div>
  );
};

type ViewState = 'store' | 'detail' | 'checkout' | 'success' | 'profile' | 'admin';

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 0, 0';
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE ---
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [logo, setLogo] = useState<string | null>(null);
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>({
    primaryColor: '#ec4899', secondaryColor: '#a855f7', tertiaryColor: '#c026d3', darkMode: false
  });
  const [websiteConfig, setWebsiteConfig] = useState<WebsiteConfig | undefined>(undefined);
  const [deliveryConfig, setDeliveryConfig] = useState<DeliveryConfig[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // Catalog State
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [childCategories, setChildCategories] = useState<ChildCategory[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  // Courier Config
  const [courierConfig, setCourierConfig] = useState({ apiKey: '', secretKey: '' });

  // Auth & Navigation
  const [user, setUser] = useState<User | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('store');
  const [adminSection, setAdminSection] = useState('dashboard');
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutQuantity, setCheckoutQuantity] = useState(1);

  // --- INITIAL DATA LOADING ---
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        setProducts(await DataService.getProducts());
        setOrders(await DataService.getOrders());
        setUsers(await DataService.getUsers());
        setRoles(await DataService.getRoles());
        
        setLogo(await DataService.get<string | null>('logo', null));
        setThemeConfig(await DataService.getThemeConfig());
        setWebsiteConfig(await DataService.getWebsiteConfig());
        setDeliveryConfig(await DataService.getDeliveryConfig());
        setCourierConfig(await DataService.get('courier', { apiKey: '', secretKey: '' }));

        // Catalog
        setCategories(await DataService.getCatalog('categories', [{ id: '1', name: 'Phones', icon: '', status: 'Active' }, { id: '2', name: 'Watches', icon: '', status: 'Active' }]));
        setSubCategories(await DataService.getCatalog('subcategories', [{ id: '1', categoryId: '1', name: 'Smartphones', status: 'Active' }, { id: '2', categoryId: '1', name: 'Feature Phones', status: 'Active' }]));
        setChildCategories(await DataService.getCatalog('childcategories', []));
        setBrands(await DataService.getCatalog('brands', [{ id: '1', name: 'Apple', logo: '', status: 'Active' }, { id: '2', name: 'Samsung', logo: '', status: 'Active' }]));
        setTags(await DataService.getCatalog('tags', [{ id: '1', name: 'Flash Deal', status: 'Active' }, { id: '2', name: 'New Arrival', status: 'Active' }]));

        // Session
        const storedSession = localStorage.getItem('gadgetshob_session');
        if (storedSession) setUser(JSON.parse(storedSession));

      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // --- PERSISTENCE WRAPPERS (Simulating DB Writes) ---
  
  useEffect(() => { if(!isLoading) DataService.save('orders', orders); }, [orders, isLoading]);
  useEffect(() => { if(!isLoading) DataService.save('products', products); }, [products, isLoading]);
  useEffect(() => { if(!isLoading) DataService.save('roles', roles); }, [roles, isLoading]);
  useEffect(() => { if(!isLoading) DataService.save('users', users); }, [users, isLoading]);
  useEffect(() => { if(!isLoading) DataService.save('logo', logo); }, [logo, isLoading]);
  useEffect(() => { if(!isLoading) DataService.save('delivery_config', deliveryConfig); }, [deliveryConfig, isLoading]);
  useEffect(() => { if(!isLoading) DataService.save('courier', courierConfig); }, [courierConfig, isLoading]);
  
  useEffect(() => { if(!isLoading) DataService.save('categories', categories); }, [categories, isLoading]);
  useEffect(() => { if(!isLoading) DataService.save('subcategories', subCategories); }, [subCategories, isLoading]);
  useEffect(() => { if(!isLoading) DataService.save('childcategories', childCategories); }, [childCategories, isLoading]);
  useEffect(() => { if(!isLoading) DataService.save('brands', brands); }, [brands, isLoading]);
  useEffect(() => { if(!isLoading) DataService.save('tags', tags); }, [tags, isLoading]);

  useEffect(() => { 
    if(!isLoading && themeConfig) {
      DataService.save('theme', themeConfig);
      const root = document.documentElement;
      root.style.setProperty('--color-primary-rgb', hexToRgb(themeConfig.primaryColor));
      root.style.setProperty('--color-secondary-rgb', hexToRgb(themeConfig.secondaryColor));
      root.style.setProperty('--color-tertiary-rgb', hexToRgb(themeConfig.tertiaryColor));
      if (themeConfig.darkMode) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  }, [themeConfig, isLoading]);

  useEffect(() => { 
    if(!isLoading && websiteConfig) {
      DataService.save('website_config', websiteConfig);
      if (websiteConfig.favicon) {
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = websiteConfig.favicon;
      }
    }
  }, [websiteConfig, isLoading]);


  // --- HANDLERS ---

  const handleRegister = (newUser: User) => {
    if (users.some(u => u.email === newUser.email)) return false;
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setUser(newUser);
    localStorage.setItem('gadgetshob_session', JSON.stringify(newUser));
    setIsLoginOpen(false);
    return true;
  };

  const handleLogin = (email: string, pass: string) => {
    const foundUser = users.find(u => u.email === email && u.password === pass);
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
    setUser(updatedUser);
    localStorage.setItem('gadgetshob_session', JSON.stringify(updatedUser));
    setUsers(users.map(u => u.email === updatedUser.email ? updatedUser : u));
  };

  const handleAddRole = (newRole: Role) => setRoles([...roles, newRole]);
  const handleUpdateRole = (updatedRole: Role) => setRoles(roles.map(r => r.id === updatedRole.id ? updatedRole : r));
  const handleDeleteRole = (roleId: string) => setRoles(roles.filter(r => r.id !== roleId));
  const handleUpdateUserRole = (userEmail: string, roleId: string) => {
    setUsers(users.map(u => u.email === userEmail ? { ...u, roleId: roleId || undefined } : u));
  };

  const handleAddProduct = (newProduct: Product) => setProducts([...products, newProduct]);
  const handleUpdateProduct = (updatedProduct: Product) => setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  const handleDeleteProduct = (id: number) => setProducts(products.filter(p => p.id !== id));
  const handleBulkDeleteProducts = (ids: number[]) => setProducts(products.filter(p => !ids.includes(p.id)));
  const handleBulkUpdateProducts = (ids: number[], updates: Partial<Product>) => setProducts(products.map(p => ids.includes(p.id) ? { ...p, ...updates } : p));

  const handleUpdateLogo = (newLogo: string | null) => setLogo(newLogo);
  const handleUpdateTheme = (newConfig: ThemeConfig) => setThemeConfig(newConfig);
  const handleUpdateWebsiteConfig = (newConfig: WebsiteConfig) => setWebsiteConfig(newConfig);
  const handleUpdateCourierConfig = (config: { apiKey: string, secretKey: string }) => setCourierConfig(config);
  const handleUpdateDeliveryConfig = (configs: DeliveryConfig[]) => setDeliveryConfig(configs);
  
  // Updated to handle partial updates including trackingId
  const handleUpdateOrder = (orderId: string, updates: Partial<Order>) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, ...updates } : o));
  };

  const addToWishlist = (id: number) => { if (!wishlist.includes(id)) setWishlist([...wishlist, id]); };
  const removeFromWishlist = (id: number) => { setWishlist(wishlist.filter(wId => wId !== id)); };
  const isInWishlist = (id: number) => wishlist.includes(id);

  const handleProductClick = (product: Product) => { setSelectedProduct(product); setCurrentView('detail'); window.scrollTo(0,0); };
  const handleCheckoutStart = (product: Product, quantity: number = 1) => { setSelectedProduct(product); setCheckoutQuantity(quantity); setCurrentView('checkout'); window.scrollTo(0,0); };
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

  const createCrudHandler = (setter: React.Dispatch<React.SetStateAction<any[]>>) => ({
    add: (item: any) => setter(prev => [...prev, item]),
    update: (item: any) => setter(prev => prev.map(i => i.id === item.id ? item : i)),
    delete: (id: string) => setter(prev => prev.filter(i => i.id !== id))
  });

  const catHandlers = createCrudHandler(setCategories);
  const subCatHandlers = createCrudHandler(setSubCategories);
  const childCatHandlers = createCrudHandler(setChildCategories);
  const brandHandlers = createCrudHandler(setBrands);
  const tagHandlers = createCrudHandler(setTags);

  const toggleView = () => {
    const nextView = currentView.startsWith('admin') ? 'store' : 'admin';
    setCurrentView(nextView);
    setSelectedProduct(null);
    if (nextView === 'admin' && !user) {
        setUser({ name: 'H M Liakat', email: 'opbd.shop@gmail.com', role: 'admin', username: 'Opbd01', phone: '01715332701' });
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 text-gray-500 gap-4">
        <Loader2 size={48} className="animate-spin text-purple-600" />
        <p className="font-medium animate-pulse">Loading Application Data...</p>
      </div>
    );
  }

  return (
    <div className={`relative ${themeConfig.darkMode ? 'dark bg-slate-900' : 'bg-gray-50'}`}>
      {isLoginOpen && <LoginModal onClose={() => setIsLoginOpen(false)} onLogin={handleLogin} onRegister={handleRegister} />}

      <div className="fixed bottom-24 right-6 z-[100] md:bottom-6">
        <button onClick={toggleView} className="bg-slate-800 text-white p-4 rounded-full shadow-2xl hover:bg-slate-700 transition-all flex items-center gap-2 border-4 border-white dark:border-slate-700">
          {currentView.startsWith('admin') ? <Monitor size={24} /> : <LayoutDashboard size={24} />}
          <span className="font-bold hidden md:inline">{currentView.startsWith('admin') ? "View Storefront" : "View Admin Dashboard"}</span>
        </button>
      </div>

      {currentView === 'admin' ? (
        <AdminLayout onSwitchView={() => setCurrentView('store')} activePage={adminSection} onNavigate={setAdminSection} logo={logo} user={user} onLogout={handleLogout}>
          {adminSection === 'dashboard' ? <AdminDashboard orders={orders} /> :
           adminSection === 'orders' ? <AdminOrders orders={orders} courierConfig={courierConfig} onUpdateOrder={handleUpdateOrder} /> :
           adminSection === 'products' ? <AdminProducts products={products} categories={categories} subCategories={subCategories} childCategories={childCategories} brands={brands} tags={tags} onAddProduct={handleAddProduct} onUpdateProduct={handleUpdateProduct} onDeleteProduct={handleDeleteProduct} onBulkDelete={handleBulkDeleteProducts} onBulkUpdate={handleBulkUpdateProducts} /> :
           adminSection === 'settings' ? <AdminSettings courierConfig={courierConfig} onUpdateCourierConfig={handleUpdateCourierConfig} onNavigate={setAdminSection} /> :
           adminSection === 'settings_delivery' ? <AdminDeliverySettings configs={deliveryConfig} onSave={handleUpdateDeliveryConfig} onBack={() => setAdminSection('settings')} /> :
           adminSection === 'settings_courier' ? <AdminCourierSettings config={courierConfig} onSave={handleUpdateCourierConfig} onBack={() => setAdminSection('settings')} /> :
           adminSection === 'admin' ? <AdminControl users={users} roles={roles} onAddRole={handleAddRole} onUpdateRole={handleUpdateRole} onDeleteRole={handleDeleteRole} onUpdateUserRole={handleUpdateUserRole} /> :
           adminSection.startsWith('catalog_') ? <AdminCatalog view={adminSection} categories={categories} subCategories={subCategories} childCategories={childCategories} brands={brands} tags={tags} onAddCategory={catHandlers.add} onUpdateCategory={catHandlers.update} onDeleteCategory={catHandlers.delete} onAddSubCategory={subCatHandlers.add} onUpdateSubCategory={subCatHandlers.update} onDeleteSubCategory={subCatHandlers.delete} onAddChildCategory={childCatHandlers.add} onUpdateChildCategory={childCatHandlers.update} onDeleteChildCategory={childCatHandlers.delete} onAddBrand={brandHandlers.add} onUpdateBrand={brandHandlers.update} onDeleteBrand={brandHandlers.delete} onAddTag={tagHandlers.add} onUpdateTag={tagHandlers.update} onDeleteTag={tagHandlers.delete} /> :
           <AdminCustomization logo={logo} onUpdateLogo={handleUpdateLogo} themeConfig={themeConfig} onUpdateTheme={handleUpdateTheme} websiteConfig={websiteConfig} onUpdateWebsiteConfig={handleUpdateWebsiteConfig} initialTab={adminSection === 'customization' ? 'website_info' : adminSection} />
          }
        </AdminLayout>
      ) : (
        <>
          {currentView === 'store' && (
            <>
              <StoreHome products={products} orders={orders} onProductClick={handleProductClick} wishlistCount={wishlist.length} wishlist={wishlist} onToggleWishlist={(id) => isInWishlist(id) ? removeFromWishlist(id) : addToWishlist(id)} user={user} onLoginClick={() => setIsLoginOpen(true)} onLogoutClick={handleLogout} onProfileClick={() => setCurrentView('profile')} logo={logo} websiteConfig={websiteConfig} />
              <MobileBottomNav 
                onHomeClick={() => { setCurrentView('store'); window.scrollTo(0,0); }}
                onCartClick={() => {}} // Placeholder
                onAccountClick={() => user ? setCurrentView('profile') : setIsLoginOpen(true)}
                cartCount={0}
                websiteConfig={websiteConfig}
              />
            </>
          )}
          {currentView === 'detail' && selectedProduct && <StoreProductDetail product={selectedProduct} orders={orders} onBack={() => setCurrentView('store')} onProductClick={handleProductClick} wishlistCount={wishlist.length} isWishlisted={isInWishlist(selectedProduct.id)} onToggleWishlist={() => isInWishlist(selectedProduct.id) ? removeFromWishlist(selectedProduct.id) : addToWishlist(selectedProduct.id)} onCheckout={handleCheckoutStart} user={user} onLoginClick={() => setIsLoginOpen(true)} onLogoutClick={handleLogout} onProfileClick={() => setCurrentView('profile')} logo={logo} websiteConfig={websiteConfig} />}
          {currentView === 'checkout' && selectedProduct && <StoreCheckout product={selectedProduct} quantity={checkoutQuantity} onBack={() => setCurrentView('detail')} onConfirmOrder={handlePlaceOrder} user={user} onLoginClick={() => setIsLoginOpen(true)} onLogoutClick={handleLogout} onProfileClick={() => setCurrentView('profile')} logo={logo} websiteConfig={websiteConfig} />}
          {currentView === 'success' && <StoreOrderSuccess onHome={() => setCurrentView('store')} user={user} onLoginClick={() => setIsLoginOpen(true)} onLogoutClick={handleLogout} onProfileClick={() => setCurrentView('profile')} logo={logo} websiteConfig={websiteConfig} />}
          {currentView === 'profile' && user && (
            <>
              <StoreProfile user={user} onUpdateProfile={handleUpdateProfile} orders={orders} onHome={() => setCurrentView('store')} onLoginClick={() => setIsLoginOpen(true)} onLogoutClick={handleLogout} logo={logo} websiteConfig={websiteConfig} />
              <MobileBottomNav 
                onHomeClick={() => { setCurrentView('store'); window.scrollTo(0,0); }}
                onCartClick={() => {}} // Placeholder
                onAccountClick={() => {}} // Already on profile
                cartCount={0}
                websiteConfig={websiteConfig}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default App;