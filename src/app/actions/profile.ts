'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getPatientProfile() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'Unauthorized' }

    const { data, error } = await supabase
        .from('patients')
        .select('name, surname, year_of_birth, phone_number, avatar_url')
        .eq('id', user.id)
        .single()

    if (error) return { data: null, error: error.message }
    return { data, error: null }
}

export async function updatePatientProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('patients')
        .update({
            name: formData.get('name') as string,
            surname: formData.get('surname') as string,
            year_of_birth: parseInt(formData.get('year_of_birth') as string),
        })
        .eq('id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/patient/profile')
    return { success: true }
}

export async function getDoctorProfile() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'Unauthorized' }

    const { data, error } = await supabase
        .from('doctors')
        .select('name, surname, specialization, education, experience_years, city, avatar_url')
        .eq('id', user.id)
        .single()

    if (error) return { data: null, error: error.message }
    return { data, error: null }
}

export async function updateDoctorProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('doctors')
        .update({
            name: formData.get('name') as string,
            surname: formData.get('surname') as string,
            specialization: formData.get('specialization') as string,
            education: formData.get('education') as string,
            experience_years: parseInt(formData.get('experience_years') as string),
            city: (formData.get('city') as string) || 'Алматы',
        })
        .eq('id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/doctor/profile')
    return { success: true }
}

export async function updateAvatarUrl(avatarUrl: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Determine table from role
    const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('id', user.id)
        .single()

    const role = roleData?.role
    if (role === 'patient') {
        const { error } = await supabase.from('patients').update({ avatar_url: avatarUrl }).eq('id', user.id)
        if (error) return { error: error.message }
    } else if (role === 'doctor') {
        const { error } = await supabase.from('doctors').update({ avatar_url: avatarUrl }).eq('id', user.id)
        if (error) return { error: error.message }
    } else {
        return { error: 'Avatar not supported for this role' }
    }

    revalidatePath('/patient/profile')
    revalidatePath('/doctor/profile')
    return { success: true }
}

export async function getMyAvatar() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { avatarUrl: null }

    const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('id', user.id)
        .single()

    const role = roleData?.role
    if (role === 'patient') {
        const { data } = await supabase.from('patients').select('avatar_url, name, surname').eq('id', user.id).single()
        return { avatarUrl: data?.avatar_url || null, name: data?.name, surname: data?.surname }
    } else if (role === 'doctor') {
        const { data } = await supabase.from('doctors').select('avatar_url, name, surname').eq('id', user.id).single()
        return { avatarUrl: data?.avatar_url || null, name: data?.name, surname: data?.surname }
    }
    return { avatarUrl: null }
}
