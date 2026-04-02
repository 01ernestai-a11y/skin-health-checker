import { getChatMessages } from '@/app/actions/patient'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { ChatInput } from '@/components/ChatInput'
import { redirect } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { ChevronLeft } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import ChatMessage from '@/components/ChatMessage'

export const dynamic = 'force-dynamic'

export default async function DoctorColleagueChatRoomPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const t = await getTranslations('doctor')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: messages, error } = await getChatMessages(id)

    if (error) {
        return (
            <Card className="max-w-3xl mx-auto border-red-200 bg-red-50">
                <CardContent className="pt-6 text-red-600">
                    Failed to load chat: {error}
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="max-w-3xl mx-auto h-[calc(100vh-12rem)] flex flex-col pt-2">
            <Link href="/doctor/colleague-chats" className="flex items-center text-sm text-slate-500 hover:text-slate-900 mb-4 transition-colors">
                <ChevronLeft className="w-4 h-4 mr-1" /> {t('backToDoctorChats')}
            </Link>

            <Card className="flex-1 flex flex-col border-0 shadow-sm ring-1 ring-slate-200 overflow-hidden">
                <CardHeader className="border-b bg-slate-50 py-4">
                    <CardTitle className="text-lg">{t('doctorChatRoom')}</CardTitle>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-100/50">
                    {(!messages || messages.length === 0) ? (
                        <div className="text-center text-slate-500 py-10">
                            {t('doctorChatEmpty')}
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <ChatMessage
                                key={msg.id}
                                content={msg.content}
                                imageUrl={msg.image_url}
                                createdAt={msg.created_at}
                                isMine={msg.sender_id === user.id}
                            />
                        ))
                    )}
                </CardContent>

                <CardFooter className="bg-white border-t p-4">
                    <div className="w-full">
                        <ChatInput chatId={id} />
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
