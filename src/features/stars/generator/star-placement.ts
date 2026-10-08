import type { SeededRandom } from '@/helpers/seeded-random'

/** Past this many tries, the seed is a bad one: the generator gives up on it. */
const PLACEMENT_BUDGET = 20_000

/**
 * A random full solution: one star in every row and column, none touching
 * another, placed row by row with backtracking.
 *
 * @returns The star cells in reading order; `null` when the budget ran out.
 */
export const placeStars = ({
  random,
  size
}: {
  random: SeededRandom
  size: number
}): number[] | null => {
  const columns = Array.from({ length: size }, (_, column) => column)
  const isColumnTaken = Array<boolean>(size).fill(false)
  const rows: number[] = []
  let tries = 0

  const placeRow = (row: number): boolean => {
    if (row === size) return true
    const above = rows[row - 1]
    for (const column of random.shuffled(columns)) {
      if (++tries > PLACEMENT_BUDGET) return false
      const touchesAbove = above !== undefined && Math.abs(above - column) <= 1
      if (isColumnTaken[column] || touchesAbove) continue
      isColumnTaken[column] = true
      rows[row] = column
      if (placeRow(row + 1)) return true
      isColumnTaken[column] = false
    }
    return false
  }

  if (!placeRow(0)) return null
  return rows.map((column, row) => row * size + column)
}
