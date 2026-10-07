import type { Card } from '../engine/playing-card'
import type { SolitaireHint } from '../engine/solitaire-hint'
import { cardsOf } from '../engine/solitaire-rules'
import type { SolitaireState } from '../engine/solitaire-state'
import { pileKeyOf } from './table-layout'

export type HintRole = 'take' | 'onto'

/** What the pencil marks for a hint: the cards to take, and where they go. */
export type HintMarks = {
  readonly cards: ReadonlyMap<Card, HintRole>
  /** The pile marked when there is no card on it to mark instead. */
  readonly pileKey: string | null
}

const NO_MARKS: HintMarks = { cards: new Map(), pileKey: null }

export const hintMarksOf = (
  state: SolitaireState,
  hint: SolitaireHint | null
): HintMarks => {
  if (hint === null) return NO_MARKS
  const { move } = hint
  if (move.kind !== 'move') {
    const top = state.stock.at(-1)
    return {
      cards: new Map(top === undefined ? [] : [[top, 'take']]),
      pileKey: top === undefined ? 'stock' : null
    }
  }
  const target = cardsOf(state, move.to).at(-1)
  const taken = cardsOf(state, move.from).slice(-move.count)
  const marked: [Card, HintRole][] = taken.map((card) => [card, 'take'])
  if (target !== undefined) marked.push([target, 'onto'])
  return {
    cards: new Map(marked),
    pileKey: target === undefined ? pileKeyOf(move.to) : null
  }
}
