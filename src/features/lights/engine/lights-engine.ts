import { Result } from '@adrienlcp/result'
import { z } from 'zod/mini'

import type { GameEngine } from '@/features/game-frame/game-module'

import { solveLights } from '../solver/lights-solver'

/**
 * Lights, the frame's placeholder game: a square of lamps; pressing one flips
 * it and its four neighbours; the puzzle is solved when every lamp is off.
 */
export const lightsSchema = z
  .object({
    lit: z.array(z.boolean()),
    size: z.number().check(z.int(), z.gte(2), z.lte(6))
  })
  .check(
    z.refine((board) => board.lit.length === board.size * board.size, {
      message: 'one lamp per cell'
    })
  )

export type LightsBoard = z.infer<typeof lightsSchema>

export const lightsMoveSchema = z.object({ cell: z.number().check(z.int()) })

export type LightsMove = z.infer<typeof lightsMoveSchema>

/** The lamp a hint points at: pressing it is part of a shortest way out. */
export type LightsHint = { readonly cell: number }

export const pressLamp = (board: LightsBoard, cell: number): LightsBoard => {
  const row = Math.floor(cell / board.size)
  const column = cell % board.size
  const flipped = new Set([cell])
  if (row > 0) flipped.add(cell - board.size)
  if (row < board.size - 1) flipped.add(cell + board.size)
  if (column > 0) flipped.add(cell - 1)
  if (column < board.size - 1) flipped.add(cell + 1)
  return {
    ...board,
    lit: board.lit.map((isLit, index) => (flipped.has(index) ? !isLit : isLit))
  }
}

export const isDark = (board: LightsBoard): boolean =>
  board.lit.every((isLit) => !isLit)

export const lightsEngine: GameEngine<
  LightsBoard,
  LightsBoard,
  LightsMove,
  LightsHint
> = {
  applyMove: (board, { cell }) =>
    Number.isInteger(cell) && cell >= 0 && cell < board.lit.length
      ? Result.success({ board: pressLamp(board, cell) })
      : Result.failure('illegal'),
  hint: (board) => {
    const presses = solveLights(board)
    const cell = presses?.[0]
    return cell === undefined ? null : { cell }
  },
  isWon: isDark,
  levelSchema: lightsSchema,
  moveSchema: lightsMoveSchema,
  start: (level) => level
}
