import { describe, expect, it } from 'vitest'

import { marksAfter, starsEngine, startStars } from '../engine/stars-engine'
import type { StarsLevel } from '../engine/stars-level'
import type { StarsMark, StarsMove } from '../engine/stars-state'
import {
  DOUBLE_TAP_MS,
  type PendingTap,
  settledTap,
  tapCell
} from './cell-taps'

const LEVEL: StarsLevel = {
  difficulty: 'single',
  regions: [0, 0, 1, 1],
  size: 2,
  starsPerUnit: 1
}

/** Taps at the given times, then lets the last window close: every move played, in order. */
const playedMoves = (taps: readonly { cell: number; at: number }[]) => {
  let pending: PendingTap | null = null
  const moves: StarsMove[] = []
  for (const tap of taps) {
    const outcome = tapCell({ ...tap, pending })
    moves.push(...outcome.moves)
    pending = outcome.pending
  }
  return [...moves, ...settledTap(pending)]
}

const marksAfterAll = (
  start: readonly StarsMark[],
  moves: readonly StarsMove[]
) =>
  moves.reduce<readonly StarsMark[]>(
    (marks, move) => marksAfter(marks, move),
    start
  )

const BLANK = startStars(LEVEL).marks

describe('cell taps', () => {
  it('[stars] crosses a cell on a single tap', () => {
    const moves = playedMoves([{ at: 0, cell: 1 }])
    expect(moves).toEqual([{ cell: 1, kind: 'cross' }])
    expect(marksAfterAll(BLANK, moves)[1]).toBe('cross')
  })

  it('[stars] stars a cell on a double tap, in one move and with no cross left behind', () => {
    const moves = playedMoves([
      { at: 0, cell: 1 },
      { at: DOUBLE_TAP_MS - 1, cell: 1 }
    ])
    expect(moves).toEqual([{ cell: 1, kind: 'star' }])
    expect(marksAfterAll(BLANK, moves)[1]).toBe('star')
  })

  it('[stars] plays the star the moment the second tap lands', () => {
    const first = tapCell({ at: 0, cell: 1, pending: null })
    expect(first.moves).toEqual([])
    const second = tapCell({ at: 120, cell: 1, pending: first.pending })
    expect(second.moves).toEqual([{ cell: 1, kind: 'star' }])
    expect(second.pending).toBeNull()
  })

  it('[stars] rubs out a star on a double tap, and a cross on a single tap', () => {
    const starred = marksAfterAll(BLANK, [{ cell: 0, kind: 'star' }])
    const doubled = playedMoves([
      { at: 0, cell: 0 },
      { at: 100, cell: 0 }
    ])
    expect(marksAfterAll(starred, doubled)[0]).toBe('blank')
    const crossed = marksAfterAll(BLANK, [{ cell: 0, kind: 'cross' }])
    expect(marksAfterAll(crossed, playedMoves([{ at: 0, cell: 0 }]))[0]).toBe(
      'blank'
    )
  })

  it('[stars] turns a cross into a star on a double tap', () => {
    const crossed = marksAfterAll(BLANK, [{ cell: 2, kind: 'cross' }])
    const moves = playedMoves([
      { at: 0, cell: 2 },
      { at: 50, cell: 2 }
    ])
    expect(marksAfterAll(crossed, moves)[2]).toBe('star')
  })

  it('[stars] takes two slow taps as two single taps', () => {
    expect(
      playedMoves([
        { at: 0, cell: 1 },
        { at: DOUBLE_TAP_MS + 1, cell: 1 }
      ])
    ).toEqual([
      { cell: 1, kind: 'cross' },
      { cell: 1, kind: 'cross' }
    ])
  })

  it('[stars] takes quick taps on two cells as a single tap on each, in order', () => {
    expect(
      playedMoves([
        { at: 0, cell: 0 },
        { at: 80, cell: 3 }
      ])
    ).toEqual([
      { cell: 0, kind: 'cross' },
      { cell: 3, kind: 'cross' }
    ])
  })

  it('[stars] gives undo a single move for a double tap', () => {
    let state = startStars(LEVEL)
    let history = 0
    for (const move of playedMoves([
      { at: 0, cell: 3 },
      { at: 90, cell: 3 }
    ])) {
      const played = starsEngine.applyMove(state, move)
      if (played.status === 'success') {
        state = played.data.board
        history++
      }
    }
    expect(history).toBe(1)
    expect(state.marks).toEqual(['blank', 'blank', 'blank', 'star'])
  })
})
