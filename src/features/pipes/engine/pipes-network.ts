import {
  neighbourOf,
  openSidesOf,
  oppositeOf,
  type Side,
  turnBy
} from './pipes-grid'
import { type PipesLevel, sourceOf } from './pipes-level'
import type { PipesState } from './pipes-state'

/** Every tile as it faces now. */
export const currentTilesOf = (state: PipesState): number[] =>
  state.level.tiles.map((tile, cell) =>
    turnBy({ quarterTurns: state.turns[cell] ?? 0, tile })
  )

const joinedNeighbourOf = ({
  cell,
  side,
  size,
  tiles
}: {
  cell: number
  side: Side
  size: number
  tiles: readonly number[]
}): number | null => {
  const neighbour = neighbourOf({ cell, side, size })
  if (neighbour === null) return null
  return ((tiles[neighbour] ?? 0) & oppositeOf(side)) === 0 ? null : neighbour
}

/**
 * The tiles water reaches from the source, through every side that meets an
 * open side across it: each with its distance from the source, in tiles.
 */
export const waterDepthsOf = ({
  level,
  tiles
}: {
  level: PipesLevel
  tiles: readonly number[]
}): Map<number, number> => {
  const source = sourceOf(level)
  const depths = new Map([[source, 0]])
  const queue = [source]
  for (let cell = queue.shift(); cell !== undefined; cell = queue.shift()) {
    const depth = (depths.get(cell) ?? 0) + 1
    for (const side of openSidesOf(tiles[cell] ?? 0)) {
      const neighbour = joinedNeighbourOf({
        cell,
        side,
        size: level.size,
        tiles
      })
      if (neighbour === null || depths.has(neighbour)) continue
      depths.set(neighbour, depth)
      queue.push(neighbour)
    }
  }
  return depths
}

/**
 * Solved: water reaches every tile and no pipe ends against a wall or a
 * closed side. With every side joined, the pipes form a network, and a
 * network over every tile is a tree only if it holds one pipe fewer than
 * tiles — so counting the joins rules a loop out.
 */
export const isPipesSolved = (state: PipesState): boolean => {
  const { level } = state
  const tiles = currentTilesOf(state)
  let openSides = 0
  for (const [cell, tile] of tiles.entries())
    for (const side of openSidesOf(tile)) {
      if (joinedNeighbourOf({ cell, side, size: level.size, tiles }) === null)
        return false
      openSides++
    }
  return (
    openSides / 2 === tiles.length - 1 &&
    waterDepthsOf({ level, tiles }).size === tiles.length
  )
}
