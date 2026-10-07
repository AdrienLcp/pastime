import { pipesDefinition } from '@/features/pipes/pipes-definition'
import { starsDefinition } from '@/features/stars/stars-definition'

import type { GameDefinition } from './game-definition'

/**
 * Every game in the book, in the order the hub prints them. Adding a game is
 * one line here; nothing else in the frame or the hub names a game.
 */
export const GAMES = [
  starsDefinition,
  pipesDefinition
] as const satisfies readonly GameDefinition[]

export type GameId = (typeof GAMES)[number]['id']

export const findGame = (id: string): GameDefinition | null =>
  GAMES.find((game) => game.id === id) ?? null

export const variantOf = ({
  game,
  variantId
}: {
  game: GameDefinition
  variantId: string
}) =>
  game.variants.find((variant) => variant.id === variantId) ?? game.variants[0]
