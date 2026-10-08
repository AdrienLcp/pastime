import { z } from 'zod/mini'

import type { ColorDotsLevel, ColorDotsPiece } from './color-dots-level'
import type { ColorDotsRide } from './color-dots-ride'

/**
 * A node as play left it: a ball still waiting, a ring empty or filled, a
 * joint, or nothing — a node whose ball left and whose branch went with it.
 */
export type ColorDotsSpot =
  | { readonly kind: 'ball'; readonly colour: number }
  | {
      readonly kind: 'ring'
      readonly colour: number
      readonly isFilled: boolean
    }
  | { readonly kind: 'joint' }
  | { readonly kind: 'gone' }

/**
 * What a tap does when every ball sent before has landed: the route the ball
 * rides, and the node that stops it when it is blocked.
 */
export type ColorDotsTap =
  | {
      readonly kind: 'arrived'
      readonly ball: number
      readonly colour: number
      readonly route: readonly number[]
    }
  | {
      readonly kind: 'blocked'
      readonly ball: number
      readonly colour: number
      /** From the ball to the node before the blocker. */
      readonly route: readonly number[]
      readonly blocker: number
    }

/**
 * The board as one-ball-at-a-time play leaves it — a ball on its way already
 * gone from its node, its ring already taken — with the rides still rolling
 * at the last tap, that tap's own last, for the board to draw. `clockMs` is
 * when the last tap came.
 */
export type ColorDotsState = {
  readonly level: ColorDotsLevel
  readonly spots: readonly ColorDotsSpot[]
  readonly clockMs: number
  readonly rides: readonly ColorDotsRide[]
}

/**
 * A tap on the ball at this node, `afterMs` after the previous one. Without
 * it, every ball sent before has landed: the solver's taps, and every tap
 * under reduced motion.
 */
export const colorDotsMoveSchema = z.object({
  afterMs: z.optional(z.number().check(z.int(), z.gte(0))),
  ball: z.number().check(z.int(), z.gte(0))
})

export type ColorDotsMove = z.infer<typeof colorDotsMoveSchema>

export const spotOfPiece = (piece: ColorDotsPiece): ColorDotsSpot =>
  piece.kind === 'ring' ? { ...piece, isFilled: false } : piece

export const startColorDots = (level: ColorDotsLevel): ColorDotsState => ({
  clockMs: 0,
  level,
  rides: [],
  spots: level.nodes.map(({ piece }) => spotOfPiece(piece))
})
