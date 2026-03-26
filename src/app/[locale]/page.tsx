import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/utils/supabase/server'
import {
    Activity,
    Upload,
    Brain,
    MessageSquare,
    Clock,
    Users,
    Shield,
    ArrowRight,
    CheckCircle,
    Stethoscope,
} from 'lucide-react'

export const metadata = {
    title: 'Skin Health — AI-Powered Skin Analysis',
    description:
        'Get instant AI-powered skin health analysis and connect with verified dermatologists. Upload a photo, receive a detailed verdict, and consult specialists.',
}

export default async function LandingPage() {
    const t = await getTranslations('landing')
    const tc = await getTranslations('common')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let dashboardHref = '/patient'
    if (user) {
        const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('id', user.id)
            .single()
        const role = roleData?.role || 'patient'
        if (role === 'admin') dashboardHref = '/admin'
        else if (role === 'doctor') dashboardHref = '/doctor'
    }

    return (
        <div className="min-h-screen bg-white text-slate-900 overflow-hidden">
            {/* ───── NAV ───── */}
            <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-100">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
                    <div className="flex items-center gap-2.5">
                        <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-bold tracking-tight">
                            {tc('skinHealth')}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        {user ? (
                            <Link
                                href={dashboardHref}
                                className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30"
                            >
                                {t('dashboard')}
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-4 py-2"
                                >
                                    {tc('signIn')}
                                </Link>
                                <Link
                                    href="/signup"
                                    className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30"
                                >
                                    {t('getStarted')}
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* ───── HERO ───── */}
            <section className="relative pt-40 pb-28 px-6">
                {/* Background orbs */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-indigo-100 via-indigo-50 to-transparent opacity-70 blur-3xl" />
                    <div className="absolute top-48 -left-48 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-violet-100 via-fuchsia-50 to-transparent opacity-50 blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-gradient-to-t from-sky-50 to-transparent opacity-60 blur-2xl" />
                </div>

                {/* Grid pattern overlay */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage:
                            'linear-gradient(to right, #6366f1 1px, transparent 1px), linear-gradient(to bottom, #6366f1 1px, transparent 1px)',
                        backgroundSize: '48px 48px',
                    }}
                />

                <div className="relative mx-auto max-w-6xl">
                    <div className="max-w-3xl">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-4 py-1.5 mb-8">
                            <Shield className="w-3.5 h-3.5 text-indigo-600" />
                            <span className="text-xs font-semibold text-indigo-700 tracking-wide uppercase">
                                {t('badge')}
                            </span>
                        </div>

                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]">
                            <span className="block">{t('heroTitle1')}</span>
                            <span className="block mt-1 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                                {t('heroTitle2')}
                            </span>
                        </h1>

                        <p className="mt-7 text-lg sm:text-xl text-slate-500 max-w-xl leading-relaxed">
                            {t('heroSubtitle')}
                        </p>

                        <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
                            <Link
                                href="/signup"
                                className="group inline-flex items-center gap-2.5 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all px-7 py-3.5 rounded-2xl shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/35 hover:-translate-y-0.5"
                            >
                                {t('ctaStart')}
                                <ArrowRight className="w-4.5 h-4.5 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 text-base font-medium text-slate-600 hover:text-slate-900 transition-colors px-7 py-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50"
                            >
                                {t('ctaAccount')}
                            </Link>
                        </div>

                        {/* Trust signals */}
                        <div className="mt-14 flex items-center gap-6 text-sm text-slate-400">
                            <div className="flex items-center gap-1.5">
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                <span>{t('trustFree')}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                <span>{t('trustDoctors')}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                <span>{t('trustResults')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Hero visual — floating card cluster */}
                    <div className="hidden lg:block absolute top-8 right-0 w-[380px]">
                        <div className="relative">
                            {/* Main card */}
                            <div className="rounded-3xl bg-white border border-slate-200 shadow-2xl shadow-slate-200/60 p-6">
                                <div className="w-full h-44 rounded-2xl bg-gradient-to-br from-indigo-100 via-violet-50 to-fuchsia-50 flex items-center justify-center">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center">
                                            <Brain className="w-10 h-10 text-indigo-600" />
                                        </div>
                                        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
                                            <CheckCircle className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5 space-y-2.5">
                                    <div className="h-3 bg-slate-100 rounded-full w-3/4" />
                                    <div className="h-3 bg-slate-100 rounded-full w-full" />
                                    <div className="h-3 bg-slate-100 rounded-full w-5/6" />
                                </div>
                                <div className="mt-5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                            <Activity className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        <span className="text-xs font-semibold text-slate-700">{t('analysisComplete')}</span>
                                    </div>
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                                        {t('healthy')}
                                    </span>
                                </div>
                            </div>

                            {/* Floating badge */}
                            <div className="absolute -bottom-5 -left-8 bg-white rounded-2xl border border-slate-200 shadow-xl px-5 py-3 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                                    <Stethoscope className="w-5 h-5 text-violet-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-800">{t('specialistsOnline', {count: 12})}</p>
                                    <p className="text-[10px] text-slate-400">{t('onlineNow')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ───── FEATURES ───── */}
            <section className="relative py-28 px-6 bg-slate-50/70">
                <div className="mx-auto max-w-6xl">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <p className="text-sm font-semibold text-indigo-600 tracking-wide uppercase mb-3">
                            {t('featuresLabel')}
                        </p>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                            {t('featuresTitle')}
                        </h2>
                        <p className="mt-4 text-slate-500 text-lg">
                            {t('featuresSubtitle')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Card 1 — AI Analysis (large) */}
                        <div className="group relative rounded-3xl bg-white border border-slate-200 p-8 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 transition-all duration-300 overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-indigo-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center mb-6">
                                    <Upload className="w-7 h-7 text-indigo-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">
                                    {t('featureAiTitle')}
                                </h3>
                                <p className="text-slate-500 leading-relaxed">
                                    {t('featureAiDesc')}
                                </p>
                            </div>
                        </div>

                        {/* Card 2 — Doctor Consultations */}
                        <div className="group relative rounded-3xl bg-white border border-slate-200 p-8 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-50 transition-all duration-300 overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-violet-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative">
                                <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center mb-6">
                                    <MessageSquare className="w-7 h-7 text-violet-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">
                                    {t('featureDoctorTitle')}
                                </h3>
                                <p className="text-slate-500 leading-relaxed">
                                    {t('featureDoctorDesc')}
                                </p>
                            </div>
                        </div>

                        {/* Card 3 — Health History */}
                        <div className="group relative rounded-3xl bg-white border border-slate-200 p-8 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-50 transition-all duration-300 overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-sky-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative">
                                <div className="w-14 h-14 rounded-2xl bg-sky-100 flex items-center justify-center mb-6">
                                    <Clock className="w-7 h-7 text-sky-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">
                                    {t('featureHistoryTitle')}
                                </h3>
                                <p className="text-slate-500 leading-relaxed">
                                    {t('featureHistoryDesc')}
                                </p>
                            </div>
                        </div>

                        {/* Card 4 — Doctor Community */}
                        <div className="group relative rounded-3xl bg-white border border-slate-200 p-8 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-50 transition-all duration-300 overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-emerald-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-6">
                                    <Users className="w-7 h-7 text-emerald-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">
                                    {t('featureCommunityTitle')}
                                </h3>
                                <p className="text-slate-500 leading-relaxed">
                                    {t('featureCommunityDesc')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ───── HOW IT WORKS ───── */}
            <section className="relative py-28 px-6">
                <div className="mx-auto max-w-6xl">
                    <div className="text-center max-w-2xl mx-auto mb-20">
                        <p className="text-sm font-semibold text-indigo-600 tracking-wide uppercase mb-3">
                            {t('stepsLabel')}
                        </p>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                            {t('stepsTitle')}
                        </h2>
                        <p className="mt-4 text-slate-500 text-lg">
                            {t('stepsSubtitle')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
                        <div className="relative text-center lg:text-left">
                            <span className="text-6xl font-extrabold text-slate-100 leading-none">01</span>
                            <div className="mt-4 mx-auto lg:mx-0 w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center">
                                <Upload className="w-7 h-7 text-indigo-600" />
                            </div>
                            <h3 className="mt-4 text-lg font-bold text-slate-900">{t('step1Title')}</h3>
                            <p className="mt-2 text-sm text-slate-500 leading-relaxed">{t('step1Desc')}</p>
                        </div>

                        <div className="relative text-center lg:text-left">
                            <span className="text-6xl font-extrabold text-slate-100 leading-none">02</span>
                            <div className="mt-4 mx-auto lg:mx-0 w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center">
                                <Brain className="w-7 h-7 text-violet-600" />
                            </div>
                            <h3 className="mt-4 text-lg font-bold text-slate-900">{t('step2Title')}</h3>
                            <p className="mt-2 text-sm text-slate-500 leading-relaxed">{t('step2Desc')}</p>
                        </div>

                        <div className="relative text-center lg:text-left">
                            <span className="text-6xl font-extrabold text-slate-100 leading-none">03</span>
                            <div className="mt-4 mx-auto lg:mx-0 w-14 h-14 rounded-2xl bg-sky-100 flex items-center justify-center">
                                <CheckCircle className="w-7 h-7 text-sky-600" />
                            </div>
                            <h3 className="mt-4 text-lg font-bold text-slate-900">{t('step3Title')}</h3>
                            <p className="mt-2 text-sm text-slate-500 leading-relaxed">{t('step3Desc')}</p>
                        </div>

                        <div className="relative text-center lg:text-left">
                            <span className="text-6xl font-extrabold text-slate-100 leading-none">04</span>
                            <div className="mt-4 mx-auto lg:mx-0 w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
                                <Stethoscope className="w-7 h-7 text-emerald-600" />
                            </div>
                            <h3 className="mt-4 text-lg font-bold text-slate-900">{t('step4Title')}</h3>
                            <p className="mt-2 text-sm text-slate-500 leading-relaxed">{t('step4Desc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ───── CTA ───── */}
            <section className="relative py-28 px-6">
                <div className="mx-auto max-w-4xl">
                    <div className="relative rounded-[2rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 px-8 py-16 sm:px-16 sm:py-20 text-center overflow-hidden">
                        {/* Decorative shapes */}
                        <div className="pointer-events-none absolute inset-0">
                            <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/5 blur-2xl" />
                            <div className="absolute -bottom-32 -right-16 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
                            <div
                                className="absolute inset-0 opacity-[0.06]"
                                style={{
                                    backgroundImage:
                                        'radial-gradient(circle, white 1px, transparent 1px)',
                                    backgroundSize: '24px 24px',
                                }}
                            />
                        </div>

                        <div className="relative">
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                                {t('ctaTitle1')}
                                <br />
                                {t('ctaTitle2')}
                            </h2>
                            <p className="mt-5 text-indigo-100 text-lg max-w-lg mx-auto">
                                {t('ctaSubtitle')}
                            </p>
                            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link
                                    href="/signup"
                                    className="group inline-flex items-center gap-2 text-base font-semibold text-indigo-700 bg-white hover:bg-indigo-50 transition-all px-8 py-4 rounded-2xl shadow-lg hover:-translate-y-0.5"
                                >
                                    {t('ctaCreate')}
                                    <ArrowRight className="w-4.5 h-4.5 transition-transform group-hover:translate-x-0.5" />
                                </Link>
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-2 text-base font-medium text-white/90 hover:text-white transition-colors px-8 py-4 rounded-2xl border border-white/20 hover:border-white/40"
                                >
                                    {tc('signIn')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ───── FOOTER ───── */}
            <footer className="border-t border-slate-100 py-10 px-6">
                <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                            <Activity className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-bold">{tc('skinHealth')}</span>
                    </div>
                    <p className="text-xs text-slate-400">
                        {t('footer', { year: new Date().getFullYear() })}
                    </p>
                </div>
            </footer>
        </div>
    )
}
