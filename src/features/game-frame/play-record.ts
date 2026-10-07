import { z } from 'zod/mini'

import type { PuzzleRef } from './puzzle'

const variantRecordSchema = z.object({
  bestMs: z.nullable(z.number()),
  /** The free puzzle that comes next: the book's page counter. */
  nextNumber: z.number(),
  solved: z.number()
})

const gameRecordSchema = z.object({
  /** Each daily puzzle solved, by its ISO day, with the time it took. */
  dailies: z.record(z.string(), z.number()),
  /** The variant free play last went on with. */
  preferredVariant: z.nullable(z.string()),
  variants: z.record(z.string(), variantRecordSchema)
})

/** Everything won, per game: the stats, the records, the daily streak. */
export const playRecordSchema = z.record(z.string(), gameRecordSchema)

export type VariantRecord = z.infer<typeof variantRecordSchema>
export type GameRecord = z.infer<typeof gameRecordSchema>
export type PlayRecord = z.infer<typeof playRecordSchema>

export const EMPTY_PLAY_RECORD: PlayRecord = {}

const EMPTY_GAME_RECORD: GameRecord = {
  dailies: {},
  preferredVariant: null,
  variants: {}
}

const EMPTY_VARIANT_RECORD: VariantRecord = {
  bestMs: null,
  nextNumber: 1,
  solved: 0
}

export const gameRecordOf = (record: PlayRecord, gameId: string): GameRecord =>
  record[gameId] ?? EMPTY_GAME_RECORD

export const variantRecordOf = ({
  gameId,
  record,
  variantId
}: {
  record: PlayRecord
  gameId: string
  variantId: string
}): VariantRecord =>
  gameRecordOf(record, gameId).variants[variantId] ?? EMPTY_VARIANT_RECORD

export type RecordedWin = {
  readonly record: PlayRecord
  /** The best time before this one, `null` on a first win. */
  readonly previousBestMs: number | null
  readonly isNewBest: boolean
}

/**
 * A solved puzzle written into the record: one more solved, maybe a new best,
 * the daily marked done, and in free play the page turned to the next puzzle.
 */
export const recordWin = ({
  elapsedMs,
  puzzle,
  record
}: {
  record: PlayRecord
  puzzle: PuzzleRef
  elapsedMs: number
}): RecordedWin => {
  const game = gameRecordOf(record, puzzle.gameId)
  const variant = variantRecordOf({ ...puzzle, record })
  const isNewBest = variant.bestMs === null || elapsedMs < variant.bestMs
  const nextNumber =
    puzzle.mode === 'free'
      ? Math.max(variant.nextNumber, puzzle.number + 1)
      : variant.nextNumber

  return {
    isNewBest,
    previousBestMs: variant.bestMs,
    record: {
      ...record,
      [puzzle.gameId]: {
        ...game,
        dailies:
          puzzle.day === null
            ? game.dailies
            : {
                ...game.dailies,
                [puzzle.day]: Math.min(
                  game.dailies[puzzle.day] ?? elapsedMs,
                  elapsedMs
                )
              },
        variants: {
          ...game.variants,
          [puzzle.variantId]: {
            bestMs: isNewBest ? elapsedMs : variant.bestMs,
            nextNumber,
            solved: variant.solved + 1
          }
        }
      }
    }
  }
}

export const preferVariant = ({
  gameId,
  record,
  variantId
}: {
  record: PlayRecord
  gameId: string
  variantId: string
}): PlayRecord => ({
  ...record,
  [gameId]: { ...gameRecordOf(record, gameId), preferredVariant: variantId }
})

/** The time today's daily took, `null` while it is still to do. */
export const dailyTimeOf = ({
  day,
  gameId,
  record
}: {
  record: PlayRecord
  gameId: string
  day: Temporal.PlainDate
}): number | null =>
  gameRecordOf(record, gameId).dailies[day.toString()] ?? null

export const solvedCountOf = (record: PlayRecord, gameId: string): number =>
  Object.values(gameRecordOf(record, gameId).variants).reduce(
    (total, variant) => total + variant.solved,
    0
  )

/**
 * Days in a row with at least one daily puzzle solved, in any game. Today not
 * done yet does not break it: the run counts up to yesterday until midnight.
 */
export const dailyStreak = ({
  record,
  today
}: {
  record: PlayRecord
  today: Temporal.PlainDate
}): number => {
  const solvedDays = new Set(
    Object.values(record).flatMap((game) => Object.keys(game.dailies))
  )
  let day = solvedDays.has(today.toString())
    ? today
    : today.subtract({ days: 1 })
  let streak = 0
  while (solvedDays.has(day.toString())) {
    streak++
    day = day.subtract({ days: 1 })
  }
  return streak
}
