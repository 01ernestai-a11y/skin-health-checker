import { logout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
            <header className="border-b bg-white">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">Admin Control Panel</h1>
                    </div>
                    <form action={logout}>
                        <Button variant="ghost" size="sm" type="submit">
                            Sign out
                        </Button>
                    </form>
                </div>
            </header>
            <main className="flex-1">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
