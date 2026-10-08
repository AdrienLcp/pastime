import { describe, expect, it } from 'vitest'

import { createSeededRandom } from '@/helpers/seeded-random'

import type { StarsPuzzle } from '../engine/stars-level'
import { STARS_VARIANTS } from '../engine/stars-variants'
import { generateStars } from '../generator/stars-generator'
import { bordersOf, regionInksOf } from './region-colouring'
import { REGION_INKS } from './region-inks'

const SEEDS_PER_VARIANT = 12

const expectBordersApart = (puzzle: StarsPuzzle, inks: readonly number[]) => {
  for (const [region, neighbours] of bordersOf(puzzle).entries())
    for (const neighbour of neighbours)
      expect(inks[neighbour], `${region} / ${neighbour}`).not.toBe(inks[region])
}

/** A grid of `side` × `side` square regions, each `block` cells wide: `side²` regions on a `block × side` grid. */
const blocksPuzzle = ({
  block,
  side
}: {
  block: number
  side: number
}): StarsPuzzle => {
  const size = block * side
  return {
    regions: Array.from({ length: size * size }, (_, cell) => {
      const row = Math.floor(Math.floor(cell / size) / block)
      const column = Math.floor((cell % size) / block)
      return row * side + column
    }),
    size
  }
}

describe('region colouring', () => {
  it.each(Object.keys(STARS_VARIANTS))(
    '[stars] gives every region of a printed grid its own ink while there are enough (%s)',
    (variantId) => {
      for (let seed = 0; seed < SEEDS_PER_VARIANT; seed++) {
        const generated = generateStars({
          random: createSeededRandom(seed),
          variantId
        })
        if (generated.status === 'failure') continue
        const { level } = generated.data
        const inks = regionInksOf(level)
        expect(new Set(inks).size).toBe(
          Math.min(level.size, REGION_INKS.length)
        )
        expect(inks.every((ink) => ink < REGION_INKS.length)).toBe(true)
        expectBordersApart(level, inks)
      }
    },
    120_000
  )

  it('[stars] still keeps bordering regions apart when there are more regions than inks', () => {
    const puzzle = blocksPuzzle({ block: 4, side: 4 })
    const inks = regionInksOf(puzzle)
    expect(puzzle.size).toBeGreaterThan(REGION_INKS.length)
    expect(inks).toHaveLength(puzzle.size)
    expectBordersApart(puzzle, inks)
  })

  it('[stars] colours the same grid the same way every time', () => {
    const generated = generateStars({
      random: createSeededRandom(7),
      variantId: '15'
    })
    if (generated.status === 'failure') throw new Error('no grid')
    const { level } = generated.data
    expect(regionInksOf(level)).toEqual(regionInksOf(level))
  })
})
