'use client'

import { useEffect, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { getPatientProfile, updatePatientProfile } from '@/app/actions/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, User, Phone } from 'lucide-react'

export default function PatientProfilePage() {
    const t = useTranslations('patient')
    const tc = useTranslations('common')
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isPending, startTransition] = useTransition()

    useEffect(() => {
        getPatientProfile().then(({ data, error }) => {
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
            const result = await updatePatientProfile(formData)
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
                        <User className="h-5 w-5 text-indigo-600" />
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="year_of_birth">{t('yearOfBirth')}</Label>
                                <Input
                                    id="year_of_birth"
                                    name="year_of_birth"
                                    type="number"
                                    defaultValue={profile.year_of_birth}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="weight">Weight (kg)</Label>
                                <Input
                                    id="weight"
                                    name="weight"
                                    type="number"
                                    step="0.1"
                                    defaultValue={profile.weight}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone" className="flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5" />
                                {t('phoneNumber')}
                            </Label>
                            <Input
                                id="phone"
                                value={profile.phone_number}
                                disabled
                                className="bg-slate-50 text-slate-500"
                            />
                            <p className="text-xs text-slate-400">
                                {t('phoneReadonly')}
                            </p>
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
