import { Result } from '@adrienlcp/result'
import { describe, expect, it } from 'vitest'

import {
  canUndo,
  countHint,
  currentBoard,
  playMove,
  replaySession,
  restartSession,
  startSession,
  undoMove
} from './game-session'

/** Climb from the level to ten, one or two steps at a time; never past ten. */
const climb = {
  applyMove: (state: number, move: number) =>
    move < 1 || move > 2 || state + move > 10
      ? Result.failure('illegal' as const)
      : Result.success({ board: state + move }),
  start: (level: number) => level
}

const played = (moves: number[]) => {
  const replayed = replaySession({
    engine: climb,
    hintsUsed: 0,
    level: 3,
    moves
  })
  if (replayed.status === 'failure') throw new Error('fixture does not replay')
  return replayed.data
}

describe('game session', () => {
  it('[game-session] starts on the printed level with nothing to undo', () => {
    const session = startSession(climb, 3)
    expect(currentBoard(session)).toBe(3)
    expect(canUndo(session)).toBe(false)
  })

  it('[game-session] plays a move onto the board and keeps it', () => {
    const session = played([2, 1])
    expect(currentBoard(session)).toBe(6)
    expect(session.moves).toEqual([2, 1])
  })

  it('[game-session] refuses a move the rules refuse and changes nothing', () => {
    const session = played([2, 2, 2])
    expect(playMove(climb, session, 2)).toEqual(Result.failure('illegal'))
    expect(currentBoard(session)).toBe(9)
  })

  it('[game-session] undoes back to the previous board, then stops at the level', () => {
    const once = undoMove(played([2, 1]))
    expect(currentBoard(once)).toBe(5)
    expect(once.moves).toEqual([2])
    const empty = undoMove(undoMove(once))
    expect(currentBoard(empty)).toBe(3)
    expect(empty.moves).toEqual([])
  })

  it('[game-session] restarts on the level and keeps the hints counted', () => {
    const restarted = restartSession(countHint(played([1, 1])))
    expect(currentBoard(restarted)).toBe(3)
    expect(restarted.moves).toEqual([])
    expect(restarted.hintsUsed).toBe(1)
  })

  it('[game-session] drops a save whose moves no longer apply', () => {
    expect(
      replaySession({ engine: climb, hintsUsed: 0, level: 3, moves: [2, 9] })
    ).toEqual(Result.failure('illegal'))
  })
})
