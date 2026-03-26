'use client'

import { Link, usePathname } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import UserMenu from '@/components/UserMenu'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { Users, MessageSquareText, Globe, Stethoscope, MessageCircle } from 'lucide-react'

export default function DoctorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const t = useTranslations('doctor')

    const navItems = [
        { name: t('navPatients'), href: '/doctor', icon: Users },
        { name: t('navConsultations'), href: '/doctor/chats', icon: MessageSquareText },
        { name: t('navColleagues'), href: '/doctor/colleagues', icon: Stethoscope },
        { name: t('navDoctorChats'), href: '/doctor/colleague-chats', icon: MessageCircle },
        { name: t('navForum'), href: '/doctor/forum', icon: Globe },
    ]

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
            <header className="border-b bg-white sticky top-0 z-10">
                <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-6">
                        <h1 className="text-xl font-bold tracking-tight text-indigo-600 flex items-center gap-2">
                            <Users className="h-6 w-6" />
                            <span>{t('portal')}</span>
                        </h1>

                        <nav className="hidden md:flex items-center space-x-1 ml-6">
                            {navItems.map((item) => {
                                const isActive = item.href === '/doctor'
                                    ? pathname === '/doctor'
                                    : pathname.startsWith(item.href)
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
                        <UserMenu profileHref="/doctor/profile" />
                    </div>
                </div>
            </header>

            {/* Mobile nav */}
            <div className="md:hidden border-b bg-white px-4 py-2 flex overflow-x-auto space-x-2 hide-scrollbar">
                {navItems.map((item) => {
                    const isActive = item.href === '/doctor'
                        ? pathname === '/doctor'
                        : pathname.startsWith(item.href)
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
