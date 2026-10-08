import type React from 'react'
import { useEffect, useEffectEvent, useState } from 'react'

import { Button } from '@/presentation/components/button'
import { PauseIcon, ResumeIcon } from '@/presentation/components/icons'
import { formatClockTime } from '@/presentation/format/clock-time'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import type { GameClock as Clock } from './use-game-clock'

import './game-clock.sass'

/** Fast enough that a second never shows late; the board does not re-render. */
const CLOCK_REFRESH_MS = 250

type GameClockProps = {
  clock: Clock
  isRunning: boolean
  isPaused: boolean
  onPause: () => void
  onResume: () => void
}

/** The puzzle's time, ticking while it runs, and the button that pauses it. */
export const GameClock: React.FC<GameClockProps> = ({
  clock,
  isPaused,
  isRunning,
  onPause,
  onResume
}) => {
  const translate = useTranslate()
  const [shownMs, setShownMs] = useState(clock.readElapsedMs)
  const refresh = useEffectEvent(() => setShownMs(clock.readElapsedMs()))

  useEffect(() => {
    refresh()
    if (!isRunning) return
    const timer = window.setInterval(refresh, CLOCK_REFRESH_MS)
    return () => window.clearInterval(timer)
  }, [isRunning])

  return (
    <div className='game-clock'>
      <span aria-hidden='true' className='clock-label'>
        {translate('frame.clock')}
      </span>
      <span
        aria-label={translate('frame.clock')}
        className='clock-face'
        role='timer'
      >
        {formatClockTime(shownMs)}
      </span>
      <Button
        aria-label={translate(isPaused ? 'frame.paused.resume' : 'frame.pause')}
        className='clock-toggle'
        onPress={isPaused ? onResume : onPause}
      >
        {isPaused ? (
          <ResumeIcon aria-hidden='true' />
        ) : (
          <PauseIcon aria-hidden='true' />
        )}
      </Button>
    </div>
  )
}
