import { sealGameModule } from '@/features/game-frame/game-module'

import { solitaireEngine } from './engine/solitaire-engine'
import SolitaireGeneratorWorker from './generator/solitaire-generator.worker?worker'
import { SolitaireBoard } from './presentation/solitaire-board'
import { solitaireHintKey } from './presentation/solitaire-hint-key'

/** Loaded with the game's page only: the hub never downloads a board. */
export const solitaireModule = sealGameModule({
  Board: SolitaireBoard,
  createGeneratorWorker: () => new SolitaireGeneratorWorker(),
  engine: solitaireEngine,
  hintKey: solitaireHintKey
})
