'use client'

import { useTransition } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { MoreVertical, User, LogOut } from 'lucide-react'
import { logout } from '@/app/actions/auth'
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

export default function UserMenu({ profileHref }: { profileHref?: string }) {
    const [isPending, startTransition] = useTransition()
    const t = useTranslations('common')

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className="inline-flex items-center justify-center rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none"
            >
                <MoreVertical className="h-5 w-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8}>
                {profileHref && (
                    <>
                        <DropdownMenuItem>
                            <Link href={profileHref} className="flex items-center gap-2 w-full">
                                <User className="h-4 w-4" />
                                {t('profile')}
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                    </>
                )}
                <DropdownMenuItem
                    variant="destructive"
                    disabled={isPending}
                    onClick={() => {
                        startTransition(async () => {
                            await logout()
                        })
                    }}
                >
                    <LogOut className="h-4 w-4" />
                    {t('signOut')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
