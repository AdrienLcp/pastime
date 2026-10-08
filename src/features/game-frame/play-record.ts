import { z } from 'zod/mini'

import type { GameDefinition } from './game-definition'
import type { PuzzleRef } from './puzzle'

const variantRecordSchema = z.object({
  bestMs: z.nullable(z.number()),
  /** Absent from records written before moves were counted. */
  fewestMoves: z.optional(z.nullable(z.number())),
  solved: z.number()
})

const gameRecordSchema = z.object({
  /** The variant last played. */
  preferredVariant: z.nullable(z.string()),
  variants: z.record(z.string(), variantRecordSchema)
})

/**
 * Everything won, per game: the stats and the records. A field older versions
 * wrote and this one no longer knows is dropped on read.
 */
export const playRecordSchema = z.record(z.string(), gameRecordSchema)

export type VariantRecord = z.infer<typeof variantRecordSchema>
export type GameRecord = z.infer<typeof gameRecordSchema>
export type PlayRecord = z.infer<typeof playRecordSchema>

export const EMPTY_PLAY_RECORD: PlayRecord = {}

const EMPTY_GAME_RECORD: GameRecord = {
  preferredVariant: null,
  variants: {}
}

const EMPTY_VARIANT_RECORD: VariantRecord = {
  bestMs: null,
  fewestMoves: null,
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
  /** The fewest moves before this win, `null` on a first counted win. */
  readonly previousFewestMoves: number | null
  readonly isNewFewestMoves: boolean
}

/**
 * A solved puzzle written into the record: one more solved, maybe a new best
 * time or fewest moves.
 */
export const recordWin = ({
  elapsedMs,
  moveCount,
  puzzle,
  record
}: {
  record: PlayRecord
  puzzle: PuzzleRef
  elapsedMs: number
  moveCount: number
}): RecordedWin => {
  const game = gameRecordOf(record, puzzle.gameId)
  const variant = variantRecordOf({ ...puzzle, record })
  const isNewBest = variant.bestMs === null || elapsedMs < variant.bestMs
  const previousFewestMoves = variant.fewestMoves ?? null
  const isNewFewestMoves =
    previousFewestMoves === null || moveCount < previousFewestMoves

  return {
    isNewBest,
    isNewFewestMoves,
    previousBestMs: variant.bestMs,
    previousFewestMoves,
    record: {
      ...record,
      [puzzle.gameId]: {
        ...game,
        variants: {
          ...game.variants,
          [puzzle.variantId]: {
            bestMs: isNewBest ? elapsedMs : variant.bestMs,
            fewestMoves: isNewFewestMoves ? moveCount : previousFewestMoves,
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

/** The variant played last, or the game's first while it has none or names one gone. */
export const preferredVariantId = ({
  game,
  record
}: {
  game: Pick<GameDefinition, 'id' | 'variants'>
  record: PlayRecord
}): string => {
  const preferred = gameRecordOf(record, game.id).preferredVariant
  return game.variants.some((variant) => variant.id === preferred) &&
    preferred !== null
    ? preferred
    : game.variants[0].id
}

export const solvedCountOf = (record: PlayRecord, gameId: string): number =>
  Object.values(gameRecordOf(record, gameId).variants).reduce(
    (total, variant) => total + variant.solved,
    0
  )
