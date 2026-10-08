import { type ColorDotsTree, routeLength } from './color-dots-tree'

/** The one speed every ball rides at, so no ride ever overtakes another. */
export const RIDE_MS_PER_STEP = 60

/** A ball's width, in grid steps: two balls whose centres come closer touch. */
export const BALL_WIDTH = 0.65

/** How often a ride is checked against the others, per grid step ridden. */
const CHECKS_PER_STEP = 20

/** How a ride ends: in the ring its route leads to, or popped `steps` along it. */
export type ColorDotsRideEnd =
  | { readonly kind: 'lands' }
  | { readonly kind: 'pops'; readonly steps: number }

/** A ball sent on its way at `startMs`, on the clock the taps keep. */
export type ColorDotsRide = {
  readonly ball: number
  readonly colour: number
  readonly route: readonly number[]
  readonly startMs: number
  readonly end: ColorDotsRideEnd
}

type GridPoint = { readonly x: number; readonly y: number }

/** How far the ball goes before it stops, landed or popped, in grid steps. */
export const rideStepsOf = (ride: ColorDotsRide, tree: ColorDotsTree) =>
  ride.end.kind === 'pops'
    ? ride.end.steps
    : routeLength({ route: ride.route, tree })

export const rideEndMsOf = (ride: ColorDotsRide, tree: ColorDotsTree) =>
  ride.startMs + rideStepsOf(ride, tree) * RIDE_MS_PER_STEP

/** Where a ball is once it has ridden `steps` along its route. */
export const pointAlong = ({
  route,
  steps,
  tree
}: {
  tree: ColorDotsTree
  route: readonly number[]
  steps: number
}): GridPoint => {
  let left = steps
  for (const [index, node] of route.entries()) {
    const here = tree.nodes[node]
    const next = tree.nodes[route[index + 1] ?? node]
    if (here === undefined || next === undefined) break
    const length = Math.abs(next.x - here.x) + Math.abs(next.y - here.y)
    if (left <= length || index === route.length - 1) {
      const share = length === 0 ? 0 : Math.min(left / length, 1)
      return {
        x: here.x + (next.x - here.x) * share,
        y: here.y + (next.y - here.y) * share
      }
    }
    left -= length
  }
  const last = tree.nodes[route.at(-1) ?? 0]
  return last ?? { x: 0, y: 0 }
}

const stepsAt = (ride: ColorDotsRide, atMs: number) =>
  Math.max(0, (atMs - ride.startMs) / RIDE_MS_PER_STEP)

/** Where the ball is at that time; `null` once it popped. A landed ball stays. */
const pointAt = ({
  atMs,
  ride,
  tree
}: {
  tree: ColorDotsTree
  ride: ColorDotsRide
  atMs: number
}): GridPoint | null => {
  const steps = stepsAt(ride, atMs)
  const total = rideStepsOf(ride, tree)
  if (ride.end.kind === 'pops' && steps > total) return null
  return pointAlong({ route: ride.route, steps: Math.min(steps, total), tree })
}

const isMovingAt = ({
  atMs,
  ride,
  tree
}: {
  tree: ColorDotsTree
  ride: ColorDotsRide
  atMs: number
}) => stepsAt(ride, atMs) < rideStepsOf(ride, tree)

const areTouching = (a: GridPoint, b: GridPoint) =>
  Math.hypot(a.x - b.x, a.y - b.y) < BALL_WIDTH

/**
 * A new ride against the balls still on their way: the first time it touches
 * one, the ball moving then pops — the new one when both are. The rides come
 * back with the new one last, at most one of them popped.
 */
export const rollOn = ({
  ride,
  rolling,
  tree
}: {
  tree: ColorDotsTree
  rolling: readonly ColorDotsRide[]
  ride: ColorDotsRide
}): readonly ColorDotsRide[] => {
  const untilMs = Math.max(
    ...[ride, ...rolling].map((each) => rideEndMsOf(each, tree))
  )
  const checkMs = RIDE_MS_PER_STEP / CHECKS_PER_STEP
  for (let check = 0; ride.startMs + check * checkMs <= untilMs; check++) {
    const atMs = ride.startMs + check * checkMs
    const here = pointAt({ atMs, ride, tree })
    if (here === null) break
    for (const [index, other] of rolling.entries()) {
      const there = pointAt({ atMs, ride: other, tree })
      if (there === null || !areTouching(here, there)) continue
      const isNewMoving = isMovingAt({ atMs, ride, tree })
      const popped = isNewMoving ? ride : other
      const poppedRide: ColorDotsRide = {
        ...popped,
        end: { kind: 'pops', steps: stepsAt(popped, atMs) }
      }
      return isNewMoving
        ? [...rolling, poppedRide]
        : [...rolling.with(index, poppedRide), ride]
    }
  }
  return [...rolling, ride]
}
