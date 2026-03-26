import { getTranslations } from 'next-intl/server'
import { getPatientHistory } from '@/app/actions/patient'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default async function HistoryPage() {
    const t = await getTranslations('patient')
    const { data: checks, error } = await getPatientHistory()

    if (error) {
        return (
            <Card className="max-w-3xl mx-auto border-red-200 bg-red-50">
                <CardContent className="pt-6 text-red-600">
                    Failed to load history: {error}
                </CardContent>
            </Card>
        )
    }

    if (!checks || checks.length === 0) {
        return (
            <Card className="max-w-3xl mx-auto border-dashed">
                <CardContent className="pt-10 pb-10 text-center text-slate-500">
                    {t('historyEmpty')}
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">{t('historyTitle')}</h2>

            {checks.map((check) => (
                <Card key={check.id} className="overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b pb-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-lg">{t('historyCheck')}</CardTitle>
                                <CardDescription className="mt-1">
                                    {formatDistanceToNow(new Date(check.created_at), { addSuffix: true })}
                                </CardDescription>
                            </div>
                            <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">
                                {t('historyCompleted')}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                            {/* Photo Side */}
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

                            {/* Verdict Side */}
                            <div className="w-full md:w-2/3 p-6">
                                <div className="prose prose-sm prose-slate max-w-none prose-p:leading-relaxed">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {check.ai_verdict}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
