import type React from 'react'

import { reloadPage } from '@/infrastructure/browser'
import { AppShell } from '@/presentation/app-shell'
import { Button } from '@/presentation/components/button'
import { Link } from '@/presentation/components/link'
import { Main } from '@/presentation/components/main'
import { DocumentTitle } from '@/presentation/head/document-title'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { paths, useCurrentPath, useRouteFailure } from './navigation'

import './route-error.sass'

/**
 * The root route's error boundary. It replaces the whole root route, so it
 * draws its own shell; without the router's link provider, the way back is a
 * full page load, which is also what clears a half-broken state.
 */
export const ErrorScreen: React.FC = () => {
  const translate = useTranslate()
  const reason = useRouteFailure()

  return (
    <AppShell>
      <Main className='route-error'>
        <DocumentTitle>{`${translate('crash.title')} — ${translate('app.name')}`}</DocumentTitle>
        <h1>{translate('crash.title')}</h1>
        <p>{translate('crash.prose')}</p>
        <p>
          {translate('crash.reason')} <code>{reason}</code>
        </p>
        <Button onPress={reloadPage}>{translate('crash.reload')}</Button>
      </Main>
    </AppShell>
  )
}

/** An address no route owns: said plainly, rather than silently rerouted. */
export const NotFoundPage: React.FC = () => {
  const translate = useTranslate()
  const path = useCurrentPath()

  return (
    <Main className='route-error'>
      <DocumentTitle>{`${translate('notFound.title')} — ${translate('app.name')}`}</DocumentTitle>
      <h1>{translate('notFound.title')}</h1>
      <p>{translate('notFound.prose', { path })}</p>
      <Link href={paths.hub}>{translate('notFound.toHub')}</Link>
    </Main>
  )
}
