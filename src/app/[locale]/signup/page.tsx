import { signup, signupDoctor } from '@/app/actions/auth'
import { PhoneInput } from '@/components/PhoneInput'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'

export default async function SignupPage({ searchParams }: { searchParams: { error?: string, tab?: string } }) {
    const params = await searchParams
    const t = await getTranslations('auth')
    const tc = await getTranslations('common')
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-10 shadow-lg">
                <div>
                    <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900">
                        {t('createAccount')}
                    </h2>
                </div>

                {params.error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="text-sm text-red-700">{params.error}</div>
                    </div>
                )}

                <Tabs defaultValue={params.tab || "patient"} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="patient">{t('patient')}</TabsTrigger>
                        <TabsTrigger value="doctor">{t('doctor')}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="patient">
                        <form className="space-y-6" action={signup}>
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    {tc('name')}
                                </label>
                                <Input id="name" name="name" type="text" required />
                            </div>
                            <div>
                                <label htmlFor="surname" className="block text-sm font-medium text-gray-700 mb-1">
                                    {tc('surname')}
                                </label>
                                <Input id="surname" name="surname" type="text" required />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('birthYear')}
                                </label>
                                <Input id="year" name="year" type="number" min="1900" max={new Date().getFullYear()} required />
                            </div>
                            <div>
                                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('weight')}
                                </label>
                                <Input id="weight" name="weight" type="number" step="0.1" min="1" required />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                {t('phone')}
                            </label>
                            <PhoneInput name="phone" />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                {t('password')}
                            </label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                            <Button className="w-full" type="submit">
                                {t('signUpPatient')}
                            </Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="doctor">
                        <form className="space-y-6" action={signupDoctor}>
                            <div className="space-y-4 rounded-md shadow-sm">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="name-doc" className="block text-sm font-medium text-gray-700 mb-1">
                                            {tc('name')}
                                        </label>
                                        <Input id="name-doc" name="name" type="text" required />
                                    </div>
                                    <div>
                                        <label htmlFor="surname-doc" className="block text-sm font-medium text-gray-700 mb-1">
                                            {tc('surname')}
                                        </label>
                                        <Input id="surname-doc" name="surname" type="text" required />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('education')}
                                    </label>
                                    <Input id="education" name="education" type="text" required placeholder={t('educationPlaceholder')} />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('specialization')}
                                        </label>
                                        <Input id="specialization" name="specialization" type="text" required placeholder={t('specializationPlaceholder')} />
                                    </div>
                                    <div>
                                        <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('experienceYears')}
                                        </label>
                                        <Input id="experience" name="experience_years" type="number" min="0" max="60" required placeholder="5" />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="phone-doc" className="block text-sm font-medium text-gray-700">
                                        {t('phone')}
                                    </label>
                                    <PhoneInput name="phone" />
                                </div>

                                <div>
                                    <label htmlFor="password-doc" className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('password')}
                                    </label>
                                    <Input
                                        id="password-doc"
                                        name="password"
                                        type="password"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <Button className="w-full" type="submit">
                                {t('signUpDoctor')}
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>

                <div className="text-center text-sm pt-4">
                    <span className="text-gray-600">{t('hasAccount')} </span>
                    <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                        {tc('signIn')}
                    </Link>
                </div>
            </div>
        </div>
    )
}
