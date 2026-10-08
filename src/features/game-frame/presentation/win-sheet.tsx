import type React from 'react'

import {
  hubPathFor,
  useReloadRouteData
} from '@/infrastructure/router/navigation'
import { Button } from '@/presentation/components/button'
import { HomeIcon, NextIcon } from '@/presentation/components/icons'
import { Link } from '@/presentation/components/link'
import { formatClockTime, isoDuration } from '@/presentation/format/clock-time'
import { useI18n, useTranslate } from '@/presentation/i18n/i18n-provider'

import type { GameDefinition } from '../game-definition'
import { PencilLoop } from './pencil-loop'
import type { ScoreSummary, WinSummary } from './win-summary'

import './win-sheet.sass'

type WinSheetProps = {
  game: GameDefinition
  summary: WinSummary
}

const ClockTime: React.FC<{ elapsedMs: number }> = ({ elapsedMs }) => (
  <time dateTime={isoDuration(elapsedMs)}>{formatClockTime(elapsedMs)}</time>
)

/** The points won, their time bonus beneath, against the best score. */
const ScoreRow: React.FC<{
  score: ScoreSummary
  /** A new record already told above: the score's is not told twice. */
  isNewBestTold: boolean
}> = ({ isNewBestTold, score }) => {
  const translate = useTranslate()

  return (
    <>
      <div>
        <dt>{translate('frame.win.score')}</dt>
        <dd>
          <span>{translate('frame.win.points', { points: score.total })}</span>
          <span className='moves'>
            {translate('frame.win.timeBonus', { bonus: score.timeBonus })}
          </span>
        </dd>
      </div>
      <div>
        <dt>{translate('frame.win.best')}</dt>
        <dd>
          {score.beatenBest !== null && (
            <s className='beaten'>
              {translate('frame.win.points', { points: score.beatenBest })}
            </s>
          )}
          <span className={score.isNewBest ? 'best circled' : 'best'}>
            {translate('frame.win.points', { points: score.best })}
            {score.isNewBest && <PencilLoop />}
          </span>
          {score.isNewBest && !isNewBestTold && (
            <span className='scribble'>{translate('frame.win.newBest')}</span>
          )}
        </dd>
      </div>
    </>
  )
}

/** The solved board with the red stamp pressed on it, over all its layers. */
export const WinPlate: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const translate = useTranslate()

  return (
    <div className='win-plate'>
      <div className='win-board'>{children}</div>
      <p className='stamp'>
        <span className='stamp-word'>{translate('frame.win.stamp')}</span>
      </p>
    </div>
  )
}

/**
 * The score once a puzzle is solved: the time written in pencil beside the
 * best, and where to go next.
 */
export const WinSheet: React.FC<WinSheetProps> = ({ game, summary }) => {
  const { locale, translate } = useI18n()
  const moves = game.countsMoves ? summary.moves : null
  const reloadRouteData = useReloadRouteData()
  const isNewBestTold = summary.isNewBest || moves?.isNewFewest === true

  return (
    <div className='win-sheet'>
      <dl className='score'>
        <div>
          <dt>{translate('frame.win.time')}</dt>
          <dd>
            <ClockTime elapsedMs={summary.elapsedMs} />
            {moves !== null && (
              <span className='moves'>
                {translate('frame.win.moves', { count: moves.count })}
              </span>
            )}
          </dd>
        </div>
        <div>
          <dt>{translate('frame.win.best')}</dt>
          <dd>
            {summary.beatenBestMs !== null && (
              <s className='beaten'>
                <ClockTime elapsedMs={summary.beatenBestMs} />
              </s>
            )}
            {summary.bestMs !== null && (
              <span className={summary.isNewBest ? 'best circled' : 'best'}>
                <ClockTime elapsedMs={summary.bestMs} />
                {summary.isNewBest && <PencilLoop />}
              </span>
            )}
            {moves !== null && (
              <span className='moves'>
                {moves.beatenFewest !== null && (
                  <s className='beaten'>{moves.beatenFewest}</s>
                )}
                <span className={moves.isNewFewest ? 'best circled' : 'best'}>
                  {translate('frame.win.moves', { count: moves.fewest })}
                  {moves.isNewFewest && <PencilLoop />}
                </span>
              </span>
            )}
            {isNewBestTold && (
              <span className='scribble'>{translate('frame.win.newBest')}</span>
            )}
          </dd>
        </div>
        {summary.score !== null && (
          <ScoreRow isNewBestTold={isNewBestTold} score={summary.score} />
        )}
      </dl>

      <div className='win-actions'>
        <Button
          autoFocus
          className='next'
          onPress={reloadRouteData}
          variant='ink'
        >
          {translate('frame.win.next')}
          <NextIcon aria-hidden='true' />
        </Button>
        <Link href={hubPathFor(locale)} variant='line'>
          <HomeIcon aria-hidden='true' />
          {translate('frame.win.home')}
        </Link>
      </div>
    </div>
  )
}
