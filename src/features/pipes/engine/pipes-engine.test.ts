import { describe, expect, it } from 'vitest'

import { pipesEngine, startPipes } from './pipes-engine'
import { EAST, NORTH, SOUTH, WEST } from './pipes-grid'
import type { PipesLevel } from './pipes-level'
import { currentTilesOf, waterDepthsOf } from './pipes-network'
import type { PipesMove, PipesState } from './pipes-state'

/**
 * A 5×5 solved as a comb: the west column runs top to bottom, every row
 * leaves it eastward to the wall.
 */
const combRow = (spine: number) => [
  spine,
  EAST | WEST,
  EAST | WEST,
  EAST | WEST,
  WEST
]

const SOLVED_COMB = [
  combRow(EAST | SOUTH),
  combRow(NORTH | EAST | SOUTH),
  combRow(NORTH | EAST | SOUTH),
  combRow(NORTH | EAST | SOUTH),
  combRow(NORTH | EAST)
].flat()

const LEVEL: PipesLevel = { size: 5, tiles: SOLVED_COMB }

const play = (state: PipesState, move: PipesMove): PipesState => {
  const played = pipesEngine.applyMove(state, move)
  if (played.status === 'failure') throw new Error('refused')
  return played.data.board
}

const turn = (cell: number, quarterTurns: 1 | 3 = 1): PipesMove => ({
  cell,
  kind: 'turn',
  quarterTurns
})

describe('pipes engine', () => {
  it('[pipes] restores a tile turned four times', () => {
    const start = startPipes(LEVEL)
    const turned = [1, 2, 3, 4].reduce((state) => play(state, turn(7)), start)
    expect(currentTilesOf(turned)).toEqual(currentTilesOf(start))
  })

  it('[pipes] turns a tile back with a quarter anticlockwise', () => {
    const start = startPipes(LEVEL)
    expect(play(play(start, turn(7)), turn(7, 3)).turns).toEqual(start.turns)
  })

  it('[pipes] refuses to turn a locked tile, and frees it on a second lock', () => {
    const locked = play(startPipes(LEVEL), { cell: 7, kind: 'lock' })
    expect(pipesEngine.applyMove(locked, turn(7)).status).toBe('failure')
    const freed = play(locked, { cell: 7, kind: 'lock' })
    expect(pipesEngine.applyMove(freed, turn(7)).status).toBe('success')
  })

  it('[pipes] wins once every tile is joined, with no open end', () => {
    const start = startPipes(LEVEL)
    expect(pipesEngine.isWon(start)).toBe(true)
    expect(pipesEngine.isWon(play(start, turn(0)))).toBe(false)
  })

  it('[pipes] refuses a loop, even with every tile joined', () => {
    const looped = startPipes({
      size: 5,
      tiles: SOLVED_COMB.with(4, WEST | SOUTH).with(9, WEST | NORTH)
    })
    expect(pipesEngine.isWon(looped)).toBe(false)
  })

  it('[pipes] fills water from the source only through joined pipes', () => {
    const start = startPipes(LEVEL)
    expect(
      waterDepthsOf({ level: LEVEL, tiles: currentTilesOf(start) }).size
    ).toBe(25)
    const cut = play(start, turn(12))
    expect(
      waterDepthsOf({ level: LEVEL, tiles: currentTilesOf(cut) }).size
    ).toBeLessThan(25)
  })
})
