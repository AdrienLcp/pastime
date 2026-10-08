import { Result } from '@adrienlcp/result'

import type { LevelGenerator } from '@/features/game-frame/generator/serve-generator'
import type { SeededRandom } from '@/helpers/seeded-random'

import type { StarsLevel } from '../engine/stars-level'
import { isStarsVariantId, STARS_VARIANTS } from '../engine/stars-variants'
import type { StarsTechnique } from '../solver/stars-technique'
import { growRegions } from './region-growth'
import { reshapeRegions } from './region-reshape'
import { placeStars } from './star-placement'

/** Cells handed from region to region before the regions are grown afresh. */
const RESHAPE_BUDGET = 3000

/** Fresh grids drawn from one seed before the seed is given up on. */
const GRIDS_PER_SEED = 4

const drawGrid = ({
  hardestAtLeast,
  random,
  size
}: {
  hardestAtLeast: StarsTechnique
  random: SeededRandom
  size: number
}): StarsLevel | null => {
  const stars = placeStars({ random, size })
  if (stars === null) return null
  const regions = growRegions({ random, seeds: stars, size })
  const reshaped = reshapeRegions({
    budget: RESHAPE_BUDGET,
    hardestAtLeast,
    puzzle: { regions, size },
    random,
    stars: new Set(stars)
  })
  if (reshaped === null) return null
  return {
    difficulty: reshaped.hardest,
    regions: reshaped.regions,
    size
  }
}

/**
 * A random solution first, then regions grown around its stars, reshaped
 * until logic alone solves the grid: every printed level has one solution and
 * never needs a guess.
 */
export const generateStars: LevelGenerator<StarsLevel> = ({
  random,
  variantId
}) => {
  if (!isStarsVariantId(variantId)) return Result.failure('gave_up')
  const variant = STARS_VARIANTS[variantId]
  for (let attempt = 0; attempt < GRIDS_PER_SEED; attempt++) {
    const level = drawGrid({ ...variant, random })
    if (level !== null) return Result.success({ level })
  }
  return Result.failure('gave_up')
}
