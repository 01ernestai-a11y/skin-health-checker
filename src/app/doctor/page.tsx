import { getDoctorPatients } from '@/app/actions/doctor'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { User, Calendar, Phone } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DoctorDashboard() {
    const { data: patients, error } = await getDoctorPatients()

    if (error) {
        return (
            <Card className="max-w-3xl mx-auto border-red-200 bg-red-50">
                <CardContent className="pt-6 text-red-600">
                    Failed to load patients: {error}
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Your Patient Base</h2>
                <p className="text-slate-500 mt-1">Patients who have consulted with you.</p>
            </div>

            {(!patients || patients.length === 0) ? (
                <Card className="border-dashed">
                    <CardContent className="pt-10 pb-10 text-center text-slate-500">
                        You don't have any patients in your base yet. Patients will appear here once they start a chat with you.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {patients.map((patient: any) => {
                        const initials = `${patient.name[0]}${patient.surname[0]}`.toUpperCase()
                        const age = new Date().getFullYear() - patient.year_of_birth

                        return (
                            <Card key={patient.id} className="flex flex-col">
                                <CardHeader className="flex flex-row items-center gap-4 pb-4">
                                    <Avatar className="h-12 w-12 border bg-indigo-50">
                                        <AvatarFallback className="text-indigo-700">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-base">
                                            {patient.name} {patient.surname}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-1 mt-1">
                                            <User className="w-3 h-3" />
                                            {age} years old
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-2 text-sm text-slate-600">
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        <span>{patient.phone_number}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        <span>Born {patient.year_of_birth}</span>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-0">
                                    <Link href={`/doctor/chats`} className="w-full">
                                        <Button variant="outline" className="w-full">
                                            View Messages
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
