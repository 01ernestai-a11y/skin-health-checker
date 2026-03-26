import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with cross-browser cookies.
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (
        !user &&
        request.nextUrl.pathname !== '/' &&
        !request.nextUrl.pathname.startsWith('/login') &&
        !request.nextUrl.pathname.startsWith('/signup') &&
        !request.nextUrl.pathname.startsWith('/auth') &&
        !request.nextUrl.pathname.startsWith('/api')
    ) {
        // no user, potentially respond by redirecting the user to the login page
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    if (user) {
        // Allow auth callbacks to proceed
        if (request.nextUrl.pathname.startsWith('/auth')) {
            return supabaseResponse
        }

        // Fetch role
        const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('id', user.id)
            .single()

        const role = roleData?.role || 'patient'
        const path = request.nextUrl.pathname

        if (role === 'admin' && !path.startsWith('/admin')) {
            const url = request.nextUrl.clone()
            url.pathname = '/admin'
            return NextResponse.redirect(url)
        }

        if (role === 'doctor') {
            const { data: docData } = await supabase
                .from('doctors')
                .select('is_verified')
                .eq('id', user.id)
                .single()

            if (docData && !docData.is_verified) {
                if (!path.startsWith('/pending')) {
                    const url = request.nextUrl.clone()
                    url.pathname = '/pending'
                    return NextResponse.redirect(url)
                }
                return supabaseResponse
            } else {
                if (!path.startsWith('/doctor')) {
                    const url = request.nextUrl.clone()
                    url.pathname = '/doctor'
                    return NextResponse.redirect(url)
                }
            }
        }

        if (role === 'patient' && !path.startsWith('/patient')) {
            const url = request.nextUrl.clone()
            url.pathname = '/patient'
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}
