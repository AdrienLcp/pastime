import { z } from 'zod/mini'

/**
 * A level printed ahead for one variant, waiting for the next new game. Its
 * generator already checked it can be solved; the page checks its shape again
 * against the game's level schema when it takes it.
 */
export const readyLevelSchema = z.object({
  level: z.unknown(),
  seed: z.number()
})

export type ReadyLevel = z.infer<typeof readyLevelSchema>
