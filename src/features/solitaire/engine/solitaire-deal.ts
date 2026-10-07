import type { SolitaireLevel } from './solitaire-level'
import { type SolitaireState, TABLEAU_COLUMNS } from './solitaire-state'

/**
 * The column each of the deck's first cards lands in: dealt row by row, one
 * card fewer each row, so column `n` ends up with `n + 1` cards.
 */
const TABLEAU_DEAL = Array.from({ length: TABLEAU_COLUMNS }, (_, row) =>
  Array.from({ length: TABLEAU_COLUMNS - row }, (_, offset) => row + offset)
).flat()

/** The deal on the table: every column face down but its last card. */
export const dealKlondike = (level: SolitaireLevel): SolitaireState => {
  const dealt = level.deck.slice(0, TABLEAU_DEAL.length)
  return {
    foundations: [[], [], [], []],
    level,
    stock: level.deck.slice(TABLEAU_DEAL.length),
    tableau: Array.from({ length: TABLEAU_COLUMNS }, (_, column) => ({
      cards: dealt.filter((_, index) => TABLEAU_DEAL[index] === column),
      hidden: column
    })),
    waste: []
  }
}
