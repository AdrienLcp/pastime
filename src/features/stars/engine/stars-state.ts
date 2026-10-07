import { z } from 'zod/mini'

import type { StarsLevel } from './stars-level'

/** What the player wrote in a cell. */
export type StarsMark = 'blank' | 'cross' | 'star'

/** The board in play: the printed level and the player's pencil marks. */
export type StarsState = {
  readonly level: StarsLevel
  readonly marks: readonly StarsMark[]
}

const cellSchema = z.number().check(z.int(), z.gte(0))

/**
 * A tap cycles blank → cross → star → blank; a long press sets a star or
 * rubs it out; a drag crosses (or clears) every cell it runs over, stars left
 * alone.
 */
export const starsMoveSchema = z.discriminatedUnion('kind', [
  z.object({ cell: cellSchema, kind: z.literal('cycle') }),
  z.object({ cell: cellSchema, kind: z.literal('star') }),
  z.object({
    cells: z.array(cellSchema),
    kind: z.literal('mark'),
    mark: z.enum(['cross', 'blank'])
  })
])

export type StarsMove = z.infer<typeof starsMoveSchema>
