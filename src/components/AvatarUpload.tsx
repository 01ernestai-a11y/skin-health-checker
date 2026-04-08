'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { updateAvatarUrl } from '@/app/actions/profile'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Camera, ImagePlus, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import CameraCapture from '@/components/CameraCapture'

interface AvatarUploadProps {
    currentAvatarUrl?: string | null
    initials: string
    onUploaded?: (url: string) => void
}

export default function AvatarUpload({ currentAvatarUrl, initials, onUploaded }: AvatarUploadProps) {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(currentAvatarUrl || null)
    const [uploading, setUploading] = useState(false)
    const [showCamera, setShowCamera] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const t = useTranslations('common')

    const handleFile = async (file: File) => {
        setUploading(true)
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not logged in')

            const ext = file.name.split('.').pop() || 'jpg'
            const path = `avatars/${user.id}/${Date.now()}.${ext}`

            const { error: uploadError } = await supabase.storage
                .from('health-checks')
                .upload(path, file, { upsert: true })

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('health-checks')
                .getPublicUrl(path)

            const result = await updateAvatarUrl(publicUrl)
            if (result.error) throw new Error(result.error)

            setAvatarUrl(publicUrl)
            onUploaded?.(publicUrl)
            toast.success(t('avatarUpdated'))
        } catch (e: any) {
            toast.error(e.message || 'Upload failed')
        } finally {
            setUploading(false)
        }
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) handleFile(file)
    }

    const handleCameraCapture = (file: File) => {
        setShowCamera(false)
        handleFile(file)
    }

    return (
        <>
            {showCamera && (
                <CameraCapture onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />
            )}
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative">
                    <Avatar className="size-24 border-2 border-slate-200">
                        {avatarUrl && <AvatarImage src={avatarUrl} alt="Avatar" />}
                        <AvatarFallback className="bg-indigo-100 text-indigo-700 text-2xl font-semibold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    {uploading && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-white" />
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileInput}
                    />
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                        >
                            <ImagePlus className="h-4 w-4 mr-1.5" />
                            {t('uploadAvatar')}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowCamera(true)}
                            disabled={uploading}
                        >
                            <Camera className="h-4 w-4 mr-1.5" />
                            {t('takePhoto')}
                        </Button>
                    </div>
                    <p className="text-xs text-slate-400">PNG, JPG up to 5MB</p>
                </div>
            </div>
        </>
    )
}
