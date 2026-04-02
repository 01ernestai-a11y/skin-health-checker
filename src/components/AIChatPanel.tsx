'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { chatWithAI } from '@/app/actions/checker'
import { saveAIChatHistory } from '@/app/actions/patient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Loader2, Brain, User, AlertCircle, RefreshCw } from 'lucide-react'
import { useTranslations } from 'next-intl'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Message = { role: 'user' | 'model'; content: string }

interface AIChatPanelProps {
    photoUrl: string
    initialReview: string
    verdict: string
    healthCheckId?: string
    initialMessages?: Message[]
    onReset?: () => void
    readOnly?: boolean
}

export default function AIChatPanel({
    photoUrl,
    initialReview,
    verdict,
    healthCheckId,
    initialMessages,
    onReset,
    readOnly = false,
}: AIChatPanelProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages || [])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const t = useTranslations('patient')

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Auto-save chat history to DB when messages change
    const saveHistory = useCallback(async (msgs: Message[]) => {
        if (healthCheckId && msgs.length > 0) {
            await saveAIChatHistory(healthCheckId, msgs)
        }
    }, [healthCheckId])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || loading) return

        const userMessage: Message = { role: 'user', content: input.trim() }
        const newMessages = [...messages, userMessage]
        setMessages(newMessages)
        setInput('')
        setLoading(true)

        const result = await chatWithAI(photoUrl, initialReview, verdict, newMessages)

        let finalMessages: Message[]
        if (result.success && result.text) {
            finalMessages = [...newMessages, { role: 'model', content: result.text }]
        } else {
            finalMessages = [...newMessages, { role: 'model', content: t('aiChatError') }]
        }
        setMessages(finalMessages)
        await saveHistory(finalMessages)
        setLoading(false)
    }

    return (
        <div className="flex flex-col h-[500px]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Brain className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="font-semibold text-sm text-slate-800">{t('aiAssistant')}</span>
                </div>
                {onReset && (
                    <Button variant="ghost" size="sm" onClick={onReset} className="text-slate-500 text-xs">
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                        {t('newEvaluation')}
                    </Button>
                )}
            </div>

            {/* Disclaimer */}
            {!readOnly && (
                <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-amber-700 leading-tight">{t('aiChatDisclaimer')}</p>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {messages.length === 0 && (
                    <div className="text-center text-slate-400 text-sm py-8">
                        {readOnly ? t('noChatHistory') : t('aiChatPlaceholder')}
                    </div>
                )}
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && (
                            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center mr-2 mt-1 shrink-0">
                                <Brain className="w-3.5 h-3.5 text-indigo-600" />
                            </div>
                        )}
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                            msg.role === 'user'
                                ? 'bg-indigo-600 text-white rounded-br-sm'
                                : 'bg-white text-slate-900 border shadow-sm rounded-bl-sm'
                        }`}>
                            {msg.role === 'model' ? (
                                <div className="prose prose-sm prose-slate max-w-none prose-p:leading-relaxed prose-p:my-1">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            )}
                        </div>
                        {msg.role === 'user' && (
                            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center ml-2 mt-1 shrink-0">
                                <User className="w-3.5 h-3.5 text-white" />
                            </div>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                            <Brain className="w-3.5 h-3.5 text-indigo-600" />
                        </div>
                        <div className="bg-white border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                {t('aiChatThinking')}
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input — only if not readOnly */}
            {!readOnly && (
                <form onSubmit={handleSend} className="border-t bg-white p-3 flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={t('aiChatPlaceholder')}
                        className="flex-1"
                        disabled={loading}
                    />
                    <Button type="submit" disabled={loading || !input.trim()}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </form>
            )}
        </div>
    )
}
