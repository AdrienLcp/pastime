import { Result } from '@adrienlcp/result'

import type { GameEngine } from '@/features/game-frame/game-module'

import { type ColorDotsHint, colorDotsHintOf } from './color-dots-hint'
import { type ColorDotsLevel, colorDotsLevelSchema } from './color-dots-level'
import {
  BALL_WIDTH,
  type ColorDotsRide,
  rideEndMsOf,
  rollOn
} from './color-dots-ride'
import {
  type ColorDotsMove,
  type ColorDotsSpot,
  type ColorDotsState,
  type ColorDotsTap,
  colorDotsMoveSchema,
  startColorDots
} from './color-dots-state'
import { tapBall } from './color-dots-tap'
import { routeLength } from './color-dots-tree'

const isLost = (state: ColorDotsState): boolean =>
  state.rides.some((ride) => ride.end.kind === 'pops')

/** A blocked ball rides on until it touches its blocker, and pops there. */
const rideOf = ({
  clockMs,
  level,
  tap
}: {
  level: ColorDotsLevel
  tap: ColorDotsTap
  clockMs: number
}): ColorDotsRide => {
  const { ball, colour } = tap
  if (tap.kind === 'arrived')
    return {
      ball,
      colour,
      end: { kind: 'lands' },
      route: tap.route,
      startMs: clockMs
    }
  const route = [...tap.route, tap.blocker]
  return {
    ball,
    colour,
    end: {
      kind: 'pops',
      steps: Math.max(0, routeLength({ route, tree: level }) - BALL_WIDTH)
    },
    route,
    startMs: clockMs
  }
}

/** A ball that was to land and popped on the way leaves its ring empty. */
const emptyPoppedRings = ({
  rides,
  spots
}: {
  spots: readonly ColorDotsSpot[]
  rides: readonly ColorDotsRide[]
}): readonly ColorDotsSpot[] =>
  rides.reduce((board, ride) => {
    const ring = ride.route.at(-1)
    const spot = ring === undefined ? undefined : board[ring]
    if (ride.end.kind !== 'pops' || ring === undefined || spot?.kind !== 'ring')
      return board
    if (!spot.isFilled || spot.colour !== ride.colour) return board
    return board.with(ring, { ...spot, isFilled: false })
  }, spots)

/**
 * Color Dots: send every ball to a ring of its colour. The order is the whole
 * puzzle — a ball that runs into another, waiting, landed or on its way, or
 * into a filled ring, pops and loses.
 */
export const colorDotsEngine: GameEngine<
  ColorDotsLevel,
  ColorDotsState,
  ColorDotsMove,
  ColorDotsHint
> = {
  applyMove: (state, move) => {
    if (isLost(state)) return Result.failure('illegal')
    const { level } = state
    const settledMs = Math.max(
      state.clockMs,
      ...state.rides.map((ride) => rideEndMsOf(ride, level))
    )
    const clockMs =
      move.afterMs === undefined ? settledMs : state.clockMs + move.afterMs
    const rolling = state.rides.filter(
      (ride) => rideEndMsOf(ride, level) > clockMs
    )
    const tapped = tapBall({
      ball: move.ball,
      landing: new Set(rolling.flatMap((ride) => ride.route.slice(-1))),
      spots: state.spots,
      tree: level
    })
    if (tapped.status === 'failure') return tapped
    const ride = rideOf({ clockMs, level, tap: tapped.data.tap })
    const rides = rollOn({ ride, rolling, tree: level })
    const poppedFromLanding = rides.filter(
      (each, index) =>
        each.end.kind === 'pops' &&
        (index < rolling.length || tapped.data.tap.kind === 'arrived')
    )
    return Result.success({
      board: {
        clockMs,
        level,
        rides,
        spots: emptyPoppedRings({
          rides: poppedFromLanding,
          spots: tapped.data.spots
        })
      }
    })
  },
  hint: colorDotsHintOf,
  isLost,
  isWon: (state) =>
    !isLost(state) && state.spots.every((spot) => spot.kind !== 'ball'),
  levelSchema: colorDotsLevelSchema,
  moveSchema: colorDotsMoveSchema,
  start: startColorDots
}
