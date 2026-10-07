import { Result } from '@adrienlcp/result'
import { useSyncExternalStore } from 'react'

export { reloadPage } from '@adrienlcp/browser'
export { useScreenAwake } from '@adrienlcp/browser/react'

/** Whether this browser can run the app's service worker at all. */
export const hasServiceWorker = (): boolean => 'serviceWorker' in navigator

/** The languages the browser says the player reads, most preferred first. */
export const preferredLocales = (): readonly string[] => navigator.languages

/** Opened from the home screen or an app window, rather than in a browser tab. */
export const isStandaloneDisplay = (): boolean =>
  window.matchMedia('(display-mode: standalone)').matches ||
  ('standalone' in navigator && navigator.standalone === true)

/** A short tap felt in the hand where the device has one; nothing elsewhere, iOS included. */
export const tapHaptic = (): void => {
  if ('vibrate' in navigator) navigator.vibrate(12)
}

/** The page went behind another tab or app, or the phone locked. */
export const isPageHidden = (): boolean => document.visibilityState === 'hidden'

export const onPageVisibilityChange = (listener: () => void): (() => void) => {
  document.addEventListener('visibilitychange', listener)
  return () => document.removeEventListener('visibilitychange', listener)
}

/** The browser's own save dialog. No library, no server, no account. */
export const downloadTextFile = ({
  name,
  text,
  type
}: {
  name: string
  text: string
  type: string
}): Result<void, 'unavailable'> => {
  try {
    const url = URL.createObjectURL(new Blob([text], { type }))
    const link = document.createElement('a')
    link.href = url
    link.download = name
    document.body.append(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    return Result.success()
  } catch {
    return Result.failure('unavailable')
  }
}

export const readFileText = async (
  file: File
): Promise<Result<string, 'unreadable'>> => {
  try {
    return Result.success(await file.text())
  } catch {
    return Result.failure('unreadable')
  }
}

const isPageVisible = (): boolean => !isPageHidden()

/** Whether the page is in front of the player right now; follows every change. */
export const usePageVisible = (): boolean =>
  useSyncExternalStore(onPageVisibilityChange, isPageVisible, () => true)
