import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CarouselItem, WebsiteConfig } from '../../types';
import { normalizeImageUrl } from '../../utils/imageUrlHelper';
import { OptimizedImage } from '../OptimizedImage';
import { HeroSkeleton } from '../SkeletonLoaders';

export interface HeroSectionProps {
    carouselItems?: CarouselItem[];
    websiteConfig?: WebsiteConfig;
}

const MAX_CAROUSEL_ITEMS = 3;

export const HeroSection: React.FC<HeroSectionProps> = ({ carouselItems }) => {
    const items = (carouselItems?.filter(i => i.status === 'Publish').sort((a,b) => a.serial - b.serial) || [])
        .slice(0, MAX_CAROUSEL_ITEMS);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));

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
        const href = normalizeImageUrl(items[0].image);
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
    }, [items]);

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

    if (items.length === 0) return null;

    // Show skeleton until first image loads
    const showSkeleton = loadedImages.size === 0;

    return (
        <div className="max-w-7xl mx-auto px-0 mt-4">
            {showSkeleton && <HeroSkeleton />}
            {/* Full Width Carousel - responsive aspect ratio for mobile */}
            <div className={`relative w-full aspect-[3/1] sm:aspect-[3/1] md:aspect-[7/2] lg:aspect-[4/1] rounded-xl overflow-hidden shadow-lg group bg-gray-100 ${showSkeleton ? 'hidden' : ''}`}>
                {items.map((item, index) => {
                    const isActive = index === currentIndex;
                    const shouldLoad = loadedImages.has(index) || isActive;
                    const normalized = normalizeImageUrl(item.image);
                    return (
                        <a
                            href={item.url || '#'}
                            key={item.id}
                            className={`absolute inset-0 transition-opacity duration-500 ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                        >
                            {shouldLoad && (
                                <OptimizedImage
                                    src={normalized}
                                    alt={item.name}
                                    width={1600}
                                    height={400}
                                    priority={index === 0}
                                    placeholder="blur"
                                    objectFit="contain"
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
