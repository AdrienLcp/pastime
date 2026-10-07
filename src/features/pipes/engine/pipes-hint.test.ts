import { describe, expect, it } from 'vitest'

import { createSeededRandom } from '@/helpers/seeded-random'

import { generatePipes } from '../generator/pipes-generator'
import { solvePipes } from '../solver/pipes-solver'
import { pipesEngine, startPipes } from './pipes-engine'
import { currentTilesOf } from './pipes-network'
import type { PipesMove, PipesState } from './pipes-state'

const printed = () => {
  const generated = generatePipes({
    random: createSeededRandom(7),
    variantId: '7'
  })
  if (generated.status === 'failure') throw new Error('no level')
  return generated.data.level
}

const play = (state: PipesState, move: PipesMove): PipesState => {
  const played = pipesEngine.applyMove(state, move)
  if (played.status === 'failure') throw new Error('refused')
  return played.data.board
}

describe('pipes hint', () => {
  it('[pipes] points at a tile logic settles, still facing the wrong way', () => {
    const level = printed()
    const start = startPipes(level)
    const hint = pipesEngine.hint(start)
    expect(hint?.kind).toBe('forced')
    const solution = solvePipes(level).tiles
    const cell = hint?.cell ?? -1
    expect(currentTilesOf(start)[cell]).not.toBe(solution[cell])
  })

  it('[pipes] names a tile locked the wrong way first', () => {
    const locked = play(startPipes(printed()), { cell: 3, kind: 'lock' })
    expect(pipesEngine.hint(locked)).toEqual({ cell: 3, kind: 'wrong-lock' })
  })
})
