import { z } from 'zod/mini'

import { seedFromText } from '@/helpers/seeded-random'

const puzzleModeSchema = z.enum(['daily', 'free'])

export type PuzzleMode = z.infer<typeof puzzleModeSchema>

/**
 * Which puzzle is on the page. `(game, variant, number)` regenerates it on any
 * device: it is the level's share code. A daily puzzle's number is its day's,
 * and `day` the ISO day it belongs to (`null` in free play).
 */
export const puzzleRefSchema = z.object({
  day: z.nullable(z.string()),
  gameId: z.string(),
  mode: puzzleModeSchema,
  number: z.number(),
  variantId: z.string()
})

export type PuzzleRef = z.infer<typeof puzzleRefSchema>

/** The booklet's first issue: N° 1 was printed on this day. */
const FIRST_ISSUE = Temporal.PlainDate.from('2026-01-01')

/** Today's issue number, the same for everyone: N° 280 on 7 October 2026. */
export const issueNumber = (day: Temporal.PlainDate): number =>
  FIRST_ISSUE.until(day, { largestUnit: 'days' }).days + 1

export const dailyPuzzle = ({
  day,
  gameId,
  variantId
}: {
  day: Temporal.PlainDate
  gameId: string
  variantId: string
}): PuzzleRef => ({
  day: day.toString(),
  gameId,
  mode: 'daily',
  number: issueNumber(day),
  variantId
})

export const freePuzzle = ({
  gameId,
  number,
  variantId
}: {
  gameId: string
  number: number
  variantId: string
}): PuzzleRef => ({ day: null, gameId, mode: 'free', number, variantId })

export const puzzleSeed = (puzzle: PuzzleRef): number =>
  seedFromText(
    puzzle.mode === 'daily'
      ? `${puzzle.gameId}/daily/${puzzle.day}`
      : `${puzzle.gameId}/${puzzle.variantId}/${puzzle.number}`
  )

/**
 * The seed of the next try after a generator gave up: derived, never random,
 * so a daily puzzle that needed a retry is still the same for everyone.
 */
export const retrySeed = ({
  attempt,
  seed
}: {
  attempt: number
  seed: number
}): number => (attempt === 0 ? seed : seedFromText(`${seed}/retry/${attempt}`))

export const isSamePuzzle = (a: PuzzleRef, b: PuzzleRef): boolean =>
  a.gameId === b.gameId &&
  a.mode === b.mode &&
  a.variantId === b.variantId &&
  a.number === b.number &&
  a.day === b.day
