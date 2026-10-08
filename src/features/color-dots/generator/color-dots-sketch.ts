import type { ColorDotsLink } from '../engine/color-dots-level'
import type { ColorDotsSpot } from '../engine/color-dots-state'
import type { ColorDotsTree } from '../engine/color-dots-tree'

type GridPoint = { readonly x: number; readonly y: number }

/** A board being built: where its nodes sit, its lines, and what is on each. */
export type ColorDotsSketch = ColorDotsTree & {
  readonly nodes: readonly GridPoint[]
  readonly links: readonly ColorDotsLink[]
  readonly spots: readonly ColorDotsSpot[]
}

export const DIRECTIONS: readonly GridPoint[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 }
]

const pointKey = ({ x, y }: GridPoint) => `${x},${y}`

/** The grid points between a line's two ends, ends excluded. */
export const pointsInside = ({
  from,
  to
}: {
  from: GridPoint
  to: GridPoint
}): GridPoint[] => {
  const steps = Math.abs(to.x - from.x) + Math.abs(to.y - from.y)
  const step = { x: Math.sign(to.x - from.x), y: Math.sign(to.y - from.y) }
  return Array.from({ length: Math.max(steps - 1, 0) }, (_, index) => ({
    x: from.x + step.x * (index + 1),
    y: from.y + step.y * (index + 1)
  }))
}

/** Every grid point a node or a line already takes. */
export const takenPointsOf = (sketch: ColorDotsSketch): ReadonlySet<string> =>
  new Set([
    ...sketch.nodes.map(pointKey),
    ...sketch.links.flatMap(([from, to]) => {
      const start = sketch.nodes[from]
      const end = sketch.nodes[to]
      if (start === undefined || end === undefined) return []
      return pointsInside({ from: start, to: end }).map(pointKey)
    })
  ])

/**
 * Whether a straight line from `from` reaching `to` stays on the grid and
 * crosses nothing; `from` itself is the anchor and may be taken.
 */
export const isOpenLine = ({
  columns,
  from,
  rows,
  taken,
  to
}: {
  from: GridPoint
  to: GridPoint
  columns: number
  rows: number
  taken: ReadonlySet<string>
}): boolean =>
  to.x >= 0 &&
  to.y >= 0 &&
  to.x < columns &&
  to.y < rows &&
  [...pointsInside({ from, to }), to].every(
    (point) => !taken.has(pointKey(point))
  )

/** A new node at the end of a new line from `anchor`. */
export const withLeaf = ({
  anchor,
  point,
  sketch,
  spot
}: {
  sketch: ColorDotsSketch
  anchor: number
  point: GridPoint
  spot: ColorDotsSpot
}): ColorDotsSketch => ({
  links: [...sketch.links, [anchor, sketch.nodes.length]],
  nodes: [...sketch.nodes, point],
  spots: [...sketch.spots, spot]
})

/** A new node cutting a line in two at one of its inner points. */
export const withNodeOnLink = ({
  link,
  point,
  sketch,
  spot
}: {
  sketch: ColorDotsSketch
  link: number
  point: GridPoint
  spot: ColorDotsSpot
}): ColorDotsSketch => {
  const cut = sketch.links[link]
  if (cut === undefined) return sketch
  const node = sketch.nodes.length
  return {
    links: [
      ...sketch.links.filter((_, index) => index !== link),
      [cut[0], node],
      [node, cut[1]]
    ],
    nodes: [...sketch.nodes, point],
    spots: [...sketch.spots, spot]
  }
}
