import { useLayoutEffect, useRef } from 'react'

import { motionDurationMs } from '@/infrastructure/browser'

import type { ColorDotsLevel } from '../engine/color-dots-level'
import {
  type ColorDotsRide,
  pointAlong,
  RIDE_MS_PER_STEP,
  rideEndMsOf,
  rideStepsOf
} from '../engine/color-dots-ride'
import { pointOf } from './color-dots-drawing'

/** The swell of a ball as it pops, before its ink splashes. */
const BURST_MS = 140
const BURST_SCALE = 1.35

/** Reduced motion: every ride is instant, so no two balls are ever rolling. */
export const isMotionReduced = (): boolean =>
  motionDurationMs('--transition-fast') === 0

/** How long after the last tap the ride stops, landed or popped. */
export const msLeftOf = ({
  clockMs,
  level,
  ride
}: {
  level: ColorDotsLevel
  ride: ColorDotsRide
  clockMs: number
}): number => Math.max(0, rideEndMsOf(ride, level) - clockMs)

/** Where the ride stops, in board units: its ring, or where it popped. */
export const stopPointOf = ({
  level,
  ride
}: {
  level: ColorDotsLevel
  ride: ColorDotsRide
}) =>
  pointOf(
    pointAlong({
      route: ride.route,
      steps: rideStepsOf(ride, level),
      tree: level
    })
  )

const transformAt = ({ x, y }: { x: number; y: number }, scale = 1) =>
  `translate(${x}px, ${y}px) scale(${scale})`

/** The route as far as the ride goes, with how far along each corner sits. */
const cornersOf = ({
  level,
  ride
}: {
  level: ColorDotsLevel
  ride: ColorDotsRide
}) => {
  const total = rideStepsOf(ride, level)
  const corners: { readonly steps: number; readonly node: number }[] = []
  let steps = 0
  for (const [index, node] of ride.route.entries()) {
    if (steps >= total) break
    corners.push({ node, steps })
    const here = level.nodes[node]
    const next = level.nodes[ride.route[index + 1] ?? node]
    if (here === undefined || next === undefined) break
    steps += Math.abs(next.x - here.x) + Math.abs(next.y - here.y)
  }
  return { corners, total }
}

/**
 * Rides every ball of the last tap along its route at the rules' one speed,
 * each picked up where it is at that tap, then swells a popped one away. The
 * elements are the balls under the returned group, by `data-ride`.
 */
export const useRideMotion = ({
  clockMs,
  level,
  rides
}: {
  level: ColorDotsLevel
  rides: readonly ColorDotsRide[] | null
  clockMs: number
}) => {
  const groupRef = useRef<SVGGElement>(null)

  useLayoutEffect(() => {
    const group = groupRef.current
    if (group === null || rides === null || isMotionReduced()) return
    const animations = rides.flatMap((ride) => {
      const ball = group.querySelector<SVGGElement>(
        `[data-ride="${ride.ball}"]`
      )
      if (ball === null) return []
      const { corners, total } = cornersOf({ level, ride })
      if (total === 0) return []
      const rideMs = total * RIDE_MS_PER_STEP
      const burstMs = ride.end.kind === 'pops' ? BURST_MS : 0
      const durationMs = rideMs + burstMs
      const stop = stopPointOf({ level, ride })
      const keyframes: Keyframe[] = [
        ...corners.map(({ node, steps }) => {
          const at = level.nodes[node]
          return {
            offset: (steps * RIDE_MS_PER_STEP) / durationMs,
            opacity: 1,
            transform: transformAt(at === undefined ? stop : pointOf(at))
          }
        }),
        {
          offset: rideMs / durationMs,
          opacity: 1,
          transform: transformAt(stop)
        },
        ...(burstMs > 0
          ? [
              {
                offset: 1,
                opacity: 0,
                transform: transformAt(stop, BURST_SCALE)
              }
            ]
          : [])
      ]
      const animation = ball.animate(keyframes, {
        duration: durationMs,
        easing: 'linear',
        fill: 'backwards'
      })
      animation.currentTime = clockMs - ride.startMs
      return [animation]
    })
    return () => {
      for (const animation of animations) animation.cancel()
    }
  }, [clockMs, level, rides])

  return groupRef
}
