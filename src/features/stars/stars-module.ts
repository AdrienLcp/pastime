import { sealGameModule } from '@/features/game-frame/game-module'

import { starsEngine } from './engine/stars-engine'
import StarsGeneratorWorker from './generator/stars-generator.worker?worker'
import { StarsBoard } from './presentation/stars-board'
import { starsHintKey } from './presentation/stars-hint-key'
import { StarsOptions } from './presentation/stars-options'

/** Loaded with the game's page only: the hub never downloads a board. */
export const starsModule = sealGameModule({
  Board: StarsBoard,
  createGeneratorWorker: () => new StarsGeneratorWorker(),
  engine: starsEngine,
  hintKey: starsHintKey,
  Options: StarsOptions
})
