import { describe, expect, it } from 'vitest'

import { createSeededRandom } from '@/helpers/seeded-random'

import { colorDotsLevelSchema } from '../engine/color-dots-level'
import { startColorDots } from '../engine/color-dots-state'
import { countTraps, createColorDotsSolver } from '../solver/color-dots-solver'
import { generateColorDots } from './color-dots-generator'
import {
  BOSS_VARIANT,
  NUMBERED_VARIANT,
  recipeOf
} from './color-dots-progression'

const SEEDS = 200

describe('generateColorDots', () => {
  it('[color-dots] prints valid levels that the solver clears, over 200 seeds', () => {
    for (let seed = 0; seed < SEEDS; seed++) {
      const generated = generateColorDots({
        number: 1 + (seed % 13),
        random: createSeededRandom(seed),
        variantId: NUMBERED_VARIANT
      })
      if (generated.status === 'failure')
        throw new Error(`seed ${seed} gave up`)
      const { level } = generated.data
      expect(
        colorDotsLevelSchema.safeParse(level).success,
        `seed ${seed}`
      ).toBe(true)
      const solution = createColorDotsSolver(level).solve(
        startColorDots(level).spots
      )
      expect(solution.kind, `seed ${seed}`).toBe('solved')
    }
  }, 120_000)

  it('[color-dots] makes a boss larger and harder than the level before it', () => {
    const trapsOf = (number: number, variantId: string) => {
      const generated = generateColorDots({
        number,
        random: createSeededRandom(number),
        variantId
      })
      if (generated.status === 'failure') throw new Error('gave up')
      const { level } = generated.data
      const solver = createColorDotsSolver(level)
      const { spots } = startColorDots(level)
      const solution = solver.solve(spots)
      const order = solution.kind === 'solved' ? solution.order : []
      return { level, traps: countTraps({ order, solver, spots, tree: level }) }
    }
    const first = trapsOf(1, NUMBERED_VARIANT)
    const boss = trapsOf(280, BOSS_VARIANT)
    expect(boss.level.boss).toBe(true)
    expect(boss.level.nodes.length).toBeGreaterThan(first.level.nodes.length)
    expect(boss.traps).toBeGreaterThan(first.traps)
  })

  it('[color-dots] keeps two hard levels then a boss after the opening ten', () => {
    const bosses = Array.from({ length: 12 }, (_, index) => index + 1).filter(
      (number) => recipeOf({ number, variantId: NUMBERED_VARIANT }).boss
    )
    expect(bosses).toEqual([10])
    expect(
      [13, 14, 15, 16].map(
        (number) => recipeOf({ number, variantId: NUMBERED_VARIANT }).boss
      )
    ).toEqual([true, false, false, true])
  })
})
