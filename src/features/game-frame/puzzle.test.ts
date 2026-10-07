import { describe, expect, it } from 'vitest'

import {
  dailyPuzzle,
  freePuzzle,
  issueNumber,
  puzzleSeed,
  retrySeed
} from './puzzle'

const day = (iso: string) => Temporal.PlainDate.from(iso)

describe('puzzle', () => {
  it('[puzzle] numbers the issues from the first of January 2026', () => {
    expect(issueNumber(day('2026-01-01'))).toBe(1)
    expect(issueNumber(day('2026-10-07'))).toBe(280)
    expect(issueNumber(day('2027-01-01'))).toBe(366)
  })

  it('[puzzle] gives every player the same daily seed for a game and a day', () => {
    const one = dailyPuzzle({
      day: day('2026-10-07'),
      gameId: 'stars',
      variantId: '8'
    })
    const same = dailyPuzzle({
      day: day('2026-10-07'),
      gameId: 'stars',
      variantId: '8'
    })
    const tomorrow = dailyPuzzle({
      day: day('2026-10-08'),
      gameId: 'stars',
      variantId: '8'
    })
    const otherGame = dailyPuzzle({
      day: day('2026-10-07'),
      gameId: 'pipes',
      variantId: '8'
    })
    expect(puzzleSeed(one)).toBe(puzzleSeed(same))
    expect(puzzleSeed(one)).not.toBe(puzzleSeed(tomorrow))
    expect(puzzleSeed(one)).not.toBe(puzzleSeed(otherGame))
  })

  it('[puzzle] seeds a free puzzle from its game, variant and number', () => {
    const seed = (variantId: string, number: number) =>
      puzzleSeed(freePuzzle({ gameId: 'stars', number, variantId }))
    expect(seed('8', 214)).toBe(seed('8', 214))
    expect(seed('8', 214)).not.toBe(seed('8', 215))
    expect(seed('8', 214)).not.toBe(seed('10', 214))
  })

  it('[puzzle] keeps the first seed and derives the retries from it', () => {
    expect(retrySeed({ attempt: 0, seed: 99 })).toBe(99)
    expect(retrySeed({ attempt: 1, seed: 99 })).toBe(
      retrySeed({ attempt: 1, seed: 99 })
    )
    expect(retrySeed({ attempt: 1, seed: 99 })).not.toBe(99)
    expect(retrySeed({ attempt: 2, seed: 99 })).not.toBe(
      retrySeed({ attempt: 1, seed: 99 })
    )
  })
})
