import type React from 'react'

import { GAMES } from '@/features/game-frame/game-registry'
import {
  readPlayRecordOrEmpty,
  readWaitingGame
} from '@/features/game-frame/game-storage'
import { gameRecordOf, solvedCountOf } from '@/features/game-frame/play-record'
import { AppNotices } from '@/presentation/app-notices'
import { Main } from '@/presentation/components/main'
import { DocumentTitle } from '@/presentation/head/document-title'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { ChapterCovers, type ChapterEntry } from './chapter-covers'
import { Masthead } from './masthead'
import { resumableGame } from './resumable-game'
import { ResumeCard } from './resume-card'

import './hub-page.sass'

const bestTimeOf = (
  variants: Record<string, { bestMs: number | null }>
): number | null =>
  Object.values(variants).reduce<number | null>(
    (best, { bestMs }) =>
      bestMs === null ? best : best === null ? bestMs : Math.min(best, bestMs),
    null
  )

/** The booklet's front page: the game left mid-way, the chapters. */
export const HubPage: React.FC = () => {
  const translate = useTranslate()
  const record = readPlayRecordOrEmpty()
  const saved = GAMES.map((game) => readWaitingGame(game.id)).flatMap(
    (waiting) =>
      waiting.status === 'success' && waiting.data !== null
        ? [waiting.data]
        : []
  )
  const resumable = resumableGame(saved)

  const chapters: ChapterEntry[] = GAMES.map((game) => ({
    bestMs: bestTimeOf(gameRecordOf(record, game.id).variants),
    game,
    solved: solvedCountOf(record, game.id)
  }))

  return (
    <Main className='hub-page'>
      <DocumentTitle>{translate('app.name')}</DocumentTitle>
      <Masthead />

      {resumable !== null && (
        <section aria-labelledby='hub-resume'>
          <h2 className='section-head' id='hub-resume'>
            {translate('hub.resume.title')}
          </h2>
          <ResumeCard saved={resumable} />
        </section>
      )}

      <section aria-labelledby='hub-chapters'>
        <h2 className='section-head' id='hub-chapters'>
          {translate('hub.chapters')}
        </h2>
        <ChapterCovers chapters={chapters} />
      </section>

      <AppNotices />

      <p className='hub-colophon'>{translate('hub.colophon')}</p>
    </Main>
  )
}
