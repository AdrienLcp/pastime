import { useSyncExternalStore } from 'react'

import { warnOnFailure } from '@/infrastructure/diagnostics'
import {
  readPlaySettings,
  writePlaySettings
} from '@/infrastructure/storage/play-settings-storage'

import { DEFAULT_PLAY_SETTINGS, type PlaySettings } from './play-settings'

const readPlaySettingsOrDefault = (): PlaySettings => {
  const read = readPlaySettings()
  warnOnFailure(read, 'The play settings could not be read')
  return read.status === 'success'
    ? (read.data ?? DEFAULT_PLAY_SETTINGS)
    : DEFAULT_PLAY_SETTINGS
}

let current: PlaySettings | null = null
const listeners = new Set<() => void>()

const snapshot = (): PlaySettings => {
  current ??= readPlaySettingsOrDefault()
  return current
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Read once, then kept in step with every change made on this page. */
export const usePlaySettings = (): PlaySettings =>
  useSyncExternalStore(subscribe, snapshot, () => DEFAULT_PLAY_SETTINGS)

export const changePlaySettings = (change: Partial<PlaySettings>): void => {
  current = { ...snapshot(), ...change }
  warnOnFailure(
    writePlaySettings(current),
    'The play settings could not be saved'
  )
  for (const listener of listeners) listener()
}
