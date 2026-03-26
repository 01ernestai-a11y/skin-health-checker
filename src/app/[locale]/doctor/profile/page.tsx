'use client'

import { useEffect, useState, useTransition } from 'react'
import { getDoctorProfile, updateDoctorProfile } from '@/app/actions/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, Stethoscope, GraduationCap, Briefcase } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function DoctorProfilePage() {
    const t = useTranslations('doctor')
    const tc = useTranslations('common')
    const ta = useTranslations('auth')
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isPending, startTransition] = useTransition()

    useEffect(() => {
        getDoctorProfile().then(({ data, error }) => {
            if (error) toast.error(error)
            else setProfile(data)
            setLoading(false)
        })
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="text-center py-20 text-slate-500">
                {t('profileError')}
            </div>
        )
    }

    function handleSubmit(formData: FormData) {
        startTransition(async () => {
            const result = await updateDoctorProfile(formData)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(t('profileSuccess'))
            }
        })
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">{t('profileTitle')}</h1>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Stethoscope className="h-5 w-5 text-indigo-600" />
                        {t('profileInfo')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">{tc('name')}</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={profile.name}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="surname">{tc('surname')}</Label>
                                <Input
                                    id="surname"
                                    name="surname"
                                    defaultValue={profile.surname}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="specialization" className="flex items-center gap-1.5">
                                <Briefcase className="h-3.5 w-3.5" />
                                {ta('specialization')}
                            </Label>
                            <Input
                                id="specialization"
                                name="specialization"
                                defaultValue={profile.specialization}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="education" className="flex items-center gap-1.5">
                                <GraduationCap className="h-3.5 w-3.5" />
                                {ta('education')}
                            </Label>
                            <Input
                                id="education"
                                name="education"
                                defaultValue={profile.education}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="experience_years">{t('experienceYears')}</Label>
                            <Input
                                id="experience_years"
                                name="experience_years"
                                type="number"
                                defaultValue={profile.experience_years}
                                required
                            />
                        </div>

                        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {tc('saving')}
                                </>
                            ) : (
                                tc('save')
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
