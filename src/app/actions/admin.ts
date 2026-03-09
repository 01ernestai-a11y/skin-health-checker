'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createDoctor(formData: FormData) {
    const name = formData.get('name') as string
    const surname = formData.get('surname') as string
    const specialization = formData.get('specialization') as string
    const phone = formData.get('phone') as string
    const password = formData.get('password') as string

    // Keep only digits for the internal email
    const cleanPhone = phone.replace(/\D/g, '')
    const email = `${cleanPhone}@skinchecker.local`

    const supabaseAdmin = createAdminClient()

    // 1. Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
    })

    if (authError || !authData.user) {
        return { error: authError?.message || "Failed to create auth user" }
    }

    const userId = authData.user.id

    // 2. Insert into user_roles
    const { error: roleError } = await supabaseAdmin.from('user_roles').insert({
        id: userId,
        role: 'doctor'
    })

    if (roleError) {
        // Rollback basic
        await supabaseAdmin.auth.admin.deleteUser(userId)
        return { error: "Failed to set user role: " + roleError.message }
    }

    // 3. Insert into doctors table
    const { error: docError } = await supabaseAdmin.from('doctors').insert({
        id: userId,
        name,
        surname,
        specialization
    })

    if (docError) {
        await supabaseAdmin.auth.admin.deleteUser(userId)
        return { error: "Failed to create doctor profile: " + docError.message }
    }

    revalidatePath('/admin')
    return { success: true }
}
