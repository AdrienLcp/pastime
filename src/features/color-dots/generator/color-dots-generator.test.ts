import { describe, expect, it } from 'vitest'

import { createSeededRandom } from '@/helpers/seeded-random'

import { colorDotsLevelSchema } from '../engine/color-dots-level'
import { startColorDots } from '../engine/color-dots-state'
import { countTraps, createColorDotsSolver } from '../solver/color-dots-solver'
import { generateColorDots } from './color-dots-generator'
import type { ColorDotsTierId } from './color-dots-tiers'

const SEEDS = 200

/** Generates and solves 200 levels: about 90 s alone, over 120 s beside a busy machine's other jobs. */
const TWO_HUNDRED_LEVELS_TIMEOUT_MS = 300_000

const TIERS: readonly ColorDotsTierId[] = ['easy', 'hard', 'expert']

describe('generateColorDots', () => {
  it(
    '[color-dots] prints valid levels that the solver clears, over 200 seeds across the tiers',
    () => {
      for (let seed = 0; seed < SEEDS; seed++) {
        const variantId = TIERS[seed % TIERS.length] ?? 'easy'
        const generated = generateColorDots({
          random: createSeededRandom(seed),
          variantId
        })
        if (generated.status === 'failure')
          throw new Error(`seed ${seed} (${variantId}) gave up`)
        const { level } = generated.data
        expect(
          colorDotsLevelSchema.safeParse(level).success,
          `seed ${seed} (${variantId})`
        ).toBe(true)
        const solution = createColorDotsSolver(level).solve(
          startColorDots(level).spots
        )
        expect(solution.kind, `seed ${seed} (${variantId})`).toBe('solved')
      }
    },
    TWO_HUNDRED_LEVELS_TIMEOUT_MS
  )

  it('[color-dots] makes each tier larger and harder than the one before it', () => {
    const trapsOf = (variantId: ColorDotsTierId) => {
      const generated = generateColorDots({
        random: createSeededRandom(7),
        variantId
      })
      if (generated.status === 'failure') throw new Error('gave up')
      const { level } = generated.data
      const solver = createColorDotsSolver(level)
      const { spots } = startColorDots(level)
      const solution = solver.solve(spots)
      const order = solution.kind === 'solved' ? solution.order : []
      return {
        nodes: level.nodes.length,
        traps: countTraps({ order, solver, spots, tree: level })
      }
    }
    const easy = trapsOf('easy')
    const hard = trapsOf('hard')
    const expert = trapsOf('expert')
    expect(hard.nodes).toBeGreaterThan(easy.nodes)
    expect(expert.nodes).toBeGreaterThan(hard.nodes)
    expect(hard.traps).toBeGreaterThan(easy.traps)
    expect(expert.traps).toBeGreaterThan(hard.traps)
  })

  it('[color-dots] gives up on a variant it does not know', () => {
    expect(
      generateColorDots({ random: createSeededRandom(1), variantId: 'boss' })
        .status
    ).toBe('failure')
  })
})
