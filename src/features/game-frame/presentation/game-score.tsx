import type React from 'react'

import { useTranslate } from '@/presentation/i18n/i18n-provider'

import './game-score.sass'

/** The points so far, in the band beside the clock. */
export const GameScore: React.FC<{ points: number }> = ({ points }) => {
  const translate = useTranslate()

  return (
    <p className='game-score'>
      <span className='score-label'>{translate('frame.score.label')} </span>
      <span className='score-face'>
        {translate('frame.score.points', { points })}
      </span>
      <span aria-hidden='true' className='score-unit'>
        {translate('frame.score.unit')}
      </span>
    </p>
  )
}
