import { INSTALL_DECLINED_KEY } from '@/infrastructure/storage/install-choice-storage'
import { LOCALE_KEY } from '@/infrastructure/storage/locale-storage'
import { PLAY_RECORD_KEY } from '@/infrastructure/storage/play-record-storage'
import { PLAY_SETTINGS_KEY } from '@/infrastructure/storage/play-settings-storage'
import { READY_LEVEL_KEY_PREFIX } from '@/infrastructure/storage/ready-level-storage'
import { SAVED_GAME_KEY_PREFIX } from '@/infrastructure/storage/saved-game-storage'
import { THEME_STORAGE_KEY } from '@/presentation/theme/theme-store'

/** Stands for the part of a key that names a game, or a game and its variant. */
const KEY_SUFFIX = '…'

/**
 * Every key the app writes to the device's storage, as the legal page names
 * it, with the dictionary entry that says what it remembers.
 */
export const STORED_KEYS = [
  { key: SAVED_GAME_KEY_PREFIX + KEY_SUFFIX, purpose: 'savedGame' },
  { key: PLAY_RECORD_KEY, purpose: 'playRecord' },
  { key: READY_LEVEL_KEY_PREFIX + KEY_SUFFIX, purpose: 'readyLevel' },
  { key: PLAY_SETTINGS_KEY, purpose: 'playSettings' },
  { key: THEME_STORAGE_KEY, purpose: 'theme' },
  { key: LOCALE_KEY, purpose: 'locale' },
  { key: INSTALL_DECLINED_KEY, purpose: 'installDeclined' }
] as const
