import { useEffect, useState } from 'react'

/** How long a first press on « new game » waits for the second. */
const CONFIRM_WINDOW_MS = 4000

/**
 * « New game » leaves a level with moves on it only on a second press, so a
 * stray tap under the thumb never throws a game away.
 */
export const useConfirmedNewLevel = ({
  hasProgress,
  onNewLevel
}: {
  hasProgress: boolean
  onNewLevel: () => void
}) => {
  const [isArmed, setArmed] = useState(false)

  useEffect(() => {
    if (!isArmed) return
    const timer = window.setTimeout(() => setArmed(false), CONFIRM_WINDOW_MS)
    return () => window.clearTimeout(timer)
  }, [isArmed])

  return {
    isArmed: isArmed && hasProgress,
    press: () => {
      if (hasProgress && !isArmed) return setArmed(true)
      setArmed(false)
      onNewLevel()
    }
  }
}
