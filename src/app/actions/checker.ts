'use server'

import { GoogleGenAI } from '@google/genai'
import { createClient } from '@/utils/supabase/server'

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API })

async function fetchImageAsBase64(url: string) {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const mimeType = response.headers.get('content-type') || 'image/jpeg'
    return { base64: buffer.toString('base64'), mimeType }
}

export async function analyzeSkinInitial(photoUrl: string) {
    try {
        const { base64, mimeType } = await fetchImageAsBase64(photoUrl)

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: "You are an expert dermatologist AI. Please conduct an initial visual review of this skin condition from the uploaded photo. Describe what you see objectively but do not make a final diagnosis yet." },
                        { inlineData: { data: base64, mimeType } }
                    ]
                }
            ]
        })

        return { success: true, text: response.text }
    } catch (error: any) {
        console.error("Gemini Initial Review Error:", error)
        return { success: false, error: error.message }
    }
}

export async function generateFinalVerdict(
    photoUrl: string,
    initialReview: string,
    answers: Record<string, string>
) {
    try {
        const { base64, mimeType } = await fetchImageAsBase64(photoUrl)

        const prompt = `
You are an expert dermatologist AI. You previously did an initial visual review of the provided photo:
"${initialReview}"

The patient has now answered 5 standard diagnostic questions:
1. How long have you had this skin condition? Answer: ${answers.q1}
2. Does it itch, burn, or cause pain? Answer: ${answers.q2}
3. Have you used any treatments or creams on it? Answer: ${answers.q3}
4. Has it changed in size, shape, or color recently? Answer: ${answers.q4}
5. Do you have a family history of skin cancer or similar conditions? Answer: ${answers.q5}

Based on the photo and these answers, provide a final verdict on the disease. Include a strong medical disclaimer that this is an AI assessment and they should see a doctor.
`
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: prompt },
                        { inlineData: { data: base64, mimeType } }
                    ]
                }
            ]
        })

        const verdict = response.text

        // Save to database
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        let healthCheckId: string | undefined
        if (user) {
            const { data: inserted, error: dbError } = await supabase.from('health_checks').insert({
                patient_id: user.id,
                photo_url: photoUrl,
                q1_answer: answers.q1,
                q2_answer: answers.q2,
                q3_answer: answers.q3,
                q4_answer: answers.q4,
                q5_answer: answers.q5,
                ai_verdict: verdict
            }).select('id').single()
            if (dbError) {
                console.error("Database Save Error:", dbError)
            }
            healthCheckId = inserted?.id
        }

        return { success: true, verdict, healthCheckId }
    } catch (error: any) {
        console.error("Gemini Final Verdict Error:", error)
        return { success: false, error: error.message }
    }
}

export async function chatWithAI(
    photoUrl: string,
    initialReview: string,
    verdict: string,
    messages: Array<{ role: 'user' | 'model'; content: string }>
) {
    try {
        const { base64, mimeType } = await fetchImageAsBase64(photoUrl)

        const systemContext = `You are an expert dermatologist AI assistant. You previously analyzed a skin condition photo.

Your initial visual review: "${initialReview}"

Your final verdict: "${verdict}"

The patient is now asking follow-up questions about the analysis. Answer helpfully and stay in context of the original analysis. If asked about unrelated topics, politely redirect to skin health. Always remind that this is AI advice and they should consult a real doctor for any medical decisions.`

        const contents = [
            {
                role: 'user' as const,
                parts: [
                    { text: systemContext },
                    { inlineData: { data: base64, mimeType } }
                ]
            },
            {
                role: 'model' as const,
                parts: [{ text: 'I understand. I have reviewed the skin condition photo and my previous analysis. I\'m ready to answer your follow-up questions.' }]
            },
            ...messages.slice(-20).map(msg => ({
                role: msg.role as 'user' | 'model',
                parts: [{ text: msg.content }]
            }))
        ]

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents
        })

        return { success: true, text: response.text }
    } catch (error: any) {
        console.error("Gemini Chat Error:", error)
        return { success: false, error: error.message }
    }
}
