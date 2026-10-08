import type { SavedGame } from '@/features/game-frame/saved-game'

/** The game the hub offers to resume: the one played last. */
export const resumableGame = (saved: readonly SavedGame[]): SavedGame | null =>
  saved.reduce<SavedGame | null>(
    (latest, game) =>
      latest === null || game.savedAtMs > latest.savedAtMs ? game : latest,
    null
  )
