'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { analyzeSkinInitial, generateFinalVerdict } from '@/app/actions/checker'
import { useTranslations } from 'next-intl'
import { Upload, Loader2, CheckCircle2, AlertCircle, RefreshCw, Camera } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CameraCapture from '@/components/CameraCapture'

type Step = 'UPLOAD' | 'ANALYSIS' | 'QUESTIONS' | 'VERDICT'

export default function Home() {
  const t = useTranslations('patient')
  const [step, setStep] = useState<Step>('UPLOAD')
  const [showCamera, setShowCamera] = useState(false)
  const [photoUrl, setPhotoUrl] = useState<string>('')
  const [initialReview, setInitialReview] = useState<string>('')
  const [verdict, setVerdict] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const [answers, setAnswers] = useState({
    q1: '', q2: '', q3: '', q4: '', q5: ''
  })

  const supabase = createClient()

  const processFile = async (file: File) => {
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

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleCameraCapture = (file: File) => {
    setShowCamera(false)
    processFile(file)
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
    <>
    {showCamera && (
      <CameraCapture
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(false)}
      />
    )}
    <div className="max-w-3xl mx-auto">
      <Card className="shadow-lg border-0 ring-1 ring-slate-200">

        {step === 'UPLOAD' && (
          <>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">{t('uploadTitle')}</CardTitle>
              <CardDescription>
                {t('uploadHint')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-8">
              {loading ? (
                <div className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl border-indigo-300 bg-indigo-50/50">
                  <div className="flex flex-col items-center space-y-4 text-indigo-600">
                    <Loader2 className="w-12 h-12 animate-spin" />
                    <span className="font-medium">{t('analyzing')}</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl border-slate-300 bg-slate-50/50">
                  <Upload className="w-10 h-10 text-indigo-500 mb-4" />
                  <span className="text-sm text-slate-500 mb-5">{t('uploadFormat')}</span>
                  <div className="flex gap-3">
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      {t('uploadCta')}
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleUpload}
                        disabled={loading}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowCamera(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-100 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                      {t('takePhoto')}
                    </button>
                  </div>
                </div>
              )}
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
            <h2 className="text-xl font-semibold text-slate-900">{t('analyzingAi')}</h2>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto text-sm">
              {t('analyzingDetail')}
            </p>
          </CardContent>
        )}

        {step === 'QUESTIONS' && (
          <>
            <CardHeader className="bg-indigo-50/50 border-b pb-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <CardTitle className="text-lg text-indigo-950">{t('analysisComplete')}</CardTitle>
                  <CardDescription className="text-indigo-700 mt-1">
                    {t('analysisDetail')}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form id="questions-form" onSubmit={handleQuestionsSubmit} className="space-y-5">
                <div className="space-y-3">
                  <Label className="text-base font-medium">{t('q1')}</Label>
                  <Input required value={answers.q1} onChange={e => setAnswers({ ...answers, q1: e.target.value })} placeholder={t('q1Placeholder')} />
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-medium">{t('q2')}</Label>
                  <Input required value={answers.q2} onChange={e => setAnswers({ ...answers, q2: e.target.value })} placeholder={t('q2Placeholder')} />
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-medium">{t('q3')}</Label>
                  <Input required value={answers.q3} onChange={e => setAnswers({ ...answers, q3: e.target.value })} placeholder={t('q3Placeholder')} />
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-medium">{t('q4')}</Label>
                  <Input required value={answers.q4} onChange={e => setAnswers({ ...answers, q4: e.target.value })} placeholder={t('q4Placeholder')} />
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-medium">{t('q5')}</Label>
                  <Input required value={answers.q5} onChange={e => setAnswers({ ...answers, q5: e.target.value })} placeholder={t('q5Placeholder')} />
                </div>
              </form>
            </CardContent>
            <CardFooter className="pt-0 pb-6 pr-6 pl-6">
              <Button type="submit" form="questions-form" disabled={loading} className="w-full h-12 text-base">
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : t('submitReview')}
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
                <CardTitle className="text-2xl text-slate-900">{t('finalVerdict')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="bg-amber-50 rounded-lg border border-amber-200 p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-900 leading-relaxed">
                  <strong>{t('disclaimer')}</strong> {t('disclaimerText')}
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
                {t('newEvaluation')}
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
    </>
  )
}
