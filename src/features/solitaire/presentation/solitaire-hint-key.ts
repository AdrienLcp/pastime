import type { PlainTranslationKey } from '@/presentation/i18n/translation'

import type { SolitaireHint } from '../engine/solitaire-hint'

/** The hint's sentence, named after the move it points at. */
export const solitaireHintKey = ({
  move
}: SolitaireHint): PlainTranslationKey => {
  switch (move.kind) {
    case 'draw':
      return 'games.solitaire.hints.draw'
    case 'recycle':
      return 'games.solitaire.hints.recycle'
    case 'move':
      return move.to.kind === 'foundation'
        ? 'games.solitaire.hints.toFoundation'
        : 'games.solitaire.hints.toColumn'
    default:
      return move satisfies never
  }
}
