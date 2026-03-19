'use client'

import { useState } from 'react'
import { createDoctor } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PhoneInput } from '@/components/PhoneInput'
import { toast } from 'sonner'

export default function AdminDashboard() {
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
                    <CardTitle>Register New Doctor</CardTitle>
                    <CardDescription>
                        Create an account for a new medical professional. They will log in using their phone number.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">First Name</Label>
                                <Input id="name" name="name" required placeholder="Ivan" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="surname">Last Name</Label>
                                <Input id="surname" name="surname" required placeholder="Ivanov" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="education">Education / University</Label>
                            <Input id="education" name="education" required placeholder="e.g. Asfendiyarov KazNMU" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="specialization">Specialization</Label>
                                <Input id="specialization" name="specialization" required placeholder="e.g. Dermatologist" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="experience">Years of Experience</Label>
                                <Input id="experience" name="experience_years" type="number" min="0" required placeholder="5" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <PhoneInput value={phone} onChange={setPhone} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Temporary Password</Label>
                            <Input id="password" name="password" type="password" required minLength={6} placeholder="******" />
                        </div>

                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? "Registering..." : "Add Doctor"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Space for future admin widgets, e.g. list of all doctors */}
            <Card>
                <CardHeader>
                    <CardTitle>System Overview</CardTitle>
                    <CardDescription>Metrics and quick stats will appear here.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Stats coming soon.</p>
                </CardContent>
            </Card>
        </div>
    )
}
