import { login } from '@/app/actions/auth'
import { PhoneInput } from '@/components/PhoneInput'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'

export default async function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
    const params = await searchParams
    const t = await getTranslations('auth')
    const tc = await getTranslations('common')
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                        {t('signInTitle')}
                    </h2>
                </div>
                <form className="mt-8 space-y-6" action={login}>
                    {params.error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="text-sm text-red-700">{params.error}</div>
                        </div>
                    )}
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                {t('phone')}
                            </label>
                            <PhoneInput name="phone" />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                {t('password')}
                            </label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <Button className="w-full" type="submit">
                            {tc('signIn')}
                        </Button>
                    </div>
                </form>
                <div className="text-center text-sm">
                    <span className="text-gray-600">{t('noAccount')} </span>
                    <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                        {tc('signUp')}
                    </Link>
                </div>
            </div>
        </div>
    )
}
