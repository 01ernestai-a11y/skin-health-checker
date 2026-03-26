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
        .eq('type', 'patient_doctor')

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
        .eq('type', 'patient_doctor')
        .order('created_at', { ascending: false })

    if (error) return { data: null, error: error.message }
    return { data, error: null }
}

export async function getPatientHealthChecks(patientId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'Unauthorized' }

    // RLS ensures doctor can only see checks for patients they have a chat with
    const { data, error } = await supabase
        .from('health_checks')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })

    if (error) return { data: null, error: error.message }

    // Also fetch patient info
    const { data: patient } = await supabase
        .from('patients')
        .select('name, surname')
        .eq('id', patientId)
        .single()

    return { data, patient, error: null }
}

export async function getVerifiedDoctors() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'Unauthorized' }

    const { data, error } = await supabase
        .from('doctors')
        .select('id, name, surname, specialization, education, experience_years')
        .eq('is_verified', true)
        .neq('id', user.id)
        .order('name', { ascending: true })

    if (error) return { data: null, error: error.message }
    return { data, error: null }
}

export async function createOrGetDoctorChat(otherDoctorId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'Unauthorized' }

    // Check if chat already exists (in either direction)
    const { data: existing } = await supabase
        .from('chats')
        .select('id')
        .eq('type', 'doctor_doctor')
        .or(`and(doctor_id.eq.${user.id},doctor2_id.eq.${otherDoctorId}),and(doctor_id.eq.${otherDoctorId},doctor2_id.eq.${user.id})`)
        .single()

    if (existing) {
        return { data: existing, error: null }
    }

    const { data: newChat, error } = await supabase
        .from('chats')
        .insert({
            type: 'doctor_doctor',
            doctor_id: user.id,
            doctor2_id: otherDoctorId,
            patient_id: null,
        })
        .select('id')
        .single()

    if (error) return { data: null, error: error.message }
    return { data: newChat, error: null }
}

export async function getDoctorToDoctorChats() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'Unauthorized' }

    const { data, error } = await supabase
        .from('chats')
        .select('id, doctor_id, doctor2_id, doctors!chats_doctor_id_fkey(name, surname, specialization), created_at')
        .eq('type', 'doctor_doctor')
        .or(`doctor_id.eq.${user.id},doctor2_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

    if (error) return { data: null, error: error.message }

    // For each chat, we need to get the OTHER doctor's info
    // If doctor_id is me, the other is doctor2_id (need separate query)
    // If doctor2_id is me, the other is doctor_id (already joined as 'doctors')
    const enrichedChats = await Promise.all(
        (data || []).map(async (chat: any) => {
            const otherDoctorId = chat.doctor_id === user.id ? chat.doctor2_id : chat.doctor_id

            if (chat.doctor_id === user.id) {
                // Need to fetch doctor2's info
                const { data: doc2 } = await supabase
                    .from('doctors')
                    .select('name, surname, specialization')
                    .eq('id', chat.doctor2_id)
                    .single()
                return { id: chat.id, otherDoctor: doc2, created_at: chat.created_at }
            } else {
                // doctor_id is the other doctor, already joined
                return { id: chat.id, otherDoctor: chat.doctors, created_at: chat.created_at }
            }
        })
    )

    return { data: enrichedChats, error: null }
}
