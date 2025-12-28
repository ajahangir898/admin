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

const ensureProtocol = (url: string) => {
    if (/^https?:\/\//i.test(url)) return url;
    return `https://${url.replace(/^\/*/, '')}`;
};

const buildInternalHref = (url: string): string => {
    if (!url) return '#';
    const trimmed = url.trim();
    if (trimmed.startsWith('#') || trimmed.startsWith('?')) {
        return trimmed;
    }

    // Remove any absolute domain (localhost, staging, etc.)
    const domainStripped = trimmed.replace(/^https?:\/\/[^/]+/i, '');
    const normalized = domainStripped || '/';
    return normalized.startsWith('/') ? normalized : `/${normalized.replace(/^\/*/, '')}`;
};

const getCarouselHref = (item: CarouselItem): { href: string; isExternal: boolean } => {
    const rawUrl = item.url?.trim() || '';
    if (!rawUrl) return { href: '#', isExternal: false };

    if (item.urlType === 'External') {
        return { href: ensureProtocol(rawUrl), isExternal: true };
    }

    return { href: buildInternalHref(rawUrl), isExternal: false };
};

// Countdown timer hook
const useCountdown = (targetDate: string) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isStarted, setIsStarted] = useState(false);

    useEffect(() => {
        const calculateTime = () => {
            const now = new Date().getTime();
            const target = new Date(targetDate).getTime();
            const difference = target - now;

            if (difference <= 0) {
                setIsStarted(true);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            setIsStarted(false);
            setTimeLeft({
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((difference % (1000 * 60)) / 1000)
            });
        };

        calculateTime();
        const timer = setInterval(calculateTime, 1000);
        return () => clearInterval(timer);
    }, [targetDate]);

    return { timeLeft, isStarted };
};

// Campaign Card Component
const CampaignCard: React.FC<{ campaign: Campaign }> = ({ campaign }) => {
    const { timeLeft, isStarted } = useCountdown(campaign.startDate);

    return (
        <a 
            href={campaign.url || '#'} 
            className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
        >
            {/* Campaign Logo */}
            <div className="flex-shrink-0 w-20">
                {campaign.logo ? (
                    <OptimizedImage
                        src={normalizeImageUrl(campaign.logo)}
                        alt={campaign.name}
                        width={80}
                        height={40}
                        className="w-full h-10 object-contain"
                    />
                ) : (
                    <div className="w-full h-10 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-600 truncate px-1">{campaign.name}</span>
                    </div>
                )}
                <p className="text-[10px] text-orange-500 font-medium mt-1">
                    {isStarted ? 'Campaign live!' : 'Campaign starts in'}
                </p>
            </div>
            
            {/* Countdown Timer */}
            <div className="grid grid-cols-2 gap-1">
                <div className="bg-gray-700 text-white text-center rounded px-2 py-1 min-w-[36px]">
                    <span className="text-sm font-bold">{timeLeft.days}d</span>
                </div>
                <div className="bg-gray-700 text-white text-center rounded px-2 py-1 min-w-[36px]">
                    <span className="text-sm font-bold">{timeLeft.hours}h</span>
                </div>
                <div className="bg-gray-700 text-white text-center rounded px-2 py-1 min-w-[36px]">
                    <span className="text-sm font-bold">{timeLeft.minutes}m</span>
                </div>
                <div className="bg-gray-700 text-white text-center rounded px-2 py-1 min-w-[36px]">
                    <span className="text-sm font-bold">{timeLeft.seconds}s</span>
                </div>
            </div>
        </a>
    );
};

