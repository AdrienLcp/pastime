import { Result } from '@adrienlcp/result'

import type { GameEngine } from '@/features/game-frame/game-module'

import { isStarsSolved } from './stars-conflicts'
import { type StarsHint, starsHintOf } from './stars-hint'
import { type StarsLevel, starsLevelSchema } from './stars-level'
import {
  type StarsMark,
  type StarsMove,
  type StarsState,
  starsMoveSchema
} from './stars-state'

const NEXT_MARK = {
  blank: 'cross',
  cross: 'star',
  star: 'blank'
} as const satisfies Record<StarsMark, StarsMark>

/** The marks once a move is written, whether or not it changes any. */
export const marksAfter = (
  marks: readonly StarsMark[],
  move: StarsMove
): StarsMark[] => {
  switch (move.kind) {
    case 'cross':
      return marks.with(
        move.cell,
        marks[move.cell] === 'blank' ? 'cross' : 'blank'
      )
    case 'cycle':
      return marks.with(move.cell, NEXT_MARK[marks[move.cell] ?? 'blank'])
    case 'star':
      return marks.with(
        move.cell,
        marks[move.cell] === 'star' ? 'blank' : 'star'
      )
    case 'mark': {
      const marked = new Set(move.cells)
      return marks.map((mark, cell) =>
        marked.has(cell) && mark !== 'star' ? move.mark : mark
      )
    }
    default:
      return move satisfies never
  }
}

const cellsOf = (move: StarsMove) =>
  move.kind === 'mark' ? move.cells : [move.cell]

export const startStars = (level: StarsLevel): StarsState => ({
  level,
  marks: Array<StarsMark>(level.size * level.size).fill('blank')
})

/**
 * Stars: one star (two on the 2★ grids) in every row, column and region, no
 * two touching. A move that changes nothing — a drag over stars only — is
 * refused, so it never takes an undo.
 */
export const starsEngine: GameEngine<
  StarsLevel,
  StarsState,
  StarsMove,
  StarsHint
> = {
  applyMove: (state, move) => {
    const isOnBoard = cellsOf(move).every((cell) => cell < state.marks.length)
    if (!isOnBoard) return Result.failure('illegal')
    const marks = marksAfter(state.marks, move)
    const hasChanged = marks.some((mark, cell) => mark !== state.marks[cell])
    return hasChanged
      ? Result.success({ board: { ...state, marks } })
      : Result.failure('illegal')
  },
  hint: starsHintOf,
  isWon: isStarsSolved,
  levelSchema: starsLevelSchema,
  moveSchema: starsMoveSchema,
  start: startStars
}
