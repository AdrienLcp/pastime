import type React from 'react'

import { GAMES } from '@/features/game-frame/game-registry'
import {
  readPlayRecordOrEmpty,
  readWaitingGame
} from '@/features/game-frame/game-storage'
import {
  dailyStreak,
  dailyTimeOf,
  gameRecordOf,
  solvedCountOf
} from '@/features/game-frame/play-record'
import { issueNumber } from '@/features/game-frame/puzzle'
import { today } from '@/infrastructure/clock'
import { dailyPathFor, gamePathFor } from '@/infrastructure/router/navigation'
import { AppNotices } from '@/presentation/app-notices'
import { NextIcon } from '@/presentation/components/icons'
import { Link } from '@/presentation/components/link'
import { Main } from '@/presentation/components/main'
import { DocumentTitle } from '@/presentation/head/document-title'
import { useI18n } from '@/presentation/i18n/i18n-provider'

import { ChapterCovers, type ChapterEntry } from './chapter-covers'
import { Masthead } from './masthead'
import { resumableGame } from './resumable-game'
import { ResumeCard } from './resume-card'
import { type TodayEntry, TodayList } from './today-list'

import './hub-page.sass'

const bestTimeOf = (
  variants: Record<string, { bestMs: number | null }>
): number | null =>
  Object.values(variants).reduce<number | null>(
    (best, { bestMs }) =>
      bestMs === null ? best : best === null ? bestMs : Math.min(best, bestMs),
    null
  )

/** The booklet's front page: today's issue, the game left mid-way, the chapters. */
export const HubPage: React.FC = () => {
  const { locale, translate } = useI18n()
  const day = today()
  const record = readPlayRecordOrEmpty()
  const savedDailies = GAMES.map((game) =>
    readWaitingGame({ gameId: game.id, mode: 'daily' })
  )
  const savedFree = GAMES.map((game) =>
    readWaitingGame({ gameId: game.id, mode: 'free' })
  )
  const saved = [...savedDailies, ...savedFree].flatMap((waiting) =>
    waiting.status === 'success' && waiting.data !== null ? [waiting.data] : []
  )
  const resumable = resumableGame({ saved, today: day })
  const [firstGame] = GAMES
  const isFreshBook = Object.keys(record).length === 0
  const isFirstDailyDone =
    dailyTimeOf({ day, gameId: firstGame.id, record }) !== null

  const todayEntries: TodayEntry[] = GAMES.map((game) => ({
    game,
    isUnderWay: saved.some(
      (waiting) =>
        waiting.puzzle.gameId === game.id &&
        waiting.puzzle.day === day.toString()
    ),
    solvedMs: dailyTimeOf({ day, gameId: game.id, record })
  }))

  const chapters: ChapterEntry[] = GAMES.map((game) => ({
    bestMs: bestTimeOf(gameRecordOf(record, game.id).variants),
    game,
    solved: solvedCountOf(record, game.id)
  }))

  return (
    <Main className='hub-page'>
      <DocumentTitle>{translate('app.name')}</DocumentTitle>
      <Masthead issueDay={day} streak={dailyStreak({ record, today: day })} />

      {resumable === null ? (
        <section aria-labelledby='hub-start'>
          <h2 className='section-head' id='hub-start'>
            {translate('hub.start')}
          </h2>
          <div className='fresh-book'>
            <p className='fresh-title'>
              {translate(isFreshBook ? 'hub.empty.title' : 'hub.idle')}
            </p>
            <p className='fresh-prose'>{translate('hub.empty.prose')}</p>
            {isFirstDailyDone ? (
              <Link
                href={gamePathFor({ gameId: firstGame.id, locale })}
                variant='ink'
              >
                {translate(firstGame.name)} ·{' '}
                {translate('frame.win.toFreePlay')}
                <NextIcon aria-hidden='true' />
              </Link>
            ) : (
              <Link
                href={dailyPathFor({ gameId: firstGame.id, locale })}
                variant='ink'
              >
                {translate(firstGame.name)} {translate('common.puzzleNumber')}{' '}
                {issueNumber(day)}
                <NextIcon aria-hidden='true' />
              </Link>
            )}
          </div>
        </section>
      ) : (
        <section aria-labelledby='hub-resume'>
          <h2 className='section-head' id='hub-resume'>
            {translate('hub.resume.title')}
          </h2>
          <ResumeCard saved={resumable} />
        </section>
      )}

      <section aria-labelledby='hub-today'>
        <h2 className='section-head' id='hub-today'>
          {translate('hub.today.title')}
        </h2>
        <TodayList entries={todayEntries} number={issueNumber(day)} />
      </section>

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
