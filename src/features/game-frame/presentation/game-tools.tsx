import type React from 'react'

import { Button } from '@/presentation/components/button'
import {
  HintIcon,
  RestartIcon,
  UndoIcon
} from '@/presentation/components/icons'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

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
}

/** The three tools under the thumb, at the foot of every puzzle. */
export const GameTools: React.FC<GameToolsProps> = ({
  canHint,
  canUndo,
  isPaused,
  onHint,
  onRestart,
  onUndo
}) => {
  const translate = useTranslate()

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
    </nav>
  )
}
