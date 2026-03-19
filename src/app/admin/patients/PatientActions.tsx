'use client'

import { useTransition } from 'react'
import { MoreHorizontal, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { deletePatient } from '@/app/actions/admin'
import { toast } from 'sonner'

export function PatientActions({ patient }: { patient: any }) {
    const [isPending, startTransition] = useTransition()

    const handleDelete = () => {
        if (!confirm('Are you sure you want to completely delete this patient and all their histories?')) return
        startTransition(async () => {
            const res = await deletePatient(patient.id)
            if (res.error) {
                toast.error('Failed to delete patient', { description: res.error })
            } else {
                toast.success('Patient deleted completely')
            }
        })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400" disabled={isPending}>
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4 text-slate-500" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Patient
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
