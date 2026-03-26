'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, X, SwitchCamera, Circle } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface CameraCaptureProps {
    onCapture: (file: File) => void
    onClose: () => void
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
    const [ready, setReady] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const t = useTranslations('chat')

    const startCamera = useCallback(async (facing: 'environment' | 'user') => {
        // Stop previous stream
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
        }
        setReady(false)
        setError(null)

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 960 } },
                audio: false,
            })
            streamRef.current = stream
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                videoRef.current.onloadedmetadata = () => setReady(true)
            }
        } catch {
            setError(t('cameraError'))
        }
    }, [t])

    useEffect(() => {
        startCamera(facingMode)
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop())
            }
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const switchCamera = () => {
        const next = facingMode === 'environment' ? 'user' : 'environment'
        setFacingMode(next)
        startCamera(next)
    }

    const takePhoto = () => {
        const video = videoRef.current
        const canvas = canvasRef.current
        if (!video || !canvas) return

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.drawImage(video, 0, 0)

        canvas.toBlob((blob) => {
            if (!blob) return
            const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' })

            // Stop stream
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop())
            }
            onCapture(file)
        }, 'image/jpeg', 0.9)
    }

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-black/80">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        if (streamRef.current) {
                            streamRef.current.getTracks().forEach(track => track.stop())
                        }
                        onClose()
                    }}
                    className="text-white hover:bg-white/20"
                >
                    <X className="h-6 w-6" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={switchCamera}
                    className="text-white hover:bg-white/20"
                >
                    <SwitchCamera className="h-6 w-6" />
                </Button>
            </div>

            {/* Video */}
            <div className="flex-1 flex items-center justify-center overflow-hidden">
                {error ? (
                    <div className="text-white text-center px-6">
                        <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>{error}</p>
                    </div>
                ) : (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                    />
                )}
            </div>

            {/* Shutter */}
            <div className="flex items-center justify-center p-6 pb-10 bg-black/80">
                <button
                    onClick={takePhoto}
                    disabled={!ready}
                    className="w-18 h-18 rounded-full border-4 border-white flex items-center justify-center disabled:opacity-30 transition-opacity active:scale-95"
                >
                    <Circle className="h-14 w-14 text-white fill-white" />
                </button>
            </div>

            <canvas ref={canvasRef} className="hidden" />
        </div>
    )
}
