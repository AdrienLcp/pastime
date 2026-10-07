import type React from 'react'

import { Main } from '@/presentation/components/main'
import { DocumentTitle } from '@/presentation/head/document-title'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { Masthead } from './masthead'

import './hub-page.sass'

/** The booklet's front page: its cover band, then where the games will live. */
export const HubPage: React.FC = () => {
  const translate = useTranslate()

  return (
    <Main className='hub-page'>
      <DocumentTitle>{translate('app.name')}</DocumentTitle>
      <Masthead />
      <p className='tagline'>{translate('hub.tagline')}</p>
    </Main>
  )
}
