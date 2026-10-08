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
 * game, and the clock.
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
      </Link>
      <h1 className='band-title'>
        <span className='band-caption'>{translate(game.name)}</span>
      </h1>
      <div className='band-end'>{children}</div>
    </header>
  )
}
