import type { StarsMove } from '../engine/stars-state'

/** A second tap on the same cell this soon after the first makes a double tap. */
export const DOUBLE_TAP_MS = 300

/**
 * A tap that may still turn into a double tap: shown at once as the cross it
 * would write, played only once the window closes or another cell is tapped.
 */
export type PendingTap = {
  readonly cell: number
  readonly at: number
}

/** What a tap does: the moves to play now, and the tap left waiting. */
export type TapOutcome = {
  readonly moves: readonly StarsMove[]
  readonly pending: PendingTap | null
}

/** The move a waiting tap stands for: cross the cell, or rub its mark out. */
export const pendingMoveOf = (pending: PendingTap): StarsMove => ({
  cell: pending.cell,
  kind: 'cross'
})

/** The waiting tap played as a single tap, when its window closes or anything else starts. */
export const settledTap = (pending: PendingTap | null): readonly StarsMove[] =>
  pending === null ? [] : [pendingMoveOf(pending)]

/**
 * A tap on a cell at a time in milliseconds. A second tap on the waiting cell
 * within `DOUBLE_TAP_MS` is a double tap: one star move, and the first tap is
 * dropped, so no cross is ever played and undo sees a single move. Any other
 * tap settles the waiting one and waits in its turn.
 */
export const tapCell = ({
  at,
  cell,
  pending
}: {
  at: number
  cell: number
  pending: PendingTap | null
}): TapOutcome => {
  const isDoubleTap =
    pending !== null &&
    pending.cell === cell &&
    at - pending.at <= DOUBLE_TAP_MS
  if (isDoubleTap) return { moves: [{ cell, kind: 'star' }], pending: null }
  return { moves: settledTap(pending), pending: { at, cell } }
}
