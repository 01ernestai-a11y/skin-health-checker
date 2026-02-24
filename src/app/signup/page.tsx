import { signup } from '@/app/actions/auth'
import { PhoneInput } from '@/components/PhoneInput'
import Link from 'next/link'

export default async function SignupPage({ searchParams }: { searchParams: { error?: string } }) {
    const params = await searchParams
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                        Create an account
                    </h2>
                </div>
                <form className="mt-8 space-y-6" action={signup}>
                    {params.error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="text-sm text-red-700">{params.error}</div>
                        </div>
                    )}
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div className="flex gap-4">
                            <div className="w-1/2">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Name
                                </label>
                                <input id="name" name="name" type="text" required className="mt-1 block w-full rounded-md border-gray-300 bg-white/5 border px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            </div>
                            <div className="w-1/2">
                                <label htmlFor="surname" className="block text-sm font-medium text-gray-700">
                                    Surname
                                </label>
                                <input id="surname" name="surname" type="text" required className="mt-1 block w-full rounded-md border-gray-300 bg-white/5 border px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-1/2">
                                <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                                    Birth Year
                                </label>
                                <input id="year" name="year" type="number" min="1900" max={new Date().getFullYear()} required className="mt-1 block w-full rounded-md border-gray-300 bg-white/5 border px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            </div>
                            <div className="w-1/2">
                                <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                                    Weight (kg)
                                </label>
                                <input id="weight" name="weight" type="number" step="0.1" min="1" required className="mt-1 block w-full rounded-md border-gray-300 bg-white/5 border px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                Phone Number
                            </label>
                            <PhoneInput name="phone" />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                minLength={6}
                                className="mt-1 block w-full rounded-md border-gray-300 bg-white/5 border px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Sign up
                        </button>
                    </div>
                </form>
                <div className="text-center text-sm">
                    <span className="text-gray-600">Already have an account? </span>
                    <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    )
}
