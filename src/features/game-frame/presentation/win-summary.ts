import { today } from '@/infrastructure/clock'

import { readPlayRecordOrEmpty } from '../game-storage'
import { dailyStreak, variantRecordOf } from '../play-record'

/** What the win screen prints: this time against the best, and the streak. */
export type WinSummary = {
  readonly elapsedMs: number
  readonly bestMs: number | null
  /** The best this time beat, struck through on the page; `null` when it did not beat one. */
  readonly beatenBestMs: number | null
  readonly isNewBest: boolean
  readonly streak: number
}

export const winSummaryOf = ({
  elapsedMs,
  isNewBest,
  previousBestMs
}: {
  elapsedMs: number
  isNewBest: boolean
  previousBestMs: number | null
}): WinSummary => ({
  beatenBestMs: isNewBest ? previousBestMs : null,
  bestMs: isNewBest ? elapsedMs : previousBestMs,
  elapsedMs,
  isNewBest,
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
    streak: dailyStreak({ record, today: today() })
  }
}
