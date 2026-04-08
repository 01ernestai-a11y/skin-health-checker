'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { notifyAdminsAboutNewDoctor } from '@/lib/telegram'

async function getRoleRedirectPath(userId: string): Promise<string> {
    const locale = await getLocale()
    const supabase = await createClient()

    const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('id', userId)
        .single()

    const role = roleData?.role || 'patient'

    if (role === 'admin') return `/${locale}/admin`
    if (role === 'doctor') {
        const { data: docData } = await supabase
            .from('doctors')
            .select('is_verified')
            .eq('id', userId)
            .single()
        if (docData && !docData.is_verified) return `/${locale}/pending`
        return `/${locale}/doctor`
    }
    return `/${locale}/patient`
}

export async function login(formData: FormData) {
    const phone = formData.get('phone') as string
    const password = formData.get('password') as string

    const cleanPhone = phone.replace(/\D/g, '')
    const email = `${cleanPhone}@skinchecker.local`

    const supabase = await createClient()
    const locale = await getLocale()

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error || !data.user) {
        return redirect(`/${locale}/login?error=${encodeURIComponent(error?.message || 'Login failed')}`)
    }

    return redirect(await getRoleRedirectPath(data.user.id))
}

export async function signup(formData: FormData) {
    const name = formData.get('name') as string
    const surname = formData.get('surname') as string
    const year = parseInt(formData.get('year') as string, 10)
    const phone = formData.get('phone') as string
    const password = formData.get('password') as string

    const cleanPhone = phone.replace(/\D/g, '')
    const email = `${cleanPhone}@skinchecker.local`

    const supabase = await createClient()
    const locale = await getLocale()

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    })

    if (authError) {
        return redirect(`/${locale}/signup?error=${encodeURIComponent(authError.message)}&tab=patient`)
    }

    if (authData.user) {
        const userId = authData.user.id
        const supabaseAdmin = createAdminClient()

        const { error: roleError } = await supabaseAdmin.from('user_roles').insert({
            id: userId,
            role: 'patient'
        })

        if (roleError) {
            console.error("Role insert error:", roleError)
            await supabaseAdmin.auth.admin.deleteUser(userId)
            return redirect(`/${locale}/signup?error=${encodeURIComponent(roleError.message)}&tab=patient`)
        }

        const { error: dbError } = await supabaseAdmin.from('patients').insert({
            id: userId,
            name,
            surname,
            year_of_birth: year,
            phone_number: phone,
        })

        if (dbError) {
            console.error("Patient insert error:", dbError)
            await supabaseAdmin.auth.admin.deleteUser(userId)
            return redirect(`/${locale}/signup?error=${encodeURIComponent(dbError.message)}&tab=patient`)
        }
    }

    return redirect(`/${locale}/patient`)
}

export async function signupDoctor(formData: FormData) {
    const name = formData.get('name') as string
    const surname = formData.get('surname') as string
    const specialization = formData.get('specialization') as string
    const education = formData.get('education') as string
    const experience_years = parseInt(formData.get('experience_years') as string, 10) || 0
    const phone = formData.get('phone') as string
    const password = formData.get('password') as string

    const cleanPhone = phone.replace(/\D/g, '')
    const email = `${cleanPhone}@skinchecker.local`

    const supabase = await createClient()
    const locale = await getLocale()

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    })

    if (authError) {
        return redirect(`/${locale}/signup?error=${encodeURIComponent(authError.message)}&tab=doctor`)
    }

    if (authData.user) {
        const userId = authData.user.id
        const supabaseAdmin = createAdminClient()

        const { error: roleError } = await supabaseAdmin.from('user_roles').insert({
            id: userId,
            role: 'doctor'
        })

        if (roleError) {
            console.error("Role insert error:", roleError)
            await supabaseAdmin.auth.admin.deleteUser(userId)
            return redirect(`/${locale}/signup?error=${encodeURIComponent(roleError.message)}&tab=doctor`)
        }

        const { error: dbError } = await supabaseAdmin.from('doctors').insert({
            id: userId,
            name,
            surname,
            specialization,
            education,
            experience_years,
            is_verified: false,
        })

        if (dbError) {
            console.error("Doctor insert error:", dbError)
            await supabaseAdmin.auth.admin.deleteUser(userId)
            return redirect(`/${locale}/signup?error=${encodeURIComponent(dbError.message)}&tab=doctor`)
        }

        // Notify all admins via Telegram (non-blocking)
        try {
            await notifyAdminsAboutNewDoctor({ name, surname, specialization })
        } catch (e) {
            console.error('Telegram notify failed:', e)
        }
    }

    return redirect(`/${locale}/pending`)
}

export async function logout() {
    const supabase = await createClient()
    const locale = await getLocale()
    await supabase.auth.signOut()
    return redirect(`/${locale}/login`)
}
