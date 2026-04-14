'use client'

import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createForumPost } from '@/app/actions/forum'
import { toast } from 'sonner'
import { useFormStatus } from 'react-dom'
import { useTranslations } from 'next-intl'

function SubmitButton() {
    const { pending } = useFormStatus()
    const t = useTranslations('doctor')
    return (
        <Button type="submit" disabled={pending}>
            {pending ? (
                <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('publishing')}
                </>
            ) : (
                t('publishPost')
            )}
        </Button>
    )
}

export function CreatePostButton() {
    const [open, setOpen] = useState(false)
    const t = useTranslations('doctor')

    async function action(formData: FormData) {
        const res = await createForumPost(formData)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success(t('postSuccess'))
            setOpen(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="inline-flex h-9 px-4 py-2 shrink-0 items-center justify-center rounded-md bg-indigo-600 hover:bg-indigo-700 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <Plus className="mr-2 h-4 w-4" />
                {t('createPost')}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{t('createPostTitle')}</DialogTitle>
                    <DialogDescription>{t('createPostDesc')}</DialogDescription>
                </DialogHeader>
                <form action={action} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">{t('postTitle')}</Label>
                        <Input id="title" name="title" required placeholder={t('postTitlePlaceholder')} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="content">{t('postContent')}</Label>
                        <Textarea
                            id="content"
                            name="content"
                            required
                            placeholder={t('postContentPlaceholder')}
                            className="min-h-[200px]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="image">{t('attachImage')}</Label>
                        <Input id="image" name="image" type="file" accept="image/*" />
                        <p className="text-xs text-slate-500">{t('attachImageHint')}</p>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            {t('cancel')}
                        </Button>
                        <SubmitButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
