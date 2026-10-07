import { Result } from '@adrienlcp/result'

import {
  type Card,
  isRed,
  isRedSuitAt,
  KING,
  rankOf,
  suitIndexOf
} from '../engine/playing-card'
import {
  applySolitaireMove,
  canReceive,
  isEveryCardRevealed
} from '../engine/solitaire-rules'
import type {
  CardMove,
  SolitaireMove,
  SolitaireState,
  TargetPile
} from '../engine/solitaire-state'

const DRAW: SolitaireMove = { kind: 'draw' }
const RECYCLE: SolitaireMove = { kind: 'recycle' }

/** A position, and the moves that reached it from the one searched before. */
type Branch = {
  readonly moves: readonly SolitaireMove[]
  readonly state: SolitaireState
}

/**
 * The stock and the waste as one ring, in the order draws turn the cards up.
 * Drawing one card at a time with no limit on passes, any card of the ring can
 * be reached at any time, so the search treats them all as playable.
 */
const talonOf = (state: SolitaireState): readonly Card[] => [
  ...state.waste,
  ...state.stock.toReversed()
]

const drawsOf = (count: number): SolitaireMove[] =>
  Array<SolitaireMove>(count).fill(DRAW)

/** The draws, and the turn of the waste if need be, that bring a ring card on top of the waste. */
const reachTalonCard = (state: SolitaireState, index: number): Branch => {
  const talon = talonOf(state)
  const wasteTop = state.waste.length - 1
  const moves =
    index >= wasteTop
      ? drawsOf(index - wasteTop)
      : [...drawsOf(state.stock.length), RECYCLE, ...drawsOf(index + 1)]
  return {
    moves,
    state: {
      ...state,
      stock: talon.slice(index + 1).toReversed(),
      waste: talon.slice(0, index + 1)
    }
  }
}

const play = (branch: Branch, move: SolitaireMove): Branch | null => {
  const next = applySolitaireMove(branch.state, move)
  if (next.status === 'failure') return null
  return { moves: [...branch.moves, move], state: next.data.board }
}

const foundationFor = (card: Card): TargetPile => ({
  kind: 'foundation',
  suit: suitIndexOf(card)
})

const fitsFoundation = (state: SolitaireState, card: Card): boolean =>
  canReceive({ cards: [card], state, to: foundationFor(card) })

/**
 * A card no column could still want as a base: the cards it would hold, one
 * rank lower in the other colour, are already home. Playing it is never wrong.
 */
const isSafeHome = (state: SolitaireState, card: Card): boolean => {
  const rank = rankOf(card)
  if (rank <= 2) return true
  return state.foundations.every(
    (foundation, suit) =>
      isRedSuitAt(suit) === isRed(card) || foundation.length >= rank - 1
  )
}

const tableauTops = (state: SolitaireState) =>
  state.tableau.flatMap((column, index) => {
    const card = column.cards.at(-1)
    return card === undefined ? [] : [{ card, column: index }]
  })

const safeHomeMoveOf = (state: SolitaireState): Branch | null => {
  for (const { card, column } of tableauTops(state)) {
    if (fitsFoundation(state, card) && isSafeHome(state, card)) {
      return play(
        { moves: [], state },
        {
          count: 1,
          from: { column, kind: 'tableau' },
          kind: 'move',
          to: foundationFor(card)
        }
      )
    }
  }
  const talon = talonOf(state)
  const index = talon.findIndex(
    (card) => fitsFoundation(state, card) && isSafeHome(state, card)
  )
  const card = talon[index]
  if (card === undefined) return null
  return play(reachTalonCard(state, index), {
    count: 1,
    from: { kind: 'waste' },
    kind: 'move',
    to: foundationFor(card)
  })
}

/** Every safe card sent home, one after the other. */
const settle = (state: SolitaireState): Branch => {
  let settled: Branch = { moves: [], state }
  for (;;) {
    const next = safeHomeMoveOf(settled.state)
    if (next === null) return settled
    settled = { moves: [...settled.moves, ...next.moves], state: next.state }
  }
}

/**
 * The columns a run led by this card could go to. A king only tries the first
 * empty column: the others would give the same position, columns swapped.
 */
const columnTargetsFor = ({
  from,
  lead,
  state
}: {
  state: SolitaireState
  lead: Card
  from: number | null
}): TargetPile[] => {
  const firstEmpty = state.tableau.findIndex(
    (column) => column.cards.length === 0
  )
  return state.tableau.flatMap((column, index): TargetPile[] => {
    if (index === from) return []
    if (column.cards.length === 0 && index !== firstEmpty) return []
    const to: TargetPile = { column: index, kind: 'tableau' }
    return canReceive({ cards: [lead], state, to }) ? [to] : []
  })
}

const columnMove = ({
  column,
  count,
  to
}: {
  column: number
  count: number
  to: TargetPile
}): CardMove => ({ count, from: { column, kind: 'tableau' }, kind: 'move', to })

/**
 * The moves worth trying, most promising first: turning a face-down card over,
 * sending a card home, bringing a stock card down, emptying a column, freeing
 * a card for its foundation. Shuffling a run between two columns for nothing
 * is never tried.
 */
