import { describe, expect, it } from 'vitest'

import { createSeededRandom } from '@/helpers/seeded-random'

import { cardOf, FRESH_DECK } from '../engine/playing-card'
import { solitaireEngine } from '../engine/solitaire-engine'
import type { SolitaireState, TableauColumn } from '../engine/solitaire-state'
import { dropTargetAt, tableLayoutOf } from './table-layout'
import {
  destinationsOf,
  liftToPlay,
  nextDestinationIndex
} from './tap-destinations'

const EMPTY: TableauColumn = { cards: [], hidden: 0 }

const withTableau = (columns: TableauColumn[]): SolitaireState => ({
  ...solitaireEngine.start({
    deck: createSeededRandom(1).shuffled(FRESH_DECK),
    draw: 1
  }),
  tableau: Array.from({ length: 7 }, (_, index) => columns[index] ?? EMPTY)
})

const faceUp = (...cards: number[]): TableauColumn => ({ cards, hidden: 0 })

const blackNine = cardOf({ rank: 9, suit: 'spades' })
const redTens = [
  cardOf({ rank: 10, suit: 'hearts' }),
  cardOf({ rank: 10, suit: 'diamonds' })
]

describe('solitaire taps', () => {
  it('[solitaire] sends a tapped card home before anywhere else', () => {
    const ace = cardOf({ rank: 1, suit: 'hearts' })
    const state = withTableau([faceUp(ace), EMPTY, faceUp(blackNine)])
    const [best] = destinationsOf(state, {
      count: 1,
      from: { column: 0, kind: 'tableau' }
    })
    expect(best).toEqual({ kind: 'foundation', suit: 2 })
  })

  it('[solitaire] offers the columns that take a card left to right', () => {
    const state = withTableau([
      faceUp(blackNine),
      EMPTY,
      faceUp(redTens[1] ?? 0),
      faceUp(redTens[0] ?? 0)
    ])
    const destinations = destinationsOf(state, {
      count: 1,
      from: { column: 0, kind: 'tableau' }
    })
    expect(destinations).toEqual([
      { column: 2, kind: 'tableau' },
      { column: 3, kind: 'tableau' }
    ])
  })

  it('[solitaire] never offers a king alone in its column another empty one', () => {
    const king = cardOf({ rank: 13, suit: 'spades' })
    const state = withTableau([faceUp(king)])
    expect(
      destinationsOf(state, { count: 1, from: { column: 0, kind: 'tableau' } })
    ).toEqual([])
  })

  it('[solitaire] a second tap moves the stack on to the next destination', () => {
    const state = withTableau([
      faceUp(redTens[0] ?? 0),
      faceUp(redTens[1] ?? 0, blackNine)
    ])
    const nine = { count: 1, from: { column: 1, kind: 'tableau' } } as const
    const destinations = [
      { column: 0, kind: 'tableau' },
      { column: 1, kind: 'tableau' }
    ] as const
    const moved = solitaireEngine.applyMove(state, {
      ...nine,
      kind: 'move',
      to: destinations[0]
    })
    if (moved.status === 'failure') throw new Error('refused')
    expect(
      nextDestinationIndex({
        after: 0,
        destinations,
        lift: { count: 1, from: { column: 0, kind: 'tableau' } },
        state: moved.data.board
      })
    ).toBe(1)
  })

  it('[solitaire] the keyboard plays the deepest run that can go somewhere', () => {
    const eight = cardOf({ rank: 8, suit: 'hearts' })
    const state = withTableau([
      faceUp(redTens[0] ?? 0),
      faceUp(blackNine, eight)
    ])
    expect(liftToPlay(state, { column: 1, kind: 'tableau' })).toEqual({
      count: 2,
      from: { column: 1, kind: 'tableau' }
    })
  })

  it('[solitaire] a card let go over the foundations goes to its own suit', () => {
    const state = withTableau([])
    const layout = tableLayoutOf({ availableHeight: null, state, width: 352 })
    const target = dropTargetAt({
      card: blackNine,
      layout,
      point: { x: 3.5 * layout.cardWidth, y: layout.cardHeight / 2 }
    })
    expect(target).toEqual({ kind: 'foundation', suit: 3 })
  })
})
