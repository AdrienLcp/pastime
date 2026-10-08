import { Result } from '@adrienlcp/result'
import type { z } from 'zod/mini'

import { retrySeed } from '../puzzle'
import {
  type GeneratorRequest,
  generatorResponseSchema
} from './generator-protocol'

/** The part of a `Worker` the page uses: a fake one stands in for it in tests. */
export type GeneratorWorker = {
  onmessage: ((event: MessageEvent<unknown>) => void) | null
  onerror: ((event: ErrorEvent) => void) | null
  postMessage: (request: GeneratorRequest) => void
  terminate: () => void
}

/** Long enough for a hard grid on a slow phone; past it, a fresh seed is faster. */
const GENERATION_TIMEOUT_MS = 6000

const ATTEMPTS = 4

type AttemptError = 'aborted' | 'crashed' | 'gave_up' | 'timed_out'

const attemptGeneration = ({
  createWorker,
  request,
  signal,
  timeoutMs
}: {
  createWorker: () => GeneratorWorker
  request: GeneratorRequest
  signal: AbortSignal | undefined
  timeoutMs: number
}): Promise<Result<unknown, AttemptError>> =>
  new Promise((resolve) => {
    const worker = createWorker()
    const settle = (outcome: Result<unknown, AttemptError>) => {
      clearTimeout(timer)
      signal?.removeEventListener('abort', abort)
      worker.terminate()
      resolve(outcome)
    }
    const abort = () => settle(Result.failure('aborted'))
    const timer = setTimeout(
      () => settle(Result.failure('timed_out')),
      timeoutMs
    )

    signal?.addEventListener('abort', abort, { once: true })
    worker.onerror = () => settle(Result.failure('crashed'))
    worker.onmessage = (event) => {
      const response = generatorResponseSchema.safeParse(event.data)
      if (!response.success) return settle(Result.failure('crashed'))
      settle(
        response.data.status === 'success'
          ? Result.success(response.data.level)
          : Result.failure('gave_up')
      )
    }
    worker.postMessage(request)
  })

/**
 * One level from a game's generator, run off the main thread. A worker that
 * gives up, crashes, answers garbage or overruns its time is dropped, and the
 * next attempt draws from a seed derived from the first.
 */
export const generateLevel = async <Level>({
  attempts = ATTEMPTS,
  createWorker,
  levelSchema,
  seed,
  signal,
  timeoutMs = GENERATION_TIMEOUT_MS,
  variantId
}: {
  createWorker: () => GeneratorWorker
  levelSchema: z.ZodMiniType<Level>
  seed: number
  variantId: string
  signal?: AbortSignal
  timeoutMs?: number
  attempts?: number
}): Promise<Result<{ readonly level: Level }, 'aborted' | 'failed'>> => {
  for (let attempt = 0; attempt < attempts; attempt++) {
    if (signal?.aborted) return Result.failure('aborted')
    const outcome = await attemptGeneration({
      createWorker,
      request: { seed: retrySeed({ attempt, seed }), variantId },
      signal,
      timeoutMs
    })
    if (outcome.status === 'failure') {
      if (outcome.error === 'aborted') return Result.failure('aborted')
      continue
    }
    const level = levelSchema.safeParse(outcome.data)
    if (level.success) return Result.success({ level: level.data })
  }
  return Result.failure('failed')
}
