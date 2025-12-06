
import React, { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { Monitor, LayoutDashboard, Loader2 } from 'lucide-react';
import { Product, Order, User, ThemeConfig, WebsiteConfig, Role, Category, SubCategory, ChildCategory, Brand, Tag, DeliveryConfig, ProductVariantSelection, LandingPage, FacebookPixelConfig, CourierConfig } from './types';
import type { LandingCheckoutPayload } from './components/LandingPageComponents';
import { DataService } from './services/DataService';
import { slugify } from './services/slugify';


const StoreHome = lazy(() => import('./pages/StoreHome'));
const StoreProductDetail = lazy(() => import('./pages/StoreProductDetail'));
const StoreCheckout = lazy(() => import('./pages/StoreCheckout'));
const StoreOrderSuccess = lazy(() => import('./pages/StoreOrderSuccess'));
const StoreProfile = lazy(() => import('./pages/StoreProfile'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminOrders = lazy(() => import('./pages/AdminOrders'));
const AdminProducts = lazy(() => import('./pages/AdminProducts'));
const AdminCustomization = lazy(() => import('./pages/AdminCustomization'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));
const AdminControl = lazy(() => import('./pages/AdminControl'));
const AdminCatalog = lazy(() => import('./pages/AdminCatalog'));
const AdminDeliverySettings = lazy(() => import('./pages/AdminDeliverySettings'));
const AdminCourierSettings = lazy(() => import('./pages/AdminCourierSettings'));
const AdminInventory = lazy(() => import('./pages/AdminInventory'));
const AdminReviews = lazy(() => import('./pages/AdminReviews'));
const AdminGallery = lazy(() => import('./pages/AdminGallery'));
const AdminFacebookPixel = lazy(() => import('./pages/AdminFacebookPixel'));
const AdminLandingPage = lazy(() => import('./pages/AdminLandingPage'));
const LandingPagePreview = lazy(() => import('./pages/LandingPagePreview'));
const loadAdminComponents = () => import('./components/AdminComponents');
const loadStoreComponents = () => import('./components/StoreComponents');
const AdminSidebar = lazy(() => loadAdminComponents().then(module => ({ default: module.AdminSidebar })));
const AdminHeader = lazy(() => loadAdminComponents().then(module => ({ default: module.AdminHeader })));
const LoginModal = lazy(() => loadStoreComponents().then(module => ({ default: module.LoginModal })));
const MobileBottomNav = lazy(() => loadStoreComponents().then(module => ({ default: module.MobileBottomNav })));

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

type ViewState = 'store' | 'detail' | 'checkout' | 'success' | 'profile' | 'admin' | 'landing_preview';

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 0, 0';
};

const FALLBACK_VARIANT: ProductVariantSelection = { color: 'Default', size: 'Standard' };

const ensureUniqueProductSlug = (desired: string, list: Product[], ignoreId?: number) => {
  const base = slugify(desired || '').replace(/--+/g, '-') || `product-${Date.now()}`;
  let candidate = base;
  let counter = 2;
  const hasConflict = (slugValue: string) => list.some(p => p.slug === slugValue && p.id !== ignoreId);
  while (hasConflict(candidate)) {
    candidate = `${base}-${counter++}`;
  }
  return candidate;
};

const normalizeProductCollection = (items: Product[]): Product[] => {
  const normalized: Product[] = [];
  items.forEach(item => {
    const slugSource = item.slug || item.name || `product-${item.id}`;
    const slug = ensureUniqueProductSlug(slugSource, normalized);
    normalized.push({ ...item, slug });
  });
  return normalized;
};

const SuspenseFallback = () => (
  <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 text-gray-500 gap-4">
   
    <p className="font-medium animate-pulse"></p>
  </div>
);

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE ---
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [logo, setLogo] = useState<string | null>(null);
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>({
    primaryColor: '#ec4899',
    secondaryColor: '#a855f7',
    tertiaryColor: '#c026d3',
    fontColor: '#0f172a',
    hoverColor: '#f97316',
    surfaceColor: '#e2e8f0',
    darkMode: false
  });
  const [websiteConfig, setWebsiteConfig] = useState<WebsiteConfig | undefined>(undefined);
  const [deliveryConfig, setDeliveryConfig] = useState<DeliveryConfig[]>([]);
  const [facebookPixelConfig, setFacebookPixelConfig] = useState<FacebookPixelConfig>({
    pixelId: '',
    accessToken: '',
    enableTestEvent: false,
    isEnabled: false
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // Catalog State
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [childCategories, setChildCategories] = useState<ChildCategory[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  // Courier Config
  const [courierConfig, setCourierConfig] = useState<CourierConfig>({ apiKey: '', secretKey: '', instruction: '' });

  // Auth & Navigation
  const [user, setUser] = useState<User | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('store');
  const [adminSection, setAdminSection] = useState('dashboard');
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutQuantity, setCheckoutQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantSelection | null>(null);
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [selectedLandingPage, setSelectedLandingPage] = useState<LandingPage | null>(null);

  // --- INITIAL DATA LOADING ---
  useEffect(() => {
    const storedSession = localStorage.getItem('gadgetshob_session');
    if (storedSession) {
      try {
        const parsedUser = JSON.parse(storedSession);
        setUser(parsedUser);
        if (parsedUser?.role === 'admin') {
          setCurrentView('admin');
        }
      } catch (err) { console.warn('Invalid session cache', err); }
    }

    let isMounted = true;
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [
          productsData,
          ordersData,
          landingPagesData,
          usersData,
          rolesData,
          logoData,
          themeData,
          websiteData,
          deliveryData,
          courierData,
          facebookPixelData,
          categoriesData,
          subCategoriesData,
          childCategoriesData,
          brandsData,
          tagsData
        ] = await Promise.all([
          DataService.getProducts(),
          DataService.getOrders(),
          DataService.getLandingPages(),
          DataService.getUsers(),
          DataService.getRoles(),
          DataService.get<string | null>('logo', null),
          DataService.getThemeConfig(),
          DataService.getWebsiteConfig(),
          DataService.getDeliveryConfig(),
          DataService.get('courier', { apiKey: '', secretKey: '', instruction: '' }),
          DataService.get<FacebookPixelConfig>('facebook_pixel', { pixelId: '', accessToken: '', enableTestEvent: false, isEnabled: false }),
          DataService.getCatalog('categories', [{ id: '1', name: 'Phones', icon: '', status: 'Active' }, { id: '2', name: 'Watches', icon: '', status: 'Active' }]),
          DataService.getCatalog('subcategories', [{ id: '1', categoryId: '1', name: 'Smartphones', status: 'Active' }, { id: '2', categoryId: '1', name: 'Feature Phones', status: 'Active' }]),
          DataService.getCatalog('childcategories', []),
          DataService.getCatalog('brands', [{ id: '1', name: 'Apple', logo: '', status: 'Active' }, { id: '2', name: 'Samsung', logo: '', status: 'Active' }]),
          DataService.getCatalog('tags', [{ id: '1', name: 'Flash Deal', status: 'Active' }, { id: '2', name: 'New Arrival', status: 'Active' }])
        ]);

        if (!isMounted) return;
        const normalizedProducts = normalizeProductCollection(productsData);
        setProducts(normalizedProducts);
        setOrders(ordersData);
        setLandingPages(landingPagesData);
        setUsers(usersData);
        setRoles(rolesData);
        setLogo(logoData);
        setThemeConfig(themeData);
        setWebsiteConfig(websiteData);
        setDeliveryConfig(deliveryData);
        setCourierConfig({
          apiKey: courierData?.apiKey || '',
          secretKey: courierData?.secretKey || '',
          instruction: courierData?.instruction || ''
        });
        setFacebookPixelConfig(facebookPixelData);
        setCategories(categoriesData);
        setSubCategories(subCategoriesData);
        setChildCategories(childCategoriesData);
        setBrands(brandsData);
        setTags(tagsData);
      } catch (error) {
        console.error('Failed to load data', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, []);

  // --- PERSISTENCE WRAPPERS (Simulating DB Writes) ---
  
  useEffect(() => { if(!isLoading) DataService.save('orders', orders); }, [orders, isLoading]);
  useEffect(() => { if(!isLoading) DataService.save('products', products); }, [products, isLoading]);
  useEffect(() => { if(!isLoading) DataService.save('roles', roles); }, [roles, isLoading]);
  useEffect(() => { if(!isLoading) DataService.save('users', users); }, [users, isLoading]);
  useEffect(() => { if(!isLoading) DataService.save('logo', logo); }, [logo, isLoading]);
  useEffect(() => { if(!isLoading) DataService.save('delivery_config', deliveryConfig); }, [deliveryConfig, isLoading]);
  useEffect(() => { if(!isLoading) DataService.save('courier', courierConfig); }, [courierConfig, isLoading]);
  useEffect(() => { if(!isLoading) DataService.save('facebook_pixel', facebookPixelConfig); }, [facebookPixelConfig, isLoading]);
  
  useEffect(() => { if(!isLoading) DataService.save('categories', categories); }, [categories, isLoading]);
  useEffect(() => { if(!isLoading) DataService.save('subcategories', subCategories); }, [subCategories, isLoading]);
  useEffect(() => { if(!isLoading) DataService.save('childcategories', childCategories); }, [childCategories, isLoading]);
  useEffect(() => { if(!isLoading) DataService.save('brands', brands); }, [brands, isLoading]);
  useEffect(() => { if(!isLoading) DataService.save('tags', tags); }, [tags, isLoading]);
  useEffect(() => { if(!isLoading) DataService.save('landing_pages', landingPages); }, [landingPages, isLoading]);

  useEffect(() => { 
    if(!isLoading && themeConfig) {
      DataService.save('theme', themeConfig);
      const root = document.documentElement;
      root.style.setProperty('--color-primary-rgb', hexToRgb(themeConfig.primaryColor));
      root.style.setProperty('--color-secondary-rgb', hexToRgb(themeConfig.secondaryColor));
      root.style.setProperty('--color-tertiary-rgb', hexToRgb(themeConfig.tertiaryColor));
      root.style.setProperty('--color-font-rgb', hexToRgb(themeConfig.fontColor));
      root.style.setProperty('--color-hover-rgb', hexToRgb(themeConfig.hoverColor));
      root.style.setProperty('--color-surface-rgb', hexToRgb(themeConfig.surfaceColor));
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

  useEffect(() => {
    const scriptId = 'facebook-pixel-script';
    const noScriptId = 'facebook-pixel-noscript';

    const removePixelArtifacts = () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) existingScript.remove();
      const existingNoScript = document.getElementById(noScriptId);
      if (existingNoScript) existingNoScript.remove();
    };

    if (!facebookPixelConfig?.isEnabled || !facebookPixelConfig.pixelId) {
      removePixelArtifacts();
      return;
    }

    removePixelArtifacts();
    const pixelId = facebookPixelConfig.pixelId.trim();
    const testEventId = facebookPixelConfig.enableTestEvent ? `TEST_${Date.now()}` : null;

    const script = document.createElement('script');
    script.id = scriptId;
    script.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod? n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}'${testEventId ? `, {eventID: '${testEventId}'}` : ''});
fbq('track', 'PageView');`;
    document.head.appendChild(script);

    const noscript = document.createElement('noscript');
    noscript.id = noScriptId;
    noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1${facebookPixelConfig.enableTestEvent ? '&cd[event_source_url]=test' : ''}" />`;
    document.body.appendChild(noscript);

    return removePixelArtifacts;
  }, [facebookPixelConfig]);


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
    const formattedEmail = email.trim();
    const formattedPass = pass.trim();
    const foundUser = users.find(u => u.email === formattedEmail && u.password === formattedPass);
    if (formattedEmail.toLowerCase() === 'admin@systemnextit.com' && formattedPass === 'admin121') {
       const admin: User = { name: 'Super Admin', email: 'admin@systemnextit.com', role: 'admin' };
       setUser(admin);
       localStorage.setItem('gadgetshob_session', JSON.stringify(admin));
       setIsLoginOpen(false);
       setCurrentView('admin');
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
    setSelectedVariant(null);
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

  const handleAddProduct = (newProduct: Product) => {
    const slug = ensureUniqueProductSlug(newProduct.slug || newProduct.name || `product-${newProduct.id}`, products);
    setProducts([...products, { ...newProduct, slug }]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    const slug = ensureUniqueProductSlug(updatedProduct.slug || updatedProduct.name || `product-${updatedProduct.id}`, products, updatedProduct.id);
    setProducts(products.map(p => p.id === updatedProduct.id ? { ...updatedProduct, slug } : p));
  };
  const handleDeleteProduct = (id: number) => setProducts(products.filter(p => p.id !== id));
  const handleBulkDeleteProducts = (ids: number[]) => setProducts(products.filter(p => !ids.includes(p.id)));
  const handleBulkUpdateProducts = (ids: number[], updates: Partial<Product>) => {
    const { slug, ...restUpdates } = updates;
    setProducts(products.map(p => ids.includes(p.id) ? { ...p, ...restUpdates } : p));
  };

  const handleCreateLandingPage = (page: LandingPage) => {
    setLandingPages(prev => [page, ...prev]);
  };

  const handleUpsertLandingPage = (page: LandingPage) => {
    setLandingPages(prev => {
      const exists = prev.some(lp => lp.id === page.id);
      return exists ? prev.map(lp => lp.id === page.id ? page : lp) : [page, ...prev];
    });
  };

  const handleToggleLandingPublish = (pageId: string, status: LandingPage['status']) => {
    const timestamp = new Date().toISOString();
    setLandingPages(prev => prev.map(lp => lp.id === pageId ? {
      ...lp,
      status,
      updatedAt: timestamp,
      publishedAt: status === 'published' ? timestamp : undefined
    } : lp));
  };

  const handlePreviewLandingPage = (page: LandingPage) => {
    setSelectedLandingPage(page);
    setCurrentView('landing_preview');
    window.scrollTo(0,0);
  };

  const handleUpdateLogo = (newLogo: string | null) => setLogo(newLogo);
  const handleUpdateTheme = (newConfig: ThemeConfig) => setThemeConfig(newConfig);
  const handleUpdateWebsiteConfig = (newConfig: WebsiteConfig) => setWebsiteConfig(newConfig);
  const handleUpdateCourierConfig = (config: CourierConfig) => setCourierConfig(config);
  const handleUpdateDeliveryConfig = (configs: DeliveryConfig[]) => setDeliveryConfig(configs);
  
  // Updated to handle partial updates including trackingId
  const handleUpdateOrder = (orderId: string, updates: Partial<Order>) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, ...updates } : o));
  };

  const addToWishlist = (id: number) => { if (!wishlist.includes(id)) setWishlist([...wishlist, id]); };
  const removeFromWishlist = (id: number) => { setWishlist(wishlist.filter(wId => wId !== id)); };
  const isInWishlist = (id: number) => wishlist.includes(id);

  const ensureVariantSelection = (product?: Product | null, variant?: ProductVariantSelection | null): ProductVariantSelection => ({
    color: variant?.color || product?.variantDefaults?.color || product?.colors?.[0] || FALLBACK_VARIANT.color,
    size: variant?.size || product?.variantDefaults?.size || product?.sizes?.[0] || FALLBACK_VARIANT.size,
  });

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setSelectedVariant(null);
    setCurrentView('detail');
    if (product.slug) {
      window.history.pushState({ slug: product.slug }, '', `/${product.slug}`);
    }
    window.scrollTo(0,0);
  };
  const handleCheckoutStart = (product: Product, quantity: number = 1, variant?: ProductVariantSelection) => {
    setSelectedProduct(product);
    setCheckoutQuantity(quantity);
    setSelectedVariant(ensureVariantSelection(product, variant));
    setCurrentView('checkout');
    if (product.slug) {
      window.history.pushState({ slug: product.slug }, '', `/${product.slug}`);
    }
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
      email: formData.email,
      phone: formData.phone,
      division: formData.division,
      variant: ensureVariantSelection(selectedProduct, formData.variant || selectedVariant),
      productId: selectedProduct?.id,
      productName: selectedProduct?.name,
      quantity: formData.quantity || checkoutQuantity,
      deliveryType: formData.deliveryType,
      deliveryCharge: formData.deliveryCharge
    };
    setOrders([newOrder, ...orders]);
    setCurrentView('success');
    window.scrollTo(0,0);
  };

  const handleLandingOrderSubmit = async (payload: LandingCheckoutPayload & { pageId: string; productId: number }) => {
    const product = products.find(p => p.id === payload.productId);
    if (!product) return;
    const newOrder: Order = {
      id: `LP-${Math.floor(10000 + Math.random() * 90000)}`,
      customer: payload.fullName,
      location: payload.address,
      phone: payload.phone,
      amount: product.price * payload.quantity,
      date: new Date().toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: 'Pending',
      email: payload.email,
      variant: ensureVariantSelection(product),
      productId: product.id,
      productName: product.name,
      quantity: payload.quantity
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  const handleCloseLandingPreview = () => {
    setSelectedLandingPage(null);
    setCurrentView(user?.role === 'admin' ? 'admin' : 'store');
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
    if (user?.role !== 'admin') return;
    const nextView = currentView.startsWith('admin') ? 'store' : 'admin';
    setCurrentView(nextView);
    setSelectedProduct(null);
  };

  const syncViewWithLocation = useCallback((path?: string) => {
    const trimmedPath = (path ?? window.location.pathname).replace(/^\/+|\/+$/g, '');
    if (!trimmedPath) {
      if (!currentView.startsWith('admin')) {
        setSelectedProduct(null);
        setCurrentView('store');
      }
      return;
    }

    if (trimmedPath === 'admin') {
      if (user?.role === 'admin') {
        setCurrentView('admin');
      } else {
        window.history.replaceState({}, '', '/');
        if (!currentView.startsWith('admin')) setCurrentView('store');
      }
      return;
    }

    const matchedProduct = products.find(p => p.slug === trimmedPath);
    if (matchedProduct) {
      setSelectedProduct(matchedProduct);
      setSelectedVariant(null);
      setCurrentView('detail');
      return;
    }

    window.history.replaceState({}, '', '/');
    if (!currentView.startsWith('admin')) {
      setSelectedProduct(null);
      setCurrentView('store');
    }
  }, [products, currentView, user]);

  useEffect(() => {
    const handlePopState = () => syncViewWithLocation();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [syncViewWithLocation]);

  useEffect(() => {
    syncViewWithLocation(window.location.pathname);
  }, [products, syncViewWithLocation]);

  useEffect(() => {
    if (currentView === 'store' && window.location.pathname !== '/') {
      window.history.replaceState({}, '', '/');
    }
  }, [currentView]);

//   if (isLoading) {
//     return (
//       <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 text-gray-500 gap-4">
//         {/* <Loader2 size={48} className="animate-spin text-purple-600" /> */}
// <LifeLine color="#32cd32" size="medium" text="" textColor="#00ff0e" />
      
//         <p className="font-medium animate-pulse">Overseas Products.</p>
//       </div>
//     );
//   }

  return (
    <Suspense fallback={<SuspenseFallback />}>
      <div className={`relative ${themeConfig.darkMode ? 'dark bg-slate-900' : 'bg-gray-50'}`}>
        {isLoginOpen && <LoginModal onClose={() => setIsLoginOpen(false)} onLogin={handleLogin} onRegister={handleRegister} />}

        {user?.role === 'admin' && (
          <div className="fixed bottom-24 right-6 z-[100] md:bottom-6">
            <button onClick={toggleView} className="bg-slate-800 text-white p-4 rounded-full shadow-2xl hover:bg-slate-700 transition-all flex items-center gap-2 border-4 border-white dark:border-slate-700">
              {currentView.startsWith('admin') ? <Monitor size={24} /> : <LayoutDashboard size={24} />}
              <span className="font-bold hidden md:inline">{currentView.startsWith('admin') ? "View Storefront" : "View Admin Dashboard"}</span>
            </button>
          </div>
        )}

        {currentView === 'admin' ? (
          <AdminLayout onSwitchView={() => setCurrentView('store')} activePage={adminSection} onNavigate={setAdminSection} logo={logo} user={user} onLogout={handleLogout}>
            {adminSection === 'dashboard' ? <AdminDashboard orders={orders} /> :
             adminSection === 'orders' ? <AdminOrders orders={orders} courierConfig={courierConfig} onUpdateOrder={handleUpdateOrder} /> :
             adminSection === 'products' ? <AdminProducts products={products} categories={categories} subCategories={subCategories} childCategories={childCategories} brands={brands} tags={tags} onAddProduct={handleAddProduct} onUpdateProduct={handleUpdateProduct} onDeleteProduct={handleDeleteProduct} onBulkDelete={handleBulkDeleteProducts} onBulkUpdate={handleBulkUpdateProducts} /> :
             adminSection === 'landing_pages' ? <AdminLandingPage products={products} landingPages={landingPages} onCreateLandingPage={handleCreateLandingPage} onUpdateLandingPage={handleUpsertLandingPage} onTogglePublish={handleToggleLandingPublish} onPreviewLandingPage={handlePreviewLandingPage} /> :
             adminSection === 'inventory' ? <AdminInventory products={products} /> :
             adminSection === 'reviews' ? <AdminReviews /> :
             adminSection === 'gallery' ? <AdminGallery /> :
             adminSection === 'settings' ? <AdminSettings courierConfig={courierConfig} onUpdateCourierConfig={handleUpdateCourierConfig} onNavigate={setAdminSection} user={user} onUpdateProfile={handleUpdateProfile} /> :
             adminSection === 'settings_delivery' ? <AdminDeliverySettings configs={deliveryConfig} onSave={handleUpdateDeliveryConfig} onBack={() => setAdminSection('settings')} /> :
             adminSection === 'settings_courier' ? <AdminCourierSettings config={courierConfig} onSave={handleUpdateCourierConfig} onBack={() => setAdminSection('settings')} /> :
             adminSection === 'settings_facebook_pixel' ? <AdminFacebookPixel config={facebookPixelConfig} onSave={setFacebookPixelConfig} onBack={() => setAdminSection('settings')} /> :
             adminSection === 'admin' ? <AdminControl users={users} roles={roles} onAddRole={handleAddRole} onUpdateRole={handleUpdateRole} onDeleteRole={handleDeleteRole} onUpdateUserRole={handleUpdateUserRole} /> :
             adminSection.startsWith('catalog_') ? <AdminCatalog view={adminSection} categories={categories} subCategories={subCategories} childCategories={childCategories} brands={brands} tags={tags} onAddCategory={catHandlers.add} onUpdateCategory={catHandlers.update} onDeleteCategory={catHandlers.delete} onAddSubCategory={subCatHandlers.add} onUpdateSubCategory={subCatHandlers.update} onDeleteSubCategory={subCatHandlers.delete} onAddChildCategory={childCatHandlers.add} onUpdateChildCategory={childCatHandlers.update} onDeleteChildCategory={childCatHandlers.delete} onAddBrand={brandHandlers.add} onUpdateBrand={brandHandlers.update} onDeleteBrand={brandHandlers.delete} onAddTag={tagHandlers.add} onUpdateTag={tagHandlers.update} onDeleteTag={tagHandlers.delete} /> :
             <AdminCustomization logo={logo} onUpdateLogo={handleUpdateLogo} themeConfig={themeConfig} onUpdateTheme={handleUpdateTheme} websiteConfig={websiteConfig} onUpdateWebsiteConfig={handleUpdateWebsiteConfig} initialTab={adminSection === 'customization' ? 'website_info' : adminSection} />
            }
          </AdminLayout>
        ) : (
          <>
            {currentView === 'store' && (
              <>
                <StoreHome products={products} orders={orders} onProductClick={handleProductClick} onQuickCheckout={(product, quantity, variant) => handleCheckoutStart(product, quantity, variant)} wishlistCount={wishlist.length} wishlist={wishlist} onToggleWishlist={(id) => isInWishlist(id) ? removeFromWishlist(id) : addToWishlist(id)} user={user} onLoginClick={() => setIsLoginOpen(true)} onLogoutClick={handleLogout} onProfileClick={() => setCurrentView('profile')} logo={logo} websiteConfig={websiteConfig} />
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
            {currentView === 'checkout' && selectedProduct && (
              <StoreCheckout 
                product={selectedProduct}
                quantity={checkoutQuantity}
                variant={selectedVariant || ensureVariantSelection(selectedProduct)}
                onBack={() => setCurrentView('detail')}
                onConfirmOrder={handlePlaceOrder}
                user={user}
                onLoginClick={() => setIsLoginOpen(true)}
                onLogoutClick={handleLogout}
                onProfileClick={() => setCurrentView('profile')}
                logo={logo}
                websiteConfig={websiteConfig}
                deliveryConfigs={deliveryConfig}
              />
            )}
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
            {currentView === 'landing_preview' && selectedLandingPage && (
              <LandingPagePreview 
                page={selectedLandingPage}
                product={selectedLandingPage.productId ? products.find(p => p.id === selectedLandingPage.productId) : undefined}
                onBack={handleCloseLandingPreview}
                onSubmitLandingOrder={handleLandingOrderSubmit}
              />
            )}
          </>
        )}
      </div>
  </Suspense>
  );
};

export default App;