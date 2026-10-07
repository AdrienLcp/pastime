import { z } from 'zod/mini'

import { centreOf, openSidesOf } from './pipes-grid'

export const SMALLEST_PIPES_SIZE = 5
export const LARGEST_PIPES_SIZE = 13

/** A dead end, a straight, a corner or a T: one to three open sides. */
const isPipeTile = (tile: number) =>
  tile > 0 && tile < 16 && openSidesOf(tile).length < 4

const holdsEveryTile = ({ size, tiles }: { size: number; tiles: number[] }) =>
  tiles.length === size * size && tiles.every(isPipeTile)

/**
 * A printed puzzle: every tile as dealt, already turned away from the
 * solution. The source sits in the middle, so the size alone places it.
 */
export const pipesLevelSchema = z
  .object({
    size: z.number().check(
      z.int(),
      z.gte(SMALLEST_PIPES_SIZE),
      z.lte(LARGEST_PIPES_SIZE),
      z.refine((size) => size % 2 === 1, { message: 'odd size' })
    ),
    tiles: z.array(z.number().check(z.int()))
  })
  .check(z.refine(holdsEveryTile, { message: 'one pipe per cell' }))

export type PipesLevel = z.infer<typeof pipesLevelSchema>

export const sourceOf = (level: Pick<PipesLevel, 'size'>): number =>
  centreOf(level.size)
