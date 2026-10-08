import type React from 'react'
import { Label, Radio, RadioGroup } from 'react-aria-components'

import { Button } from '@/presentation/components/button'
import { NextIcon } from '@/presentation/components/icons'
import { useTranslate } from '@/presentation/i18n/i18n-provider'
import type { PlainTranslationKey } from '@/presentation/i18n/translation'

import type { GameDefinition } from '../game-definition'
import { useConfirmedNewLevel } from './use-confirmed-new-level'

import './variant-panel.sass'

type VariantPanelProps = {
  game: GameDefinition
  /** The variant picked here: the one on the board until another is pressed. */
  pickedId: string
  onPick: (variantId: string) => void
  /** Moves were played: leaving the level asks once. */
  hasProgress: boolean
  /** The action's name: « new game », or the game's own word for it. */
  newLevelLabel: PlainTranslationKey
  /** Starts a level of the picked variant. */
  onPlay: () => void
  onClose: () => void
  /** The game's own settings, under the variants. */
  Options?: React.FC
}

/**
 * Another size, deal or difficulty, chosen in place of the tools while the
 * board stays on the page; then the game's own settings, if it has any.
 */
export const VariantPanel: React.FC<VariantPanelProps> = ({
  game,
  hasProgress,
  newLevelLabel,
  onClose,
  onPick,
  onPlay,
  Options,
  pickedId
}) => {
  const translate = useTranslate()
  const play = useConfirmedNewLevel({ hasProgress, onNewLevel: onPlay })
  const hasNotes = game.variants.some((each) => each.note !== undefined)
  const panelLabel =
    Options === undefined ? game.variantChoice : 'frame.tools.settings'

  return (
    <section
      aria-label={translate(panelLabel)}
      className='variant-panel'
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose()
      }}
    >
      <RadioGroup className='variant-group' onChange={onPick} value={pickedId}>
        <Label className='choice-head'>{translate(game.variantChoice)}</Label>
        <div className='variant-options' data-wide={hasNotes || undefined}>
          {game.variants.map((each) => (
            <Radio
              autoFocus={each.id === pickedId}
              className='variant-option'
              key={each.id}
              value={each.id}
            >
              <span>{translate(each.label)}</span>
              {each.note !== undefined && (
                <small className='variant-note'>{translate(each.note)}</small>
              )}
            </Radio>
          ))}
        </div>
      </RadioGroup>

      {Options !== undefined && (
        <div className='game-options'>
          <Options />
        </div>
      )}

      <div className='variant-actions'>
        <Button
          className='choice-action'
          data-armed={play.isArmed || undefined}
          onPress={play.press}
          variant='ink'
        >
          {translate(
            play.isArmed ? 'frame.tools.newLevelConfirm' : newLevelLabel
          )}
          <NextIcon aria-hidden='true' />
        </Button>
        <Button className='choice-action' onPress={onClose} variant='line'>
          {translate('frame.choose.close')}
        </Button>
      </div>
    </section>
  )
}
