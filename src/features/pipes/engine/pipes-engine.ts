import { Result } from '@adrienlcp/result'

import type { GameEngine } from '@/features/game-frame/game-module'

import { type PipesHint, pipesHintOf } from './pipes-hint'
import { type PipesLevel, pipesLevelSchema } from './pipes-level'
import { isPipesSolved } from './pipes-network'
import { type PipesMove, type PipesState, pipesMoveSchema } from './pipes-state'

export const startPipes = (level: PipesLevel): PipesState => ({
  level,
  locked: Array<boolean>(level.tiles.length).fill(false),
  turns: Array<number>(level.tiles.length).fill(0)
})

/**
 * Pipes: turn every tile until water from the source reaches them all, with
 * no open end and no loop. A locked tile refuses to turn.
 */
export const pipesEngine: GameEngine<
  PipesLevel,
  PipesState,
  PipesMove,
  PipesHint
> = {
  applyMove: (state, move) => {
    if (move.cell >= state.turns.length) return Result.failure('illegal')
    if (move.kind === 'lock')
      return Result.success({
        board: {
          ...state,
          locked: state.locked.with(move.cell, !state.locked[move.cell])
        }
      })
    if (state.locked[move.cell]) return Result.failure('illegal')
    const turned = ((state.turns[move.cell] ?? 0) + move.quarterTurns) % 4
    return Result.success({
      board: { ...state, turns: state.turns.with(move.cell, turned) }
    })
  },
  hint: pipesHintOf,
  isWon: isPipesSolved,
  levelSchema: pipesLevelSchema,
  moveSchema: pipesMoveSchema,
  start: startPipes
}
