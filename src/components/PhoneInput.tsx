'use client'

import { useState, ChangeEvent } from 'react'
import { Input } from '@/components/ui/input'

export function PhoneInput({
    name,
    required = true,
    value,
    onChange
}: {
    name?: string,
    required?: boolean,
    value?: string,
    onChange?: (val: string) => void
}) {
    const [internalValue, setInternalValue] = useState('+7 ')

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

        if (onChange) {
            onChange(formatted)
        } else {
            setInternalValue(formatted)
        }
    }

    return (
        <Input
            type="tel"
            name={name}
            id={name}
            value={value !== undefined ? value : internalValue}
            onChange={handlePhoneChange}
            placeholder="+7 (___) ___-__-__"
            required={required}
            maxLength={18}
        />
    )
}
