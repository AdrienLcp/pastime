import { describe, expect, it } from 'vitest'

import { createSeededRandom } from '@/helpers/seeded-random'

import { DECK_SIZE } from '../engine/playing-card'
import { autoCompleteMoveOf } from '../engine/solitaire-auto-complete'
import { dealKlondike } from '../engine/solitaire-deal'
import type { SolitaireLevel } from '../engine/solitaire-level'
import { applySolitaireMove, isSolitaireWon } from '../engine/solitaire-rules'
import type { SolitaireMove, SolitaireState } from '../engine/solitaire-state'
import { solveSolitaire } from '../solver/solitaire-solver'
import { generateSolitaire, WINNABLE_DEAL_BUDGET } from './solitaire-generator'

const SEEDS = 100

/** More than enough for 52 cards home, each maybe a full turn of the stock away. */
const MOST_AUTO_COMPLETE_MOVES = DECK_SIZE * DECK_SIZE

const replay = (state: SolitaireState, moves: readonly SolitaireMove[]) =>
  moves.reduce<SolitaireState | null>((current, move) => {
    if (current === null) return null
    const played = applySolitaireMove(current, move)
    return played.status === 'success' ? played.data.board : null
  }, state)

const autoCompleted = (state: SolitaireState): SolitaireState => {
  let current = state
  for (let turn = 0; turn < MOST_AUTO_COMPLETE_MOVES; turn++) {
    const move = autoCompleteMoveOf(current)
    if (move === null) return current
    const played = applySolitaireMove(current, move)
    if (played.status === 'failure') return current
    current = played.data.board
  }
  return current
}

const generated = (seed: number, variantId: string): SolitaireLevel | null => {
  const level = generateSolitaire({
    random: createSeededRandom(seed),
    variantId
  })
  return level.status === 'success' ? level.data.level : null
}

describe('solitaire generator', () => {
  it('[solitaire] deals only games the solver wins, its moves then auto-complete', () => {
    for (let seed = 0; seed < SEEDS; seed++) {
      const level = generated(seed, 'winnable')
      expect(level).not.toBeNull()
      if (level === null) continue
      const start = dealKlondike(level)
      const solved = solveSolitaire({
        nodeBudget: WINNABLE_DEAL_BUDGET,
        state: start
      })
      expect(solved.status).toBe('success')
      if (solved.status === 'failure') continue
      const revealed = replay(start, solved.data.moves)
      expect(revealed).not.toBeNull()
      if (revealed === null) continue
      expect(isSolitaireWon(autoCompleted(revealed))).toBe(true)
    }
  }, 120_000)

  it('[solitaire] deals the same game from the same seed', () => {
    expect(generated(42, 'winnable')).toEqual(generated(42, 'winnable'))
    expect(generated(42, 'random')).toEqual(generated(42, 'random'))
  })

  it('[solitaire] deals a random game without searching it', () => {
    expect(generated(7, 'random')?.deck).toHaveLength(DECK_SIZE)
  })

  it('[solitaire] gives up on a variant it does not deal', () => {
    expect(generated(1, 'draw-3')).toBeNull()
  })
})
