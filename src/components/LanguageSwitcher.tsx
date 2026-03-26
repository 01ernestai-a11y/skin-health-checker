'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Globe } from 'lucide-react'

const localeNames: Record<string, string> = {
    en: 'English',
    ru: 'Русский',
    kk: 'Қазақша',
}

export default function LanguageSwitcher() {
    const locale = useLocale()
    const router = useRouter()
    const pathname = usePathname()

    function onLocaleChange(newLocale: string) {
        router.replace(pathname, { locale: newLocale as any })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none"
            >
                <Globe className="h-4 w-4" />
                <span className="uppercase text-xs">{locale}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8}>
                {routing.locales.map((loc) => (
                    <DropdownMenuItem
                        key={loc}
                        onClick={() => onLocaleChange(loc)}
                        className={loc === locale ? 'bg-slate-100 font-semibold' : ''}
                    >
                        {localeNames[loc]}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
