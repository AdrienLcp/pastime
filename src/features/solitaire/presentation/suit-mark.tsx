import type React from 'react'

import type { Suit } from '../engine/playing-card'
import { SUIT_PATHS } from './suit-paths'

type SuitMarkProps = {
  readonly className: string
  readonly suit: Suit
}

export const SuitMark: React.FC<SuitMarkProps> = ({ className, suit }) => (
  <svg aria-hidden='true' className={className} viewBox='0 0 24 24'>
    <path d={SUIT_PATHS[suit]} />
  </svg>
)
