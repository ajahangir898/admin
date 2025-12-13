// admin/pages/AdminApp.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Suspense, lazy } from 'react';
import { 
  Product, Order, User, ThemeConfig, WebsiteConfig, Role, Category, SubCategory, 
  ChildCategory, Brand, Tag, DeliveryConfig, CourierConfig, Tenant, 
  CreateTenantPayload, FacebookPixelConfig, ChatMessage 
} from '../types';
import { DataService } from '../services/DataService';
import { toast } from 'react-hot-toast';
import { Monitor, LayoutDashboard } from 'lucide-react';

const AdminDashboard = lazy(() => import('./AdminDashboard'));
const AdminOrders = lazy(() => import('./AdminOrders'));
const AdminProducts = lazy(() => import('./AdminProducts'));
const AdminCustomization = lazy(() => import('./AdminCustomization'));
const AdminSettings = lazy(() => import('./AdminSettings'));
const AdminControl = lazy(() => import('./AdminControl'));
const AdminCatalog = lazy(() => import('./AdminCatalog'));
const AdminDeliverySettings = lazy(() => import('./AdminDeliverySettings'));
const AdminCourierSettings = lazy(() => import('./AdminCourierSettings'));
const AdminInventory = lazy(() => import('./AdminInventory'));
const AdminReviews = lazy(() => import('./AdminReviews'));
const AdminDailyTarget = lazy(() => import('./AdminDailyTarget'));
const AdminGallery = lazy(() => import('./AdminGallery'));
const AdminExpenses = lazy(() => import('./AdminExpenses'));
const AdminFacebookPixel = lazy(() => import('./AdminFacebookPixel'));
const AdminLandingPage = lazy(() => import('./AdminLandingPage'));
const AdminTenantManagement = lazy(() => import('./AdminTenantManagement'));
const AdminDueList = lazy(() => import('./AdminDueList'));
const AdminProfitLoss = lazy(() => import('./AdminProfitLoss'));
const loadAdminComponents = () => import('../components/AdminComponents');
const AdminSidebar = lazy(() => loadAdminComponents().then(module => ({ default: module.AdminSidebar })));
const AdminHeader = lazy(() => loadAdminComponents().then(module => ({ default: module.AdminHeader })));

interface AdminAppProps {
  user: User | null;
  activeTenantId: string;
  tenants: Tenant[];
  orders: Order[];
  products: Product[];
  logo: string | null;
  themeConfig: ThemeConfig;
  websiteConfig?: WebsiteConfig;
  deliveryConfig: DeliveryConfig[];
  courierConfig: CourierConfig;
  facebookPixelConfig: FacebookPixelConfig;
  chatMessages: ChatMessage[];
  onLogout: () => void;
  onUpdateOrder: (orderId: string, updates: Partial<Order>) => void;
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: number) => void;
  onBulkDeleteProducts: (ids: number[]) => void;
  onBulkUpdateProducts: (ids: number[], updates: Partial<Product>) => void;
  onUpdateLogo: (logo: string | null) => void;
  onUpdateTheme: (config: ThemeConfig) => void;
  onUpdateWebsiteConfig: (config: WebsiteConfig) => void;
  onUpdateDeliveryConfig: (configs: DeliveryConfig[]) => void;
  onUpdateCourierConfig: (config: CourierConfig) => void;
  onUpdateProfile: (user: User) => void;
  onTenantChange: (tenantId: string) => void;
  isTenantSwitching: boolean;
  onSwitchToStore: () => void;
  onOpenAdminChat: () => void;
  hasUnreadChat: boolean;
}

