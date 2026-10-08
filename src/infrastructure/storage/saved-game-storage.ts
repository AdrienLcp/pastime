import { Result } from '@adrienlcp/result'
import {
  removeStored,
  type StorageReadError,
  type StorageUnavailable,
  type StorageWriteError,
  writeStoredJson
} from '@adrienlcp/safe-storage'

import {
  type SavedGame,
  savedGameSchema
} from '@/features/game-frame/saved-game'

import { listAppKeys } from './app-entries-storage'
import { readStoredShape } from './read-stored-shape'

/** One game in progress per game. */
const savedGameKey = (gameId: string) => `pastime.saved-game.v2.${gameId}`

/** Version 1 kept a daily and a free game per game. */
const VERSION_ONE_PREFIX = 'pastime.saved-game.v1.'

/** `null` when nothing is waiting for this game. */
export const readSavedGame = (
  gameId: string
): Result<SavedGame | null, StorageReadError> =>
  readStoredShape({ key: savedGameKey(gameId), schema: savedGameSchema })

export const writeSavedGame = (
  saved: SavedGame
): Result<void, StorageWriteError> =>
  writeStoredJson({ key: savedGameKey(saved.puzzle.gameId), value: saved })

export const removeSavedGame = (
  gameId: string
): Result<void, StorageUnavailable> => removeStored(savedGameKey(gameId))

/**
 * Removes the games version 1 left waiting: no page reads them any more, and
 * a backup would otherwise carry them along.
 */
export const removeVersionOneSavedGames = (): Result<
  void,
  StorageUnavailable
> => {
  const keys = listAppKeys()
  if (keys.status === 'failure') return keys
  for (const key of keys.data.filter((key) =>
    key.startsWith(VERSION_ONE_PREFIX)
  )) {
    const removed = removeStored(key)
    if (removed.status === 'failure') return removed
  }
  return Result.success()
}
