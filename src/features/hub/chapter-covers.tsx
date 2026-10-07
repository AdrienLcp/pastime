import type React from 'react'

import type { GameDefinition } from '@/features/game-frame/game-definition'
import { gamePathFor } from '@/infrastructure/router/navigation'
import { Link } from '@/presentation/components/link'
import { formatClockTime } from '@/presentation/format/clock-time'
import { useI18n } from '@/presentation/i18n/i18n-provider'

import './chapter-covers.sass'

export type ChapterEntry = {
  readonly game: GameDefinition
  readonly solved: number
  /** The best time across the chapter's sizes; `null` before a first win. */
  readonly bestMs: number | null
}

/** One process-ink cover per game, its rule printed on it: free play opens from here. */
export const ChapterCovers: React.FC<{ chapters: readonly ChapterEntry[] }> = ({
  chapters
}) => {
  const { locale, translate } = useI18n()

  return (
    <ul className='chapter-covers'>
      {chapters.map(({ bestMs, game, solved }) => (
        <li key={game.id}>
          <Link
            className='chapter-cover'
            href={gamePathFor({ gameId: game.id, locale })}
            style={{ '--chapter': `var(${game.chapterInk})` }}
          >
            <span className='cover-title'>{translate(game.name)}</span>
            <span className='cover-rule'>{translate(game.rule)}</span>
            <span className='cover-meta'>
              {bestMs === null
                ? translate('hub.coverNew')
                : translate('hub.coverMeta', {
                    best: formatClockTime(bestMs),
                    count: solved
                  })}
            </span>
            <span aria-hidden='true' className='cover-glyph'>
              <game.Glyph />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
