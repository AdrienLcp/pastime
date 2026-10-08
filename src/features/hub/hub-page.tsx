import type React from 'react'

import { GAMES } from '@/features/game-frame/game-registry'
import { readPlayRecordOrEmpty } from '@/features/game-frame/game-storage'
import { gameRecordOf, solvedCountOf } from '@/features/game-frame/play-record'
import { useUpdateAtRest } from '@/infrastructure/pwa/app-update'
import { AppNotices } from '@/presentation/app-notices'
import { Main } from '@/presentation/components/main'
import { DocumentTitle } from '@/presentation/head/document-title'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { ChapterCovers, type ChapterEntry } from './chapter-covers'
import { Masthead } from './masthead'

import './hub-page.sass'

const bestTimeOf = (
  variants: Record<string, { bestMs: number | null }>
): number | null =>
  Object.values(variants).reduce<number | null>(
    (best, { bestMs }) =>
      bestMs === null ? best : best === null ? bestMs : Math.min(best, bestMs),
    null
  )

/** The front page: the list of games. */
export const HubPage: React.FC = () => {
  const translate = useTranslate()
  const record = readPlayRecordOrEmpty()
  useUpdateAtRest()

  const chapters: ChapterEntry[] = GAMES.map((game) => ({
    bestMs: bestTimeOf(gameRecordOf(record, game.id).variants),
    game,
    solved: solvedCountOf(record, game.id)
  }))

  return (
    <Main className='hub-page'>
      <DocumentTitle>{translate('app.name')}</DocumentTitle>
      <Masthead />
      <ChapterCovers chapters={chapters} />
      <AppNotices />
    </Main>
  )
}
