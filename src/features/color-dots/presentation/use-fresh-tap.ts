import { useState } from 'react'

import type { ColorDotsTap } from '../engine/color-dots-state'

/**
 * The last tap while it is new to this board, for its ride to be drawn; `null`
 * once another tap took its place, or for a tap the board already showed — a
 * resumed game, an undo back to an earlier board. The win's plate is a new
 * board that shows the final ride.
 */
export const useFreshTap = ({
  isLocked,
  lastTap
}: {
  lastTap: ColorDotsTap | null
  isLocked: boolean
}): ColorDotsTap | null => {
  const [shown] = useState(
    () =>
      new WeakSet<ColorDotsTap>(lastTap !== null && !isLocked ? [lastTap] : [])
  )
  const [tracked, setTracked] = useState<{
    tap: ColorDotsTap | null
    fresh: ColorDotsTap | null
  }>(() => ({ fresh: isLocked ? lastTap : null, tap: lastTap }))

  if (tracked.tap !== lastTap) {
    const fresh = lastTap !== null && !shown.has(lastTap) ? lastTap : null
    if (lastTap !== null) shown.add(lastTap)
    setTracked({ fresh, tap: lastTap })
    return fresh
  }
  return tracked.fresh
}
