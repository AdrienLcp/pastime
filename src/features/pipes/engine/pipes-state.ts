import { z } from 'zod/mini'

import type { PipesLevel } from './pipes-level'

/** The board in play: how far each tile was turned, and which ones are locked. */
export type PipesState = {
  readonly level: PipesLevel
  /** Quarter turns clockwise from the dealt tile, 0 to 3. */
  readonly turns: readonly number[]
  readonly locked: readonly boolean[]
}

const cellSchema = z.number().check(z.int(), z.gte(0))

/**
 * A tap turns a tile a quarter, clockwise (`1`) or back (`3`); a long press
 * locks a tile the player is sure of, or frees it.
 */
export const pipesMoveSchema = z.discriminatedUnion('kind', [
  z.object({
    cell: cellSchema,
    kind: z.literal('turn'),
    quarterTurns: z.union([z.literal(1), z.literal(3)])
  }),
  z.object({ cell: cellSchema, kind: z.literal('lock') })
])

export type PipesMove = z.infer<typeof pipesMoveSchema>
