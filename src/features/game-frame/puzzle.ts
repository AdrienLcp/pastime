import { z } from 'zod/mini'

import { seedFromText } from '@/helpers/seeded-random'

/**
 * Which level is on the page. A new one gets a seed drawn at random; it is
 * kept in the save, so a resumed game and a replay print the same board.
 */
export const puzzleRefSchema = z.object({
  gameId: z.string(),
  seed: z.number(),
  variantId: z.string()
})

export type PuzzleRef = z.infer<typeof puzzleRefSchema>

/**
 * The seed of the next try after a generator gave up: derived from the first,
 * so the level stays tied to the seed its puzzle keeps.
 */
export const retrySeed = ({
  attempt,
  seed
}: {
  attempt: number
  seed: number
}): number => (attempt === 0 ? seed : seedFromText(`${seed}/retry/${attempt}`))
