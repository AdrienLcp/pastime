import type React from 'react'

import { hubPathFor } from '@/infrastructure/router/navigation'
import { BackIcon } from '@/presentation/components/icons'
import { Link } from '@/presentation/components/link'
import { useI18n } from '@/presentation/i18n/i18n-provider'

import type { GameDefinition } from '../game-definition'

import './game-band.sass'

type GameBandProps = {
  game: GameDefinition
  /** The clock and its pause button, at the band's end; absent once solved. */
  children?: React.ReactNode
}

/**
 * The chapter's header band across the top of a puzzle: the way back, which
 * game, and the clock. On a spread it becomes the cover page's head, beside
 * the board, its rule printed under its name.
 */
export const GameBand: React.FC<GameBandProps> = ({ children, game }) => {
  const { locale, translate } = useI18n()

  return (
    <header className='game-band'>
      <Link
        aria-label={translate('common.backToGames')}
        className='band-back'
        href={hubPathFor(locale)}
      >
        <BackIcon aria-hidden='true' />
        <span aria-hidden='true' className='band-back-label'>
          {translate('common.games')}
        </span>
      </Link>
      <h1 className='band-title'>{translate(game.name)}</h1>
      <p className='band-rule'>{translate(game.rule)}</p>
      <div className='band-end'>{children}</div>
    </header>
  )
}
