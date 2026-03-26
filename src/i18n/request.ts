import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { routing } from './routing'

import en from '../../messages/en.json'
import ru from '../../messages/ru.json'
import kk from '../../messages/kk.json'

const messages: Record<string, typeof en> = { en, ru, kk }

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale
    if (!hasLocale(routing.locales, locale)) {
        locale = routing.defaultLocale
    }

    return {
        locale,
        messages: messages[locale],
    }
})
