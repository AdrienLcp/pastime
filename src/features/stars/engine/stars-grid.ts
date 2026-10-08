import type { StarsPuzzle } from './stars-level'

export type StarsUnitKind = 'row' | 'column' | 'region'

/** A row, a column or a region: a set of cells that holds exactly one star. */
export type StarsUnit = {
  readonly kind: StarsUnitKind
  readonly index: number
  readonly cells: readonly number[]
}

/** A puzzle's geometry, worked out once: its units and every cell's neighbours. */
export type StarsGrid = {
  readonly size: number
  /** Rows, then columns, then regions. */
  readonly units: readonly StarsUnit[]
  /** For every cell, its row, column and region, as positions in `units`. */
  readonly unitsOfCell: readonly (readonly number[])[]
  /** For every cell, the up to eight cells that touch it, diagonals included. */
  readonly neighbours: readonly (readonly number[])[]
}

export const rowOf = ({ cell, size }: { cell: number; size: number }) =>
  Math.floor(cell / size)

export const columnOf = ({ cell, size }: { cell: number; size: number }) =>
  cell % size

export const areTouching = ({
  first,
  second,
  size
}: {
  first: number
  second: number
  size: number
}): boolean =>
  first !== second &&
  Math.abs(rowOf({ cell: first, size }) - rowOf({ cell: second, size })) <= 1 &&
  Math.abs(
    columnOf({ cell: first, size }) - columnOf({ cell: second, size })
  ) <= 1

const indices = (count: number) => Array.from({ length: count }, (_, i) => i)

const neighboursOf = (cell: number, size: number): number[] => {
  const row = rowOf({ cell, size })
  const column = columnOf({ cell, size })
  const touching: number[] = []
  for (let otherRow = row - 1; otherRow <= row + 1; otherRow++) {
    for (
      let otherColumn = column - 1;
      otherColumn <= column + 1;
      otherColumn++
    ) {
      const isInside =
        otherRow >= 0 &&
        otherRow < size &&
        otherColumn >= 0 &&
        otherColumn < size
      const isSelf = otherRow === row && otherColumn === column
      if (isInside && !isSelf) touching.push(otherRow * size + otherColumn)
    }
  }
  return touching
}

/** Every cell's neighbours depend on the size alone: worked out once per size. */
const neighboursBySize = new Map<number, readonly (readonly number[])[]>()

const neighboursOfEveryCell = (size: number) => {
  const known = neighboursBySize.get(size)
  if (known !== undefined) return known
  const neighbours = indices(size * size).map((cell) =>
    neighboursOf(cell, size)
  )
  neighboursBySize.set(size, neighbours)
  return neighbours
}

const buildGrid = ({ regions, size }: StarsPuzzle): StarsGrid => {
  const cells = indices(size * size)
  const regionCells = indices(size).map((): number[] => [])
  for (const cell of cells) regionCells[regions[cell] ?? 0]?.push(cell)
  const units: StarsUnit[] = [
    ...indices(size).map((row) => ({
      cells: indices(size).map((column) => row * size + column),
      index: row,
      kind: 'row' as const
    })),
    ...indices(size).map((column) => ({
      cells: indices(size).map((row) => row * size + column),
      index: column,
      kind: 'column' as const
    })),
    ...indices(size).map((region) => ({
      cells: regionCells[region] ?? [],
      index: region,
      kind: 'region' as const
    }))
  ]
  return {
    neighbours: neighboursOfEveryCell(size),
    size,
    units,
    unitsOfCell: cells.map((cell) => [
      rowOf({ cell, size }),
      size + columnOf({ cell, size }),
      2 * size + (regions[cell] ?? 0)
    ])
  }
}

const grids = new WeakMap<StarsPuzzle, StarsGrid>()

/** The grid of a puzzle, built on first use and kept while the puzzle lives. */
export const gridOf = (puzzle: StarsPuzzle): StarsGrid => {
  const known = grids.get(puzzle)
  if (known !== undefined) return known
  const grid = buildGrid(puzzle)
  grids.set(puzzle, grid)
  return grid
}
