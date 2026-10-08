import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod/mini'

import {
  memoryStorage,
  storedKeys
} from '@/infrastructure/storage/memory-storage'

import { takeReadyLevel } from './game-storage'
import type { GeneratorWorker } from './generator/generate-level'
import { printNextLevel } from './print-ahead'

const levelSchema = z.object({ size: z.number() })

/** A worker that prints a level of the requested size for every request. */
const sizedWorkers = () => {
  let created = 0
  const createWorker = (): GeneratorWorker => {
    created++
    const worker: GeneratorWorker = {
      onerror: null,
      onmessage: null,
      postMessage: (request) => {
        queueMicrotask(() =>
          worker.onmessage?.(
            new MessageEvent('message', {
              data: {
                level: { size: Number(request.variantId) },
                status: 'success'
              }
            })
          )
        )
      },
      terminate: () => undefined
    }
    return worker
  }
  return { created: () => created, createWorker }
}

const pipes7 = { gameId: 'pipes', variantId: '7' }

describe('print ahead', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', memoryStorage({}))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('[print-ahead] keeps a level for the variant, which the next new game takes once', async () => {
    const workers = sizedWorkers()
    await printNextLevel({ ...workers, ...pipes7, levelSchema })

    expect(storedKeys(localStorage)).toEqual(['pastime.next-level.v1.pipes.7'])
    expect(takeReadyLevel(pipes7)).toEqual({
      level: { size: 7 },
      seed: expect.any(Number)
    })
    expect(takeReadyLevel(pipes7)).toBeNull()
  })

  it('[print-ahead] prints nothing while a level waits or is being printed', async () => {
    const workers = sizedWorkers()
    await Promise.all([
      printNextLevel({ ...workers, ...pipes7, levelSchema }),
      printNextLevel({ ...workers, ...pipes7, levelSchema })
    ])
    await printNextLevel({ ...workers, ...pipes7, levelSchema })

    expect(workers.created()).toBe(1)
  })

  it('[print-ahead] keeps one level per variant', async () => {
    const workers = sizedWorkers()
    await printNextLevel({ ...workers, ...pipes7, levelSchema })
    await printNextLevel({
      ...workers,
      gameId: 'pipes',
      levelSchema,
      variantId: '9'
    })

    expect(takeReadyLevel({ gameId: 'pipes', variantId: '9' })?.level).toEqual({
      size: 9
    })
    expect(takeReadyLevel(pipes7)?.level).toEqual({ size: 7 })
  })

  it('[print-ahead] clears a waiting level that no longer reads', () => {
    localStorage.setItem('pastime.next-level.v1.pipes.7', '{"level":')

    expect(takeReadyLevel(pipes7)).toBeNull()
    expect(storedKeys(localStorage)).toEqual([])
  })
})
