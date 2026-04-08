import { getTranslations } from 'next-intl/server'
import { getDoctorChats } from '@/app/actions/doctor'
import { Card, CardContent } from '@/components/ui/card'
import ChatLayout, { type ChatSummary } from '@/components/ChatLayout'

export const dynamic = 'force-dynamic'

export default async function DoctorChatsPage() {
    const t = await getTranslations('doctor')
    const { data: chats, userId, error } = await getDoctorChats()

    if (error || !userId) {
        return (
            <Card className="max-w-3xl mx-auto border-red-200 bg-red-50">
                <CardContent className="pt-6 text-red-600">
                    {error}
                </CardContent>
            </Card>
        )
    }

    const chatSummaries: ChatSummary[] = (chats || []).map((chat: any) => {
        const patient = Array.isArray(chat.patients) ? chat.patients[0] : chat.patients || {}
        return {
            id: chat.id,
            name: `${patient.name || ''} ${patient.surname || ''}`.trim() || 'Patient',
            initials: patient.name ? `${patient.name[0]}${(patient.surname || '')[0] || ''}`.toUpperCase() : 'PT',
            avatarUrl: patient.avatar_url || null,
            lastMessage: chat.lastMessage,
        }
    })

    return (
        <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-4">{t('consultationsTitle')}</h2>
            <ChatLayout
                chats={chatSummaries}
                currentUserId={userId}
                linkPrefix="/doctor/chats"
                emptyText={t('consultationsEmpty')}
            />
        </div>
    )
}
