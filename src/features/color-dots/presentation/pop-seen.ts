import { motionDurationMs } from '@/infrastructure/browser'

import type { ColorDotsState } from '../engine/color-dots-state'
import { isMotionReduced, msLeftOf } from './use-ride-motion'

/** How long until the ball that lost is seen popping: the rest of its ride, then its splash. */
export const popSeenInMs = ({
  clockMs,
  level,
  rides
}: ColorDotsState): number => {
  const popped = rides.find((ride) => ride.end.kind === 'pops')
  if (popped === undefined || isMotionReduced()) return 0
  return (
    msLeftOf({ clockMs, level, ride: popped }) +
    motionDurationMs('--transition-base')
  )
}
