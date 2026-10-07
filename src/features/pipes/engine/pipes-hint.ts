import { solvePipes } from '../solver/pipes-solver'
import type { PipesLevel } from './pipes-level'
import { currentTilesOf } from './pipes-network'
import type { PipesState } from './pipes-state'

/**
 * What the hint shows: a locked tile facing the wrong way, or the next tile
 * logic settles from the ones the player locked.
 */
export type PipesHint =
  | { readonly kind: 'wrong-lock'; readonly cell: number }
  | { readonly kind: 'forced'; readonly cell: number }

const solutions = new WeakMap<PipesLevel, readonly (number | null)[]>()

const solutionOf = (level: PipesLevel) => {
  const known = solutions.get(level)
  if (known !== undefined) return known
  const { tiles } = solvePipes(level)
  solutions.set(level, tiles)
  return tiles
}

/**
 * A wrong lock comes first: nothing true follows from it. Then the first
 * tile logic settles, past the locked ones, that does not yet face its way.
 */
export const pipesHintOf = (state: PipesState): PipesHint | null => {
  const solution = solutionOf(state.level)
  const tiles = currentTilesOf(state)
  const isRight = (cell: number) => tiles[cell] === solution[cell]
  const wrongLock = state.locked.findIndex(
    (isLocked, cell) => isLocked && !isRight(cell)
  )
  if (wrongLock !== -1) return { cell: wrongLock, kind: 'wrong-lock' }

  const given = new Map(
    tiles.flatMap((tile, cell) => (state.locked[cell] ? [[cell, tile]] : []))
  )
  const forced = solvePipes(state.level, given).order.find(
    (cell) => !isRight(cell)
  )
  return forced === undefined ? null : { cell: forced, kind: 'forced' }
}
