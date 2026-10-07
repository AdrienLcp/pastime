import type { SavedGame } from '@/features/game-frame/saved-game'

/**
 * The game the hub offers to resume: the one played last. A daily left from an
 * earlier day is not offered — its puzzle is gone, the page would open today's.
 */
export const resumableGame = ({
  saved,
  today
}: {
  saved: readonly SavedGame[]
  today: Temporal.PlainDate
}): SavedGame | null =>
  saved
    .filter(
      (game) =>
        game.puzzle.mode === 'free' || game.puzzle.day === today.toString()
    )
    .reduce<SavedGame | null>(
      (latest, game) =>
        latest === null || game.savedAtMs > latest.savedAtMs ? game : latest,
      null
    )
