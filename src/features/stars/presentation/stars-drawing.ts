import { columnOf, rowOf } from '../engine/stars-grid'
import type { StarsPuzzle } from '../engine/stars-level'
import { sideNeighboursOf } from '../generator/region-growth'

/** A cell's side, in board units; the 5-unit frame sits around the cells. */
export const CELL_UNITS = 44

export const REGION_PATTERNS = [
  'dots',
  'hatch',
  'lines',
  'cross-hatch',
  'back-hatch',
  'big-dots',
  'columns'
] as const

export type RegionPattern = (typeof REGION_PATTERNS)[number]

/** How a region is printed: one of four tints, and a pattern or none. */
export type RegionLook = {
  readonly tint: 1 | 2 | 3 | 4
  readonly pattern: RegionPattern | null
}

const TINTS = [1, 2, 3, 4] as const
const PATTERNS = [null, ...REGION_PATTERNS] as const

const bordersOf = ({ regions, size }: StarsPuzzle): Set<number>[] => {
  const borders = Array.from({ length: size }, () => new Set<number>())
  for (const [cell, region] of regions.entries())
    for (const neighbour of sideNeighboursOf({ cell, size })) {
      const other = regions[neighbour]
      if (other !== undefined && other !== region) borders[region]?.add(other)
    }
  return borders
}

/**
 * Picks for each region, in turn, the option its painted neighbours use least,
 * then the one used least overall: neighbours differ wherever the options allow.
 */
const paintApart = <Option>({
  borders,
  options
}: {
  borders: readonly Set<number>[]
  options: readonly [Option, ...Option[]]
}): Option[] => {
  const painted: Option[] = []
  for (const [region, neighbours] of borders.entries()) {
    const usesOf = (option: Option, among: Iterable<number>) =>
      [...among].filter((other) => painted[other] === option).length
    const ranked = options.toSorted(
      (first, second) =>
        usesOf(first, neighbours) - usesOf(second, neighbours) ||
        usesOf(first, painted.keys()) - usesOf(second, painted.keys())
    )
    painted[region] = ranked[0] ?? options[0]
  }
  return painted
}

/** Every region's tint and pattern, neighbours told apart by both. */
export const regionLooksOf = (puzzle: StarsPuzzle): RegionLook[] => {
  const borders = bordersOf(puzzle)
  const tints = paintApart({ borders, options: TINTS })
  const patterns = paintApart({ borders, options: PATTERNS })
  return borders.map((_, region) => ({
    pattern: patterns[region] ?? null,
    tint: tints[region] ?? 1
  }))
}

/** The grid's lines: thin inside a region, heavy between two. */
export const gridLinesOf = ({ regions, size }: StarsPuzzle) => {
  let thin = ''
  let heavy = ''
  for (let cell = 0; cell < size * size; cell++) {
    const x = columnOf({ cell, size }) * CELL_UNITS
    const y = rowOf({ cell, size }) * CELL_UNITS
    if (columnOf({ cell, size }) < size - 1) {
      const line = `M${x + CELL_UNITS} ${y}V${y + CELL_UNITS}`
      if (regions[cell] === regions[cell + 1]) thin += line
      else heavy += line
    }
    if (rowOf({ cell, size }) < size - 1) {
      const line = `M${x} ${y + CELL_UNITS}H${x + CELL_UNITS}`
      if (regions[cell] === regions[cell + size]) thin += line
      else heavy += line
    }
  }
  return { heavy, thin }
}

/** Every cell of a grid, in reading order. */
export const cellsOf = (size: number): number[] =>
  Array.from({ length: size * size }, (_, cell) => cell)

export const cellCentre = ({ cell, size }: { cell: number; size: number }) => ({
  x: columnOf({ cell, size }) * CELL_UNITS + CELL_UNITS / 2,
  y: rowOf({ cell, size }) * CELL_UNITS + CELL_UNITS / 2
})
