import type { Locale } from '@/presentation/i18n/locale'

/** The author every page credits in its colophon, linked to his site in the reader's language. */
export const AUTHOR = {
  name: 'Adrien Lacourpaille',
  siteHref: {
    en: 'https://adrienlcp.com/en',
    fr: 'https://adrienlcp.com/fr'
  }
} as const satisfies { name: string; siteHref: Record<Locale, string> }

/**
 * The project's public repository, linked from the colophon; `null` would
 * mean a private source, and the colophon would then link none.
 */
export const SOURCE_REPOSITORY_HREF: string | null =
  'https://github.com/AdrienLcp/pastime'