// Upcoming Campaigns Sidebar Component
const UpcomingCampaigns: React.FC<{ campaigns?: Campaign[] }> = ({ campaigns }) => {
    const upcomingCampaigns = campaigns
        ?.filter(c => c.status === 'Publish')
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .slice(0, 3) || [];

    if (upcomingCampaigns.length === 0) return null;

    return (
        <div className="hidden lg:flex flex-col w-64 flex-shrink-0">
            <div className="bg-gray-50 rounded-xl p-4 h-full">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Upcoming Campaigns</h3>
                <div className="space-y-3">
                    {upcomingCampaigns.map((campaign) => (
                        <CampaignCard key={campaign.id} campaign={campaign} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export const HeroSection: React.FC<HeroSectionProps> = ({ carouselItems, websiteConfig }) => {
    const items = (carouselItems?.filter(i => i.status === 'Publish').sort((a,b) => a.serial - b.serial) || [])
        .slice(0, MAX_CAROUSEL_ITEMS);
    
    // Debug: Log carousel items when they change
    useEffect(() => {
        if (carouselItems && carouselItems.length > 0) {
            console.log('[HeroSection] Carousel items loaded:', carouselItems.length, 'items');
            console.log('[HeroSection] Published items:', items.length);
            if (items.length > 0) {
                console.log('[HeroSection] First item image URL:', items[0].image);
            }
        }
    }, [carouselItems, items]);
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile viewport
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Auto-advance carousel
    useEffect(() => {
        if (items.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % items.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [items.length]);

    // Preload the first hero image for faster LCP
    useEffect(() => {
        if (!items[0]) return;
        const href = normalizeImageUrl(isMobile && items[0].mobileImage ? items[0].mobileImage : items[0].image);

        // Never preload data URLs (base64) or extremely long URLs.
        // Preloading them can bloat memory and often triggers
        // "preloaded but not used" warnings.
        if (!href || href.startsWith('data:') || href.length > 2048) return;
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = href;
        link.fetchPriority = 'high';
        document.head.appendChild(link);
        return () => {
            if (link.parentNode) {
                document.head.removeChild(link);
            }
        };
    }, [items, isMobile]);

    // Preload next image
    useEffect(() => {
        if (items.length <= 1) return;
        const nextIndex = (currentIndex + 1) % items.length;
        setLoadedImages(prev => new Set([...prev, currentIndex, nextIndex]));
    }, [currentIndex, items.length]);

    // Reset index if items change
    useEffect(() => {
        setCurrentIndex((prev) => (prev >= items.length ? 0 : prev));
    }, [items.length]);

    const handleImageLoad = useCallback((index: number) => {
        setLoadedImages(prev => new Set([...prev, index]));
    }, []);

    // Get the appropriate image for current viewport
    const getImageSrc = (item: CarouselItem) => {
        if (isMobile && item.mobileImage) {
            return normalizeImageUrl(item.mobileImage);
        }
        return normalizeImageUrl(item.image);
    };

    if (items.length === 0) return null;

    // Show skeleton until first image loads
    const showSkeleton = loadedImages.size === 0;
    const hasCampaigns = websiteConfig?.campaigns && websiteConfig.campaigns.filter(c => c.status === 'Publish').length > 0;

    return (
        <div className="max-w-7xl mx-auto px-4 mt-4">
            <div className={`flex gap-4 ${showSkeleton ? 'hidden' : ''}`}>
                {/* Main Carousel */}
                <div className="flex-1 min-w-0">
                    {showSkeleton && <HeroSkeleton />}
                    {/* Full Width Carousel - different aspect ratio for mobile when mobile image exists */}
                    <div className={`relative w-full ${isMobile && items.some(i => i.mobileImage) ? 'aspect-[16/9]' : 'aspect-[3/1] sm:aspect-[3/1] md:aspect-[7/2] lg:aspect-[4/1]'} rounded-xl overflow-hidden shadow-lg group bg-gray-100`}>
                        {items.map((item, index) => {
                            const isActive = index === currentIndex;
                            const shouldLoad = loadedImages.has(index) || isActive;
                            const imageSrc = getImageSrc(item);
                            const hasMobileImage = isMobile && item.mobileImage;
                            const { href, isExternal } = getCarouselHref(item);
                            return (
                                <a
                                    href={href}
                                    target={isExternal ? '_blank' : undefined}
                                    rel={isExternal ? 'noopener noreferrer' : undefined}
                                    key={item.id}
                                    className={`absolute inset-0 transition-opacity duration-500 ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                                >
                                    {shouldLoad && (
                                        <OptimizedImage
                                            src={imageSrc}
                                            alt={item.name}
                                            width={hasMobileImage ? 800 : 1600}
                                            height={hasMobileImage ? 450 : 400}
                                            priority={index === 0}
                                            placeholder="blur"
                                            objectFit="cover"
                                            className="w-full h-full"
                                            onLoad={() => handleImageLoad(index)}
                                        />
                                    )}
                                </a>
                            );
                        })}

                        {items.length > 1 && (
                            <>
                                {/* Navigation Arrows */}
                                <button
                                    onClick={(e) => { e.preventDefault(); setCurrentIndex((prev) => (prev - 1 + items.length) % items.length); }}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 w-9 h-9 rounded-full shadow-lg z-20 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center hover:scale-110"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={(e) => { e.preventDefault(); setCurrentIndex((prev) => (prev + 1) % items.length); }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 w-9 h-9 rounded-full shadow-lg z-20 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center hover:scale-110"
                                >
                                    <ChevronRight size={20} />
                                </button>

                                {/* Dots Navigation */}
                                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
                                    {items.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={(e) => { e.preventDefault(); setCurrentIndex(idx); }}
                                            className={`h-2 rounded-full transition-all duration-300 shadow-sm ${idx === currentIndex ? 'bg-white w-6' : 'bg-white/50 w-2 hover:bg-white/80'}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Upcoming Campaigns Sidebar */}
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
        <div className="flex items-center gap-3">
            <h2 className={`text-2xl font-black tracking-tight text-gray-900 dark:text-white drop-shadow-sm ${className ?? ''}`}>
                {title}
            </h2>
        </div>
        <span className="h-1 w-24 bg-gradient-to-r from-primary-500 via-secondary-500 to-tertiary-500 rounded-full" />
    </div>
);
