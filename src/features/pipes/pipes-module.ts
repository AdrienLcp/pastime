import { sealGameModule } from '@/features/game-frame/game-module'

import { pipesEngine } from './engine/pipes-engine'
import PipesGeneratorWorker from './generator/pipes-generator.worker?worker'
import { PipesBoard } from './presentation/pipes-board'
import { pipesHintKey } from './presentation/pipes-hint-key'

/** Loaded with the game's page only: the hub never downloads a board. */
export const pipesModule = sealGameModule({
  Board: PipesBoard,
  createGeneratorWorker: () => new PipesGeneratorWorker(),
  engine: pipesEngine,
  hintKey: pipesHintKey
})
