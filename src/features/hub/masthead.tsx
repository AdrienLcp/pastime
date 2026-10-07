import type React from 'react'

import { issueNumber } from '@/features/game-frame/puzzle'
import { settingsPathFor } from '@/infrastructure/router/navigation'
import { SettingsIcon } from '@/presentation/components/icons'
import { Link } from '@/presentation/components/link'
import { useI18n } from '@/presentation/i18n/i18n-provider'

import './masthead.sass'

type MastheadProps = {
  issueDay: Temporal.PlainDate
  /** Days in a row with a daily solved; `0` prints a dash. */
  streak: number
}

/** The booklet's cover band: the four chapter inks, its name, today's issue. */
export const Masthead: React.FC<MastheadProps> = ({ issueDay, streak }) => {
  const { locale, translate } = useI18n()

  return (
    <header className='masthead'>
      <div className='masthead-top'>
        <div aria-hidden='true' className='ink-bar'>
          <i className='ink pipes' />
          <i className='ink solitaire' />
          <i className='ink stars' />
          <i className='ink color-dots' />
          <i className='ink key' />
        </div>
        <Link
          aria-label={translate('hub.settings')}
          className='settings-link'
          href={settingsPathFor(locale)}
        >
          <SettingsIcon aria-hidden='true' />
        </Link>
      </div>
      <h1 className='masthead-title'>{translate('app.name')}</h1>
      <div className='masthead-rule' />
      <div className='issue-line'>
        <time dateTime={issueDay.toString()}>
          {translate('hub.issue', {
            day: issueDay,
            number: issueNumber(issueDay)
          })}
        </time>
        <p className='streak'>
          {translate('hub.streak')}{' '}
          <b>
            {streak === 0
              ? '—'
              : translate('hub.streakDays', { count: streak })}
          </b>
        </p>
      </div>
    </header>
  )
}
