'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useNotifications } from '@/components/NotificationProvider'
import ChatRoom from '@/components/ChatRoom'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MessageSquare } from 'lucide-react'

export interface ChatSummary {
    id: string
    name: string
    subtitle?: string
    initials: string
    lastMessage?: {
        content: string
        created_at: string
        sender_id: string
        image_url?: string | null
    } | null
}

interface ChatLayoutProps {
    chats: ChatSummary[]
    currentUserId: string
    linkPrefix: string  // e.g. '/patient/chats' for mobile links
    emptyText: string
}

export default function ChatLayout({ chats, currentUserId, linkPrefix, emptyText }: ChatLayoutProps) {
    const [activeChatId, setActiveChatId] = useState<string | null>(null)
    const { unreadCounts } = useNotifications()
    const t = useTranslations('chat')

    const activeChat = chats.find(c => c.id === activeChatId)

    if (chats.length === 0) {
        return (
            <div className="border-2 border-dashed rounded-xl p-10 text-center text-slate-500">
                {emptyText}
            </div>
        )
    }

    return (
        <div className="h-[calc(100vh-10rem)]">
            {/* ── MOBILE: Chat list with links ── */}
            <div className="md:hidden space-y-2">
                {chats.map((chat) => {
                    const unread = unreadCounts[chat.id] || 0
                    return (
                        <Link key={chat.id} href={`${linkPrefix}/${chat.id}`}>
                            <ChatListItem chat={chat} unread={unread} currentUserId={currentUserId} isActive={false} />
                        </Link>
                    )
                })}
            </div>

            {/* ── DESKTOP: Split view ── */}
            <div className="hidden md:flex h-full border rounded-xl overflow-hidden bg-white shadow-sm">
                {/* Left panel: chat list */}
                <div className="w-80 lg:w-96 border-r flex flex-col shrink-0">
                    <div className="overflow-y-auto flex-1">
                        {chats.map((chat) => {
                            const unread = unreadCounts[chat.id] || 0
                            return (
                                <button
                                    key={chat.id}
                                    onClick={() => setActiveChatId(chat.id)}
                                    className="w-full text-left"
                                >
                                    <ChatListItem
                                        chat={chat}
                                        unread={unread}
                                        currentUserId={currentUserId}
                                        isActive={activeChatId === chat.id}
                                    />
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Right panel: active chat */}
                <div className="flex-1 flex flex-col min-w-0">
                    {activeChatId ? (
                        <ChatRoom
                            chatId={activeChatId}
                            currentUserId={currentUserId}
                            title={activeChat?.name}
                        />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
                            <MessageSquare className="h-10 w-10 text-slate-300" />
                            <p className="text-sm">{t('selectConversation')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function ChatListItem({ chat, unread, currentUserId, isActive }: {
    chat: ChatSummary
    unread: number
    currentUserId: string
    isActive: boolean
}) {
    const t = useTranslations('chat')

    let preview = ''
    if (chat.lastMessage) {
        const isMe = chat.lastMessage.sender_id === currentUserId
        const prefix = isMe ? `${t('you')}: ` : ''
        if (chat.lastMessage.image_url && (!chat.lastMessage.content || chat.lastMessage.content === '📷')) {
            preview = `${prefix}📷`
        } else {
            preview = `${prefix}${chat.lastMessage.content?.substring(0, 40) || ''}`
        }
    }

    return (
        <div className={`flex items-center gap-3 px-4 py-3 border-b transition-colors hover:bg-slate-50 ${isActive ? 'bg-indigo-50/70' : ''}`}>
            <Avatar className="h-10 w-10 shrink-0 border">
                <AvatarFallback className="bg-indigo-100 text-indigo-700 text-sm">
                    {chat.initials}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <span className={`text-sm truncate ${unread > 0 ? 'font-bold text-slate-900' : 'font-medium text-slate-800'}`}>
                        {chat.name}
                    </span>
                    {chat.lastMessage && (
                        <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                            {formatDistanceToNow(new Date(chat.lastMessage.created_at), { addSuffix: false })}
                        </span>
                    )}
                </div>
                <div className="flex items-center justify-between mt-0.5">
                    <p className={`text-xs truncate ${unread > 0 ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                        {preview || chat.subtitle || ''}
                    </p>
                    {unread > 0 && (
                        <span className="ml-2 min-w-5 h-5 flex items-center justify-center rounded-full bg-indigo-600 text-white text-[10px] font-bold px-1.5 shrink-0">
                            {unread > 99 ? '99+' : unread}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
