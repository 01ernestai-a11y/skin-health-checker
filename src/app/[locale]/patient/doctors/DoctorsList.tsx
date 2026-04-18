'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Stethoscope, MapPin, Search } from 'lucide-react'
import { StartChatButton } from '@/components/StartChatButton'

interface Doctor {
    id: string
    name: string
    surname: string
    specialization: string
    avatar_url?: string | null
    city?: string
}

export default function DoctorsList({ doctors, emptyText }: { doctors: Doctor[]; emptyText: string }) {
    const [search, setSearch] = useState('')
    const t = useTranslations('patient')

    // Get unique cities for display
    const cities = useMemo(() => {
        const set = new Set(doctors.map(d => d.city || 'Алматы'))
        return Array.from(set).sort()
    }, [doctors])

    // Filter by city or name
    const filtered = useMemo(() => {
        if (!search.trim()) return doctors
        const q = search.toLowerCase()
        return doctors.filter(d =>
            (d.city || 'Алматы').toLowerCase().includes(q) ||
            `${d.name} ${d.surname}`.toLowerCase().includes(q) ||
            d.specialization.toLowerCase().includes(q)
        )
    }, [doctors, search])

    if (doctors.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="pt-10 pb-10 text-center text-slate-500">
                    {emptyText}
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {/* Search bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder={t('searchCity')}
                    className="pl-10"
                />
            </div>

            {/* City chips */}
            {cities.length > 1 && (
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setSearch('')}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            !search ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        {t('allCities')}
                    </button>
                    {cities.map(city => (
                        <button
                            key={city}
                            onClick={() => setSearch(city)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                search === city ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {city}
                        </button>
                    ))}
                </div>
            )}

            {/* Results */}
            {filtered.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-sm">
                    {emptyText}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((doctor) => {
                        const initials = `${doctor.name[0]}${doctor.surname[0]}`.toUpperCase()
                        return (
                            <Card key={doctor.id} className="flex flex-col">
                                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                    <Avatar className="h-12 w-12 border">
                                        {doctor.avatar_url && <AvatarImage src={doctor.avatar_url} alt={`Dr. ${doctor.name} ${doctor.surname}`} />}
                                        <AvatarFallback className="bg-indigo-100 text-indigo-700">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-base tracking-normal">
                                            Dr. {doctor.name} {doctor.surname}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-1 mt-0.5">
                                            <Stethoscope className="w-3 h-3" />
                                            {doctor.specialization}
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {doctor.city || 'Алматы'}
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-0">
                                    <StartChatButton doctorId={doctor.id} />
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
