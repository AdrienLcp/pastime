import { describe, expect, it } from 'vitest'

import { createSeededRandom } from '@/helpers/seeded-random'

import {
  cardOf,
  DECK_SIZE,
  FRESH_DECK,
  RANKS_PER_SUIT,
  SUITS
} from './playing-card'
import { solitaireEngine } from './solitaire-engine'
import type { SolitaireLevel } from './solitaire-level'
import { legalMovesOf } from './solitaire-rules'
import type {
  SolitaireMove,
  SolitaireState,
  TableauColumn
} from './solitaire-state'

const LEVEL: SolitaireLevel = {
  deck: createSeededRandom(1).shuffled(FRESH_DECK),
  draw: 1
}

const play = (state: SolitaireState, move: SolitaireMove): SolitaireState => {
  const played = solitaireEngine.applyMove(state, move)
  if (played.status === 'failure') throw new Error('refused')
  return played.data.board
}

const isLegal = (state: SolitaireState, move: SolitaireMove) =>
  solitaireEngine.applyMove(state, move).status === 'success'

const EMPTY: TableauColumn = { cards: [], hidden: 0 }

/** The dealt table with these columns first, the others empty. */
const withTableau = (columns: TableauColumn[]): SolitaireState => ({
  ...solitaireEngine.start(LEVEL),
  tableau: Array.from({ length: 7 }, (_, index) => columns[index] ?? EMPTY)
})

const faceUp = (...cards: number[]): TableauColumn => ({ cards, hidden: 0 })

const toColumn = (from: number, to: number, count = 1): SolitaireMove => ({
  count,
  from: { column: from, kind: 'tableau' },
  kind: 'move',
  to: { column: to, kind: 'tableau' }
})

const cardsOnTable = (state: SolitaireState) => [
  ...state.stock,
  ...state.waste,
  ...state.foundations.flat(),
  ...state.tableau.flatMap((column) => column.cards)
]

describe('solitaire engine', () => {
  it('[solitaire] deals seven columns, the last card of each face up, the rest in the stock', () => {
    const state = solitaireEngine.start(LEVEL)
    expect(state.tableau.map((column) => column.cards.length)).toEqual([
      1, 2, 3, 4, 5, 6, 7
    ])
    expect(state.tableau.map((column) => column.hidden)).toEqual([
      0, 1, 2, 3, 4, 5, 6
    ])
    expect(state.stock).toHaveLength(24)
    expect(state.waste).toEqual([])
    expect(cardsOnTable(state).toSorted((a, b) => a - b)).toEqual(FRESH_DECK)
  })

  it('[solitaire] accepts every move it lists, and keeps every card on the table', () => {
    for (let seed = 0; seed < 20; seed++) {
      const random = createSeededRandom(seed)
      let state = solitaireEngine.start({
        deck: random.shuffled(FRESH_DECK),
        draw: 1
      })
      for (let turn = 0; turn < 200; turn++) {
        const [first, ...rest] = legalMovesOf(state)
        if (first === undefined) break
        state = play(state, random.pick([first, ...rest]))
      }
      expect(cardsOnTable(state)).toHaveLength(DECK_SIZE)
    }
  })

  it('[solitaire] builds down in alternating colours only', () => {
    const state = withTableau([
      faceUp(cardOf({ rank: 8, suit: 'spades' })),
      faceUp(cardOf({ rank: 7, suit: 'hearts' })),
      faceUp(cardOf({ rank: 7, suit: 'clubs' })),
      faceUp(cardOf({ rank: 6, suit: 'diamonds' }))
    ])
    expect(isLegal(state, toColumn(1, 0))).toBe(true)
    expect(isLegal(state, toColumn(2, 0))).toBe(false)
    expect(isLegal(state, toColumn(3, 0))).toBe(false)
  })

  it('[solitaire] fills an empty column with a king only', () => {
    const state = withTableau([
      faceUp(cardOf({ rank: 13, suit: 'hearts' })),
      faceUp(cardOf({ rank: 12, suit: 'clubs' }))
    ])
    expect(isLegal(state, toColumn(0, 2))).toBe(true)
    expect(isLegal(state, toColumn(1, 2))).toBe(false)
  })

  it('[solitaire] starts a foundation with its ace, and builds it by suit', () => {
    const state = withTableau([
      faceUp(cardOf({ rank: 1, suit: 'hearts' })),
      faceUp(cardOf({ rank: 2, suit: 'hearts' })),
      faceUp(cardOf({ rank: 2, suit: 'diamonds' }))
    ])
    const hearts = SUITS.indexOf('hearts')
    const home = (column: number, suit = hearts): SolitaireMove => ({
      count: 1,
      from: { column, kind: 'tableau' },
      kind: 'move',
      to: { kind: 'foundation', suit }
    })
    expect(isLegal(state, home(1))).toBe(false)
    const aceHome = play(state, home(0))
    expect(isLegal(aceHome, home(1))).toBe(true)
    expect(isLegal(aceHome, home(2))).toBe(false)
    expect(isLegal(aceHome, home(2, SUITS.indexOf('diamonds')))).toBe(false)
  })

  it('[solitaire] turns over the card a move uncovers, and never lifts a face-down one', () => {
    const state = withTableau([
      faceUp(cardOf({ rank: 9, suit: 'clubs' })),
      {
        cards: [
          cardOf({ rank: 4, suit: 'spades' }),
          cardOf({ rank: 8, suit: 'hearts' })
        ],
        hidden: 1
      }
    ])
    expect(isLegal(state, toColumn(1, 0, 2))).toBe(false)
    expect(play(state, toColumn(1, 0)).tableau[1]).toEqual(
      faceUp(cardOf({ rank: 4, suit: 'spades' }))
    )
  })

  it('[solitaire] draws only from a stock, and turns the waste over only once the stock is out', () => {
    const start = solitaireEngine.start(LEVEL)
    expect(isLegal(start, { kind: 'recycle' })).toBe(false)
    const drawn = start.stock.reduce(
      (state) => play(state, { kind: 'draw' }),
      start
    )
    expect(isLegal(drawn, { kind: 'draw' })).toBe(false)
    expect(play(drawn, { kind: 'recycle' }).stock).toEqual(start.stock)
  })

  it('[solitaire] is won once every card is home', () => {
    const state: SolitaireState = {
      ...withTableau([]),
      foundations: SUITS.map((_, suit) =>
        FRESH_DECK.slice(suit * RANKS_PER_SUIT, (suit + 1) * RANKS_PER_SUIT)
      ),
      stock: [],
      waste: []
    }
    expect(solitaireEngine.isWon(state)).toBe(true)
    expect(solitaireEngine.isWon(solitaireEngine.start(LEVEL))).toBe(false)
  })

  it('[solitaire] hints a move the rules accept', () => {
    for (let seed = 0; seed < 20; seed++) {
      const state = solitaireEngine.start({
        deck: createSeededRandom(seed).shuffled(FRESH_DECK),
        draw: 1
      })
      const hint = solitaireEngine.hint(state)
      expect(hint).not.toBeNull()
      if (hint !== null) expect(isLegal(state, hint.move)).toBe(true)
    }
  })
})
