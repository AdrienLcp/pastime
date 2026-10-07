import { useRef } from 'react'

import type { Card } from '../engine/playing-card'
import { cardsOf, isSamePile } from '../engine/solitaire-rules'
import type {
  SolitaireMove,
  SolitaireState,
  TargetPile
} from '../engine/solitaire-state'
import type { Lift } from './table-layout'
import { destinationsOf, nextDestinationIndex } from './tap-destinations'

type LastTap = {
  readonly lead: Card
  readonly destinations: readonly TargetPile[]
  readonly index: number
}

/**
 * A tap sends a stack to its best destination; tapping it again where it
 * landed moves it on to the next one. `tap` says whether anything moved.
 */
export const useTapMoves = ({
  onMove,
  state
}: {
  state: SolitaireState
  onMove: (move: SolitaireMove) => void
}) => {
  const lastTap = useRef<LastTap | null>(null)

  const send = (lift: Lift, to: TargetPile) =>
    onMove({ count: lift.count, from: lift.from, kind: 'move', to })

  const tap = (lift: Lift): boolean => {
    const lead = cardsOf(state, lift.from).at(-lift.count)
    if (lead === undefined) return false
    const previous = lastTap.current
    const landedAt = previous?.destinations[previous.index]
    if (
      previous !== null &&
      previous.lead === lead &&
      landedAt !== undefined &&
      isSamePile(landedAt, lift.from)
    ) {
      const index = nextDestinationIndex({
        after: previous.index,
        destinations: previous.destinations,
        lift,
        state
      })
      const to = index === null ? undefined : previous.destinations[index]
      if (index === null || to === undefined) return false
      lastTap.current = { ...previous, index }
      send(lift, to)
      return true
    }
    const destinations = destinationsOf(state, lift)
    const [best] = destinations
    if (best === undefined) return false
    lastTap.current = { destinations, index: 0, lead }
    send(lift, best)
    return true
  }

  return { tap }
}
