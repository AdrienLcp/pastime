/** This game's moves against the fewest, printed for games that count them. */
export type MovesSummary = {
  readonly count: number
  readonly fewest: number
  /** The fewest this game beat, struck through; `null` when it did not beat one. */
  readonly beatenFewest: number | null
  readonly isNewFewest: boolean
}

/** This game's points, its time bonus within them, against the best score. */
export type ScoreSummary = {
  readonly total: number
  readonly timeBonus: number
  readonly best: number
  /** The best score this one beat, struck through; `null` when it did not beat one. */
  readonly beatenBest: number | null
  readonly isNewBest: boolean
}

/** What the win screen prints: this time against the best. */
export type WinSummary = {
  readonly elapsedMs: number
  readonly bestMs: number | null
  /** The best this time beat, struck through on the page; `null` when it did not beat one. */
  readonly beatenBestMs: number | null
  readonly isNewBest: boolean
  readonly moves: MovesSummary
  /** `null` for a game without points. */
  readonly score: ScoreSummary | null
}

export type WonScore = { readonly total: number; readonly timeBonus: number }

export const winSummaryOf = ({
  elapsedMs,
  isNewBest,
  isNewBestScore,
  isNewFewestMoves,
  moveCount,
  previousBestMs,
  previousBestScore,
  previousFewestMoves,
  score
}: {
  elapsedMs: number
  moveCount: number
  score: WonScore | null
  isNewBest: boolean
  previousBestMs: number | null
  isNewFewestMoves: boolean
  previousFewestMoves: number | null
  isNewBestScore: boolean
  previousBestScore: number | null
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
  },
  score:
    score === null
      ? null
      : {
          beatenBest: isNewBestScore ? previousBestScore : null,
          best: isNewBestScore
            ? score.total
            : (previousBestScore ?? score.total),
          isNewBest: isNewBestScore,
          timeBonus: score.timeBonus,
          total: score.total
        }
})
