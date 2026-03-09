import { getPatientChats } from '@/app/actions/patient'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { MessageSquareText } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ChatsPage() {
    const { data: chats, error } = await getPatientChats()

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
                    You don't have any active consultations yet.
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Your Consultations</h2>

            <div className="grid gap-4">
                {chats.map((chat) => {
                    const doctorRaw: any = chat.doctors
                    const doctor: any = Array.isArray(doctorRaw) ? doctorRaw[0] : doctorRaw
                    return (
                        <Link key={chat.id} href={`/patient/chats/${chat.id}`}>
                            <Card className="hover:border-indigo-300 transition-colors cursor-pointer">
                                <CardHeader className="flex flex-row items-center justify-between pb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-indigo-100 p-2.5 rounded-full text-indigo-700">
                                            <MessageSquareText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">
                                                Dr. {doctor.name} {doctor.surname}
                                            </CardTitle>
                                            <CardDescription>
                                                {doctor.specialization}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-slate-500 mb-1">
                                            Updated {formatDistanceToNow(new Date(chat.updated_at), { addSuffix: true })}
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
