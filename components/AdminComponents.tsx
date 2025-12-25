
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
			<div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--admin-border, rgba(255,255,255,0.1))', background: 'var(--admin-sidebar-header, linear-gradient(to right, #0f0f1a, #061410, #1a0b0f))' }}>
				{logo ? (
					<img src={normalizeImageUrl(logo)} alt="Admin Logo" className="h-8 md:h-10 object-contain" />
				) : (
					<h2 className="text-2xl font-black tracking-widest">
						<span style={{ color: 'var(--admin-text, white, #054f77ff)' }}>YOUR</span>
						<span style={{ color: 'var(--admin-accent-secondary, #054f77ff)' }}>SHOP</span>
					</h2>
				)}
				<button onClick={onClose} className="lg:hidden p-2 rounded-full transition" style={{ color: 'var(--admin-text-muted, #cbd5e1)' }}>
					<X size={20} />
				</button>
			</div>

			<div className="p-4 space-y-1 flex-1 overflow-y-auto scrollbar-hide" style={{ background: 'var(--admin-bg, #050509)', color: 'var(--admin-text, #e2e8f0)' }}>
				<div className="text-[10px] font-semibold uppercase tracking-[0.4em] mb-3 px-3 mt-2" style={{ color: 'var(--admin-accent, #34d399)' }}>Main Menu</div>
				{filteredMenuItems.map((item) => (
					<div
						key={item.id}
						onClick={() => { onNavigate && onNavigate(item.id); onClose && onClose(); }}
						className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 text-sm ${
							activePage === item.id ? 'font-semibold' : ''
						}`}
						style={activePage === item.id ? {
							background: 'var(--admin-menu-active-bg, linear-gradient(to right, rgba(220,38,38,0.2), rgba(239,68,68,0.1), rgba(16,185,129,0.2)))',
							color: 'var(--admin-text, white)',
							border: '1px solid var(--admin-accent, rgba(16,185,129,0.4))',
							boxShadow: 'var(--admin-menu-shadow, 0 10px 15px -3px rgba(6,78,59,0.3))'
						} : {
							color: 'var(--admin-text-muted, #94a3b8)'
						}}
					>
						{item.icon}
						<span>{item.label}</span>
					</div>
				))}

				{/* Business Report - Single Menu Item */}
				{canSeeBusinessReport && (
					<div
						onClick={() => { onNavigate && onNavigate('business_report_expense'); onClose && onClose(); }}
						className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 text-sm ${
							activePage?.startsWith('business_report_') ? 'font-semibold' : ''
						}`}
						style={activePage?.startsWith('business_report_') ? {
							background: 'var(--admin-menu-active-bg, linear-gradient(to right, rgba(220,38,38,0.2), rgba(239,68,68,0.1), rgba(16,185,129,0.2)))',
							color: 'var(--admin-text, white)',
							border: '1px solid var(--admin-accent, rgba(16,185,129,0.4))',
							boxShadow: 'var(--admin-menu-shadow, 0 10px 15px -3px rgba(6,78,59,0.3))'
						} : {
							color: 'var(--admin-text-muted, #94a3b8)'
						}}
					>
						<FileText size={18} />
						<span>Business Report</span>
					</div>
				)}

				{/* Catalog - Single Menu Item */}
				{canSeeCatalog && (
					<div
						onClick={() => { onNavigate && onNavigate('catalog_categories'); onClose && onClose(); }}
						className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 text-sm ${
							activePage?.startsWith('catalog_') ? 'font-semibold' : ''
						}`}
						style={activePage?.startsWith('catalog_') ? {
							background: 'var(--admin-menu-active-bg, linear-gradient(to right, rgba(220,38,38,0.2), rgba(239,68,68,0.1), rgba(16,185,129,0.2)))',
							color: 'var(--admin-text, white)',
							border: '1px solid var(--admin-accent, rgba(16,185,129,0.4))',
							boxShadow: 'var(--admin-menu-shadow, 0 10px 15px -3px rgba(6,78,59,0.3))'
						} : {
							color: 'var(--admin-text-muted, #94a3b8)'
						}}
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
							className="flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 text-sm"
							style={{ color: 'var(--admin-text-muted, #94a3b8)', border: '1px solid var(--admin-border, rgba(255,255,255,0.05))' }}
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
										className={`py-2 px-3 rounded-lg text-xs cursor-pointer transition ${activePage === item.id ? 'font-semibold' : ''}`}
										style={activePage === item.id ? {
											color: 'var(--admin-accent-light, #a7f3d0)',
											background: 'var(--admin-accent-bg, rgba(16,185,129,0.05))',
											border: '1px solid var(--admin-accent, rgba(16,185,129,0.3))'
										} : {
											color: 'var(--admin-text-muted, #64748b)'
										}}
									>
										<div className="flex items-center gap-2">
											<div className="w-1.5 h-1.5 rounded-full" style={{ background: activePage === item.id ? 'var(--admin-accent, #34d399)' : 'var(--admin-border, rgba(255,255,255,0.3))' }}></div>
											{item.label}
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{/* System Section - Only show if user has access to settings or admin control */}
				{(canSeeSettings || canSeeAdminControl) && (
					<>
						<div className="text-[10px] font-semibold uppercase tracking-[0.4em] mb-3 px-3 mt-6" style={{ color: 'var(--admin-accent, #34d399)' }}>System</div>
						{canSeeSettings && (
							<div
								onClick={() => { onNavigate && onNavigate('settings'); onClose && onClose(); }}
								className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 text-sm ${activePage === 'settings' ? 'font-semibold' : ''}`}
								style={activePage === 'settings' ? {
									background: 'var(--admin-menu-active-bg, linear-gradient(to right, rgba(220,38,38,0.2), rgba(239,68,68,0.1), rgba(16,185,129,0.2)))',
									color: 'var(--admin-text, white)',
									border: '1px solid var(--admin-accent, rgba(16,185,129,0.4))'
								} : {
									color: 'var(--admin-text-muted, #94a3b8)'
								}}
							>
								<Settings size={18} />
								<span>Settings</span>
							</div>
						)}
						{canSeeAdminControl && (
							<div
								onClick={() => { onNavigate && onNavigate('admin'); onClose && onClose(); }}
								className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 text-sm ${activePage === 'admin' ? 'font-semibold' : ''}`}
								style={activePage === 'admin' ? {
									background: 'var(--admin-menu-active-bg, linear-gradient(to right, rgba(220,38,38,0.2), rgba(239,68,68,0.1), rgba(16,185,129,0.2)))',
									color: 'var(--admin-text, white)',
									border: '1px solid var(--admin-accent, rgba(16,185,129,0.4))'
								} : {
									color: 'var(--admin-text-muted, #94a3b8)'
								}}
							>
								<Shield size={18} />
								<span>Admin Control</span>
							</div>
						)}
					</>
				)}

				<div className="mt-8 pt-4" style={{ borderTop: '1px solid var(--admin-border, rgba(255,255,255,0.1))' }}> 
					<div className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition text-sm" style={{ color: 'var(--admin-accent-light, #a7f3d0)' }}>
						<LogOut size={18} />
						<span>More Options (Coming Soon)</span>
					</div>
				</div>
			</div>
		</>
	);

	return (
		<>
			<div className="hidden lg:flex w-64 h-screen flex-col sticky top-0 scrollbar-hide" style={{ background: 'var(--admin-bg, #050509)', borderRight: '1px solid var(--admin-border, rgba(16,185,129,0.1))' }}>
				<SidebarContent />
			</div>

			{isOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
					onClick={onClose}
				></div>
			)}

			<div className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col p-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ background: 'var(--admin-bg, #050509)', boxShadow: 'var(--admin-shadow, 0 25px 50px -12px rgba(6,78,59,0.3))', borderRight: '1px solid var(--admin-border, rgba(16,185,129,0.2))' }}>
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
				return <ShoppingBag size={16} className="text-emerald-400" />;
			case 'review':
				return <Star size={16} className="text-amber-400" />;
			case 'customer':
				return <Users size={16} className="text-blue-400" />;
			case 'inventory':
				return <Package size={16} className="text-orange-400" />;
			case 'system':
				return <AlertCircle size={16} className="text-red-400" />;
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
			<p className="text-[10px] uppercase tracking-[0.4em] font-semibold" style={{ color: 'var(--admin-accent-light, #6ee7b7)' }}>Tenant</p>
			<p className="text-sm font-semibold truncate max-w-[200px]" style={{ color: 'var(--admin-text, white)' }}>
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
		<header className="h-16 flex items-center justify-between gap-4 px-4 md:px-6 sticky top-0 z-30" style={{ background: 'var(--admin-header-bg, linear-gradient(to right, rgba(9,8,15,0.95), rgba(7,19,13,0.95), rgba(8,12,10,0.95)))', borderBottom: '1px solid var(--admin-border, rgba(255,255,255,0.05))', boxShadow: 'var(--admin-header-shadow, 0 10px 40px rgba(0,0,0,0.45))', color: 'var(--admin-text, white)' }}>
			<div className="flex items-center gap-3 md:gap-4">
				{/* Mobile Menu Button */}
				<button
					onClick={onMenuClick}
					className="md:hidden p-2 -ml-2 rounded-lg transition flex-shrink-0"
					aria-label="Open menu"
					style={{ color: 'var(--admin-accent-light, #a7f3d0)' }}
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
        className="hidden md:flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full transition flex-shrink-0"
        style={{ color: 'var(--admin-text, white)', background: 'var(--admin-button-gradient, linear-gradient(to right, #dc2626, #ef4444, #10b981))', border: '1px solid var(--admin-accent, rgba(52,211,153,0.4))', boxShadow: 'var(--admin-button-shadow, 0 10px 15px -3px rgba(6,78,59,0.3))' }}
    >
        <Globe size={14} />
        Go to Website
        <ExternalLink size={12} />
    </a>
) : (
    <button 
        onClick={onSwitchView} 
        className="hidden md:flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full transition flex-shrink-0"
        style={{ color: 'var(--admin-text, white)', background: 'var(--admin-button-gradient, linear-gradient(to right, #dc2626, #ef4444, #10b981))', border: '1px solid var(--admin-accent, rgba(52,211,153,0.4))', boxShadow: 'var(--admin-button-shadow, 0 10px 15px -3px rgba(6,78,59,0.3))' }}
    >
        <Globe size={14} />
        Go to Website
    </button>
)}

				<h2 className="text-xl font-black tracking-wide hidden md:block flex-shrink-0" style={{ color: 'var(--admin-accent-light, #a7f3d0)' }}>Dashboard</h2>
				{canSwitchTenant && (
					<div className="relative hidden sm:block flex-shrink-0" ref={tenantMenuRef}>
						<button
							type="button"
							onClick={() => setIsTenantMenuOpen((prev) => !prev)}
							disabled={isTenantSwitching}
							className="group flex items-center justify-between gap-4 rounded-2xl px-4 py-2 shadow-lg transition w-72"
							style={{ 
								background: isTenantSwitching ? 'var(--admin-input-bg-disabled, rgba(255,255,255,0.05))' : 'var(--admin-input-bg, linear-gradient(to right, #120f1f, #07140e, #1a1427))', 
								border: '1px solid var(--admin-border, rgba(255,255,255,0.1))',
								cursor: isTenantSwitching ? 'wait' : 'pointer'
							}}
							aria-haspopup="listbox"
							aria-expanded={isTenantMenuOpen}
						>
							{renderTenantSummary()}
							<div className="flex items-center gap-2" style={{ color: 'var(--admin-accent-light, #a7f3d0)' }}>
								{isTenantSwitching && <Loader2 size={18} className="animate-spin" style={{ color: 'var(--admin-accent, #34d399)' }} />}
								<ChevronDown size={16} className="transition" />
							</div>
						</button>
						{isTenantMenuOpen && (
							<div className="absolute right-0 top-full mt-2 w-[20rem] rounded-2xl z-40 p-2" style={{ background: 'var(--admin-dropdown-bg, linear-gradient(to bottom right, #140f1f, #07130c, #1b0f12))', border: '1px solid var(--admin-border, rgba(16,185,129,0.2))', boxShadow: 'var(--admin-dropdown-shadow, 0 25px 50px -12px rgba(6,78,59,0.4))' }}>
								{tenantOptions.map((tenant) => (
									<button
										key={tenant.id}
										type="button"
										onClick={() => handleTenantSelect(tenant.id)}
										disabled={isTenantSwitching}
										className="w-full text-left rounded-xl px-3 py-2.5 transition flex items-start justify-between gap-3"
										style={tenant.id === activeTenantId ? {
											background: 'var(--admin-menu-active-bg, linear-gradient(to right, rgba(220,38,38,0.2), rgba(239,68,68,0.1), rgba(16,185,129,0.2)))',
											border: '1px solid var(--admin-accent, rgba(16,185,129,0.4))'
										} : {
											border: '1px solid transparent'
										}}
									>
										<div>
											<p className="text-sm font-semibold" style={{ color: 'var(--admin-text, white)' }}>{tenant.name}</p>
											<div className="flex items-center gap-2 mt-1">
												<span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${getPlanClasses(tenant.plan)}`}>
													{formatLabel(tenant.plan)}
												</span>
												<span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${getStatusClasses(tenant.status)}`}>
													{formatLabel(tenant.status)}
												</span>
											</div>
											<p className="text-xs mt-1" style={{ color: 'var(--admin-text-muted, #94a3b8)' }}>{tenant.subdomain}</p>
										</div>
										{tenant.id === activeTenantId && <Check size={16} style={{ color: 'var(--admin-accent, #34d399)' }} />}
									</button>
								))}
								{!tenantOptions.length && (
									<p className="text-sm px-3 py-2" style={{ color: 'var(--admin-text-muted, #6b7280)' }}>No tenants available</p>
								)}
							</div>
						)}
					</div>
				)}
			</div>

			<div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
				{canSwitchTenant && (
					<div className="sm:hidden w-full max-w-[140px]">
						<label htmlFor={mobileSelectId} className="text-[9px] uppercase font-semibold tracking-wider block mb-1" style={{ color: 'var(--admin-accent-light, #6ee7b7)' }}>Tenant</label>
						<div className="relative">
							<select
								id={mobileSelectId}
								value={selectedTenant?.id || ''}
								onChange={(event) => handleTenantSelect(event.target.value)}
								disabled={isTenantSwitching}
								className="appearance-none rounded-lg text-[10px] font-semibold px-2 py-1 shadow-sm focus:outline-none w-full pr-6"
								style={{ background: 'var(--admin-input-bg, white)', border: '1px solid var(--admin-border, #e5e7eb)', color: 'var(--admin-input-text, #374151)' }}
							>
								<option value="" disabled>Select tenant</option>
								{tenantOptions.map((tenant) => (
									<option key={tenant.id} value={tenant.id}>
										{tenant.name} • {formatLabel(tenant.plan)} ({formatLabel(tenant.status)})
									</option>
								))}
							</select>
							{isTenantSwitching ? (
								<Loader2 size={12} className="absolute right-2 top-1/2 -translate-y-1/2 animate-spin" style={{ color: 'var(--admin-accent, #10b981)' }} />
							) : (
								<ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--admin-text-muted, #9ca3af)' }} />
							)}
						</div>
					</div>
				)}
				<div className="text-[10px] font-bold px-2 py-0.5 rounded hidden lg:block animate-pulse flex-shrink-0" style={{ background: 'var(--admin-badge-bg, linear-gradient(to right, rgba(220,38,38,0.2), rgba(16,185,129,0.2)))', border: '1px solid var(--admin-accent, rgba(52,211,153,0.3))', color: 'var(--admin-accent-light, #d1fae5)' }}>
					Admin
				</div>
				<div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
					{onOpenChatCenter && (
						<button
							onClick={onOpenChatCenter}
							type="button"
							className="relative p-1.5 md:p-2 rounded-full transition flex-shrink-0"
							style={hasUnreadChat ? { color: 'var(--admin-notification-unread, #f9a8d4)', background: 'var(--admin-notification-unread-bg, rgba(236,72,153,0.1))', boxShadow: '0 10px 15px -3px rgba(236,72,153,0.3)' } : { color: 'var(--admin-accent-light, #a7f3d0)' }}
							aria-label="Open customer chat"
						>
							<MessageCircle size={18} className="md:w-5 md:h-5" />
							{hasUnreadChat && (
								<span className="absolute -top-1 -right-1 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full shadow" style={{ background: 'var(--admin-notification-badge, #ec4899)', color: 'white' }}>
									New
								</span>
							)}
						</button>
					)}
					{/* Notification Bell with Dropdown */}
					<div className="relative flex-shrink-0" ref={notificationRef}>
						<button 
							onClick={() => setIsNotificationOpen(!isNotificationOpen)}
							className="relative p-1.5 md:p-2 rounded-full transition"
							style={isNotificationOpen ? { background: 'var(--admin-accent-bg, rgba(16,185,129,0.2))', color: 'var(--admin-accent-light, #6ee7b7)' } : { color: 'var(--admin-accent-light, #a7f3d0)' }}
							aria-label="Notifications"
						>
							<Bell size={18} className="md:w-5 md:h-5" />
							{unreadCount > 0 && (
								<span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold rounded-full px-1" style={{ background: 'var(--admin-danger, #ef4444)', color: 'white', border: '2px solid var(--admin-header-bg, #09080f)' }}>
									{unreadCount > 99 ? '99+' : unreadCount}
								</span>
							)}
						</button>

						{/* Notification Dropdown */}
						{isNotificationOpen && (
							<div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl z-50 overflow-hidden" style={{ background: 'var(--admin-dropdown-bg, linear-gradient(to bottom right, #140f1f, #07130c, #1b0f12))', border: '1px solid var(--admin-border, rgba(16,185,129,0.2))', boxShadow: 'var(--admin-dropdown-shadow, 0 25px 50px -12px rgba(6,78,59,0.4))' }}>
								{/* Header */}
								<div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--admin-border, rgba(255,255,255,0.1))', background: 'rgba(0,0,0,0.2)' }}>
									<div className="flex items-center gap-2">
										<Bell size={18} style={{ color: 'var(--admin-accent, #34d399)' }} />
										<span className="font-semibold" style={{ color: 'var(--admin-text, white)' }}>Notifications</span>
										{unreadCount > 0 && (
											<span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--admin-danger-bg, rgba(239,68,68,0.2))', color: 'var(--admin-danger-light, #fca5a5)' }}>
												{unreadCount} new
											</span>
										)}
									</div>
									{unreadCount > 0 && (
										<button
											onClick={handleMarkAllAsRead}
											className="flex items-center gap-1 text-xs transition"
											style={{ color: 'var(--admin-accent, #34d399)' }}
										>
											<CheckCheck size={14} />
											Mark all read
										</button>
									)}
								</div>

								{/* Notification List */}
								<div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-track-transparent" style={{ scrollbarColor: 'var(--admin-accent, rgba(16,185,129,0.2)) transparent' }}>
									{notificationsLoading ? (
										<div className="flex items-center justify-center py-8">
											<Loader2 size={24} className="animate-spin" style={{ color: 'var(--admin-accent, #34d399)' }} />
										</div>
									) : notifications.length === 0 ? (
										<div className="flex flex-col items-center justify-center py-10 px-4 text-center">
											<div className="w-16 h-16 rounded-full flex items-center justify-center mb-3" style={{ background: 'var(--admin-accent-bg, rgba(16,185,129,0.1))' }}>
												<Bell size={28} style={{ color: 'var(--admin-accent, rgba(16,185,129,0.5))' }} />
											</div>
											<p className="text-sm" style={{ color: 'var(--admin-text-muted, #94a3b8)' }}>No notifications yet</p>
											<p className="text-xs mt-1" style={{ color: 'var(--admin-text-muted, #64748b)' }}>We'll notify you when something arrives</p>
										</div>
									) : (
										<div style={{ borderColor: 'var(--admin-border, rgba(255,255,255,0.05))' }}>
											{notifications.map((notification) => (
												<div
													key={notification._id}
													onClick={() => handleNotificationClick(notification)}
													className="flex items-start gap-3 px-4 py-3 cursor-pointer transition"
													style={!notification.isRead ? { background: 'var(--admin-accent-bg, rgba(16,185,129,0.05))', borderLeft: '2px solid var(--admin-accent, #34d399)' } : {}}
												>
													<div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5" style={{ background: 'var(--admin-input-bg, rgba(255,255,255,0.05))' }}>
														{getNotificationIcon(notification.type)}
													</div>
													<div className="flex-1 min-w-0">
														<div className="flex items-start justify-between gap-2">
															<p className="text-sm font-medium truncate" style={{ color: !notification.isRead ? 'var(--admin-text, white)' : 'var(--admin-text-muted, #cbd5e1)' }}>
																{notification.title}
															</p>
															{!notification.isRead && (
																<span className="flex-shrink-0 w-2 h-2 rounded-full mt-1.5" style={{ background: 'var(--admin-accent, #34d399)' }}></span>
															)}
														</div>
														<p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--admin-text-muted, #94a3b8)' }}>
															{notification.message}
														</p>
														<div className="flex items-center gap-1 mt-1.5 text-[10px]" style={{ color: 'var(--admin-text-muted, #64748b)' }}>
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
									<div className="px-4 py-3" style={{ borderTop: '1px solid var(--admin-border, rgba(255,255,255,0.1))', background: 'rgba(0,0,0,0.2)' }}>
										<button 
											onClick={refreshNotifications}
											className="w-full text-center text-xs font-medium transition"
											style={{ color: 'var(--admin-accent, #34d399)' }}
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
							<div className="w-7 h-7 md:w-9 md:h-9 rounded-full overflow-hidden border-2 border-emerald-400/70 flex-shrink-0">
								<img src={user?.image || ''} alt="User Avatar" className="w-full h-full object-cover" />	
							</div>
						</div>

						{isDropdownOpen && (
							<div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
								<div className="p-4 border-b border-gray-50">
									<button className="flex items-center gap-3 text-sm text-gray-700 hover:text-green-600 w-full p-2 rounded hover:bg-gray-50 transition mb-1">
								
	    <a 
        href={`${window.location.protocol}//${selectedTenant.subdomain}.${import.meta.env.VITE_PRIMARY_DOMAIN || window.location.hostname.split('.').slice(-2).join('.')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 text-sm text-gray-700 hover:text-orange-600 w-full p-2 rounded hover:bg-gray-50 transition"
    >
      <ExternalLink size={14} />  Go to Website
    </a>
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
										<img src={normalizeImageUrl(logo)} alt="Brand" className="h-6 mx-auto object-contain opacity-70" />
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
	const getCardStyle = (color: string) => {
		if (['green', 'blue', 'teal', 'primary'].includes(color)) {
			return { background: 'var(--admin-card-primary, linear-gradient(to bottom right, #062017, #05160f, #0c1411))', color: 'var(--admin-accent-light, #d1fae5)', border: '1px solid var(--admin-accent, rgba(16,185,129,0.3))' };
		}
		if (['purple', 'primary-strong'].includes(color)) {
			return { background: 'var(--admin-card-primary-strong, linear-gradient(to bottom right, #0f2e22, #041911, #130c11))', color: 'var(--admin-accent-light, #d1fae5)', border: '1px solid var(--admin-accent, rgba(52,211,153,0.4))' };
		}
		if (['orange', 'pink', 'red', 'cyan', 'secondary'].includes(color)) {
			return { background: 'var(--admin-card-secondary, linear-gradient(to bottom right, #2b0a0d, #1a0507, #120508))', color: 'var(--admin-danger-light, #fecaca)', border: '1px solid var(--admin-danger, rgba(239,68,68,0.3))' };
		}
		if (color === 'secondary-strong') {
			return { background: 'var(--admin-card-secondary-strong, linear-gradient(to bottom right, #360f12, #200608, #150407))', color: 'var(--admin-danger-light, #fecaca)', border: '1px solid var(--admin-danger, rgba(239,68,68,0.4))' };
		}
		return { background: 'var(--admin-card-neutral, #0b0f12)', color: 'var(--admin-text, #e2e8f0)', border: '1px solid var(--admin-border, rgba(255,255,255,0.05))' };
	};

	return (
		<div className="p-4 rounded-xl transition-all duration-300 hover:shadow-lg flex flex-col justify-between h-32 relative overflow-hidden group" style={getCardStyle(colorClass)}>
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
