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
    return item.urlType === 'External' 
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
    const upcomingCampaigns = campaigns?.filter(c => c.status === 'Publish')
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
    const items = (carouselItems?.filter(i => i.status === 'Publish').sort((a, b) => a.serial - b.serial) || []).slice(0, MAX_CAROUSEL_ITEMS);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile & auto-advance
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (items.length <= 1) return;
        const timer = setInterval(() => setCurrentIndex(p => (p + 1) % items.length), 3500);
        return () => clearInterval(timer);
    }, [items.length]);

    // Preload first image for LCP - use prefetch instead of preload to avoid console warnings
    useEffect(() => {
        if (!items[0]) return;
        const href = normalizeImageUrl(isMobile && items[0].mobileImage ? items[0].mobileImage : items[0].image);
        if (!href || href.startsWith('data:') || href.length > 2048) return;
        // Use prefetch with high priority instead of preload to avoid "unused preload" warnings
        const link = Object.assign(document.createElement('link'), { rel: 'prefetch', as: 'image', href });
        document.head.appendChild(link);
        return () => { link.parentNode?.removeChild(link); };
    }, [items, isMobile]);

    // Preload next & reset index
    useEffect(() => {
        if (items.length > 1) setLoadedImages(p => new Set([...p, currentIndex, (currentIndex + 1) % items.length]));
    }, [currentIndex, items.length]);

    useEffect(() => { setCurrentIndex(p => p >= items.length ? 0 : p); }, [items.length]);

    const handleImageLoad = useCallback((i: number) => setLoadedImages(p => new Set([...p, i])), []);
    const getImageSrc = (item: CarouselItem) => normalizeImageUrl(isMobile && item.mobileImage ? item.mobileImage : item.image);
    const navigate = (dir: number) => (e: React.MouseEvent) => { e.preventDefault(); setCurrentIndex(p => (p + dir + items.length) % items.length); };

    if (!items.length) return null;

    const showSkeleton = !loadedImages.size;
    const hasCampaigns = websiteConfig?.campaigns?.some(c => c.status === 'Publish');

    return (
        <div className="max-w-7xl mx-auto px-4 mt-4">
            <div className={`flex gap-4 ${showSkeleton ? 'hidden' : ''}`}>
                <div className="flex-1 min-w-0">
                    <div className={`relative w-full ${isMobile && items.some(i => i.mobileImage) ? 'aspect-[16/9]' : 'aspect-[3/1] sm:aspect-[3/1] md:aspect-[7/2] lg:aspect-[4/1]'} rounded-xl overflow-hidden shadow-lg group bg-gray-100`}>
                        {items.map((item, index) => {
                            const isActive = index === currentIndex;
                            const { href, isExternal } = getCarouselHref(item);
                            const hasMobileImg = isMobile && item.mobileImage;
                            return (
                                <a key={item.id} href={href} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noopener noreferrer' : undefined}
                                   className={`absolute inset-0 transition-transform duration-300 ease-in-out ${isActive ? 'translate-x-0 z-10' : index < currentIndex ? '-translate-x-full z-0' : 'translate-x-full z-0'}`}>
                                    {(loadedImages.has(index) || isActive) && (
                                        <OptimizedImage src={getImageSrc(item)} alt={item.name} width={hasMobileImg ? 800 : 1600} height={hasMobileImg ? 450 : 400}
                                            priority={index === 0} placeholder="blur" objectFit="cover" className="w-full h-full" onLoad={() => handleImageLoad(index)} />
                                    )}
                                </a>
                            );
                        })}
                        {items.length > 1 && (
                            <>
                                <button onClick={navigate(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 w-9 h-9 rounded-full shadow-lg z-20 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center hover:scale-110">
                                    <ChevronLeft size={20} />
                                </button>
                                <button onClick={navigate(1)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 w-9 h-9 rounded-full shadow-lg z-20 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center hover:scale-110">
                                    <ChevronRight size={20} />
                                </button>
                                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
                                    {items.map((_, i) => (
                                        <button key={i} onClick={e => { e.preventDefault(); setCurrentIndex(i); }}
                                            className={`h-2 rounded-full transition-all duration-300 shadow-sm ${i === currentIndex ? 'bg-white w-6' : 'bg-white/50 w-2 hover:bg-white/80'}`} />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
                {hasCampaigns && <UpcomingCampaigns campaigns={websiteConfig?.campaigns} />}
            </div>
            {showSkeleton && <HeroSkeleton />}
        </div>
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
    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full shadow-sm hover:border-secondary-500 hover:shadow-md cursor-pointer transition whitespace-nowrap group">
        <div className="w-7 h-7 rounded-full bg-secondary-50 text-secondary-500 flex items-center justify-center group-hover:rotate-6 transition-transform duration-300">
            {icon}
        </div>
        <span className="text-sm font-bold text-[rgb(var(--color-font-rgb))] group-hover:text-secondary-600 tracking-wide">{name}</span>
    </div>
);

export const SectionHeader: React.FC<{ title: string; className?: string }> = ({ title, className }) => (
    <div className="inline-flex flex-col gap-1">
        <h2 className={`text-2xl font-black tracking-tight text-gray-900 dark:text-white drop-shadow-sm ${className ?? ''}`}>{title}</h2>
        <span className="h-1 w-24 bg-gradient-to-r from-primary-500 via-secondary-500 to-tertiary-500 rounded-full" />
    </div>
);
