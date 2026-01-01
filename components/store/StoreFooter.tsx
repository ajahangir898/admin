import React from 'react';
import { Facebook, Instagram, Twitter, Linkedin, Youtube, Phone, Mail, MapPin, MessageCircle, Globe, ArrowRight } from 'lucide-react';
import { WebsiteConfig } from '../../types';
import { normalizeImageUrl } from '../../utils/imageUrlHelper';

const buildWhatsAppLink = (rawNumber?: string | null) => {
    if (!rawNumber) return null;
    const sanitized = rawNumber.trim().replace(/[^0-9]/g, '');
    return sanitized ? `https://wa.me/${sanitized}` : null;
};

export interface StoreFooterProps {
    websiteConfig?: WebsiteConfig;
    logo?: string | null;
    onOpenChat?: () => void;
}

export const StoreFooter: React.FC<StoreFooterProps> = ({ websiteConfig, logo, onOpenChat }) => {
    const resolveSocialIcon = (platform?: string): React.ReactNode => {
        const key = platform?.toLowerCase() || '';
        if (key.includes('facebook') || key === 'fb') return <Facebook size={18} className="text-current" />;
        if (key.includes('instagram') || key === 'ig') return <Instagram size={18} className="text-current" />;
        if (key.includes('twitter') || key === 'x') return <Twitter size={18} className="text-current" />;
        if (key.includes('youtube') || key.includes('yt')) return <Youtube size={18} className="text-current" />;
        if (key.includes('linkedin')) return <Linkedin size={18} className="text-current" />;
        if (key.includes('whatsapp') || key.includes('messenger')) return <MessageCircle size={18} className="text-current" />;
        return <Globe size={18} className="text-current" />;
    };
    
    const whatsappLink = buildWhatsAppLink(websiteConfig?.whatsappNumber);
    const chatEnabled = websiteConfig?.chatEnabled ?? true;
    const chatFallbackLink = !chatEnabled && websiteConfig?.chatWhatsAppFallback ? whatsappLink : null;
    const resolvedFooterLogo = websiteConfig?.footerLogo || websiteConfig?.favicon || logo || null;

    const floatingChatButton = (() => {
        const baseClasses = 'hidden md:flex fixed bottom-8 right-8 w-16 h-16 items-center justify-center rounded-[26px] text-white shadow-[0_18px_35px_rgba(255,122,85,0.35)] border border-white/30 transition-transform duration-200 hover:-translate-y-1 z-40';
        const bubbleContent = (
            <span className="relative flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-white opacity-90" />
                <span className="w-2 h-2 rounded-full bg-white opacity-80" />
                <span className="w-2 h-2 rounded-full bg-white opacity-70" />
            </span>
        );
        if (chatEnabled && onOpenChat) {
            return (
                <button
                    type="button"
                    onClick={onOpenChat}
                    aria-label="Open live chat"
                    className={`${baseClasses} flex-1 btn-order py-1 text-sm`}
                >
                    {bubbleContent}
                </button>
            );
        }
        if (chatFallbackLink) {
            return (
                <a
                    href={chatFallbackLink}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Chat on WhatsApp"
                    className={`${baseClasses} bg-gradient-to-br from-[#34d399] to-[#059669]`}
                >
                    {bubbleContent}
                </a>
            );
        }
        return null;
    })();

    // Style 2 (Coco Kids Footer)
    if (websiteConfig?.footerStyle === 'style2') {
        return (
            <>
            <footer className="store-footer surface-panel bg-white border-t border-gray-100 pt-4 md:pt-6 pb-2 relative mt-auto">
                <div className="px-1 md:px-8 lg:px-16 md:max-w-7xl md:mx-auto">
                    {/* Centered Contact Bar */}
                    <div className="flex flex-col md:flex-row justify-center items-center gap-3 md:gap-10 mb-2 md:mb-4 border-b border-gray-100 pb-2 md:pb-4">
                        <div className="flex items-center gap-1.5 md:gap-2">
                            <Mail size={16} className="text-theme-primary md:w-5 md:h-5" />
                            <span className="text-gray-600 text-sm md:text-base font-medium">{websiteConfig.emails?.[0] || 'info@systemnextit.com.bd'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 md:gap-2">
                            <Phone size={16} className="text-theme-primary md:w-5 md:h-5" />
                            <span className="text-gray-600 text-sm md:text-base font-medium">{websiteConfig.phones?.[0] || '09638-866300'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 md:gap-2 max-w-xs text-center md:text-left">
                            <MapPin size={16} className="text-theme-primary shrink-0 md:w-5 md:h-5" />
                            <span className="text-gray-600 text-sm md:text-base font-medium">{websiteConfig.addresses?.[0] || 'Dhaka-1230'}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8 text-center md:text-left">
                        {/* Logo & Social */}
                        <div className="flex flex-col items-center md:items-start">
                            <div className="mb-2 md:mb-3 flex flex-col items-center md:items-start">
                                {resolvedFooterLogo ? (
                                    <img src={normalizeImageUrl(resolvedFooterLogo)} alt={`${websiteConfig?.websiteName || 'Store'} logo`} className="h-16 md:h-20 object-contain" />
                                ) : (
                                    <>
                                        <span className="text-xl md:text-2xl font-black text-theme-primary tracking-tight">Your</span>
                                        <span className="text-lg md:text-xl font-bold text-theme-secondary tracking-widest -mt-1 block">Store</span>
                                    </>
                                )}
                            </div>
                            <p className="text-sm md:text-base text-gray-500 mb-2 md:mb-3">{websiteConfig?.shortDescription || 'Every Smile Matters'}</p>
                            <div className="flex gap-3">
                                <a href="#" className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-theme-primary/10 text-theme-primary flex items-center justify-center hover:bg-theme-primary hover:text-white transition">
                                    <Facebook size={20} className="md:w-5 md:h-5" />
                                </a>
                                <a href="#" className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition">
                                    <MessageCircle size={20} className="md:w-5 md:h-5" />
                                </a>
                            </div>
                        </div>

                        {/* Columns */}
                        <div>
                            <h4 className="font-bold text-theme-primary text-base md:text-lg mb-2 md:mb-3">Contact Us</h4>
                            <ul className="space-y-1 md:space-y-2 text-sm md:text-base text-gray-600">
                                <li>{websiteConfig.emails?.[0]}</li>
                                <li>{websiteConfig.phones?.[0]}</li>
                                <li>{websiteConfig.addresses?.[0]}</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-theme-primary text-base md:text-lg mb-2 md:mb-3">Quick Links</h4>
                            <ul className="space-y-1 md:space-y-2 text-sm md:text-base text-gray-600">
                                <li><a href="#" className="hover:text-theme-primary">Return & Refund Policy</a></li>
                                <li><a href="#" className="hover:text-theme-primary">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-theme-primary">Terms and Conditions</a></li>
                                <li><a href="#" className="hover:text-theme-primary">About us</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-theme-primary text-base md:text-lg mb-2 md:mb-3">Useful Links</h4>
                            <ul className="space-y-1 md:space-y-2 text-sm md:text-base text-gray-600">
                                <li><a href="#" className="hover:text-theme-primary">Why Shop Online with Us</a></li>
                                <li><a href="#" className="hover:text-theme-primary">Online Payment Methods</a></li>
                                <li><a href="#" className="hover:text-theme-primary">After Sales Support</a></li>
                                <li><a href="#" className="hover:text-theme-primary">Faq</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 mt-4 md:mt-6 pt-3 md:pt-4 text-center text-sm md:text-base text-gray-500">
                        &copy; All Copyrights Reserved by {websiteConfig?.websiteName || 'Your Store'}. {new Date().getFullYear()}
                    </div>
                </div>
            </footer>
            {floatingChatButton}
            </>
        );
    }

    if (websiteConfig?.footerStyle === 'style3') {
        const quickLinksSource = websiteConfig?.footerQuickLinks;
        const quickLinks = quickLinksSource && quickLinksSource.length
            ? quickLinksSource
            : [
                { id: 'quick-1', label: 'About Us', url: '#' },
                { id: 'quick-2', label: 'Order Tracking', url: '#' },
                { id: 'quick-3', label: 'Shipping & Delivery', url: '#' },
                { id: 'quick-4', label: 'Contact', url: '#' }
            ];
        const usefulLinksSource = websiteConfig?.footerUsefulLinks;
        const usefulLinks = usefulLinksSource && usefulLinksSource.length
            ? usefulLinksSource
            : [
                { id: 'useful-1', label: 'Return & Refund Policy', url: '#' },
                { id: 'useful-2', label: 'Privacy Policy', url: '#' },
                { id: 'useful-3', label: 'FAQ', url: '#' },
                { id: 'useful-4', label: 'Why Shop With Us', url: '#' }
            ];
        const socialLinks = websiteConfig?.socialLinks || [];
        const contactCards = [
            websiteConfig?.phones?.[0]
                ? { label: 'Call us', value: websiteConfig.phones[0], icon: <Phone size={16} className="text-[color:var(--color-primary)]" /> }
                : null,
            websiteConfig?.emails?.[0]
                ? { label: 'Mail us', value: websiteConfig.emails[0], icon: <Mail size={16} className="text-[color:var(--color-primary)]" /> }
                : null,
            websiteConfig?.addresses?.[0]
                ? { label: 'Visit us', value: websiteConfig.addresses[0], icon: <MapPin size={16} className="text-[color:var(--color-primary)]" /> }
                : null
        ].filter((card): card is { label: string; value: string; icon: React.ReactNode } => Boolean(card));

        return (
            <>
            <footer className="store-footer surface-panel bg-white/95 border-t border-gray-100 mt-auto">
                <div className="max-w-7xl mx-auto px-4 py-12 space-y-10">
                    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr,0.8fr,0.8fr]">
                        <div className="space-y-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                {resolvedFooterLogo ? (
                                    <img src={normalizeImageUrl(resolvedFooterLogo)} alt={`${websiteConfig?.websiteName || 'Store'} logo`} className="h-16 md:h-20 object-contain" />
                                ) : (
                                    <div className="text-3xl font-black tracking-tight text-gray-900">
                                        {websiteConfig?.websiteName || 'Your Store'}
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs uppercase tracking-[0.4em] text-gray-400">{websiteConfig?.brandingText || 'Stay Inspired'}</p>
                                    <p className="text-sm text-gray-500 mt-2 max-w-md">{websiteConfig?.shortDescription || 'Discover curated picks and seasonal favorites in one place.'}</p>
                                </div>
                            </div>
                            {contactCards.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {contactCards.map(card => (
                                        <div key={card.label} className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 shadow-sm">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                                                {card.icon}
                                                <span>{card.label}</span>
                                            </div>
                                            <p className="text-sm font-bold text-gray-900 mt-1 break-words">{card.value}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {socialLinks.length > 0 && (
                                <div className="flex flex-wrap items-center gap-3">
                                    {socialLinks.map(link => (
                                        <a
                                            key={link.id}
                                            href={link.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            aria-label={link.platform}
                                            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:text-white hover:bg-[color:var(--color-primary)] transition"
                                        >
                                            {resolveSocialIcon(link.platform)}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-theme-primary mb-4">Quick Links</h4>
                            <ul className="space-y-2">
                                {quickLinks.map(link => (
                                    <li key={link.id}>
                                        <a href={link.url || '#'} className="flex items-center justify-between gap-4 text-sm text-gray-600 hover:text-[color:var(--color-primary)] transition">
                                            <span>{link.label}</span>
                                            <ArrowRight size={16} className="text-gray-400" />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-theme-primary mb-4">Useful Links</h4>
                            <ul className="space-y-2">
                                {usefulLinks.map(link => (
                                    <li key={link.id}>
                                        <a href={link.url || '#'} className="flex items-center justify-between gap-4 text-sm text-gray-600 hover:text-[color:var(--color-secondary)] transition">
                                            <span>{link.label}</span>
                                            <ArrowRight size={16} className="text-gray-300" />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 border-t border-gray-100 pt-6 text-xs text-gray-500 md:flex-row md:items-center md:justify-between">
                        <p>
                            &copy; {new Date().getFullYear()} {websiteConfig?.websiteName || 'Store'}. All rights reserved.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            {websiteConfig?.addresses?.slice(0, 2).map((addr, idx) => (
                                <span key={`${addr}-${idx}`} className="inline-flex items-center gap-1">
                                    <MapPin size={14} className="text-gray-400" />
                                    <span>{addr}</span>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
            {floatingChatButton}
            </>
        );
    }

    // Style 4 (Premium Footer - Two Tone)
    if (websiteConfig?.footerStyle === 'style4') {
        const socialLinks = websiteConfig?.socialLinks || [];
        const quickLinks = websiteConfig?.footerQuickLinks?.length
            ? websiteConfig.footerQuickLinks
            : [
                { id: 'quick-1', label: 'Return & Refund Policy', url: '#' },
                { id: 'quick-2', label: 'Privacy Policy', url: '#' },
                { id: 'quick-3', label: 'Terms and Conditions', url: '#' },
                { id: 'quick-4', label: 'About us', url: '#' }
            ];
        const usefulLinks = websiteConfig?.footerUsefulLinks?.length
            ? websiteConfig.footerUsefulLinks
            : [
                { id: 'useful-1', label: 'Why Shop Online with Us', url: '#' },
                { id: 'useful-2', label: 'Online Payment Methods', url: '#' },
                { id: 'useful-3', label: 'After Sales Support', url: '#' },
                { id: 'useful-4', label: 'FAQ', url: '#' }
            ];

        return (
            <>
            <footer className="store-footer mt-auto">
                {/* Top Section - Darker Background */}
                <div className="bg-slate-700 text-white py-6 px-4">
                    <div className="max-w-7xl mx-auto space-y-4">
                        {/* Logo & Tagline */}
                        <div className="text-center">
                            {resolvedFooterLogo && (
                                <img src={normalizeImageUrl(resolvedFooterLogo)} alt={`${websiteConfig?.websiteName || 'Store'} logo`} className="w-10 h-10 md:w-20 md:h-20 mx-auto mb-2 object-contain" />
                            )}
                            <p className="text-white text-lg font-light tracking-wide">{websiteConfig?.shortDescription || 'Get the best for less'}</p>
                        </div>

                        {/* Social Links */}
                        {socialLinks.length > 0 && (
                            <div className="flex justify-center gap-4">
                                {socialLinks.map(link => (
                                    <a
                                        key={link.id}
                                        href={link.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        aria-label={link.platform}
                                        className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition transform hover:scale-110"
                                    >
                                        {resolveSocialIcon(link.platform)}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Section - Lighter Background */}
                <div className="bg-slate-800 text-white py-6 px-4">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Contact Us Section */}
                        <div className="text-center space-y-3">
                            <h2 className="text-3xl font-bold tracking-tight">Contact Us</h2>
                            
                            <div className="space-y-2">
                                {websiteConfig?.emails?.[0] && (
                                    <div className="flex items-center justify-center gap-3">
                                        <Mail size={24} className="text-green-400" />
                                        <a href={`mailto:${websiteConfig.emails[0]}`} className="text-lg hover:text-green-400 transition">
                                            {websiteConfig.emails[0]}
                                        </a>
                                    </div>
                                )}
                                {websiteConfig?.phones?.[0] && (
                                    <div className="flex items-center justify-center gap-3">
                                        <Phone size={24} className="text-green-400" />
                                        <a href={`tel:${websiteConfig.phones[0]}`} className="text-lg hover:text-green-400 transition">
                                            {websiteConfig.phones[0]}
                                        </a>
                                    </div>
                                )}
                                {websiteConfig?.addresses?.[0] && (
                                    <div className="flex items-center justify-center gap-3">
                                        <MapPin size={24} className="text-green-400" />
                                        <span className="text-lg">{websiteConfig.addresses[0]}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Links Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center md:text-left">
                            {/* Quick Links */}
                            <div>
                                <h3 className="text-2xl font-bold mb-4">Quick Links</h3>
                                <ul className="space-y-2">
                                    {quickLinks.map(link => (
                                        <li key={link.id}>
                                            <a href={link.url || '#'} className="text-white/80 hover:text-green-400 transition text-lg">
                                                {link.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Useful Links */}
                            <div>
                                <h3 className="text-2xl font-bold mb-4">Useful Links</h3>
                                <ul className="space-y-2">
                                    {usefulLinks.map(link => (
                                        <li key={link.id}>
                                            <a href={link.url || '#'} className="text-white/80 hover:text-green-400 transition text-lg">
                                                {link.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Copyright */}
                        <div className="border-t border-white/10 pt-8 text-center text-sm text-white/60">
                            <p>&copy; {new Date().getFullYear()} {websiteConfig?.websiteName || 'Store'}. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </footer>
            {floatingChatButton}
            </>
        );
    }

    // Default Footer
    return (
        <>
        <footer className="store-footer surface-panel bg-white border-t border-gray-100 mt-auto">
            {/* Mobile Footer */}
            <div className="md:hidden px-4 py-8">
                {/* Logo & Description */}
                <div className="text-center mb-8">
                    {resolvedFooterLogo ? (
                        <img src={normalizeImageUrl(resolvedFooterLogo)} alt={`${websiteConfig?.websiteName || 'Store'} logo`} className="h-14 object-contain mx-auto mb-4" />
                    ) : (
                        <h3 className="text-2xl font-black text-gray-900 mb-3">{websiteConfig?.websiteName || 'YourShop'}</h3>
                    )}
                    {websiteConfig?.shortDescription && (
                        <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">{websiteConfig.shortDescription}</p>
                    )}
                </div>

                {/* Contact Cards - Horizontal Scroll */}
                <div className="flex gap-3 overflow-x-auto pb-4 mb-8 -mx-4 px-4 scrollbar-hide">
                    {websiteConfig?.phones?.[0] && (
                        <a href={`tel:${websiteConfig.phones[0]}`} className="flex-shrink-0 flex items-center gap-3 px-4 py-3.5 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 rounded-xl bg-theme-primary/10 flex items-center justify-center">
                                <Phone size={18} className="text-theme-primary" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Call Us</p>
                                <p className="text-sm font-bold text-gray-800">{websiteConfig.phones[0]}</p>
                            </div>
                        </a>
                    )}
                    {websiteConfig?.emails?.[0] && (
                        <a href={`mailto:${websiteConfig.emails[0]}`} className="flex-shrink-0 flex items-center gap-3 px-4 py-3.5 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                <Mail size={18} className="text-blue-500" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Email</p>
                                <p className="text-sm font-bold text-gray-800 truncate max-w-[140px]">{websiteConfig.emails[0]}</p>
                            </div>
                        </a>
                    )}
                    {whatsappLink && (
                        <a href={whatsappLink} target="_blank" rel="noreferrer" className="flex-shrink-0 flex items-center gap-3 px-4 py-3.5 bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                                <MessageCircle size={18} className="text-green-600" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">WhatsApp</p>
                                <p className="text-sm font-bold text-green-700">Chat Now</p>
                            </div>
                        </a>
                    )}
                </div>

                {/* Quick Links - Grid Style */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div>
                        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span className="w-8 h-0.5 bg-theme-primary rounded-full"></span>
                            Quick Links
                        </h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-sm text-gray-600 hover:text-theme-primary flex items-center gap-2 transition-colors"><ArrowRight size={12} className="text-theme-primary/50" />About Us</a></li>
                            <li><a href="#" className="text-sm text-gray-600 hover:text-theme-primary flex items-center gap-2 transition-colors"><ArrowRight size={12} className="text-theme-primary/50" />Track Order</a></li>
                            <li><a href="#" className="text-sm text-gray-600 hover:text-theme-primary flex items-center gap-2 transition-colors"><ArrowRight size={12} className="text-theme-primary/50" />Returns</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span className="w-8 h-0.5 bg-theme-secondary rounded-full"></span>
                            Policies
                        </h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-sm text-gray-600 hover:text-theme-secondary flex items-center gap-2 transition-colors"><ArrowRight size={12} className="text-theme-secondary/50" />Privacy</a></li>
                            <li><a href="#" className="text-sm text-gray-600 hover:text-theme-secondary flex items-center gap-2 transition-colors"><ArrowRight size={12} className="text-theme-secondary/50" />Terms</a></li>
                            <li><a href="#" className="text-sm text-gray-600 hover:text-theme-secondary flex items-center gap-2 transition-colors"><ArrowRight size={12} className="text-theme-secondary/50" />Refund</a></li>
                        </ul>
                    </div>
                </div>

                {/* Social Icons */}
                {websiteConfig?.socialLinks && websiteConfig.socialLinks.length > 0 && (
                    <div className="flex justify-center gap-3 mb-8">
                        {websiteConfig.socialLinks.map(link => (
                            <a key={link.id} href={link.url} target="_blank" rel="noreferrer" aria-label={link.platform} className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-theme-primary hover:text-white hover:border-theme-primary hover:shadow-lg transition-all">
                                {resolveSocialIcon(link.platform)}
                            </a>
                        ))}
                    </div>
                )}

                {/* Address */}
                {websiteConfig?.addresses?.[0] && (
                    <div className="flex items-start justify-center gap-2.5 text-center mb-6 px-4 py-3 bg-gray-50 rounded-xl">
                        <MapPin size={16} className="text-theme-primary mt-0.5 shrink-0" />
                        <p className="text-sm text-gray-600">{websiteConfig.addresses[0]}</p>
                    </div>
                )}

                {/* Copyright */}
                <div className="border-t border-gray-100 pt-6 text-center">
                    <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} {websiteConfig?.websiteName || 'Store'}. All rights reserved.</p>
                    {websiteConfig?.showPoweredBy && (
                        <p className="text-[10px] text-gray-400 mt-2">Powered by SystemNext IT</p>
                    )}
                </div>
            </div>

            {/* Desktop Footer */}
            <div className="hidden md:block max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-4 gap-10 mb-10">
                    <div className="col-span-1">
                        {resolvedFooterLogo ? (
                            <img src={normalizeImageUrl(resolvedFooterLogo)} alt={`${websiteConfig?.websiteName || 'Store'} logo`} className="h-14 object-contain mb-5" />
                        ) : (
                            <h3 className="text-2xl font-black text-gray-900 mb-5">{websiteConfig?.websiteName || 'YourShop'}</h3>
                        )}
                        <p className="text-sm text-gray-500 leading-relaxed mb-6">{websiteConfig?.shortDescription}</p>
                        <div className="flex gap-2.5">
                            {websiteConfig?.socialLinks?.map(link => (
                                <a key={link.id} href={link.url} target="_blank" rel="noreferrer" aria-label={link.platform} className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-theme-primary hover:text-white transition-all text-gray-600 hover:shadow-lg hover:-translate-y-0.5">
                                    {resolveSocialIcon(link.platform)}
                                </a>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                            <span className="w-6 h-0.5 bg-theme-primary rounded-full"></span>
                            Quick Links
                        </h4>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="text-gray-500 hover:text-theme-primary transition-colors flex items-center gap-2"><ArrowRight size={14} className="text-gray-300" />About Us</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-theme-primary transition-colors flex items-center gap-2"><ArrowRight size={14} className="text-gray-300" />Why Shop with us</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-theme-primary transition-colors flex items-center gap-2"><ArrowRight size={14} className="text-gray-300" />Terms & Conditions</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-theme-primary transition-colors flex items-center gap-2"><ArrowRight size={14} className="text-gray-300" />Privacy Policy</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                            <span className="w-6 h-0.5 bg-theme-secondary rounded-full"></span>
                            Customer Area
                        </h4>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="text-gray-500 hover:text-theme-secondary transition-colors flex items-center gap-2"><ArrowRight size={14} className="text-gray-300" />My Account</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-theme-secondary transition-colors flex items-center gap-2"><ArrowRight size={14} className="text-gray-300" />Orders</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-theme-secondary transition-colors flex items-center gap-2"><ArrowRight size={14} className="text-gray-300" />Tracking</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-theme-secondary transition-colors flex items-center gap-2"><ArrowRight size={14} className="text-gray-300" />Returns</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                            <span className="w-6 h-0.5 bg-gradient-to-r from-theme-primary to-theme-secondary rounded-full"></span>
                            Contact Us
                        </h4>
                        <ul className="space-y-4 text-sm">
                            {websiteConfig?.addresses?.map((addr, i) => (
                                <li key={i} className="flex items-start gap-3 text-gray-500 group">
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-theme-primary/10 transition-colors">
                                        <MapPin size={14} className="text-theme-primary" />
                                    </div>
                                    <span className="pt-1.5">{addr}</span>
                                </li>
                            ))}
                            {websiteConfig?.phones?.map((phone, i) => (
                                <li key={i} className="flex items-center gap-3 text-gray-500 group">
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-theme-primary/10 transition-colors">
                                        <Phone size={14} className="text-theme-primary" />
                                    </div>
                                    <a href={`tel:${phone}`} className="hover:text-theme-primary transition-colors">{phone}</a>
                                </li>
                            ))}
                            {websiteConfig?.emails?.map((email, i) => (
                                <li key={i} className="flex items-center gap-3 text-gray-500 group">
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-theme-primary/10 transition-colors">
                                        <Mail size={14} className="text-theme-primary" />
                                    </div>
                                    <a href={`mailto:${email}`} className="hover:text-theme-primary transition-colors">{email}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                {!websiteConfig?.hideCopyright && (
                    <div className="border-t border-gray-100 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                        {!websiteConfig?.hideCopyrightText && (
                            <p>&copy; {new Date().getFullYear()} {websiteConfig?.websiteName}. All rights reserved.</p>
                        )}
                        {websiteConfig?.showPoweredBy && (
                            <p className="text-gray-400">Powered by <span className="text-theme-primary font-medium">SystemNext IT</span></p>
                        )}
                    </div>
                )}
            </div>
        </footer>
        {floatingChatButton}
        </>
    );
};

export default StoreFooter;
