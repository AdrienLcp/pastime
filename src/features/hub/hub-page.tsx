import type React from 'react'

import { Main } from '@/presentation/components/main'
import { DocumentTitle } from '@/presentation/head/document-title'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import './hub-page.sass'

/** The app's front page: where the game list will live. */
export const HubPage: React.FC = () => {
  const translate = useTranslate()

  return (
    <Main className='hub-page'>
      <DocumentTitle>{translate('app.name')}</DocumentTitle>
      <h1>{translate('app.name')}</h1>
      <p>{translate('hub.tagline')}</p>
    </Main>
  )
}
