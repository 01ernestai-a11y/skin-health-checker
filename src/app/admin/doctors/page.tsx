import { createAdminClient } from '@/utils/supabase/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DoctorActions } from './DoctorActions'

export default async function AdminDoctorsPage() {
    const supabaseAdmin = createAdminClient()
    
    const { data: doctors, error } = await supabaseAdmin
        .from('doctors')
        .select('*')
        .order('is_verified', { ascending: true }) // unverified first
        .order('name', { ascending: true })

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-700 rounded-md">
                Error loading doctors: {error.message}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Doctor Verification & Management</CardTitle>
                    <CardDescription>
                        Review pending approvals and manage registered doctors.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Registration</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Specialization</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {doctors && doctors.length > 0 ? (
                                    doctors.map((doctor) => (
                                        <TableRow key={doctor.id}>
                                            <TableCell className="font-mono text-xs text-slate-500">
                                                {doctor.id.slice(0, 8)}...
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {doctor.name} {doctor.surname}
                                            </TableCell>
                                            <TableCell>{doctor.specialization}</TableCell>
                                            <TableCell>
                                                {doctor.is_verified ? (
                                                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">Verified</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">Pending</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DoctorActions doctor={doctor} />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                                            No doctors found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
