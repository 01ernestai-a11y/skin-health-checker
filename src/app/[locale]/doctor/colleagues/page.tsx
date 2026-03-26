import { getVerifiedDoctors } from '@/app/actions/doctor'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Stethoscope, GraduationCap, Briefcase } from 'lucide-react'
import { StartDoctorChatButton } from '@/components/StartDoctorChatButton'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function ColleaguesPage() {
    const t = await getTranslations('doctor')
    const { data: doctors, error } = await getVerifiedDoctors()

    if (error) {
        return (
            <Card className="max-w-3xl mx-auto border-red-200 bg-red-50">
                <CardContent className="pt-6 text-red-600">
                    Failed to load colleagues: {error}
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">{t('colleaguesTitle')}</h2>
                <p className="text-slate-500 mt-1">{t('colleaguesSubtitle')}</p>
            </div>

            {(!doctors || doctors.length === 0) ? (
                <Card className="border-dashed">
                    <CardContent className="pt-10 pb-10 text-center text-slate-500">
                        {t('colleaguesEmpty')}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {doctors.map((doctor: any) => {
                        const initials = `${doctor.name[0]}${doctor.surname[0]}`.toUpperCase()
                        return (
                            <Card key={doctor.id} className="flex flex-col">
                                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                    <Avatar className="h-12 w-12 border">
                                        <AvatarFallback className="bg-indigo-100 text-indigo-700">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-base tracking-normal">
                                            Dr. {doctor.name} {doctor.surname}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-1 mt-0.5">
                                            <Stethoscope className="w-3 h-3" />
                                            {doctor.specialization}
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-1">
                                    {doctor.education && (
                                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                            <GraduationCap className="h-3 w-3" />
                                            {doctor.education}
                                        </p>
                                    )}
                                    {doctor.experience_years && (
                                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                            <Briefcase className="h-3 w-3" />
                                            {doctor.experience_years} {t('yearsExperience')}
                                        </p>
                                    )}
                                </CardContent>
                                <CardFooter className="pt-0">
                                    <StartDoctorChatButton doctorId={doctor.id} />
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
