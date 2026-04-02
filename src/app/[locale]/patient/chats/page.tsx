import { getTranslations } from 'next-intl/server'
import { getPatientChats } from '@/app/actions/patient'
import { Card, CardContent } from '@/components/ui/card'
import ChatLayout, { type ChatSummary } from '@/components/ChatLayout'

export const dynamic = 'force-dynamic'

export default async function ChatsPage() {
    const t = await getTranslations('patient')
    const { data: chats, userId, error } = await getPatientChats()

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
        const doc = Array.isArray(chat.doctors) ? chat.doctors[0] : chat.doctors
        return {
            id: chat.id,
            name: doc ? `Dr. ${doc.name} ${doc.surname}` : 'Doctor',
            subtitle: doc?.specialization || '',
            initials: doc ? `${doc.name[0]}${doc.surname[0]}`.toUpperCase() : 'DR',
            lastMessage: chat.lastMessage,
        }
    })

    return (
        <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-4">{t('chatsTitle')}</h2>
            <ChatLayout
                chats={chatSummaries}
                currentUserId={userId}
                linkPrefix="/patient/chats"
                emptyText={t('chatsEmpty')}
            />
        </div>
    )
}
