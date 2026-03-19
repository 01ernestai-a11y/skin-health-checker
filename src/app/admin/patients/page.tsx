import { createAdminClient } from '@/utils/supabase/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PatientActions } from './PatientActions'

export default async function AdminPatientsPage() {
    const supabaseAdmin = createAdminClient()
    
    const { data: patients, error } = await supabaseAdmin
        .from('patients')
        .select('*')
        .order('name', { ascending: true })

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-700 rounded-md">
                Error loading patients: {error.message}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Patient Management</CardTitle>
                    <CardDescription>
                        Review registered patients and moderate accounts.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Birth Year</TableHead>
                                    <TableHead>Weight</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {patients && patients.length > 0 ? (
                                    patients.map((patient) => (
                                        <TableRow key={patient.id}>
                                            <TableCell className="font-mono text-xs text-slate-500">
                                                {patient.id.slice(0, 8)}...
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {patient.name} {patient.surname}
                                            </TableCell>
                                            <TableCell>{patient.year_of_birth}</TableCell>
                                            <TableCell>{patient.weight} kg</TableCell>
                                            <TableCell>{patient.phone_number}</TableCell>
                                            <TableCell className="text-right">
                                                <PatientActions patient={patient} />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                            No patients found.
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
