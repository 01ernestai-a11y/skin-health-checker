'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createForumPost } from '@/app/actions/forum'
import { toast } from 'sonner'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Posting...' : 'Publish Post'}
        </Button>
    )
}

export function CreatePostButton() {
    const [open, setOpen] = useState(false)

    async function action(formData: FormData) {
        const res = await createForumPost(formData)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Post published successfully!")
            setOpen(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="inline-flex h-9 px-4 py-2 shrink-0 items-center justify-center rounded-md bg-indigo-600 hover:bg-indigo-700 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <Plus className="mr-2 h-4 w-4" />
                Create Post
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Create a New Post</DialogTitle>
                    <DialogDescription>
                        Share an interesting clinical case, ask a question, or start a discussion with the verified doctor community.
                    </DialogDescription>
                </DialogHeader>
                <form action={action} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Post Title</Label>
                        <Input id="title" name="title" required placeholder="A brief, descriptive title" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="content">Post Content</Label>
                        <Textarea 
                            id="content" 
                            name="content" 
                            required 
                            placeholder="Describe your case or discussion topic in detail..."
                            className="min-h-[200px]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="image">Attach Image (Optional)</Label>
                        <Input id="image" name="image" type="file" accept="image/*" />
                        <p className="text-xs text-slate-500">Supports JPG, PNG, WEBP.</p>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <SubmitButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
