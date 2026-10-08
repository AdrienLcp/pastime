import type { SeededRandom } from '@/helpers/seeded-random'

import type { StarsPuzzle } from '../engine/stars-level'
import { CELL_OPEN } from '../solver/stars-knowledge'
import { solveStars } from '../solver/stars-solver'
import { type StarsTechnique, techniqueRank } from '../solver/stars-technique'
import { sideNeighboursOf } from './region-growth'
import { findRivalSolution } from './rival-solution'

/**
 * How good a grid is to the generator: the cells logic decides first, then,
 * once it decides them all, how hard the hardest step was.
 */
const scoreOf = (puzzle: StarsPuzzle) => {
  const solution = solveStars(puzzle)
  let decided = 0
  for (const cell of solution.knowledge) if (cell !== CELL_OPEN) decided++
  const isSolved = decided === solution.knowledge.length
  const rank = solution.hardest === null ? 0 : techniqueRank(solution.hardest)
  return {
    hardest: solution.hardest,
    isSolved,
    knowledge: solution.knowledge,
    value: decided + (isSolved ? rank : 0)
  }
}

/**
 * How often a reshape starts from a cell logic left open: where the grid is
 * still ambiguous is where a change helps most.
 */
const OPEN_CELL_BIAS = 0.7

/**
 * How often a reshape moves a star of a rival solution instead: handed to a
 * bordering region, that cell leaves the rival with two stars in one region,
 * so the rival is gone. Large grids end up nearly solved with a few rivals
 * left, which random reshapes take long to find.
 */
const RIVAL_BIAS = 0.3

/**
 * How many decided cells a rival-breaking reshape may cost and still be kept:
 * logic loses a little ground for a while, but the rival is gone for good.
 */
const RIVAL_TOLERANCE = 20

const staysConnected = ({
  cell,
  regions,
  size
}: {
  cell: number
  regions: readonly number[]
  size: number
}): boolean => {
  const region = regions[cell]
  const rest = regions.flatMap((other, index) =>
    other === region && index !== cell ? [index] : []
  )
  const first = rest[0]
  if (first === undefined) return false
  const reached = new Set([first])
  const queue = [first]
  for (let next = queue.pop(); next !== undefined; next = queue.pop())
    for (const neighbour of sideNeighboursOf({ cell: next, size }))
      if (
        neighbour !== cell &&
        regions[neighbour] === region &&
        !reached.has(neighbour)
      ) {
        reached.add(neighbour)
        queue.push(neighbour)
      }
  return reached.size === rest.length
}

/** A random cell handed to a bordering region, or `null` when that cell cannot move. */
const nudge = ({
  open,
  random,
  regions,
  size,
  stars
}: {
  open: readonly number[]
  random: SeededRandom
  regions: readonly number[]
  size: number
  stars: ReadonlySet<number>
}): number[] | null => {
  const [firstOpen, ...otherOpen] = open
  const cell =
    firstOpen !== undefined && random.next() < OPEN_CELL_BIAS
      ? random.pick([firstOpen, ...otherOpen])
      : random.below(regions.length)
  return moveCell({ cell, random, regions, size, stars })
}

/** `cell` handed to a bordering region, or `null` when it cannot move. */
const moveCell = ({
  cell,
  random,
  regions,
  size,
  stars
}: {
  cell: number
  random: SeededRandom
  regions: readonly number[]
  size: number
  stars: ReadonlySet<number>
}): number[] | null => {
  if (stars.has(cell)) return null
  const region = regions[cell]
  const bordering = [
    ...new Set(
      sideNeighboursOf({ cell, size })
        .map((neighbour) => regions[neighbour])
        .filter(
          (other): other is number => other !== undefined && other !== region
        )
    )
  ]
  if (bordering.length === 0) return null
  if (!staysConnected({ cell, regions, size })) return null
  const [first, ...others] = bordering
  if (first === undefined) return null
  return regions.with(cell, random.pick([first, ...others]))
}

/**
 * Reshapes the regions a cell at a time, keeping each change that lets logic
 * decide at least as much — or that breaks a rival solution at a small cost —
 * until logic alone solves the grid at the wanted difficulty or the budget
 * runs out. Stars never move, so the solution stays.
 *
 * @returns The regions and the hardest technique they ask for; `null` when the
 * budget ran out first.
 */
export const reshapeRegions = ({
  budget,
  hardestAtLeast,
  puzzle,
  random,
  stars
}: {
  budget: number
  hardestAtLeast: StarsTechnique
  puzzle: StarsPuzzle
  random: SeededRandom
  stars: ReadonlySet<number>
}): { regions: number[]; hardest: StarsTechnique } | null => {
  let regions = [...puzzle.regions]
  let score = scoreOf(puzzle)
  const isWanted = (candidate: ReturnType<typeof scoreOf>) =>
    candidate.isSolved &&
    candidate.hardest !== null &&
    techniqueRank(candidate.hardest) >= techniqueRank(hardestAtLeast)

  let open: number[] | null = null
  let rivalStars: number[] | null = null

  for (let attempt = 0; attempt < budget; attempt++) {
    if (isWanted(score) && score.hardest !== null)
      return { hardest: score.hardest, regions }
    const { knowledge } = score
    open ??= [...knowledge.keys()].filter(
      (cell) => knowledge[cell] === CELL_OPEN
    )
    rivalStars ??= (
      findRivalSolution({
        knowledge,
        puzzle: { ...puzzle, regions },
        random,
        stars
      }) ?? []
    ).filter((cell) => !stars.has(cell))
    const [firstRival, ...otherRivals] = rivalStars
    const breaksRival = firstRival !== undefined && random.next() < RIVAL_BIAS
    const nudged = breaksRival
      ? moveCell({
          cell: random.pick([firstRival, ...otherRivals]),
          random,
          regions,
          size: puzzle.size,
          stars
        })
      : nudge({ open, random, regions, size: puzzle.size, stars })
    if (nudged === null) continue
    const nudgedScore = scoreOf({ ...puzzle, regions: nudged })
    const tolerance = breaksRival ? RIVAL_TOLERANCE : 0
    if (nudgedScore.value < score.value - tolerance) continue
    regions = nudged
    score = nudgedScore
    open = null
    rivalStars = null
  }
  return isWanted(score) && score.hardest !== null
    ? { hardest: score.hardest, regions }
    : null
}
