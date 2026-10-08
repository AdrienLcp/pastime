import { describe, expect, it } from 'vitest'

import { stateOf } from '../stars-test-grid'
import { conflictsOf, ruledOutCellsOf } from './stars-conflicts'
import { starsEngine } from './stars-engine'
import type { StarsMove, StarsState } from './stars-state'

const REGIONS = ['AABBB', 'CCCBB', 'CCCCB', 'DEEEE', 'DEEEE']

/** The one solution of `REGIONS`. */
const SOLVED = ['.*...', '....*', '..*..', '*....', '...*.']

const drawn = (marks: string[]) =>
  stateOf(REGIONS.map((regions, row) => `${regions} ${marks[row]}`))

const play = (state: StarsState, move: StarsMove): StarsState => {
  const played = starsEngine.applyMove(state, move)
  if (played.status === 'failure') throw new Error('refused')
  return played.data.board
}

const BLANK = ['.....', '.....', '.....', '.....', '.....']

describe('stars engine', () => {
  it('[stars] cycles a tapped cell blank, cross, star, blank', () => {
    const tapped = (state: StarsState) =>
      play(state, { cell: 6, kind: 'cycle' })
    const once = tapped(drawn(BLANK))
    expect(once.marks[6]).toBe('cross')
    expect(tapped(once).marks[6]).toBe('star')
    expect(tapped(tapped(once)).marks[6]).toBe('blank')
  })

  it('[stars] crosses a tapped cell, and rubs out a crossed or starred one', () => {
    const crossed = play(drawn(BLANK), { cell: 6, kind: 'cross' })
    expect(crossed.marks[6]).toBe('cross')
    expect(play(crossed, { cell: 6, kind: 'cross' }).marks[6]).toBe('blank')
    const starred = play(drawn(BLANK), { cell: 6, kind: 'star' })
    expect(play(starred, { cell: 6, kind: 'cross' }).marks[6]).toBe('blank')
  })

  it('[stars] stars a double-tapped or long-pressed cell, and rubs out a starred one', () => {
    const starred = play(drawn(BLANK), { cell: 6, kind: 'star' })
    expect(starred.marks[6]).toBe('star')
    expect(play(starred, { cell: 6, kind: 'star' }).marks[6]).toBe('blank')
  })

  it('[stars] crosses every cell a drag runs over, leaving stars alone', () => {
    const state = drawn(['.*...', '.....', '.....', '.....', '.....'])
    const dragged = play(state, {
      cells: [0, 1, 2],
      kind: 'mark',
      mark: 'cross'
    })
    expect(dragged.marks.slice(0, 3)).toEqual(['cross', 'star', 'cross'])
  })

  it('[stars] refuses a move that changes nothing, or leaves the board', () => {
    const state = drawn(['.*...', '.....', '.....', '.....', '.....'])
    expect(
      starsEngine.applyMove(state, { cells: [1], kind: 'mark', mark: 'cross' })
        .status
    ).toBe('failure')
    expect(
      starsEngine.applyMove(state, { cell: 25, kind: 'cycle' }).status
    ).toBe('failure')
  })

  it('[stars] names touching stars and a crowded row', () => {
    const state = drawn(['.*.*.', '..*..', '.....', '.....', '.....'])
    expect(conflictsOf(state)).toEqual([
      { cells: [1, 7], kind: 'touching' },
      { cells: [3, 7], kind: 'touching' },
      { cells: [1, 3], kind: 'row' }
    ])
  })

  it('[stars] rules out the neighbours of a star and the rest of its full units', () => {
    const state = drawn(['.*...', '.....', '.....', '.....', '.....'])
    expect([...ruledOutCellsOf(state)].toSorted((a, b) => a - b)).toEqual([
      0, 2, 3, 4, 5, 6, 7, 11, 16, 21
    ])
  })

  it('[stars] is won once every unit holds its star, none touching', () => {
    expect(starsEngine.isWon(drawn(SOLVED))).toBe(true)
    expect(starsEngine.isWon(drawn([...SOLVED.slice(0, 4), '.....']))).toBe(
      false
    )
  })

  it('[stars] hints a wrong star before anything else', () => {
    const state = drawn(['*....', '.....', '.....', '.....', '.....'])
    expect(starsEngine.hint(state)).toEqual({ cell: 0, kind: 'wrong-star' })
  })

  it('[stars] hints a cross over a star of the solution', () => {
    const state = drawn(['.x...', '.....', '.....', '.....', '.....'])
    expect(starsEngine.hint(state)).toEqual({ cell: 1, kind: 'wrong-cross' })
  })

  it('[stars] hints the first deduction past what the stars rule out', () => {
    const hint = starsEngine.hint(drawn(BLANK))
    expect(hint?.kind === 'step' && hint.step.technique).toBe('confinement')
  })
})