interface AdminLayoutProps {
  children: React.ReactNode;
  onSwitchView: () => void;
  activePage: string;
  onNavigate: (page: string) => void;
  logo: string | null;
  user?: User | null;
  onLogout?: () => void;
  tenants?: Tenant[];
  activeTenantId?: string;
  onTenantChange?: (tenantId: string) => void;
  isTenantSwitching?: boolean;
  onOpenChatCenter?: () => void;
  hasUnreadChat?: boolean;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  onSwitchView, 
  activePage, 
  onNavigate,
  logo,
  user,
  onLogout,
  tenants,
  activeTenantId,
  onTenantChange,
  isTenantSwitching,
  onOpenChatCenter,
  hasUnreadChat
}) => {
  const highlightPage = activePage.startsWith('settings') ? 'settings' : activePage;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="admin-theme flex h-screen font-sans text-slate-100 bg-gradient-to-br from-black via-[#0b1a12] to-[#1b0b0f]">
      <AdminSidebar 
        activePage={highlightPage} 
        onNavigate={onNavigate} 
        logo={logo} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        userRole={user?.role}
      />
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gradient-to-b from-[#050407]/80 via-[#07110b]/75 to-[#0e0609]/80 backdrop-blur">
        <AdminHeader 
          onSwitchView={onSwitchView} 
          user={user} 
          onLogout={onLogout} 
          logo={logo}
          tenants={tenants}
          activeTenantId={activeTenantId}
          onTenantChange={onTenantChange}
          isTenantSwitching={isTenantSwitching}
          onOpenChatCenter={onOpenChatCenter}
          hasUnreadChat={hasUnreadChat}
          onMenuClick={() => setIsSidebarOpen(true)} 
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-0 md:p-0 bg-gradient-to-b from-[#08080f]/80 via-[#0c1a12]/70 to-[#1a0b0f]/60">
          {children}
        </main>
      </div>
    </div>
  );
};

const AdminApp: React.FC<AdminAppProps> = ({
  user,
  activeTenantId,
  tenants,
  orders,
  products,
  logo,
  themeConfig,
  websiteConfig,
  deliveryConfig,
  courierConfig,
  facebookPixelConfig,
  chatMessages,
  onLogout,
  onUpdateOrder,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onBulkDeleteProducts,
  onBulkUpdateProducts,
  onUpdateLogo,
  onUpdateTheme,
  onUpdateWebsiteConfig,
  onUpdateDeliveryConfig,
  onUpdateCourierConfig,
  onUpdateProfile,
  onTenantChange,
  isTenantSwitching,
  onSwitchToStore,
  onOpenAdminChat,
  hasUnreadChat,
}) => {
  const [adminSection, setAdminSection] = useState('dashboard');
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [childCategories, setChildCategories] = useState<ChildCategory[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [landingPages, setLandingPages] = useState<any[]>([]);
  const [hasLoadedAdminData, setHasLoadedAdminData] = useState(false);

  // Load admin-only data
  useEffect(() => {
    if (!activeTenantId || !user || hasLoadedAdminData) return;

    let isMounted = true;

    const fetchAdminData = async () => {
      try {
        const [
          usersData,
          rolesData,
          categoriesData,
          subCategoriesData,
          childCategoriesData,
          brandsData,
          tagsData,
          landingPagesData,
        ] = await Promise.all([
          DataService.getUsers(activeTenantId),
          DataService.getRoles(activeTenantId),
          DataService.getCatalog('categories', [], activeTenantId),
          DataService.getCatalog('subcategories', [], activeTenantId),
          DataService.getCatalog('childcategories', [], activeTenantId),
          DataService.getCatalog('brands', [], activeTenantId),
          DataService.getCatalog('tags', [], activeTenantId),
          DataService.getLandingPages(activeTenantId),
        ]);

        if (!isMounted) return;

        setUsers(usersData);
        setRoles(rolesData);
        setCategories(categoriesData);
        setSubCategories(subCategoriesData);
        setChildCategories(childCategoriesData);
        setBrands(brandsData);
        setTags(tagsData);
        setLandingPages(landingPagesData);
        setHasLoadedAdminData(true);
      } catch (error) {
        console.error('Failed to load admin data', error);
      }
    };

    fetchAdminData();
    return () => {
      isMounted = false;
    };
  }, [activeTenantId, user, hasLoadedAdminData]);

  const createCrudHandler = (setter: React.Dispatch<React.SetStateAction<any[]>>) => ({
    add: (item: any) => setter(prev => [...prev, { ...item, tenantId: item?.tenantId || activeTenantId }]),
    update: (item: any) => setter(prev => prev.map(i => i.id === item.id ? { ...item, tenantId: item?.tenantId || activeTenantId } : i)),
    delete: (id: string) => setter(prev => prev.filter(i => i.id !== id))
  });

  const catHandlers = createCrudHandler(setCategories);
  const subCatHandlers = createCrudHandler(setSubCategories);
  const childCatHandlers = createCrudHandler(setChildCategories);
  const brandHandlers = createCrudHandler(setBrands);
  const tagHandlers = createCrudHandler(setTags);

  const platformOperator = user?.role === 'super_admin';
  const selectedTenantRecord = tenants.find(t => t.id === activeTenantId) || null;
  const headerTenants = platformOperator ? tenants : (selectedTenantRecord ? [selectedTenantRecord] : []);
  const tenantSwitcher = platformOperator ? onTenantChange : undefined;

  const handleAddRole = (newRole: Role) => {
    const scopedRole = { ...newRole, tenantId: newRole.tenantId || activeTenantId };
    setRoles([...roles, scopedRole]);
  };

  const handleUpdateRole = (updatedRole: Role) => {
    const scopedRole = { ...updatedRole, tenantId: updatedRole.tenantId || activeTenantId };
    setRoles(roles.map(r => r.id === scopedRole.id ? scopedRole : r));
  };

  const handleDeleteRole = (roleId: string) => {
    setRoles(roles.filter(r => r.id !== roleId));
  };

  const handleUpdateUserRole = (userEmail: string, roleId: string) => {
    setUsers(users.map(u => u.email === userEmail ? { ...u, roleId: roleId || undefined } : u));
  };

  const handleCreateLandingPage = (page: any) => {
    const scopedPage = { ...page, tenantId: page.tenantId || activeTenantId };
    setLandingPages(prev => [scopedPage, ...prev]);
  };

  const handleUpsertLandingPage = (page: any) => {
    const scopedPage = { ...page, tenantId: page.tenantId || activeTenantId };
    setLandingPages(prev => {
      const exists = prev.some(lp => lp.id === scopedPage.id);
      return exists ? prev.map(lp => lp.id === scopedPage.id ? scopedPage : lp) : [scopedPage, ...prev];
    });
  };

  const handleToggleLandingPublish = (pageId: string, status: any) => {
    const timestamp = new Date().toISOString();
    setLandingPages(prev => prev.map(lp => lp.id === pageId ? {
      ...lp,
      status,
      updatedAt: timestamp,
      publishedAt: status === 'published' ? timestamp : undefined
    } : lp));
  };

  const handlePreviewLandingPage = (page: any) => {
    // Preview logic handled in main App
  };

  return (
    <AdminLayout
      onSwitchView={onSwitchToStore}
      activePage={adminSection}
      onNavigate={setAdminSection}
      logo={logo}
      user={user}
      onLogout={onLogout}
      tenants={headerTenants}
      activeTenantId={activeTenantId}
      onTenantChange={tenantSwitcher}
      isTenantSwitching={isTenantSwitching}
      onOpenChatCenter={onOpenAdminChat}
      hasUnreadChat={hasUnreadChat}
    >
      <Suspense fallback={<div className="flex items-center justify-center h-96 text-gray-400">Loading...</div>}>
        {adminSection === 'dashboard' ? <AdminDashboard orders={orders} products={products} /> :
         adminSection === 'orders' ? <AdminOrders orders={orders} courierConfig={courierConfig} onUpdateOrder={onUpdateOrder} /> :
         adminSection === 'products' ? <AdminProducts products={products} categories={categories} subCategories={subCategories} childCategories={childCategories} brands={brands} tags={tags} onAddProduct={onAddProduct} onUpdateProduct={onUpdateProduct} onDeleteProduct={onDeleteProduct} onBulkDelete={onBulkDeleteProducts} onBulkUpdate={onBulkUpdateProducts} tenantId={activeTenantId} /> :
         adminSection === 'landing_pages' ? <AdminLandingPage products={products} landingPages={landingPages} onCreateLandingPage={handleCreateLandingPage} onUpdateLandingPage={handleUpsertLandingPage} onTogglePublish={handleToggleLandingPublish} onPreviewLandingPage={handlePreviewLandingPage} /> :
         adminSection === 'due_list' || adminSection === 'business_report_due_book' ? <AdminDueList user={user} onLogout={onLogout} /> :
         adminSection === 'inventory' ? <AdminInventory products={products} /> :
         adminSection === 'expenses' ? <AdminExpenses /> :
         adminSection === 'customers' ? <AdminReviews /> :
         adminSection === 'reviews' ? <AdminReviews /> :
         adminSection === 'daily_target' ? <AdminDailyTarget /> :
         adminSection === 'gallery' ? <AdminGallery /> :
         adminSection === 'settings' ? <AdminSettings courierConfig={courierConfig} onUpdateCourierConfig={onUpdateCourierConfig} onNavigate={setAdminSection} user={user} onUpdateProfile={onUpdateProfile} /> :
         adminSection === 'settings_delivery' ? <AdminDeliverySettings configs={deliveryConfig} onSave={onUpdateDeliveryConfig} onBack={() => setAdminSection('settings')} /> :
         adminSection === 'settings_courier' ? <AdminCourierSettings config={courierConfig} onSave={onUpdateCourierConfig} onBack={() => setAdminSection('settings')} /> :
         adminSection === 'settings_facebook_pixel' ? <AdminFacebookPixel config={facebookPixelConfig} onSave={(cfg) => onUpdateCourierConfig(cfg)} onBack={() => setAdminSection('settings')} /> :
         adminSection === 'admin' ? <AdminControl users={users} roles={roles} onAddRole={handleAddRole} onUpdateRole={handleUpdateRole} onDeleteRole={handleDeleteRole} onUpdateUserRole={handleUpdateUserRole} /> :
         adminSection === 'tenants' ? (platformOperator
           ? <AdminTenantManagement tenants={tenants} onCreateTenant={async () => {}} isCreating={false} onDeleteTenant={async () => {}} deletingTenantId={null} />
           : <AdminDashboard orders={orders} products={products} />) :
         adminSection.startsWith('catalog_') ? <AdminCatalog view={adminSection} categories={categories} subCategories={subCategories} childCategories={childCategories} brands={brands} tags={tags} onAddCategory={catHandlers.add} onUpdateCategory={catHandlers.update} onDeleteCategory={catHandlers.delete} onAddSubCategory={subCatHandlers.add} onUpdateSubCategory={subCatHandlers.update} onDeleteSubCategory={subCatHandlers.delete} onAddChildCategory={childCatHandlers.add} onUpdateChildCategory={childCatHandlers.update} onDeleteChildCategory={childCatHandlers.delete} onAddBrand={brandHandlers.add} onUpdateBrand={brandHandlers.update} onDeleteBrand={brandHandlers.delete} onAddTag={tagHandlers.add} onUpdateTag={tagHandlers.update} onDeleteTag={tagHandlers.delete} /> :
         adminSection === 'business_report_profit_loss' ? <AdminProfitLoss orders={orders} onBack={() => setAdminSection('dashboard')} /> :
         adminSection === 'business_report_expense' ? <AdminExpenses /> :
         adminSection === 'business_report_income' ? <AdminExpenses /> :
         adminSection.startsWith('business_report_') ? <AdminExpenses /> :
         <AdminCustomization logo={logo} onUpdateLogo={onUpdateLogo} themeConfig={themeConfig} onUpdateTheme={onUpdateTheme} websiteConfig={websiteConfig} onUpdateWebsiteConfig={onUpdateWebsiteConfig} initialTab={adminSection === 'customization' ? 'website_info' : adminSection} />
        }
      </Suspense>
    </AdminLayout>
  );
};

export default AdminApp;