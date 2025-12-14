import React, { useState, useEffect, useRef } from 'react';
import {
	LayoutDashboard, ShoppingBag, Box, Settings, Sliders, FolderOpen,
	FileText, Star, Users, Ticket, Image as ImageIcon, FilePlus, DollarSign,
	Shield, LifeBuoy, BookOpen, LogOut, Bell, Menu, X, Globe, User as UserIcon, LogOut as LogOutIcon, ChevronDown, ChevronRight,
	Layers, Tag, Boxes, MessageCircle, Loader2, Check, Target
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
	const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
	const [isCatalogOpen, setIsCatalogOpen] = useState(false);
	const [isBusinessReportOpen, setIsBusinessReportOpen] = useState(false);

	const menuItems = [
		{ id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
		{ id: 'orders', icon: <ShoppingBag size={18} />, label: 'Orders' },
		{ id: 'products', icon: <Box size={18} />, label: 'Products' },
		{ id: 'landing_pages', icon: <FileText size={18} />, label: 'Landing page' },
		{ id: 'popups', icon: <Layers size={18} />, label: 'Popups' },
		{ id: 'tenants', icon: <Users size={18} />, label: 'Tenant Manager' },
		{ id: 'inventory', icon: <Boxes size={18} />, label: 'Inventory Management' },
		// { id: 'expenses', icon: <DollarSign size={18} />, label: 'Site Expenses' },
		{ id: 'customers', icon: <Users size={18} />, label: 'Customers' },
		{ id: 'reviews', icon: <MessageCircle size={18} />, label: 'Reviews' },
		{ id: 'daily_target', icon: <Target size={18} />, label: 'Daily Target' },
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

	const businessReportItems = [
		{ id: 'business_report_expense', label: 'Expense' },
		{ id: 'business_report_income', label: 'Income' },
		{ id: 'business_report_due_book', label: 'Due Book' },
		{ id: 'business_report_profit_loss', label: 'Profit / Loss' },
		{ id: 'business_report_note', label: 'Note' },
	];

	const SidebarContent = () => (
		<>
			<div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#0f0f1a] via-[#061410] to-[#1a0b0f]">
				{logo ? (
					<img src={logo} alt="Admin Logo" className="h-8 md:h-10 object-contain" />
				) : (
					<h2 className="text-2xl font-black tracking-widest">
						<span className="text-white">GADGET</span>
						<span className="text-red-500">SHOB</span>
					</h2>
				)}
				<button onClick={onClose} className="lg:hidden p-2 text-slate-300 hover:bg-white/10 rounded-full">
					<X size={20} />
				</button>
			</div>

			<div className="p-4 space-y-1 flex-1 overflow-y-auto scrollbar-hide bg-[#050509] text-slate-200">
				<div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-[0.4em] mb-3 px-3 mt-2">Main Menu</div>
				{filteredMenuItems.map((item) => (
					<div
						key={item.id}
						onClick={() => { onNavigate && onNavigate(item.id); onClose && onClose(); }}
						className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 text-sm ${
							activePage === item.id
								? 'bg-gradient-to-r from-red-600/20 via-red-500/10 to-emerald-500/20 text-white font-semibold border border-emerald-500/40 shadow-lg shadow-emerald-900/30'
								: 'text-slate-400 hover:bg-emerald-500/5 hover:text-white'
						}`}
					>
						{item.icon}
						<span>{item.label}</span>
					</div>
				))}

				{/* Business Report - Single Menu Item */}
				<div
					onClick={() => { onNavigate && onNavigate('business_report_expense'); onClose && onClose(); }}
					className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 text-sm ${
						activePage?.startsWith('business_report_')
							? 'bg-gradient-to-r from-red-600/20 via-red-500/10 to-emerald-500/20 text-white font-semibold border border-emerald-500/40 shadow-lg shadow-emerald-900/30'
							: 'text-slate-400 hover:bg-emerald-500/5 hover:text-white'
					}`}
				>
					<FileText size={18} />
					<span>Business Report</span>
				</div>

				{/* Catalog - Single Menu Item */}
				<div
					onClick={() => { onNavigate && onNavigate('catalog_categories'); onClose && onClose(); }}
					className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 text-sm ${
						activePage?.startsWith('catalog_')
							? 'bg-gradient-to-r from-red-600/20 via-red-500/10 to-emerald-500/20 text-white font-semibold border border-emerald-500/40 shadow-lg shadow-emerald-900/30'
							: 'text-slate-400 hover:bg-emerald-500/5 hover:text-white'
					}`}
				>
					<Layers size={18} />
					<span>Catalog</span>
				</div>

				<div>
					<div
						onClick={() => setIsCustomizationOpen(!isCustomizationOpen)}
						className="flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 text-sm text-slate-400 hover:bg-emerald-500/5 hover:text-white border border-white/5"
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
										activePage === item.id ? 'text-emerald-200 font-semibold bg-emerald-500/5 border border-emerald-500/30' : 'text-slate-500 hover:text-white hover:bg-emerald-500/5'
									}`}
								>
									<div className="flex items-center gap-2">
										<div className={`w-1.5 h-1.5 rounded-full ${activePage === item.id ? 'bg-emerald-400' : 'bg-white/30'}`}></div>
										{item.label}
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				<div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-[0.4em] mb-3 px-3 mt-6">System</div>
				<div
					onClick={() => { onNavigate && onNavigate('settings'); onClose && onClose(); }}
					className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 text-sm ${
						activePage === 'settings'
							? 'bg-gradient-to-r from-red-600/20 via-red-500/10 to-emerald-500/20 text-white font-semibold border border-emerald-500/40'
							: 'text-slate-400 hover:bg-emerald-500/5 hover:text-white'
					}`}
				>
					<Settings size={18} />
					<span>Settings</span>
				</div>
				<div
					onClick={() => { onNavigate && onNavigate('admin'); onClose && onClose(); }}
					className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 text-sm ${
						activePage === 'admin'
							? 'bg-gradient-to-r from-red-600/20 via-red-500/10 to-emerald-500/20 text-white font-semibold border border-emerald-500/40'
							: 'text-slate-400 hover:bg-emerald-500/5 hover:text-white'
					}`}
				>
					<Shield size={18} />
					<span>Admin Control</span>
				</div>

				<div className="mt-8 pt-4 border-t border-white/10">
					<div className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-emerald-200 hover:text-white hover:bg-gradient-to-r hover:from-red-600/20 hover:to-emerald-500/20 transition text-sm">
						<LogOut size={18} />
						<span>Logout</span>
					</div>
				</div>
			</div>
		</>
	);

	return (
		<>
			<div className="hidden lg:flex w-64 bg-[#050509] border-r border-emerald-500/10 h-screen flex-col sticky top-0 scrollbar-hide">
				<SidebarContent />
			</div>

			{isOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
					onClick={onClose}
				></div>
			)}

			<div className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#050509] shadow-2xl shadow-emerald-900/30 border-r border-emerald-500/20 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col p-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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
	isTenantSwitching?: boolean,
	onOpenChatCenter?: () => void,
	hasUnreadChat?: boolean
}> = ({ onSwitchView, user, onLogout, logo, onMenuClick, tenants, activeTenantId, onTenantChange, isTenantSwitching, onOpenChatCenter, hasUnreadChat }) => {
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
				return 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)]';
			case 'trialing':
				return 'bg-amber-500/20 text-amber-200 border border-amber-400/40';
			case 'suspended':
				return 'bg-yellow-500/10 text-yellow-200 border border-yellow-500/30';
			case 'inactive':
			default:
				return 'bg-white/10 text-slate-300 border border-white/10';
		}
	};

	const getPlanClasses = (plan?: Tenant['plan']) => {
		switch (plan) {
			case 'growth':
				return 'bg-fuchsia-500/20 text-fuchsia-200 border border-fuchsia-500/40';
			case 'enterprise':
				return 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40';
			case 'starter':
			default:
				return 'bg-white/10 text-slate-200 border border-white/10';
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
			<p className="text-[10px] uppercase tracking-[0.4em] text-emerald-300 font-semibold">Tenant</p>
			<p className="text-sm font-semibold text-white truncate max-w-[200px]">
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
		<header className="bg-gradient-to-r from-[#09080f]/95 via-[#07130d]/95 to-[#080c0a]/95 border-b border-white/5 h-auto min-h-16 flex flex-wrap items-center justify-between gap-4 px-4 md:px-6 sticky top-0 z-30 shadow-[0_10px_40px_rgba(0,0,0,0.45)] text-white">
			<div className="flex items-center gap-4 flex-wrap">
				<button
					onClick={onMenuClick}
					className="lg:hidden p-2 text-emerald-200 hover:bg-emerald-500/10 rounded-lg transition"
				>
					<Menu size={24} />
				</button>
				<h2 className="text-xl font-black tracking-wide hidden md:block text-emerald-200">Dashboard</h2>
				<button onClick={onSwitchView} className="hidden md:flex items-center gap-2 text-xs font-semibold text-white bg-gradient-to-r from-red-600 via-red-500 to-emerald-500 px-4 py-1.5 rounded-full border border-emerald-400/40 shadow-lg shadow-emerald-900/30 hover:shadow-emerald-500/50 transition">
					<Globe size={14} />
					Go to Website
				</button>
				{canSwitchTenant && (
					<div className="relative hidden sm:block" ref={tenantMenuRef}>
						<button
							type="button"
							onClick={() => setIsTenantMenuOpen((prev) => !prev)}
							disabled={isTenantSwitching}
							className={`group flex items-center justify-between gap-4 rounded-2xl border px-4 py-2 shadow-lg transition w-72 ${isTenantSwitching ? 'cursor-wait border-white/10 bg-white/5' : 'border-white/10 bg-gradient-to-r from-[#120f1f] via-[#07140e] to-[#1a1427] hover:border-emerald-500/40 hover:shadow-emerald-500/40 hover:bg-[#1d1a2f]'}`}
							aria-haspopup="listbox"
							aria-expanded={isTenantMenuOpen}
						>
							{renderTenantSummary()}
							<div className="flex items-center gap-2 text-emerald-200">
								{isTenantSwitching && <Loader2 size={18} className="animate-spin text-emerald-400" />}
								<ChevronDown size={16} className="transition group-hover:text-gray-600" />
							</div>
						</button>
						{isTenantMenuOpen && (
							<div className="absolute right-0 top-full mt-2 w-[20rem] bg-gradient-to-br from-[#140f1f] via-[#07130c] to-[#1b0f12] rounded-2xl border border-emerald-500/20 shadow-2xl shadow-emerald-900/40 z-40 p-2">
								{tenantOptions.map((tenant) => (
									<button
										key={tenant.id}
										type="button"
										onClick={() => handleTenantSelect(tenant.id)}
										disabled={isTenantSwitching}
										className={`w-full text-left rounded-xl px-3 py-2.5 transition flex items-start justify-between gap-3 ${tenant.id === activeTenantId ? 'bg-gradient-to-r from-red-600/20 via-red-500/10 to-emerald-500/20 border border-emerald-500/40' : 'hover:bg-emerald-500/5 border border-transparent'}`}
									>
										<div>
											<p className="text-sm font-semibold text-white">{tenant.name}</p>
											<div className="flex items-center gap-2 mt-1">
												<span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${getPlanClasses(tenant.plan)}`}>
													{formatLabel(tenant.plan)}
												</span>
												<span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${getStatusClasses(tenant.status)}`}>
													{formatLabel(tenant.status)}
												</span>
											</div>
											<p className="text-xs text-slate-400 mt-1">{tenant.subdomain}</p>
										</div>
										{tenant.id === activeTenantId && <Check size={16} className="text-emerald-400" />}
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
						<label htmlFor={mobileSelectId} className="text-[10px] uppercase font-semibold text-emerald-300 tracking-wider block mb-1">Tenant</label>
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
				<div className="bg-gradient-to-r from-red-600/20 to-emerald-500/20 border border-emerald-400/30 text-emerald-100 text-xs font-bold px-3 py-1 rounded hidden md:block animate-pulse">
					Admin Mode
				</div>
				<div className="flex items-center gap-4">
					{onOpenChatCenter && (
						<button
							onClick={onOpenChatCenter}
							type="button"
							className={`relative p-2 rounded-full transition ${hasUnreadChat ? 'text-pink-300 bg-pink-500/10 shadow-lg shadow-pink-500/30' : 'text-emerald-200 hover:bg-emerald-500/10'}`}
							aria-label="Open customer chat"
						>
							<MessageCircle size={20} />
							{hasUnreadChat && (
								<span className="absolute -top-1 -right-1 text-[9px] font-black uppercase bg-pink-500 text-white px-1.5 py-0.5 rounded-full shadow">
									New
								</span>
							)}
						</button>
					)}
					<button className="relative p-2 text-emerald-200 hover:bg-emerald-500/10 rounded-full transition">
						<Bell size={20} />
						<span className="absolute top-1.5 right-2 w-2 h-2 bg-emerald-400 rounded-full border border-white"></span>
					</button>

					<div className="relative">
						<div
							className="flex items-center gap-2 cursor-pointer"
							onClick={() => setIsDropdownOpen(!isDropdownOpen)}
						>
							<div className="w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden border-2 border-emerald-400/70">
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
		primary: 'bg-gradient-to-br from-[#062017] via-[#05160f] to-[#0c1411] text-emerald-100 border border-emerald-500/30 hover:border-emerald-400/50 shadow-emerald-900/30',
		'primary-strong': 'bg-gradient-to-br from-[#0f2e22] via-[#041911] to-[#130c11] text-emerald-100 border border-emerald-400/40 hover:border-emerald-300/50 shadow-emerald-900/30',
		secondary: 'bg-gradient-to-br from-[#2b0a0d] via-[#1a0507] to-[#120508] text-red-100 border border-red-500/30 hover:border-red-400/50 shadow-red-900/30',
		'secondary-strong': 'bg-gradient-to-br from-[#360f12] via-[#200608] to-[#150407] text-red-100 border border-red-500/40 hover:border-red-400/60 shadow-red-900/30',
		neutral: 'bg-[#0b0f12] text-slate-200 border border-white/5 hover:border-white/20 shadow-black/30'
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
		<div className={`p-4 rounded-xl ${styleClass} transition-all duration-300 hover:shadow-lg flex flex-col justify-between h-32 relative overflow-hidden group`}>
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

