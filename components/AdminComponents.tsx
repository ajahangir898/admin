import React, { useState, useEffect, useRef } from 'react';
import {
	LayoutDashboard, ShoppingBag, Box, Settings, Sliders, FolderOpen,
	FileText, Star, Users, Ticket, Image as ImageIcon, FilePlus, DollarSign,
	Shield, LifeBuoy, BookOpen, LogOut, Bell, Menu, X, Globe, User as UserIcon, LogOut as LogOutIcon, ChevronDown, ChevronRight,
	Layers, Tag, Boxes, MessageCircle, Loader2, Check
} from 'lucide-react';
import { StatCardProps, User, Tenant } from '../types';

interface AdminSidebarProps {
	activePage?: string;
	onNavigate?: (page: string) => void;
	logo?: string | null;
	isOpen?: boolean;
	onClose?: () => void;
	userRole?: User['role'];
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activePage, onNavigate, logo, isOpen, onClose, userRole }) => {
	const [isCustomizationOpen, setIsCustomizationOpen] = useState(true);
	const [isCatalogOpen, setIsCatalogOpen] = useState(true);

	const menuItems = [
		{ id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
		{ id: 'orders', icon: <ShoppingBag size={18} />, label: 'Orders' },
		{ id: 'products', icon: <Box size={18} />, label: 'Products' },
		{ id: 'landing_pages', icon: <FileText size={18} />, label: 'Landing page' },
		{ id: 'tenants', icon: <Users size={18} />, label: 'Tenant Manager' },
		{ id: 'inventory', icon: <Boxes size={18} />, label: 'Inventory Management' },
		{ id: 'reviews', icon: <MessageCircle size={18} />, label: 'Reviews' },
		{ id: 'gallery', icon: <ImageIcon size={18} />, label: 'Gallery' },
	];

	const filteredMenuItems = menuItems.filter(item => item.id !== 'tenants' || userRole === 'super_admin');

	const catalogItems = [
		{ id: 'catalog_categories', label: 'Categories' },
		{ id: 'catalog_subcategories', label: 'Sub Categories' },
		{ id: 'catalog_childcategories', label: 'Child Categories' },
		{ id: 'catalog_brands', label: 'Brand' },
		{ id: 'catalog_tags', label: 'Tags' },
	];

	const customizationItems = [
		{ id: 'carousel', label: 'Carousel' },
		{ id: 'banner', label: 'Banner' },
		{ id: 'popup', label: 'PopUp' },
		{ id: 'website_info', label: 'Website Information' },
		{ id: 'theme_view', label: 'Theme View' },
		{ id: 'theme_colors', label: 'Theme Colors' },
	];

	const SidebarContent = () => (
		<>
			<div className="p-6 border-b border-gray-100 flex items-center justify-between">
				{logo ? (
					<img src={logo} alt="Admin Logo" className="h-8 md:h-10 object-contain" />
				) : (
					<h2 className="text-2xl font-bold tracking-tighter">
						<span className="text-gray-800">GADGET</span>
						<span className="text-orange-500">SHOB</span>
					</h2>
				)}
				<button onClick={onClose} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-full">
					<X size={20} />
				</button>
			</div>

			<div className="p-4 space-y-1 flex-1 overflow-y-auto scrollbar-hide">
				<div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3 mt-2">Main Menu</div>
				{filteredMenuItems.map((item) => (
					<div
						key={item.id}
						onClick={() => { onNavigate && onNavigate(item.id); onClose && onClose(); }}
						className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 text-sm ${
							activePage === item.id
								? 'bg-green-50 text-green-600 font-bold shadow-sm'
								: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
						}`}
					>
						{item.icon}
						<span>{item.label}</span>
					</div>
				))}

				<div>
					<div
						onClick={() => setIsCatalogOpen(!isCatalogOpen)}
						className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 text-sm ${
							activePage?.startsWith('catalog_') ? 'text-green-600 font-bold bg-green-50' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
						}`}
					>
						<div className="flex items-center gap-3">
							<Layers size={18} />
							<span>Catalog</span>
						</div>
						{isCatalogOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
					</div>

					{isCatalogOpen && (
						<div className="pl-9 pr-2 space-y-1 mt-1 animate-in slide-in-from-top-1 duration-200">
							{catalogItems.map(item => (
								<div
									key={item.id}
									onClick={() => { onNavigate && onNavigate(item.id); onClose && onClose(); }}
									className={`py-2 px-3 rounded-lg text-xs cursor-pointer transition flex items-center gap-2 ${
										activePage === item.id ? 'text-green-600 font-bold bg-white shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
									}`}
								>
									<div className={`w-0 h-0 border-l-[4px] border-l-green-600 border-y-[4px] border-y-transparent ${activePage === item.id ? 'opacity-100' : 'opacity-0'}`}></div>
									{item.label}
								</div>
							))}
						</div>
					)}
				</div>

				<div>
					<div
						onClick={() => setIsCustomizationOpen(!isCustomizationOpen)}
						className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
					>
						<div className="flex items-center gap-3">
							<Sliders size={18} />
							<span>Customization</span>
						</div>
						{isCustomizationOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
					</div>

					{isCustomizationOpen && (
						<div className="pl-9 pr-2 space-y-1 mt-1 animate-in slide-in-from-top-1 duration-200">
							{customizationItems.map(item => (
								<div
									key={item.id}
									onClick={() => { onNavigate && onNavigate(item.id); onClose && onClose(); }}
									className={`py-2 px-3 rounded-lg text-xs cursor-pointer transition ${
										activePage === item.id ? 'text-green-600 font-bold bg-green-50' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
									}`}
								>
									<div className="flex items-center gap-2">
										<div className={`w-1.5 h-1.5 rounded-full ${activePage === item.id ? 'bg-green-600' : 'bg-gray-300'}`}></div>
										{item.label}
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				<div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3 mt-6">System</div>
				<div
					onClick={() => { onNavigate && onNavigate('settings'); onClose && onClose(); }}
					className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 text-sm ${
						activePage === 'settings'
							? 'bg-green-50 text-green-600 font-bold shadow-sm'
							: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
					}`}
				>
					<Settings size={18} />
					<span>Settings</span>
				</div>
				<div
					onClick={() => { onNavigate && onNavigate('admin'); onClose && onClose(); }}
					className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 text-sm ${
						activePage === 'admin'
							? 'bg-green-50 text-green-600 font-bold shadow-sm'
							: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
					}`}
				>
					<Shield size={18} />
					<span>Admin Control</span>
				</div>

				<div className="mt-8 pt-4 border-t border-gray-100">
					<div className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition text-sm">
						<LogOut size={18} />
						<span>Logout</span>
					</div>
				</div>
			</div>
		</>
	);

	return (
		<>
			<div className="hidden lg:flex w-64 bg-white border-r border-gray-200 h-screen flex-col sticky top-0 scrollbar-hide">
				<SidebarContent />
			</div>

			{isOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
					onClick={onClose}
				></div>
			)}

			<div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
				<SidebarContent />
			</div>
		</>
	);
};

export const AdminHeader: React.FC<{ 
	onSwitchView: () => void, 
	user?: User | null, 
	onLogout?: () => void, 
	logo?: string | null,
	onMenuClick?: () => void,
	tenants?: Tenant[],
	activeTenantId?: string,
	onTenantChange?: (tenantId: string) => void,
	isTenantSwitching?: boolean
}> = ({ onSwitchView, user, onLogout, logo, onMenuClick, tenants, activeTenantId, onTenantChange, isTenantSwitching }) => {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [isTenantMenuOpen, setIsTenantMenuOpen] = useState(false);
	const tenantMenuRef = useRef<HTMLDivElement | null>(null);
	const mobileSelectId = 'tenant-mobile-select';
	const tenantOptions = tenants ?? [];
	const selectedTenant = tenantOptions.find((tenant) => tenant.id === activeTenantId);
	const canSwitchTenant = tenantOptions.length > 0 && typeof onTenantChange === 'function';

	useEffect(() => {
		if (!isTenantMenuOpen) return;
		const handleClickOutside = (event: MouseEvent) => {
			if (tenantMenuRef.current && !tenantMenuRef.current.contains(event.target as Node)) {
				setIsTenantMenuOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [isTenantMenuOpen]);

	const formatLabel = (value?: string) => value ? value.charAt(0).toUpperCase() + value.slice(1) : '';

	const getStatusClasses = (status?: Tenant['status']) => {
		switch (status) {
			case 'active':
				return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
			case 'trialing':
				return 'bg-sky-100 text-sky-700 border border-sky-200';
			case 'suspended':
				return 'bg-amber-100 text-amber-700 border border-amber-200';
			case 'inactive':
			default:
				return 'bg-gray-100 text-gray-600 border border-gray-200';
		}
	};

	const getPlanClasses = (plan?: Tenant['plan']) => {
		switch (plan) {
			case 'growth':
				return 'bg-purple-100 text-purple-700 border border-purple-200';
			case 'enterprise':
				return 'bg-indigo-100 text-indigo-700 border border-indigo-200';
			case 'starter':
			default:
				return 'bg-slate-100 text-slate-700 border border-slate-200';
		}
	};

	const handleTenantSelect = (tenantId: string) => {
		setIsTenantMenuOpen(false);
		if (tenantId !== activeTenantId) {
			onTenantChange?.(tenantId);
		}
	};

	const renderTenantSummary = () => (
		<div className="text-left">
			<p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Tenant</p>
			<p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">
				{selectedTenant?.name || 'Select tenant'}
			</p>
			{selectedTenant && (
				<div className="flex items-center gap-2 mt-1">
					<span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${getPlanClasses(selectedTenant.plan)}`}>
						{formatLabel(selectedTenant.plan)}
					</span>
					<span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${getStatusClasses(selectedTenant.status)}`}>
						{formatLabel(selectedTenant.status)}
					</span>
				</div>
			)}
		</div>
	);

	return (
		<header className="bg-white border-b border-gray-200 h-auto min-h-16 flex flex-wrap items-center justify-between gap-4 px-4 md:px-6 sticky top-0 z-30 shadow-sm">
			<div className="flex items-center gap-4 flex-wrap">
				<button
					onClick={onMenuClick}
					className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
				>
					<Menu size={24} />
				</button>
				<h2 className="text-xl font-bold text-gray-800 hidden md:block">Dashboard</h2>
				<button onClick={onSwitchView} className="hidden md:flex items-center gap-2 text-xs font-medium text-green-600 bg-green-50 px-4 py-1.5 rounded-full border border-green-100 hover:bg-green-100 transition">
					<Globe size={14} />
					Go to Website
				</button>
				{canSwitchTenant && (
					<div className="relative hidden sm:block" ref={tenantMenuRef}>
						<button
							type="button"
							onClick={() => setIsTenantMenuOpen((prev) => !prev)}
							disabled={isTenantSwitching}
							className={`group flex items-center justify-between gap-4 rounded-xl border px-4 py-2 shadow-sm transition w-72 ${isTenantSwitching ? 'cursor-wait border-gray-200 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
							aria-haspopup="listbox"
							aria-expanded={isTenantMenuOpen}
						>
							{renderTenantSummary()}
							<div className="flex items-center gap-2 text-gray-400">
								{isTenantSwitching && <Loader2 size={18} className="animate-spin text-emerald-500" />}
								<ChevronDown size={16} className="transition group-hover:text-gray-600" />
							</div>
						</button>
						{isTenantMenuOpen && (
							<div className="absolute right-0 top-full mt-2 w-[20rem] bg-white rounded-2xl border border-gray-100 shadow-2xl z-40 p-2">
								{tenantOptions.map((tenant) => (
									<button
										key={tenant.id}
										type="button"
										onClick={() => handleTenantSelect(tenant.id)}
										disabled={isTenantSwitching}
										className={`w-full text-left rounded-xl px-3 py-2.5 transition flex items-start justify-between gap-3 ${tenant.id === activeTenantId ? 'bg-green-50 border border-green-100' : 'hover:bg-gray-50 border border-transparent'}`}
									>
										<div>
											<p className="text-sm font-semibold text-gray-900">{tenant.name}</p>
											<div className="flex items-center gap-2 mt-1">
												<span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${getPlanClasses(tenant.plan)}`}>
													{formatLabel(tenant.plan)}
												</span>
												<span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${getStatusClasses(tenant.status)}`}>
													{formatLabel(tenant.status)}
												</span>
											</div>
											<p className="text-xs text-gray-500 mt-1">{tenant.subdomain}</p>
										</div>
										{tenant.id === activeTenantId && <Check size={16} className="text-green-600" />}
									</button>
								))}
								{!tenantOptions.length && (
									<p className="text-sm text-gray-500 px-3 py-2">No tenants available</p>
								)}
							</div>
						)}
					</div>
				)}
			</div>

			<div className="flex items-center gap-3 md:gap-6 flex-1 justify-end">
				{canSwitchTenant && (
					<div className="sm:hidden w-full max-w-[200px]">
						<label htmlFor={mobileSelectId} className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider block mb-1">Tenant</label>
						<div className="relative">
							<select
								id={mobileSelectId}
								value={selectedTenant?.id || ''}
								onChange={(event) => handleTenantSelect(event.target.value)}
								disabled={isTenantSwitching}
								className="appearance-none bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 px-3 py-1.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 w-full"
							>
								<option value="" disabled>Select tenant</option>
								{tenantOptions.map((tenant) => (
									<option key={tenant.id} value={tenant.id}>
										{tenant.name} • {formatLabel(tenant.plan)} ({formatLabel(tenant.status)})
									</option>
								))}
							</select>
							{isTenantSwitching ? (
								<Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 animate-spin" />
							) : (
								<ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
							)}
						</div>
					</div>
				)}
				<div className="bg-orange-50 border border-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded hidden md:block animate-pulse">
					Admin Mode
				</div>
				<div className="flex items-center gap-4">
					<button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition">
						<Bell size={20} />
						<span className="absolute top-1.5 right-2 w-2 h-2 bg-orange-500 rounded-full border border-white"></span>
					</button>

					<div className="relative">
						<div
							className="flex items-center gap-2 cursor-pointer"
							onClick={() => setIsDropdownOpen(!isDropdownOpen)}
						>
							<div className="w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden border-2 border-green-200">
								<img src={user?.image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'} alt="Admin" className="w-full h-full object-cover" />
							</div>
						</div>

						{isDropdownOpen && (
							<div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
								<div className="p-4 border-b border-gray-50">
									<button className="flex items-center gap-3 text-sm text-gray-700 hover:text-green-600 w-full p-2 rounded hover:bg-gray-50 transition mb-1">
										<UserIcon size={18} /> View Profile
									</button>
									<button
										onClick={onLogout}
										className="flex items-center gap-3 text-sm text-gray-700 hover:text-orange-600 w-full p-2 rounded hover:bg-gray-50 transition"
									>
										<LogOutIcon size={18} /> Logout
									</button>
								</div>
								<div className="bg-gray-50 p-4 text-center">
									<p className="text-xs text-gray-500 mb-1">(Login as {user?.username || 'admin'})</p>
									{logo ? (
										<img src={logo} alt="Brand" className="h-6 mx-auto object-contain opacity-70" />
									) : (
										<div className="flex items-center justify-center gap-1 opacity-70">
											<div className="w-4 h-4 rounded-full border-2 border-green-500"></div>
											<span className="text-[10px] font-bold text-gray-600 tracking-widest uppercase">Overseas Products</span>
										</div>
									)}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</header>
	);
};

export const DashboardStatCard: React.FC<StatCardProps> = ({ title, value, icon, colorClass }) => {
	const palette: Record<string, string> = {
		primary: 'bg-green-50 text-green-700 border-green-100 hover:border-green-200',
		'primary-strong': 'bg-green-100 text-green-800 border-green-200 hover:border-green-300',
		secondary: 'bg-orange-50 text-orange-700 border-orange-100 hover:border-orange-200',
		'secondary-strong': 'bg-orange-100 text-orange-800 border-orange-200 hover:border-orange-300',
		neutral: 'bg-white text-slate-600 border-gray-100 hover:border-gray-200'
	};

	const getColors = (color: string) => {
		if (['green', 'blue', 'teal', 'primary'].includes(color)) return palette.primary;
		if (['purple', 'primary-strong'].includes(color)) return palette['primary-strong'];
		if (['orange', 'pink', 'red', 'cyan', 'secondary'].includes(color)) return palette.secondary;
		if (color === 'secondary-strong') return palette['secondary-strong'];
		return palette.neutral;
	};

	const styleClass = getColors(colorClass);

	return (
		<div className={`p-4 rounded-xl border ${styleClass} transition-all duration-300 hover:shadow-lg flex flex-col justify-between h-32 relative overflow-hidden group`}>
			<div className="z-10 relative">
				<p className="text-xs font-semibold opacity-70 mb-1 uppercase tracking-wide">{title}</p>
				<h3 className="text-2xl font-extrabold">{value}</h3>
			</div>
			<div className="z-10 relative">
				<div className="flex items-center gap-1 text-[10px] font-bold opacity-70 cursor-pointer hover:opacity-100 transition-opacity">
					VIEW ALL &rarr;
				</div>
			</div>

			<div className="absolute -bottom-4 -right-4 opacity-10 transform scale-[2.5] rotate-12 group-hover:scale-[3] group-hover:rotate-6 transition-transform duration-500">
				{icon}
			</div>
		</div>
	);
};

