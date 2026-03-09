'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
    const phone = formData.get('phone') as string
    const password = formData.get('password') as string

    // Keep only digits for the internal email
    const cleanPhone = phone.replace(/\D/g, '')
    const email = `${cleanPhone}@skinchecker.local`

    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return redirect(`/login?error=${encodeURIComponent(error.message)}`)
    }

    return redirect('/')
}

export async function signup(formData: FormData) {
    const name = formData.get('name') as string
    const surname = formData.get('surname') as string
    const year = parseInt(formData.get('year') as string, 10)
    const weight = parseFloat(formData.get('weight') as string)
    const phone = formData.get('phone') as string
    const password = formData.get('password') as string

    const cleanPhone = phone.replace(/\D/g, '')
    const email = `${cleanPhone}@skinchecker.local`

    const supabase = await createClient()

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    })

    // Next steps after signup: insert into patients table
    if (authError) {
        return redirect(`/signup?error=${encodeURIComponent(authError.message)}`)
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
            return redirect(`/signup?error=${encodeURIComponent(roleError.message)}`)
        }

        const { error: dbError } = await supabaseAdmin.from('patients').insert({
            id: userId,
            name,
            surname,
            year_of_birth: year,
            weight,
            phone_number: phone,
        })

        if (dbError) {
            console.error("Patient insert error:", dbError)
            await supabaseAdmin.auth.admin.deleteUser(userId)
            return redirect(`/signup?error=${encodeURIComponent(dbError.message)}`)
        }
    }

    return redirect('/')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    return redirect('/login')
}
