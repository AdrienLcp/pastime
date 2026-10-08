import type React from 'react'

import {
  useReloadRouteData,
  useRouteData
} from '@/infrastructure/router/navigation'
import { NotFoundPage } from '@/infrastructure/router/route-error'
import { Button } from '@/presentation/components/button'
import { Main } from '@/presentation/components/main'
import { DocumentTitle } from '@/presentation/head/document-title'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import type { GameDefinition } from '../game-definition'
import type { GameLoaderData } from '../game-loader'
import { PlaySession } from './play-session'

import './game-page.sass'

const useGameData = () => useRouteData<GameLoaderData>()

const PrintFailed: React.FC<{ game: GameDefinition }> = ({ game }) => {
  const translate = useTranslate()
  const reloadRouteData = useReloadRouteData()

  return (
    <Main
      className='print-failed'
      style={{ '--chapter': `var(${game.chapterInk})` }}
    >
      <DocumentTitle>{`${translate('frame.failed.title')} — ${translate('app.name')}`}</DocumentTitle>
      <h1>{translate('frame.failed.title')}</h1>
      <p>{translate('frame.failed.prose')}</p>
      <Button onPress={reloadRouteData} variant='ink'>
        {translate('frame.failed.retry')}
      </Button>
    </Main>
  )
}

/** A game's page: whatever its loader prepared. */
export const GamePage: React.FC = () => {
  const data = useGameData()

  switch (data.status) {
    case 'unknown_game':
      return <NotFoundPage />
    case 'failed':
      return <PrintFailed game={data.game} />
    case 'ready':
      return data.play((play) => <PlaySession key={data.playKey} play={play} />)
    default:
      return data satisfies never
  }
}
