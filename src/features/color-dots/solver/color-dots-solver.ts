import type { ColorDotsSpot } from '../engine/color-dots-state'
import { tapBall } from '../engine/color-dots-tap'
import { type ColorDotsTree, routeBetween } from '../engine/color-dots-tree'

/**
 * Where a search over tap orders ended: an order that clears the board, the
 * proof there is none, or a board too large to settle within the budget.
 */
export type ColorDotsSolution =
  | { readonly kind: 'solved'; readonly order: readonly number[] }
  | { readonly kind: 'stuck' }
  | { readonly kind: 'too-large' }

/** Boards visited by one search before it gives up: far above any level's. */
const SEARCH_BUDGET = 40_000

const SPOT_CODES = {
  ball: 'b',
  gone: '-',
  joint: 'j',
  ring: 'o'
} as const satisfies Record<ColorDotsSpot['kind'], string>

const boardKeyOf = (spots: readonly ColorDotsSpot[]): string =>
  spots
    .map((spot) =>
      spot.kind === 'ring' && spot.isFilled ? 'x' : SPOT_CODES[spot.kind]
    )
    .join('')

const ballsOf = (spots: readonly ColorDotsSpot[]): number[] =>
  spots.flatMap((spot, node) => (spot.kind === 'ball' ? [node] : []))

const isFilledRing = (spot: ColorDotsSpot | undefined) =>
  spot?.kind === 'ring' && spot.isFilled

/**
 * A filled ring never empties: a ball whose every way to a free ring of its
 * colour crosses one will never arrive, whatever is played first.
 */
const hasWalledInBall = ({
  balls,
  spots,
  tree
}: {
  tree: ColorDotsTree
  spots: readonly ColorDotsSpot[]
  balls: readonly number[]
}): boolean =>
  balls.some((ball) => {
    const spot = spots[ball]
    if (spot?.kind !== 'ball') return false
    return spots.every(
      (ring, node) =>
        ring.kind !== 'ring' ||
        ring.isFilled ||
        ring.colour !== spot.colour ||
        routeBetween({ from: ball, to: node, tree }).some((step) =>
          isFilledRing(spots[step])
        )
    )
  })

export type ColorDotsSolver = {
  readonly solve: (spots: readonly ColorDotsSpot[]) => ColorDotsSolution
}

/**
 * A depth-first search over which ball to send next, for one board's tree.
 * The boards already settled, solved or hopeless, are kept between searches,
 * so a solver asked again and again about one level — the hint, the grading —
 * gets faster.
 */
export const createColorDotsSolver = (tree: ColorDotsTree): ColorDotsSolver => {
  const hopeless = new Set<string>()
  const solved = new Map<string, readonly number[]>()

  const solve = (spots: readonly ColorDotsSpot[]): ColorDotsSolution => {
    let visits = 0

    const search = (
      board: readonly ColorDotsSpot[]
    ): readonly number[] | 'stuck' | 'too-large' => {
      const balls = ballsOf(board)
      if (balls.length === 0) return []
      const key = boardKeyOf(board)
      if (hopeless.has(key)) return 'stuck'
      const known = solved.get(key)
      if (known !== undefined) return known
      visits++
      if (visits > SEARCH_BUDGET) return 'too-large'
      if (hasWalledInBall({ balls, spots: board, tree })) {
        hopeless.add(key)
        return 'stuck'
      }
      for (const ball of balls) {
        const tapped = tapBall({ ball, spots: board, tree })
        if (tapped.status === 'failure' || tapped.data.tap.kind === 'blocked')
          continue
        const rest = search(tapped.data.spots)
        if (rest === 'too-large') return rest
        if (rest === 'stuck') continue
        const order = [ball, ...rest]
        solved.set(key, order)
        return order
      }
      hopeless.add(key)
      return 'stuck'
    }

    const found = search(spots)
    if (found === 'stuck' || found === 'too-large') return { kind: found }
    return { kind: 'solved', order: found }
  }

  return { solve }
}

/**
 * How hard a level is along the order that solves it: the taps that move a
 * ball without being blocked yet leave a board no order can clear — the wrong
 * taps that tempt. A board too large to settle counts as no trap.
 */
export const countTraps = ({
  order,
  solver,
  spots,
  tree
}: {
  tree: ColorDotsTree
  solver: ColorDotsSolver
  spots: readonly ColorDotsSpot[]
  order: readonly number[]
}): number => {
  let board = spots
  let traps = 0
  for (const next of order) {
    for (const ball of ballsOf(board)) {
      if (ball === next) continue
      const tapped = tapBall({ ball, spots: board, tree })
      if (tapped.status === 'failure' || tapped.data.tap.kind === 'blocked')
        continue
      if (solver.solve(tapped.data.spots).kind === 'stuck') traps++
    }
    const played = tapBall({ ball: next, spots: board, tree })
    if (played.status === 'failure') return traps
    board = played.data.spots
  }
  return traps
}
