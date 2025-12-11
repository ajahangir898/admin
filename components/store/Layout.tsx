
import React, { useState, useRef, useEffect, useMemo, useCallback, CSSProperties } from 'react';
import { ShoppingCart, Search, User, Facebook, Instagram, Twitter, Linkedin, Truck, X, CheckCircle, Sparkles, Upload, Wand2, Image as ImageIcon, Loader2, ArrowRight, Heart, LogOut, ChevronDown, UserCircle, Phone, Mail, MapPin, Youtube, ShoppingBag, Globe, Star, Eye, Bell, Gift, Users, ChevronLeft, ChevronRight, MessageCircle, Home, Grid, MessageSquare, List, Menu, Smartphone, Mic, Camera, Minus, Plus, Send, Edit2, Trash2, Check, Video, Info, Smile } from 'lucide-react';
import { Product, User as UserType, WebsiteConfig, CarouselItem, Order, ProductVariantSelection, ChatMessage, ThemeConfig } from '../../types';
import { formatCurrency } from '../../utils/format';
import { toast } from 'react-hot-toast';
import { PRODUCTS } from '../../constants';
import { LazyImage } from '../../utils/performanceOptimization';
import { buildWhatsAppLink, hexToRgb } from './helpers';

export const ProductCard: React.FC<{ product: Product; onClick: (product: Product) => void; variant?: string; onQuickView?: (product: Product) => void; onBuyNow?: (product: Product) => void; onAddToCart?: (product: Product) => void }> = ({ product, onClick, variant, onQuickView, onBuyNow, onAddToCart }) => {
    const handleBuyNow = (event?: React.MouseEvent) => {
        event?.stopPropagation();
        if (onBuyNow) {
            onBuyNow(product);
        } else {
            onClick(product);
        }
    };
  // Style 2 (Flash Sale - Pink/Blue)
  if (variant === 'style2') {
    return (
        <div className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition group relative overflow-hidden flex flex-col">
            <div className="relative aspect-square p-4 bg-gray-50 cursor-pointer" onClick={() => onClick(product)}>
                <LazyImage src={product.galleryImages?.[0] || product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply transition duration-500 group-hover:scale-105" />
                {product.discount && (
                    <span className="absolute top-2 left-2 bg-pink-600 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded">
                        {product.discount}
                    </span>
                )}
                <button className="absolute top-2 right-2 btn-wishlist text-current" onClick={(e) => e.stopPropagation()}>
                    <Heart size={18} />
                </button>
            </div>
            
            <div className="p-3 flex-1 flex flex-col">
                {/* Rating */}
                <div className="flex items-center gap-1 text-yellow-400 text-xs mb-1">
                    <Star size={12} fill="currentColor" />
                    <span className="text-gray-400">({product.reviews || 0})</span>
                    <span className="text-gray-400 text-[10px] ml-1">| 0 Sold</span>
                </div>

                <h3 
                  className="font-bold text-gray-800 text-sm mb-1 line-clamp-2 cursor-pointer hover:text-pink-600 transition"
                  onClick={() => onClick(product)}
                >
                    {product.name}
                </h3>
                
                <p className="text-xs text-gray-500 mb-2 line-clamp-2">{product.description?.substring(0, 50)}...</p>

                <div className="mt-auto">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-pink-600 font-bold text-medium"><b>৳</b>{product.price}</span>
                        {product.originalPrice && (
                            <span className="text-gray-400 text-xs line-through">{product.originalPrice}</span>
                        )}
                        <span className="ml-auto text-[10px] text-blue-500 font-medium">Get 50 Coins</span>
                    </div>
                    
                    <div className="flex gap-2">
                    <button 
                        className="flex-1 btn-order py-1.5 text-sm"
                        onClick={handleBuyNow}
                    >
                            Buy Now
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddToCart?.(product);
                            }}
                            className="cart_btn"
                            aria-label="Add to cart"
                        >
                            <ShoppingCart size={18} className="text-rose-500" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
  }

    const formattedPrice = formatCurrency(product.price);
    const formattedOriginalPrice = formatCurrency(product.originalPrice, null);
    const tagLabel = product.tag || 'Trending';
    const accentMeta = product.brand || product.category || 'Curated pick';

    // Default Style (Card 1)
    return (
        <div className="group relative flex flex-col rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden">
            <span className="pointer-events-none absolute inset-x-4 top-0 h-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-500 opacity-60 group-hover:opacity-100" />

            <div className="relative px-4 pt-4">
                <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 uppercase tracking-wide dark:bg-emerald-500/10 dark:text-emerald-200">
                        <Sparkles size={12} /> {tagLabel}
                    </span>
                    {typeof product.rating === 'number' ? (
                        <span className="inline-flex items-center gap-1 text-amber-500">
                            <Star size={12} fill="currentColor" className="drop-shadow" />
                            {product.rating.toFixed(1)}
                            {typeof product.reviews === 'number' && (
                                <span className="text-[10px] text-gray-400 dark:text-gray-300 font-normal">({product.reviews})</span>
                            )}
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-sky-600 bg-sky-50 dark:bg-sky-500/10 dark:text-sky-200">
                            <Truck size={12} /> Fast ship
                        </span>
                    )}
                </div>

                <div className="relative mt-4">
                    <div className="absolute inset-x-6 top-2 h-28 bg-gradient-to-br from-emerald-200/40 via-transparent to-transparent blur-3xl opacity-60 group-hover:opacity-90 transition" aria-hidden />
                    <div className="relative h-40 rounded-2xl bg-gray-50 dark:bg-slate-700 flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => onClick(product)}>
                        <LazyImage src={product.galleryImages?.[0] || product.image} alt={product.name} className="h-full w-full object-contain mix-blend-multiply dark:mix-blend-normal transition duration-500 group-hover:scale-110" />
                    </div>
                    {product.discount && (
                        <span className="absolute top-4 left-6 bg-purple-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                            {product.discount}
                        </span>
                    )}
                    <button className="absolute top-4 right-6 btn-wishlist bg-white/80 dark:bg-slate-800/70 shadow-md backdrop-blur-sm hover:scale-110 transition" aria-label="Save to wishlist">
                        <Heart size={16} />
                    </button>
                </div>
            </div>

            <div className="p-4 flex-1 flex flex-col gap-3">
                <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500 mb-1">{accentMeta}</p>
                    <h3
                        className="font-bold text-gray-900 dark:text-gray-100 text-base leading-tight cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-300 transition line-clamp-2"
                        onClick={() => onClick(product)}
                    >
                        {product.name}
                    </h3>
                    {product.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{product.description}</p>
                    )}
                </div>

                {product.colors && product.colors.length > 0 && (
                    <div className="flex gap-1.5">
                        {product.colors.slice(0, 4).map((c, i) => (
                            <span key={i} className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ backgroundColor: c }}></span>
                        ))}
                        {product.colors.length > 4 && (
                            <span className="text-[10px] text-gray-400">+{product.colors.length - 4}</span>
                        )}
                    </div>
                )}

                <div className="mt-auto flex items-end justify-between gap-3">
                    <div>
                        <p className="text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500">Starting at</p>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-gray-900 dark:text-white">৳ {formattedPrice}</span>
                            {formattedOriginalPrice && (
                                <span className="text-xs text-gray-400 line-through">৳ {formattedOriginalPrice}</span>
                            )}
                        </div>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-300 font-semibold">Instant confirmation</p>
                    </div>

                    <div className="flex flex-col gap-2 w-32">
                        <button
                            onClick={handleBuyNow}
                            className="w-full btn-order py-2 rounded-xl font-bold text-sm"
                        >
                            অর্ডার করুন
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddToCart?.(product);
                            }}
                            className="w-full rounded-xl border border-emerald-200 text-xs font-semibold text-emerald-600 py-1.5 flex items-center justify-center gap-1 hover:bg-emerald-50 transition"
                        >
                            <ShoppingCart size={14} /> Add to cart
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onQuickView) onQuickView(product);
                                else onClick(product);
                            }}
                            className="inline-flex items-center justify-center gap-1 rounded-xl border border-gray-200 dark:border-slate-600 text-xs font-semibold text-gray-600 dark:text-gray-200 py-1.5 hover:border-emerald-400 hover:text-emerald-600 transition"
                        >
                            <Eye size={14} /> Quick view
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


