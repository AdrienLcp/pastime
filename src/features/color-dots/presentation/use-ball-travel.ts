import { useLayoutEffect, useRef } from 'react'

import { motionDurationMs } from '@/infrastructure/browser'

import type { ColorDotsLevel } from '../engine/color-dots-level'
import type { ColorDotsTap } from '../engine/color-dots-state'
import { routeLength } from '../engine/color-dots-tree'
import { GRID_UNITS, pointOf } from './color-dots-drawing'

/** A grid step's ride, as a share of the fast transition: quick, but seen. */
const STEP_SHARE = 0.4

/** However long the route, a ride never takes longer than this. */
const LONGEST_RIDE_MS = 900

/** The bump against a blocker: a few units towards it, then back. */
const BUMP_SHARE = 0.28
const BUMP_MS = 160

/**
 * How long the last tap's ride lasts, so that what waits for the ball — the
 * ring filling, the line going — starts when it gets there. 0 under reduced
 * motion.
 */
export const rideMsOf = ({
  level,
  tap
}: {
  level: ColorDotsLevel
  tap: ColorDotsTap | null
}): number => {
  if (tap === null) return 0
  const steps = routeLength({ route: tap.route, tree: level })
  const stepMs = motionDurationMs('--transition-fast') * STEP_SHARE
  return Math.min(steps * stepMs, LONGEST_RIDE_MS)
}

const translateOf = ({ x, y }: { x: number; y: number }) =>
  `translate(${x}px, ${y}px)`

/**
 * Rides the ball of the last tap along its route at a steady speed, segment
 * by segment, then bumps it against whatever stopped it. The element is the
 * ball as drawn at the route's end; the ride brings it there.
 */
export const useBallTravel = ({
  level,
  rideMs,
  tap
}: {
  level: ColorDotsLevel
  tap: ColorDotsTap | null
  rideMs: number
}) => {
  const ballRef = useRef<SVGGElement>(null)

  useLayoutEffect(() => {
    const ball = ballRef.current
    if (ball === null || tap === null || rideMs === 0) return
    const points = tap.route.flatMap((node) => {
      const at = level.nodes[node]
      return at === undefined ? [] : [pointOf(at)]
    })
    const total = routeLength({ route: tap.route, tree: level })
    let travelled = 0
    const keyframes: Keyframe[] = points.map((point, index) => {
      const previous = points[index - 1]
      if (previous !== undefined)
        travelled +=
          Math.abs(point.x - previous.x) + Math.abs(point.y - previous.y)
      return {
        offset: total === 0 ? 0 : Math.min(travelled / (total * GRID_UNITS), 1),
        opacity: 1,
        transform: translateOf(point)
      }
    })
    const ride = ball.animate(keyframes, {
      duration: rideMs,
      easing: 'linear',
      fill: 'backwards'
    })
    if (tap.kind !== 'blocked') return () => ride.cancel()

    const stop = points.at(-1)
    const blocker = level.nodes[tap.blocker]
    if (stop === undefined || blocker === undefined) return () => ride.cancel()
    const against = pointOf(blocker)
    const bump = ball.animate(
      [
        { transform: translateOf(stop) },
        {
          transform: translateOf({
            x: stop.x + (against.x - stop.x) * BUMP_SHARE,
            y: stop.y + (against.y - stop.y) * BUMP_SHARE
          })
        },
        { transform: translateOf(stop) }
      ],
      { delay: rideMs, duration: BUMP_MS, easing: 'ease-out' }
    )
    return () => {
      ride.cancel()
      bump.cancel()
    }
  }, [level, rideMs, tap])

  return ballRef
}
