import { describe, expect, it } from 'vitest'

import { createSeededRandom } from '@/helpers/seeded-random'

import { areTouching } from '../engine/stars-grid'
import type { StarsPuzzle } from '../engine/stars-level'
import { STARS_VARIANTS } from '../engine/stars-variants'
import { solveStars } from '../solver/stars-solver'
import { generateStars } from './stars-generator'

/** Fewer seeds on the large grids, whose generation and brute-force check take longer. */
const seedsFor = (size: number) => (size <= 10 ? 200 : 30)

/**
 * Plain backtracking, row by row, written apart from the solver so it can
 * check it: how many solutions the puzzle has, counting no further than two.
 */
const countSolutions = ({ regions, size }: StarsPuzzle) => {
  const isColumnTaken = Array<boolean>(size).fill(false)
  const isRegionTaken = Array<boolean>(size).fill(false)
  const stars: number[] = []
  let found = 0

  const placeInRow = (row: number) => {
    if (found > 1) return
    if (row === size) {
      found++
      return
    }
    for (let column = 0; column < size; column++) {
      const cell = row * size + column
      const region = regions[cell] ?? 0
      const fits =
        !isColumnTaken[column] &&
        !isRegionTaken[region] &&
        stars.every((star) => !areTouching({ first: star, second: cell, size }))
      if (!fits) continue
      isColumnTaken[column] = true
      isRegionTaken[region] = true
      stars.push(cell)
      placeInRow(row + 1)
      stars.pop()
      isColumnTaken[column] = false
      isRegionTaken[region] = false
    }
  }

  placeInRow(0)
  return found
}

describe('stars generator', () => {
  it.each(Object.entries(STARS_VARIANTS))(
    '[stars] prints only grids with one solution, found without guessing (%s)',
    (variantId, { size }) => {
      for (let seed = 0; seed < seedsFor(size); seed++) {
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
      generateStars({ random: createSeededRandom(1), variantId: '16' }).status
    ).toBe('failure')
  })
})
