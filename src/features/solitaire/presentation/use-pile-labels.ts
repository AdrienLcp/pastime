import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { SUITS } from '../engine/playing-card'
import { cardsOf, columnOf } from '../engine/solitaire-rules'
import type { SolitaireState } from '../engine/solitaire-state'
import type { TablePile } from './table-layout'
import { useCardNames } from './use-card-names'

/** A pile told in words, for the keyboard and the screen reader. */
export const usePileLabels = (state: SolitaireState) => {
  const translate = useTranslate()
  const { nameOf, suitNameOf } = useCardNames()
  const empty = translate('games.solitaire.empty')

  const partsOf = (pile: TablePile): readonly (string | null)[] => {
    switch (pile.kind) {
      case 'stock':
        return [
          translate('games.solitaire.piles.stock'),
          state.stock.length > 0
            ? translate('games.solitaire.cardCount', {
                count: state.stock.length
              })
            : empty,
          state.stock.length === 0 && state.waste.length > 0
            ? translate('games.solitaire.recycle')
            : null
        ]
      case 'waste': {
        const top = state.waste.at(-1)
        return [
          translate('games.solitaire.piles.waste'),
          top === undefined ? empty : nameOf(top)
        ]
      }
      case 'foundation': {
        const top = cardsOf(state, pile).at(-1)
        return [
          translate('games.solitaire.piles.foundation', {
            suit: suitNameOf(SUITS[pile.suit] ?? 'clubs')
          }),
          top === undefined ? empty : nameOf(top)
        ]
      }
      case 'tableau': {
        const { cards, hidden } = columnOf(state, pile.column)
        return [
          translate('games.solitaire.piles.column', {
            column: pile.column + 1
          }),
          cards.length === 0 ? empty : null,
          hidden > 0
            ? translate('games.solitaire.hiddenCount', { count: hidden })
            : null,
          ...cards.slice(hidden).map(nameOf)
        ]
      }
      default:
        return pile satisfies never
    }
  }

  return (pile: TablePile): string =>
    partsOf(pile)
      .filter((part) => part !== null)
      .join(', ')
}
