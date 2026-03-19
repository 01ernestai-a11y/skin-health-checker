import { signup, signupDoctor } from '@/app/actions/auth'
import { PhoneInput } from '@/components/PhoneInput'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

export default async function SignupPage({ searchParams }: { searchParams: { error?: string, tab?: string } }) {
    const params = await searchParams
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-10 shadow-lg">
                <div>
                    <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900">
                        Create an account
                    </h2>
                </div>

                {params.error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="text-sm text-red-700">{params.error}</div>
                    </div>
                )}

                <Tabs defaultValue={params.tab || "patient"} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="patient">Patient</TabsTrigger>
                        <TabsTrigger value="doctor">Doctor</TabsTrigger>
                    </TabsList>

                    <TabsContent value="patient">
                        <form className="space-y-6" action={signup}>
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Name
                                </label>
                                <Input id="name" name="name" type="text" required />
                            </div>
                            <div>
                                <label htmlFor="surname" className="block text-sm font-medium text-gray-700 mb-1">
                                    Surname
                                </label>
                                <Input id="surname" name="surname" type="text" required />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                                    Birth Year
                                </label>
                                <Input id="year" name="year" type="number" min="1900" max={new Date().getFullYear()} required />
                            </div>
                            <div>
                                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                                    Weight (kg)
                                </label>
                                <Input id="weight" name="weight" type="number" step="0.1" min="1" required />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                Phone Number
                            </label>
                            <PhoneInput name="phone" />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
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
                                Sign up as Patient
                            </Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="doctor">
                        <form className="space-y-6" action={signupDoctor}>
                            <div className="space-y-4 rounded-md shadow-sm">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="name-doc" className="block text-sm font-medium text-gray-700 mb-1">
                                            Name
                                        </label>
                                        <Input id="name-doc" name="name" type="text" required />
                                    </div>
                                    <div>
                                        <label htmlFor="surname-doc" className="block text-sm font-medium text-gray-700 mb-1">
                                            Surname
                                        </label>
                                        <Input id="surname-doc" name="surname" type="text" required />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">
                                        Education / University
                                    </label>
                                    <Input id="education" name="education" type="text" required placeholder="e.g. Asfendiyarov KazNMU" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                                            Specialization
                                        </label>
                                        <Input id="specialization" name="specialization" type="text" required placeholder="e.g. Dermatologist" />
                                    </div>
                                    <div>
                                        <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                                            Years of Experience
                                        </label>
                                        <Input id="experience" name="experience_years" type="number" min="0" max="60" required placeholder="5" />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="phone-doc" className="block text-sm font-medium text-gray-700">
                                        Phone Number
                                    </label>
                                    <PhoneInput name="phone" />
                                </div>

                                <div>
                                    <label htmlFor="password-doc" className="block text-sm font-medium text-gray-700 mb-1">
                                        Password
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
                                Sign up as Doctor
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>

                <div className="text-center text-sm pt-4">
                    <span className="text-gray-600">Already have an account? </span>
                    <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    )
}
