import type React from 'react'
import { useState } from 'react'

import {
  gamePathFor,
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
import { SegmentedChoice } from '@/presentation/components/segmented-choice'
import { formatClockTime, isoDuration } from '@/presentation/format/clock-time'
import { useI18n } from '@/presentation/i18n/i18n-provider'

import type { GameDefinition } from '../game-definition'
import { readPlayRecordOrEmpty, saveVariantPreference } from '../game-storage'
import { variantRecordOf } from '../play-record'
import type { PuzzleRef } from '../puzzle'
import { PencilLoop } from './pencil-loop'
import type { WinSummary } from './win-summary'

import './win-sheet.sass'

type WinSheetProps = {
  game: GameDefinition
  puzzle: PuzzleRef
  summary: WinSummary
  /** The solved board, under the stamp; `null` when it is not at hand. */
  plate: React.ReactNode
  /** Plays the same puzzle again; `null` when the board is not at hand. */
  onReplay: (() => void) | null
}

const ClockTime: React.FC<{ elapsedMs: number }> = ({ elapsedMs }) => (
  <time dateTime={isoDuration(elapsedMs)}>{formatClockTime(elapsedMs)}</time>
)

/**
 * The page once a puzzle is solved: the red stamp pressed on the board, the
 * time written in pencil beside the best and the streak, and where to go next.
 */
export const WinSheet: React.FC<WinSheetProps> = ({
  game,
  onReplay,
  plate,
  puzzle,
  summary
}) => {
  const { locale, translate } = useI18n()
  const reloadRouteData = useReloadRouteData()
  const [nextVariantId, setNextVariantId] = useState(puzzle.variantId)
  const nextNumber = variantRecordOf({
    gameId: game.id,
    record: readPlayRecordOrEmpty(),
    variantId: nextVariantId
  }).nextNumber

  const playNext = () => {
    saveVariantPreference({ gameId: game.id, variantId: nextVariantId })
    reloadRouteData()
  }

  return (
    <div className='win-sheet'>
      <div className={plate === null ? 'win-plate bare' : 'win-plate'}>
        {plate}
        <p className='stamp'>
          <span className='stamp-word'>{translate('frame.win.stamp')}</span>
          <span className='stamp-number'>
            {translate('common.puzzleNumber')} {puzzle.number}
          </span>
        </p>
      </div>

      <dl className='score'>
        <div>
          <dt>{translate('frame.win.time')}</dt>
          <dd>
            <ClockTime elapsedMs={summary.elapsedMs} />
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
            {summary.isNewBest && (
              <span className='scribble'>{translate('frame.win.newBest')}</span>
            )}
          </dd>
        </div>
        <div>
          <dt>{translate('frame.win.streak')}</dt>
          <dd>{translate('frame.win.days', { count: summary.streak })}</dd>
        </div>
      </dl>

      <div className='win-actions'>
        {puzzle.mode === 'free' ? (
          <>
            {game.variants.length > 1 && (
              <SegmentedChoice
                label={translate('frame.win.nextVariant')}
                onChange={setNextVariantId}
                options={game.variants.map((variant) => ({
                  label: translate(variant.label),
                  value: variant.id
                }))}
                value={nextVariantId}
              />
            )}
            <Button autoFocus className='next' onPress={playNext} variant='ink'>
              {translate('frame.win.next', { number: nextNumber })}
              <NextIcon aria-hidden='true' />
            </Button>
          </>
        ) : (
          <Link
            autoFocus
            className='next'
            href={gamePathFor({ gameId: game.id, locale })}
            variant='ink'
          >
            {translate('frame.win.toFreePlay')}
            <NextIcon aria-hidden='true' />
          </Link>
        )}
        <div className='win-actions-pair'>
          {onReplay !== null && (
            <Button onPress={onReplay} variant='line'>
              <RestartIcon aria-hidden='true' />
              {translate('frame.win.replay')}
            </Button>
          )}
          <Link href={hubPathFor(locale)} variant='line'>
            <HomeIcon aria-hidden='true' />
            {translate('frame.win.home')}
          </Link>
        </div>
      </div>
    </div>
  )
}
