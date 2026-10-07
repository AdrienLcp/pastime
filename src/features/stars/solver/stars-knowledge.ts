import type { StarsGrid, StarsUnit } from '../engine/stars-grid'

/** What is known of each cell: still open, a star, or certainly no star. */
export const CELL_OPEN = 0
export const CELL_STAR = 1
export const CELL_NO_STAR = 2

export type CellKnowledge =
  | typeof CELL_OPEN
  | typeof CELL_STAR
  | typeof CELL_NO_STAR

/** One `CellKnowledge` per cell, in reading order; the solver writes into it. */
export type Knowledge = Uint8Array

export const openCellsOf = (
  cells: readonly number[],
  knowledge: Knowledge
): number[] => cells.filter((cell) => knowledge[cell] === CELL_OPEN)

export const starsIn = (cells: readonly number[], knowledge: Knowledge) =>
  cells.reduce(
    (count, cell) => (knowledge[cell] === CELL_STAR ? count + 1 : count),
    0
  )

/** How many stars the unit still lacks. */
export const missingStarsOf = ({
  grid,
  knowledge,
  unit
}: {
  grid: StarsGrid
  knowledge: Knowledge
  unit: StarsUnit
}): number => grid.starsPerUnit - starsIn(unit.cells, knowledge)

/**
 * Whether `count` stars still fit among these cells, none touching another.
 * A unit never lacks more than two, and two cells that do not touch exist
 * unless every cell sits inside one 2×2 square.
 */
export const canHoldStars = ({
  cells,
  count,
  size
}: {
  cells: readonly number[]
  count: number
  size: number
}): boolean => {
  if (count <= 0) return true
  if (cells.length < count) return false
  if (count === 1) return true
  let firstRow = size
  let lastRow = -1
  let firstColumn = size
  let lastColumn = -1
  for (const cell of cells) {
    const row = Math.floor(cell / size)
    const column = cell % size
    firstRow = Math.min(firstRow, row)
    lastRow = Math.max(lastRow, row)
    firstColumn = Math.min(firstColumn, column)
    lastColumn = Math.max(lastColumn, column)
  }
  return lastRow - firstRow >= 2 || lastColumn - firstColumn >= 2
}

export const isDecided = (knowledge: Knowledge): boolean =>
  knowledge.every((cell) => cell !== CELL_OPEN)
