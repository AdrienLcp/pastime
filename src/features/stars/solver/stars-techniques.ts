import type { StarsGrid, StarsUnit, StarsUnitKind } from '../engine/stars-grid'
import { CELL_OPEN, CELL_STAR, canHoldStars } from './stars-knowledge'
import type { StarsReason, StarsStep } from './stars-step'
import type { StarsTechnique } from './stars-technique'

/** The grid as it stands, read once per step and shared by every technique. */
export type StarsView = {
  readonly grid: StarsGrid
  /** Per unit, its cells still open. */
  readonly open: readonly (readonly number[])[]
  /** Per unit, the stars it still lacks. */
  readonly missing: readonly number[]
  readonly isStar: (cell: number) => boolean
  readonly isOpen: (cell: number) => boolean
}

/**
 * The steps its technique allows on this grid, each holding on its own, empty
 * when it sees none. The cheap rules return them all; the confinements, whose
 * search is long, stop at the first.
 */
export type StarsTechniqueRule = (view: StarsView) => readonly StarsStep[]

const firstOnly =
  (find: (view: StarsView) => StarsStep | null): StarsTechniqueRule =>
  (view) => {
    const step = find(view)
    return step === null ? [] : [step]
  }

const nextToStar: StarsTechniqueRule = ({ grid, isOpen, isStar }) =>
  grid.units.slice(0, grid.size).flatMap((row) =>
    row.cells.flatMap((cell): StarsStep[] => {
      if (!isStar(cell)) return []
      const touched = (grid.neighbours[cell] ?? []).filter(isOpen)
      if (touched.length === 0) return []
      return [
        {
          cells: touched,
          focus: [cell],
          reason: 'next-to-star',
          technique: 'next-to-star',
          verdict: 'no-star'
        }
      ]
    })
  )

const fullUnit: StarsTechniqueRule = ({ grid, isStar, missing, open }) =>
  grid.units.flatMap((unit, index): StarsStep[] => {
    const cells = open[index] ?? []
    if (cells.length === 0 || (missing[index] ?? 0) > 0) return []
    return [
      {
        cells,
        focus: unit.cells.filter(isStar),
        reason: `full-${unit.kind}`,
        technique: 'full-unit',
        verdict: 'no-star'
      }
    ]
  })

const single: StarsTechniqueRule = ({ grid, missing, open }) =>
  grid.units.flatMap((unit, index): StarsStep[] => {
    const cells = open[index] ?? []
    const lacking = missing[index] ?? 0
    if (lacking === 0 || cells.length !== lacking) return []
    return [
      {
        cells,
        focus: cells,
        reason: `single-${unit.kind}`,
        technique: 'single',
        verdict: 'star'
      }
    ]
  })

/** Past this many cells, two of them surely do not touch. */
const CELLS_IN_TWO_BY_TWO = 4

/**
 * A star on this cell would leave some unit without room for the stars it
 * still lacks: the cell holds none. One placement deep, never further — that
 * would be guessing. Every such cell is returned at once: each holds on the
 * same grid, and testing them is the solver's dearest work.
 */
const touching: StarsTechniqueRule = ({ grid, isOpen, missing, open }) => {
  const cellCount = grid.size * grid.size
  const ruledOutBy = new Int32Array(cellCount).fill(-1)
  const touchedBy = new Int32Array(grid.units.length).fill(-1)
  const ruledOutIn = new Int32Array(grid.units.length)
  const touchedUnits: number[] = []
  const steps: StarsStep[] = []

  for (let cell = 0; cell < cellCount; cell++) {
    if (!isOpen(cell)) continue
    const unitsOfCell = grid.unitsOfCell[cell] ?? []
    touchedUnits.length = 0
    const ruleOut = (other: number) => {
      if (ruledOutBy[other] === cell || !isOpen(other)) return
      ruledOutBy[other] = cell
      for (const unit of grid.unitsOfCell[other] ?? []) {
        if (touchedBy[unit] !== cell) {
          touchedBy[unit] = cell
          ruledOutIn[unit] = 0
          touchedUnits.push(unit)
        }
        ruledOutIn[unit] = (ruledOutIn[unit] ?? 0) + 1
      }
    }
    ruleOut(cell)
    for (const other of grid.neighbours[cell] ?? []) ruleOut(other)
    for (const unit of unitsOfCell)
      if (missing[unit] === 1)
        for (const other of open[unit] ?? []) ruleOut(other)

    for (const unit of touchedUnits) {
      const lacking =
        (missing[unit] ?? 0) - (unitsOfCell.includes(unit) ? 1 : 0)
      if (lacking <= 0) continue
      const unitOpen = open[unit] ?? []
      const roomLeft = unitOpen.length - (ruledOutIn[unit] ?? 0)
      const hasRoom =
        roomLeft >= lacking &&
        (lacking === 1 ||
          roomLeft > CELLS_IN_TWO_BY_TWO ||
          canHoldStars({
            cells: unitOpen.filter((other) => ruledOutBy[other] !== cell),
            count: lacking,
            size: grid.size
          }))
      if (hasRoom) continue
      steps.push({
        cells: [cell],
        focus: unitOpen.filter((other) => other !== cell),
        reason: `touching-${grid.units[unit]?.kind ?? 'row'}`,
        technique: 'touching',
        verdict: 'no-star'
      })
      break
    }
  }
  return steps
}

