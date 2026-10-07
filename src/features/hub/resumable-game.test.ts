import { describe, expect, it } from 'vitest'

import { dailyPuzzle, freePuzzle } from '@/features/game-frame/puzzle'
import type { SavedGame } from '@/features/game-frame/saved-game'

import { resumableGame } from './resumable-game'

const today = Temporal.PlainDate.from('2026-10-07')

const saved = (puzzle: SavedGame['puzzle'], savedAtMs: number): SavedGame => ({
  elapsedMs: 1000,
  hintsUsed: 0,
  level: null,
  moves: [],
  puzzle,
  savedAtMs
})

const free = (savedAtMs: number) =>
  saved(freePuzzle({ gameId: 'lights', number: 3, variantId: '3' }), savedAtMs)

const daily = (iso: string, savedAtMs: number) =>
  saved(
    dailyPuzzle({
      day: Temporal.PlainDate.from(iso),
      gameId: 'lights',
      variantId: '4'
    }),
    savedAtMs
  )

describe('resumable game', () => {
  it('[hub] offers nothing when no game waits', () => {
    expect(resumableGame({ saved: [], today })).toBeNull()
  })

  it('[hub] offers the game played last', () => {
    expect(
      resumableGame({ saved: [free(10), daily('2026-10-07', 20)], today })
    ).toEqual(daily('2026-10-07', 20))
    expect(
      resumableGame({ saved: [free(30), daily('2026-10-07', 20)], today })
    ).toEqual(free(30))
  })

  it('[hub] never offers a daily left from an earlier day', () => {
    expect(
      resumableGame({ saved: [free(10), daily('2026-10-06', 99)], today })
    ).toEqual(free(10))
  })
})
