import type { SeededRandom } from '@/helpers/seeded-random'

import {
  centreOf,
  neighbourOf,
  openSidesOf,
  oppositeOf,
  SIDES,
  type Side
} from '../engine/pipes-grid'

/** A T-junction at most: a tile never opens all four ways. */
export const MOST_OPEN_SIDES = 3

type Branch = {
  readonly from: number
  readonly side: Side
  readonly to: number
}

/**
 * A random tree over every tile, grown from the middle one branch at a time
 * (randomised Prim), each tile drawn as the sides its branches leave by.
 */
export const growSpanningTree = ({
  random,
  size
}: {
  random: SeededRandom
  size: number
}): number[] => {
  const tiles = Array<number>(size * size).fill(0)
  const reached = new Set([centreOf(size)])
  const frontier: Branch[] = []

  const offerBranchesFrom = (from: number) => {
    for (const side of SIDES) {
      const to = neighbourOf({ cell: from, side, size })
      if (to !== null && !reached.has(to)) frontier.push({ from, side, to })
    }
  }

  offerBranchesFrom(centreOf(size))
  while (frontier.length > 0) {
    const index = random.below(frontier.length)
    const branch = frontier[index]
    frontier.splice(index, 1)
    if (branch === undefined || reached.has(branch.to)) continue
    if (openSidesOf(tiles[branch.from] ?? 0).length >= MOST_OPEN_SIDES) continue
    tiles[branch.from] = (tiles[branch.from] ?? 0) | branch.side
    tiles[branch.to] = (tiles[branch.to] ?? 0) | oppositeOf(branch.side)
    reached.add(branch.to)
    offerBranchesFrom(branch.to)
  }
  return reached.size === tiles.length
    ? tiles
    : growSpanningTree({ random, size })
}
