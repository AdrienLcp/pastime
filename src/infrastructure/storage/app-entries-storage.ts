import { Result } from '@adrienlcp/result'
import type { StorageWriteError } from '@adrienlcp/safe-storage'

/** Every key the app writes starts with it; a backup carries exactly those. */
export const APP_KEY_PREFIX = 'pastime.'

export const isAppKey = (key: string): boolean => key.startsWith(APP_KEY_PREFIX)

const appKeys = (storage: Storage): string[] =>
  Array.from({ length: storage.length }, (_, index) =>
    storage.key(index)
  ).filter((key): key is string => key !== null && isAppKey(key))

/** Everything the app stored on this device, raw, by key. */
export const readAppEntries = (): Result<
  Record<string, string>,
  'unavailable'
> => {
  try {
    const entries: Record<string, string> = {}
    for (const key of appKeys(localStorage)) {
      const text = localStorage.getItem(key)
      if (text !== null) entries[key] = text
    }
    return Result.success(entries)
  } catch {
    return Result.failure('unavailable')
  }
}

/**
 * Swaps what the app stored for `entries`: every app key not in them is
 * removed, so a restored device holds the backup and nothing older.
 */
export const replaceAppEntries = (
  entries: Record<string, string>
): Result<void, StorageWriteError> => {
  try {
    for (const key of appKeys(localStorage)) localStorage.removeItem(key)
    for (const [key, text] of Object.entries(entries)) {
      if (isAppKey(key)) localStorage.setItem(key, text)
    }
    return Result.success()
  } catch (error) {
    return Result.failure(
      error instanceof DOMException && error.name === 'QuotaExceededError'
        ? 'quota'
        : 'unavailable'
    )
  }
}
