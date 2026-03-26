'use client'

import { useState } from 'react'
import { createDoctor } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PhoneInput } from '@/components/PhoneInput'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

export default function AdminDashboard() {
    const t = useTranslations('admin')
    const tAuth = useTranslations('auth')
    const [loading, setLoading] = useState(false)
    const [phone, setPhone] = useState('')

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const form = e.currentTarget
        const formData = new FormData(form)
        formData.set('phone', phone)

        const result = await createDoctor(formData)

        setLoading(false)

        if (result.error) {
            toast.error('Failed to add doctor', { description: result.error })
        } else {
            toast.success('Doctor registered successfully!')
            // Reset form
            form.reset()
            setPhone('')
        }
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>{t('registerTitle')}</CardTitle>
                    <CardDescription>
                        {t('registerSubtitle')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">{t('firstName')}</Label>
                                <Input id="name" name="name" required placeholder={t('firstNamePlaceholder')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="surname">{t('lastName')}</Label>
                                <Input id="surname" name="surname" required placeholder={t('lastNamePlaceholder')} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="education">{tAuth('education')}</Label>
                            <Input id="education" name="education" required placeholder={tAuth('educationPlaceholder')} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="specialization">{tAuth('specialization')}</Label>
                                <Input id="specialization" name="specialization" required placeholder={tAuth('specializationPlaceholder')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="experience">{tAuth('experienceYears')}</Label>
                                <Input id="experience" name="experience_years" type="number" min="0" required placeholder="5" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>{tAuth('phone')}</Label>
                            <PhoneInput value={phone} onChange={setPhone} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">{t('tempPassword')}</Label>
                            <Input id="password" name="password" type="password" required minLength={6} placeholder="******" />
                        </div>

                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? t('registering') : t('addDoctor')}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Space for future admin widgets, e.g. list of all doctors */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('overview')}</CardTitle>
                    <CardDescription>{t('overviewDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{t('overviewSoon')}</p>
                </CardContent>
            </Card>
        </div>
    )
}
