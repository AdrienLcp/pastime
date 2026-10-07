import { describe, expect, it } from 'vitest'

import { createSeededRandom } from '@/helpers/seeded-random'

import { areTouching } from '../engine/stars-grid'
import type { StarsPuzzle } from '../engine/stars-level'
import { STARS_VARIANTS } from '../engine/stars-variants'
import { solveStars } from '../solver/stars-solver'
import { generateStars } from './stars-generator'

const SEEDS_PER_VARIANT = 200

/**
 * Plain backtracking, row by row, written apart from the solver so it can
 * check it: how many solutions the puzzle has, counting no further than two.
 */
const countSolutions = ({ regions, size, starsPerUnit }: StarsPuzzle) => {
  const inColumn = Array<number>(size).fill(0)
  const inRegion = Array<number>(size).fill(0)
  const stars: number[] = []
  let found = 0

  const placeInRow = (row: number, fromColumn: number, placed: number) => {
    if (found > 1) return
    if (placed === starsPerUnit) {
      if (row === size - 1) found++
      else placeInRow(row + 1, 0, 0)
      return
    }
    for (let column = fromColumn; column < size; column++) {
      const cell = row * size + column
      const region = regions[cell] ?? 0
      const fits =
        (inColumn[column] ?? 0) < starsPerUnit &&
        (inRegion[region] ?? 0) < starsPerUnit &&
        stars.every((star) => !areTouching({ first: star, second: cell, size }))
      if (!fits) continue
      inColumn[column] = (inColumn[column] ?? 0) + 1
      inRegion[region] = (inRegion[region] ?? 0) + 1
      stars.push(cell)
      placeInRow(row, column + 1, placed + 1)
      stars.pop()
      inColumn[column] = (inColumn[column] ?? 0) - 1
      inRegion[region] = (inRegion[region] ?? 0) - 1
    }
  }

  placeInRow(0, 0, 0)
  return found
}

describe('stars generator', () => {
  it.each(Object.keys(STARS_VARIANTS))(
    '[stars] prints only grids with one solution, found without guessing (%s)',
    (variantId) => {
      for (let seed = 0; seed < SEEDS_PER_VARIANT; seed++) {
        const generated = generateStars({
          random: createSeededRandom(seed),
          variantId
        })
        if (generated.status === 'failure') continue
        const { level } = generated.data
        const solution = solveStars(level)
        expect(solution.isSolved).toBe(true)
        expect(solution.hardest).toBe(level.difficulty)
        expect(countSolutions(level)).toBe(1)
      }
    },
    300_000
  )

  it('[stars] prints the same grid from the same seed', () => {
    const draw = () =>
      generateStars({ random: createSeededRandom(280), variantId: '8' })
    expect(draw()).toEqual(draw())
  })

  it('[stars] gives up on a variant it does not print', () => {
    expect(
      generateStars({ random: createSeededRandom(1), variantId: '13' }).status
    ).toBe('failure')
  })
})
