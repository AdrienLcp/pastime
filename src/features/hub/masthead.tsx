import type React from 'react'

import { today } from '@/infrastructure/clock'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import './masthead.sass'

/** The booklet's cover band: the four chapter inks, its name, today's issue. */
export const Masthead: React.FC = () => {
  const translate = useTranslate()
  const issueDay = today()

  return (
    <header className='masthead'>
      <div aria-hidden='true' className='ink-bar'>
        <i className='ink pipes' />
        <i className='ink solitaire' />
        <i className='ink stars' />
        <i className='ink color-dots' />
        <i className='ink key' />
      </div>
      <h1 className='masthead-title'>{translate('app.name')}</h1>
      <div className='masthead-rule' />
      <p className='issue-line'>
        <time dateTime={issueDay.toString()}>
          {translate('hub.issue', { day: issueDay })}
        </time>
      </p>
    </header>
  )
}
