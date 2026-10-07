import type { Locale } from './locale.ts'

/**
 * The BCP-47 tag behind each locale: react-aria keys its own strings — press
 * announcements, live regions — by it, and the Vite config strips every other
 * locale react-aria ships. No `@/` import, so `vite.config.ts` can load it.
 */
export const REGIONAL_LOCALES = {
  en: 'en-US',
  fr: 'fr-FR'
} as const satisfies Record<Locale, string>
