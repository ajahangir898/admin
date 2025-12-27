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
    onMenuClick?: () => void;
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
    onMenuClick, 
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

    // Style 1 (Default): 5 Columns - Clean Modern Design
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-2 px-1 flex justify-around items-end md:hidden z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-safe h-[60px]">
            {/* Chat */}
            {chatEnabled && onChatClick ? (
                <button onClick={onChatClick} className="flex flex-col items-center gap-0.5 transition w-1/5 group">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                        <MessageSquare size={20} className="text-gray-600" />
                    </div>
                    <span className="text-[10px] font-medium text-gray-500">Chat</span>
                </button>
            ) : chatFallbackLink ? (
                <a href={chatFallbackLink} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-0.5 transition w-1/5 group">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                        <MessageSquare size={20} className="text-gray-600" />
                    </div>
                    <span className="text-[10px] font-medium text-gray-500">Chat</span>
                </a>
            ) : (
                <button className="flex flex-col items-center gap-0.5 transition w-1/5" type="button" disabled>
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                        <MessageSquare size={20} className="text-gray-300" />
                    </div>
                    <span className="text-[10px] font-medium text-gray-300">Chat</span>
                </button>
            )}

            {/* Call */}
            {whatsappLink ? (
                <a href={whatsappLink} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-0.5 transition w-1/5 group">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                        <Phone size={20} className="text-gray-600" />
                    </div>
                    <span className="text-[10px] font-medium text-gray-500">Call</span>
                </a>
            ) : (
                <button className="flex flex-col items-center gap-0.5 transition w-1/5" type="button" disabled>
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                        <Phone size={20} className="text-gray-300" />
                    </div>
                    <span className="text-[10px] font-medium text-gray-300">Call</span>
                </button>
            )}

            {/* Home - Center Elevated */}
            <button onClick={onHomeClick} className="flex flex-col items-center transition w-1/5 group -mt-5">
                <div className="w-14 h-14 rounded-full bg-theme-primary flex items-center justify-center shadow-lg shadow-theme-primary/30 group-hover:shadow-theme-primary/50 group-active:scale-95 transition-all border-4 border-white">
                    <Home size={24} strokeWidth={2.5} className="text-white" />
                </div>
                <span className="text-[10px] font-bold text-theme-primary mt-0.5">Home</span>
            </button>

            {/* Facebook Page */}
            {facebookLink ? (
                <a href={facebookLink} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-0.5 transition w-1/5 group">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                        <Facebook size={20} className="text-gray-600" />
                    </div>
                    <span className="text-[10px] font-medium text-gray-500">Page</span>
                </a>
            ) : (
                <button className="flex flex-col items-center gap-0.5 transition w-1/5" type="button" disabled>
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                        <Facebook size={20} className="text-gray-300" />
                    </div>
                    <span className="text-[10px] font-medium text-gray-300">Page</span>
                </button>
            )}

            {/* Menu */}
            <div ref={accountSectionRef} className="relative flex justify-center w-1/5">
                <button onClick={onMenuClick} className="flex flex-col items-center gap-0.5 transition w-full group">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                        <Menu size={20} className="text-gray-600" />
                    </div>
                    <span className="text-[10px] font-medium text-gray-500">Menu</span>
                </button>
            </div>
        </div>
    );
};

export default MobileBottomNav;