const subsetsOf = function* <T>(
  items: readonly T[],
  size: number,
  from = 0
): Generator<T[]> {
  if (size === 0) {
    yield []
    return
  }
  for (let index = from; index <= items.length - size; index++) {
    const first = items[index]
    if (first === undefined) continue
    for (const rest of subsetsOf(items, size - 1, index + 1))
      yield [first, ...rest]
  }
}

type Confinement = {
  readonly inner: StarsUnitKind
  readonly outer: StarsUnitKind
  /** The reason when one unit is confined. */
  readonly alone: StarsReason
  /** The reason when two or three are. */
  readonly together: StarsReason
}

const CONFINEMENTS: readonly Confinement[] = [
  {
    alone: 'region-in-row',
    inner: 'region',
    outer: 'row',
    together: 'regions-in-rows'
  },
  {
    alone: 'region-in-column',
    inner: 'region',
    outer: 'column',
    together: 'regions-in-columns'
  },
  {
    alone: 'row-in-region',
    inner: 'row',
    outer: 'region',
    together: 'rows-in-regions'
  },
  {
    alone: 'column-in-region',
    inner: 'column',
    outer: 'region',
    together: 'columns-in-regions'
  }
]

const KIND_OFFSET = { column: 1, region: 2, row: 0 } as const satisfies Record<
  StarsUnitKind,
  number
>

const bitCount = (mask: number) => {
  let count = 0
  for (let rest = mask; rest !== 0; rest &= rest - 1) count++
  return count
}

/**
 * `count` units of one kind whose open cells all lie inside `count` units of
 * another, and lack as many stars as those do: every star the outer ones still
 * lack comes from the inner ones, so the rest of the outer ones holds none.
 * One unit is a confinement ("this region has only one row left"), two a
 * pair, three a triple.
 */
const confinementOf = (
  count: number,
  technique: StarsTechnique
): StarsTechniqueRule =>
  firstOnly(({ grid, missing, open }) => {
    const { size } = grid
    for (const confinement of CONFINEMENTS) {
      const innerFirst = KIND_OFFSET[confinement.inner] * size
      const outerFirst = KIND_OFFSET[confinement.outer] * size
      const outerOf = (cell: number) =>
        (grid.unitsOfCell[cell]?.[KIND_OFFSET[confinement.outer]] ?? 0) -
        outerFirst
      const unfinished: { unit: number; outerMask: number }[] = []
      for (let unit = innerFirst; unit < innerFirst + size; unit++) {
        if ((missing[unit] ?? 0) === 0) continue
        const outerMask = (open[unit] ?? []).reduce(
          (mask, cell) => mask | (1 << outerOf(cell)),
          0
        )
        if (bitCount(outerMask) <= count) unfinished.push({ outerMask, unit })
      }
      for (const inner of subsetsOf(unfinished, count)) {
        const outerMask = inner.reduce((mask, unit) => mask | unit.outerMask, 0)
        if (bitCount(outerMask) !== count) continue
        const outer = Array.from(
          { length: size },
          (_, index) => outerFirst + index
        ).filter((unit) => outerMask & (1 << (unit - outerFirst)))
        const lackingInside = inner.reduce(
          (sum, { unit }) => sum + (missing[unit] ?? 0),
          0
        )
        const lackingOutside = outer.reduce(
          (sum, unit) => sum + (missing[unit] ?? 0),
          0
        )
        if (lackingInside !== lackingOutside) continue
        const inside = new Set(
          inner.flatMap(({ unit }) => grid.units[unit]?.cells ?? [])
        )
        const ruledOut = outer
          .flatMap((unit) => open[unit] ?? [])
          .filter((cell) => !inside.has(cell))
        if (ruledOut.length === 0) continue
        return {
          cells: ruledOut,
          focus: inner.flatMap(({ unit }) => open[unit] ?? []),
          reason: count === 1 ? confinement.alone : confinement.together,
          technique,
          verdict: 'no-star'
        }
      }
    }
    return null
  })

/** Every technique, easiest first: the solver always takes the easiest step. */
export const TECHNIQUE_RULES: readonly StarsTechniqueRule[] = [
  nextToStar,
  fullUnit,
  single,
  confinementOf(1, 'confinement'),
  touching,
  confinementOf(2, 'pair'),
  confinementOf(3, 'triple')
]

export const viewOf = ({
  grid,
  knowledge
}: {
  grid: StarsGrid
  knowledge: Uint8Array
}): StarsView => {
  const isStar = (cell: number) => knowledge[cell] === CELL_STAR
  const isOpen = (cell: number) => knowledge[cell] === CELL_OPEN
  const open = grid.units.map((unit: StarsUnit) => unit.cells.filter(isOpen))
  const missing = grid.units.map(
    (unit) => grid.starsPerUnit - unit.cells.filter(isStar).length
  )
  return { grid, isOpen, isStar, missing, open }
}
