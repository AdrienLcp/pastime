import { registerSW } from 'virtual:pwa-register'
import { useSyncExternalStore } from 'react'

import { hasServiceWorker, reloadPage } from '@/infrastructure/browser'

/**
 * The service worker's life seen from the page: a new version waiting, and the
 * one moment the player accepts it. Never applied behind their back — a reload
 * in the middle of a game would lose the board on screen.
 */
type UpdateState = {
  readonly isUpdateWaiting: boolean
  readonly isOfflineReady: boolean
}

let state: UpdateState = { isOfflineReady: false, isUpdateWaiting: false }
let applyWaiting: ((reloadPage?: boolean) => Promise<void>) | null = null
const listeners = new Set<() => void>()

const setState = (next: Partial<UpdateState>) => {
  state = { ...state, ...next }
  for (const listener of listeners) listener()
}

/** An open tab looks for a new version every hour, not only on the next load. */
const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000

export const startServiceWorker = (): void => {
  if (!hasServiceWorker()) return
  applyWaiting = registerSW({
    onNeedRefresh: () => setState({ isUpdateWaiting: true }),
    onOfflineReady: () => setState({ isOfflineReady: true }),
    onRegisteredSW: (_url, registration) => {
      if (registration === undefined) return
      if (registration.active !== null) setState({ isOfflineReady: true })
      window.setInterval(() => {
        void registration.update().catch(() => undefined)
      }, UPDATE_CHECK_INTERVAL_MS)
    }
  })
}

/**
 * Swaps in the waiting worker and reloads onto it. The reload is ours rather
 * than Workbox's: Workbox only reloads a page that was already controlled when
 * it registered, and a first visit claimed mid-way would stay on the old
 * version with its notice still showing.
 */
export const applyUpdate = (): void => {
  navigator.serviceWorker.addEventListener('controllerchange', reloadPage, {
    once: true
  })
  void applyWaiting?.(true)
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const useAppUpdate = (): UpdateState =>
  useSyncExternalStore(
    subscribe,
    () => state,
    () => state
  )
