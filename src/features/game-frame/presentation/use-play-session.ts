import { useEffect, useEffectEvent, useState } from 'react'

import { usePlaySettings } from '@/features/settings/use-play-settings'
import {
  tapHaptic,
  usePageVisible,
  useScreenAwake
} from '@/infrastructure/browser'
import { nowMs } from '@/infrastructure/clock'

import type { PreparedPlay } from '../game-loader'
import {
  canUndo,
  countHint,
  currentBoard,
  type GameSession,
  playMove,
  restartSession,
  startSession,
  undoMove
} from '../game-session'
import { dropSavedGame, saveGame, saveWin } from '../game-storage'
import { type GameClock, useGameClock } from './use-game-clock'
import { type WinSummary, winSummaryOf } from './win-summary'

export type PlayStatus = 'lost' | 'paused' | 'playing' | 'won'

/** What the hint button last produced: a step to show, or nothing to give. */
export type ShownHint<Hint> =
  | { readonly kind: 'step'; readonly hint: Hint }
  | { readonly kind: 'none' }

export type PlaySessionControls<State, Move, Hint> = {
  readonly board: State
  readonly status: PlayStatus
  readonly shownHint: ShownHint<Hint> | null
  readonly win: WinSummary | null
  readonly clock: GameClock
  readonly isClockRunning: boolean
  readonly canUndo: boolean
  readonly move: (move: Move) => void
  readonly undo: () => void
  readonly restart: () => void
  readonly showHint: () => void
  readonly pause: () => void
  readonly resume: () => void
  readonly replay: () => void
}

/**
 * One puzzle in play: moves, undo, hints, the clock, the pause, the save on
 * every change, the win and — in a game a wrong move ends — the loss. The clock runs only while the puzzle is playing
 * and the page is in front of the player; hiding the page pauses the puzzle.
 */
export const usePlaySession = <Level, State, Move, Hint>(
  play: PreparedPlay<Level, State, Move, Hint>
): PlaySessionControls<State, Move, Hint> => {
  const { engine } = play.module
  const { puzzle } = play
  const [session, setSession] = useState(play.session)
  const isLost = (board: State) => engine.isLost?.(board) ?? false
  const [status, setStatus] = useState<PlayStatus>(() =>
    isLost(currentBoard(play.session)) ? 'lost' : 'playing'
  )
  const [shownHint, setShownHint] = useState<ShownHint<Hint> | null>(null)
  const [win, setWin] = useState<WinSummary | null>(null)
  const settings = usePlaySettings()
  const isPageVisible = usePageVisible()
  const isClockRunning = status === 'playing' && isPageVisible
  const clock = useGameClock({
    initialMs: play.elapsedMs,
    isRunning: isClockRunning
  })
  useScreenAwake(isClockRunning)

  const save = (saved: GameSession<Level, State, Move>) => {
    saveGame({
      elapsedMs: clock.readElapsedMs(),
      hintsUsed: saved.hintsUsed,
      level: saved.level,
      moves: [...saved.moves],
      puzzle,
      savedAtMs: nowMs()
    })
  }

  const change = (next: GameSession<Level, State, Move>) => {
    setSession(next)
    setShownHint(null)
    setStatus(isLost(currentBoard(next)) ? 'lost' : 'playing')
    save(next)
  }

  const pauseOnHide = useEffectEvent(() => {
    if (status !== 'playing') return
    setStatus('paused')
    save(session)
  })

  useEffect(() => {
    if (!isPageVisible) pauseOnHide()
  }, [isPageVisible])

  const finish = (solved: GameSession<Level, State, Move>) => {
    const elapsedMs = clock.readElapsedMs()
    setSession(solved)
    setShownHint(null)
    setStatus('won')
    dropSavedGame(puzzle.gameId)
    const moveCount = solved.moves.length
    setWin(
      winSummaryOf({
        elapsedMs,
        moveCount,
        ...saveWin({ elapsedMs, moveCount, puzzle })
      })
    )
  }

  return {
    board: currentBoard(session),
    canUndo: canUndo(session),
    clock,
    isClockRunning,
    move: (move) => {
      if (status !== 'playing') return
      const played = playMove(engine, session, move)
      if (played.status === 'failure') return
      if (settings.haptics) tapHaptic()
      if (engine.isWon(currentBoard(played.data))) return finish(played.data)
      change(played.data)
    },
    pause: () => {
      if (status !== 'playing') return
      setStatus('paused')
      save(session)
    },
    replay: () => {
      const fresh = startSession(engine, session.level)
      clock.restartAt(0)
      setWin(null)
      change(fresh)
    },
    restart: () => change(restartSession(session)),
    resume: () => {
      if (status === 'paused') setStatus('playing')
    },
    showHint: () => {
      const hint = engine.hint(currentBoard(session))
      if (hint === null) return setShownHint({ kind: 'none' })
      const counted = countHint(session)
      setSession(counted)
      setShownHint({ hint, kind: 'step' })
      save(counted)
    },
    shownHint,
    status,
    undo: () => change(undoMove(session)),
    win
  }
}
