import { describe, expect, it } from 'vitest'

import { createSeededRandom, seedFromText } from './seeded-random'

const draws = (seed: number, count: number): number[] => {
  const random = createSeededRandom(seed)
  return Array.from({ length: count }, () => random.next())
}

describe('seeded random', () => {
  it('[seeded-random] draws the same sequence from the same seed', () => {
    expect(draws(42, 20)).toEqual(draws(42, 20))
  })

  it('[seeded-random] draws another sequence from another seed', () => {
    expect(draws(42, 5)).not.toEqual(draws(43, 5))
  })

  it('[seeded-random] keeps every draw in [0, 1)', () => {
    for (const value of draws(7, 5000)) {
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })

  it('[seeded-random] spreads integers evenly enough to deal from', () => {
    const random = createSeededRandom(2026)
    const counts = [0, 0, 0, 0]
    for (let draw = 0; draw < 8000; draw++) {
      const bucket = random.below(4)
      counts[bucket] = (counts[bucket] ?? 0) + 1
    }
    for (const count of counts) {
      expect(count).toBeGreaterThan(1800)
      expect(count).toBeLessThan(2200)
    }
  })

  it('[seeded-random] shuffles a copy and keeps every item', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8]
    const shuffled = createSeededRandom(5).shuffled(items)
    expect(items).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    expect(shuffled.toSorted((a, b) => a - b)).toEqual(items)
    expect(shuffled).not.toEqual(items)
  })

  it('[seeded-random] hashes a text to the same seed every time', () => {
    expect(seedFromText('stars/8/first')).toBe(seedFromText('stars/8/first'))
    expect(seedFromText('stars/8/first')).not.toBe(
      seedFromText('stars/8/second')
    )
  })
})
