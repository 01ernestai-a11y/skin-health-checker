'use client'

import { Link, usePathname } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import UserMenu from '@/components/UserMenu'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { NotificationProvider, useNotifications } from '@/components/NotificationProvider'
import { Activity, Clock, Users, MessageSquare } from 'lucide-react'

export default function PatientLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <NotificationProvider>
            <PatientLayoutInner>{children}</PatientLayoutInner>
        </NotificationProvider>
    )
}

function PatientLayoutInner({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const t = useTranslations('patient')
    const tc = useTranslations('common')
    const { totalUnread } = useNotifications()

    const navItems = [
        { name: t('navCheck'), href: '/patient', icon: Activity, badge: 0 },
        { name: t('navHistory'), href: '/patient/history', icon: Clock, badge: 0 },
        { name: t('navDoctors'), href: '/patient/doctors', icon: Users, badge: 0 },
        { name: t('navChats'), href: '/patient/chats', icon: MessageSquare, badge: totalUnread },
    ]

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
            <header className="border-b bg-white sticky top-0 z-10">
                <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="text-xl font-bold tracking-tight text-indigo-600 flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <Activity className="h-6 w-6" />
                            <span>{tc('skinHealth')}</span>
                        </Link>

                        <nav className="hidden md:flex items-center space-x-1 ml-6">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`relative flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                                ? 'bg-indigo-50 text-indigo-700'
                                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                            }`}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        {item.name}
                                        {item.badge > 0 && (
                                            <span className="ml-1 min-w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1.5">
                                                {item.badge > 99 ? '99+' : item.badge}
                                            </span>
                                        )}
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
                            className={`relative flex whitespace-nowrap items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${isActive
                                    ? 'bg-indigo-50 text-indigo-700'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                        >
                            <item.icon className="h-3 w-3" />
                            {item.name}
                            {item.badge > 0 && (
                                <span className="min-w-4 h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold px-1">
                                    {item.badge > 99 ? '99+' : item.badge}
                                </span>
                            )}
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
