import { Result } from '@adrienlcp/result'

import type { LevelGenerator } from '@/features/game-frame/generator/serve-generator'
import type { SeededRandom } from '@/helpers/seeded-random'

import { FRESH_DECK } from '../engine/playing-card'
import { dealKlondike } from '../engine/solitaire-deal'
import type { SolitaireLevel } from '../engine/solitaire-level'
import { isSolitaireVariantId } from '../engine/solitaire-variants'
import { solveSolitaire } from '../solver/solitaire-solver'

/**
 * Positions searched per deal. On 50 deals it solves 29, the slowest in 27 ms;
 * 8000 solves only three more, twenty times slower. A deal it does not solve
 * in time is set aside for the next one rather than searched longer.
 */
export const WINNABLE_DEAL_BUDGET = 500

/** Deals shuffled from one seed before the seed is given up on. */
const DEALS_PER_SEED = 8

const shuffledDeal = (random: SeededRandom): SolitaireLevel => ({
  deck: random.shuffled(FRESH_DECK),
  draw: 1
})

const isWinnable = (level: SolitaireLevel): boolean =>
  solveSolitaire({
    nodeBudget: WINNABLE_DEAL_BUDGET,
    state: dealKlondike(level)
  }).status === 'success'

/**
 * A Klondike deal, drawing one card at a time. A winnable one is shuffled
 * again until the solver finds a way through it; a random one is the first
 * shuffle, winnable or not.
 */
export const generateSolitaire: LevelGenerator<SolitaireLevel> = ({
  random,
  variantId
}) => {
  if (!isSolitaireVariantId(variantId)) return Result.failure('gave_up')
  if (variantId === 'random')
    return Result.success({ level: shuffledDeal(random) })
  for (let attempt = 0; attempt < DEALS_PER_SEED; attempt++) {
    const level = shuffledDeal(random)
    if (isWinnable(level)) return Result.success({ level })
  }
  return Result.failure('gave_up')
}
