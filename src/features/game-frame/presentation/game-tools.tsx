import type React from 'react'

import { Button } from '@/presentation/components/button'
import {
  HintIcon,
  NewLevelIcon,
  UndoIcon,
  VariantIcon
} from '@/presentation/components/icons'
import { useTranslate } from '@/presentation/i18n/i18n-provider'
import type { PlainTranslationKey } from '@/presentation/i18n/translation'

import { useConfirmedNewLevel } from './use-confirmed-new-level'

import './game-tools.sass'

type GameToolsProps = {
  canUndo: boolean
  /** Lost: the board waits for an undo, there is no step to hint at. */
  canHint: boolean
  /** Paused: the board is hidden, so nothing may change it. */
  isPaused: boolean
  onUndo: () => void
  onHint: () => void
  /** The tool's name: « new game », or the game's own word for it. */
  newLevelLabel: PlainTranslationKey
  /** Drops this level for the next one of the same variant. */
  onNewLevel: () => void
  /** What the variants differ by — « Taille », « Donne » — naming the tool that changes it. */
  variantLabel: PlainTranslationKey
  /** Opens the choice of another variant, in place of the tools. */
  onChooseVariant: () => void
}

/** The tools under the thumb, at the foot of every puzzle. */
export const GameTools: React.FC<GameToolsProps> = ({
  canHint,
  canUndo,
  isPaused,
  newLevelLabel,
  onChooseVariant,
  onHint,
  onNewLevel,
  onUndo,
  variantLabel
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
        data-armed={newLevel.isArmed || undefined}
        isDisabled={isPaused}
        onPress={newLevel.press}
      >
        <NewLevelIcon aria-hidden='true' />
        {translate(
          newLevel.isArmed ? 'frame.tools.newLevelConfirm' : newLevelLabel
        )}
      </Button>
      <Button className='tool' isDisabled={isPaused} onPress={onChooseVariant}>
        <VariantIcon aria-hidden='true' />
        {translate(variantLabel)}
      </Button>
    </nav>
  )
}
