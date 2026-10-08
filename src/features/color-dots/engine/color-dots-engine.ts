import { Result } from '@adrienlcp/result'

import type { GameEngine } from '@/features/game-frame/game-module'

import { type ColorDotsHint, colorDotsHintOf } from './color-dots-hint'
import { type ColorDotsLevel, colorDotsLevelSchema } from './color-dots-level'
import {
  type ColorDotsMove,
  type ColorDotsState,
  colorDotsMoveSchema,
  startColorDots
} from './color-dots-state'
import { tapBall } from './color-dots-tap'

const isLost = (state: ColorDotsState): boolean =>
  state.lastTap?.kind === 'blocked'

/**
 * Color Dots: send every ball to a ring of its colour. The order is the whole
 * puzzle — a ball that runs into another, or into a filled ring, loses.
 */
export const colorDotsEngine: GameEngine<
  ColorDotsLevel,
  ColorDotsState,
  ColorDotsMove,
  ColorDotsHint
> = {
  applyMove: (state, move) => {
    if (isLost(state)) return Result.failure('illegal')
    const tapped = tapBall({
      ball: move.ball,
      spots: state.spots,
      tree: state.level
    })
    if (tapped.status === 'failure') return tapped
    return Result.success({
      board: { ...state, lastTap: tapped.data.tap, spots: tapped.data.spots }
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
