import { Result } from '@adrienlcp/result'

import type { LevelGenerator } from '@/features/game-frame/generator/serve-generator'
import type { SeededRandom } from '@/helpers/seeded-random'

import type { ColorDotsLevel, ColorDotsPiece } from '../engine/color-dots-level'
import { type ColorDotsSpot, startColorDots } from '../engine/color-dots-state'
import { tapBall } from '../engine/color-dots-tap'
import { countTraps, createColorDotsSolver } from '../solver/color-dots-solver'
import {
  type ColorDotsSketch,
  DIRECTIONS,
  isOpenLine,
  pointsInside,
  takenPointsOf,
  withLeaf,
  withNodeOnLink
} from './color-dots-sketch'
import {
  COLOR_DOTS_TIERS,
  type ColorDotsRecipe,
  isColorDotsTierId
} from './color-dots-tiers'

/** Boards built for one level; the one with the most traps ships. */
const ATTEMPTS = 24

/**
 * Most Expert boards dead-end while built backwards, so the build goes on past
 * `ATTEMPTS` until one board stands, up to this many.
 */
const ATTEMPTS_BEFORE_GIVING_UP = 160

/** Valid places to put a ball back that are weighed against each other. */
const CHOICES_PER_STEP = 10

/** A ball sitting on a line blocks whatever must ride past it. */
const ON_LINE_WEIGHT = 10

/** A long trip crosses more rings, and the order matters more. */
const ROUTE_WEIGHT = 0.4

const filledRing = (colour: number): ColorDotsSpot => ({
  colour,
  isFilled: true,
  kind: 'ring'
})

const LONG_LINE_ODDS = 0.55

/** A chain tends to run on in the direction it came from. */
const STRAIGHT_ODDS = 0.6

const SHORTEST_CHAIN = 2
const LONGEST_CHAIN = 4

/** Tries at laying one chain on the grid before the board is dropped. */
const CHAIN_TRIES = 30

type GridPoint = { readonly x: number; readonly y: number }

/** How many rings each ink gets: every ring is in its ink's one chain. */
const chainLengthsOf = ({
  random,
  recipe
}: {
  random: SeededRandom
  recipe: ColorDotsRecipe
}): number[] => {
  const lengths = Array.from({ length: recipe.colours }, () => SHORTEST_CHAIN)
  for (
    let left = recipe.rings - SHORTEST_CHAIN * recipe.colours;
    left > 0;
    left--
  ) {
    const growable = lengths.flatMap((length, chain) =>
      length < LONGEST_CHAIN ? [chain] : []
    )
    const chain = growable[random.below(growable.length)]
    if (chain !== undefined) lengths[chain] = (lengths[chain] ?? 0) + 1
  }
  return lengths
}

/**
 * A new filled ring on a line out of `anchor`, or null when the grid around
 * it is full; after `heading`, going straight on is favoured.
 */
const extendFrom = ({
  anchor,
  colour,
  heading,
  random,
  recipe,
  sketch
}: {
  random: SeededRandom
  recipe: ColorDotsRecipe
  sketch: ColorDotsSketch
  anchor: number
  heading: GridPoint | null
  colour: number
}): { sketch: ColorDotsSketch; heading: GridPoint } | null => {
  const from = sketch.nodes[anchor]
  if (from === undefined) return null
  const taken = takenPointsOf(sketch)
  const open = DIRECTIONS.flatMap((direction) =>
    [1, 2].flatMap((length) => {
      const to = {
        x: from.x + direction.x * length,
        y: from.y + direction.y * length
      }
      return isOpenLine({ ...recipe, from, taken, to })
        ? [{ direction, length, to }]
        : []
    })
  )
  const straight = open.filter(
    ({ direction }) => direction.x === heading?.x && direction.y === heading.y
  )
  const directed =
    straight.length > 0 && random.next() < STRAIGHT_ODDS ? straight : open
  const preferredLength = random.next() < LONG_LINE_ODDS ? 2 : 1
  const sized = directed.filter(({ length }) => length === preferredLength)
  const choices = sized.length > 0 ? sized : directed
  const chosen = choices[random.below(choices.length)]
  if (chosen === undefined) return null
  return {
    heading: chosen.direction,
    sketch: withLeaf({
      anchor,
      point: chosen.to,
      sketch,
      spot: filledRing(colour)
    })
  }
}

