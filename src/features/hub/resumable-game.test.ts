import { describe, expect, it } from 'vitest'

import type { SavedGame } from '@/features/game-frame/saved-game'

import { resumableGame } from './resumable-game'

const saved = (gameId: string, savedAtMs: number): SavedGame => ({
  elapsedMs: 1000,
  hintsUsed: 0,
  level: null,
  moves: [],
  puzzle: { gameId, seed: 3, variantId: '8' },
  savedAtMs
})

describe('resumable game', () => {
  it('[hub] offers nothing when no game waits', () => {
    expect(resumableGame([])).toBeNull()
  })

  it('[hub] offers the game played last', () => {
    expect(resumableGame([saved('stars', 10), saved('pipes', 20)])).toEqual(
      saved('pipes', 20)
    )
    expect(resumableGame([saved('stars', 30), saved('pipes', 20)])).toEqual(
      saved('stars', 30)
    )
  })
})
