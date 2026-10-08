import { describe, expect, it } from 'vitest'

import { retrySeed } from './puzzle'

describe('puzzle', () => {
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
