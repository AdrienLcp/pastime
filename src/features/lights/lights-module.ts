import { sealGameModule } from '@/features/game-frame/game-module'

import { lightsEngine } from './engine/lights-engine'
import LightsGeneratorWorker from './generator/lights-generator.worker?worker'
import { LightsBoard } from './presentation/lights-board'

/** Loaded with the game's page only: the hub never downloads a board. */
export const lightsModule = sealGameModule({
  Board: LightsBoard,
  createGeneratorWorker: () => new LightsGeneratorWorker(),
  engine: lightsEngine,
  hintKey: () => 'games.lights.hint'
})
