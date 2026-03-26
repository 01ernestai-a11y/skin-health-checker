'use client'

import { Link, usePathname } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import UserMenu from '@/components/UserMenu'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { Activity, Clock, Users, MessageSquare } from 'lucide-react'

export default function PatientLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const t = useTranslations('patient')
    const tc = useTranslations('common')

    const navItems = [
        { name: t('navCheck'), href: '/patient', icon: Activity },
        { name: t('navHistory'), href: '/patient/history', icon: Clock },
        { name: t('navDoctors'), href: '/patient/doctors', icon: Users },
        { name: t('navChats'), href: '/patient/chats', icon: MessageSquare },
    ]

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
            <header className="border-b bg-white sticky top-0 z-10">
                <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-6">
                        <h1 className="text-xl font-bold tracking-tight text-indigo-600 flex items-center gap-2">
                            <Activity className="h-6 w-6" />
                            <span>{tc('skinHealth')}</span>
                        </h1>

                        <nav className="hidden md:flex items-center space-x-1 ml-6">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                                ? 'bg-indigo-50 text-indigo-700'
                                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                            }`}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        {item.name}
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>

                    <div className="flex items-center gap-1">
                        <LanguageSwitcher />
                        <UserMenu profileHref="/patient/profile" />
                    </div>
                </div>
            </header>

            {/* Mobile nav */}
            <div className="md:hidden border-b bg-white px-4 py-2 flex overflow-x-auto space-x-2 hide-scrollbar">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex whitespace-nowrap items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${isActive
                                    ? 'bg-indigo-50 text-indigo-700'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                        >
                            <item.icon className="h-3 w-3" />
                            {item.name}
                        </Link>
                    )
                })}
            </div>

            <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    )
}
