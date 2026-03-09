'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createOrGetChat } from '@/app/actions/patient'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function StartChatButton({ doctorId }: { doctorId: string }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleStartChat = async () => {
        setLoading(true)
        const { data, error } = await createOrGetChat(doctorId)

        if (error || !data) {
            toast.error('Could not start chat', { description: error })
            setLoading(false)
            return
        }

        router.push(`/patient/chats/${data.id}`)
    }

    return (
        <Button
            variant="default"
            className="w-full bg-slate-900"
            onClick={handleStartChat}
            disabled={loading}
        >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Start Chat"}
        </Button>
    )
}
