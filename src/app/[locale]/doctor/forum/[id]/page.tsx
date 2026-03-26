import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, MessageCircle, ArrowLeft } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { notFound } from 'next/navigation'
import { CommentForm } from './CommentForm'
import { getTranslations } from 'next-intl/server'

export default async function ForumPostPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const t = await getTranslations('doctor')
    const supabase = await createClient()

    // 1. Fetch Post details
    const { data: post, error: postError } = await supabase
        .from('forum_posts')
        .select(`
            *,
            doctor:doctors(name, surname, specialization)
        `)
        .eq('id', id)
        .single()

    if (postError || !post) {
        return notFound()
    }

    // 2. Fetch Post Comments
    const { data: comments, error: commentsError } = await supabase
        .from('forum_comments')
        .select(`
            *,
            doctor:doctors(name, surname, specialization)
        `)
        .eq('post_id', id)
        .order('created_at', { ascending: true })

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Link href="/doctor/forum" className="text-sm font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 transition-colors w-fit">
                <ArrowLeft className="h-4 w-4" />
                {t('backToForum')}
            </Link>

            {/* Original Post */}
            <Card className="border-indigo-100 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-50/50 to-white/50 border-b px-6 py-4">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-loose mb-1">{post.title}</h1>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <User className="h-4 w-4" />
                        <span className="font-medium">Dr. {post.doctor?.name} {post.doctor?.surname}</span>
                        <span>•</span>
                        <span>{post.doctor?.specialization || 'Doctor'}</span>
                        <span>•</span>
                        <span>{new Date(post.created_at).toLocaleString()}</span>
                    </div>
                </div>
                {post.image_url && (
                    <div className="w-full bg-slate-50 border-b border-indigo-50 flex justify-center p-4">
                        <img 
                            src={post.image_url} 
                            alt={t('attachedImage')} 
                            className="max-h-[500px] object-contain rounded-md shadow-sm border border-slate-200"
                        />
                    </div>
                )}
                <CardContent className="pt-6">
                    <p className="text-slate-800 leading-relaxed whitespace-pre-wrap text-base">
                        {post.content}
                    </p>
                </CardContent>
            </Card>

            <div className="border-t pt-8 mt-8 space-y-6">
                <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                        {t('discussion')} ({comments?.length || 0})
                    </h3>
                </div>

                <CommentForm postId={post.id} />

                <div className="space-y-4 pt-4">
                    {comments && comments.length > 0 ? (
                        comments.map((comment) => (
                            <div key={comment.id} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex gap-4">
                                <div className="h-10 w-10 shrink-0 bg-indigo-100 text-indigo-700 flex items-center justify-center rounded-full font-bold">
                                    {comment.doctor?.name?.charAt(0) || 'D'}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex justify-between items-baseline">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-900 text-sm">
                                                Dr. {comment.doctor?.name} {comment.doctor?.surname}
                                            </span>
                                            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                                {comment.doctor?.specialization || 'Doctor'}
                                            </span>
                                        </div>
                                        <span className="text-xs text-slate-400">
                                            {new Date(comment.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
                                        {comment.content}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-slate-500 text-sm">
                            {t('noReplies')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
