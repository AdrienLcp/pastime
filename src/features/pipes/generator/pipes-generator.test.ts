import { describe, expect, it } from 'vitest'

import { createSeededRandom } from '@/helpers/seeded-random'

import {
  neighbourOf,
  openSidesOf,
  orientationsOf,
  SIDES
} from '../engine/pipes-grid'
import type { PipesLevel } from '../engine/pipes-level'
import { isPipesSolved } from '../engine/pipes-network'
import { PIPES_SIZES } from '../engine/pipes-variants'
import { solvePipes } from '../solver/pipes-solver'
import { generatePipes } from './pipes-generator'
import { growSpanningTree } from './spanning-tree'

const SEEDS_PER_VARIANT = 200

/** Sizes small enough for the plain search below to count solutions on. */
const COUNTED_SIZES = new Set([5, 7, 9])

/**
 * Plain backtracking in reading order, written apart from the solver so it
 * can check it: each tile tried in every orientation that meets its north and
 * west neighbours, a loop cut short as soon as it closes. Counts no further
 * than two.
 */
const countSolutions = ({ size, tiles }: PipesLevel) => {
  const chosen = Array<number>(tiles.length).fill(0)
  const parent = Array.from({ length: tiles.length }, (_, cell) => cell)
  const find = (cell: number): number =>
    parent[cell] === cell ? cell : find(parent[cell] ?? cell)
  let found = 0

  const place = (cell: number) => {
    if (found > 1) return
    if (cell === tiles.length) {
      if (
        isPipesSolved({ level: { size, tiles: chosen }, locked: [], turns: [] })
      )
        found++
      return
    }
    for (const tile of orientationsOf(tiles[cell] ?? 0)) {
      const fits = SIDES.every((side) => {
        const neighbour = neighbourOf({ cell, side, size })
        const isOpen = (tile & side) !== 0
        if (neighbour === null) return !isOpen
        if (neighbour > cell) return true
        const facing = SIDES[(SIDES.indexOf(side) + 2) % 4] ?? side
        return isOpen === (((chosen[neighbour] ?? 0) & facing) !== 0)
      })
      if (!fits) continue
      const saved = [...parent]
      const closesLoop = openSidesOf(tile).some((side) => {
        const neighbour = neighbourOf({ cell, side, size })
        if (neighbour === null || neighbour > cell) return false
        if (find(neighbour) === find(cell)) return true
        parent[find(neighbour)] = find(cell)
        return false
      })
      if (!closesLoop) {
        chosen[cell] = tile
        place(cell + 1)
      }
      parent.splice(0, parent.length, ...saved)
    }
  }

  place(0)
  return found
}

describe('pipes generator', () => {
  it.each(Object.keys(PIPES_SIZES))(
    '[pipes] prints only grids with one solution, found without guessing (%s)',
    (variantId) => {
      for (let seed = 0; seed < SEEDS_PER_VARIANT; seed++) {
        const generated = generatePipes({
          random: createSeededRandom(seed),
          variantId
        })
        expect(generated.status).toBe('success')
        if (generated.status === 'failure') continue
        const { level } = generated.data
        const solution = solvePipes(level)
        expect(solution.isSolved).toBe(true)
        const solved = solution.tiles.map((tile) => tile ?? 0)
        expect(
          isPipesSolved({
            level: { ...level, tiles: solved },
            locked: [],
            turns: []
          })
        ).toBe(true)
        expect(solved.every((tile, cell) => tile !== level.tiles[cell])).toBe(
          true
        )
        if (COUNTED_SIZES.has(level.size)) expect(countSolutions(level)).toBe(1)
      }
    },
    300_000
  )

  it.each(Object.values(PIPES_SIZES))(
    '[pipes] grows a tree over every tile, without a loop (%i)',
    (size) => {
      for (let seed = 0; seed < SEEDS_PER_VARIANT; seed++) {
        const tiles = growSpanningTree({
          random: createSeededRandom(seed),
          size
        })
        expect(
          isPipesSolved({ level: { size, tiles }, locked: [], turns: [] })
        ).toBe(true)
      }
    }
  )

  it('[pipes] prints the same grid from the same seed', () => {
    const draw = () =>
      generatePipes({ random: createSeededRandom(96), variantId: '9' })
    expect(draw()).toEqual(draw())
  })

  it('[pipes] gives up on a variant it does not print', () => {
    expect(
      generatePipes({ random: createSeededRandom(1), variantId: '8' }).status
    ).toBe('failure')
  })
})
