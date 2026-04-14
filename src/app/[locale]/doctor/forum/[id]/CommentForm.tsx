'use client'

import { createForumComment } from '@/app/actions/forum'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useFormStatus } from 'react-dom'
import { useRef } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

function SubmitButton() {
    const { pending } = useFormStatus()
    const t = useTranslations('doctor')
    return (
        <Button type="submit" disabled={pending} className="bg-indigo-600 hover:bg-indigo-700 shrink-0">
            {pending ? (
                <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('replying')}
                </>
            ) : (
                <>
                    <Send className="h-4 w-4 mr-2" />
                    {t('reply')}
                </>
            )}
        </Button>
    )
}

export function CommentForm({ postId }: { postId: string }) {
    const formRef = useRef<HTMLFormElement>(null)
    const t = useTranslations('doctor')

    async function action(formData: FormData) {
        const res = await createForumComment(formData)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success(t('commentSuccess'))
            formRef.current?.reset()
        }
    }

    return (
        <form ref={formRef} action={action} className="flex gap-4 items-start bg-slate-50 p-4 rounded-xl border border-slate-200">
            <input type="hidden" name="post_id" value={postId} />
            <Textarea
                name="content"
                required
                placeholder={t('replyPlaceholder')}
                className="flex-1 bg-white border-slate-300 resize-none rounded-lg"
                rows={2}
            />
            <SubmitButton />
        </form>
    )
}
