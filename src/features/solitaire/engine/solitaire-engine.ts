import type { GameEngine } from '@/features/game-frame/game-module'

import { dealKlondike } from './solitaire-deal'
import { type SolitaireHint, solitaireHintOf } from './solitaire-hint'
import { type SolitaireLevel, solitaireLevelSchema } from './solitaire-level'
import { applySolitaireMove, isSolitaireWon } from './solitaire-rules'
import {
  type SolitaireMove,
  type SolitaireState,
  solitaireMoveSchema
} from './solitaire-state'

/** Klondike: every card home, built up by suit from the ace. */
export const solitaireEngine: GameEngine<
  SolitaireLevel,
  SolitaireState,
  SolitaireMove,
  SolitaireHint
> = {
  applyMove: applySolitaireMove,
  hint: solitaireHintOf,
  isWon: isSolitaireWon,
  levelSchema: solitaireLevelSchema,
  moveSchema: solitaireMoveSchema,
  start: dealKlondike
}
