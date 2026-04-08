'use client'

import { useState, useEffect, useRef } from 'react'
import { getChatMessages, sendMessage } from '@/app/actions/patient'
import { createClient } from '@/utils/supabase/client'
import { useTranslations } from 'next-intl'
import { useNotifications } from '@/components/NotificationProvider'
import ChatMessage from '@/components/ChatMessage'
import { ChatInput } from '@/components/ChatInput'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2 } from 'lucide-react'

interface ChatRoomProps {
    chatId: string
    currentUserId: string
    title?: string
    avatarUrl?: string | null
    initials?: string
}

export default function ChatRoom({ chatId, currentUserId, title, avatarUrl, initials }: ChatRoomProps) {
    const [messages, setMessages] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const t = useTranslations('patient')
    const { markChatAsRead } = useNotifications()

    // Fetch messages on chatId change
    useEffect(() => {
        setLoading(true)
        getChatMessages(chatId).then(({ data }) => {
            setMessages(data || [])
            setLoading(false)
        })
        markChatAsRead(chatId)
    }, [chatId, markChatAsRead])

    // Subscribe to realtime messages
    useEffect(() => {
        const supabase = createClient()
        const channel = supabase
            .channel(`chat-${chatId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `chat_id=eq.${chatId}`,
                },
                (payload) => {
                    const newMsg = payload.new as any
                    setMessages(prev => {
                        if (prev.some(m => m.id === newMsg.id)) return prev
                        return [...prev, newMsg]
                    })
                    if (newMsg.sender_id !== currentUserId) {
                        markChatAsRead(chatId)
                    }
                }
            )
            .subscribe()

        return () => { channel.unsubscribe() }
    }, [chatId, currentUserId, markChatAsRead])

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    return (
        <div className="flex flex-col h-full">
            {title && (
                <div className="border-b bg-slate-50 py-3 px-4 flex items-center gap-3">
                    <Avatar className="h-9 w-9 border">
                        {avatarUrl && <AvatarImage src={avatarUrl} alt={title} />}
                        <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs">
                            {initials || title.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-slate-500 py-10 text-sm">
                        {t('chatEmpty')}
                    </div>
                ) : (
                    messages.map((msg) => (
                        <ChatMessage
                            key={msg.id}
                            content={msg.content}
                            imageUrl={msg.image_url}
                            createdAt={msg.created_at}
                            isMine={msg.sender_id === currentUserId}
                        />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="border-t bg-white p-3">
                <ChatInput chatId={chatId} />
            </div>
        </div>
    )
}
