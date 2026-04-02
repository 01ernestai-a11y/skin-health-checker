import { getTranslations } from 'next-intl/server'
import { getPatientHistory } from '@/app/actions/patient'
import { Card, CardContent } from '@/components/ui/card'
import HealthCheckCard from '@/components/HealthCheckCard'

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

            {checks.map((check: any) => (
                <HealthCheckCard key={check.id} check={check} />
            ))}
        </div>
    )
}