export const HeroSection: React.FC<{ carouselItems?: CarouselItem[] }> = ({ carouselItems }) => {
  const items = carouselItems?.filter(i => i.status === 'Publish').sort((a,b) => a.serial - b.serial) || [];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (items.length === 0) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 mt-4">
            <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden shadow-sm group">
                {items.map((item, index) => (
                    <a
                        href={item.url || '#'}
                        key={item.id}
                        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    >
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </a>
                ))}

                {items.length > 1 && (
                    <>
                        <button
                            onClick={() => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md z-20 transition opacity-0 group-hover:opacity-100 md:opacity-100"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => setCurrentIndex((prev) => (prev + 1) % items.length)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md z-20 transition opacity-0 group-hover:opacity-100 md:opacity-100"
                        >
                            <ChevronRight size={20} />
                        </button>

                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                            {items.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 shadow-sm ${idx === currentIndex ? 'bg-white w-6' : 'bg-white/60 hover:bg-white'}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
export const CategoryCircle: React.FC<{ name: string; icon: React.ReactNode }> = ({ name, icon }) => (
    <div className="flex flex-col items-center gap-2 cursor-pointer group min-w-[80px]">

        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-green-500 group-hover:text-white group-hover:border-green-500 transition duration-300 shadow-sm hover:shadow-lg transform group-hover:-translate-y-1">
            {icon}
        </div>
        <span className="text-xs md:text-sm font-medium text-gray-700 group-hover:text-green-600 text-center transition-colors">{name}</span>
    </div>
);

export const CategoryPill: React.FC<{ name: string; icon: React.ReactNode }> = ({ name, icon }) => (

    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full shadow-sm hover:border-pink-500 hover:shadow-md cursor-pointer transition whitespace-nowrap group">
        <div className="w-7 h-7 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center group-hover:rotate-6 transition-transform duration-300">
            {icon}
        </div>
        <span className="text-sm font-bold text-[rgb(var(--color-font-rgb))] group-hover:text-pink-600 tracking-wide">{name}</span>
    </div>
);

export const SectionHeader: React.FC<{ title: string; className?: string }> = ({ title, className }) => (
    <div className="inline-flex flex-col gap-1">
        <div className="flex items-center gap-3">
            
            <h2 className={`text-2xl font-black tracking-tight text-gray-900 dark:text-white drop-shadow-sm ${className ?? ''}`}>
                {title}
            </h2>
        </div>
        <span className="h-1 w-24 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full" />
    </div>
);


export const StoreFooter: React.FC<{ websiteConfig?: WebsiteConfig; logo?: string | null; onOpenChat?: () => void }> = ({ websiteConfig, logo, onOpenChat }) => {
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
            <footer className="store-footer surface-panel bg-white border-t border-gray-100 pt-8 pb-4 relative mt-auto max-w-7xl mx-auto px-4">
                <div className="max-w-7xl mx-auto px-4">
                    {/* Centered Contact Bar */}
                    <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-12 mb-12 border-b border-gray-100 pb-8">
                        <div className="flex items-center gap-2">
                            <Mail size={18} className="text-blue-500" />
                            <span className="text-gray-600 text-sm font-medium">{websiteConfig.emails?.[0] || 'info@cocokids.com.bd'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone size={18} className="text-blue-500" />
                            <span className="text-gray-600 text-sm font-medium">{websiteConfig.phones?.[0] || '09638-866300'}</span>
                        </div>
                        <div className="flex items-center gap-2 max-w-xs text-center md:text-left">
                            <MapPin size={18} className="text-blue-500 shrink-0" />
                            <span className="text-gray-600 text-sm font-medium">{websiteConfig.addresses?.[0] || 'Dhaka-1230'}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
                        {/* Logo & Social */}
                        <div className="flex flex-col items-center md:items-start">
                            <div className="mb-4 flex flex-col items-center md:items-start">
                                {logo ? (
                                    <img src={logo} alt={`${websiteConfig?.websiteName || 'Store'} logo`} className="h-12 object-contain" />
                                ) : (
                                    <>
                                        <span className="text-2xl font-black text-blue-500 tracking-tight">COCO</span>
                                        <span className="text-xl font-bold text-pink-500 tracking-widest -mt-1 block">KIDS</span>
                                    </>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mb-4">{websiteConfig?.shortDescription || 'Every Smile Matters'}</p>
                            <div className="flex gap-3">
                                <a href="#" className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition">
                                    <Facebook size={16} />
                                </a>
                                <a href="#" className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition">
                                    <MessageCircle size={16} /> {/* WhatsApp placeholder */}
                                </a>
                            </div>
                        </div>

                        {/* Columns */}
                        <div>
                            <h4 className="font-bold text-gray-800 mb-4">Contact Us</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>{websiteConfig.emails?.[0]}</li>
                                <li>{websiteConfig.phones?.[0]}</li>
                                <li>{websiteConfig.addresses?.[0]}</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><a href="#" className="hover:text-blue-600">Return & Refund Policy</a></li>
                                <li><a href="#" className="hover:text-blue-600">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-blue-600">Terms and Conditions</a></li>
                                <li><a href="#" className="hover:text-blue-600">About us</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 mb-4">Useful Links</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><a href="#" className="hover:text-blue-600">Why Shop Online with Us</a></li>
                                <li><a href="#" className="hover:text-blue-600">Online Payment Methods</a></li>
                                <li><a href="#" className="hover:text-blue-600">After Sales Support</a></li>
                                <li><a href="#" className="hover:text-blue-600">Faq</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 mt-12 pt-6 text-center text-xs text-gray-500">
                        &copy; All Copyrights Reserved by Cocokids
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
                                {logo ? (
                                    <img src={logo} alt={`${websiteConfig?.websiteName || 'Store'} logo`} className="h-12 object-contain" />
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
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h4>
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
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Useful Links</h4>
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
                            {websiteConfig?.favicon && (
                                <img src={websiteConfig.favicon} alt="Favicon" className="w-12 h-12 mx-auto mb-2 object-contain" />
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
        <footer className={`store-footer surface-panel bg-white border-t border-gray-100 pt-1 pb-1 text-gray-600 max-w-7xl mx-auto px-4`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div>
                    {logo ? (
                        <img src={logo} alt={`${websiteConfig?.websiteName || 'Store'} logo`} className="h-10 object-contain mb-4" />
                    ) : (
                        <h3 className="text-lg font-bold text-gray-900 mb-4 dark:text-white">{websiteConfig?.websiteName || 'GadgetShob'}</h3>
                    )}
                    <p className="text-sm leading-relaxed mb-4">{websiteConfig?.shortDescription}</p>
                    <div className="flex gap-3">
                    {websiteConfig?.socialLinks?.map(link => (
                        <a key={link.id} href={link.url} target="_blank" rel="noreferrer" aria-label={link.platform} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-purple-600 hover:text-white transition">
                            {resolveSocialIcon(link.platform)}
                        </a>
                    ))}
                    </div>
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 mb-4 dark:text-white">Quick Links</h4>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#" className="hover:text-purple-600">About Us</a></li>
                        <li><a href="#" className="hover:text-purple-600">Why Shop with us</a></li>
                        <li><a href="#" className="hover:text-purple-600">Terms & Conditions</a></li>
                        <li><a href="#" className="hover:text-purple-600">Privacy Policy</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 mb-4 dark:text-white">Customer Area</h4>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#" className="hover:text-purple-600">My Account</a></li>
                        <li><a href="#" className="hover:text-purple-600">Orders</a></li>
                        <li><a href="#" className="hover:text-purple-600">Tracking</a></li>
                        <li><a href="#" className="hover:text-purple-600">Returns</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 mb-4 dark:text-white">Contact Us</h4>
                    <ul className="space-y-3 text-sm">
                        {websiteConfig?.addresses?.map((addr, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <MapPin size={16} className="mt-0.5 shrink-0" />
                                <span>{addr}</span>
                            </li>
                        ))}
                        {websiteConfig?.phones?.map((phone, i) => (
                            <li key={i} className="flex items-center gap-2">
                                <Phone size={16} />
                                <span>{phone}</span>
                            </li>
                        ))}
                        {websiteConfig?.emails?.map((email, i) => (
                            <li key={i} className="flex items-center gap-2">
                                <Mail size={16} />
                                <span>{email}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            {!websiteConfig?.hideCopyright && (
                <div className="max-w-7xl mx-auto px-4 border-t border-gray-100 pt-6 flex flex-col md:flex-row justify-between items-center text-xs">
                    {!websiteConfig?.hideCopyrightText && (
                        <p>&copy; {new Date().getFullYear()} {websiteConfig?.websiteName}. All rights reserved.</p>
                    )}
                    {websiteConfig?.showPoweredBy && (
                        <p>Powered by SystemNext IT </p>
                    )}
                </div>
            )}
        </footer>
        {floatingChatButton}
        </>
    );
};

