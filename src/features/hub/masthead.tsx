import type React from 'react'

import { settingsPathFor } from '@/infrastructure/router/navigation'
import { SettingsIcon } from '@/presentation/components/icons'
import { Link } from '@/presentation/components/link'
import { useI18n } from '@/presentation/i18n/i18n-provider'

import './masthead.sass'

/** The booklet's cover band: the four chapter inks and its name. */
export const Masthead: React.FC = () => {
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
    </header>
  )
}
