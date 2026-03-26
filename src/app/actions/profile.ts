'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getPatientProfile() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'Unauthorized' }

    const { data, error } = await supabase
        .from('patients')
        .select('name, surname, year_of_birth, weight, phone_number')
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
            weight: parseFloat(formData.get('weight') as string),
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
        .select('name, surname, specialization, education, experience_years')
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
        })
        .eq('id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/doctor/profile')
    return { success: true }
}
