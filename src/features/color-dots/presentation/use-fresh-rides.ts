import { useState } from 'react'

import type { ColorDotsRide } from '../engine/color-dots-ride'

type Rides = readonly ColorDotsRide[]

/**
 * The rides of the last tap while they are new to this board, for them to be
 * drawn rolling; `null` once another tap took their place, or for rides the
 * board already showed — a resumed game, an undo back to an earlier board.
 * The win's plate is a new board that shows the final rides.
 */
export const useFreshRides = ({
  isLocked,
  rides
}: {
  rides: Rides
  isLocked: boolean
}): Rides | null => {
  const [shown] = useState(
    () => new WeakSet<Rides>(rides.length > 0 && !isLocked ? [rides] : [])
  )
  const [tracked, setTracked] = useState<{
    rides: Rides
    fresh: Rides | null
  }>(() => ({ fresh: isLocked && rides.length > 0 ? rides : null, rides }))

  if (tracked.rides !== rides) {
    const fresh = rides.length > 0 && !shown.has(rides) ? rides : null
    shown.add(rides)
    setTracked({ fresh, rides })
    return fresh
  }
  return tracked.fresh
}
