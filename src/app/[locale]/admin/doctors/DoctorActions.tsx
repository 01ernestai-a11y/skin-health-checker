'use client'

import { useState, useTransition } from 'react'
import { MoreHorizontal, ShieldCheck, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { verifyDoctor, deleteDoctor } from '@/app/actions/admin'
import { toast } from 'sonner'

export function DoctorActions({ doctor }: { doctor: any }) {
    const [isPending, startTransition] = useTransition()
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const handleVerify = () => {
        startTransition(async () => {
            const res = await verifyDoctor(doctor.id)
            if (res.error) {
                toast.error('Failed to verify doctor', { description: res.error })
            } else {
                toast.success('Doctor verified successfully')
            }
        })
    }

    const handleDelete = () => {
        if (!confirm('Are you sure you want to completely delete this doctor?')) return
        startTransition(async () => {
            const res = await deleteDoctor(doctor.id)
            if (res.error) {
                toast.error('Failed to delete doctor', { description: res.error })
            } else {
                toast.success('Doctor deleted completely')
            }
        })
    }

    return (
        <>
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
                    
                    <DropdownMenuItem onClick={() => setIsDialogOpen(true)} className="cursor-pointer">
                        Inspect Profile
                    </DropdownMenuItem>
                    
                    {!doctor.is_verified && (
                        <DropdownMenuItem onClick={handleVerify} className="text-green-600 focus:text-green-600 focus:bg-green-50 cursor-pointer">
                            <ShieldCheck className="h-4 w-4 mr-2" />
                            Approve Doctor
                        </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Doctor Profile</DialogTitle>
                        <DialogDescription>
                            Review the credentials for {doctor.name} {doctor.surname}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <span className="font-medium text-sm text-right">Name</span>
                            <span className="col-span-3 text-sm">{doctor.name} {doctor.surname}</span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <span className="font-medium text-sm text-right">Specialization</span>
                            <span className="col-span-3 text-sm">{doctor.specialization || 'Not Provided'}</span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <span className="font-medium text-sm text-right">Education</span>
                            <span className="col-span-3 text-sm">{doctor.education || 'Not Provided'}</span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <span className="font-medium text-sm text-right">Experience</span>
                            <span className="col-span-3 text-sm">{doctor.experience_years ? `${doctor.experience_years} Years` : 'Not Provided'}</span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <span className="font-medium text-sm text-right">Status</span>
                            <span className="col-span-3 text-sm">{doctor.is_verified ? 'Verified' : 'Pending Verification'}</span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Close</Button>
                        {!doctor.is_verified && (
                            <Button onClick={() => {
                                setIsDialogOpen(false)
                                handleVerify()
                            }}>
                                Approve
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

