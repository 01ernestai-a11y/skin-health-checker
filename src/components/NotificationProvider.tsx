'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

type NotificationContextType = {
    unreadCounts: Record<string, number>
    totalUnread: number
    markChatAsRead: (chatId: string) => void
}

const NotificationContext = createContext<NotificationContextType>({
    unreadCounts: {},
    totalUnread: 0,
    markChatAsRead: () => {},
})

export function useNotifications() {
    return useContext(NotificationContext)
}

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
    const t = useTranslations('chat')
    const tRef = useRef(t)
    tRef.current = t

    const markChatAsRead = useCallback((chatId: string) => {
        setUnreadCounts(prev => {
            const next = { ...prev }
            delete next[chatId]
            return next
        })
    }, [])

    const totalUnread = Object.values(unreadCounts).reduce((sum, c) => sum + c, 0)

    useEffect(() => {
        const supabase = createClient()
        let channel: ReturnType<typeof supabase.channel> | null = null
        let userId: string | null = null
        let chatIds: string[] = []

        async function setup() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            userId = user.id

            const { data: asPatient } = await supabase
                .from('chats').select('id').eq('patient_id', user.id)
            const { data: asDoctor } = await supabase
                .from('chats').select('id')
                .or(`doctor_id.eq.${user.id},doctor2_id.eq.${user.id}`)

            chatIds = [
                ...(asPatient || []).map(c => c.id),
                ...(asDoctor || []).map(c => c.id),
            ]

            if (chatIds.length === 0) return

            channel = supabase
                .channel('msg-notifications')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'messages',
                    },
                    (payload) => {
                        const msg = payload.new as { chat_id: string; sender_id: string; content: string; image_url?: string }
                        if (!msg.chat_id || !msg.sender_id) return
                        if (msg.sender_id === userId) return
                        if (!chatIds.includes(msg.chat_id)) return

                        const preview = msg.image_url ? '📷' : (msg.content?.substring(0, 60) || '')
                        toast(tRef.current('newMessage'), { description: preview })

                        setUnreadCounts(prev => ({
                            ...prev,
                            [msg.chat_id]: (prev[msg.chat_id] || 0) + 1,
                        }))
                    }
                )
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        console.log('[Notifications] Realtime subscribed')
                    }
                })
        }

        setup()

        return () => {
            if (channel) {
                supabase.removeChannel(channel)
            }
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <NotificationContext.Provider value={{ unreadCounts, totalUnread, markChatAsRead }}>
            {children}
        </NotificationContext.Provider>
    )
}
