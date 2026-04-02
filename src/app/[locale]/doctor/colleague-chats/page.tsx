import { getTranslations } from 'next-intl/server'
import { getDoctorToDoctorChats } from '@/app/actions/doctor'
import { Card, CardContent } from '@/components/ui/card'
import ChatLayout, { type ChatSummary } from '@/components/ChatLayout'

export const dynamic = 'force-dynamic'

export default async function DoctorColleagueChatsPage() {
    const t = await getTranslations('doctor')
    const { data: chats, userId, error } = await getDoctorToDoctorChats()

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
        const doc = chat.otherDoctor || {}
        return {
            id: chat.id,
            name: doc.name ? `Dr. ${doc.name} ${doc.surname}` : 'Doctor',
            subtitle: doc.specialization || '',
            initials: doc.name ? `${doc.name[0]}${doc.surname[0]}`.toUpperCase() : 'DR',
            lastMessage: chat.lastMessage,
        }
    })

    return (
        <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-4">{t('doctorChatsTitle')}</h2>
            <ChatLayout
                chats={chatSummaries}
                currentUserId={userId}
                linkPrefix="/doctor/colleague-chats"
                emptyText={t('doctorChatsEmpty')}
            />
        </div>
    )
}
