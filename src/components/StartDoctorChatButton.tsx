'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { createOrGetDoctorChat } from '@/app/actions/doctor'
import { Button } from '@/components/ui/button'
import { Loader2, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

export function StartDoctorChatButton({ doctorId }: { doctorId: string }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const t = useTranslations('doctor')
    const tp = useTranslations('patient')

    const handleStartChat = async () => {
        setLoading(true)
        const { data, error } = await createOrGetDoctorChat(doctorId)

        if (error || !data) {
            toast.error(tp('chatError'), { description: error })
            setLoading(false)
            return
        }

        router.push(`/doctor/colleague-chats/${data.id}`)
    }

    return (
        <Button
            variant="default"
            className="w-full bg-slate-900"
            onClick={handleStartChat}
            disabled={loading}
        >
            {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {t('message')}
                </>
            )}
        </Button>
    )
}
