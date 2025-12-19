// Lazy-loaded StoreChatModal for better code splitting
import React, { useState, useRef, useEffect, useMemo, useCallback, CSSProperties } from 'react';
import { X, Phone, Video, Info, ImageIcon, Smile, Send, Edit2, Trash2, Check, MessageCircle } from 'lucide-react';
import { User as UserType, WebsiteConfig, ChatMessage, ThemeConfig } from '../../types';
import { toast } from 'react-hot-toast';

const buildWhatsAppLink = (rawNumber?: string | null) => {
    if (!rawNumber) return null;
    const sanitized = rawNumber.trim().replace(/[^0-9]/g, '');
    return sanitized ? `https://wa.me/${sanitized}` : null;
};

const hexToRgb = (hex: string) => {
    if (!hex) return '0, 0, 0';
    let sanitized = hex.replace('#', '');
    if (sanitized.length === 3) {
        sanitized = sanitized.split('').map((char) => char + char).join('');
    }
    if (sanitized.length !== 6) return '0, 0, 0';
    const numeric = parseInt(sanitized, 16);
    const r = (numeric >> 16) & 255;
    const g = (numeric >> 8) & 255;
    const b = numeric & 255;
    return `${r}, ${g}, ${b}`;
};

export interface StoreChatModalProps {
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
}

export const StoreChatModal: React.FC<StoreChatModalProps> = ({ 
    isOpen, onClose, websiteConfig, themeConfig, user, messages = [], 
    onSendMessage, context = 'customer', onEditMessage, onDeleteMessage, canDeleteAll = false 
}) => {
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
    const supportHours = websiteConfig?.chatSupportHours ? `${websiteConfig.chatSupportHours.from} — ${websiteConfig.chatSupportHours.to}` : null;
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

    const emojis = ['😀', '😂', '😍', '🥰', '😎', '🤔', '😢', '😡', '👍', '👎', '❤️', '💔', '🎉', '🎊', '✨', '⭐', '🔥', '💯', '😴', '😷', '🤝', '🤮', '🤢', '🤮', '😈', '👿', '💀', '☠️', '👫', '💥', '✅', '❌', '🙌', '🤝', '👏', '🎁', '🎈', '🎀', '🌈', '🌟', '💖', '💙', '💗', '💓', '💞', '🚀', '⚡', '🌺', '🌸', '🌼', '🍕', '🍔', '🍟', '🌮', '🍰', '🍪', '☕', '🍺', '🍻', '🥂', '🍾'];

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
                        <button type="button" onClick={openWhatsApp} className={`p-2 rounded-full text-gray-500 ${baseWhatsAppLink ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`} aria-label="Open WhatsApp" disabled={!baseWhatsAppLink}>
                            <Phone size={18} />
                        </button>
                        <button type="button" onClick={openWhatsApp} className={`p-2 rounded-full text-gray-500 ${baseWhatsAppLink ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`} aria-label="Open WhatsApp video" disabled={!baseWhatsAppLink}>
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
                                const bubbleVariant = isCustomer ? (isCustomerView ? 'customer' : 'admin') : (isSuperAdminMessage ? 'super-admin' : 'admin');
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
                                            {showNameTag && <span className={`text-[11px] font-semibold px-1 ${alignRight ? 'text-[rgba(255,255,255,0.85)]' : 'text-gray-500'}`}>{displayName}</span>}
                                            <div className={`${bubbleClasses}`} data-variant={bubbleVariant}>
                                                {isEditing ? (
                                                    <div className="space-y-2">
                                                        <textarea value={editingDraft} onChange={(e) => setEditingDraft(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white/90 text-sm text-gray-800 p-2 focus:outline-none focus:ring-2 focus:ring-blue-200" rows={2} />
                                                        <div className="flex justify-end gap-2">
                                                            <button type="button" onClick={cancelEditing} className="text-xs font-semibold text-gray-500 hover:text-gray-700">Cancel</button>
                                                            <button type="button" onClick={saveEditing} className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"><Check size={14} /> Save</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="whitespace-pre-line leading-relaxed break-words font-medium">{message.text}</p>
                                                )}
                                                {(canEdit || canDelete) && !isEditing && (
                                                    <div className={`mt-2 flex justify-end gap-2 text-xs ${actionWrapperClass}`}>
                                                        {canEdit && <button type="button" onClick={() => startEditing(message)} className={actionButtonClass} aria-label="Edit message"><Edit2 size={14} /></button>}
                                                        {canDelete && <button type="button" onClick={() => handleDelete(message.id)} className={actionButtonClass} aria-label="Delete message"><Trash2 size={14} /></button>}
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
                                <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`text-gray-500 hover:text-gray-700 transition ${showEmojiPicker ? 'text-blue-500' : ''}`} aria-label="Add emoji">
                                    <Smile size={18} />
                                </button>
                                {showEmojiPicker && (
                                    <div ref={emojiPickerRef} className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-2xl shadow-2xl p-3 z-50 grid grid-cols-8 gap-2 w-80" style={{ right: '-200px' }}>
                                        {emojis.map((emoji) => (
                                            <button key={emoji} onClick={() => handleEmojiClick(emoji)} className="text-2xl hover:bg-gray-100 p-1 rounded transition hover:scale-125" title={emoji}>{emoji}</button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <input type="text" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={handleKeyDown} placeholder={composerPlaceholder} className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400" />
                            <button onClick={handleSend} className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition ${canSend ? 'text-white shadow-md' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`} style={canSend ? { backgroundColor: 'var(--chat-accent)', boxShadow: '0 8px 18px rgba(var(--chat-accent-rgb), 0.25)' } : undefined} aria-label="Send message" disabled={!canSend}>
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

export default StoreChatModal;
