import type { Result } from '@adrienlcp/result'
import type { StorageReadError } from '@adrienlcp/safe-storage'

import { warnOnFailure } from '@/infrastructure/diagnostics'
import {
  readPlayRecord,
  writePlayRecord
} from '@/infrastructure/storage/play-record-storage'
import {
  readSavedGame,
  removeSavedGame,
  writeSavedGame
} from '@/infrastructure/storage/saved-game-storage'

import {
  EMPTY_PLAY_RECORD,
  type PlayRecord,
  preferVariant,
  type RecordedWin,
  recordWin
} from './play-record'
import type { PuzzleMode, PuzzleRef } from './puzzle'
import type { SavedGame } from './saved-game'

/*
 * The frame's reads and writes, with what the player gets when storage fails:
 * an empty record, or a fresh puzzle. A failed write never stops play — the
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

/** The game left mid-way in a slot, `null` when none; a failed read is also reported to the console. */
export const readWaitingGame = (slot: {
  gameId: string
  mode: PuzzleMode
}): Result<SavedGame | null, StorageReadError> => {
  const read = readSavedGame(slot)
  warnOnFailure(read, 'The game in progress could not be read')
  return read
}

export const saveGame = (saved: SavedGame): void => {
  warnOnFailure(
    writeSavedGame(saved),
    'The game in progress could not be saved'
  )
}

export const dropSavedGame = (slot: {
  gameId: string
  mode: PuzzleMode
}): void => {
  warnOnFailure(removeSavedGame(slot), 'The finished game could not be cleared')
}
