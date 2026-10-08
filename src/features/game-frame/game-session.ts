import { Result } from '@adrienlcp/result'

import type { GameEngine } from './game-module'

/**
 * A puzzle being played: the level as printed, the moves in order, and every
 * board along the way so an undo costs nothing. Only the level and the moves
 * are saved; the boards come back by replaying.
 */
export type GameSession<Level, State, Move> = {
  readonly level: Level
  readonly moves: readonly Move[]
  readonly boards: readonly [State, ...State[]]
  readonly hintsUsed: number
}

type SessionEngine<Level, State, Move> = Pick<
  GameEngine<Level, State, Move, unknown>,
  'applyMove' | 'start'
>

export const startSession = <Level, State, Move>(
  engine: SessionEngine<Level, State, Move>,
  level: Level
): GameSession<Level, State, Move> => ({
  boards: [engine.start(level)],
  hintsUsed: 0,
  level,
  moves: []
})

export const currentBoard = <State>(session: {
  boards: readonly [State, ...State[]]
}): State => session.boards.at(-1) ?? session.boards[0]

export const playMove = <Level, State, Move>(
  engine: SessionEngine<Level, State, Move>,
  session: GameSession<Level, State, Move>,
  move: Move
): Result<GameSession<Level, State, Move>, 'illegal'> => {
  const next = engine.applyMove(currentBoard(session), move)
  if (next.status === 'failure') return next
  return Result.success({
    ...session,
    boards: [...session.boards, next.data.board],
    moves: [...session.moves, move]
  })
}

export const undoMove = <Level, State, Move>(
  session: GameSession<Level, State, Move>
): GameSession<Level, State, Move> => {
  const [first, ...rest] = session.boards
  if (rest.length === 0) return session
  return {
    ...session,
    boards: [first, ...rest.slice(0, -1)],
    moves: session.moves.slice(0, -1)
  }
}

export const canUndo = (session: { moves: readonly unknown[] }): boolean =>
  session.moves.length > 0

export const countHint = <Level, State, Move>(
  session: GameSession<Level, State, Move>
): GameSession<Level, State, Move> => ({
  ...session,
  hintsUsed: session.hintsUsed + 1
})

/**
 * A saved game brought back. `'illegal'` when a saved move no longer applies —
 * a save written by an older version of the rules — and the save is dropped.
 */
export const replaySession = <Level, State, Move>({
  engine,
  hintsUsed,
  level,
  moves
}: {
  engine: SessionEngine<Level, State, Move>
  level: Level
  moves: readonly Move[]
  hintsUsed: number
}): Result<GameSession<Level, State, Move>, 'illegal'> => {
  let session = { ...startSession(engine, level), hintsUsed }
  for (const move of moves) {
    const played = playMove(engine, session, move)
    if (played.status === 'failure') return played
    session = played.data
  }
  return Result.success(session)
}
