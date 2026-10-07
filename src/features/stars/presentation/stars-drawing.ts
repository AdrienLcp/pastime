import { createSeededRandom } from '@/helpers/seeded-random'

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

const round = (value: number) => Math.round(value * 10) / 10

/** Every cell of a grid, in reading order. */
export const cellsOf = (size: number): number[] =>
  Array.from({ length: size * size }, (_, cell) => cell)

export const cellCentre = ({ cell, size }: { cell: number; size: number }) => ({
  x: columnOf({ cell, size }) * CELL_UNITS + CELL_UNITS / 2,
  y: rowOf({ cell, size }) * CELL_UNITS + CELL_UNITS / 2
})

/** A five-point star drawn in one stroke, wobbling the same way every time for one seed. */
export const pencilStarPath = ({
  radius,
  seed,
  x,
  y
}: {
  radius: number
  seed: number
  x: number
  y: number
}): string => {
  const random = createSeededRandom(seed)
  const wobble = () => random.next() - 0.5
  const tips = Array.from({ length: 5 }, (_, tip) => {
    const angle = ((-90 + tip * 72 + wobble() * 7) * Math.PI) / 180
    const reach = radius * (0.9 + random.next() * 0.18)
    return { x: x + reach * Math.cos(angle), y: y + reach * Math.sin(angle) }
  })
  const strokeOrder = [0, 2, 4, 1, 3, 0]
  const points = strokeOrder.map((tip) => tips[tip] ?? { x, y })
  const last = points.length - 1
  return points
    .map((point, index) => {
      const overshoot =
        index === last
          ? { x: wobble() * 3, y: 1 + random.next() * 2 }
          : { x: 0, y: 0 }
      return `${index === 0 ? 'M' : 'L'}${round(point.x + overshoot.x)} ${round(point.y + overshoot.y)}`
    })
    .join('')
}

/** Two quick strokes, a little off each time. */
export const pencilCrossPath = ({
  reach,
  seed,
  x,
  y
}: {
  reach: number
  seed: number
  x: number
  y: number
}): string => {
  const random = createSeededRandom(seed)
  const jitter = () => round((random.next() - 0.5) * 2.4)
  const at = (dx: number, dy: number) =>
    `${round(x + dx * reach + jitter())} ${round(y + dy * reach + jitter())}`
  return `M${at(-1, -1)}L${at(1, 1)}M${at(1, -1)}L${at(-1, 1)}`
}

/** A loop drawn round a point, overshooting where it closes, as a pencil does. */
export const pencilLoopPath = ({
  radiusX,
  radiusY,
  seed,
  tilt,
  x,
  y
}: {
  radiusX: number
  radiusY: number
  seed: number
  tilt: number
  x: number
  y: number
}): string => {
  const random = createSeededRandom(seed)
  const start = -2.2 + random.next() * 0.4
  const steps = 54
  const turns = 1.14
  const cos = Math.cos(tilt)
  const sin = Math.sin(tilt)
  return Array.from({ length: steps + 1 }, (_, step) => {
    const angle = start + (step / steps) * Math.PI * 2 * turns
    const swell = 1 + (random.next() - 0.5) * 0.05 + (step / steps) * 0.06
    const dx = radiusX * swell * Math.cos(angle)
    const dy = radiusY * swell * Math.sin(angle)
    return `${step === 0 ? 'M' : 'L'}${round(x + dx * cos - dy * sin)} ${round(y + dx * sin + dy * cos)}`
  }).join('')
}
