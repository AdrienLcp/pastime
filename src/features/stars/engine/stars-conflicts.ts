import { areTouching, gridOf, type StarsUnitKind } from './stars-grid'
import type { StarsState } from './stars-state'

/** Two stars that break a rule: they touch, or crowd one row, column or region. */
export type StarsConflict = {
  readonly kind: 'touching' | StarsUnitKind
  readonly cells: readonly number[]
}

const starCellsOf = (state: StarsState) =>
  state.marks.flatMap((mark, cell) => (mark === 'star' ? [cell] : []))

/** Every rule the player's stars break right now, touching pairs first. */
export const conflictsOf = (state: StarsState): StarsConflict[] => {
  const grid = gridOf(state.level)
  const stars = starCellsOf(state)
  const touching = stars.flatMap((first, index) =>
    stars
      .slice(index + 1)
      .filter((second) => areTouching({ first, second, size: grid.size }))
      .map((second) => ({ cells: [first, second], kind: 'touching' as const }))
  )
  const crowded = grid.units.flatMap((unit) => {
    const inUnit = unit.cells.filter((cell) => state.marks[cell] === 'star')
    return inUnit.length > 1 ? [{ cells: inUnit, kind: unit.kind }] : []
  })
  return [...touching, ...crowded]
}

/**
 * The blank cells the player's stars already rule out: their neighbours, and
 * the rest of every unit holding all its stars. Auto-cross draws them.
 */
export const ruledOutCellsOf = (state: StarsState): Set<number> => {
  const grid = gridOf(state.level)
  const ruledOut = new Set<number>()
  for (const star of starCellsOf(state))
    for (const neighbour of grid.neighbours[star] ?? []) ruledOut.add(neighbour)
  for (const unit of grid.units) {
    if (unit.cells.some((cell) => state.marks[cell] === 'star'))
      for (const cell of unit.cells) ruledOut.add(cell)
  }
  for (const cell of ruledOut)
    if (state.marks[cell] !== 'blank') ruledOut.delete(cell)
  return ruledOut
}

/** Solved: every unit holds its star, and no two touch. */
export const isStarsSolved = (state: StarsState): boolean => {
  const grid = gridOf(state.level)
  const isFull = grid.units.every(
    (unit) =>
      unit.cells.filter((cell) => state.marks[cell] === 'star').length === 1
  )
  return isFull && conflictsOf(state).length === 0
}