/**
 * `length` rings of one ink, one after the other along the lines out of
 * `anchor`: the chain may turn, and may leave from the middle of another
 * ink's chain.
 */
const layChain = ({
  anchor,
  colour,
  length,
  random,
  recipe,
  sketch
}: {
  random: SeededRandom
  recipe: ColorDotsRecipe
  sketch: ColorDotsSketch
  anchor: number
  colour: number
  length: number
}): ColorDotsSketch | null => {
  let laid = sketch
  let tip = anchor
  let heading: GridPoint | null = null
  for (let ring = 0; ring < length; ring++) {
    const extended = extendFrom({
      anchor: tip,
      colour,
      heading,
      random,
      recipe,
      sketch: laid
    })
    if (extended === null) return null
    laid = extended.sketch
    heading = extended.heading
    tip = laid.nodes.length - 1
  }
  return laid
}

/**
 * The solved board: one chain of filled rings per ink, each grown out of a
 * ring already laid, so an ink's rings follow each other on one line and the
 * order its balls land in reads off the board, as in the original.
 */
const growChains = ({
  random,
  recipe
}: {
  random: SeededRandom
  recipe: ColorDotsRecipe
}): ColorDotsSketch | null => {
  const inks = random
    .shuffled(Array.from({ length: 5 }, (_, colour) => colour))
    .slice(0, recipe.colours)
  const chains = chainLengthsOf({ random, recipe }).map((length, chain) => ({
    colour: inks[chain] ?? 0,
    length
  }))
  const [first, ...others] = chains
  if (first === undefined) return null
  let sketch = layChain({
    anchor: 0,
    colour: first.colour,
    length: first.length - 1,
    random,
    recipe,
    sketch: {
      links: [],
      nodes: [
        { x: Math.floor(recipe.columns / 2), y: Math.floor(recipe.rows / 2) }
      ],
      spots: [filledRing(first.colour)]
    }
  })
  for (const { colour, length } of others) {
    const grown = sketch
    if (grown === null) return null
    sketch = null
    for (let tries = 0; tries < CHAIN_TRIES && sketch === null; tries++)
      sketch = layChain({
        anchor: random.below(grown.nodes.length),
        colour,
        length,
        random,
        recipe,
        sketch: grown
      })
  }
  return sketch
}

/** A line between two rings of one ink: cutting it would split the chain. */
const isInsideChain = ({
  from,
  sketch,
  to
}: {
  sketch: ColorDotsSketch
  from: number
  to: number
}): boolean => {
  const start = sketch.spots[from]
  const end = sketch.spots[to]
  return (
    start?.kind === 'ring' &&
    end?.kind === 'ring' &&
    start.colour === end.colour
  )
}

/** Somewhere a ball can be put back, before its colour is known. */
type Placement = {
  readonly isOnLine: boolean
  /** The nodes a ball put here rides through first. */
  readonly entries: readonly number[]
  readonly place: (spot: ColorDotsSpot) => ColorDotsSketch
}

