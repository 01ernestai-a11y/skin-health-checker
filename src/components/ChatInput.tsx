'use client'

import { useState } from 'react'
import { sendMessage } from '@/app/actions/patient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Loader2 } from 'lucide-react'
import { usePathname } from 'next/navigation'

export function ChatInput({ chatId }: { chatId: string }) {
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)
    const path = usePathname()

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim()) return

        setLoading(true)
        const result = await sendMessage(chatId, content, path)
        setLoading(false)

        if (!result.error) {
            setContent('')
        }
    }

    return (
        <form onSubmit={handleSend} className="flex gap-2">
            <Input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                disabled={loading}
            />
            <Button type="submit" disabled={loading || !content.trim()}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
        </form>
    )
}
