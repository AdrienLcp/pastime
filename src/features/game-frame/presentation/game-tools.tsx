import type React from 'react'
import { useEffect, useState } from 'react'

import { Button } from '@/presentation/components/button'
import {
  HintIcon,
  NewLevelIcon,
  RestartIcon,
  UndoIcon
} from '@/presentation/components/icons'
import { useTranslate } from '@/presentation/i18n/i18n-provider'
import type { PlainTranslationKey } from '@/presentation/i18n/translation'

import './game-tools.sass'

type GameToolsProps = {
  canUndo: boolean
  /** Lost: the board waits for an undo, there is no step to hint at. */
  canHint: boolean
  /** Paused: the board is hidden, so nothing may change it. */
  isPaused: boolean
  onUndo: () => void
  onHint: () => void
  onRestart: () => void
  /** The tool's name: « new game », or the game's own word for it. */
  newLevelLabel: PlainTranslationKey
  /** Drops this level for the next one of the same variant. */
  onNewLevel: () => void
}

/** How long a first press on « new game » waits for the second. */
const CONFIRM_WINDOW_MS = 4000

/**
 * « New game » leaves a level with moves on it only on a second press, so a
 * stray tap under the thumb never throws a game away.
 */
const useConfirmedNewLevel = ({
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

/** The tools under the thumb, at the foot of every puzzle. */
export const GameTools: React.FC<GameToolsProps> = ({
  canHint,
  canUndo,
  isPaused,
  newLevelLabel,
  onHint,
  onNewLevel,
  onRestart,
  onUndo
}) => {
  const translate = useTranslate()
  const newLevel = useConfirmedNewLevel({ hasProgress: canUndo, onNewLevel })

  return (
    <nav aria-label={translate('frame.tools.label')} className='game-tools'>
      <Button
        className='tool'
        isDisabled={isPaused || !canUndo}
        onPress={onUndo}
      >
        <UndoIcon aria-hidden='true' />
        {translate('frame.tools.undo')}
      </Button>
      <Button
        className='tool'
        isDisabled={isPaused || !canHint}
        onPress={onHint}
      >
        <HintIcon aria-hidden='true' />
        {translate('frame.tools.hint')}
      </Button>
      <Button
        className='tool'
        isDisabled={isPaused || !canUndo}
        onPress={onRestart}
      >
        <RestartIcon aria-hidden='true' />
        {translate('frame.tools.restart')}
      </Button>
      <Button
        className='tool'
        data-armed={newLevel.isArmed || undefined}
        isDisabled={isPaused}
        onPress={newLevel.press}
      >
        <NewLevelIcon aria-hidden='true' />
        {translate(
          newLevel.isArmed ? 'frame.tools.newLevelConfirm' : newLevelLabel
        )}
      </Button>
    </nav>
  )
}
