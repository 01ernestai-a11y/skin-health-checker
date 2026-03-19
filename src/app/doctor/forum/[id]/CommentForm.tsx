'use client'

import { createForumComment } from '@/app/actions/forum'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useFormStatus } from 'react-dom'
import { useRef } from 'react'
import { Send } from 'lucide-react'

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" disabled={pending} className="bg-indigo-600 hover:bg-indigo-700 shrink-0">
            {pending ? 'Posting...' : (
                <>
                   <Send className="h-4 w-4 mr-2" />
                   Reply
                </>
            )}
        </Button>
    )
}

export function CommentForm({ postId }: { postId: string }) {
    const formRef = useRef<HTMLFormElement>(null)

    async function action(formData: FormData) {
        const res = await createForumComment(formData)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Comment posted!")
            formRef.current?.reset()
        }
    }

    return (
        <form ref={formRef} action={action} className="flex gap-4 items-start bg-slate-50 p-4 rounded-xl border border-slate-200">
            <input type="hidden" name="post_id" value={postId} />
            <Textarea
                name="content"
                required
                placeholder="Share your professional insights or questions..."
                className="flex-1 bg-white border-slate-300 resize-none rounded-lg"
                rows={2}
            />
            <SubmitButton />
        </form>
    )
}
