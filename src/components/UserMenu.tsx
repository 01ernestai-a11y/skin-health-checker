'use client'

import { useTransition, useEffect, useState } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { User, LogOut } from 'lucide-react'
import { logout } from '@/app/actions/auth'
import { getMyAvatar } from '@/app/actions/profile'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

export default function UserMenu({ profileHref }: { profileHref?: string }) {
    const [isPending, startTransition] = useTransition()
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
    const [initials, setInitials] = useState<string>('')
    const t = useTranslations('common')

    useEffect(() => {
        getMyAvatar().then(({ avatarUrl, name, surname }) => {
            setAvatarUrl(avatarUrl)
            const i = `${name?.[0] || ''}${surname?.[0] || ''}`.toUpperCase() || 'U'
            setInitials(i)
        })
    }, [])

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className="inline-flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:opacity-90 transition-opacity"
            >
                <Avatar className="h-9 w-9 border-2 border-slate-200">
                    {avatarUrl && <AvatarImage src={avatarUrl} alt="Avatar" />}
                    <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-semibold">
                        {initials || 'U'}
                    </AvatarFallback>
                </Avatar>
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
