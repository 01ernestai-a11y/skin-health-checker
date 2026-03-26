import { type NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'
import { createServerClient } from '@supabase/ssr'

const intlMiddleware = createIntlMiddleware(routing)

function stripLocale(pathname: string): string {
    for (const locale of routing.locales) {
        if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
            return pathname.replace(`/${locale}`, '') || '/'
        }
    }
    return pathname
}

function redirectWithCookies(url: URL, sourceResponse: NextResponse) {
    const response = NextResponse.redirect(url)
    sourceResponse.cookies.getAll().forEach(cookie => {
        response.cookies.set(cookie.name, cookie.value)
    })
    return response
}

export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    if (pathname.startsWith('/api') || pathname.startsWith('/auth')) {
        return NextResponse.next()
    }

    const intlResponse = intlMiddleware(request)
    const cleanPath = stripLocale(pathname)

    let currentLocale = routing.defaultLocale
    for (const locale of routing.locales) {
        if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
            currentLocale = locale
            break
        }
    }

    // Create Supabase client (shared for both public and protected paths)
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

    const isPublic = cleanPath === '/' || cleanPath.startsWith('/login') || cleanPath.startsWith('/signup')

    // Public paths: if logged in on login/signup → redirect to dashboard (but allow landing)
    if (isPublic) {
        if (user && cleanPath !== '/') {
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
            return redirectWithCookies(url, supabaseResponse)
        }
        return supabaseResponse
    }

    // Protected paths: if not logged in → redirect to login
    if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = `/${currentLocale}/login`
        return redirectWithCookies(url, supabaseResponse)
    }

    // Role-based routing
    const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('id', user.id)
        .single()

    const role = roleData?.role || 'patient'

    if (role === 'admin' && !cleanPath.startsWith('/admin')) {
        const url = request.nextUrl.clone()
        url.pathname = `/${currentLocale}/admin`
        return redirectWithCookies(url, supabaseResponse)
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
                return redirectWithCookies(url, supabaseResponse)
            }
            return supabaseResponse
        } else if (!cleanPath.startsWith('/doctor')) {
            const url = request.nextUrl.clone()
            url.pathname = `/${currentLocale}/doctor`
            return redirectWithCookies(url, supabaseResponse)
        }
    }

    if (role === 'patient' && !cleanPath.startsWith('/patient')) {
        const url = request.nextUrl.clone()
        url.pathname = `/${currentLocale}/patient`
        return redirectWithCookies(url, supabaseResponse)
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
