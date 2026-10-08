import { registerSW } from 'virtual:pwa-register'
import { useEffect } from 'react'

import { hasServiceWorker, reloadPage } from '@/infrastructure/browser'

/**
 * A new version is swapped in on its own, only when the reload interrupts
 * nothing: before the player's first touch since the page opened, or on a
 * screen at rest — the hub. Mid-game it waits, at worst for the next launch,
 * where it is already downloaded and applies before the first touch.
 */
let isUpdateWaiting = false
let hasPlayerActed = false
let screensAtRest = 0
let applyWaiting: ((reloadPage?: boolean) => Promise<void>) | null = null

/** An open tab looks for a new version every hour, not only on the next load. */
const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000

const PLAYER_ACTIONS = ['pointerdown', 'keydown'] as const

/**
 * The reload is ours rather than Workbox's: Workbox only reloads a page that
 * was already controlled when it registered, and a first visit claimed mid-way
 * would stay on the old version.
 */
const applyWhenAtRest = () => {
  if (!isUpdateWaiting || applyWaiting === null) return
  if (hasPlayerActed && screensAtRest === 0) return
  isUpdateWaiting = false
  navigator.serviceWorker.addEventListener('controllerchange', reloadPage, {
    once: true
  })
  void applyWaiting(true)
}

export const startServiceWorker = (): void => {
  if (!hasServiceWorker()) return
  const markActed = () => {
    hasPlayerActed = true
  }
  for (const action of PLAYER_ACTIONS)
    window.addEventListener(action, markActed, { capture: true, once: true })
  applyWaiting = registerSW({
    onNeedRefresh: () => {
      isUpdateWaiting = true
      applyWhenAtRest()
    },
    onRegisteredSW: (_url, registration) => {
      if (registration === undefined) return
      window.setInterval(() => {
        void registration.update().catch(() => undefined)
      }, UPDATE_CHECK_INTERVAL_MS)
    }
  })
}

/** Marks the screen it is called from as one a new version may reload. */
export const useUpdateAtRest = (): void => {
  useEffect(() => {
    screensAtRest++
    applyWhenAtRest()
    return () => {
      screensAtRest--
    }
  }, [])
}
