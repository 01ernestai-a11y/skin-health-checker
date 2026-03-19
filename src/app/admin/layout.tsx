'use client'

import { logout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, LayoutDashboard, Stethoscope, Users } from 'lucide-react'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    const navItems = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Doctors', href: '/admin/doctors', icon: Stethoscope },
        { name: 'Patients', href: '/admin/patients', icon: Users },
    ]

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
            <header className="border-b bg-white sticky top-0 z-10">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-6">
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                            <span>Admin Portal</span>
                        </h1>

                        <nav className="hidden md:flex items-center space-x-1 ml-6">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                                ? 'bg-slate-100 text-slate-900'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        {item.name}
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>

                    <form action={logout}>
                        <Button variant="ghost" size="sm" type="submit" className="text-slate-500 hover:text-slate-900">
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign out
                        </Button>
                    </form>
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
                                    ? 'bg-slate-100 text-slate-900'
                                    : 'bg-slate-50 text-slate-600'
                                }`}
                        >
                            <item.icon className="h-3 w-3" />
                            {item.name}
                        </Link>
                    )
                })}
            </div>

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    )
}
