'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { analyzeSkinInitial, generateFinalVerdict } from '@/app/actions/checker'
import { Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { logout } from '@/app/actions/auth'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Step = 'UPLOAD' | 'ANALYSIS' | 'QUESTIONS' | 'VERDICT'

export default function Home() {
  const [step, setStep] = useState<Step>('UPLOAD')
  const [photoUrl, setPhotoUrl] = useState<string>('')
  const [initialReview, setInitialReview] = useState<string>('')
  const [verdict, setVerdict] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const [answers, setAnswers] = useState({
    q1: '', q2: '', q3: '', q4: '', q5: ''
  })

  const supabase = createClient()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('health-checks')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('health-checks')
        .getPublicUrl(filePath)

      setPhotoUrl(publicUrl)

      // Initial review
      setStep('ANALYSIS')
      const result = await analyzeSkinInitial(publicUrl)

      if (result.success && result.text) {
        setInitialReview(result.text)
        setStep('QUESTIONS')
      } else {
        alert("Failed to analyze image: " + result.error)
        setStep('UPLOAD')
      }
    } catch (err: any) {
      console.error(err)
      alert("Error: " + err.message)
      setStep('UPLOAD')
    } finally {
      setLoading(false)
    }
  }

  const handleQuestionsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStep('ANALYSIS')

    try {
      const result = await generateFinalVerdict(photoUrl, initialReview, answers)
      if (result.success && result.verdict) {
        setVerdict(result.verdict)
        setStep('VERDICT')
      } else {
        alert("Error generating verdict: " + result.error)
        setStep('QUESTIONS')
      }
    } catch (err: any) {
      alert("Error: " + err.message)
      setStep('QUESTIONS')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-indigo-900">AI Skin Checker</h1>
          <form action={logout}>
            <button type="submit" className="text-sm font-medium text-gray-500 hover:text-gray-700">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-2xl shadow-xl ring-1 ring-gray-900/5">
          {step === 'UPLOAD' && (
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-6">Upload an Image of the Skin Condition</h2>
              <p className="text-gray-500 mb-8">For best results, ensure the area is well-lit and in focus.</p>

              <label htmlFor="file-upload" className="relative cursor-pointer flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                <Upload className="w-12 h-12 text-indigo-500 mb-4" />
                <span className="text-indigo-600 font-medium">Click to upload or drag and drop</span>
                <span className="text-sm text-gray-500 mt-1">PNG, JPG up to 10MB</span>
                <input id="file-upload" type="file" accept="image/*" className="sr-only" onChange={handleUpload} disabled={loading} />
              </label>

              {loading && (
                <div className="mt-6 flex items-center justify-center text-indigo-600 space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Uploading image...</span>
                </div>
              )}
            </div>
          )}

          {step === 'ANALYSIS' && (
            <div className="text-center py-12 flex flex-col items-center">
              <div className="relative">
                <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                  <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                </div>
                <div className="absolute top-0 right-0 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-indigo-500 rounded-full animate-pulse" />
                </div>
              </div>
              <h2 className="text-2xl font-semibold">AI is analyzing your skin condition...</h2>
              <p className="text-gray-500 mt-3 max-w-md mx-auto">This usually takes a few seconds. We're using advanced GenAI models to review the visual indicators.</p>
            </div>
          )}

          {step === 'QUESTIONS' && (
            <div>
              <div className="mb-8 flex items-start bg-indigo-50 rounded-lg p-4">
                <CheckCircle2 className="w-6 h-6 text-indigo-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-medium text-indigo-900">Initial Analysis Complete</h3>
                  <p className="mt-1 text-sm text-indigo-700">We've gathered visual data. Please answer these 5 standard questions to help us formulate a final verdict.</p>
                </div>
              </div>

              <form onSubmit={handleQuestionsSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">1. How long have you had this skin condition?</label>
                  <input required type="text" className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border"
                    value={answers.q1} onChange={e => setAnswers({ ...answers, q1: e.target.value })} placeholder="e.g. 2 weeks, 3 days" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">2. Does it itch, burn, or cause pain?</label>
                  <input required type="text" className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border"
                    value={answers.q2} onChange={e => setAnswers({ ...answers, q2: e.target.value })} placeholder="e.g. Mild itching in the evening" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">3. Have you used any treatments or creams on it?</label>
                  <input required type="text" className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border"
                    value={answers.q3} onChange={e => setAnswers({ ...answers, q3: e.target.value })} placeholder="e.g. Hydrocortisone 1%" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">4. Has it changed in size, shape, or color recently?</label>
                  <input required type="text" className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border"
                    value={answers.q4} onChange={e => setAnswers({ ...answers, q4: e.target.value })} placeholder="e.g. Growing larger last few days" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">5. Do you have a family history of skin cancer or similar conditions?</label>
                  <input required type="text" className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border"
                    value={answers.q5} onChange={e => setAnswers({ ...answers, q5: e.target.value })} placeholder="e.g. None known" />
                </div>

                <div className="pt-4">
                  <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                    Submit Answers for Final Review
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 'VERDICT' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-green-100 p-2 rounded-full">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Final Verdict</h2>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-sm text-yellow-800">
                    <strong>Medical Disclaimer:</strong> This review is provided by an AI model and is for informational purposes only. It is not an alternative to professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider.
                  </p>
                </div>
              </div>

              <div className="prose prose-indigo max-w-none text-gray-700 leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {verdict}
                </ReactMarkdown>
              </div>

              <div className="pt-8 text-center border-t mt-8">
                <button
                  onClick={() => {
                    setStep('UPLOAD')
                    setPhotoUrl('')
                    setInitialReview('')
                    setVerdict('')
                    setAnswers({ q1: '', q2: '', q3: '', q4: '', q5: '' })
                  }}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Start New Evaluation
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
