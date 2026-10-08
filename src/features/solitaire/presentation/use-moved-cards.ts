import { useState } from 'react'

import type { Card } from '../engine/playing-card'
import type { CardSpot } from './table-layout'

type Moved = {
  readonly spots: ReadonlyMap<Card, CardSpot>
  readonly cards: ReadonlySet<Card>
}

const NONE: ReadonlySet<Card> = new Set()

const movedSince = (
  previous: Moved,
  spots: ReadonlyMap<Card, CardSpot>
): ReadonlySet<Card> => {
  const changed = [...spots].filter(
    ([card, spot]) => previous.spots.get(card)?.pileKey !== spot.pileKey
  )
  return changed.length === 0
    ? previous.cards
    : new Set(changed.map(([card]) => card))
}

/**
 * The cards the last move carried to another pile: they stay drawn above the
 * rest until the next move, so they never slide underneath a column.
 */
export const useMovedCards = (
  spots: ReadonlyMap<Card, CardSpot> | null
): ReadonlySet<Card> => {
  const [moved, setMoved] = useState<Moved | null>(null)
  if (spots === null) return NONE
  if (moved?.spots === spots) return moved.cards
  const next: Moved = {
    cards: moved === null ? NONE : movedSince(moved, spots),
    spots
  }
  setMoved(next)
  return next.cards
}
