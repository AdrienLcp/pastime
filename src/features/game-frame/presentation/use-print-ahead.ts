import { useEffect } from 'react'

import type { PreparedPlay } from '../game-loader'
import { printNextLevel } from '../print-ahead'

/** Once a level is on the page, the next one of its variant is printed ahead. */
export const usePrintAhead = <Level, State, Move, Hint>({
  module,
  puzzle
}: PreparedPlay<Level, State, Move, Hint>): void => {
  const { createGeneratorWorker } = module
  const { levelSchema } = module.engine
  const { gameId, variantId } = puzzle

  useEffect(() => {
    void printNextLevel({
      createWorker: createGeneratorWorker,
      gameId,
      levelSchema,
      variantId
    })
  }, [createGeneratorWorker, gameId, levelSchema, variantId])
}
