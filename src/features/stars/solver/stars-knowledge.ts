/** What is known of each cell: still open, a star, or certainly no star. */
export const CELL_OPEN = 0
export const CELL_STAR = 1
export const CELL_NO_STAR = 2

export type CellKnowledge =
  | typeof CELL_OPEN
  | typeof CELL_STAR
  | typeof CELL_NO_STAR

/** One `CellKnowledge` per cell, in reading order; the solver writes into it. */
export type Knowledge = Uint8Array

export const isDecided = (knowledge: Knowledge): boolean =>
  knowledge.every((cell) => cell !== CELL_OPEN)
