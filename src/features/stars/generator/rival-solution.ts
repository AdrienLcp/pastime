import type { SeededRandom } from '@/helpers/seeded-random'

import type { StarsPuzzle } from '../engine/stars-level'
import { CELL_NO_STAR, type Knowledge } from '../solver/stars-knowledge'

/** Past this many placements tried, the search stops: no rival is named. */
const SEARCH_BUDGET = 20_000

/**
 * Another solution than the printed one, among what logic has left open: one
 * star per row, column and region, none touching. Its stars the printed
 * solution lacks show where the regions let a wrong grid through.
 *
 * @returns The rival's star cells; `null` when none exists or the search ran
 * out of budget.
 */
export const findRivalSolution = ({
  knowledge,
  puzzle,
  random,
  stars
}: {
  knowledge: Knowledge
  puzzle: StarsPuzzle
  random: SeededRandom
  stars: ReadonlySet<number>
}): number[] | null => {
  const { regions, size } = puzzle
  const columnTaken = new Uint8Array(size)
  const regionTaken = new Uint8Array(size)
  const chosen: number[] = []
  const columnOrder = Array.from({ length: size }, () =>
    random.shuffled(Array.from({ length: size }, (_, column) => column))
  )
  let tries = 0

  const placeRow = (row: number, differs: boolean): boolean => {
    if (row === size) return differs
    const above = chosen[row - 1]
    for (const column of columnOrder[row] ?? []) {
      if (++tries > SEARCH_BUDGET) return false
      const cell = row * size + column
      const region = regions[cell] ?? 0
      if (
        columnTaken[column] === 1 ||
        regionTaken[region] === 1 ||
        knowledge[cell] === CELL_NO_STAR ||
        (above !== undefined && Math.abs((above % size) - column) <= 1)
      )
        continue
      columnTaken[column] = 1
      regionTaken[region] = 1
      chosen[row] = cell
      if (placeRow(row + 1, differs || !stars.has(cell))) return true
      columnTaken[column] = 0
      regionTaken[region] = 0
    }
    return false
  }

  return placeRow(0, false) ? chosen.slice(0, size) : null
}