const placementsOf = ({
  recipe,
  sketch
}: {
  recipe: ColorDotsRecipe
  sketch: ColorDotsSketch
}): Placement[] => {
  const taken = takenPointsOf(sketch)
  const linesFrom = (from: { x: number; y: number }) =>
    DIRECTIONS.flatMap((direction) =>
      [1, 2]
        .map((length) => ({
          x: from.x + direction.x * length,
          y: from.y + direction.y * length
        }))
        .filter((to) => isOpenLine({ ...recipe, from, taken, to }))
    )

  const leaves = sketch.nodes.flatMap((from, anchor) =>
    linesFrom(from).map(
      (point): Placement => ({
        entries: [anchor],
        isOnLine: false,
        place: (spot) => withLeaf({ anchor, point, sketch, spot })
      })
    )
  )
  const onLines = sketch.links.flatMap(([from, to], link) => {
    const start = sketch.nodes[from]
    const end = sketch.nodes[to]
    if (start === undefined || end === undefined) return []
    if (isInsideChain({ from, sketch, to })) return []
    return pointsInside({ from: start, to: end }).flatMap(
      (point): Placement[] => [
        {
          entries: [from, to],
          isOnLine: true,
          place: (spot) => withNodeOnLink({ link, point, sketch, spot })
        },
        ...linesFrom(point).map(
          (leafPoint): Placement => ({
            entries: [from, to],
            isOnLine: false,
            place: (spot) => {
              const split = withNodeOnLink({
                link,
                point,
                sketch,
                spot: { kind: 'joint' }
              })
              return withLeaf({
                anchor: split.nodes.length - 1,
                point: leafPoint,
                sketch: split,
                spot
              })
            }
          })
        )
      ]
    )
  })
  return [...leaves, ...onLines]
}

type UnPlay = {
  readonly sketch: ColorDotsSketch
  readonly ball: number
  readonly ring: number
  readonly weight: number
}

/**
 * The filled rings a ball put at this placement could ride back into: a ball
 * or a filled ring at its entry stops it at once, unless that ring is the one.
 */
const targetsThrough = ({
  filled,
  placement,
  sketch
}: {
  sketch: ColorDotsSketch
  placement: Placement
  filled: readonly number[]
}): readonly number[] => {
  const spots = placement.entries.map((entry) => sketch.spots[entry])
  const isPassable = spots.some(
    (spot) =>
      spot?.kind === 'joint' || (spot?.kind === 'ring' && !spot.isFilled)
  )
  if (isPassable) return filled
  return placement.entries.filter((entry) => filled.includes(entry))
}

/**
 * The ways to take one ball back out of a filled ring: the ball goes on a new
 * node, and tapping it there must ride straight back into that ring.
 */
const unPlaysOf = ({
  random,
  recipe,
  sketch
}: {
  random: SeededRandom
  recipe: ColorDotsRecipe
  sketch: ColorDotsSketch
}): UnPlay[] => {
  const filled = sketch.spots.flatMap((spot, ring) =>
    spot.kind === 'ring' && spot.isFilled ? [ring] : []
  )
  const found: UnPlay[] = []
  for (const placement of random.shuffled(placementsOf({ recipe, sketch }))) {
    for (const ring of random.shuffled(
      targetsThrough({ filled, placement, sketch })
    )) {
      const target = sketch.spots[ring]
      if (target?.kind !== 'ring') continue
      const { colour } = target
      const placed = placement.place({ colour, kind: 'ball' })
      const ball = placed.nodes.length - 1
      const spots = placed.spots.with(ring, {
        colour,
        isFilled: false,
        kind: 'ring'
      })
      const tapped = tapBall({ ball, spots, tree: placed })
      if (tapped.status === 'failure') continue
      const { tap } = tapped.data
      if (tap.kind !== 'arrived' || tap.route.at(-1) !== ring) continue
      found.push({
        ball,
        ring,
        sketch: { ...placed, spots },
        weight:
          1 +
          (placement.isOnLine ? ON_LINE_WEIGHT : 0) +
          ROUTE_WEIGHT * tap.route.length
      })
    }
    if (found.length >= CHOICES_PER_STEP) break
  }
  return found
}

/** The choices in a random order where the heavier ones tend to come first. */
const weightedOrder = (
  random: SeededRandom,
  choices: readonly UnPlay[]
): UnPlay[] =>
  choices
    .map((choice) => ({ choice, draw: random.next() ** (1 / choice.weight) }))
    .toSorted((first, second) => second.draw - first.draw)
    .map(({ choice }) => choice)

/** A sketch is built backwards: nothing on it has gone yet. */
const pieceOf = (spot: ColorDotsSpot): ColorDotsPiece => {
  if (spot.kind === 'ring') return { colour: spot.colour, kind: 'ring' }
  if (spot.kind === 'ball') return spot
  return { kind: 'joint' }
}

