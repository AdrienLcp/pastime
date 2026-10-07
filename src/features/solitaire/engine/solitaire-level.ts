import { z } from 'zod/mini'

import { cardSchema, DECK_SIZE } from './playing-card'

const isWholeDeck = (deck: readonly number[]) =>
  deck.length === DECK_SIZE && new Set(deck).size === DECK_SIZE

/**
 * A printed deal: the shuffled deck, dealt from its start — the tableau first,
 * the rest face down in the stock — and how many cards a draw turns over.
 */
export const solitaireLevelSchema = z.object({
  deck: z
    .array(cardSchema)
    .check(z.refine(isWholeDeck, { message: 'every card once' })),
  draw: z.union([z.literal(1), z.literal(3)])
})

export type SolitaireLevel = z.infer<typeof solitaireLevelSchema>
