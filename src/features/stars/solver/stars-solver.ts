import { gridOf, type StarsGrid } from '../engine/stars-grid'
import type { StarsPuzzle } from '../engine/stars-level'
import {
  CELL_NO_STAR,
  CELL_STAR,
  isDecided,
  type Knowledge
} from './stars-knowledge'
import type { StarsStep } from './stars-step'
import { harderTechnique, type StarsTechnique } from './stars-technique'
import { TECHNIQUE_RULES, viewOf } from './stars-techniques'

export type StarsSolution = {
  /** What logic alone decides, from the start it was given. */
  readonly knowledge: Knowledge
  /** Every deduction, in the order made: the hint reads them. */
  readonly steps: readonly StarsStep[]
  /** Every cell decided: the puzzle has this one solution and needs no guess. */
  readonly isSolved: boolean
  /** The hardest technique a step needed; `null` when none was taken. */
  readonly hardest: StarsTechnique | null
}

const takeStep = (knowledge: Knowledge, step: StarsStep) => {
  const mark = step.verdict === 'star' ? CELL_STAR : CELL_NO_STAR
  for (const cell of step.cells) knowledge[cell] = mark
}

const easiestSteps = ({
  grid,
  knowledge
}: {
  grid: StarsGrid
  knowledge: Knowledge
}): readonly StarsStep[] => {
  const view = viewOf({ grid, knowledge })
  for (const rule of TECHNIQUE_RULES) {
    const steps = rule(view)
    if (steps.length > 0) return steps
  }
  return []
}

/**
 * Solves by logic alone, always taking the easiest steps there are, until the
 * grid is full or no technique sees a way forward. Every technique is sound,
 * so a full grid is the puzzle's only solution.
 */
export const solveStars = (
  puzzle: StarsPuzzle,
  start?: Knowledge
): StarsSolution => {
  const grid = gridOf(puzzle)
  const knowledge =
    start === undefined
      ? new Uint8Array(grid.size * grid.size)
      : Uint8Array.from(start)
  const steps: StarsStep[] = []
  let hardest: StarsTechnique | null = null

  for (
    let found = easiestSteps({ grid, knowledge });
    found.length > 0;
    found = easiestSteps({ grid, knowledge })
  )
    for (const step of found) {
      takeStep(knowledge, step)
      steps.push(step)
      hardest =
        hardest === null
          ? step.technique
          : harderTechnique({ current: hardest, next: step.technique })
    }

  return { hardest, isSolved: isDecided(knowledge), knowledge, steps }
}
