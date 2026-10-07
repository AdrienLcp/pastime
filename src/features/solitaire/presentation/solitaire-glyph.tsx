import type React from 'react'
import { useId } from 'react'

import { SUIT_PATHS } from './suit-paths'

const FRONT_CARD = { height: 33, rx: 3, width: 24, x: 18, y: 7 } as const

/**
 * The chapter's mark: a card face down, a spade turned over on top of it, the
 * back cut away under the front so it shows whatever the glyph is printed on.
 */
export const SolitaireGlyph: React.FC = () => {
  const underFront = `solitaire-front${useId().replace(/[^\w-]/g, '')}`
  return (
    <svg aria-hidden='true' viewBox='0 0 48 48'>
      <mask id={underFront}>
        <rect fill='white' height='48' width='48' />
        <rect {...FRONT_CARD} fill='black' stroke='black' strokeWidth='2.6' />
      </mask>
      <g mask={`url(#${underFront})`}>
        <rect
          fill='currentColor'
          height='33'
          rx='3'
          transform='rotate(-12 17 25)'
          width='24'
          x='5'
          y='9'
        />
      </g>
      <rect
        {...FRONT_CARD}
        fill='none'
        stroke='currentColor'
        strokeWidth='2.6'
      />
      <path
        d={SUIT_PATHS.spades}
        fill='currentColor'
        transform='translate(22 15) scale(0.667)'
      />
    </svg>
  )
}
