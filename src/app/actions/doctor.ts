'use server'

import { createClient } from '@/utils/supabase/server'

export async function getDoctorPatients() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'Unauthorized' }

    // A patient is connected to a doctor if they share a chat
    const { data: chats, error } = await supabase
        .from('chats')
        .select('patient_id, patients(id, name, surname, year_of_birth, phone_number, avatar_url)')
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
    if (!user) return { data: null, userId: null, error: 'Unauthorized' }

    const { data, error } = await supabase
        .from('chats')
        .select('id, patient_id, patients(name, surname, avatar_url), updated_at:created_at')
        .eq('doctor_id', user.id)
        .eq('type', 'patient_doctor')
        .order('created_at', { ascending: false })

    if (error) return { data: null, userId: null, error: error.message }

    const enriched = await Promise.all(
        (data || []).map(async (chat: any) => {
            const { data: lastMsg } = await supabase
                .from('messages')
                .select('content, created_at, sender_id, image_url')
                .eq('chat_id', chat.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()
            return { ...chat, lastMessage: lastMsg }
        })
    )

    return { data: enriched, userId: user.id, error: null }
}

export async function getDoctorChecks() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'Unauthorized' }

    const { data, error } = await supabase
        .from('doctor_checks')
        .select('*')
        .eq('doctor_id', user.id)
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
        .select('id, name, surname, specialization, education, experience_years, avatar_url, city')
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
    if (!user) return { data: null, userId: null, error: 'Unauthorized' }

    const { data, error } = await supabase
        .from('chats')
        .select('id, doctor_id, doctor2_id, doctors!chats_doctor_id_fkey(name, surname, specialization, avatar_url), created_at')
        .eq('type', 'doctor_doctor')
        .or(`doctor_id.eq.${user.id},doctor2_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

    if (error) return { data: null, userId: null, error: error.message }

    const enrichedChats = await Promise.all(
        (data || []).map(async (chat: any) => {
            let otherDoctor
            if (chat.doctor_id === user.id) {
                const { data: doc2 } = await supabase
                    .from('doctors')
                    .select('name, surname, specialization, avatar_url')
                    .eq('id', chat.doctor2_id)
                    .single()
                otherDoctor = doc2
            } else {
                otherDoctor = chat.doctors
            }

            const { data: lastMsg } = await supabase
                .from('messages')
                .select('content, created_at, sender_id, image_url')
                .eq('chat_id', chat.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

            return { id: chat.id, otherDoctor, lastMessage: lastMsg, created_at: chat.created_at }
        })
    )

    return { data: enrichedChats, userId: user.id, error: null }
}
