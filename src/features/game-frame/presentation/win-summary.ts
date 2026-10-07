import { today } from '@/infrastructure/clock'

import { readPlayRecordOrEmpty } from '../game-storage'
import { dailyStreak, variantRecordOf } from '../play-record'

/** This game's moves against the fewest, printed for games that count them. */
export type MovesSummary = {
  readonly count: number
  readonly fewest: number
  /** The fewest this game beat, struck through; `null` when it did not beat one. */
  readonly beatenFewest: number | null
  readonly isNewFewest: boolean
}

/** What the win screen prints: this time against the best, and the streak. */
export type WinSummary = {
  readonly elapsedMs: number
  readonly bestMs: number | null
  /** The best this time beat, struck through on the page; `null` when it did not beat one. */
  readonly beatenBestMs: number | null
  readonly isNewBest: boolean
  /** `null` for a daily solved earlier today: its moves were not kept. */
  readonly moves: MovesSummary | null
  readonly streak: number
}

export const winSummaryOf = ({
  elapsedMs,
  isNewBest,
  isNewFewestMoves,
  moveCount,
  previousBestMs,
  previousFewestMoves
}: {
  elapsedMs: number
  moveCount: number
  isNewBest: boolean
  previousBestMs: number | null
  isNewFewestMoves: boolean
  previousFewestMoves: number | null
}): WinSummary => ({
  beatenBestMs: isNewBest ? previousBestMs : null,
  bestMs: isNewBest ? elapsedMs : previousBestMs,
  elapsedMs,
  isNewBest,
  moves: {
    beatenFewest: isNewFewestMoves ? previousFewestMoves : null,
    count: moveCount,
    fewest: isNewFewestMoves ? moveCount : (previousFewestMoves ?? moveCount),
    isNewFewest: isNewFewestMoves
  },
  streak: dailyStreak({ record: readPlayRecordOrEmpty(), today: today() })
})

/** A daily solved earlier today, summed up again from the record. */
export const pastWinSummary = ({
  elapsedMs,
  gameId,
  variantId
}: {
  elapsedMs: number
  gameId: string
  variantId: string
}): WinSummary => {
  const record = readPlayRecordOrEmpty()
  return {
    beatenBestMs: null,
    bestMs: variantRecordOf({ gameId, record, variantId }).bestMs,
    elapsedMs,
    isNewBest: false,
    moves: null,
    streak: dailyStreak({ record, today: today() })
  }
}
