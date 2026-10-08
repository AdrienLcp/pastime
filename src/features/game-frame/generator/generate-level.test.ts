import { Result } from '@adrienlcp/result'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod/mini'

import { retrySeed } from '../puzzle'
import { type GeneratorWorker, generateLevel } from './generate-level'
import type { GeneratorRequest } from './generator-protocol'

type Answer = 'crash' | 'garbage' | 'give-up' | 'silence' | { level: unknown }

/** A worker that answers each request the way its script says, in order. */
const scriptedWorkers = (answers: Answer[]) => {
  const requests: GeneratorRequest[] = []
  let terminated = 0
  const createWorker = (): GeneratorWorker => {
    const answer = answers[requests.length] ?? 'silence'
    const worker: GeneratorWorker = {
      onerror: null,
      onmessage: null,
      postMessage: (request) => {
        requests.push(request)
        queueMicrotask(() => {
          if (answer === 'silence') return
          if (answer === 'crash')
            return worker.onerror?.(new ErrorEvent('error'))
          const data =
            answer === 'garbage'
              ? { nonsense: true }
              : answer === 'give-up'
                ? { error: 'gave_up', status: 'failure' }
                : { level: answer.level, status: 'success' }
          worker.onmessage?.(new MessageEvent('message', { data }))
        })
      },
      terminate: () => {
        terminated++
      }
    }
    return worker
  }
  return { createWorker, requests, terminated: () => terminated }
}

const levelSchema = z.object({ size: z.number() })

describe('generate level', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('[generator] returns the first level the worker prints, and ends the worker', async () => {
    const workers = scriptedWorkers([{ level: { size: 3 } }])
    const level = await generateLevel({
      ...workers,
      levelSchema,
      seed: 7,
      variantId: '3'
    })
    expect(level).toEqual(Result.success({ level: { size: 3 } }))
    expect(workers.requests).toEqual([{ seed: 7, variantId: '3' }])
    expect(workers.terminated()).toBe(1)
  })

  it('[generator] retries on a derived seed after a give-up, a crash or garbage', async () => {
    const workers = scriptedWorkers([
      'give-up',
      'crash',
      'garbage',
      { level: { size: 4 } }
    ])
    const level = await generateLevel({
      ...workers,
      levelSchema,
      seed: 7,
      variantId: '4'
    })
    expect(level).toEqual(Result.success({ level: { size: 4 } }))
    expect(workers.requests.map((request) => request.seed)).toEqual(
      [0, 1, 2, 3].map((attempt) => retrySeed({ attempt, seed: 7 }))
    )
    expect(workers.terminated()).toBe(4)
  })

  it('[generator] retries a level that fails its schema', async () => {
    const workers = scriptedWorkers([
      { level: { size: 'big' } },
      { level: { size: 5 } }
    ])
    const level = await generateLevel({
      ...workers,
      levelSchema,
      seed: 1,
      variantId: '5'
    })
    expect(level).toEqual(Result.success({ level: { size: 5 } }))
  })

  it('[generator] drops a worker that overruns its time', async () => {
    const workers = scriptedWorkers(['silence', { level: { size: 3 } }])
    const pending = generateLevel({
      ...workers,
      levelSchema,
      seed: 1,
      timeoutMs: 100,
      variantId: '3'
    })
    await vi.advanceTimersByTimeAsync(100)
    expect(await pending).toEqual(Result.success({ level: { size: 3 } }))
    expect(workers.terminated()).toBe(2)
  })

  it('[generator] fails once every attempt is spent', async () => {
    const workers = scriptedWorkers(['give-up', 'give-up'])
    const level = await generateLevel({
      ...workers,
      attempts: 2,
      levelSchema,
      seed: 1,
      variantId: '3'
    })
    expect(level).toEqual(Result.failure('failed'))
  })

  it('[generator] stops at once when the page no longer wants the level', async () => {
    const workers = scriptedWorkers(['silence'])
    const controller = new AbortController()
    const pending = generateLevel({
      ...workers,
      levelSchema,
      seed: 1,
      signal: controller.signal,
      variantId: '3'
    })
    controller.abort()
    expect(await pending).toEqual(Result.failure('aborted'))
    expect(workers.terminated()).toBe(1)
  })
})
