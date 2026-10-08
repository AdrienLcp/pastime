import { Result } from '@adrienlcp/result'

import type { ColorDotsSpot, ColorDotsTap } from './color-dots-state'
import {
  type ColorDotsTree,
  neighboursOf,
  routeBetween,
  routeLength
} from './color-dots-tree'

/** A waiting ball or a filled ring: nothing rides past either. */
const isBlocker = (spot: ColorDotsSpot | undefined): boolean =>
  spot?.kind === 'ball' || (spot?.kind === 'ring' && spot.isFilled)

const isFreeRingOf = (spot: ColorDotsSpot, colour: number): boolean =>
  spot.kind === 'ring' && spot.colour === colour && !spot.isFilled

const lengthTo = ({
  ball,
  ring,
  tree
}: {
  tree: ColorDotsTree
  ball: number
  ring: number
}) => routeLength({ route: routeBetween({ from: ball, to: ring, tree }), tree })

/** Free rings of one colour joined by lines: a chain still to fill. */
const chainOf = ({
  colour,
  entry,
  spots,
  tree
}: {
  tree: ColorDotsTree
  spots: readonly ColorDotsSpot[]
  entry: number
  colour: number
}): number[] => {
  const neighbours = neighboursOf(tree)
  const chain = [entry]
  for (let index = 0; index < chain.length; index++) {
    for (const next of neighbours[chain[index] ?? entry] ?? []) {
      const spot = spots[next]
      if (
        spot !== undefined &&
        isFreeRingOf(spot, colour) &&
        !chain.includes(next)
      )
        chain.push(next)
    }
  }
  return chain
}

/** The ring the measure favours most; a tie goes to the first node. */
const ringBy = (
  rings: readonly number[],
  isBetter: (candidate: number, best: number) => boolean
): number | undefined =>
  rings.reduce<number | undefined>(
    (best, ring) => (best === undefined || isBetter(ring, best) ? ring : best),
    undefined
  )

/**
 * The ring a ball of this colour heads for: it enters the nearest chain of
 * free rings of its colour and rides to that chain's far end, so a chain
 * fills from its far end back.
 */
export const targetOf = ({
  ball,
  colour,
  spots,
  tree
}: {
  tree: ColorDotsTree
  spots: readonly ColorDotsSpot[]
  ball: number
  colour: number
}): { readonly ring: number; readonly route: readonly number[] } | null => {
  const free = spots.flatMap((spot, ring) =>
    isFreeRingOf(spot, colour) ? [ring] : []
  )
  const distances = new Map(
    free.map((ring) => [ring, lengthTo({ ball, ring, tree })])
  )
  const distanceOf = (ring: number) => distances.get(ring) ?? 0
  const entry = ringBy(
    free,
    (ring, best) => distanceOf(ring) < distanceOf(best)
  )
  if (entry === undefined) return null
  const ring = ringBy(
    chainOf({ colour, entry, spots, tree }).toSorted((a, b) => a - b),
    (candidate, best) => distanceOf(candidate) > distanceOf(best)
  )
  if (ring === undefined) return null
  return { ring, route: routeBetween({ from: ball, to: ring, tree }) }
}

/** Joints left hanging at the end of a line go, until none does. */
const pruneBareJoints = ({
  spots,
  tree
}: {
  tree: ColorDotsTree
  spots: readonly ColorDotsSpot[]
}): readonly ColorDotsSpot[] => {
  const neighbours = neighboursOf(tree)
  const pruned = [...spots]
  const isBare = (node: number) =>
    pruned[node]?.kind === 'joint' &&
    (neighbours[node] ?? []).filter((next) => pruned[next]?.kind !== 'gone')
      .length <= 1
  const waiting = pruned.flatMap((_, node) => (isBare(node) ? [node] : []))
  for (let node = waiting.pop(); node !== undefined; node = waiting.pop()) {
    if (!isBare(node)) continue
    pruned[node] = { kind: 'gone' }
    waiting.push(...(neighbours[node] ?? []))
  }
  return pruned
}

/**
 * A tap on a ball: it rides to its ring and fills it, or runs into a ball or
 * a filled ring and stops one node short — the level is then lost. `'illegal'`
 * for a node without a ball, or a ball with no free ring of its colour left.
 */
export const tapBall = ({
  ball,
  spots,
  tree
}: {
  tree: ColorDotsTree
  spots: readonly ColorDotsSpot[]
  ball: number
}): Result<
  { readonly spots: readonly ColorDotsSpot[]; readonly tap: ColorDotsTap },
  'illegal'
> => {
  const spot = spots[ball]
  if (spot?.kind !== 'ball') return Result.failure('illegal')
  const { colour } = spot
  const target = targetOf({ ball, colour, spots, tree })
  if (target === null) return Result.failure('illegal')

  const blockedAt = target.route.findIndex(
    (node, step) => step > 0 && isBlocker(spots[node])
  )
  const blocker = target.route[blockedAt]
  if (blocker !== undefined)
    return Result.success({
      spots,
      tap: {
        ball,
        blocker,
        colour,
        kind: 'blocked',
        route: target.route.slice(0, blockedAt)
      }
    })

  return Result.success({
    spots: pruneBareJoints({
      spots: spots
        .with(ball, { kind: 'joint' })
        .with(target.ring, { colour, isFilled: true, kind: 'ring' }),
      tree
    }),
    tap: { ball, colour, kind: 'arrived', route: target.route }
  })
}
