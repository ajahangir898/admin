
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
					<img src={logo} alt="Admin Logo" className="h-8 md:h-10 object-contain" />
				) : (
					<h2 className="text-2xl font-black tracking-widest">
						<span style={{ color: 'var(--admin-text, white)' }}>GADGET</span>
						<span style={{ color: 'var(--admin-accent-secondary, #ef4444)' }}>SHOB</span>
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
								<img src={user?.image || 'data:image/webp;base64,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'} alt="Admin" className="w-full h-full object-cover" />
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
