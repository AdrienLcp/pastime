import type { z } from 'zod/mini'

import { whenPageIdle } from '@/infrastructure/browser'
import { randomSeed } from '@/infrastructure/random-seed'

import { GAMES } from './game-registry'
import {
  hasReadyLevel,
  keepReadyLevel,
  readPlayRecordOrEmpty
} from './game-storage'
import { type GeneratorWorker, generateLevel } from './generator/generate-level'
import { preferredVariantId } from './play-record'

const slotsBeingPrinted = new Set<string>()

/**
 * Prints the next level of a variant ahead, in the game's worker, once the
 * page is idle, so a new game opens on it at once. Does nothing while one
 * already waits or is being printed.
 */
export const printNextLevel = async <Level>({
  createWorker,
  gameId,
  levelSchema,
  variantId
}: {
  createWorker: () => GeneratorWorker
  gameId: string
  levelSchema: z.ZodMiniType<Level>
  variantId: string
}): Promise<void> => {
  const slot = `${gameId}/${variantId}`
  if (slotsBeingPrinted.has(slot) || hasReadyLevel({ gameId, variantId })) {
    return
  }
  slotsBeingPrinted.add(slot)
  await whenPageIdle()
  const seed = randomSeed()
  const printed = await generateLevel({
    createWorker,
    levelSchema,
    seed,
    variantId
  })
  if (printed.status === 'success') {
    keepReadyLevel({
      gameId,
      ready: { level: printed.data.level, seed },
      variantId
    })
  }
  slotsBeingPrinted.delete(slot)
}

/**
 * On launch, one level ahead for the variant each game opens on, one game
 * after the other, so even a first new game never waits.
 */
export const printNextLevels = async (): Promise<void> => {
  await whenPageIdle()
  const record = readPlayRecordOrEmpty()
  for (const game of GAMES) {
    const sealedModule = await game.load()
    await sealedModule((module) =>
      printNextLevel({
        createWorker: module.createGeneratorWorker,
        gameId: game.id,
        levelSchema: module.engine.levelSchema,
        variantId: preferredVariantId({ game, record })
      })
    )
  }
}
