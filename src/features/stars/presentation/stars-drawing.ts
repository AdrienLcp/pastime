import { columnOf, rowOf } from '../engine/stars-grid'
import type { StarsPuzzle } from '../engine/stars-level'

/** A cell's side, in board units; the 5-unit frame sits around the cells. */
export const CELL_UNITS = 44

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

type Point = { readonly x: number; readonly y: number }

/** How deep a star's notches cut, as a share of its points' reach. */
const STAR_WAIST = 0.46

/** A five-point star round a centre, first point up, as SVG polygon points. */
export const starPointsOf = ({
  centre,
  radius
}: {
  centre: Point
  radius: number
}): string =>
  Array.from({ length: 10 }, (_, corner) => {
    const reach = corner % 2 === 0 ? radius : radius * STAR_WAIST
    const angle = ((-90 + corner * 36) * Math.PI) / 180
    const x = centre.x + reach * Math.cos(angle)
    const y = centre.y + reach * Math.sin(angle)
    return `${x.toFixed(2)},${y.toFixed(2)}`
  }).join(' ')

/** A cross: two straight strokes reaching this far from the centre on each axis. */
export const crossPathOf = ({
  centre: { x, y },
  reach
}: {
  centre: Point
  reach: number
}): string =>
  `M${x - reach} ${y - reach}L${x + reach} ${y + reach}M${x + reach} ${y - reach}L${x - reach} ${y + reach}`
