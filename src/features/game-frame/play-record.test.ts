import { describe, expect, it } from 'vitest'

import {
  dailyStreak,
  dailyTimeOf,
  EMPTY_PLAY_RECORD,
  type PlayRecord,
  playRecordSchema,
  recordWin,
  solvedCountOf,
  variantRecordOf
} from './play-record'
import { dailyPuzzle, freePuzzle } from './puzzle'

const day = (iso: string) => Temporal.PlainDate.from(iso)

const winFree = (
  record: PlayRecord,
  number: number,
  elapsedMs: number,
  moveCount = 30
) =>
  recordWin({
    elapsedMs,
    moveCount,
    puzzle: freePuzzle({ gameId: 'stars', number, variantId: '8' }),
    record
  })

const winDaily = (record: PlayRecord, iso: string, gameId = 'stars') =>
  recordWin({
    elapsedMs: 60_000,
    moveCount: 30,
    puzzle: dailyPuzzle({ day: day(iso), gameId, variantId: '8' }),
    record
  }).record

describe('play record', () => {
  it('[play-record] counts a first win as the best time and turns the page', () => {
    const won = winFree(EMPTY_PLAY_RECORD, 1, 42_000)
    expect(won.isNewBest).toBe(true)
    expect(won.previousBestMs).toBeNull()
    expect(
      variantRecordOf({ gameId: 'stars', record: won.record, variantId: '8' })
    ).toEqual({
      bestMs: 42_000,
      fewestMoves: 30,
      nextNumber: 2,
      solved: 1
    })
  })

  it('[play-record] keeps the best time against a slower win', () => {
    const first = winFree(EMPTY_PLAY_RECORD, 1, 42_000)
    const slower = winFree(first.record, 2, 50_000)
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
    const first = winFree(EMPTY_PLAY_RECORD, 1, 42_000, 90)
    const slowerButShorter = winFree(first.record, 2, 50_000, 72)
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
        dailies: {},
        preferredVariant: null,
        variants: { '8': { bestMs: 42_000, nextNumber: 2, solved: 1 } }
      }
    })
    const won = winFree(before, 2, 50_000, 80)
    expect(won.previousFewestMoves).toBeNull()
    expect(won.isNewFewestMoves).toBe(true)
  })

  it('[play-record] marks a daily done without turning the free play page', () => {
    const record = winDaily(EMPTY_PLAY_RECORD, '2026-10-07')
    expect(
      dailyTimeOf({ day: day('2026-10-07'), gameId: 'stars', record })
    ).toBe(60_000)
    expect(
      dailyTimeOf({ day: day('2026-10-08'), gameId: 'stars', record })
    ).toBeNull()
    expect(
      variantRecordOf({ gameId: 'stars', record, variantId: '8' }).nextNumber
    ).toBe(1)
  })

  it('[play-record] counts the streak across games and keeps it until today is done', () => {
    let record = winDaily(EMPTY_PLAY_RECORD, '2026-10-04')
    record = winDaily(record, '2026-10-05', 'stars')
    record = winDaily(record, '2026-10-06')
    expect(dailyStreak({ record, today: day('2026-10-07') })).toBe(3)
    expect(
      dailyStreak({
        record: winDaily(record, '2026-10-07'),
        today: day('2026-10-07')
      })
    ).toBe(4)
    expect(dailyStreak({ record, today: day('2026-10-08') })).toBe(0)
  })
})
