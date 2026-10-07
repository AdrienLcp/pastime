import { Result } from '@adrienlcp/result'

import type { LevelGenerator } from '@/features/game-frame/generator/serve-generator'

import { isDark, type LightsBoard, pressLamp } from '../engine/lights-engine'
import { solveLights } from '../solver/lights-solver'

export const LIGHTS_SIZES = { '3': 3, '4': 4 } as const

const isLightsSize = (
  variantId: string
): variantId is keyof typeof LIGHTS_SIZES => variantId in LIGHTS_SIZES

/** Fewer presses than this and the puzzle is over before it is noticed. */
const FEWEST_PRESSES = 3

/**
 * Printed backwards from the dark board: a random set of presses lights it, so
 * the same presses put it out again — every level is solvable by construction,
 * and the solver confirms it before the level ships.
 */
export const generateLights: LevelGenerator<LightsBoard> = ({
  random,
  variantId
}) => {
  if (!isLightsSize(variantId)) return Result.failure('gave_up')
  const size = LIGHTS_SIZES[variantId]
  const dark: LightsBoard = { lit: Array(size * size).fill(false), size }
  const presses = random
    .shuffled(dark.lit.map((_, cell) => cell))
    .slice(0, FEWEST_PRESSES + random.below(size * size - FEWEST_PRESSES))
  const level = presses.reduce(pressLamp, dark)
  const solution = solveLights(level)
  return !isDark(level) &&
    solution !== null &&
    solution.length >= FEWEST_PRESSES
    ? Result.success({ level })
    : Result.failure('gave_up')
}
