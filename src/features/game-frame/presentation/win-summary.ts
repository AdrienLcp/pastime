/** This game's moves against the fewest, printed for games that count them. */
export type MovesSummary = {
  readonly count: number
  readonly fewest: number
  /** The fewest this game beat, struck through; `null` when it did not beat one. */
  readonly beatenFewest: number | null
  readonly isNewFewest: boolean
}

/** What the win screen prints: this time against the best. */
export type WinSummary = {
  readonly elapsedMs: number
  readonly bestMs: number | null
  /** The best this time beat, struck through on the page; `null` when it did not beat one. */
  readonly beatenBestMs: number | null
  readonly isNewBest: boolean
  readonly moves: MovesSummary
}

export const winSummaryOf = ({
  elapsedMs,
  isNewBest,
  isNewFewestMoves,
  moveCount,
  previousBestMs,
  previousFewestMoves
}: {
  elapsedMs: number
  moveCount: number
  isNewBest: boolean
  previousBestMs: number | null
  isNewFewestMoves: boolean
  previousFewestMoves: number | null
}): WinSummary => ({
  beatenBestMs: isNewBest ? previousBestMs : null,
  bestMs: isNewBest ? elapsedMs : previousBestMs,
  elapsedMs,
  isNewBest,
  moves: {
    beatenFewest: isNewFewestMoves ? previousFewestMoves : null,
    count: moveCount,
    fewest: isNewFewestMoves ? moveCount : (previousFewestMoves ?? moveCount),
    isNewFewest: isNewFewestMoves
  }
})
