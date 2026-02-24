import { GoogleGenAI } from '@google/genai'
import { readFileSync } from 'fs'

const env = readFileSync('.env', 'utf8')
const match = env.match(/GEMINI_API=(.+)$/m)
const apiKey = match ? match[1].trim() : ''

const ai = new GoogleGenAI({ apiKey })

async function run() {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Hello, what is your name?'
        })
        console.log("Success:", response.text)
    } catch (e) {
        console.error("Error:", e)
    }
}
run()
