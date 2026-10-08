import { type Card, suitIndexOf } from '../engine/playing-card'
import { columnOf, movableCountOf } from '../engine/solitaire-rules'
import {
  type Pile,
  type SolitaireState,
  TABLEAU_COLUMNS,
  type TargetPile
} from '../engine/solitaire-state'

/** A bridge card, 5 wide by 7 tall. */
const CARD_RATIO = 1.4
const COLUMN_GAP_PX = 4
/** The space between the top row and the tableau, in card widths. */
const ROW_GAP = 0.3
/** How far a face-down card shows under the next one, in card widths. */
const HIDDEN_STEP = 0.17
const MIN_HIDDEN_STEP_PX = 7
/** How far a face-up card shows under the next: its rank and suit. */
const SHOWN_STEP = 0.44
const MIN_SHOWN_STEP_PX = 19
/** The tightest a long column squeezes to fit: the rank stays readable. */
const TIGHT_SHOWN_STEP = 0.34
/** Drawing three, how far apart the waste's top cards fan out. */
const WASTE_FAN = 0.24
const FIRST_FOUNDATION_SLOT = 3
/**
 * The height a table needs, in card widths, for a long column to stay inside
 * it: on a wide screen the cards are sized on the height as much as the width.
 */
const TABLE_DEPTH = 6.5

