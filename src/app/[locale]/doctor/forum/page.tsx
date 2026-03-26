import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Image as ImageIcon } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { CreatePostButton } from './CreatePostButton'
import { getTranslations } from 'next-intl/server'

export default async function DoctorForumPage() {
    const t = await getTranslations('doctor')
    const supabase = await createClient()

    // Fetch forum posts and join with doctor info
    const { data: posts, error } = await supabase
        .from('forum_posts')
        .select(`
            *,
            doctor:doctors(name, surname, specialization),
            forum_comments(count)
        `)
        .order('created_at', { ascending: false })

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-700 rounded-md">
                {t('forumError')} {error.message}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{t('forumTitle')}</h2>
                    <p className="text-muted-foreground">
                        {t('forumSubtitle')}
                    </p>
                </div>
                <CreatePostButton />
            </div>

            <div className="grid grid-cols-1 gap-4">
                {posts && posts.length > 0 ? (
                    posts.map((post) => {
                        const commentsCount = post.forum_comments?.[0]?.count || 0

                        return (
                            <Link key={post.id} href={`/doctor/forum/${post.id}`} className="block transition-transform hover:-translate-y-1">
                                <Card className="hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer">
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start gap-4">
                                            <CardTitle className="text-lg leading-tight group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                                                {post.title}
                                                {post.image_url && <ImageIcon className="h-4 w-4 text-slate-400" />}
                                            </CardTitle>
                                            <Badge variant="outline" className="shrink-0 flex gap-1 items-center bg-slate-50 text-slate-600">
                                                <MessageCircle className="h-3 w-3" />
                                                {commentsCount}
                                            </Badge>
                                        </div>
                                        <CardDescription className="flex items-center gap-2 text-xs">
                                            <span className="font-medium text-slate-700">
                                                Dr. {post.doctor?.name} {post.doctor?.surname}
                                            </span>
                                            <span className="text-slate-300">•</span>
                                            <span>{post.doctor?.specialization || 'Doctor'}</span>
                                            <span className="text-slate-300">•</span>
                                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-slate-600 text-sm line-clamp-3">
                                            {post.content}
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        )
                    })
                ) : (
                    <div className="text-center py-12 px-4 border rounded-lg bg-slate-50 border-dashed">
                        <MessageCircle className="mx-auto h-8 w-8 text-slate-400 mb-3" />
                        <h3 className="text-sm font-medium text-slate-900">{t('forumEmpty')}</h3>
                        <p className="text-sm text-slate-500 mt-1">{t('forumEmptyHint')}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
