import { Result } from '@adrienlcp/result'

import {
  type Card,
  isRed,
  KING,
  RANKS_PER_SUIT,
  rankOf,
  SUITS,
  suitIndexOf
} from './playing-card'
import {
  type CardMove,
  type Pile,
  type SolitaireMove,
  type SolitaireState,
  TABLEAU_COLUMNS,
  type TableauColumn,
  type TargetPile
} from './solitaire-state'

const EMPTY_COLUMN: TableauColumn = { cards: [], hidden: 0 }

export const columnOf = (
  state: SolitaireState,
  column: number
): TableauColumn => state.tableau[column] ?? EMPTY_COLUMN

const foundationOf = (state: SolitaireState, suit: number): readonly Card[] =>
  state.foundations[suit] ?? []

export const cardsOf = (state: SolitaireState, pile: Pile): readonly Card[] => {
  switch (pile.kind) {
    case 'waste':
      return state.waste
    case 'foundation':
      return foundationOf(state, pile.suit)
    case 'tableau':
      return columnOf(state, pile.column).cards
    default:
      return pile satisfies never
  }
}

/** How many of a pile's top cards can leave it together. */
export const movableCountOf = (state: SolitaireState, pile: Pile): number => {
  const cards = cardsOf(state, pile)
  if (pile.kind !== 'tableau') return Math.min(1, cards.length)
  return cards.length - columnOf(state, pile.column).hidden
}

export const isSamePile = (a: Pile, b: Pile): boolean => {
  if (a.kind === 'tableau' && b.kind === 'tableau') return a.column === b.column
  if (a.kind === 'foundation' && b.kind === 'foundation')
    return a.suit === b.suit
  return a.kind === b.kind
}

/**
 * Whether a pile takes these cards on top, the first one leading: a
 * foundation builds up by suit from the ace, a column down in alternating
 * colours, and only a king fills an empty column.
 */
export const canReceive = ({
  cards,
  state,
  to
}: {
  state: SolitaireState
  to: TargetPile
  cards: readonly Card[]
}): boolean => {
  const [lead] = cards
  if (lead === undefined) return false
  if (to.kind === 'foundation') {
    return (
      cards.length === 1 &&
      suitIndexOf(lead) === to.suit &&
      rankOf(lead) === foundationOf(state, to.suit).length + 1
    )
  }
  const top = columnOf(state, to.column).cards.at(-1)
  if (top === undefined) return rankOf(lead) === KING
  return isRed(top) !== isRed(lead) && rankOf(top) === rankOf(lead) + 1
}

const liftedCardsOf = (
  state: SolitaireState,
  move: CardMove
): readonly Card[] | null => {
  if (move.count > movableCountOf(state, move.from)) return null
  return cardsOf(state, move.from).slice(-move.count)
}

/** A column left with its last card face down turns that card over. */
const withoutTop = ({
  count,
  from,
  state
}: {
  state: SolitaireState
  from: Pile
  count: number
}): SolitaireState => {
  switch (from.kind) {
    case 'waste':
      return { ...state, waste: state.waste.slice(0, -count) }
    case 'foundation':
      return {
        ...state,
        foundations: state.foundations.with(
          from.suit,
          foundationOf(state, from.suit).slice(0, -count)
        )
      }
    case 'tableau': {
      const column = columnOf(state, from.column)
      const cards = column.cards.slice(0, -count)
      const hidden = Math.min(column.hidden, Math.max(0, cards.length - 1))
      return {
        ...state,
        tableau: state.tableau.with(from.column, { cards, hidden })
      }
    }
    default:
      return from satisfies never
  }
}

const withAdded = ({
  cards,
  state,
  to
}: {
  state: SolitaireState
  to: TargetPile
  cards: readonly Card[]
}): SolitaireState => {
  if (to.kind === 'foundation') {
    return {
      ...state,
      foundations: state.foundations.with(to.suit, [
        ...foundationOf(state, to.suit),
        ...cards
      ])
    }
  }
  const column = columnOf(state, to.column)
  return {
    ...state,
    tableau: state.tableau.with(to.column, {
      ...column,
      cards: [...column.cards, ...cards]
    })
  }
}

const moveCards = (
  state: SolitaireState,
  move: CardMove
): SolitaireState | null => {
  if (isSamePile(move.from, move.to)) return null
  const cards = liftedCardsOf(state, move)
  if (cards === null || !canReceive({ cards, state, to: move.to })) return null
  return withAdded({
    cards,
    state: withoutTop({ count: move.count, from: move.from, state }),
    to: move.to
  })
}

const draw = (state: SolitaireState): SolitaireState | null => {
  if (state.stock.length === 0) return null
  const count = Math.min(state.level.draw, state.stock.length)
  return {
    ...state,
    stock: state.stock.slice(0, -count),
    waste: [...state.waste, ...state.stock.slice(-count).toReversed()]
  }
}

const recycle = (state: SolitaireState): SolitaireState | null => {
  if (state.stock.length > 0 || state.waste.length === 0) return null
  return { ...state, stock: state.waste.toReversed(), waste: [] }
}

const nextStateOf = (
  state: SolitaireState,
  move: SolitaireMove
): SolitaireState | null => {
  switch (move.kind) {
    case 'draw':
      return draw(state)
    case 'recycle':
      return recycle(state)
    case 'move':
      return moveCards(state, move)
    default:
      return move satisfies never
  }
}

export const applySolitaireMove = (
  state: SolitaireState,
  move: SolitaireMove
): Result<{ readonly board: SolitaireState }, 'illegal'> => {
  const board = nextStateOf(state, move)
  return board === null ? Result.failure('illegal') : Result.success({ board })
}

export const isLegalMove = (
  state: SolitaireState,
  move: SolitaireMove
): boolean => nextStateOf(state, move) !== null

const COLUMNS = Array.from({ length: TABLEAU_COLUMNS }, (_, column) => column)

const SOURCE_PILES: readonly Pile[] = [
  { kind: 'waste' },
  ...SUITS.map((_, suit) => ({ kind: 'foundation' as const, suit })),
  ...COLUMNS.map((column) => ({ column, kind: 'tableau' as const }))
]

/** Every place a lifted pile could go, its own suit's foundation first. */
export const targetsFor = (lead: Card): readonly TargetPile[] => [
  { kind: 'foundation', suit: suitIndexOf(lead) },
  ...COLUMNS.map((column) => ({ column, kind: 'tableau' as const }))
]

/** Every move the rules allow from here, the stock's first. */
export const legalMovesOf = (state: SolitaireState): SolitaireMove[] => {
  const stockMoves: SolitaireMove[] = [{ kind: 'draw' }, { kind: 'recycle' }]
  const cardMoves = SOURCE_PILES.flatMap((from) =>
    Array.from({ length: movableCountOf(state, from) }, (_, index) => {
      const count = index + 1
      const lead = cardsOf(state, from).at(-count)
      if (lead === undefined) return []
      return targetsFor(lead).map(
        (to): SolitaireMove => ({ count, from, kind: 'move', to })
      )
    }).flat()
  )
  return [...stockMoves, ...cardMoves].filter((move) =>
    isLegalMove(state, move)
  )
}

export const isSolitaireWon = (state: SolitaireState): boolean =>
  state.foundations.every((foundation) => foundation.length === RANKS_PER_SUIT)

/**
 * Every card in the tableau face up: from here the game always comes out,
 * since the lowest card left is always on top of its pile or in the stock.
 */
export const isEveryCardRevealed = (state: SolitaireState): boolean =>
  state.tableau.every((column) => column.hidden === 0)
