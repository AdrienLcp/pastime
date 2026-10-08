import type { GameDefinition } from './game-definition'
import { findGame } from './game-registry'
import { readPlayRecordOrEmpty, readWaitingGame } from './game-storage'
import { preferredVariantId } from './play-record'
import type { SavedGame } from './saved-game'

export type ChooseLoaderData =
  | { readonly status: 'unknown_game' }
  | {
      readonly status: 'ready'
      readonly game: GameDefinition
      /** The variant played last, picked before the player picks. */
      readonly variantId: string
      /** The game left mid-way, offered to resume; `null` when there is none. */
      readonly waiting: SavedGame | null
    }

/** What a game's page asks before playing: which variant, or the game left mid-way. */
export const chooseLoader = (gameId: string): ChooseLoaderData => {
  const game = findGame(gameId)
  if (game === null) return { status: 'unknown_game' }
  const waiting = readWaitingGame(game.id)
  return {
    game,
    status: 'ready',
    variantId: preferredVariantId({ game, record: readPlayRecordOrEmpty() }),
    waiting: waiting.status === 'success' ? waiting.data : null
  }
}
