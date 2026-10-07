import { z } from 'zod/mini'

import type { Card } from './playing-card'
import { SUITS } from './playing-card'
import type { SolitaireLevel } from './solitaire-level'

export const TABLEAU_COLUMNS = 7

/** A tableau column: its first `hidden` cards lie face down. */
export type TableauColumn = {
  readonly cards: readonly Card[]
  readonly hidden: number
}

/** The table in play. In every pile, the last card is the one on top. */
export type SolitaireState = {
  readonly level: SolitaireLevel
  readonly stock: readonly Card[]
  readonly waste: readonly Card[]
  /** One per suit, in `SUITS` order. */
  readonly foundations: readonly (readonly Card[])[]
  readonly tableau: readonly TableauColumn[]
}

const suitSchema = z.number().check(z.int(), z.gte(0), z.lt(SUITS.length))
const columnSchema = z.number().check(z.int(), z.gte(0), z.lt(TABLEAU_COLUMNS))

const wasteSchema = z.object({ kind: z.literal('waste') })
const foundationSchema = z.object({
  kind: z.literal('foundation'),
  suit: suitSchema
})
const tableauSchema = z.object({
  column: columnSchema,
  kind: z.literal('tableau')
})

const pileSchema = z.discriminatedUnion('kind', [
  wasteSchema,
  foundationSchema,
  tableauSchema
])

const targetSchema = z.discriminatedUnion('kind', [
  foundationSchema,
  tableauSchema
])

export type Pile = z.infer<typeof pileSchema>

/** Where cards can be put down: the waste only ever takes the stock's. */
export type TargetPile = z.infer<typeof targetSchema>

/**
 * `draw` turns the stock's top over onto the waste, `recycle` turns the waste
 * back into the stock once the stock is out, and `move` carries the top
 * `count` cards of a pile — more than one only off the tableau.
 */
export const solitaireMoveSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('draw') }),
  z.object({ kind: z.literal('recycle') }),
  z.object({
    count: z.number().check(z.int(), z.gte(1)),
    from: pileSchema,
    kind: z.literal('move'),
    to: targetSchema
  })
])

export type SolitaireMove = z.infer<typeof solitaireMoveSchema>

export type CardMove = Extract<SolitaireMove, { kind: 'move' }>
