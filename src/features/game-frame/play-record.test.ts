import { describe, expect, it } from 'vitest'

import {
  EMPTY_PLAY_RECORD,
  type PlayRecord,
  playRecordSchema,
  recordWin,
  solvedCountOf,
  variantRecordOf
} from './play-record'

const win = (record: PlayRecord, elapsedMs: number, moveCount = 30) =>
  recordWin({
    elapsedMs,
    moveCount,
    puzzle: { gameId: 'stars', seed: 1, variantId: '8' },
    record,
    score: null
  })

const scoredWin = (record: PlayRecord, score: number) =>
  recordWin({
    elapsedMs: 200_000,
    moveCount: 120,
    puzzle: { gameId: 'solitaire', seed: 1, variantId: 'winnable' },
    record,
    score
  })

const solitaireRecordOf = (record: PlayRecord) =>
  variantRecordOf({ gameId: 'solitaire', record, variantId: 'winnable' })

describe('play record', () => {
  it('[play-record] counts a first win as the best time', () => {
    const won = win(EMPTY_PLAY_RECORD, 42_000)
    expect(won.isNewBest).toBe(true)
    expect(won.previousBestMs).toBeNull()
    expect(
      variantRecordOf({ gameId: 'stars', record: won.record, variantId: '8' })
    ).toEqual({ bestMs: 42_000, fewestMoves: 30, solved: 1 })
  })

  it('[play-record] keeps the best time against a slower win', () => {
    const first = win(EMPTY_PLAY_RECORD, 42_000)
    const slower = win(first.record, 50_000)
    expect(slower.isNewBest).toBe(false)
    expect(slower.previousBestMs).toBe(42_000)
    expect(
      variantRecordOf({
        gameId: 'stars',
        record: slower.record,
        variantId: '8'
      }).bestMs
    ).toBe(42_000)
    expect(solvedCountOf(slower.record, 'stars')).toBe(2)
  })

  it('[play-record] keeps the fewest moves apart from the best time', () => {
    const first = win(EMPTY_PLAY_RECORD, 42_000, 90)
    const slowerButShorter = win(first.record, 50_000, 72)
    expect(slowerButShorter.isNewBest).toBe(false)
    expect(slowerButShorter.isNewFewestMoves).toBe(true)
    expect(slowerButShorter.previousFewestMoves).toBe(90)
    expect(
      variantRecordOf({
        gameId: 'stars',
        record: slowerButShorter.record,
        variantId: '8'
      }).fewestMoves
    ).toBe(72)
  })

  it('[play-record] reads a record written before moves were counted', () => {
    const before = playRecordSchema.parse({
      stars: {
        preferredVariant: null,
        variants: { '8': { bestMs: 42_000, solved: 1 } }
      }
    })
    const won = win(before, 50_000, 80)
    expect(won.previousFewestMoves).toBeNull()
    expect(won.isNewFewestMoves).toBe(true)
  })

  it('[play-record] reads a version 1 record and drops its dailies and page counters', () => {
    const versionOne = playRecordSchema.parse({
      stars: {
        dailies: { '2026-10-07': 60_000 },
        preferredVariant: '10',
        variants: {
          '8': { bestMs: 42_000, fewestMoves: 30, nextNumber: 4, solved: 3 }
        }
      }
    })
    expect(versionOne).toEqual({
      stars: {
        preferredVariant: '10',
        variants: { '8': { bestMs: 42_000, fewestMoves: 30, solved: 3 } }
      }
    })
  })

  it('[play-record] keeps the best score apart from the best time', () => {
    const first = scoredWin(EMPTY_PLAY_RECORD, 4200)
    expect(first.isNewBestScore).toBe(true)
    expect(first.previousBestScore).toBeNull()
    const lower = scoredWin(first.record, 3900)
    expect(lower.isNewBestScore).toBe(false)
    expect(lower.previousBestScore).toBe(4200)
    const higher = scoredWin(lower.record, 5100)
    expect(higher.isNewBestScore).toBe(true)
    expect(solitaireRecordOf(higher.record).bestScore).toBe(5100)
  })

  it('[play-record] writes no best score for a game without points', () => {
    expect(
      variantRecordOf({
        gameId: 'stars',
        record: win(EMPTY_PLAY_RECORD, 42_000).record,
        variantId: '8'
      })
    ).not.toHaveProperty('bestScore')
  })

  it('[play-record] reads a record written before scores were kept', () => {
    const before = playRecordSchema.parse({
      solitaire: {
        preferredVariant: 'winnable',
        variants: {
          winnable: { bestMs: 300_000, fewestMoves: 140, solved: 2 }
        }
      }
    })
    expect(solitaireRecordOf(before).bestScore).toBeUndefined()
    const won = scoredWin(before, 3800)
    expect(won.previousBestScore).toBeNull()
    expect(won.isNewBestScore).toBe(true)
    expect(solitaireRecordOf(won.record)).toEqual({
      bestMs: 200_000,
      bestScore: 3800,
      fewestMoves: 120,
      solved: 3
    })
  })
})
