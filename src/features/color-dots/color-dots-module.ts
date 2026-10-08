import { sealGameModule } from '@/features/game-frame/game-module'

import { colorDotsEngine } from './engine/color-dots-engine'
import ColorDotsGeneratorWorker from './generator/color-dots-generator.worker?worker'
import { ColorDotsBoard } from './presentation/color-dots-board'
import { colorDotsHintKey } from './presentation/color-dots-hint-key'
import { popSeenInMs } from './presentation/pop-seen'

/** Loaded with the game's page only: the hub never downloads a board. */
export const colorDotsModule = sealGameModule({
  Board: ColorDotsBoard,
  createGeneratorWorker: () => new ColorDotsGeneratorWorker(),
  engine: colorDotsEngine,
  hintKey: colorDotsHintKey,
  lossSeenInMs: popSeenInMs
})
