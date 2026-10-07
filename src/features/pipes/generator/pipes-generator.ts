import { Result } from '@adrienlcp/result'

import type { LevelGenerator } from '@/features/game-frame/generator/serve-generator'
import type { SeededRandom } from '@/helpers/seeded-random'

import { orientationsOf } from '../engine/pipes-grid'
import type { PipesLevel } from '../engine/pipes-level'
import { isPipesVariantId, PIPES_SIZES } from '../engine/pipes-variants'
import { solvePipes } from '../solver/pipes-solver'
import { growSpanningTree } from './spanning-tree'
import { reshapeTree } from './tree-reshape'

/** Pipes moved, per tile of the grid, before the tree is grown afresh. */
const RESHAPES_PER_TILE = 2

/** Fresh trees drawn from one seed before the seed is given up on. */
const TREES_PER_SEED = 4

/** Every tile dealt facing some other way than in the solution. */
const dealt = ({
  random,
  solution
}: {
  random: SeededRandom
  solution: readonly number[]
}) =>
  solution.map((tile) => {
    const others = orientationsOf(tile).filter((other) => other !== tile)
    const [first, ...rest] = others
    return first === undefined ? tile : random.pick([first, ...rest])
  })

const drawTree = ({
  random,
  size
}: {
  random: SeededRandom
  size: number
}): number[] | null => {
  let tiles = growSpanningTree({ random, size })
  for (let reshape = 0; reshape <= RESHAPES_PER_TILE * size * size; reshape++) {
    const solution = solvePipes({ size, tiles })
    if (solution.isSolved) return tiles
    const stalled = solution.tiles.flatMap((tile, cell) =>
      tile === null ? [cell] : []
    )
    const reshaped = reshapeTree({ random, size, stalled, tiles })
    if (reshaped === null) return null
    tiles = reshaped
  }
  return null
}

/**
 * A random tree over the grid, reshaped until logic alone solves it, then
 * every tile turned away: each printed level has one solution and never needs
 * a guess.
 */
export const generatePipes: LevelGenerator<PipesLevel> = ({
  random,
  variantId
}) => {
  if (!isPipesVariantId(variantId)) return Result.failure('gave_up')
  const size = PIPES_SIZES[variantId]
  for (let attempt = 0; attempt < TREES_PER_SEED; attempt++) {
    const solution = drawTree({ random, size })
    if (solution !== null)
      return Result.success({
        level: { size, tiles: dealt({ random, solution }) }
      })
  }
  return Result.failure('gave_up')
}
