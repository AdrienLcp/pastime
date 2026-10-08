import type React from 'react'

import { HintIcon, UndoIcon } from '@/presentation/components/icons'
import { useTranslate } from '@/presentation/i18n/i18n-provider'
import type { PlainTranslationKey } from '@/presentation/i18n/translation'

import './hint-note.sass'

/**
 * The hint in words, under the board: what the circled cell means, or that
 * there is none to give. Announced as it appears, since the board only rings it.
 */
export const HintNote: React.FC<{
  explanation: PlainTranslationKey | null
}> = ({ explanation }) => {
  const translate = useTranslate()

  return (
    <div aria-live='polite' className='hint-note-slot'>
      {explanation !== null && (
        <p className='hint-note'>
          <HintIcon aria-hidden='true' />
          <span>
            <b>{translate('frame.hint.label')}</b> {translate(explanation)}
          </span>
        </p>
      )}
    </div>
  )
}

/**
 * In the hint's place once a wrong move ended the puzzle: what happened, and
 * the two ways on. Announced as it appears.
 */
export const LostNote: React.FC = () => {
  const translate = useTranslate()

  return (
    <div aria-live='assertive' className='hint-note-slot'>
      <p className='hint-note'>
        <UndoIcon aria-hidden='true' />
        <span>
          <b>{translate('frame.lost.label')}</b> {translate('frame.lost.prose')}
        </span>
      </p>
    </div>
  )
}
