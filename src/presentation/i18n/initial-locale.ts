import { preferredLocales } from '@/infrastructure/browser'
import { warnOnFailure } from '@/infrastructure/diagnostics'
import { readStoredLocale } from '@/infrastructure/storage/locale-storage'

import { i18n } from './i18n'
import { isLocale, type Locale } from './locale'

const storedLocaleOrNone = (): Locale | null => {
  const read = readStoredLocale()
  warnOnFailure(read, 'The stored language could not be read')
  return read.status === 'success' ? read.data : null
}

const localeInPath = (pathname: string): Locale | null => {
  const [, segment = ''] = pathname.split('/')
  return isLocale(segment) ? segment : null
}

/**
 * The address first — a link shared in French opens in French — then this
 * device's last choice, then what the browser says it reads.
 */
export const initialLocale = (): Locale =>
  localeInPath(window.location.pathname) ??
  storedLocaleOrNone() ??
  i18n.negotiate(preferredLocales())

/**
 * Called before React renders, so `<html lang>` is right from the first paint
 * and no browser offers to translate a page it misreads.
 */
export const applyInitialLocale = (): Locale => {
  const locale = initialLocale()
  document.documentElement.lang = locale
  return locale
}
