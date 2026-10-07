import type React from 'react'

import type { GameDefinition } from '@/features/game-frame/game-definition'
import { variantOf } from '@/features/game-frame/game-registry'
import { dailyPathFor } from '@/infrastructure/router/navigation'
import { Link } from '@/presentation/components/link'
import { formatClockTime, isoDuration } from '@/presentation/format/clock-time'
import { useI18n } from '@/presentation/i18n/i18n-provider'

import './today-list.sass'

export type TodayEntry = {
  readonly game: GameDefinition
  /** The time it took once solved, `null` while still to do. */
  readonly solvedMs: number | null
  readonly isUnderWay: boolean
}

const TickMark: React.FC = () => (
  <svg aria-hidden='true' className='tick' viewBox='0 0 48 48'>
    <path d='M8 25c4 3 7 7 9 11 5-11 13-20 23-26' />
  </svg>
)

/** Today's page of the booklet's contents: one daily per chapter, ticked once done. */
export const TodayList: React.FC<{
  entries: readonly TodayEntry[]
  number: number
}> = ({ entries, number }) => {
  const { locale, translate } = useI18n()

  return (
    <ul className='today-list'>
      {entries.map(({ game, isUnderWay, solvedMs }) => (
        <li key={game.id} style={{ '--chapter': `var(${game.chapterInk})` }}>
          <Link
            className='today-row'
            href={dailyPathFor({ gameId: game.id, locale })}
          >
            <span aria-hidden='true' className='today-tab'>
              <game.Glyph />
            </span>
            <span className='today-number'>
              {translate('common.puzzleNumber')} {number}
            </span>
            <span className='today-name'>
              {translate(game.name)}
              <small>
                {translate(
                  variantOf({ game, variantId: game.dailyVariant }).label
                )}
              </small>
            </span>
            <span aria-hidden='true' className='leader' />
            {solvedMs === null ? (
              <span className='today-state'>
                {translate(
                  isUnderWay ? 'hub.today.inProgress' : 'hub.today.todo'
                )}
              </span>
            ) : (
              <span className='today-state done'>
                <TickMark />
                <span className='visually-hidden'>
                  {translate('hub.today.done')}
                </span>
                <time dateTime={isoDuration(solvedMs)}>
                  {formatClockTime(solvedMs)}
                </time>
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  )
}
