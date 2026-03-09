'use server'

import { createClient } from '@/utils/supabase/server'

export async function getPatientHistory() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { data: null, error: 'Unauthorized' }

    const { data, error } = await supabase
        .from('health_checks')
        .select('*')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Failed to fetch history:", error)
        return { data: null, error: error.message }
    }

    return { data, error: null }
}

export async function getAvailableDoctors() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('doctors')
        .select('id, name, surname, specialization')
        .order('name', { ascending: true })

    if (error) {
        console.error("Failed to fetch doctors:", error)
        return { data: null, error: error.message }
    }

    return { data, error: null }
}

export async function createOrGetChat(doctorId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'Unauthorized' }

    // Check if chat exists
    const { data: existingChat } = await supabase
        .from('chats')
        .select('id')
        .eq('patient_id', user.id)
        .eq('doctor_id', doctorId)
        .single()

    if (existingChat) {
        return { data: existingChat, error: null }
    }

    // Create new chat
    const { data: newChat, error } = await supabase
        .from('chats')
        .insert({
            patient_id: user.id,
            doctor_id: doctorId
        })
        .select('id')
        .single()

    if (error) return { data: null, error: error.message }
    return { data: newChat, error: null }
}

export async function getPatientChats() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'Unauthorized' }

    // Join with doctors table to get doctor name
    const { data, error } = await supabase
        .from('chats')
        .select('id, doctor_id, doctors(name, surname, specialization), updated_at:created_at')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false })

    if (error) return { data: null, error: error.message }
    return { data, error: null }
}

export async function getChatMessages(chatId: string) {
    const supabase = await createClient()

    // Validate access (RLS handles this but just to be safe and fetch)
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })

    if (error) return { data: null, error: error.message }
    return { data, error: null }
}

import { revalidatePath } from 'next/cache'

export async function sendMessage(chatId: string, content: string, path: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('messages')
        .insert({
            chat_id: chatId,
            sender_id: user.id,
            content
        })

    if (error) return { error: error.message }

    revalidatePath(path)
    return { success: true }
}
