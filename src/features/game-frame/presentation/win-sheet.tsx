import type React from 'react'

import {
  hubPathFor,
  useReloadRouteData
} from '@/infrastructure/router/navigation'
import { Button } from '@/presentation/components/button'
import {
  HomeIcon,
  NextIcon,
  RestartIcon
} from '@/presentation/components/icons'
import { Link } from '@/presentation/components/link'
import { formatClockTime, isoDuration } from '@/presentation/format/clock-time'
import { useI18n } from '@/presentation/i18n/i18n-provider'

import type { GameDefinition } from '../game-definition'
import { PencilLoop } from './pencil-loop'
import type { WinSummary } from './win-summary'

import './win-sheet.sass'

type WinSheetProps = {
  game: GameDefinition
  summary: WinSummary
  /** The solved board, under the stamp. */
  plate: React.ReactNode
  /** Plays the same puzzle again. */
  onReplay: () => void
}

const ClockTime: React.FC<{ elapsedMs: number }> = ({ elapsedMs }) => (
  <time dateTime={isoDuration(elapsedMs)}>{formatClockTime(elapsedMs)}</time>
)

/**
 * The page once a puzzle is solved: the red stamp pressed on the board, the
 * time written in pencil beside the best, and where to go next.
 */
export const WinSheet: React.FC<WinSheetProps> = ({
  game,
  onReplay,
  plate,
  summary
}) => {
  const { locale, translate } = useI18n()
  const moves = game.countsMoves ? summary.moves : null
  const reloadRouteData = useReloadRouteData()

  return (
    <div className='win-sheet'>
      <div className='win-plate'>
        <div className='win-board'>{plate}</div>
        <p className='stamp'>
          <span className='stamp-word'>{translate('frame.win.stamp')}</span>
        </p>
      </div>

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
            {(summary.isNewBest || moves?.isNewFewest) && (
              <span className='scribble'>{translate('frame.win.newBest')}</span>
            )}
          </dd>
        </div>
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
        <div className='win-actions-pair'>
          <Button onPress={onReplay} variant='line'>
            <RestartIcon aria-hidden='true' />
            {translate('frame.win.replay')}
          </Button>
          <Link href={hubPathFor(locale)} variant='line'>
            <HomeIcon aria-hidden='true' />
            {translate('frame.win.home')}
          </Link>
        </div>
      </div>
    </div>
  )
}
