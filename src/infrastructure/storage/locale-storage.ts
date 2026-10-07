import type { Result } from '@adrienlcp/result'
import {
  readRecognizedText,
  type StorageReadError,
  type StorageWriteError,
  writeStoredText
} from '@adrienlcp/safe-storage'

import { isLocale, type Locale } from '@/presentation/i18n/locale'

/** The language last read in on this device: a bare address opens in it. */
const LOCALE_KEY = 'pastime.locale'

/** `null` when this device never chose. */
export const readStoredLocale = (): Result<Locale | null, StorageReadError> =>
  readRecognizedText({ isRecognized: isLocale, key: LOCALE_KEY })

export const writeStoredLocale = (
  locale: Locale
): Result<void, StorageWriteError> =>
  writeStoredText({ key: LOCALE_KEY, text: locale })
