import { solveSolitaire } from '../solver/solitaire-solver'
import { autoCompleteMoveOf } from './solitaire-auto-complete'
import {
  columnOf,
  isSolitaireWon,
  legalMovesOf,
  movableCountOf
} from './solitaire-rules'
import type { SolitaireMove, SolitaireState } from './solitaire-state'

/** Positions searched for a hint: few, so the button answers at once. */
const HINT_BUDGET = 300

export type SolitaireHint = { readonly move: SolitaireMove }

const turnsCardOver = (state: SolitaireState, move: SolitaireMove) =>
  move.kind === 'move' &&
  move.from.kind === 'tableau' &&
  columnOf(state, move.from.column).hidden > 0 &&
  move.count === movableCountOf(state, move.from)

/** The moves worth suggesting when the solver found no way, best first. */
const FALLBACK_PREFERENCES: readonly ((
  state: SolitaireState,
  move: SolitaireMove
) => boolean)[] = [
  (_, move) => move.kind === 'move' && move.to.kind === 'foundation',
  turnsCardOver,
  (_, move) => move.kind === 'move' && move.from.kind === 'waste',
  (_, move) => move.kind !== 'move'
]

const fallbackMoveOf = (state: SolitaireState): SolitaireMove | null => {
  const moves = legalMovesOf(state)
  for (const isPreferred of FALLBACK_PREFERENCES) {
    const move = moves.find((candidate) => isPreferred(state, candidate))
    if (move !== undefined) return move
  }
  return null
}

/**
 * The next move: auto-complete's once nothing is left to decide, else the
 * first move of a way through the solver finds, else a move that at least
 * sends a card home, turns one over or brings one down from the stock.
 */
export const solitaireHintOf = (
  state: SolitaireState
): SolitaireHint | null => {
  if (isSolitaireWon(state)) return null
  const finishing = autoCompleteMoveOf(state)
  if (finishing !== null) return { move: finishing }
  const solved = solveSolitaire({ nodeBudget: HINT_BUDGET, state })
  const [first] = solved.status === 'success' ? solved.data.moves : []
  const move = first ?? fallbackMoveOf(state)
  return move === null ? null : { move }
}
