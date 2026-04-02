'use client'

import { formatDistanceToNow } from 'date-fns'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ChatMessageProps {
    content: string
    imageUrl?: string | null
    createdAt: string
    isMine: boolean
}

export default function ChatMessage({ content, imageUrl, createdAt, isMine }: ChatMessageProps) {
    const hasMarkdown = content && content !== '📷' && /[#*_`\[\]|>-]/.test(content)

    return (
        <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${isMine
                ? 'bg-indigo-600 text-white rounded-br-sm'
                : 'bg-white text-slate-900 border shadow-sm rounded-bl-sm'
            }`}>
                {imageUrl && (
                    <a href={imageUrl} target="_blank" rel="noopener noreferrer">
                        <Image
                            src={imageUrl}
                            alt=""
                            width={240}
                            height={240}
                            className="rounded-lg mb-1.5 max-w-[240px] h-auto"
                        />
                    </a>
                )}
                {content && content !== '📷' && (
                    hasMarkdown ? (
                        <div className={`prose prose-sm max-w-none ${isMine
                            ? 'prose-invert prose-p:text-white prose-headings:text-white prose-strong:text-white prose-li:text-white'
                            : 'prose-slate'
                        } prose-p:leading-relaxed prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0`}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {content}
                            </ReactMarkdown>
                        </div>
                    ) : (
                        <p className="text-sm whitespace-pre-wrap">{content}</p>
                    )
                )}
                <span className={`text-[10px] mt-1 block ${isMine ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
                </span>
            </div>
        </div>
    )
}
