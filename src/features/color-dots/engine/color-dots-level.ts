import { z } from 'zod/mini'

/** Every ball and ring wears one of these inks, each with its own symbol. */
export const COLOR_DOTS_COLOURS = 5

const colourSchema = z
  .number()
  .check(z.int(), z.gte(0), z.lt(COLOR_DOTS_COLOURS))

/**
 * What sits on a node when the level is printed: a ball, the ring it is
 * looking for, or a bare joint where lines meet.
 */
const pieceSchema = z.discriminatedUnion('kind', [
  z.object({ colour: colourSchema, kind: z.literal('ball') }),
  z.object({ colour: colourSchema, kind: z.literal('ring') }),
  z.object({ kind: z.literal('joint') })
])

export type ColorDotsPiece = z.infer<typeof pieceSchema>

const nodeSchema = z.object({
  piece: pieceSchema,
  x: z.number().check(z.int(), z.gte(0)),
  y: z.number().check(z.int(), z.gte(0))
})

export type ColorDotsNode = z.infer<typeof nodeSchema>

/** Two nodes joined by a straight line, along a row or a column. */
export type ColorDotsLink = readonly [number, number]

type LevelShape = {
  nodes: readonly ColorDotsNode[]
  links: readonly ColorDotsLink[]
}

const isStraightLink = (
  { nodes }: LevelShape,
  [from, to]: ColorDotsLink
): boolean => {
  const start = nodes[from]
  const end = nodes[to]
  if (start === undefined || end === undefined || from === to) return false
  return start.x === end.x || start.y === end.y
}

const isTree = ({ links, nodes }: LevelShape): boolean => {
  if (links.length !== nodes.length - 1) return false
  const reached = new Set([0])
  const waiting = [0]
  for (let node = waiting.pop(); node !== undefined; node = waiting.pop()) {
    for (const [from, to] of links) {
      const next = from === node ? to : to === node ? from : null
      if (next === null || reached.has(next)) continue
      reached.add(next)
      waiting.push(next)
    }
  }
  return reached.size === nodes.length
}

const countsOf = (nodes: readonly ColorDotsNode[], kind: 'ball' | 'ring') =>
  nodes.reduce(
    (counts, { piece }) =>
      piece.kind === kind
        ? counts.with(piece.colour, (counts[piece.colour] ?? 0) + 1)
        : counts,
    Array<number>(COLOR_DOTS_COLOURS).fill(0)
  )

const hasOneRingPerBall = ({ nodes }: LevelShape): boolean => {
  const rings = countsOf(nodes, 'ring')
  return countsOf(nodes, 'ball').every(
    (balls, colour) => balls === rings[colour]
  )
}

/**
 * A printed board: a tree of nodes on a grid, drawn with straight lines.
 * `boss` marks the larger levels of the progression and the daily puzzle.
 */
export const colorDotsLevelSchema = z
  .object({
    boss: z.boolean(),
    links: z.array(
      z.tuple([
        z.number().check(z.int(), z.gte(0)),
        z.number().check(z.int(), z.gte(0))
      ])
    ),
    nodes: z.array(nodeSchema).check(z.minLength(2))
  })
  .check(
    z.refine(isTree, { message: 'one tree' }),
    z.refine(
      (level) => level.links.every((link) => isStraightLink(level, link)),
      { message: 'straight lines' }
    ),
    z.refine(hasOneRingPerBall, { message: 'one ring per ball' })
  )

export type ColorDotsLevel = z.infer<typeof colorDotsLevelSchema>
