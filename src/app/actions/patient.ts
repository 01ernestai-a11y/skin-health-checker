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

export async function saveAIChatHistory(
    healthCheckId: string,
    chatHistory: Array<{ role: string; content: string }>
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('health_checks')
        .update({ ai_chat_history: chatHistory })
        .eq('id', healthCheckId)
        .eq('patient_id', user.id)

    if (error) return { error: error.message }
    return { success: true }
}

export async function shareCheckWithDoctor(healthCheckId: string, doctorId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Get the health check
    const { data: check } = await supabase
        .from('health_checks')
        .select('photo_url, ai_verdict')
        .eq('id', healthCheckId)
        .eq('patient_id', user.id)
        .single()

    if (!check) return { error: 'Health check not found' }

    // Create or get chat with the doctor
    const { data: existingChat } = await supabase
        .from('chats')
        .select('id')
        .eq('patient_id', user.id)
        .eq('doctor_id', doctorId)
        .single()

    let chatId: string
    if (existingChat) {
        chatId = existingChat.id
    } else {
        const { data: newChat, error: chatError } = await supabase
            .from('chats')
            .insert({ patient_id: user.id, doctor_id: doctorId })
            .select('id')
            .single()
        if (chatError || !newChat) return { error: chatError?.message || 'Failed to create chat' }
        chatId = newChat.id
    }

    // Send the AI verdict as a message with the photo
    const content = `📋 AI Analysis Result:\n\n${check.ai_verdict.substring(0, 500)}${check.ai_verdict.length > 500 ? '...' : ''}`

    const { error: msgError } = await supabase
        .from('messages')
        .insert({
            chat_id: chatId,
            sender_id: user.id,
            content,
            image_url: check.photo_url,
        })

    if (msgError) return { error: msgError.message }
    return { success: true, chatId }
}

export async function getAvailableDoctors() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('doctors')
        .select('id, name, surname, specialization, avatar_url')
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
    if (!user) return { data: null, userId: null, error: 'Unauthorized' }

    const { data, error } = await supabase
        .from('chats')
        .select('id, doctor_id, doctors!chats_doctor_id_fkey(name, surname, specialization, avatar_url), updated_at:created_at')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false })

    if (error) return { data: null, userId: null, error: error.message }

    // Enrich with last message
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

export async function sendMessage(chatId: string, content: string, path: string, imageUrl?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const row: Record<string, unknown> = {
        chat_id: chatId,
        sender_id: user.id,
        content,
    }
    if (imageUrl) row.image_url = imageUrl

    const { error } = await supabase
        .from('messages')
        .insert(row)

    if (error) return { error: error.message }

    revalidatePath(path)
    return { success: true }
}
