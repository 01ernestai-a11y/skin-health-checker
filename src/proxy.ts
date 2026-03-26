import { type NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'
import { createServerClient } from '@supabase/ssr'

const intlMiddleware = createIntlMiddleware(routing)

// Strip locale prefix from pathname for easier matching
function stripLocale(pathname: string): string {
    for (const locale of routing.locales) {
        if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
            return pathname.replace(`/${locale}`, '') || '/'
        }
    }
    return pathname
}

export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    // Skip middleware for API routes and auth callbacks (they don't need locale)
    if (pathname.startsWith('/api') || pathname.startsWith('/auth')) {
        return NextResponse.next()
    }

    // Run next-intl middleware first for locale detection/redirect
    const intlResponse = intlMiddleware(request)

    // Get the clean path without locale prefix
    const cleanPath = stripLocale(pathname)

    // Determine the current locale from the URL
    let currentLocale = routing.defaultLocale
    for (const locale of routing.locales) {
        if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
            currentLocale = locale
            break
        }
    }

    // Public paths that don't require auth
    if (
        cleanPath === '/' ||
        cleanPath.startsWith('/login') ||
        cleanPath.startsWith('/signup')
    ) {
        // For public paths, still need to check if user is logged in
        // and redirect them to their dashboard
        let supabaseResponse = intlResponse

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                        cookiesToSet.forEach(({ name, value, options }) =>
                            supabaseResponse.cookies.set(name, value, options)
                        )
                    },
                },
            }
        )

        const { data: { user } } = await supabase.auth.getUser()

        // If user is on login/signup but is already authenticated, redirect to dashboard
        if (user && (cleanPath.startsWith('/login') || cleanPath.startsWith('/signup'))) {
            const { data: roleData } = await supabase
                .from('user_roles')
                .select('role')
                .eq('id', user.id)
                .single()

            const role = roleData?.role || 'patient'
            const url = request.nextUrl.clone()

            if (role === 'admin') {
                url.pathname = `/${currentLocale}/admin`
            } else if (role === 'doctor') {
                url.pathname = `/${currentLocale}/doctor`
            } else {
                url.pathname = `/${currentLocale}/patient`
            }
            return NextResponse.redirect(url)
        }

        return supabaseResponse
    }

    // Protected paths — need auth
    let supabaseResponse = intlResponse

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = `/${currentLocale}/login`
        return NextResponse.redirect(url)
    }

    // Fetch role
    const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('id', user.id)
        .single()

    const role = roleData?.role || 'patient'

    if (role === 'admin' && !cleanPath.startsWith('/admin')) {
        const url = request.nextUrl.clone()
        url.pathname = `/${currentLocale}/admin`
        return NextResponse.redirect(url)
    }

    if (role === 'doctor') {
        const { data: docData } = await supabase
            .from('doctors')
            .select('is_verified')
            .eq('id', user.id)
            .single()

        if (docData && !docData.is_verified) {
            if (!cleanPath.startsWith('/pending')) {
                const url = request.nextUrl.clone()
                url.pathname = `/${currentLocale}/pending`
                return NextResponse.redirect(url)
            }
            return supabaseResponse
        } else {
            if (!cleanPath.startsWith('/doctor')) {
                const url = request.nextUrl.clone()
                url.pathname = `/${currentLocale}/doctor`
                return NextResponse.redirect(url)
            }
        }
    }

    if (role === 'patient' && !cleanPath.startsWith('/patient')) {
        const url = request.nextUrl.clone()
        url.pathname = `/${currentLocale}/patient`
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
