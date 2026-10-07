import { z } from 'zod/mini'

/**
 * A card from a 52-card deck, as its place in a fresh deck: suit by suit
 * (clubs, diamonds, hearts, spades), ace to king. Klondike's rules live apart,
 * so another card game can deal from the same deck.
 */
export type Card = number

export const SUITS = ['clubs', 'diamonds', 'hearts', 'spades'] as const

export type Suit = (typeof SUITS)[number]

export const RANKS_PER_SUIT = 13
export const DECK_SIZE = SUITS.length * RANKS_PER_SUIT

export const ACE = 1
export const KING = 13

export const FRESH_DECK: readonly Card[] = Array.from(
  { length: DECK_SIZE },
  (_, card) => card
)

export const cardSchema = z.number().check(z.int(), z.gte(0), z.lt(DECK_SIZE))

/** The suit's place in `SUITS`, 0 to 3: a foundation per suit. */
export const suitIndexOf = (card: Card): number =>
  Math.floor(card / RANKS_PER_SUIT)

export const suitOf = (card: Card): Suit => SUITS[suitIndexOf(card)] ?? 'clubs'

/** Ace is 1, king 13. */
export const rankOf = (card: Card): number => (card % RANKS_PER_SUIT) + 1

const RED_SUITS: ReadonlySet<Suit> = new Set(['diamonds', 'hearts'])

export const isSuitRed = (suit: Suit): boolean => RED_SUITS.has(suit)

export const isRed = (card: Card): boolean => isSuitRed(suitOf(card))

/** Whether the suit at this place in `SUITS` is red: a foundation's colour. */
export const isRedSuitAt = (suitIndex: number): boolean =>
  isRed(suitIndex * RANKS_PER_SUIT)

export const cardOf = ({ rank, suit }: { suit: Suit; rank: number }): Card =>
  SUITS.indexOf(suit) * RANKS_PER_SUIT + rank - 1
