import type React from 'react'

import { hubPathFor } from '@/infrastructure/router/navigation'
import { BackIcon } from '@/presentation/components/icons'
import { Link } from '@/presentation/components/link'
import { useI18n } from '@/presentation/i18n/i18n-provider'

import type { GameDefinition } from '../game-definition'
import { variantOf } from '../game-registry'
import type { PuzzleRef } from '../puzzle'

import './game-band.sass'

type GameBandProps = {
  game: GameDefinition
  puzzle: PuzzleRef
  /** The clock and its pause button, at the band's end; absent once solved. */
  children?: React.ReactNode
}

/**
 * The chapter's header band across the top of a puzzle: the way back, the
 * puzzle's number set large, which game and size, and the clock.
 */
export const GameBand: React.FC<GameBandProps> = ({
  children,
  game,
  puzzle
}) => {
  const { locale, translate } = useI18n()
  const variant = variantOf({ game, variantId: puzzle.variantId })

  return (
    <header className='game-band'>
      <Link
        aria-label={translate('common.backToBook')}
        className='band-back'
        href={hubPathFor(locale)}
      >
        <BackIcon aria-hidden='true' />
      </Link>
      <h1 className='band-title'>
        <span className='band-number'>
          <small>{translate('common.puzzleNumber')}</small> {puzzle.number}
        </span>
        <span className='band-caption'>
          {translate(game.name)} ·{' '}
          {puzzle.mode === 'daily'
            ? translate('frame.daily')
            : translate(variant.label)}
        </span>
      </h1>
      <div className='band-end'>{children}</div>
    </header>
  )
}
