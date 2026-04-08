'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendTelegramMessage } from '@/lib/telegram'

export async function getAdminSettings() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'Unauthorized' }

    const { data } = await supabase
        .from('admin_settings')
        .select('telegram_chat_id, telegram_bot_token')
        .eq('admin_id', user.id)
        .single()

    return { data: data || { telegram_chat_id: '', telegram_bot_token: '' }, error: null }
}

export async function updateAdminSettings(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const telegramChatId = (formData.get('telegram_chat_id') as string) || null
    const telegramBotToken = (formData.get('telegram_bot_token') as string) || null

    const { error } = await supabase
        .from('admin_settings')
        .upsert({
            admin_id: user.id,
            telegram_chat_id: telegramChatId,
            telegram_bot_token: telegramBotToken,
            updated_at: new Date().toISOString(),
        })

    if (error) return { error: error.message }
    revalidatePath('/admin/profile')
    return { success: true }
}

export async function sendTelegramTestMessage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: settings } = await supabase
        .from('admin_settings')
        .select('telegram_chat_id, telegram_bot_token')
        .eq('admin_id', user.id)
        .single()

    if (!settings?.telegram_bot_token || !settings?.telegram_chat_id) {
        return { error: 'Telegram settings not configured' }
    }

    const result = await sendTelegramMessage(
        settings.telegram_bot_token,
        settings.telegram_chat_id,
        '✅ <b>Test message from AI Skin Checker</b>\n\nYour Telegram notifications are working correctly.'
    )

    if (!result.ok) return { error: result.error || 'Failed to send' }
    return { success: true }
}
