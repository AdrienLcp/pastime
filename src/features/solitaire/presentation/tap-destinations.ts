import {
  cardsOf,
  isLegalMove,
  isSamePile,
  movableCountOf,
  targetsFor
} from '../engine/solitaire-rules'
import type {
  Pile,
  SolitaireState,
  TargetPile
} from '../engine/solitaire-state'
import type { Lift } from './table-layout'

const PREFERENCE = { emptyColumn: 2, foundation: 0, onCard: 1 } as const

const preferenceOf = (state: SolitaireState, to: TargetPile): number => {
  if (to.kind === 'foundation') return PREFERENCE.foundation
  return cardsOf(state, to).length === 0
    ? PREFERENCE.emptyColumn
    : PREFERENCE.onCard
}

const isWholeColumn = (state: SolitaireState, lift: Lift) =>
  lift.from.kind === 'tableau' &&
  lift.count === cardsOf(state, lift.from).length

const canGo = ({
  lift,
  state,
  to
}: {
  state: SolitaireState
  lift: Lift
  to: TargetPile
}): boolean => {
  const isPointless =
    to.kind === 'tableau' &&
    cardsOf(state, to).length === 0 &&
    isWholeColumn(state, lift)
  return (
    !isPointless &&
    isLegalMove(state, {
      count: lift.count,
      from: lift.from,
      kind: 'move',
      to
    })
  )
}

/**
 * Where a tapped stack can go, best first: home, then onto a card, then an
 * empty column — left to right among equals. A king alone in its column is
 * never offered another empty one.
 */
export const destinationsOf = (
  state: SolitaireState,
  lift: Lift
): readonly TargetPile[] => {
  const lead = cardsOf(state, lift.from).at(-lift.count)
  if (lead === undefined) return []
  return targetsFor(lead)
    .filter((to) => canGo({ lift, state, to }))
    .toSorted((a, b) => preferenceOf(state, a) - preferenceOf(state, b))
}

/**
 * The stack a pile plays when chosen whole, from the keyboard: its top card
 * if it can go home, else the deepest run that has somewhere to go.
 */
export const liftToPlay = (state: SolitaireState, from: Pile): Lift | null => {
  const top: Lift = { count: 1, from }
  if (
    movableCountOf(state, from) > 0 &&
    destinationsOf(state, top)[0]?.kind === 'foundation'
  )
    return top
  for (let count = movableCountOf(state, from); count > 0; count -= 1) {
    const lift = { count, from }
    if (destinationsOf(state, lift).length > 0) return lift
  }
  return null
}

/**
 * Tapping a stack again, where the last tap put it: the next of the first
 * tap's destinations it can still go to, going round.
 */
export const nextDestinationIndex = ({
  after,
  destinations,
  lift,
  state
}: {
  state: SolitaireState
  lift: Lift
  destinations: readonly TargetPile[]
  after: number
}): number | null => {
  const count = destinations.length
  for (let step = 1; step < count; step += 1) {
    const index = (after + step) % count
    const to = destinations[index]
    if (
      to !== undefined &&
      !isSamePile(to, lift.from) &&
      canGo({ lift, state, to })
    )
      return index
  }
  return null
}
