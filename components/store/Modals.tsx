
import React, { useState, useRef, useEffect, useMemo, useCallback, CSSProperties } from 'react';
import { ShoppingCart, Search, User, Facebook, Instagram, Twitter, Linkedin, Truck, X, CheckCircle, Sparkles, Upload, Wand2, Image as ImageIcon, Loader2, ArrowRight, Heart, LogOut, ChevronDown, UserCircle, Phone, Mail, MapPin, Youtube, ShoppingBag, Globe, Star, Eye, Bell, Gift, Users, ChevronLeft, ChevronRight, MessageCircle, Home, Grid, MessageSquare, List, Menu, Smartphone, Mic, Camera, Minus, Plus, Send, Edit2, Trash2, Check, Video, Info, Smile } from 'lucide-react';
import { Product, User as UserType, WebsiteConfig, CarouselItem, Order, ProductVariantSelection, ChatMessage, ThemeConfig } from '../../types';
import { formatCurrency } from '../../utils/format';
import { toast } from 'react-hot-toast';
import { PRODUCTS } from '../../constants';
import { LazyImage } from '../../utils/performanceOptimization';
import { buildWhatsAppLink, hexToRgb } from './helpers';

export const StoreChatModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    websiteConfig?: WebsiteConfig;
    themeConfig?: ThemeConfig;
    user?: UserType | null;
    messages?: ChatMessage[];
    onSendMessage?: (text: string) => void;
    context?: 'customer' | 'admin';
    onEditMessage?: (id: string, text: string) => void;
    onDeleteMessage?: (id: string) => void;
    canDeleteAll?: boolean;
}> = ({ isOpen, onClose, websiteConfig, themeConfig, user, messages = [], onSendMessage, context = 'customer', onEditMessage, onDeleteMessage, canDeleteAll = false }) => {
    const [draft, setDraft] = useState('');
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editingDraft, setEditingDraft] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isCustomerView = context !== 'admin';
    const baseWhatsAppLink = isCustomerView ? buildWhatsAppLink(websiteConfig?.whatsappNumber) : null;
    const chatEnabled = isCustomerView ? (websiteConfig?.chatEnabled ?? true) : true;
    const whatsappFallbackLink = websiteConfig?.chatWhatsAppFallback ? baseWhatsAppLink : null;
    const storeName = websiteConfig?.websiteName || 'Our Store';
    const supportHours = websiteConfig?.chatSupportHours ? `${websiteConfig.chatSupportHours.from} – ${websiteConfig.chatSupportHours.to}` : null;
    const displayMessages = messages;
    const normalizedUserEmail = user?.email?.toLowerCase();
    const chatContactName = websiteConfig?.websiteName || 'Support Team';
    const statusLine = websiteConfig?.chatGreeting || (supportHours ? `Typically replies ${supportHours}` : 'Active now');
    const chatInitial = chatContactName.charAt(0).toUpperCase();
    const chatShellStyle = useMemo(() => {
        const fallbackAccent = themeConfig?.primaryColor || '#0084ff';
        const accentHex = websiteConfig?.chatAccentColor || fallbackAccent;
        const accentRgb = hexToRgb(accentHex);
        const fallbackSurface = themeConfig?.surfaceColor || '#f5f6f7';
        const surfaceColor = websiteConfig?.chatSurfaceColor || `rgba(${hexToRgb(fallbackSurface)}, 0.96)`;
        const borderColor = websiteConfig?.chatBorderColor || `rgba(${accentRgb}, 0.18)`;
        const shadowColor = websiteConfig?.chatShadowColor || `rgba(${accentRgb}, 0.28)`;
        return {
            '--chat-accent': accentHex,
            '--chat-accent-rgb': accentRgb,
            '--chat-surface': surfaceColor,
            '--chat-border': borderColor,
            '--chat-shadow': shadowColor
        } as CSSProperties;
    }, [themeConfig?.primaryColor, themeConfig?.surfaceColor, websiteConfig?.chatAccentColor, websiteConfig?.chatSurfaceColor, websiteConfig?.chatBorderColor, websiteConfig?.chatShadowColor]);
    const composerPlaceholder = isCustomerView
        ? (user ? `Reply as ${user.name}` : 'Write a message...')
        : 'Reply to the customer...';
    const openWhatsApp = useCallback(() => {
        if (!baseWhatsAppLink || typeof window === 'undefined') return;
        window.open(baseWhatsAppLink, '_blank', 'noopener,noreferrer');
    }, [baseWhatsAppLink]);
    const showChatInfo = useCallback(() => {
        toast.custom(() => (
            <div className="max-w-sm rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-xl text-sm text-gray-700">
                <p className="font-semibold text-gray-900 mb-2">How live chat works</p>
                <ul className="list-disc pl-4 space-y-1">
                    <li>Messages sync in real-time between customer and admin.</li>
                    <li>Tap and hold on your own replies to edit or delete them.</li>
                    <li>Use the call or video icons to jump into WhatsApp if you need faster support.</li>
                </ul>
            </div>
        ), { duration: 6000 });
    }, []);
    const canSend = Boolean(draft.trim() && (chatEnabled || !isCustomerView));

    useEffect(() => {
        if (!isOpen) return;
        const timeout = setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 80);
        return () => clearTimeout(timeout);
    }, [isOpen, messages.length]);

    useEffect(() => {
        if (!showEmojiPicker) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showEmojiPicker]);

    useEffect(() => {
        if (!editingMessageId) return;
        const targetExists = displayMessages.some((message) => message.id === editingMessageId);
        if (!targetExists) {
            setEditingMessageId(null);
            setEditingDraft('');
        }
    }, [displayMessages, editingMessageId]);

    const handleSend = useCallback(() => {
        const text = draft.trim();
        if (!text || !onSendMessage || (!chatEnabled && isCustomerView)) return;
        onSendMessage(text);
        setDraft('');
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 10);
    }, [draft, onSendMessage, chatEnabled, isCustomerView]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    const handleEmojiClick = (emoji: string) => {
        setDraft(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    const startEditing = (message: ChatMessage) => {
        setEditingMessageId(message.id);
        setEditingDraft(message.text);
    };

    const cancelEditing = () => {
        setEditingMessageId(null);
        setEditingDraft('');
    };

    const saveEditing = () => {
        if (!editingMessageId || !onEditMessage) return;
        const trimmed = editingDraft.trim();
        if (!trimmed) return;
        onEditMessage(editingMessageId, trimmed);
        setEditingMessageId(null);
        setEditingDraft('');
    };

    const handleDelete = (id: string) => {
        onDeleteMessage?.(id);
        if (editingMessageId === id) {
            cancelEditing();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-0 sm:px-4">
            <div className="live-chat-shell bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl flex flex-col h-[75vh] sm:h-[560px]" style={chatShellStyle}>
                <div className="live-chat-header flex items-center justify-between px-4 sm:px-5 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white to-[rgba(var(--chat-accent-rgb),0.18)] border border-white shadow-sm flex items-center justify-center text-sm font-semibold text-[color:var(--chat-accent)]">
                            {chatInitial}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">{chatContactName}</p>
                            <p className="text-xs text-gray-500">{statusLine}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={openWhatsApp}
                            className={`p-2 rounded-full text-gray-500 ${baseWhatsAppLink ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`}
                            aria-label="Open WhatsApp"
                            disabled={!baseWhatsAppLink}
                        >
                            <Phone size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={openWhatsApp}
                            className={`p-2 rounded-full text-gray-500 ${baseWhatsAppLink ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`}
                            aria-label="Open WhatsApp video"
                            disabled={!baseWhatsAppLink}
                        >
                            <Video size={18} />
                        </button>
                        <button type="button" onClick={showChatInfo} className="p-2 rounded-full text-gray-500 hover:bg-gray-100" aria-label="Chat usage tips">
                            <Info size={18} />
                        </button>
                        <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100" aria-label="Close chat">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {!chatEnabled && isCustomerView && (
                    <div className="bg-amber-50 text-amber-700 text-sm px-5 py-3 border-b border-amber-100">
                        {websiteConfig?.chatOfflineMessage || 'Our agents are currently offline. Please try again later or use the fallback options below.'}
                    </div>
                )}

                <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4" style={{ background: 'var(--chat-surface)' }}>
                    {displayMessages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center text-sm text-gray-500 gap-2">
                            <p className="text-base font-semibold text-gray-600">Start the conversation</p>
                            <p className="text-xs text-gray-500 max-w-xs">Send a message to {storeName} and we will reply as soon as possible.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {displayMessages.map((message) => {
                                const isCustomer = message.sender === 'customer';
                                const isOwnMessage = normalizedUserEmail && message.authorEmail?.toLowerCase() === normalizedUserEmail;
                                const isSuperAdminMessage = message.authorRole === 'super_admin' || message.authorEmail?.toLowerCase() === 'admin@systemnextit.com';
                                const alignRight = isCustomerView ? isCustomer : isSuperAdminMessage;
                                const bubbleVariant = isCustomer
                                    ? (isCustomerView ? 'customer' : 'admin')
                                    : (isSuperAdminMessage ? 'super-admin' : 'admin');
                                const bubbleClasses = `live-chat-bubble ${alignRight ? 'ml-auto rounded-br-sm' : 'rounded-bl-sm'}`;
                                const rawDisplayName = isOwnMessage ? 'You' : (message.authorName || (message.sender === 'admin' ? 'Support Team' : message.customerName || 'Customer'));
                                const displayName = !isCustomerView && isSuperAdminMessage ? 'Super Admin' : rawDisplayName;
                                const canEdit = Boolean(isOwnMessage && onEditMessage);
                                const canDelete = Boolean(onDeleteMessage && (isOwnMessage || (!isCustomerView && canDeleteAll)));
                                const isEditing = editingMessageId === message.id;
                                const actionWrapperClass = alignRight ? 'text-white/80' : 'text-gray-400';
                                const actionButtonClass = alignRight ? 'text-white/80 hover:text-white' : 'text-gray-400 hover:text-gray-600';
                                const timestampColorClass = alignRight ? 'text-white/80' : 'text-gray-500';
                                const timestampAlignClass = alignRight ? 'text-right' : 'text-left';
                                const showNameTag = !isCustomerView && (!isSuperAdminMessage || isCustomer);
                                const shouldShowAvatar = showNameTag && !alignRight;
                                const avatarInitial = (message.authorName || message.customerName || 'A').charAt(0).toUpperCase();
                                return (
                                    <div key={message.id} className={`flex ${alignRight ? 'justify-end' : 'justify-start'} gap-2`}>
                                        {shouldShowAvatar && (
                                            <div className="pt-1 hidden sm:flex">
                                                <div className="h-8 w-8 rounded-full bg-white text-gray-600 text-xs font-semibold flex items-center justify-center shadow ring-1 ring-gray-100">
                                                    {avatarInitial}
                                                </div>
                                            </div>
                                        )}
                                        <div className="max-w-[80%] space-y-1">
                                            {showNameTag && (
                                                <span className={`text-[11px] font-semibold px-1 ${alignRight ? 'text-[rgba(255,255,255,0.85)]' : 'text-gray-500'}`}>
                                                    {displayName}
                                                </span>
                                            )}
                                            <div className={`${bubbleClasses}`} data-variant={bubbleVariant}>
                                                {isEditing ? (
                                                    <div className="space-y-2">
                                                        <textarea
                                                            value={editingDraft}
                                                            onChange={(e) => setEditingDraft(e.target.value)}
                                                            className="w-full rounded-xl border border-gray-200 bg-white/90 text-sm text-gray-800 p-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                                            rows={2}
                                                        />
                                                        <div className="flex justify-end gap-2">
                                                            <button type="button" onClick={cancelEditing} className="text-xs font-semibold text-gray-500 hover:text-gray-700">Cancel</button>
                                                            <button type="button" onClick={saveEditing} className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                                                <Check size={14} /> Save
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="whitespace-pre-line leading-relaxed break-words font-medium">{message.text}</p>
                                                )}
                                                {(canEdit || canDelete) && !isEditing && (
                                                    <div className={`mt-2 flex justify-end gap-2 text-xs ${actionWrapperClass}`}>
                                                        {canEdit && (
                                                            <button type="button" onClick={() => startEditing(message)} className={actionButtonClass} aria-label="Edit message">
                                                                <Edit2 size={14} />
                                                            </button>
                                                        )}
                                                        {canDelete && (
                                                            <button type="button" onClick={() => handleDelete(message.id)} className={actionButtonClass} aria-label="Delete message">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className={`text-[11px] ${timestampColorClass} ${timestampAlignClass} px-1`}>
                                                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {message.editedAt ? ' • Edited' : ''}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                    {displayMessages.length === 0 && <div ref={messagesEndRef} />}
                </div>

                <div className="px-4 pb-5 pt-3 border-t border-gray-100 bg-white">
                    {chatEnabled || !isCustomerView ? (
                        <div className="live-chat-input flex items-center gap-3 px-4 py-2 relative">
                            <button type="button" className="text-gray-500 hover:text-gray-700" aria-label="Attach image">
                                <ImageIcon size={18} />
                            </button>
                            <div className="relative">
                                <button 
                                    type="button" 
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className={`text-gray-500 hover:text-gray-700 transition ${showEmojiPicker ? 'text-blue-500' : ''}`}
                                    aria-label="Add emoji"
                                >
                                    <Smile size={18} />
                                </button>
                                {showEmojiPicker && (
                                    <div 
                                        ref={emojiPickerRef}
                                        className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-2xl shadow-2xl p-3 z-50 grid grid-cols-8 gap-2 w-80"
                                        style={{ right: '-200px' }}
                                    >
                                        {['😀', '😂', '😍', '🥰', '😎', '🤔', '😢', '😡', '👍', '👎', '❤️', '💔', '🎉', '🎊', '✨', '⭐', '🔥', '💯', '😴', '😷', '🤐', '🤮', '🤢', '🤮', '😈', '👿', '💀', '☠️', '💫', '💥', '✅', '❌', '🙌', '🤝', '👏', '🎁', '🎈', '🎀', '🌈', '🌟', '💖', '💝', '💗', '💓', '💞', '🚀', '⚡', '🌺', '🌸', '🌼', '🍕', '🍔', '🍟', '🌮', '🍰', '🍪', '☕', '🍺', '🍻', '🥂', '🍾'].map((emoji) => (
                                            <button
                                                key={emoji}
                                                onClick={() => handleEmojiClick(emoji)}
                                                className="text-2xl hover:bg-gray-100 p-1 rounded transition hover:scale-125"
                                                title={emoji}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <input
                                type="text"
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={composerPlaceholder}
                                className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400"
                            />
                            <button
                                onClick={handleSend}
                                className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition ${canSend ? 'text-white shadow-md' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                style={canSend ? { backgroundColor: 'var(--chat-accent)', boxShadow: '0 8px 18px rgba(var(--chat-accent-rgb), 0.25)' } : undefined}
                                aria-label="Send message"
                                disabled={!canSend}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="text-sm text-gray-600 space-y-3">
                            <p>Need urgent help? You can still reach us via the options below:</p>
                            {whatsappFallbackLink && (
                                <a href={whatsappFallbackLink} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-green-500 text-green-700 py-2 font-semibold">
                                    <MessageCircle size={16} /> Chat on WhatsApp
                                </a>
                            )}
                            <p className="text-xs text-gray-400">Leave your message and we will respond once we are online.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const ProductQuickViewModal: React.FC<{
    product: Product;
    onClose: () => void;
    onCompleteOrder: (product: Product, quantity: number, variant: ProductVariantSelection) => void;
    onViewDetails?: (product: Product) => void;
}> = ({ product, onClose, onCompleteOrder, onViewDetails }) => {
    const [selectedColor, setSelectedColor] = useState<string>(product.variantDefaults?.color || product.colors?.[0] || 'Default');
    const [selectedSize, setSelectedSize] = useState<string>(product.variantDefaults?.size || product.sizes?.[0] || 'Standard');
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        setSelectedColor(product.variantDefaults?.color || product.colors?.[0] || 'Default');
        setSelectedSize(product.variantDefaults?.size || product.sizes?.[0] || 'Standard');
        setQuantity(1);
    }, [product]);

    const handleQuantityChange = (delta: number) => {
        setQuantity(prev => Math.max(1, prev + delta));
    };

    const variant: ProductVariantSelection = {
        color: selectedColor || 'Default',
        size: selectedSize || 'Standard'
    };
    const quickPrice = formatCurrency(product.price);
    const quickOriginalPrice = formatCurrency(product.originalPrice, null);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden grid grid-cols-1 lg:grid-cols-2">
                <button aria-label="Close" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={22} />
                </button>
                <div className="p-6 lg:p-10 bg-gray-50 flex flex-col items-center justify-center">
                    <div className="relative w-full max-w-sm">
                        <div className="absolute inset-6 bg-gradient-to-br from-emerald-200/40 via-transparent to-transparent blur-3xl" aria-hidden />
                        <img src={product.galleryImages?.[0] || product.image} alt={product.name} className="relative w-full h-80 object-contain" />
                    </div>
                    <div className="mt-4 flex gap-2 text-xs text-gray-500">
                        <span className="px-3 py-1 rounded-full bg-white border border-gray-200">Ships 48h</span>
                        <span className="px-3 py-1 rounded-full bg-white border border-gray-200">Secure Payment</span>
                    </div>
                </div>

                <div className="p-6 lg:p-10 space-y-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Quick view</p>
                        <h3 className="text-2xl font-black text-gray-900 mt-2">{product.name}</h3>
                        <p className="text-sm text-gray-500 mt-2 line-clamp-3">{product.description}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-3xl font-black text-gray-900">৳ {quickPrice}</span>
                        {quickOriginalPrice && (
                            <span className="text-sm line-through text-gray-400">৳ {quickOriginalPrice}</span>
                        )}
                    </div>

                    {product.colors && product.colors.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Color</p>
                            <div className="flex flex-wrap gap-2">
                                {product.colors.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setSelectedColor(color)}
                                        className={`w-8 h-8 rounded-full border-2 ${selectedColor === color ? 'border-emerald-500' : 'border-transparent'} shadow-sm`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {product.sizes && product.sizes.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Size</p>
                            <div className="flex flex-wrap gap-2">
                                {product.sizes.map(size => (
                                    <button
                                        key={size}
                                        type="button"
                                        onClick={() => setSelectedSize(size)}
                                        className={`px-3 py-1.5 rounded-xl border text-sm font-semibold ${selectedSize === size ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 'border-gray-200 text-gray-600'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase">Quantity</p>
                        <div className="flex items-center rounded-full border border-gray-200">
                            <button type="button" onClick={() => handleQuantityChange(-1)} className="p-2 text-gray-500 hover:text-gray-900">
                                <Minus size={16} />
                            </button>
                            <span className="px-4 text-sm font-bold text-gray-900">{quantity}</span>
                            <button type="button" onClick={() => handleQuantityChange(1)} className="p-2 text-gray-500 hover:text-gray-900">
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            type="button"
                            onClick={() => onCompleteOrder(product, quantity, variant)}
                            className="w-full btn-order py-3 rounded-2xl font-bold text-base shadow-[0_18px_28px_rgba(16,185,129,0.25)]"
                        >
                            Complete Order
                        </button>
                        <button
                            type="button"
                            onClick={() => { onViewDetails?.(product); }}
                            className="w-full py-3 rounded-2xl border border-gray-200 text-gray-700 font-semibold hover:border-emerald-400"
                        >
                            View Full Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const LoginModal: React.FC<{ onClose: () => void, onLogin: (e: string, p: string) => Promise<boolean>, onRegister: (u: UserType) => Promise<boolean>, onGoogleLogin?: () => Promise<boolean> }> = ({ onClose, onLogin, onRegister, onGoogleLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', address: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);
        setIsSubmitting(true);
        try {
            const success = isLogin
                ? await onLogin(formData.email.trim(), formData.password)
                : await onRegister({ ...formData, role: 'customer' });
            if (success) {
                onClose();
            } else {
                setErrorMessage(isLogin ? 'Invalid credentials. Please try again.' : 'Unable to create account.');
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
            setErrorMessage(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
                <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
                <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    <p className="text-gray-500 mb-6 text-sm">{isLogin ? 'Login to continue shopping' : 'Sign up to get started'}</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <>
                                <input type="text" placeholder="Full Name" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgba(var(--color-primary-rgb),0.4)]" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                                <input type="text" placeholder="Phone" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgba(var(--color-primary-rgb),0.4)]" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                            </>
                        )}
                        <input type="email" placeholder="Email Address" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgba(var(--color-primary-rgb),0.4)]" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                        <input type="password" placeholder="Password" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgba(var(--color-primary-rgb),0.4)]" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                        
                        <button type="submit" disabled={isSubmitting} className="w-full btn-order py-3 rounded-xl font-bold shadow-[0_18px_28px_rgba(var(--color-primary-rgb),0.25)] disabled:opacity-60 disabled:cursor-not-allowed">
                            {isSubmitting ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
                        </button>
                        {errorMessage && (
                            <p className="text-sm text-red-500 text-center">{errorMessage}</p>
                        )}
                    </form>

                    {onGoogleLogin && (
                        <div className="mt-6">
                            <div className="relative flex items-center justify-center mb-3">
                                <span className="px-3 text-xs text-gray-400 bg-white">OR</span>
                                <div className="absolute left-0 right-0 h-px bg-gray-200" aria-hidden />
                            </div>
                            <button
                                type="button"
                                onClick={async () => {
                                    if (!onGoogleLogin) return;
                                    setErrorMessage(null);
                                    setIsGoogleLoading(true);
                                    try {
                                        const success = await onGoogleLogin();
                                        if (success) {
                                            onClose();
                                        }
                                    } catch (error: any) {
                                        setErrorMessage(error?.message || 'Unable to continue with Google.');
                                    } finally {
                                        setIsGoogleLoading(false);
                                    }
                                }}
                                disabled={isGoogleLoading}
                                className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <svg width="20" height="20" viewBox="0 0 18 18" aria-hidden>
                                    <path d="M17.64 9.2045c0-.638-.0573-1.2517-.1636-1.8409H9v3.4818h4.8436c-.2091 1.125-.8436 2.0782-1.7968 2.7168v2.2582h2.9086c1.7018-1.5668 2.6846-3.8745 2.6846-6.6159z" fill="#4285F4" />
                                    <path d="M9 18c2.43 0 4.4673-.8063 5.9564-2.1791l-2.9086-2.2582c-.8059.54-1.8377.8618-3.0478.8618-2.3445 0-4.3282-1.5832-5.0364-3.7105H.9573v2.3313C2.4382 15.9827 5.4818 18 9 18z" fill="#34A853" />
                                    <path d="M3.9636 10.7141c-.18-.54-.2823-1.1168-.2823-1.7141 0-.5973.1023-1.1741.2823-1.7141V4.9545H.9573C.3477 6.1745 0 7.5473 0 9s.3477 2.8255.9573 4.0455l3.0063-2.3314z" fill="#FBBC05" />
                                    <path d="M9 3.5455c1.3214 0 2.5073.4546 3.4405 1.345l2.5809-2.5809C13.4646.8973 11.4273 0 9 0 5.4818 0 2.4382 2.0177.9573 4.9545l3.0063 2.3314C4.6718 5.1286 6.6555 3.5455 9 3.5455z" fill="#EA4335" />
                                </svg>
                                {isGoogleLoading ? 'Connecting...' : 'Continue with Google'}
                            </button>
                        </div>
                    )}

                    <div className="mt-6 text-center text-sm text-gray-600">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button onClick={() => setIsLogin(!isLogin)} className="text-[rgb(var(--color-primary-rgb))] font-bold hover:underline">
                            {isLogin ? 'Sign Up' : 'Login'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const TrackOrderModal: React.FC<{ onClose: () => void, orders?: Order[] }> = ({ onClose, orders }) => {
    const [orderId, setOrderId] = useState('');
    const [result, setResult] = useState<Order | null>(null);
    const [searched, setSearched] = useState(false);

    const handleTrack = () => {
        setSearched(true);
        const found = orders?.find(o => o.id === orderId);
        setResult(found || null);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
                <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-1">
                        <Truck size={28} className="text-purple-600" />
                        <h2 className="text-2xl font-bold text-gray-800">Track Order</h2>
                    </div>
                    
                    <div className="flex gap-2 mb-6">
                        <input 
                          type="text" 
                          placeholder="Enter Order ID (e.g. #0024)" 
                          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={orderId}
                          onChange={e => setOrderId(e.target.value)}
                        />
                        <button onClick={handleTrack} className="bg-purple-600 text-black-600 px-4 py-2 rounded-lg font-bold hover:bg-purple-700 shadow-lg">Track</button>
                    </div>

                    {searched && (
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            {result ? (
                                <div className="space-y-2">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 text-green-600">
                                        <CheckCircle size={24} />
                                    </div>
                                    <p className="font-bold text-gray-800">Order Found!</p>
                                    <p className="text-sm text-gray-600">Status: <span className="font-bold text-purple-600">{result.status}</span></p>
                                    <p className="text-xs text-gray-500">Date: {result.date}</p>
                                    <p className="text-xs text-gray-500">Amount: ৳{result.amount}</p>
                                </div>
                            ) : (
                                <div className="text-gray-500">
                                    <p>Order not found. Please check the ID.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

let cachedGoogleGenAI: typeof import('@google/generative-ai').GoogleGenerativeAI | null = null; // eslint-disable-line import/no-unresolved
const loadGoogleGenAI = async () => {
    if (cachedGoogleGenAI) return cachedGoogleGenAI;
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    cachedGoogleGenAI = GoogleGenerativeAI;
    return cachedGoogleGenAI;
};

export const AIStudioModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const defaultEnvKey =
        import.meta.env.VITE_GOOGLE_AI_API_KEY ||
        import.meta.env.VITE_GOOGLE_API_KEY ||
        process.env.VITE_GOOGLE_AI_API_KEY ||
        process.env.VITE_GOOGLE_API_KEY ||
        process.env.API_KEY ||
        '';
    const [customKey, setCustomKey] = useState('');
    const activeApiKey = customKey || defaultEnvKey;

    const generateImage = async () => {
        if (!prompt) return;
        if (!activeApiKey) {
            setErrorMessage('No Google AI API key configured. Add VITE_GOOGLE_AI_API_KEY to your .env or paste a key below.');
            return;
        }
        setLoading(true);
        setErrorMessage(null);
        try {
            const GoogleGenAI = await loadGoogleGenAI();
            if (!GoogleGenAI) {
                setErrorMessage('Failed to load Google GenAI SDK. Please refresh and try again.');
                return;
            }
            const ai = new GoogleGenAI(activeApiKey);
            const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash-image' });

            const result = await model.generateContent([{ text: prompt }]);
            const response = result.response;

            // Extract image from response parts
            // Guidelines say: The output response may contain both image and text parts; you must iterate...
            const parts = response?.candidates?.[0]?.content?.parts;
            if (parts) {
                for (const part of parts) {
                    if (part.inlineData?.data) {
                        const base64EncodeString = part.inlineData.data;
                        setImageUrl(`data:image/png;base64,${base64EncodeString}`);
                        break;
                    }
                }
            }
        } catch (error: any) {
            console.error("AI Generation failed", error);
            const status = error?.status || error?.response?.status;
            if (status === 403 && error?.error?.error?.status !== 'RESOURCE_EXHAUSTED') {
                setErrorMessage('This API key is blocked from calling the Generative Language API. Enable the API for your Google Cloud project or use a different unrestricted key.');
            } else {
                setErrorMessage(`Failed to generate image. ${error?.message || 'Check API key configuration.'}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex overflow-hidden border border-gray-800">
                <div className="w-80 bg-gray-800 p-6 flex flex-col border-r border-gray-700">
                    <div className="flex items-center gap-2 mb-6 text-white">
                        <Sparkles className="text-purple-400" />
                        <h2 className="font-bold text-lg">AI Studio</h2>
                    </div>
                    
                    <div className="space-y-4 flex-1">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Google AI API Key</label>
                            <input
                                type="password"
                                placeholder="Paste VITE_GOOGLE_AI_API_KEY"
                                value={customKey}
                                onChange={(e) => setCustomKey(e.target.value.trim())}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                            />
                            <p className="text-[11px] text-gray-500 mt-1">Key is held in memory for this session only. Leave blank to use the bundled env key.</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Prompt</label>
                            <textarea
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500 focus:outline-none resize-none h-32"
                                placeholder="Describe the image you want to generate..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={generateImage}
                            disabled={loading || !prompt}
                            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold transition flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                            Generate
                        </button>
                        {errorMessage && (
                            <div className="text-xs text-red-400 bg-red-950/30 border border-red-500/30 rounded-lg p-3">
                                {errorMessage}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex-1 bg-black flex items-center justify-center relative">
                    {imageUrl ? (
                        <img src={imageUrl} alt="Generated" className="max-w-full max-h-full object-contain" />
                    ) : (
                        <div className="text-center text-gray-600">
                            <ImageIcon size={64} className="mx-auto mb-4 opacity-20" />
                            <p>Generated image will appear here</p>
                        </div>
                    )}
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export const AddToCartSuccessModal: React.FC<{ product: Product; onClose: () => void; onCheckout: () => void; variant?: ProductVariantSelection | null; quantity?: number }> = ({ product, onClose, onCheckout, variant, quantity }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                    <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Added to Cart!</h3>
                <p className="text-gray-600 text-sm mb-2">{product.name} has been added to your cart.</p>
                {variant && (
                    <p className="text-xs text-gray-500 mb-4">Variant: <span className="font-semibold text-gray-700">{variant.color} / {variant.size}</span>{quantity ? ` • Qty: ${quantity}` : ''}</p>
                )}
                
                <div className="flex gap-3">
                    <button 
                        onClick={onClose} 
                        className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition"
                    >
                        Continue Shopping
                    </button>
                    <button 
                        onClick={onCheckout} 
                        className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 transition"
                    >
                        Checkout
                    </button>
                </div>
            </div>
        </div>
    );
};
