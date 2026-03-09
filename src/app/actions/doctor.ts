'use server'

import { createClient } from '@/utils/supabase/server'

export async function getDoctorPatients() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'Unauthorized' }

    // A patient is connected to a doctor if they share a chat
    const { data: chats, error } = await supabase
        .from('chats')
        .select('patient_id, patients(id, name, surname, year_of_birth, phone_number)')
        .eq('doctor_id', user.id)

    if (error) return { data: null, error: error.message }

    // Deduplicate patients using a Map
    const patientMap = new Map()
    chats?.forEach(chat => {
        // @ts-ignore
        const p: any = Array.isArray(chat.patients) ? chat.patients[0] : chat.patients
        if (p && !patientMap.has(p.id)) {
            patientMap.set(p.id, p)
        }
    })

    return { data: Array.from(patientMap.values()), error: null }
}

export async function getDoctorChats() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'Unauthorized' }

    const { data, error } = await supabase
        .from('chats')
        .select('id, patient_id, patients(name, surname), updated_at:created_at')
        .eq('doctor_id', user.id)
        .order('created_at', { ascending: false })

    if (error) return { data: null, error: error.message }
    return { data, error: null }
}
