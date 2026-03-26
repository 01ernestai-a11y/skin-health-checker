import { getTranslations } from 'next-intl/server'
import { getPatientHealthChecks } from '@/app/actions/doctor'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { Link } from '@/i18n/navigation'
import { ChevronLeft } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default async function DoctorPatientHistoryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const t = await getTranslations('doctor')
    const { data: checks, patient, error } = await getPatientHealthChecks(id)

    const patientName = patient ? `${patient.name} ${patient.surname}` : ''

    if (error) {
        return (
            <Card className="max-w-3xl mx-auto border-red-200 bg-red-50">
                <CardContent className="pt-6 text-red-600">
                    {error}
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Link href="/doctor" className="flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors">
                <ChevronLeft className="w-4 h-4 mr-1" /> {t('backToPatients')}
            </Link>

            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">{t('patientHistory')}</h2>
                {patientName && (
                    <p className="text-slate-500 mt-1">{t('patientHistorySubtitle', { name: patientName })}</p>
                )}
            </div>

            {(!checks || checks.length === 0) ? (
                <Card className="border-dashed">
                    <CardContent className="pt-10 pb-10 text-center text-slate-500">
                        {t('patientHistoryEmpty')}
                    </CardContent>
                </Card>
            ) : (
                checks.map((check: any) => (
                    <Card key={check.id} className="overflow-hidden">
                        <CardHeader className="bg-slate-50 border-b pb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">{t('aiCheck')}</CardTitle>
                                    <CardDescription className="mt-1">
                                        {formatDistanceToNow(new Date(check.created_at), { addSuffix: true })}
                                    </CardDescription>
                                </div>
                                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">
                                    {t('completed')}
                                </Badge>
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
                    </Card>
                ))
            )}
        </div>
    )
}
