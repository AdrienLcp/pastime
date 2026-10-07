import type { Result } from '@adrienlcp/result'
import {
  readRecognizedText,
  type StorageReadError
} from '@adrienlcp/safe-storage'

import { isLocale, type Locale } from '@/presentation/i18n/locale'

/** A device choice, made once a language picker exists. */
const LOCALE_KEY = 'pastime.locale'

/** `null` when this device never chose. */
export const readStoredLocale = (): Result<Locale | null, StorageReadError> =>
  readRecognizedText({ isRecognized: isLocale, key: LOCALE_KEY })
