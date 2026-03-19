'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createDoctor(formData: FormData) {
    const name = formData.get('name') as string
    const surname = formData.get('surname') as string
    const specialization = formData.get('specialization') as string
    const education = formData.get('education') as string
    const experience_years = parseInt(formData.get('experience_years') as string, 10) || 0
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
        specialization,
        education,
        experience_years,
        is_verified: true, // Created by admin, so pre-verified
    })

    if (docError) {
        await supabaseAdmin.auth.admin.deleteUser(userId)
        return { error: "Failed to create doctor profile: " + docError.message }
    }

    revalidatePath('/admin')
    return { success: true }
}

export async function verifyDoctor(doctorId: string) {
    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin
        .from('doctors')
        .update({ is_verified: true })
        .eq('id', doctorId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin/doctors')
    return { success: true }
}

export async function deleteDoctor(doctorId: string) {
    const supabaseAdmin = createAdminClient()
    
    // Deleting the user from auth.users cascades to everything else (doctors, user_roles, etc.) if keys are configured.
    // If no cascade, we manually remove. To be safe, we delete auth user which often handles it.
    const { error } = await supabaseAdmin.auth.admin.deleteUser(doctorId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin/doctors')
    return { success: true }
}

export async function deletePatient(patientId: string) {
    const supabaseAdmin = createAdminClient()
    
    const { error } = await supabaseAdmin.auth.admin.deleteUser(patientId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin/patients')
    return { success: true }
}
