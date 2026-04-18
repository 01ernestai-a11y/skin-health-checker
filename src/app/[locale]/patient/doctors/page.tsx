import { getTranslations } from 'next-intl/server'
import { getAvailableDoctors } from '@/app/actions/patient'
import { Card, CardContent } from '@/components/ui/card'
import DoctorsList from './DoctorsList'

export const dynamic = 'force-dynamic'

export default async function DoctorsPage() {
    const t = await getTranslations('patient')
    const { data: doctors, error } = await getAvailableDoctors()

    if (error) {
        return (
            <Card className="max-w-3xl mx-auto border-red-200 bg-red-50">
                <CardContent className="pt-6 text-red-600">
                    Failed to load doctors: {error}
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">{t('doctorsTitle')}</h2>
                <p className="text-slate-500 mt-1">{t('doctorsSubtitle')}</p>
            </div>

            <DoctorsList doctors={doctors || []} emptyText={t('doctorsEmpty')} />
        </div>
    )
}
