'use client'

import { useEffect, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { getAdminSettings, updateAdminSettings, sendTelegramTestMessage } from '@/app/actions/admin-settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Send, Settings } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminProfilePage() {
    const t = useTranslations('admin')
    const tc = useTranslations('common')
    const [settings, setSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isPending, startTransition] = useTransition()
    const [testing, setTesting] = useState(false)

    useEffect(() => {
        getAdminSettings().then(({ data }) => {
            setSettings(data)
            setLoading(false)
        })
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        )
    }

    function handleSubmit(formData: FormData) {
        startTransition(async () => {
            const result = await updateAdminSettings(formData)
            if (result.error) toast.error(result.error)
            else toast.success(tc('save'))
        })
    }

    async function handleTest() {
        setTesting(true)
        const result = await sendTelegramTestMessage()
        if (result.error) toast.error(result.error)
        else toast.success(t('testSent'))
        setTesting(false)
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">{t('telegramSettings')}</h1>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-indigo-600" />
                        {t('telegramSettings')}
                    </CardTitle>
                    <CardDescription>{t('telegramDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="telegram_bot_token">{t('botToken')}</Label>
                            <Input
                                id="telegram_bot_token"
                                name="telegram_bot_token"
                                type="text"
                                defaultValue={settings?.telegram_bot_token || ''}
                                placeholder="123456789:ABC-DEF..."
                            />
                            <p className="text-xs text-slate-400">{t('botTokenHint')}</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="telegram_chat_id">{t('chatId')}</Label>
                            <Input
                                id="telegram_chat_id"
                                name="telegram_chat_id"
                                type="text"
                                defaultValue={settings?.telegram_chat_id || ''}
                                placeholder="123456789"
                            />
                            <p className="text-xs text-slate-400">{t('chatIdHint')}</p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button type="submit" disabled={isPending}>
                                {isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        {tc('saving')}
                                    </>
                                ) : (
                                    tc('save')
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleTest}
                                disabled={testing || !settings?.telegram_bot_token}
                            >
                                {testing ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4 mr-2" />
                                )}
                                {t('testNotification')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
