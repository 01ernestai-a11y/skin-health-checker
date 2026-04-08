import { createAdminClient } from '@/utils/supabase/admin'

export async function sendTelegramMessage(botToken: string, chatId: string, text: string): Promise<{ ok: boolean; error?: string }> {
    try {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text,
                parse_mode: 'HTML',
            }),
        })
        const data = await response.json()
        if (!data.ok) {
            return { ok: false, error: data.description || 'Telegram API error' }
        }
        return { ok: true }
    } catch (e: any) {
        return { ok: false, error: e?.message || 'Network error' }
    }
}

export async function notifyAdminsAboutNewDoctor(doctor: { name: string; surname: string; specialization: string }) {
    const supabaseAdmin = createAdminClient()

    // Find all admins
    const { data: adminRoles } = await supabaseAdmin
        .from('user_roles')
        .select('id')
        .eq('role', 'admin')

    if (!adminRoles || adminRoles.length === 0) return

    const adminIds = adminRoles.map(r => r.id)

    // Get telegram settings for all admins
    const { data: settings } = await supabaseAdmin
        .from('admin_settings')
        .select('admin_id, telegram_chat_id, telegram_bot_token')
        .in('admin_id', adminIds)

    if (!settings || settings.length === 0) return

    const message = `🆕 <b>New Doctor Registration</b>\n\n` +
        `<b>Name:</b> ${doctor.name} ${doctor.surname}\n` +
        `<b>Specialization:</b> ${doctor.specialization}\n\n` +
        `Verify the doctor account in admin panel.`

    // Send to all configured admins in parallel
    await Promise.all(
        settings
            .filter(s => s.telegram_bot_token && s.telegram_chat_id)
            .map(s => sendTelegramMessage(s.telegram_bot_token!, s.telegram_chat_id!, message))
    )
}
