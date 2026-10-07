import type { PlainKey, Translator } from '@adrienlcp/i18n'

import type { FR_DICTIONARY } from './dictionary-fr'

export type Translate = Translator<typeof FR_DICTIONARY>

/** A key that takes no values: one that can travel alone and be translated later. */
export type PlainTranslationKey = PlainKey<typeof FR_DICTIONARY>
