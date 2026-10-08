import type { Result } from '@adrienlcp/result'

import { createSeededRandom, type SeededRandom } from '@/helpers/seeded-random'

import {
  type GeneratorResponse,
  generatorRequestSchema
} from './generator-protocol'

export type LevelGenerator<Level> = (input: {
  random: SeededRandom
  variantId: string
}) => Result<{ readonly level: Level }, 'gave_up'>

/** A generator whose levels follow the puzzle's number, not only its seed. */
export type NumberedLevelGenerator<Level> = (input: {
  random: SeededRandom
  variantId: string
  number: number
}) => Result<{ readonly level: Level }, 'gave_up'>

/**
 * Runs inside a game's `*.worker.ts`: answers each request with one level,
 * drawn from the request's seed alone, so the same request prints the same
 * level on every device.
 */
export const serveGenerator = <Level>(
  generate: LevelGenerator<Level> | NumberedLevelGenerator<Level>
): void => {
  globalThis.addEventListener('message', (event) => {
    const request = generatorRequestSchema.safeParse(event.data)
    if (!request.success) return
    const generated = generate({
      number: request.data.number,
      random: createSeededRandom(request.data.seed),
      variantId: request.data.variantId
    })
    const response: GeneratorResponse =
      generated.status === 'success'
        ? { level: generated.data.level, status: 'success' }
        : { error: 'gave_up', status: 'failure' }
    globalThis.postMessage(response)
  })
}
