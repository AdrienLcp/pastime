import rough from 'roughjs'
import type { Drawable, Options } from 'roughjs/bin/core'

/**
 * The player's pencil, drawn by rough.js: one stroke per line, a little off
 * true. The seed is the cell, so a mark wobbles the same way on every render.
 */
const sketch = rough.generator()

const PENCIL: Options = { bowing: 1.2, disableMultiStroke: true, roughness: 1 }

const pathOf = (drawable: Drawable) =>
  sketch
    .toPaths(drawable)
    .map((path) => path.d)
    .join('')

type Point = { x: number; y: number }

/** rough.js wants a seed above zero. */
const seedOf = (cell: number) => cell + 1

/** A five-point star in one stroke, tip to every second tip. */
export const pencilStar = ({
  cell,
  centre,
  radius
}: {
  cell: number
  centre: Point
  radius: number
}): string => {
  const tips = Array.from({ length: 6 }, (_, tip): [number, number] => {
    const angle = ((-90 + tip * 144) * Math.PI) / 180
    return [
      centre.x + radius * Math.cos(angle),
      centre.y + radius * Math.sin(angle)
    ]
  })
  return pathOf(sketch.linearPath(tips, { ...PENCIL, seed: seedOf(cell) }))
}

export const pencilCross = ({
  cell,
  centre,
  reach
}: {
  cell: number
  centre: Point
  reach: number
}): string => {
  const options = { ...PENCIL, seed: seedOf(cell) }
  const { x, y } = centre
  return [
    sketch.line(x - reach, y - reach, x + reach, y + reach, options),
    sketch.line(x + reach, y - reach, x - reach, y + reach, options)
  ]
    .map(pathOf)
    .join('')
}

/** A loop drawn round a point, as a pencil circles a mistake. */
export const pencilLoop = ({
  centre,
  height,
  seed,
  width
}: {
  centre: Point
  height: number
  seed: number
  width: number
}): string =>
  pathOf(
    sketch.ellipse(centre.x, centre.y, width, height, {
      ...PENCIL,
      seed: seedOf(seed)
    })
  )
