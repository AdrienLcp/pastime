import type { SeededRandom } from '@/helpers/seeded-random'

/** Past this many tries, the seed is a bad one: the generator gives up on it. */
const PLACEMENT_BUDGET = 20_000

const columnChoices = ({
  size,
  starsPerUnit
}: {
  size: number
  starsPerUnit: number
}): number[][] => {
  const singles = Array.from({ length: size }, (_, column) => [column])
  if (starsPerUnit === 1) return singles
  return singles.flatMap(([first = 0]) =>
    Array.from({ length: size - first - 2 }, (_, gap) => [
      first,
      first + gap + 2
    ])
  )
}

/**
 * A random full solution: `starsPerUnit` stars in every row and column, none
 * touching another, placed row by row with backtracking.
 *
 * @returns The star cells in reading order; `null` when the budget ran out.
 */
export const placeStars = ({
  random,
  size,
  starsPerUnit
}: {
  random: SeededRandom
  size: number
  starsPerUnit: number
}): number[] | null => {
  const choices = columnChoices({ size, starsPerUnit })
  const starsInColumn = Array<number>(size).fill(0)
  const rows: number[][] = []
  let tries = 0

  const hasRoomLeft = (rowsLeft: number) =>
    starsInColumn.every(
      (stars) => starsPerUnit - stars <= Math.ceil(rowsLeft / 2)
    )

  const fits = (columns: readonly number[], above: readonly number[]) =>
    columns.every(
      (column) =>
        (starsInColumn[column] ?? 0) < starsPerUnit &&
        above.every((other) => Math.abs(other - column) > 1)
    )

  const placeRow = (row: number): boolean => {
    if (row === size) return true
    for (const columns of random.shuffled(choices)) {
      if (++tries > PLACEMENT_BUDGET) return false
      if (!fits(columns, rows[row - 1] ?? [])) continue
      for (const column of columns)
        starsInColumn[column] = (starsInColumn[column] ?? 0) + 1
      rows[row] = columns
      if (hasRoomLeft(size - row - 1) && placeRow(row + 1)) return true
      for (const column of columns)
        starsInColumn[column] = (starsInColumn[column] ?? 0) - 1
    }
    return false
  }

  if (!placeRow(0)) return null
  return rows.flatMap((columns, row) =>
    columns.map((column) => row * size + column)
  )
}