const branchesOf = (state: SolitaireState): Branch[] => {
  const start: Branch = { moves: [], state }
  const fromColumns = (moves: CardMove[]) =>
    moves.flatMap((move) => {
      const branch = play(start, move)
      return branch === null ? [] : [branch]
    })

  const columns = state.tableau.map((column, index) => ({
    ...column,
    index,
    run: column.cards.length - column.hidden
  }))

  const revealing = columns
    .filter((column) => column.hidden > 0)
    .toSorted((a, b) => b.hidden - a.hidden)
    .flatMap((column) => {
      const lead = column.cards[column.hidden]
      if (lead === undefined) return []
      const home =
        column.run === 1 && fitsFoundation(state, lead)
          ? [
              columnMove({
                column: column.index,
                count: 1,
                to: foundationFor(lead)
              })
            ]
          : []
      return [
        ...home,
        ...columnTargetsFor({ from: column.index, lead, state }).map((to) =>
          columnMove({ column: column.index, count: column.run, to })
        )
      ]
    })

  const columnsHome = tableauTops(state)
    .filter(
      ({ card, column }) =>
        fitsFoundation(state, card) && columns[column]?.hidden === 0
    )
    .map(({ card, column }) =>
      columnMove({ column, count: 1, to: foundationFor(card) })
    )

  const talon = talonOf(state)
  const talonPlays = (targetsOf: (card: Card) => TargetPile[]) =>
    talon.flatMap((card, index) =>
      targetsOf(card).flatMap((to) => {
        const branch = play(reachTalonCard(state, index), {
          count: 1,
          from: { kind: 'waste' },
          kind: 'move',
          to
        })
        return branch === null ? [] : [branch]
      })
    )

  const emptying = columns
    .filter(
      (column) =>
        column.hidden === 0 &&
        column.run > 0 &&
        rankOf(column.cards[0] ?? KING) !== KING
    )
    .flatMap((column) => {
      const lead = column.cards[0]
      if (lead === undefined) return []
      return columnTargetsFor({ from: column.index, lead, state }).map((to) =>
        columnMove({ column: column.index, count: column.run, to })
      )
    })

  const freeing = columns.flatMap((column) =>
    Array.from({ length: Math.max(0, column.run - 1) }, (_, offset) => {
      const count = offset + 1
      const freed = column.cards.at(-count - 1)
      const lead = column.cards.at(-count)
      if (freed === undefined || lead === undefined) return []
      if (!fitsFoundation(state, freed)) return []
      return columnTargetsFor({ from: column.index, lead, state }).map((to) =>
        columnMove({ column: column.index, count, to })
      )
    }).flat()
  )

  return [
    ...fromColumns(revealing),
    ...fromColumns(columnsHome),
    ...talonPlays((card) =>
      fitsFoundation(state, card) ? [foundationFor(card)] : []
    ),
    ...talonPlays((card) =>
      columnTargetsFor({ from: null, lead: card, state })
    ),
    ...fromColumns(emptying),
    ...fromColumns(freeing)
  ]
}

const CODE_OFFSET = 48

const codeOf = (cards: readonly Card[]) =>
  String.fromCharCode(...cards.map((card) => card + CODE_OFFSET))

/**
 * A position, the same whichever column holds which pile and wherever the
 * stock was in its pass: those positions all lead to the same games.
 */
const positionKeyOf = (state: SolitaireState): string =>
  [
    codeOf(talonOf(state)),
    ...state.tableau
      .map((column) => `${column.hidden}${codeOf(column.cards)}`)
      .toSorted()
  ].join('|')

export type SolveFailure = 'budget_spent' | 'stuck' | 'unsupported'

/**
 * A way through from this position, drawing one card at a time: depth first,
 * the most promising moves tried first, each position searched once. The moves
 * stop once every tableau card is face up — auto-complete wins from there.
 * `'budget_spent'` when the search gave up after `nodeBudget` positions,
 * `'stuck'` when it saw them all; it skips some moves, so stuck is not a proof.
 */
export const solveSolitaire = ({
  nodeBudget,
  state
}: {
  state: SolitaireState
  nodeBudget: number
}): Result<{ readonly moves: readonly SolitaireMove[] }, SolveFailure> => {
  if (state.level.draw !== 1) return Result.failure('unsupported')
  const seen = new Set<string>()
  let nodes = 0

  const search = (position: SolitaireState): SolitaireMove[] | null => {
    const settled = settle(position)
    if (isEveryCardRevealed(settled.state)) return [...settled.moves]
    if (nodes >= nodeBudget) return null
    const key = positionKeyOf(settled.state)
    if (seen.has(key)) return null
    seen.add(key)
    nodes++
    for (const branch of branchesOf(settled.state)) {
      const rest = search(branch.state)
      if (rest !== null) return [...settled.moves, ...branch.moves, ...rest]
      if (nodes >= nodeBudget) return null
    }
    return null
  }

  const moves = search(state)
  if (moves !== null) return Result.success({ moves })
  return Result.failure(nodes >= nodeBudget ? 'budget_spent' : 'stuck')
}
