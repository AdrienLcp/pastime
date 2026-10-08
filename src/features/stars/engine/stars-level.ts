import { z } from 'zod/mini'

import { STARS_TECHNIQUES } from '../solver/stars-technique'

export const SMALLEST_STARS_SIZE = 7
export const LARGEST_STARS_SIZE = 15

/** The grid alone: what the rules and the solver read. */
export type StarsPuzzle = {
  readonly size: number
  /** The region of every cell, in reading order. */
  readonly regions: readonly number[]
}

const holdsEveryRegion = ({ regions, size }: StarsPuzzle): boolean => {
  const seen = new Set(regions)
  return (
    regions.length === size * size &&
    seen.size === size &&
    regions.every((region) => region < size)
  )
}

export const starsLevelSchema = z
  .object({
    difficulty: z.enum(STARS_TECHNIQUES),
    regions: z.array(z.number().check(z.int(), z.gte(0))),
    size: z
      .number()
      .check(z.int(), z.gte(SMALLEST_STARS_SIZE), z.lte(LARGEST_STARS_SIZE))
  })
  .check(z.refine(holdsEveryRegion, { message: 'one region per row' }))

/** A printed puzzle: its grid, and the hardest technique it asks for. */
export type StarsLevel = z.infer<typeof starsLevelSchema>
