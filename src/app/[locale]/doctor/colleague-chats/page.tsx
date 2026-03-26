import { getDoctorToDoctorChats } from '@/app/actions/doctor'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { Link } from '@/i18n/navigation'
import { MessageSquareText, Stethoscope } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function DoctorColleagueChatsPage() {
    const t = await getTranslations('doctor')
    const { data: chats, error } = await getDoctorToDoctorChats()

    if (error) {
        return (
            <Card className="max-w-3xl mx-auto border-red-200 bg-red-50">
                <CardContent className="pt-6 text-red-600">
                    Failed to load chats: {error}
                </CardContent>
            </Card>
        )
    }

    if (!chats || chats.length === 0) {
        return (
            <Card className="max-w-3xl mx-auto border-dashed">
                <CardContent className="pt-10 pb-10 text-center text-slate-500">
                    {t('doctorChatsEmpty')}
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">{t('doctorChatsTitle')}</h2>

            <div className="grid gap-4">
                {chats.map((chat: any) => {
                    const doc = chat.otherDoctor || {}
                    return (
                        <Link key={chat.id} href={`/doctor/colleague-chats/${chat.id}`}>
                            <Card className="hover:border-indigo-300 transition-colors cursor-pointer">
                                <CardHeader className="flex flex-row items-center justify-between pb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-indigo-100 p-2.5 rounded-full text-indigo-700">
                                            <Stethoscope className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">
                                                Dr. {doc.name} {doc.surname}
                                            </CardTitle>
                                            {doc.specialization && (
                                                <CardDescription>
                                                    {doc.specialization}
                                                </CardDescription>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-slate-500 mb-1">
                                            {formatDistanceToNow(new Date(chat.created_at), { addSuffix: true })}
                                        </div>
                                        <Badge variant="outline" className="text-indigo-600 border-indigo-200">
                                            Open
                                        </Badge>
                                    </div>
                                </CardHeader>
                            </Card>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
