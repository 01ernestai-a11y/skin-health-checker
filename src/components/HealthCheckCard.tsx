'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { shareCheckWithDoctor, getAvailableDoctors } from '@/app/actions/patient'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { Brain, Share2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Image from 'next/image'
import AIChatPanel from '@/components/AIChatPanel'

interface HealthCheckCardProps {
    check: {
        id: string
        photo_url: string
        ai_verdict: string
        ai_chat_history?: Array<{ role: 'user' | 'model'; content: string }> | null
        created_at: string
    }
}

export default function HealthCheckCard({ check }: HealthCheckCardProps) {
    const [showChat, setShowChat] = useState(false)
    const [showShare, setShowShare] = useState(false)
    const [doctors, setDoctors] = useState<any[]>([])
    const [loadingDoctors, setLoadingDoctors] = useState(false)
    const [sharing, setSharing] = useState<string | null>(null)
    const t = useTranslations('patient')
    const router = useRouter()

    const chatHistory = check.ai_chat_history || []

    const handleShowShare = async () => {
        if (showShare) {
            setShowShare(false)
            return
        }
        setLoadingDoctors(true)
        const { data } = await getAvailableDoctors()
        setDoctors(data || [])
        setLoadingDoctors(false)
        setShowShare(true)
    }

    const handleShare = async (doctorId: string) => {
        setSharing(doctorId)
        const result = await shareCheckWithDoctor(check.id, doctorId)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success(t('sharedSuccess'))
            if (result.chatId) {
                router.push(`/patient/chats/${result.chatId}`)
            }
        }
        setSharing(null)
    }

    return (
        <Card className="overflow-hidden">
            <CardHeader className="bg-slate-50 border-b pb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{t('historyCheck')}</CardTitle>
                        <CardDescription className="mt-1">
                            {formatDistanceToNow(new Date(check.created_at), { addSuffix: true })}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        {chatHistory.length > 0 && (
                            <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 text-[10px]">
                                {t('hasAIChat')}
                            </Badge>
                        )}
                        <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">
                            {t('historyCompleted')}
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/3 bg-slate-100 p-4 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col items-center justify-center">
                        <div className="relative w-full aspect-square max-w-[200px] rounded-lg overflow-hidden border border-slate-300 shadow-sm">
                            <Image
                                src={check.photo_url}
                                alt="Skin condition"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                    <div className="w-full md:w-2/3 p-6">
                        <div className="prose prose-sm prose-slate max-w-none prose-p:leading-relaxed">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {check.ai_verdict}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="bg-slate-50 border-t p-4 flex flex-col gap-3">
                <div className="flex gap-2 w-full">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowChat(!showChat)}
                        className="flex-1"
                    >
                        <Brain className="h-4 w-4 mr-1.5" />
                        {showChat ? t('hideAIChat') : (chatHistory.length > 0 ? t('viewAIChat') : t('askAI'))}
                        {showChat ? <ChevronUp className="h-3.5 w-3.5 ml-1" /> : <ChevronDown className="h-3.5 w-3.5 ml-1" />}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShowShare}
                        className="flex-1"
                    >
                        <Share2 className="h-4 w-4 mr-1.5" />
                        {t('shareWithDoctor')}
                        {showShare ? <ChevronUp className="h-3.5 w-3.5 ml-1" /> : <ChevronDown className="h-3.5 w-3.5 ml-1" />}
                    </Button>
                </div>

                {/* Share doctor list */}
                {showShare && (
                    <div className="w-full border rounded-lg bg-white p-3">
                        {loadingDoctors ? (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                            </div>
                        ) : doctors.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center py-2">{t('doctorsEmpty')}</p>
                        ) : (
                            <div className="space-y-2">
                                {doctors.map((doc: any) => (
                                    <div key={doc.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">Dr. {doc.name} {doc.surname}</p>
                                            <p className="text-xs text-slate-500">{doc.specialization}</p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="default"
                                            disabled={sharing === doc.id}
                                            onClick={() => handleShare(doc.id)}
                                        >
                                            {sharing === doc.id ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <Share2 className="h-3.5 w-3.5" />
                                            )}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* AI Chat */}
                {showChat && (
                    <div className="w-full border rounded-lg overflow-hidden">
                        <AIChatPanel
                            photoUrl={check.photo_url}
                            initialReview=""
                            verdict={check.ai_verdict}
                            healthCheckId={check.id}
                            initialMessages={chatHistory}
                        />
                    </div>
                )}
            </CardFooter>
        </Card>
    )
}
