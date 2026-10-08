import { z } from 'zod/mini'

import type { ColorDotsLevel, ColorDotsPiece } from './color-dots-level'

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
 * What the last tap did, for the board to draw the ball's trip: the route it
 * rode, and the node that stopped it when it was blocked.
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

export type ColorDotsState = {
  readonly level: ColorDotsLevel
  readonly spots: readonly ColorDotsSpot[]
  readonly lastTap: ColorDotsTap | null
}

/** A tap on the ball at this node. */
export const colorDotsMoveSchema = z.object({
  ball: z.number().check(z.int(), z.gte(0))
})

export type ColorDotsMove = z.infer<typeof colorDotsMoveSchema>

export const spotOfPiece = (piece: ColorDotsPiece): ColorDotsSpot =>
  piece.kind === 'ring' ? { ...piece, isFilled: false } : piece

export const startColorDots = (level: ColorDotsLevel): ColorDotsState => ({
  lastTap: null,
  level,
  spots: level.nodes.map(({ piece }) => spotOfPiece(piece))
})
