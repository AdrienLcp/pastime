import { createI18n } from '@adrienlcp/i18n'

import { EN_DICTIONARY } from './dictionary-en'
import { FR_DICTIONARY } from './dictionary-fr'
import type { Locale } from './locale'

/** French is the reference every key is typed from; English is held to it. */
export const i18n = createI18n({
  defaultLocale: 'fr',
  dictionaries: {
    en: EN_DICTIONARY,
    fr: FR_DICTIONARY
  } satisfies Record<Locale, unknown>
})
