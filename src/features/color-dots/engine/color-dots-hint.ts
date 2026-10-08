import {
  type ColorDotsSolver,
  createColorDotsSolver
} from '../solver/color-dots-solver'
import type { ColorDotsLevel } from './color-dots-level'
import type { ColorDotsState } from './color-dots-state'

/**
 * The ball to send next, or word that no order clears the board from here —
 * an earlier tap sealed it, and only undoing it plays on.
 */
export type ColorDotsHint =
  | { readonly kind: 'next-ball'; readonly ball: number }
  | { readonly kind: 'dead-end' }

const solvers = new WeakMap<ColorDotsLevel, ColorDotsSolver>()

const solverOf = (level: ColorDotsLevel): ColorDotsSolver => {
  const known = solvers.get(level)
  if (known !== undefined) return known
  const solver = createColorDotsSolver(level)
  solvers.set(level, solver)
  return solver
}

export const colorDotsHintOf = (
  state: ColorDotsState
): ColorDotsHint | null => {
  if (state.rides.some((ride) => ride.end.kind === 'pops')) return null
  const solution = solverOf(state.level).solve(state.spots)
  switch (solution.kind) {
    case 'solved': {
      const ball = solution.order[0]
      return ball === undefined ? null : { ball, kind: 'next-ball' }
    }
    case 'stuck':
      return { kind: 'dead-end' }
    case 'too-large':
      return null
    default:
      return solution satisfies never
  }
}
