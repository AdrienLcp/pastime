import { useEffect, useRef } from 'react'

import { elapsedClockMs } from '@/infrastructure/clock'

export type GameClock = {
  /** The puzzle's time so far, read at the moment of the call. */
  readonly readElapsedMs: () => number
  readonly restartAt: (elapsedMs: number) => void
}

/**
 * The time a puzzle has taken, counted only while it runs: the caller stops it
 * on pause, when the page is hidden and once the puzzle is solved. Held in refs
 * so a running clock never re-renders the board; `GameClockFace` shows it.
 */
export const useGameClock = ({
  initialMs,
  isRunning
}: {
  initialMs: number
  isRunning: boolean
}): GameClock => {
  const stoppedMs = useRef(initialMs)
  const runningSince = useRef<number | null>(null)

  useEffect(() => {
    if (!isRunning) return
    runningSince.current = elapsedClockMs()
    return () => {
      if (runningSince.current !== null) {
        stoppedMs.current += elapsedClockMs() - runningSince.current
      }
      runningSince.current = null
    }
  }, [isRunning])

  return {
    readElapsedMs: () =>
      stoppedMs.current +
      (runningSince.current === null
        ? 0
        : elapsedClockMs() - runningSince.current),
    restartAt: (elapsedMs) => {
      stoppedMs.current = elapsedMs
      if (runningSince.current !== null) runningSince.current = elapsedClockMs()
    }
  }
}
