import { rankOf, suitIndexOf } from './playing-card'
import {
  canReceive,
  cardsOf,
  isEveryCardRevealed,
  isSolitaireWon
} from './solitaire-rules'
import type { Pile, SolitaireMove, SolitaireState } from './solitaire-state'

/**
 * Nothing left to decide: every tableau card is face up and, drawing three,
 * the stock is out too. The game then plays itself out.
 */
export const canAutoComplete = (state: SolitaireState): boolean =>
  !isSolitaireWon(state) &&
  isEveryCardRevealed(state) &&
  (state.level.draw === 1 ||
    (state.stock.length === 0 && state.waste.length === 0))

const topsOf = (state: SolitaireState) => {
  const piles: Pile[] = [
    { kind: 'waste' },
    ...state.tableau.map((_, column) => ({ column, kind: 'tableau' as const }))
  ]
  return piles.flatMap((from) => {
    const card = cardsOf(state, from).at(-1)
    return card === undefined ? [] : [{ card, from }]
  })
}

/**
 * Auto-complete's next move: the lowest card that fits its foundation, or a
 * turn of the stock to reach it.
 */
export const autoCompleteMoveOf = (
  state: SolitaireState
): SolitaireMove | null => {
  if (!canAutoComplete(state)) return null
  const playable = topsOf(state)
    .filter(({ card }) =>
      canReceive({
        cards: [card],
        state,
        to: { kind: 'foundation', suit: suitIndexOf(card) }
      })
    )
    .toSorted((a, b) => rankOf(a.card) - rankOf(b.card))
  const [lowest] = playable
  if (lowest !== undefined) {
    return {
      count: 1,
      from: lowest.from,
      kind: 'move',
      to: { kind: 'foundation', suit: suitIndexOf(lowest.card) }
    }
  }
  if (state.stock.length > 0) return { kind: 'draw' }
  if (state.waste.length > 0) return { kind: 'recycle' }
  return null
}
