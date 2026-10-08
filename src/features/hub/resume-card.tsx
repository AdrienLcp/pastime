import type React from 'react'

import { findGame, variantOf } from '@/features/game-frame/game-registry'
import type { SavedGame } from '@/features/game-frame/saved-game'
import { gamePathFor } from '@/infrastructure/router/navigation'
import { NextIcon } from '@/presentation/components/icons'
import { Link } from '@/presentation/components/link'
import { formatClockTime } from '@/presentation/format/clock-time'
import { useI18n } from '@/presentation/i18n/i18n-provider'

import './resume-card.sass'

/** A loose sheet laid on the page, its corner folded: the game left mid-way. */
export const ResumeCard: React.FC<{ saved: SavedGame }> = ({ saved }) => {
  const { locale, translate } = useI18n()
  const game = findGame(saved.puzzle.gameId)
  if (game === null) return null
  const { puzzle } = saved

  return (
    <Link
      className='resume-card'
      href={gamePathFor({ gameId: game.id, locale })}
      style={{ '--chapter': `var(${game.chapterInk})` }}
    >
      <span aria-hidden='true' className='resume-tab'>
        <game.Glyph />
      </span>
      <span className='resume-body'>
        <span className='resume-game'>
          {translate(game.name)} ·{' '}
          {translate(variantOf({ game, variantId: puzzle.variantId }).label)}
        </span>
        <span className='resume-meta'>
          {formatClockTime(saved.elapsedMs)} ·{' '}
          {translate('hub.resume.moves', { count: saved.moves.length })}
        </span>
        <span className='resume-go'>
          {translate('hub.resume.action')}
          <NextIcon aria-hidden='true' />
        </span>
      </span>
    </Link>
  )
}
