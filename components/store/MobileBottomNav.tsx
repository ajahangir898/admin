import React, { useState, useRef, useEffect } from 'react';
import { User, Facebook, Truck, Phone, Home, MessageSquare, List, Menu, LogOut, ChevronRight } from 'lucide-react';
import { User as UserType, WebsiteConfig } from '../../types';

const buildWhatsAppLink = (rawNumber?: string | null) => {
    if (!rawNumber) return null;
    const sanitized = rawNumber.trim().replace(/[^0-9]/g, '');
    return sanitized ? `https://wa.me/${sanitized}` : null;
};

export interface MobileBottomNavProps {
    onHomeClick: () => void;
    onCartClick: () => void;
    onAccountClick: () => void;
    onChatClick?: () => void;
    cartCount?: number;
    websiteConfig?: WebsiteConfig;
    activeTab?: string;
    user?: UserType | null;
    onLogoutClick?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ 
    onHomeClick, 
    onCartClick, 
    onAccountClick, 
    onChatClick, 
    cartCount, 
    websiteConfig, 
    activeTab = 'home', 
    user, 
    onLogoutClick 
}) => {
    const style = websiteConfig?.bottomNavStyle || 'style1';
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
    const accountSectionRef = useRef<HTMLDivElement>(null);
    const customerLabel = user?.name || user?.displayName || user?.email || 'Guest shopper';
    const customerInitial = (customerLabel?.charAt(0) || 'G').toUpperCase();
    
    useEffect(() => {
        if (!isAccountMenuOpen) return;
        const handleOutsideClick = (event: MouseEvent) => {
            if (!accountSectionRef.current?.contains(event.target as Node)) {
                setIsAccountMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [isAccountMenuOpen]);
    
    useEffect(() => {
        if (style !== 'style1') {
            setIsAccountMenuOpen(false);
        }
    }, [style]);
    
    const handleAccountPrimaryAction = () => {
        setIsAccountMenuOpen(false);
        onAccountClick?.();
    };
    
    const handleAccountLogout = () => {
        if (!onLogoutClick) {
            setIsAccountMenuOpen(false);
            return;
        }
        setIsAccountMenuOpen(false);
        onLogoutClick();
    };
    
    const facebookLinkRaw = websiteConfig?.socialLinks?.find((link) => {
        const platformKey = (link.platform || '').toLowerCase();
        return platformKey.includes('facebook') || platformKey === 'fb';
    })?.url?.trim();
    
    const facebookLink = facebookLinkRaw
        ? (/^https?:\/\//i.test(facebookLinkRaw) ? facebookLinkRaw : `https://${facebookLinkRaw.replace(/^\/+/, '')}`)
        : null;
    
    const whatsappLink = buildWhatsAppLink(websiteConfig?.whatsappNumber);
    const chatEnabled = websiteConfig?.chatEnabled ?? true;
    const chatFallbackLink = !chatEnabled && websiteConfig?.chatWhatsAppFallback ? whatsappLink : null;

    // Style 2: Floating Center Home Button
    if (style === 'style2') {
        return (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 h-[70px] flex items-end px-2 md:hidden z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-1">
                {/* Left Side */}
                <div className="flex-1 flex justify-around items-center h-full pb-2 pr-10">
                    {chatEnabled && onChatClick ? (
                        <button onClick={onChatClick} className="flex flex-col items-center gap-1 text-gray-500 hover:text-pink-600 transition group">
                            <MessageSquare size={20} strokeWidth={1.5} />
                            <span className="text-[10px] font-medium">Chat</span>
                        </button>
                    ) : chatFallbackLink ? (
                        <a href={chatFallbackLink} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 text-gray-500 hover:text-pink-600 transition group">
                            <MessageSquare size={20} strokeWidth={1.5} />
                            <span className="text-[10px] font-medium">Chat</span>
                        </a>
                    ) : (
                        <button className="flex flex-col items-center gap-1 text-gray-400 transition group" type="button" disabled>
                            <MessageSquare size={20} strokeWidth={1.5} className="text-gray-400" />
                            <span className="text-[10px] font-medium">Chat</span>
                        </button>
                    )}
                    <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-pink-600 transition group">
                        <List size={22} strokeWidth={1.5} />
                        <span className="text-[10px] font-medium">Categories</span>
                    </button>
                </div>

                {/* Floating Home Button */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <button 
                        onClick={onHomeClick}
                        className="w-16 h-16 rounded-full bg-pink-100 text-pink-600 flex flex-col items-center justify-center border-[4px] border-white shadow-lg transform active:scale-95 transition-transform"
                    >
                        <Home size={24} strokeWidth={2.5} className="mb-0.5" />
                        <span className="text-[10px] font-bold">Home</span>
                    </button>
                </div>

                {/* Right Side */}
                <div className="flex-1 flex justify-around items-center h-full pb-2 pl-10">
                    <button onClick={onAccountClick} className={`flex flex-col items-center gap-1 transition group ${activeTab === 'account' ? 'text-pink-600' : 'text-gray-500 hover:text-pink-600'}`}>
                        <User size={22} strokeWidth={1.5} />
                        <span className="text-[10px] font-medium">Account</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-pink-600 transition group">
                        <Menu size={22} strokeWidth={1.5} />
                        <span className="text-[10px] font-medium">Menu</span>
                    </button>
                </div>
            </div>
        );
    }

    // Style 3: Clean 4 Columns
    if (style === 'style3') {
        return (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2.5 px-6 grid grid-cols-4 items-center md:hidden z-50 shadow-lg pb-safe">
                <button onClick={onHomeClick} className={`flex flex-col items-center gap-1 transition ${activeTab === 'home' ? 'text-pink-600' : 'text-gray-500'}`}>
                    <Home size={22} strokeWidth={2} className={activeTab === 'home' ? 'fill-pink-100' : ''} />
                    <span className="text-[10px] font-medium">Home</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-pink-600 transition">
                    <List size={22} strokeWidth={1.5} />
                    <span className="text-[10px] font-medium">Categories</span>
                </button>
                {chatEnabled && onChatClick ? (
                    <button onClick={onChatClick} className="flex flex-col items-center gap-1 text-gray-500 hover:text-pink-600 transition">
                        <MessageSquare size={22} strokeWidth={1.5} />
                        <span className="text-[10px] font-medium">Chat</span>
                    </button>
                ) : chatFallbackLink ? (
                    <a href={chatFallbackLink} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 text-gray-500 hover:text-pink-600 transition">
                        <MessageSquare size={22} strokeWidth={1.5} />
                        <span className="text-[10px] font-medium">Chat</span>
                    </a>
                ) : (
                    <button className="flex flex-col items-center gap-1 text-gray-400 transition" type="button" disabled>
                        <MessageSquare size={22} strokeWidth={1.5} className="text-gray-400" />
                        <span className="text-[10px] font-medium">Chat</span>
                    </button>
                )}
                <button onClick={onAccountClick} className={`flex flex-col items-center gap-1 transition ${activeTab === 'account' ? 'text-pink-600' : 'text-gray-500'}`}>
                    <User size={22} strokeWidth={1.5} />
                    <span className="text-[10px] font-medium">Account</span>
                </button>
            </div>
        );
    }

    // Style 1 (Default): 5 Columns (Messenger, Call, Home, Page, Account)
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-br from-blue-300/30 via-cyan-200/25 to-blue-200/30 backdrop-blur-xl border-t border-cyan-300/40 py-2 px-2 flex justify-between items-center md:hidden z-50 shadow-[0_-8px_32px_rgba(0,150,200,0.15),inset_0_1px_0_rgba(255,255,255,0.5)] pb-safe h-[60px]">
            {chatEnabled && onChatClick ? (
                <button onClick={onChatClick} className="flex flex-col items-center gap-1.5 transition w-1/5 group">
                    <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.3)] hover:shadow-[0_12px_48px_rgba(0,120,150,0.2),inset_0_1px_0_rgba(255,255,255,0.4)] transition group-hover:from-white/50 group-hover:to-white/25">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 group-hover:text-cyan-600"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/></svg>
                    </div>
                    <span className="text-[9px] font-semibold text-gray-700 group-hover:text-cyan-600">Chat</span>
                </button>
            ) : chatFallbackLink ? (
                <a href={chatFallbackLink} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1.5 transition w-1/5 group">
                    <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.3)] hover:shadow-[0_12px_48px_rgba(0,120,150,0.2),inset_0_1px_0_rgba(255,255,255,0.4)] transition group-hover:from-white/50 group-hover:to-white/25">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 group-hover:text-cyan-600"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/></svg>
                    </div>
                    <span className="text-[9px] font-semibold text-gray-700 group-hover:text-cyan-600">Chat</span>
                </a>
            ) : (
                <button className="flex flex-col items-center gap-1.5 transition w-1/5 group" type="button" disabled title="Live chat unavailable">
                    <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.05)]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/></svg>
                    </div>
                    <span className="text-[9px] font-semibold text-gray-500">Chat</span>
                </button>
            )}
      
            {whatsappLink ? (
                <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center gap-1.5 transition w-1/5 group"
                    aria-label="Chat on WhatsApp"
                >
                    <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.3)] hover:shadow-[0_12px_48px_rgba(0,120,150,0.2),inset_0_1px_0_rgba(255,255,255,0.4)] transition group-hover:from-white/50 group-hover:to-white/25">
                        <Phone size={20} strokeWidth={2} className="text-gray-600 group-hover:text-cyan-600" />
                    </div>
                    <span className="text-[9px] font-semibold text-gray-700 group-hover:text-cyan-600">Call</span>
                </a>
            ) : (
                <button className="flex flex-col items-center gap-1.5 transition w-1/5 group" title="WhatsApp number not configured" type="button" disabled>
                    <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.05)]">
                        <Phone size={20} strokeWidth={2} className="text-gray-400" />
                    </div>
                    <span className="text-[9px] font-semibold text-gray-500">Call</span>
                </button>
            )}
      
            <button onClick={onHomeClick} className="flex flex-col items-center gap-1.5 transition w-1/5 group">
                <div className="relative w-20 h-7 flex items-center justify-center">
                    <div className="relative z-10 flex items-center justify-center">
                        <img 
                            src="https://images.vexels.com/media/users/3/139729/isolated/svg/082dce112041515d39a27e2c124c3070.svg" 
                            alt="Home" 
                            className="w-12 h-12 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
                        />
                    </div>
                </div>
                <span className="text-[9px] font-bold text-blue-900 group-hover:text-blue-700">Home</span>
            </button>
      
            {facebookLink ? (
                <a
                    href={facebookLink}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook Page"
                    className="flex flex-col items-center gap-1.5 transition w-1/5 group"
                >
                    <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.3)] hover:shadow-[0_12px_48px_rgba(0,120,150,0.2),inset_0_1px_0_rgba(255,255,255,0.4)] transition group-hover:from-white/50 group-hover:to-white/25">
                        <Facebook size={20} strokeWidth={2} className="text-gray-600 group-hover:text-cyan-600" />
                    </div>
                    <span className="text-[9px] font-semibold text-gray-700 group-hover:text-cyan-600">Page</span>
                </a>
            ) : (
                <button className="flex flex-col items-center gap-1.5 transition w-1/5 group">
                    <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.3)] hover:shadow-[0_12px_48px_rgba(0,120,150,0.2),inset_0_1px_0_rgba(255,255,255,0.4)] transition group-hover:from-white/50 group-hover:to-white/25">
                        <Facebook size={20} strokeWidth={2} className="text-gray-600 group-hover:text-cyan-600" />
                    </div>
                    <span className="text-[9px] font-semibold text-gray-700 group-hover:text-cyan-600">Page</span>
                </button>
            )}
      
            <div ref={accountSectionRef} className="relative flex justify-center w-1/5">
                <button onClick={() => setIsAccountMenuOpen((prev) => !prev)} className={`flex flex-col items-center gap-1.5 transition w-full group`}>
                    <div className={`relative w-10 h-10 rounded-2xl backdrop-blur-md border flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.3)] transition ${ isAccountMenuOpen ? 'bg-gradient-to-br from-white/50 to-white/30 border-white/40 shadow-[0_12px_48px_rgba(0,120,150,0.25),inset_0_1px_0_rgba(255,255,255,0.4)]' : 'bg-gradient-to-br from-white/40 to-white/20 border-white/30 hover:shadow-[0_12px_48px_rgba(0,120,150,0.2),inset_0_1px_0_rgba(255,255,255,0.4)]'}`}>
                        <User size={20} strokeWidth={2} className={`${isAccountMenuOpen ? 'text-cyan-600' : 'text-gray-600 group-hover:text-cyan-600'}`} />
                    </div>
                    <span className="text-[9px] font-semibold text-gray-700 group-hover:text-cyan-600">Account</span>
                </button>
                {isAccountMenuOpen && (
                    <div className="absolute bottom-[70px] left-1/2 -translate-x-1/2 w-[230px] rounded-3xl border border-gray-100 bg-white shadow-[0_15px_45px_rgba(15,23,42,0.15)] p-4 z-[60]">
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-gray-100 rotate-45"></div>
                        {user ? (
                            <>
                                <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white flex items-center justify-center text-sm font-semibold">
                                        {customerInitial}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{customerLabel}</p>
                                        {user.email && <p className="text-xs text-gray-500 truncate">{user.email}</p>}
                                    </div>
                                </div>
                                <button onClick={handleAccountPrimaryAction} className="mt-3 w-full flex items-center justify-between rounded-2xl bg-gray-50 hover:bg-pink-50 text-gray-800 hover:text-pink-600 text-sm font-medium py-2.5 px-3 transition">
                                    <span>My Account</span>
                                    <ChevronRight size={16} />
                                </button>
                                <button onClick={handleAccountLogout} disabled={!onLogoutClick} className={`mt-2 w-full flex items-center justify-between rounded-2xl text-sm font-semibold py-2.5 px-3 transition ${onLogoutClick ? 'text-rose-600 hover:bg-rose-50' : 'text-gray-400 cursor-not-allowed'}`}>
                                    <span>Logout</span>
                                    <LogOut size={16} />
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="pb-3 border-b border-gray-100">
                                    <p className="text-sm text-gray-600">Sign in to track orders and manage your wishlist.</p>
                                </div>
                                <button onClick={handleAccountPrimaryAction} className="flex-1 btn-order py-1.5 px-2 text-sm">
                                    Sign in / Sign up
                                </button>
                                {chatFallbackLink && (
                                    <a href={chatFallbackLink} target="_blank" rel="noreferrer" className="mt-2 block text-center text-xs text-gray-500 hover:text-pink-600 transition">
                                        Need help? Chat on WhatsApp
                                    </a>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MobileBottomNav;
