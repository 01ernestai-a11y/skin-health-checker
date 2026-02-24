'use client'

import { useState, ChangeEvent } from 'react'

export function PhoneInput({ name, required = true }: { name: string, required?: boolean }) {
    const [value, setValue] = useState('+7 ')

    const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        let input = e.target.value.replace(/\D/g, '')

        // Force start with 7
        if (input.startsWith('8')) input = '7' + input.substring(1)
        if (!input.startsWith('7')) input = '7' + input

        let formatted = '+7 '
        if (input.length > 1) {
            formatted += '(' + input.substring(1, 4)
        }
        if (input.length >= 5) {
            formatted += ') ' + input.substring(4, 7)
        }
        if (input.length >= 8) {
            formatted += '-' + input.substring(7, 9)
        }
        if (input.length >= 10) {
            formatted += '-' + input.substring(9, 11)
        }

        setValue(formatted)
    }

    return (
        <input
            type="tel"
            name={name}
            id={name}
            value={value}
            onChange={handlePhoneChange}
            placeholder="+7 (___) ___-__-__"
            required={required}
            className="mt-1 block w-full rounded-md border-gray-300 bg-white/5 border px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            maxLength={18}
        />
    )
}
