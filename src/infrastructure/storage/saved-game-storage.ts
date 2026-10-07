import type { Result } from '@adrienlcp/result'
import {
  removeStored,
  type StorageReadError,
  type StorageUnavailable,
  type StorageWriteError,
  writeStoredJson
} from '@adrienlcp/safe-storage'

import type { PuzzleMode } from '@/features/game-frame/puzzle'
import {
  type SavedGame,
  savedGameSchema
} from '@/features/game-frame/saved-game'

import { readStoredShape } from './read-stored-shape'

/** One game in progress per game and mode: today's daily and a free puzzle can both wait. */
const savedGameKey = ({ gameId, mode }: { gameId: string; mode: PuzzleMode }) =>
  `pastime.saved-game.v1.${gameId}.${mode}`

/** `null` when nothing is waiting in this slot. */
export const readSavedGame = (slot: {
  gameId: string
  mode: PuzzleMode
}): Result<SavedGame | null, StorageReadError> =>
  readStoredShape({ key: savedGameKey(slot), schema: savedGameSchema })

export const writeSavedGame = (
  saved: SavedGame
): Result<void, StorageWriteError> =>
  writeStoredJson({ key: savedGameKey(saved.puzzle), value: saved })

export const removeSavedGame = (slot: {
  gameId: string
  mode: PuzzleMode
}): Result<void, StorageUnavailable> => removeStored(savedGameKey(slot))
