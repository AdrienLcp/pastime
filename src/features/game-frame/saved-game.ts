import { z } from 'zod/mini'

import { puzzleRefSchema } from './puzzle'

/**
 * A puzzle left mid-way, written on every move. The level and the moves stay
 * `unknown` here: only the game's own schemas can check them, when it resumes.
 */
export const savedGameSchema = z.object({
  elapsedMs: z.number(),
  hintsUsed: z.number(),
  level: z.unknown(),
  moves: z.array(z.unknown()),
  puzzle: puzzleRefSchema,
  /** When it was last played, as epoch milliseconds. */
  savedAtMs: z.number()
})

export type SavedGame = z.infer<typeof savedGameSchema>
