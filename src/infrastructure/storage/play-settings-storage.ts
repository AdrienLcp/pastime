import type { Result } from '@adrienlcp/result'
import {
  type StorageReadError,
  type StorageWriteError,
  writeStoredJson
} from '@adrienlcp/safe-storage'

import {
  type PlaySettings,
  playSettingsSchema
} from '@/features/settings/play-settings'

import { readStoredShape } from './read-stored-shape'

/** The key a browser test writes before the page loads, to keep the app silent. */
export const PLAY_SETTINGS_KEY = 'pastime.play-settings.v1'

/** `null` while this device never changed a setting. */
export const readPlaySettings = (): Result<
  PlaySettings | null,
  StorageReadError
> => readStoredShape({ key: PLAY_SETTINGS_KEY, schema: playSettingsSchema })

export const writePlaySettings = (
  settings: PlaySettings
): Result<void, StorageWriteError> =>
  writeStoredJson({ key: PLAY_SETTINGS_KEY, value: settings })