export type Rect = {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

/** The cards that leave together when this one is picked up. */
export type Lift = { readonly from: Pile; readonly count: number }

/** Where a card lies on the table, in pixels from the table's corner. */
export type CardSpot = {
  readonly x: number
  readonly y: number
  /** Its place in its pile: higher lies on top. */
  readonly z: number
  readonly isFaceUp: boolean
  /** Names the pile, so a card that changed piles can be told apart. */
  readonly pileKey: string
  /** `null` for a card that cannot be picked up from where it lies. */
  readonly lift: Lift | null
}

export type TablePile = Pile | { readonly kind: 'stock' }

export type PileArea = { readonly pile: TablePile; readonly area: Rect }

export type TableLayout = {
  /** Where the first column starts: the table is centred in a room wider than it needs. */
  readonly left: number
  readonly cardWidth: number
  readonly cardHeight: number
  readonly height: number
  readonly tableauTop: number
  readonly spots: ReadonlyMap<Card, CardSpot>
  readonly piles: readonly PileArea[]
}

const COLUMNS = Array.from({ length: TABLEAU_COLUMNS }, (_, column) => column)

export const pileKeyOf = (pile: TablePile): string => {
  switch (pile.kind) {
    case 'stock':
    case 'waste':
      return pile.kind
    case 'foundation':
      return `foundation-${pile.suit}`
    case 'tableau':
      return `tableau-${pile.column}`
    default:
      return pile satisfies never
  }
}

const liftOf = ({
  from,
  fromTop,
  state
}: {
  state: SolitaireState
  from: Pile
  fromTop: number
}): Lift | null =>
  fromTop <= movableCountOf(state, from) ? { count: fromTop, from } : null

type Measures = {
  readonly left: number
  readonly cardWidth: number
  readonly cardHeight: number
  readonly slotX: (slot: number) => number
  readonly tableauTop: number
  readonly hiddenStep: number
  readonly shownStep: number
}

const measuresOf = ({
  availableHeight,
  width
}: {
  width: number
  availableHeight: number | null
}): Measures => {
  const gaps = (TABLEAU_COLUMNS - 1) * COLUMN_GAP_PX
  const widthFitting = (width - gaps) / TABLEAU_COLUMNS
  const cardWidth = Math.max(
    0,
    availableHeight === null
      ? widthFitting
      : Math.min(widthFitting, availableHeight / TABLE_DEPTH)
  )
  const cardHeight = cardWidth * CARD_RATIO
  const left = Math.max(0, (width - TABLEAU_COLUMNS * cardWidth - gaps) / 2)
  return {
    cardHeight,
    cardWidth,
    hiddenStep: Math.max(MIN_HIDDEN_STEP_PX, cardWidth * HIDDEN_STEP),
    left,
    shownStep: Math.max(MIN_SHOWN_STEP_PX, cardWidth * SHOWN_STEP),
    slotX: (slot) => left + slot * (cardWidth + COLUMN_GAP_PX),
    tableauTop: cardHeight + cardWidth * ROW_GAP
  }
}

/** The step between face-up cards that keeps a column inside the table. */
const shownStepFor = ({
  availableHeight,
  hidden,
  measures,
  shown
}: {
  measures: Measures
  availableHeight: number | null
  hidden: number
  shown: number
}): number => {
  const { cardHeight, cardWidth, hiddenStep, shownStep, tableauTop } = measures
  if (availableHeight === null || shown < 2) return shownStep
  const room = availableHeight - tableauTop - cardHeight - hidden * hiddenStep
  const fitting = room / (shown - 1)
  return Math.min(shownStep, Math.max(cardWidth * TIGHT_SHOWN_STEP, fitting))
}

type Placed = readonly (readonly [Card, CardSpot])[]

const topRowSpots = (state: SolitaireState, measures: Measures): Placed => {
  const { slotX } = measures
  const fanned = state.level.draw
  const stock = state.stock.map((card, index): readonly [Card, CardSpot] => [
    card,
    {
      isFaceUp: false,
      lift: null,
      pileKey: 'stock',
      x: slotX(0),
      y: 0,
      z: index + 1
    }
  ])
  const waste = state.waste.map((card, index): readonly [Card, CardSpot] => {
    const fromTop = state.waste.length - index
    const fan = Math.max(0, Math.min(fanned, state.waste.length) - fromTop)
    return [
      card,
      {
        isFaceUp: true,
        lift: liftOf({ from: { kind: 'waste' }, fromTop, state }),
        pileKey: 'waste',
        x: slotX(1) + fan * measures.cardWidth * WASTE_FAN,
        y: 0,
        z: index + 1
      }
    ]
  })
  const foundations = state.foundations.flatMap((cards, suit) =>
    cards.map((card, index): readonly [Card, CardSpot] => {
      const from: Pile = { kind: 'foundation', suit }
      return [
        card,
        {
          isFaceUp: true,
          lift: liftOf({ from, fromTop: cards.length - index, state }),
          pileKey: pileKeyOf(from),
          x: slotX(FIRST_FOUNDATION_SLOT + suit),
          y: 0,
          z: index + 1
        }
      ]
    })
  )
  return [...stock, ...waste, ...foundations]
}

const columnSpots = ({
  availableHeight,
  column,
  measures,
  state
}: {
  state: SolitaireState
  measures: Measures
  availableHeight: number | null
  column: number
}): Placed => {
  const { cards, hidden } = columnOf(state, column)
  const from: Pile = { column, kind: 'tableau' }
  const shownStep = shownStepFor({
    availableHeight,
    hidden,
    measures,
    shown: cards.length - hidden
  })
  return cards.map((card, index): readonly [Card, CardSpot] => {
    const shownBefore = Math.max(0, index - hidden)
    const hiddenBefore = index - shownBefore
    return [
      card,
      {
        isFaceUp: index >= hidden,
        lift: liftOf({ from, fromTop: cards.length - index, state }),
        pileKey: pileKeyOf(from),
        x: measures.slotX(column),
        y:
          measures.tableauTop +
          hiddenBefore * measures.hiddenStep +
          shownBefore * shownStep,
        z: index + 1
      }
    ]
  })
}

const pileAreasOf = ({
  measures,
  spots,
  state
}: {
  state: SolitaireState
  measures: Measures
  spots: ReadonlyMap<Card, CardSpot>
}): readonly PileArea[] => {
  const { cardHeight, cardWidth, slotX, tableauTop } = measures
  const slot = (index: number): Rect => ({
    height: cardHeight,
    width: cardWidth,
    x: slotX(index),
    y: 0
  })
  const lastCardTop = (cards: readonly Card[]) => {
    const last = cards.at(-1)
    return last === undefined ? tableauTop : (spots.get(last)?.y ?? tableauTop)
  }
  const wasteFan = (state.level.draw - 1) * cardWidth * WASTE_FAN
  return [
    { area: slot(0), pile: { kind: 'stock' } },
    {
      area: { ...slot(1), width: cardWidth + wasteFan },
      pile: { kind: 'waste' }
    },
    ...state.foundations.map(
      (_, suit): PileArea => ({
        area: slot(FIRST_FOUNDATION_SLOT + suit),
        pile: { kind: 'foundation', suit }
      })
    ),
    ...COLUMNS.map(
      (column): PileArea => ({
        area: {
          height:
            lastCardTop(columnOf(state, column).cards) -
            tableauTop +
            cardHeight,
          width: cardWidth,
          x: slotX(column),
          y: tableauTop
        },
        pile: { column, kind: 'tableau' }
      })
    )
  ]
}

/**
 * Every card's place on a table this wide. Given a height, long columns
 * squeeze their face-up cards to stay inside it; without one, the table
 * takes the height its columns need.
 */
export const tableLayoutOf = ({
  availableHeight,
  state,
  width
}: {
  state: SolitaireState
  width: number
  availableHeight: number | null
}): TableLayout => {
  const measures = measuresOf({ availableHeight, width })
  const spots = new Map([
    ...topRowSpots(state, measures),
    ...COLUMNS.flatMap((column) =>
      columnSpots({ availableHeight, column, measures, state })
    )
  ])
  const lowest = Math.max(
    measures.tableauTop,
    ...[...spots.values()].map((spot) => spot.y)
  )
  return {
    cardHeight: measures.cardHeight,
    cardWidth: measures.cardWidth,
    height: availableHeight ?? lowest + measures.cardHeight,
    left: measures.left,
    piles: pileAreasOf({ measures, spots, state }),
    spots,
    tableauTop: measures.tableauTop
  }
}

/**
 * Where a card let go with its centre at this point lands: anywhere over the
 * foundations means its own suit's, anywhere below the top row the nearest
 * column, and nowhere over the stock and the waste.
 */
export const dropTargetAt = ({
  card,
  layout,
  point
}: {
  layout: TableLayout
  card: Card
  point: { readonly x: number; readonly y: number }
}): TargetPile | null => {
  const pitch = layout.cardWidth + COLUMN_GAP_PX
  const slot = Math.min(
    TABLEAU_COLUMNS - 1,
    Math.max(0, Math.floor((point.x - layout.left + COLUMN_GAP_PX / 2) / pitch))
  )
  const isOverTopRow =
    point.y < layout.tableauTop - (layout.cardWidth * ROW_GAP) / 2
  if (!isOverTopRow) return { column: slot, kind: 'tableau' }
  return slot >= FIRST_FOUNDATION_SLOT
    ? { kind: 'foundation', suit: suitIndexOf(card) }
    : null
}
