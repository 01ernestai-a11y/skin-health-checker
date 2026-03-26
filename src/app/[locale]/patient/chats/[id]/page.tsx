import { getTranslations } from 'next-intl/server'
import { getChatMessages } from '@/app/actions/patient'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'
import { ChatInput } from '@/components/ChatInput'
import { redirect } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default async function ChatRoomPage({ params }: { params: Promise<{ id: string }> }) {
    const t = await getTranslations('patient')
    const { id } = await params
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
        <div className="max-w-3xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
            <Card className="flex-1 flex flex-col border-0 shadow-sm ring-1 ring-slate-200 overflow-hidden">
                <CardHeader className="border-b bg-slate-50 py-4">
                    <CardTitle className="text-lg">{t('chatRoom')}</CardTitle>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-100/50">
                    {(!messages || messages.length === 0) ? (
                        <div className="text-center text-slate-500 py-10">
                            {t('chatEmpty')}
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMine = msg.sender_id === user.id
                            return (
                                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${isMine
                                        ? 'bg-indigo-600 text-white rounded-br-sm'
                                        : 'bg-white text-slate-900 border shadow-sm rounded-bl-sm'
                                        }`}>
                                        {msg.image_url && (
                                            <a href={msg.image_url} target="_blank" rel="noopener noreferrer">
                                                <Image
                                                    src={msg.image_url}
                                                    alt=""
                                                    width={240}
                                                    height={240}
                                                    className="rounded-lg mb-1.5 max-w-[240px] h-auto"
                                                />
                                            </a>
                                        )}
                                        {msg.content && msg.content !== '📷' && (
                                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                        )}
                                        <span className={`text-[10px] mt-1 block ${isMine ? 'text-indigo-200' : 'text-slate-400'}`}>
                                            {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                </div>
                            )
                        })
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
