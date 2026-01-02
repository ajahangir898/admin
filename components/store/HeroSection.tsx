import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CarouselItem, WebsiteConfig, Campaign } from '../../types';
import { normalizeImageUrl } from '../../utils/imageUrlHelper';
import { OptimizedImage } from '../OptimizedImage';
import { HeroSkeleton } from '../SkeletonLoaders';

export interface HeroSectionProps {
    carouselItems?: CarouselItem[];
    websiteConfig?: WebsiteConfig;
}

const MAX_CAROUSEL_ITEMS = 10;

const normalizeStatus = (value: unknown): string => String(value ?? '').trim().toLowerCase();

const ensureProtocol = (url: string) => /^https?:\/\//i.test(url) ? url : `https://${url.replace(/^\/*/, '')}`;

const buildInternalHref = (url: string): string => {
    if (!url) return '#';
    const trimmed = url.trim();
    if (trimmed.startsWith('#') || trimmed.startsWith('?')) return trimmed;
    const normalized = trimmed.replace(/^https?:\/\/[^/]+/i, '') || '/';
    return normalized.startsWith('/') ? normalized : `/${normalized.replace(/^\/*/, '')}`;
};

const getCarouselHref = (item: CarouselItem) => {
    const rawUrl = item.url?.trim() || '';
    if (!rawUrl) return { href: '#', isExternal: false };
    const isExternal = String((item as any).urlType ?? '').trim().toLowerCase() === 'external';
    return isExternal 
        ? { href: ensureProtocol(rawUrl), isExternal: true }
        : { href: buildInternalHref(rawUrl), isExternal: false };
};

// Countdown timer hook
const useCountdown = (targetDate: string) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isStarted, setIsStarted] = useState(false);

    useEffect(() => {
        const calc = () => {
            const diff = new Date(targetDate).getTime() - Date.now();
            if (diff <= 0) {
                setIsStarted(true);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            } else {
                setIsStarted(false);
                setTimeLeft({
                    days: Math.floor(diff / 86400000),
                    hours: Math.floor((diff % 86400000) / 3600000),
                    minutes: Math.floor((diff % 3600000) / 60000),
                    seconds: Math.floor((diff % 60000) / 1000)
                });
            }
        };
        calc();
        const timer = setInterval(calc, 1000);
        return () => clearInterval(timer);
    }, [targetDate]);

    return { timeLeft, isStarted };
};

const CampaignCard: React.FC<{ campaign: Campaign }> = ({ campaign }) => {
    const { timeLeft, isStarted } = useCountdown(campaign.startDate);
    return (
        <a href={campaign.url || '#'} className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
            <div className="flex-shrink-0 w-20">
                {campaign.logo ? (
                    <OptimizedImage src={normalizeImageUrl(campaign.logo)} alt={campaign.name} width={80} height={40} className="w-full h-10 object-contain" />
                ) : (
                    <div className="w-full h-10 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-600 truncate px-1">{campaign.name}</span>
                    </div>
                )}
                <p className="text-[10px] text-orange-500 font-medium mt-1">{isStarted ? 'Campaign live!' : 'Campaign starts in'}</p>
            </div>
            <div className="grid grid-cols-2 gap-1">
                {['days', 'hours', 'minutes', 'seconds'].map(unit => (
                    <div key={unit} className="bg-gray-700 text-white text-center rounded px-2 py-1 min-w-[36px]">
                        <span className="text-sm font-bold">{timeLeft[unit as keyof typeof timeLeft]}{unit[0]}</span>
                    </div>
                ))}
            </div>
        </a>
    );
};

const UpcomingCampaigns: React.FC<{ campaigns?: Campaign[] }> = ({ campaigns }) => {
    const upcomingCampaigns = campaigns?.filter(c => normalizeStatus(c.status) === 'publish')
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .slice(0, 3) || [];

    if (!upcomingCampaigns.length) return null;

    return (
        <div className="hidden lg:flex flex-col w-64 flex-shrink-0">
            <div className="bg-gray-50 rounded-xl p-4 h-full">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Upcoming Campaigns</h3>
                <div className="space-y-3">
                    {upcomingCampaigns.map(c => <CampaignCard key={c.id} campaign={c} />)}
                </div>
            </div>
        </div>
    );
};

