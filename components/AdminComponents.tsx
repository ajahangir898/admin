
import React, { useState, useEffect, useRef } from 'react';
import {
	LayoutDashboard, ShoppingBag, Box, Settings, Sliders,
	FileText, Star, Users, Image as ImageIcon, DollarSign,
	Shield, LogOut, Bell, Menu, X, Globe, LogOut as LogOutIcon, ChevronDown, ChevronRight,
	Layers, Boxes, MessageCircle, Loader2, Check, Target, ExternalLink, CheckCheck, Trash2, AlertCircle, Package, Clock
} from 'lucide-react';
import { StatCardProps, User, Tenant } from '../types';
import { useNotifications } from '../hooks/useNotifications';
import type { Notification as AppNotification } from '../backend/src/services/NotificationService';
import { normalizeImageUrl } from '../utils/imageUrlHelper';

// Permission checking types
type PermissionMap = Record<string, string[]>;

interface AdminSidebarProps {
	activePage?: string;
	onNavigate?: (page: string) => void;
	logo?: string | null;
	isOpen?: boolean;
	onClose?: () => void;
	userRole?: User['role'];
	permissions?: PermissionMap;
}

// Helper to check if user can access a resource
const canAccess = (resource: string, userRole?: User['role'], permissions?: PermissionMap): boolean => {
	// Super admin can access everything
	if (userRole === 'super_admin') return true;
	
	// Admin can access everything except tenants
	if (userRole === 'admin' && resource !== 'tenants') return true;
	
	// Check custom role permissions
	if (permissions && permissions[resource]) {
		return permissions[resource].includes('read');
	}
	
	// Default: staff without custom role can only see dashboard
	if (userRole === 'staff') {
		return resource === 'dashboard';
	}
	
	// Tenant admin can see everything except tenants
	if (userRole === 'tenant_admin' && resource !== 'tenants') return true;
	
	return false;
};

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activePage, onNavigate, logo, isOpen, onClose, userRole, permissions }) => {
	const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
	const [isCatalogOpen, setIsCatalogOpen] = useState(false);
	const [isBusinessReportOpen, setIsBusinessReportOpen] = useState(false);

	// Menu items with their resource mapping
	const menuItems = [
		{ id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard', resource: 'dashboard' },
		{ id: 'orders', icon: <ShoppingBag size={18} />, label: 'Orders', resource: 'orders' },
		{ id: 'products', icon: <Box size={18} />, label: 'Products', resource: 'products' },
		{ id: 'landing_pages', icon: <FileText size={18} />, label: 'Landing page', resource: 'landing_pages' },
		{ id: 'popups', icon: <Layers size={18} />, label: 'Popups', resource: 'landing_pages' },
		{ id: 'tenants', icon: <Users size={18} />, label: 'Tenant Manager', resource: 'tenants' },
		{ id: 'inventory', icon: <Boxes size={18} />, label: 'Inventory Management', resource: 'inventory' },
		{ id: 'customers', icon: <Users size={18} />, label: 'Customers', resource: 'customers' },
		{ id: 'reviews', icon: <MessageCircle size={18} />, label: 'Reviews', resource: 'reviews' },
		{ id: 'daily_target', icon: <Target size={18} />, label: 'Daily Target', resource: 'daily_target' },
		{ id: 'gallery', icon: <ImageIcon size={18} />, label: 'Gallery', resource: 'gallery' },
	];

	// Filter menu items based on permissions
	const filteredMenuItems = menuItems.filter(item => canAccess(item.resource, userRole, permissions));

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
		{ id: 'chat_settings', label: 'Chat Settings' },
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

	// Check if user can see business report section
	const canSeeBusinessReport = canAccess('business_report', userRole, permissions) || 
		canAccess('expenses', userRole, permissions) || 
		canAccess('income', userRole, permissions) ||
		canAccess('due_book', userRole, permissions) ||
		canAccess('profit_loss', userRole, permissions) ||
		canAccess('notes', userRole, permissions);

	// Check if user can see catalog
	const canSeeCatalog = canAccess('catalog', userRole, permissions);

	// Check if user can see customization
	const canSeeCustomization = canAccess('customization', userRole, permissions);

	// Check if user can see settings
	const canSeeSettings = canAccess('settings', userRole, permissions);

	// Check if user can see admin control
	const canSeeAdminControl = canAccess('admin_control', userRole, permissions);

	const SidebarContent = () => (
		<>
			{/* Sidebar Header - Modern Dark */}
			<div className="p-5 border-b border-slate-700/50 flex items-center justify-between">
				{logo ? (
					<img src={normalizeImageUrl(logo)} alt="Admin Logo" className="h-8 md:h-10 object-contain" />
				) : (
					<h2 className="text-xl font-bold tracking-tight">
						<span className="text-white">Admin</span>
						<span className="text-indigo-400">Panel</span>
					</h2>
				)}
				<button onClick={onClose} className="lg:hidden p-2 rounded-lg transition hover:bg-slate-700 text-slate-400 hover:text-white">
					<X size={20} />
				</button>
			</div>

			{/* Sidebar Menu - Dark Modern */}
			<div className="p-3 space-y-1 flex-1 overflow-y-auto scrollbar-hide">
				<div className="text-[10px] font-semibold uppercase tracking-widest mb-3 px-3 mt-2 text-slate-500">Main Menu</div>
				{filteredMenuItems.map((item) => (
					<div
						key={item.id}
						onClick={() => { onNavigate && onNavigate(item.id); onClose && onClose(); }}
						className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 text-sm ${
							activePage === item.id 
								? 'bg-indigo-600 text-white font-medium shadow-lg shadow-indigo-600/30' 
								: 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
						}`}
					>
						{item.icon}
						<span>{item.label}</span>
					</div>
				))}

				{/* Business Report - Single Menu Item */}
				{canSeeBusinessReport && (
					<div
						onClick={() => { onNavigate && onNavigate('business_report_expense'); onClose && onClose(); }}
						className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 text-sm ${
							activePage?.startsWith('business_report_') 
								? 'bg-indigo-600 text-white font-medium shadow-lg shadow-indigo-600/30' 
								: 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
						}`}
					>
						<FileText size={18} />
						<span>Business Report</span>
					</div>
				)}

				{/* Catalog - Single Menu Item */}
				{canSeeCatalog && (
					<div
						onClick={() => { onNavigate && onNavigate('catalog_categories'); onClose && onClose(); }}
						className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 text-sm ${
							activePage?.startsWith('catalog_') 
								? 'bg-indigo-600 text-white font-medium shadow-lg shadow-indigo-600/30' 
								: 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
						}`}
					>
						<Layers size={18} />
						<span>Catalog</span>
					</div>
				)}

				{/* Customization Dropdown */}
				{canSeeCustomization && (
					<div>
						<div
							onClick={() => setIsCustomizationOpen(!isCustomizationOpen)}
							className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white"
						>
							<div className="flex items-center gap-3">
								<Sliders size={18} />
								<span>Customization</span>
							</div>
							{isCustomizationOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
						</div>

						{isCustomizationOpen && (
							<div className="pl-9 pr-2 space-y-1 mt-1">
								{customizationItems.map(item => (
									<div
										key={item.id}
										onClick={() => { onNavigate && onNavigate(item.id); onClose && onClose(); }}
										className={`py-2 px-3 rounded-md text-xs cursor-pointer transition ${
											activePage === item.id 
												? 'text-indigo-400 bg-indigo-500/10 border-l-2 border-indigo-400 font-medium' 
												: 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
										}`}
									>
										<div className="flex items-center gap-2">
											<div className={`w-1.5 h-1.5 rounded-full ${activePage === item.id ? 'bg-indigo-400' : 'bg-slate-600'}`}></div>
											{item.label}
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{/* System Section */}
				{(canSeeSettings || canSeeAdminControl) && (
					<>
						<div className="text-[10px] font-semibold uppercase tracking-widest mb-3 px-3 mt-6 text-slate-500">System</div>
						{canSeeSettings && (
							<div
								onClick={() => { onNavigate && onNavigate('settings'); onClose && onClose(); }}
								className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 text-sm ${
									activePage === 'settings' 
										? 'bg-indigo-600 text-white font-medium shadow-lg shadow-indigo-600/30' 
										: 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
								}`}
							>
								<Settings size={18} />
								<span>Settings</span>
							</div>
						)}
						{canSeeAdminControl && (
							<div
								onClick={() => { onNavigate && onNavigate('admin'); onClose && onClose(); }}
								className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 text-sm ${
									activePage === 'admin' 
										? 'bg-indigo-600 text-white font-medium shadow-lg shadow-indigo-600/30' 
										: 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
								}`}
							>
								<Shield size={18} />
								<span>Admin Control</span>
							</div>
						)}
					</>
				)}

				<div className="mt-8 pt-4 border-t border-slate-700/50"> 
					<div className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition text-sm text-slate-500 hover:text-slate-300">
						<LogOut size={18} />
						<span>More Options (Coming Soon)</span>
					</div>
				</div>
			</div>
		</>
	);

	return (
		<>
			{/* Desktop Sidebar - Modern Dark */}
			<div className="hidden lg:flex w-64 h-screen flex-col sticky top-0 scrollbar-hide" style={{ background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)' }}>
				<SidebarContent />
			</div>

			{/* Mobile Overlay */}
			{isOpen && (
				<div
					className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
					onClick={onClose}
				></div>
			)}

			{/* Mobile Sidebar - Modern Dark */}
			<div className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col p-0 shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)' }}>
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
	hasUnreadChat?: boolean,
	onNotificationClick?: (notification: AppNotification) => void
}> = ({ onSwitchView, user, onLogout, logo, onMenuClick, tenants, activeTenantId, onTenantChange, isTenantSwitching, onOpenChatCenter, hasUnreadChat, onNotificationClick }) => {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [isTenantMenuOpen, setIsTenantMenuOpen] = useState(false);
	const [isNotificationOpen, setIsNotificationOpen] = useState(false);
	const tenantMenuRef = useRef<HTMLDivElement | null>(null);
	const notificationRef = useRef<HTMLDivElement | null>(null);
	const prevUnreadCountRef = useRef<number>(-1); // Start with -1 to skip initial load
	const hasUserInteracted = useRef<boolean>(false);

	// Track user interaction to enable audio
	useEffect(() => {
		const enableAudio = () => {
			hasUserInteracted.current = true;
		};
		window.addEventListener('click', enableAudio, { once: true });
		window.addEventListener('keydown', enableAudio, { once: true });
		return () => {
			window.removeEventListener('click', enableAudio);
			window.removeEventListener('keydown', enableAudio);
		};
	}, []);

	// Notification hook - use activeTenantId from props with polling fallback
	const notificationResult = useNotifications({ 
		autoFetch: !!activeTenantId, 
		autoConnect: !!activeTenantId,
		limit: 20,
		tenantId: activeTenantId,
		pollingInterval: 15000, // Poll every 15 seconds as fallback for WebSocket
	});
	
	const notifications = activeTenantId ? notificationResult.notifications : [];
	const unreadCount = activeTenantId ? notificationResult.unreadCount : 0;
	const notificationsLoading = activeTenantId ? notificationResult.isLoading : false;
	const markAsRead = notificationResult.markAsRead;
	const markAllAsRead = notificationResult.markAllAsRead;
	const refreshNotifications = notificationResult.refresh;

	// Play sound when unread count increases (skip initial load)
	useEffect(() => {
		// Skip initial load (-1) and when count stays same or decreases
		if (prevUnreadCountRef.current >= 0 && unreadCount > prevUnreadCountRef.current) {
			console.log(`[Notification] New notifications! ${prevUnreadCountRef.current} -> ${unreadCount}`);
			// Play notification sound
			if (hasUserInteracted.current) {
				try {
					const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
					const audioContext = new AudioContextClass();
					if (audioContext.state === 'suspended') {
						void audioContext.resume();
					}
					const oscillator = audioContext.createOscillator();
					const gainNode = audioContext.createGain();
					oscillator.connect(gainNode);
					gainNode.connect(audioContext.destination);
					oscillator.type = 'sine';
					oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
					oscillator.frequency.setValueAtTime(1174.66, audioContext.currentTime + 0.15);
					gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
					gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
					oscillator.start(audioContext.currentTime);
					oscillator.stop(audioContext.currentTime + 0.4);
					console.log('[Notification] Sound played!');
				} catch (err) {
					console.warn('[Notification] Could not play sound:', err);
				}
			} else {
				console.log('[Notification] Skipping sound - no user interaction yet');
			}
		}
		prevUnreadCountRef.current = unreadCount;
	}, [unreadCount]);

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

	// Close notification dropdown on outside click
	useEffect(() => {
		if (!isNotificationOpen) return;
		const handleClickOutside = (event: MouseEvent) => {
			if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
				setIsNotificationOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [isNotificationOpen]);

	// Get notification icon based on type
	const getNotificationIcon = (type: AppNotification['type']) => {
		switch (type) {
			case 'order':
				return <ShoppingBag size={16} className="text-indigo-500" />;
			case 'review':
				return <Star size={16} className="text-amber-500" />;
			case 'customer':
				return <Users size={16} className="text-blue-500" />;
			case 'inventory':
				return <Package size={16} className="text-orange-500" />;
			case 'system':
				return <AlertCircle size={16} className="text-red-500" />;
			default:
				return <Bell size={16} className="text-slate-400" />;
		}
	};

	// Format time ago
	const formatTimeAgo = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;
		return date.toLocaleDateString();
	};

	// Handle notification click
	const handleNotificationClick = async (notification: AppNotification) => {
		if (!notification.isRead) {
			await markAsRead([notification._id]);
		}
		
		// Call optional callback
		if (onNotificationClick) {
			onNotificationClick(notification);
		}
		
		// Navigate based on notification type
		if (notification.type === 'order' && notification.data?.orderId) {
			// Close notification dropdown
			setIsNotificationOpen(false);
			// Navigate to orders page with the order ID
			// Dispatch custom event for navigation
			window.dispatchEvent(new CustomEvent('navigate-to-order', { 
				detail: { 
					orderId: notification.data.orderId,
					tenantId: notification.data?.tenantId || activeTenantId
				} 
			}));
		}
	};

	// Handle mark all as read
	const handleMarkAllAsRead = async () => {
		await markAllAsRead();
	};

	const formatLabel = (value?: string) => value ? value.charAt(0).toUpperCase() + value.slice(1) : '';

	const getStatusClasses = (status?: Tenant['status']) => {
		switch (status) {
			case 'active':
				return 'bg-emerald-100 text-emerald-700';
			case 'trialing':
				return 'bg-amber-100 text-amber-700';
			case 'suspended':
				return 'bg-yellow-100 text-yellow-700';
			case 'inactive':
			default:
				return 'bg-slate-100 text-slate-600';
		}
	};

	const getPlanClasses = (plan?: Tenant['plan']) => {
		switch (plan) {
			case 'growth':
				return 'bg-violet-100 text-violet-700';
			case 'enterprise':
				return 'bg-indigo-100 text-indigo-700';
			case 'starter':
			default:
				return 'bg-slate-100 text-slate-600';
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
			<p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Tenant</p>
			<p className="text-sm font-semibold truncate max-w-[200px] text-slate-900">
				{selectedTenant?.name || 'Select tenant'}
			</p>
			{selectedTenant && (
				<div className="flex items-center gap-2 mt-1">
					<span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getPlanClasses(selectedTenant.plan)}`}>
						{formatLabel(selectedTenant.plan)}
					</span>
					<span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getStatusClasses(selectedTenant.status)}`}>
						{formatLabel(selectedTenant.status)}
					</span>
				</div>
			)}
		</div>
	);

	return (
		<header className="h-16 flex items-center justify-between gap-4 px-4 md:px-6 sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
			<div className="flex items-center gap-3 md:gap-4">
				{/* Mobile Menu Button */}
				<button
					onClick={onMenuClick}
					className="md:hidden p-2 -ml-2 rounded-lg transition flex-shrink-0 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
					aria-label="Open menu"
				>
					<Menu size={20} />
				</button>

				{/* Logo/Brand - Visible on mobile only */}
				<div className="flex items-center gap-2 md:hidden flex-shrink-0">
					{/* logo */}
				</div>

				{/* Desktop Elements */}
				{selectedTenant?.subdomain ? (
					<a 
						href={`${window.location.protocol}//${selectedTenant.subdomain}.${import.meta.env.VITE_PRIMARY_DOMAIN || window.location.hostname.split('.').slice(-2).join('.')}`}
						target="_blank"
						rel="noopener noreferrer"
						className="hidden md:flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-lg transition flex-shrink-0 bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
					>
						<Globe size={14} />
						Go to Website
						<ExternalLink size={12} />
					</a>
				) : (
					<button 
						onClick={onSwitchView} 
						className="hidden md:flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-lg transition flex-shrink-0 bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
					>
						<Globe size={14} />
						Go to Website
					</button>
				)}

				<h2 className="text-lg font-bold tracking-tight hidden md:block flex-shrink-0 text-slate-800">Dashboard</h2>
				{canSwitchTenant && (
					<div className="relative hidden sm:block flex-shrink-0" ref={tenantMenuRef}>
						<button
							type="button"
							onClick={() => setIsTenantMenuOpen((prev) => !prev)}
							disabled={isTenantSwitching}
							className="group flex items-center justify-between gap-4 rounded-lg px-4 py-2 transition w-72 bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-white"
							style={{ 
								cursor: isTenantSwitching ? 'wait' : 'pointer'
							}}
							aria-haspopup="listbox"
							aria-expanded={isTenantMenuOpen}
						>
							{renderTenantSummary()}
							<div className="flex items-center gap-2 text-slate-400">
								{isTenantSwitching && <Loader2 size={18} className="animate-spin text-indigo-600" />}
								<ChevronDown size={16} className="transition" />
							</div>
						</button>
						{isTenantMenuOpen && (
							<div className="absolute right-0 top-full mt-2 w-[20rem] rounded-xl z-40 p-2 bg-white border border-slate-200 shadow-xl">
								{tenantOptions.map((tenant) => (
									<button
										key={tenant.id}
										type="button"
										onClick={() => handleTenantSelect(tenant.id)}
										disabled={isTenantSwitching}
										className={`w-full text-left rounded-lg px-3 py-2.5 transition flex items-start justify-between gap-3 ${tenant.id === activeTenantId ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-slate-50 border border-transparent'}`}
									>
										<div>
											<p className="text-sm font-semibold text-slate-900">{tenant.name}</p>
											<div className="flex items-center gap-2 mt-1">
												<span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getPlanClasses(tenant.plan)}`}>
													{formatLabel(tenant.plan)}
												</span>
												<span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getStatusClasses(tenant.status)}`}>
													{formatLabel(tenant.status)}
												</span>
											</div>
											<p className="text-xs mt-1 text-slate-500">{tenant?.subdomain || 'N/A'}</p>
										</div>
										{tenant.id === activeTenantId && <Check size={16} className="text-indigo-600" />}
									</button>
								))}
								{!tenantOptions.length && (
									<p className="text-sm px-3 py-2 text-slate-500">No tenants available</p>
								)}
							</div>
						)}
					</div>
				)}
			</div>

			<div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
				{canSwitchTenant && (
					<div className="sm:hidden w-full max-w-[140px]">
						<label htmlFor={mobileSelectId} className="text-[9px] uppercase font-semibold tracking-wider block mb-1 text-slate-500">Tenant</label>
						<div className="relative">
							<select
								id={mobileSelectId}
								value={selectedTenant?.id || ''}
								onChange={(event) => handleTenantSelect(event.target.value)}
								disabled={isTenantSwitching}
								className="appearance-none rounded-lg text-[10px] font-semibold px-2 py-1 shadow-sm focus:outline-none w-full pr-6 bg-white border border-slate-200 text-slate-700"
							>
								<option value="" disabled>Select tenant</option>
								{tenantOptions.map((tenant) => (
									<option key={tenant.id} value={tenant.id}>
										{tenant.name} • {formatLabel(tenant.plan)} ({formatLabel(tenant.status)})
									</option>
								))}
							</select>
							{isTenantSwitching ? (
								<Loader2 size={12} className="absolute right-2 top-1/2 -translate-y-1/2 animate-spin text-indigo-600" />
							) : (
								<ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
							)}
						</div>
					</div>
				)}
				<div className="text-[10px] font-semibold px-2.5 py-1 rounded-full hidden lg:block flex-shrink-0 bg-indigo-100 text-indigo-700">
					Admin
				</div>
				<div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
					{onOpenChatCenter && (
						<button
							onClick={onOpenChatCenter}
							type="button"
							className={`relative p-2 rounded-lg transition flex-shrink-0 ${hasUnreadChat ? 'bg-pink-50 text-pink-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
							aria-label="Open customer chat"
						>
							<MessageCircle size={18} className="md:w-5 md:h-5" />
							{hasUnreadChat && (
								<span className="absolute -top-1 -right-1 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full shadow bg-pink-500 text-white">
									New
								</span>
							)}
						</button>
					)}
					{/* Notification Bell with Dropdown */}
					<div className="relative flex-shrink-0" ref={notificationRef}>
						<button 
							onClick={() => setIsNotificationOpen(!isNotificationOpen)}
							className={`relative p-2 rounded-lg transition ${isNotificationOpen ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
							aria-label="Notifications"
						>
							<Bell size={18} className="md:w-5 md:h-5" />
							{unreadCount > 0 && (
								<span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold rounded-full px-1 bg-red-500 text-white border-2 border-white">
									{unreadCount > 99 ? '99+' : unreadCount}
								</span>
							)}
						</button>

						{/* Notification Dropdown */}
						{isNotificationOpen && (
							<div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl z-50 overflow-hidden bg-white border border-slate-200 shadow-xl">
								{/* Header */}
								<div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
									<div className="flex items-center gap-2">
										<Bell size={18} className="text-indigo-600" />
										<span className="font-semibold text-slate-900">Notifications</span>
										{unreadCount > 0 && (
											<span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">
												{unreadCount} new
											</span>
										)}
									</div>
									{unreadCount > 0 && (
										<button
											onClick={handleMarkAllAsRead}
											className="flex items-center gap-1 text-xs transition text-indigo-600 hover:text-indigo-700"
										>
											<CheckCheck size={14} />
											Mark all as read
										</button>
									)}
								</div>

								{/* Notification List */}
								<div className="max-h-[400px] overflow-y-auto">
									{notificationsLoading ? (
										<div className="flex items-center justify-center py-8">
											<Loader2 size={24} className="animate-spin text-indigo-600" />
										</div>
									) : notifications.length === 0 ? (
										<div className="flex flex-col items-center justify-center py-10 px-4 text-center">
											<div className="w-16 h-16 rounded-full flex items-center justify-center mb-3 bg-slate-100">
												<Bell size={28} className="text-slate-400" />
											</div>
											<p className="text-sm text-slate-600">No notifications yet</p>
											<p className="text-xs mt-1 text-slate-400">We'll notify you when something arrives</p>
										</div>
									) : (
										<div>
											{notifications.map((notification) => (
												<div
													key={notification._id}
													onClick={() => handleNotificationClick(notification)}
													className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition hover:bg-slate-50 ${!notification.isRead ? 'bg-indigo-50 border-l-2 border-indigo-500' : ''}`}
												>
													<div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5 bg-slate-100">
														{getNotificationIcon(notification.type)}
													</div>
													<div className="flex-1 min-w-0">
														<div className="flex items-start justify-between gap-2">
															<p className={`text-sm font-medium truncate ${!notification.isRead ? 'text-slate-900' : 'text-slate-500'}`}>
																{notification.title}
															</p>
															{!notification.isRead && (
																<span className="flex-shrink-0 w-2 h-2 rounded-full mt-1.5 bg-indigo-500"></span>
															)}
														</div>
														<p className="text-xs mt-0.5 line-clamp-2 text-slate-500">
															{notification.message}
														</p>
														<div className="flex items-center gap-1 mt-1.5 text-[10px] text-slate-400">
															<Clock size={10} />
															{formatTimeAgo(notification.createdAt)}
														</div>
													</div>
												</div>
											))}
										</div>
									)}
								</div>

								{/* Footer */}
								{notifications.length > 0 && (
									<div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
										<button 
											onClick={refreshNotifications}
											className="w-full text-center text-xs font-medium transition text-indigo-600 hover:text-indigo-700"
										>
											Refresh notifications
										</button>
									</div>
								)}
							</div>
						)}
					</div>

					<div className="relative flex-shrink-0">
						<div
							className="flex items-center gap-2 cursor-pointer"
							onClick={() => setIsDropdownOpen(!isDropdownOpen)}
						>
							<div className="w-7 h-7 md:w-9 md:h-9 rounded-full overflow-hidden border-2 border-indigo-200 flex-shrink-0 shadow-sm">
								<img src={user?.image || ''} alt="User Avatar" className="w-full h-full object-cover" />	
							</div>
						</div>

						{isDropdownOpen && (
							<div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
								<div className="p-4 border-b border-slate-100">
									{selectedTenant?.subdomain && (
										<a 
											href={`${window.location.protocol}//${selectedTenant.subdomain}.${import.meta.env.VITE_PRIMARY_DOMAIN || window.location.hostname.split('.').slice(-2).join('.')}`}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center gap-3 text-sm text-slate-700 hover:text-indigo-600 w-full p-2 rounded-lg hover:bg-slate-50 transition mb-1"
										>
											<ExternalLink size={14} /> Go to Website
										</a>
									)}
									<button
										onClick={onLogout}
										className="flex items-center gap-3 text-sm text-slate-700 hover:text-red-600 w-full p-2 rounded-lg hover:bg-slate-50 transition"
									>
										<LogOutIcon size={18} /> Logout
									</button>
								</div>
								<div className="bg-slate-50 p-4 text-center">
									<p className="text-xs text-slate-500 mb-1">(Login as {user?.username || 'admin'})</p>
									{logo ? (
										<img src={normalizeImageUrl(logo)} alt="Brand" className="h-6 mx-auto object-contain opacity-70" />
									) : (
										<div className="flex items-center justify-center gap-1 opacity-70">
											<div className="w-4 h-4 rounded-full border-2 border-indigo-500"></div>
											<span className="text-[10px] font-bold text-slate-600 tracking-widest uppercase">Admin Panel</span>
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
	const getCardStyle = (color: string) => {
		switch(color) {
			case 'pink':
				return 'bg-white border border-slate-200 hover:border-pink-300';
			case 'orange':
				return 'bg-white border border-slate-200 hover:border-orange-300';
			case 'green':
				return 'bg-white border border-slate-200 hover:border-emerald-300';
			case 'purple':
				return 'bg-white border border-slate-200 hover:border-violet-300';
			case 'lavender':
				return 'bg-white border border-slate-200 hover:border-violet-300';
			case 'cyan':
				return 'bg-white border border-slate-200 hover:border-cyan-300';
			case 'red':
				return 'bg-white border border-slate-200 hover:border-red-300';
			case 'blue':
				return 'bg-white border border-slate-200 hover:border-blue-300';
			case 'beige':
				return 'bg-white border border-slate-200 hover:border-amber-300';
			case 'gray':
				return 'bg-white border border-slate-200 hover:border-slate-300';
			default:
				return 'bg-white border border-slate-200 hover:border-indigo-300';
		}
	};

	const getIconStyle = (color: string) => {
		switch(color) {
			case 'pink':
				return 'bg-pink-100 text-pink-600';
			case 'orange':
				return 'bg-orange-100 text-orange-600';
			case 'green':
				return 'bg-emerald-100 text-emerald-600';
			case 'purple':
				return 'bg-violet-100 text-violet-600';
			case 'lavender':
				return 'bg-violet-100 text-violet-600';
			case 'cyan':
				return 'bg-cyan-100 text-cyan-600';
			case 'red':
				return 'bg-red-100 text-red-600';
			case 'blue':
				return 'bg-blue-100 text-blue-600';
			case 'beige':
				return 'bg-amber-100 text-amber-600';
			case 'gray':
				return 'bg-slate-100 text-slate-600';
			default:
				return 'bg-indigo-100 text-indigo-600';
		}
	};

	const getValueColor = (color: string) => {
		switch(color) {
			case 'pink':
			case 'red':
				return 'text-red-600';
			case 'orange':
				return 'text-orange-600';
			case 'green':
				return 'text-emerald-600';
			case 'purple':
				return 'text-violet-600';
			case 'lavender':
				return 'text-violet-600';
			case 'cyan':
			case 'blue':
				return 'text-blue-600';
			case 'beige':
				return 'text-amber-700';
			default:
				return 'text-slate-800';
		}
	};

	// Check if value is a currency (contains ৳ or starts with number)
	const isCurrency = typeof value === 'string' && (value.includes('৳') || value.includes('BDT'));
	const displayValue = isCurrency ? value : (typeof value === 'number' ? value : value);

	// Get background color for decorative element
	const getDecorativeBackground = (color: string) => {
		switch(color) {
			case 'pink': return 'bg-pink-100';
			case 'orange': return 'bg-orange-100';
			case 'green': return 'bg-emerald-100';
			case 'purple': return 'bg-violet-100';
			case 'lavender': return 'bg-violet-100';
			case 'cyan': return 'bg-cyan-100';
			case 'red': return 'bg-red-100';
			case 'blue': return 'bg-blue-100';
			case 'beige': return 'bg-amber-100';
			case 'gray': return 'bg-slate-100';
			default: return 'bg-indigo-100';
		}
	};

	return (
		<div className={`p-5 rounded-xl ${getCardStyle(colorClass)} relative overflow-hidden min-h-[120px] transition-all duration-200 hover:shadow-lg`}>
			{/* Icon */}
			<div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getIconStyle(colorClass)}`}>
				<div className="[&>svg]:w-5 [&>svg]:h-5">
					{icon}
				</div>
			</div>
			
			{/* Content */}
			<div className="mt-4">
				<p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{title}</p>
				<div className="flex items-center gap-2 mt-1">
					<span className={`text-2xl font-bold ${getValueColor(colorClass)}`}>
						{isCurrency ? displayValue : `৳${displayValue}`}
					</span>
				</div>
			</div>

			{/* Decorative element */}
			<div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-5 ${getDecorativeBackground(colorClass)}`}></div>
		</div>
	);
};
