'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createForumPost(formData: FormData) {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        return { error: 'Unauthorized. Please log in.' }
    }

    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const image = formData.get('image') as File | null

    if (!title || !content) {
        return { error: 'Title and content are required.' }
    }

    let image_url = null

    if (image && image.size > 0) {
        const fileExt = image.name.split('.').pop()
        const fileName = `forum/${user.id}/${Date.now()}_${Math.random()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
            .from('health-checks')
            .upload(fileName, image)

        if (uploadError) {
            console.error('Error uploading image:', uploadError.message)
            return { error: 'Failed to upload image. Please try again.' }
        }

        const { data: { publicUrl } } = supabase.storage
            .from('health-checks')
            .getPublicUrl(fileName)

        image_url = publicUrl
    }

    const { error: dbError } = await supabase
        .from('forum_posts')
        .insert({
            doctor_id: user.id,
            title,
            content,
            image_url
        })

    if (dbError) {
        console.error('Error creating forum post:', dbError.message)
        return { error: 'Failed to create post. Please try again later.' }
    }

    revalidatePath('/doctor/forum')
    return { success: true }
}

export async function createForumComment(formData: FormData) {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        return { error: 'Unauthorized. Please log in.' }
    }

    const post_id = formData.get('post_id') as string
    const content = formData.get('content') as string

    if (!post_id || !content) {
        return { error: 'Post ID and comment content are required.' }
    }

    const { error: dbError } = await supabase
        .from('forum_comments')
        .insert({
            post_id,
            doctor_id: user.id,
            content
        })

    if (dbError) {
        console.error('Error creating forum comment:', dbError.message)
        return { error: 'Failed to post comment. Please try again later.' }
    }

    revalidatePath(`/doctor/forum/${post_id}`)
    return { success: true }
}
