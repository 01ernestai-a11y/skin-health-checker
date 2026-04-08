'use client'

import { generateFinalVerdictDoctor } from '@/app/actions/checker'
import AICheckerFlow from '@/components/AICheckerFlow'

export default function DoctorCheckerPage() {
    return <AICheckerFlow saveVerdictAction={generateFinalVerdictDoctor} />
}
