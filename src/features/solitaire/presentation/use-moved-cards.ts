import { useRef } from 'react'

import type { Card } from '../engine/playing-card'
import type { CardSpot } from './table-layout'

type Moved = {
  readonly spots: ReadonlyMap<Card, CardSpot>
  readonly cards: ReadonlySet<Card>
}

const NONE: ReadonlySet<Card> = new Set()

/**
 * The cards the last move carried to another pile: they stay drawn above the
 * rest until the next move, so they never slide underneath a column.
 */
export const useMovedCards = (
  spots: ReadonlyMap<Card, CardSpot> | null
): ReadonlySet<Card> => {
  const moved = useRef<Moved | null>(null)
  if (spots === null) return NONE
  const previous = moved.current
  if (previous === null) {
    moved.current = { cards: NONE, spots }
  } else if (previous.spots !== spots) {
    const changed = [...spots].filter(
      ([card, spot]) => previous.spots.get(card)?.pileKey !== spot.pileKey
    )
    moved.current = {
      cards:
        changed.length === 0
          ? previous.cards
          : new Set(changed.map(([card]) => card)),
      spots
    }
  }
  return moved.current?.cards ?? NONE
}
