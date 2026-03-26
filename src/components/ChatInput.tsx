'use client'

import { useState, useRef } from 'react'
import { sendMessage } from '@/app/actions/patient'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Loader2, ImagePlus, Camera, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import CameraCapture from '@/components/CameraCapture'

export function ChatInput({ chatId }: { chatId: string }) {
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [showCamera, setShowCamera] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const path = usePathname()
    const t = useTranslations('chat')

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
    }

    const handleCameraCapture = (file: File) => {
        setShowCamera(false)
        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
    }

    const removeImage = () => {
        setImageFile(null)
        if (imagePreview) URL.revokeObjectURL(imagePreview)
        setImagePreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim() && !imageFile) return

        setLoading(true)
        let imageUrl: string | undefined

        try {
            if (imageFile) {
                const supabase = createClient()
                const ext = imageFile.name.split('.').pop()
                const fileName = `chat/${chatId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

                const { error: uploadError } = await supabase.storage
                    .from('health-checks')
                    .upload(fileName, imageFile)

                if (uploadError) {
                    setLoading(false)
                    return
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('health-checks')
                    .getPublicUrl(fileName)

                imageUrl = publicUrl
            }

            const messageContent = content.trim() || (imageFile ? '📷' : '')
            const result = await sendMessage(chatId, messageContent, path, imageUrl)

            if (!result.error) {
                setContent('')
                removeImage()
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {showCamera && (
                <CameraCapture
                    onCapture={handleCameraCapture}
                    onClose={() => setShowCamera(false)}
                />
            )}
            <div className="space-y-2">
                {imagePreview && (
                    <div className="relative inline-block">
                        <Image
                            src={imagePreview}
                            alt="Preview"
                            width={120}
                            height={120}
                            className="rounded-lg object-cover border border-slate-200"
                            style={{ width: 120, height: 120 }}
                        />
                        <button
                            type="button"
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                )}
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageSelect}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-slate-400 hover:text-indigo-600"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                    >
                        <ImagePlus className="h-5 w-5" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-slate-400 hover:text-indigo-600"
                        onClick={() => setShowCamera(true)}
                        disabled={loading}
                    >
                        <Camera className="h-5 w-5" />
                    </Button>
                    <Input
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={t('placeholder')}
                        className="flex-1"
                        disabled={loading}
                    />
                    <Button type="submit" disabled={loading || (!content.trim() && !imageFile)}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </form>
            </div>
        </>
    )
}
