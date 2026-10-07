/** The languages the interface is written in, the reference first. */
export const LOCALES = ['fr', 'en'] as const

export type Locale = (typeof LOCALES)[number]

export const isLocale = (value: string): value is Locale =>
  LOCALES.some((locale) => locale === value)
