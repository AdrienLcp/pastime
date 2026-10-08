import type { Result } from '@adrienlcp/result'
import type { StorageReadError } from '@adrienlcp/safe-storage'

import { warnOnFailure } from '@/infrastructure/diagnostics'
import {
  readPlayRecord,
  writePlayRecord
} from '@/infrastructure/storage/play-record-storage'
import {
  readReadyLevel,
  removeReadyLevel,
  writeReadyLevel
} from '@/infrastructure/storage/ready-level-storage'
import {
  readSavedGame,
  removeSavedGame,
  removeVersionOneSavedGames,
  writeSavedGame
} from '@/infrastructure/storage/saved-game-storage'

import {
  EMPTY_PLAY_RECORD,
  type PlayRecord,
  preferVariant,
  type RecordedWin,
  recordWin
} from './play-record'
import type { PuzzleRef } from './puzzle'
import type { ReadyLevel } from './ready-level'
import type { SavedGame } from './saved-game'

/*
 * The frame's reads and writes, with what the player gets when storage fails:
 * an empty record, a fresh puzzle, or a level printed on the spot. A failed write never stops play — the
 * board on screen is the truth until the tab closes.
 */

export const readPlayRecordOrEmpty = (): PlayRecord => {
  const read = readPlayRecord()
  warnOnFailure(read, 'The play record could not be read')
  return read.status === 'success'
    ? (read.data ?? EMPTY_PLAY_RECORD)
    : EMPTY_PLAY_RECORD
}

export const saveWin = (win: {
  puzzle: PuzzleRef
  elapsedMs: number
  moveCount: number
}): RecordedWin => {
  const recorded = recordWin({ ...win, record: readPlayRecordOrEmpty() })
  warnOnFailure(
    writePlayRecord(recorded.record),
    'The win could not be recorded'
  )
  return recorded
}

export const saveVariantPreference = (choice: {
  gameId: string
  variantId: string
}): void => {
  warnOnFailure(
    writePlayRecord(
      preferVariant({ ...choice, record: readPlayRecordOrEmpty() })
    ),
    'The preferred size could not be saved'
  )
}

/** The game left mid-way, `null` when none; a failed read is also reported to the console. */
export const readWaitingGame = (
  gameId: string
): Result<SavedGame | null, StorageReadError> => {
  const read = readSavedGame(gameId)
  warnOnFailure(read, 'The game in progress could not be read')
  return read
}

export const saveGame = (saved: SavedGame): void => {
  warnOnFailure(
    writeSavedGame(saved),
    'The game in progress could not be saved'
  )
}

export const dropSavedGame = (gameId: string): void => {
  warnOnFailure(
    removeSavedGame(gameId),
    'The finished game could not be cleared'
  )
}

export const dropVersionOneSavedGames = (): void => {
  warnOnFailure(
    removeVersionOneSavedGames(),
    'The games saved by an older version could not be cleared'
  )
}

type ReadyLevelSlot = { gameId: string; variantId: string }

export const hasReadyLevel = (slot: ReadyLevelSlot): boolean => {
  const read = readReadyLevel(slot)
  return read.status === 'success' && read.data !== null
}

/**
 * The level printed ahead for this variant, taken out of storage so it is
 * played once; `null` when none waits. One that no longer reads is cleared.
 */
export const takeReadyLevel = (slot: ReadyLevelSlot): ReadyLevel | null => {
  const read = readReadyLevel(slot)
  warnOnFailure(read, 'The level printed ahead could not be read')
  if (read.status === 'success' && read.data === null) return null
  warnOnFailure(
    removeReadyLevel(slot),
    'The level printed ahead could not be cleared'
  )
  return read.status === 'success' ? read.data : null
}

export const keepReadyLevel = ({
  ready,
  ...slot
}: ReadyLevelSlot & { ready: ReadyLevel }): void => {
  warnOnFailure(
    writeReadyLevel({ ...slot, ready }),
    'The level printed ahead could not be kept'
  )
}
