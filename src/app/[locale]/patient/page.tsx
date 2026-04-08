'use client'

import { generateFinalVerdict } from '@/app/actions/checker'
import AICheckerFlow from '@/components/AICheckerFlow'

export default function PatientCheckerPage() {
    return <AICheckerFlow saveVerdictAction={generateFinalVerdict} />
}
