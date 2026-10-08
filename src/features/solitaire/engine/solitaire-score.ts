import { columnOf, isEveryCardRevealed } from './solitaire-rules'
import type { CardMove, SolitaireMove, SolitaireState } from './solitaire-state'

const POINTS = {
  foundationToTableau: -15,
  toFoundation: 10,
  turnedOver: 5,
  wasteToTableau: 5
} as const

/** Drawing one card, every pass after the first costs; drawing three, every pass after the third. */
const RECYCLE_COST = {
  1: { freePasses: 0, points: -100 },
  3: { freePasses: 2, points: -20 }
} as const

const SHORTEST_BONUS_GAME_SECONDS = 30
const TIME_BONUS_NUMERATOR = 700_000

const turnedOverPoints = (
  before: SolitaireState,
  move: CardMove,
  after: SolitaireState
): number => {
  if (move.from.kind !== 'tableau') return 0
  const { column } = move.from
  return columnOf(after, column).hidden < columnOf(before, column).hidden
    ? POINTS.turnedOver
    : 0
}

const placedPoints = (move: CardMove): number => {
  if (move.to.kind === 'foundation') return POINTS.toFoundation
  if (move.from.kind === 'waste') return POINTS.wasteToTableau
  if (move.from.kind === 'foundation') return POINTS.foundationToTableau
  return 0
}

const recyclePoints = (
  before: SolitaireState,
  passesBefore: number
): number => {
  if (isEveryCardRevealed(before)) return 0
  const cost = RECYCLE_COST[before.level.draw]
  return passesBefore >= cost.freePasses ? cost.points : 0
}

/**
 * Windows' standard scoring, read off the play so far: an undo takes its
 * points back with it. The score never drops below zero. A recycle once every
 * tableau card is face up costs nothing: the game is decided, and the
 * auto-finish may need one.
 */
export const solitaireScoreOf = ({
  boards,
  moves
}: {
  boards: readonly SolitaireState[]
  moves: readonly SolitaireMove[]
}): number => {
  let score = 0
  let recycles = 0
  for (const [index, move] of moves.entries()) {
    const before = boards[index]
    const after = boards[index + 1]
    if (before === undefined || after === undefined) break
    const points =
      move.kind === 'draw'
        ? 0
        : move.kind === 'recycle'
          ? recyclePoints(before, recycles)
          : placedPoints(move) + turnedOverPoints(before, move, after)
    if (move.kind === 'recycle') recycles += 1
    score = Math.max(0, score + points)
  }
  return score
}

/** Windows' bonus for a won game: 700 000 over its seconds, none under 30 s. */
export const solitaireTimeBonusOf = (elapsedMs: number): number => {
  const seconds = Math.floor(elapsedMs / 1000)
  return seconds < SHORTEST_BONUS_GAME_SECONDS
    ? 0
    : Math.floor(TIME_BONUS_NUMERATOR / seconds)
}