export const HeroSection: React.FC<HeroSectionProps> = ({ carouselItems, websiteConfig }) => {
    const items = (
        carouselItems
            ?.filter(i => normalizeStatus(i.status) === 'publish')
            .sort((a, b) => Number(a.serial ?? 0) - Number(b.serial ?? 0)) ||
        []
    ).slice(0, MAX_CAROUSEL_ITEMS);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));
    const [isMobile, setIsMobile] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    // Detect mobile & auto-advance
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (items.length <= 1 || isPaused) return;
        const timer = setInterval(() => setCurrentIndex(p => (p + 1) % items.length), 4500);
        return () => clearInterval(timer);
    }, [items.length, isPaused]);

    // Preload next & reset index
    useEffect(() => {
        if (items.length > 1) setLoadedImages(p => new Set([...p, currentIndex, (currentIndex + 1) % items.length]));
    }, [currentIndex, items.length]);

    useEffect(() => { setCurrentIndex(p => p >= items.length ? 0 : p); }, [items.length]);

    const handleImageLoad = useCallback((i: number) => {
        setLoadedImages(p => new Set([...p, i]));
    }, []);
    const getImageSrc = (item: CarouselItem) => isMobile && item.mobileImage ? item.mobileImage : item.image;
    const navigate = (dir: number) => (e: React.MouseEvent) => { e.preventDefault(); setCurrentIndex(p => (p + dir + items.length) % items.length); };

    if (!items.length) return null;

    // Always show carousel - don't wait for image load
    const showSkeleton = false;
    const hasCampaigns = websiteConfig?.campaigns?.some(c => normalizeStatus(c.status) === 'publish');

    return (
        <section className="max-w-7xl mx-auto px-4 pt-4 pb-2">
            <div className="flex gap-4"
                 onMouseEnter={() => setIsPaused(true)} 
                 onMouseLeave={() => setIsPaused(false)}>
                <div className="flex-1 min-w-0">
                    {/* Hero carousel - different aspect ratios for mobile/desktop */}
                    <div 
                        className="relative w-full rounded-2xl overflow-hidden shadow-xl group"
                        style={{ 
                            minHeight: isMobile ? '180px' : '280px', 
                            aspectRatio: isMobile ? '800/450' : '1280/330' 
                        }}
                    >
                        {items.map((item, index) => {
                            const isActive = index === currentIndex;
                            const { href, isExternal } = getCarouselHref(item);
                            // Use mobileImage for mobile, fallback to desktop image
                            const imgSrc = isMobile 
                                ? (item.mobileImage || item.image || '') 
                                : (item.image || '');
                            return (
                                <a key={item.id || index} href={href} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noopener noreferrer' : undefined}
                                   style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: isActive ? 1 : 0, zIndex: isActive ? 10 : 0, transition: 'opacity 0.5s ease' }}>
                                    <img 
                                        src={imgSrc} 
                                        alt={item.name || 'Banner'} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={() => {}}
                                    />
                                </a>
                            );
                        })}
                        
                        {/* Gradient overlays for better nav visibility */}
                        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black/20 to-transparent z-15 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black/20 to-transparent z-15 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        {items.length > 1 && (
                            <>
                                <button onClick={navigate(-1)} aria-label="Previous slide" className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-gray-700 w-10 h-10 rounded-full shadow-lg z-20 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center hover:scale-110 backdrop-blur-sm">
                                    <ChevronLeft size={22} strokeWidth={2.5} />
                                </button>
                                <button onClick={navigate(1)} aria-label="Next slide" className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-gray-700 w-10 h-10 rounded-full shadow-lg z-20 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center hover:scale-110 backdrop-blur-sm">
                                    <ChevronRight size={22} strokeWidth={2.5} />
                                </button>
                                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                                    {items.map((_, i) => (
                                        <button key={i} onClick={e => { e.preventDefault(); setCurrentIndex(i); }} aria-label={`Go to slide ${i + 1}`}
                                            className={`h-2.5 rounded-full transition-all duration-300 shadow-md ${i === currentIndex ? 'bg-white w-8' : 'bg-white/60 w-2.5 hover:bg-white/90 hover:w-3'}`} />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
                {hasCampaigns && <UpcomingCampaigns campaigns={websiteConfig?.campaigns} />}
            </div>
            {showSkeleton && <HeroSkeleton />}
        </section>
    );
};

export const CategoryCircle: React.FC<{ name: string; icon: React.ReactNode }> = ({ name, icon }) => (
    <div className="flex flex-col items-center gap-2 cursor-pointer group min-w-[80px]">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-primary-500 group-hover:text-white group-hover:border-primary-500 transition duration-300 shadow-sm hover:shadow-lg transform group-hover:-translate-y-1">
            {icon}
        </div>
        <span className="text-xs md:text-sm font-medium text-gray-700 group-hover:text-primary-600 text-center transition-colors">{name}</span>
    </div>
);

export const CategoryPill: React.FC<{ name: string; icon: React.ReactNode }> = ({ name, icon }) => (
    <div className="flex items-center gap-2.5 px-4 py-2 bg-gradient-to-r from-white to-gray-50 border border-gray-200/80 rounded-full shadow-sm hover:shadow-lg hover:border-primary-300 hover:from-primary-50 hover:to-white cursor-pointer transition-all duration-300 whitespace-nowrap group">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 text-primary-600 flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-inner">
            {icon}
        </div>
        <span className="text-sm font-semibold text-gray-700 group-hover:text-primary-600 transition-colors">{name}</span>
    </div>
);

export const SectionHeader: React.FC<{ title: string; className?: string }> = ({ title, className }) => (
    <div className="inline-flex flex-col gap-1">
        <h2 className={`text-2xl font-black tracking-tight text-gray-900 dark:text-white drop-shadow-sm ${className ?? ''}`}>{title}</h2>
        <span className="h-1 w-24 bg-gradient-to-r from-primary-500 via-secondary-500 to-tertiary-500 rounded-full" />
    </div>
);
