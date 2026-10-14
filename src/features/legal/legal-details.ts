import type { Locale } from '@/presentation/i18n/locale'

/**
 * Who publishes Pastime and how to reach him: a non-professional publisher
 * gives a name and a contact, never a postal address or a phone number.
 */
export const PUBLISHER = {
  contactHrefFor: {
    en: 'https://adrienlcp.com/en/contact',
    fr: 'https://adrienlcp.com/fr/contact'
  } satisfies Record<Locale, string>,
  name: 'Adrien Lacourpaille'
} as const

/** The static files are served by Cloudflare Pages. */
export const HOST = {
  addressLines: ['101 Townsend St', 'San Francisco, CA 94107', 'USA'],
  name: 'Cloudflare, Inc.'
} as const

export const CNIL_COMPLAINT_HREF = 'https://www.cnil.fr/fr/plaintes'