/** The sketch as printed, moved against the grid's top-left corner. */
const levelOf = (sketch: ColorDotsSketch): ColorDotsLevel => {
  const left = Math.min(...sketch.nodes.map(({ x }) => x))
  const top = Math.min(...sketch.nodes.map(({ y }) => y))
  return {
    links: sketch.links.map(([from, to]) => [from, to]),
    nodes: sketch.nodes.map(({ x, y }, node) => ({
      piece: pieceOf(sketch.spots[node] ?? { kind: 'joint' }),
      x: x - left,
      y: y - top
    }))
  }
}

/** Plays the order from the printed level: every tap must arrive. */
const clearsTheBoard = ({
  level,
  order
}: {
  level: ColorDotsLevel
  order: readonly number[]
}): boolean => {
  let { spots } = startColorDots(level)
  for (const ball of order) {
    const tapped = tapBall({ ball, spots, tree: level })
    if (tapped.status === 'failure' || tapped.data.tap.kind === 'blocked')
      return false
    spots = tapped.data.spots
  }
  return spots.every((spot) => spot.kind !== 'ball')
}

/** Un-plays tried for one board, dead ends included, before it is dropped. */
const REVERSE_STEP_BUDGET = 100

const hasFilledRing = (sketch: ColorDotsSketch) =>
  sketch.spots.some((spot) => spot.kind === 'ring' && spot.isFilled)

/**
 * One board, built backwards from its end: rings all filled, then balls taken
 * out one at a time, each put where tapping it rides straight back. A ring
 * walled in by the others sends the build back a step to try another ball.
 * Played forwards, the reverse of the un-played order is a solution.
 */
const buildLevel = ({
  random,
  recipe
}: {
  random: SeededRandom
  recipe: ColorDotsRecipe
}): { level: ColorDotsLevel; order: readonly number[] } | null => {
  const rings = growChains({ random, recipe })
  if (rings === null) return null
  let budget = REVERSE_STEP_BUDGET

  const unPlayFrom = (
    sketch: ColorDotsSketch
  ): { sketch: ColorDotsSketch; unPlayed: readonly number[] } | null => {
    if (!hasFilledRing(sketch)) return { sketch, unPlayed: [] }
    for (const choice of weightedOrder(
      random,
      unPlaysOf({ random, recipe, sketch })
    )) {
      if (budget-- <= 0) return null
      const rest = unPlayFrom(choice.sketch)
      if (rest !== null)
        return { ...rest, unPlayed: [choice.ball, ...rest.unPlayed] }
    }
    return null
  }

  const built = unPlayFrom(rings)
  if (built === null) return null
  const level = levelOf(built.sketch)
  const order = built.unPlayed.toReversed()
  return clearsTheBoard({ level, order }) ? { level, order } : null
}

/**
 * A Color Dots level at its variant's difficulty. Several boards are built;
 * the first holding enough tempting wrong taps ships, else the hardest of them.
 */
export const generateColorDots: LevelGenerator<ColorDotsLevel> = ({
  random,
  variantId
}) => {
  if (!isColorDotsTierId(variantId)) return Result.failure('gave_up')
  const recipe = COLOR_DOTS_TIERS[variantId]
  let hardest: { level: ColorDotsLevel; traps: number } | null = null
  for (
    let attempt = 0;
    attempt < ATTEMPTS ||
    (hardest === null && attempt < ATTEMPTS_BEFORE_GIVING_UP);
    attempt++
  ) {
    const built = buildLevel({ random, recipe })
    if (built === null) continue
    const { level, order } = built
    const traps = countTraps({
      order,
      solver: createColorDotsSolver(level),
      spots: startColorDots(level).spots,
      tree: level
    })
    if (traps >= recipe.minTraps) return Result.success({ level })
    if (hardest === null || traps > hardest.traps) hardest = { level, traps }
  }
  return hardest === null
    ? Result.failure('gave_up')
    : Result.success({ level: hardest.level })
}
