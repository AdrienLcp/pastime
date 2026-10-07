import {
  CELL_NO_STAR,
  CELL_OPEN,
  CELL_STAR,
  type Knowledge
} from '../solver/stars-knowledge'
import { solveStars } from '../solver/stars-solver'
import type { StarsStep } from '../solver/stars-step'
import { BASIC_TECHNIQUES } from '../solver/stars-technique'
import type { StarsLevel } from './stars-level'
import type { StarsMark, StarsState } from './stars-state'

/**
 * What the hint shows: a mark that contradicts the solution, or the next step
 * logic takes from the player's marks.
 */
export type StarsHint =
  | { readonly kind: 'wrong-star'; readonly cell: number }
  | { readonly kind: 'wrong-cross'; readonly cell: number }
  | { readonly kind: 'step'; readonly step: StarsStep }

const solutions = new WeakMap<StarsLevel, Knowledge>()

const solutionOf = (level: StarsLevel): Knowledge => {
  const known = solutions.get(level)
  if (known !== undefined) return known
  const { knowledge } = solveStars(level)
  solutions.set(level, knowledge)
  return knowledge
}

const KNOWLEDGE_OF_MARK = {
  blank: CELL_OPEN,
  cross: CELL_NO_STAR,
  star: CELL_STAR
} as const satisfies Record<StarsMark, number>

const isBasic = (step: StarsStep) => BASIC_TECHNIQUES.includes(step.technique)

/**
 * A wrong mark comes first: nothing true follows from it. Then the first step
 * logic takes past what the stars already rule out — auto-cross draws those,
 * and a hint is for the deduction the player is looking for.
 */
export const starsHintOf = (state: StarsState): StarsHint | null => {
  const solution = solutionOf(state.level)
  const wrongStar = state.marks.findIndex(
    (mark, cell) => mark === 'star' && solution[cell] !== CELL_STAR
  )
  if (wrongStar !== -1) return { cell: wrongStar, kind: 'wrong-star' }
  const wrongCross = state.marks.findIndex(
    (mark, cell) => mark === 'cross' && solution[cell] === CELL_STAR
  )
  if (wrongCross !== -1) return { cell: wrongCross, kind: 'wrong-cross' }

  const start = Uint8Array.from(state.marks, (mark) => KNOWLEDGE_OF_MARK[mark])
  const step = solveStars(state.level, start).steps.find(
    (candidate) => !isBasic(candidate)
  )
  return step === undefined ? null : { kind: 'step', step }
}
