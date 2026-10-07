import { Result } from '@adrienlcp/result'
import { useSyncExternalStore } from 'react'

import { isStandaloneDisplay } from '@/infrastructure/browser'

/**
 * Chrome fires `beforeinstallprompt` once, early, and only to a listener
 * already in place: the listener is installed at startup and the event kept
 * until the player asks.
 */
let deferred: BeforeInstallPromptEvent | null = null
let isInstalled = false
const listeners = new Set<() => void>()

const notify = () => {
  for (const listener of listeners) listener()
}

export const listenForInstallPrompt = (): void => {
  isInstalled = isStandaloneDisplay()
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferred = event
    notify()
  })
  window.addEventListener('appinstalled', () => {
    deferred = null
    isInstalled = true
    notify()
  })
}

export type InstallState = 'installed' | 'offered' | 'unoffered'

const readInstallState = (): InstallState => {
  if (isInstalled) return 'installed'
  return deferred === null ? 'unoffered' : 'offered'
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const useInstallState = (): InstallState =>
  useSyncExternalStore(subscribe, readInstallState, () => 'unoffered')

/** The browser's own install dialog; it can be shown once per event. */
export const promptInstall = async (): Promise<
  Result<'accepted' | 'dismissed', 'unoffered'>
> => {
  const event = deferred
  if (event === null) return Result.failure('unoffered')
  deferred = null
  notify()
  await event.prompt()
  const choice = await event.userChoice
  return Result.success(choice.outcome)
}
