'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { analyzeSkinInitial, generateFinalVerdict } from '@/app/actions/checker'
import { Upload, Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
    <div className="max-w-3xl mx-auto">
      <Card className="shadow-lg border-0 ring-1 ring-slate-200">

        {step === 'UPLOAD' && (
          <>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Upload Skin Image</CardTitle>
              <CardDescription>
                For best results, ensure the area is well-lit and in focus.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-8">
              <label
                htmlFor="file-upload"
                className={`relative cursor-pointer flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-colors ${loading ? 'border-indigo-300 bg-indigo-50/50 cursor-not-allowed' : 'border-slate-300 hover:bg-slate-50 hover:border-indigo-400'
                  }`}
              >
                {loading ? (
                  <div className="flex flex-col items-center space-y-4 text-indigo-600">
                    <Loader2 className="w-12 h-12 animate-spin" />
                    <span className="font-medium">Uploading & Analyzing...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-indigo-500 mb-4" />
                    <span className="text-indigo-600 font-medium">Click to upload or drag and drop</span>
                    <span className="text-sm text-slate-400 mt-2">PNG, JPG up to 10MB</span>
                  </>
                )}
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleUpload}
                  disabled={loading}
                />
              </label>
            </CardContent>
          </>
        )}

        {step === 'ANALYSIS' && (
          <CardContent className="py-16 text-center">
            <div className="relative mx-auto w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
              <div className="absolute top-0 right-0 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                <div className="w-4 h-4 bg-indigo-500 rounded-full animate-pulse" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-slate-900">AI is analyzing your skin...</h2>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto text-sm">
              Applying deep learning models to identify visual characteristics.
            </p>
          </CardContent>
        )}

        {step === 'QUESTIONS' && (
          <>
            <CardHeader className="bg-indigo-50/50 border-b pb-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <CardTitle className="text-lg text-indigo-950">Initial Analysis Complete</CardTitle>
                  <CardDescription className="text-indigo-700 mt-1">
                    We've gathered visual data. Please answer 5 standard questions to formulate a final verdict.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form id="questions-form" onSubmit={handleQuestionsSubmit} className="space-y-5">
                <div className="space-y-3">
                  <Label className="text-base font-medium">1. How long have you had this condition?</Label>
                  <Input required value={answers.q1} onChange={e => setAnswers({ ...answers, q1: e.target.value })} placeholder="e.g. 2 weeks, 3 days" />
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-medium">2. Does it itch, burn, or cause pain?</Label>
                  <Input required value={answers.q2} onChange={e => setAnswers({ ...answers, q2: e.target.value })} placeholder="e.g. Mild itching in the evening" />
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-medium">3. Have you used any treatments or creams on it?</Label>
                  <Input required value={answers.q3} onChange={e => setAnswers({ ...answers, q3: e.target.value })} placeholder="e.g. Hydrocortisone 1%" />
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-medium">4. Has it changed in size, shape, or color recently?</Label>
                  <Input required value={answers.q4} onChange={e => setAnswers({ ...answers, q4: e.target.value })} placeholder="e.g. Growing larger last few days" />
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-medium">5. Do you have a family history of skin cancer or similar conditions?</Label>
                  <Input required value={answers.q5} onChange={e => setAnswers({ ...answers, q5: e.target.value })} placeholder="e.g. None known" />
                </div>
              </form>
            </CardContent>
            <CardFooter className="pt-0 pb-6 pr-6 pl-6">
              <Button type="submit" form="questions-form" disabled={loading} className="w-full h-12 text-base">
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Submit for Final Review"}
              </Button>
            </CardFooter>
          </>
        )}

        {step === 'VERDICT' && (
          <>
            <CardHeader className="bg-green-50/50 border-b pb-6">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full text-green-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl text-slate-900">Final Verdict</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="bg-amber-50 rounded-lg border border-amber-200 p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-900 leading-relaxed">
                  <strong>Medical Disclaimer:</strong> This review is provided by an AI model and is for informational purposes only. It is not an alternative to professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider.
                </p>
              </div>

              <div className="prose prose-slate prose-indigo max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {verdict}
                </ReactMarkdown>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 border-t p-6 flex justify-center">
              <Button
                variant="outline"
                className="w-full sm:w-auto h-11"
                onClick={() => {
                  setStep('UPLOAD')
                  setPhotoUrl('')
                  setInitialReview('')
                  setVerdict('')
                  setAnswers({ q1: '', q2: '', q3: '', q4: '', q5: '' })
                }}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Start New Evaluation
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}
