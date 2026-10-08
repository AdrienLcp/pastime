import type { SeededRandom } from '@/helpers/seeded-random'

const UNCLAIMED = -1

/** The up to four cells sharing a side with `cell`: regions grow through sides only. */
export const sideNeighboursOf = ({
  cell,
  size
}: {
  cell: number
  size: number
}): number[] => {
  const row = Math.floor(cell / size)
  const column = cell % size
  return [
    row > 0 ? cell - size : null,
    row < size - 1 ? cell + size : null,
    column > 0 ? cell - 1 : null,
    column < size - 1 ? cell + 1 : null
  ].filter((neighbour): neighbour is number => neighbour !== null)
}

/**
 * How unevenly regions grow: each draws an appetite, a random number raised to
 * this power, and claims cells at that pace. Small regions next to large ones
 * give logic a foothold, so the reshaping that follows ends much sooner.
 */
const APPETITE_SKEW = 2

/** Draws a frontier entry again until its region's appetite accepts it, a few times at most. */
const APPETITE_DRAWS = 50

/**
 * Random flood fill: one region per seed, each growing a cell at a time from a
 * random point of the frontier, some regions hungrier than others, until the
 * grid is covered.
 *
 * @returns The region of every cell; a seed's region is its index in `seeds`.
 */
export const growRegions = ({
  random,
  seeds,
  size
}: {
  random: SeededRandom
  seeds: readonly number[]
  size: number
}): number[] => {
  const regions = Array<number>(size * size).fill(UNCLAIMED)
  const frontier: { cell: number; region: number }[] = []

  const claim = (cell: number, region: number) => {
    regions[cell] = region
    for (const neighbour of sideNeighboursOf({ cell, size }))
      if (regions[neighbour] === UNCLAIMED)
        frontier.push({ cell: neighbour, region })
  }

  for (const [region, seed] of seeds.entries()) regions[seed] = region
  for (const [region, seed] of seeds.entries()) claim(seed, region)
  const appetite = seeds.map(() => random.next() ** APPETITE_SKEW)
  const isHungry = (index: number) =>
    random.next() < (appetite[frontier[index]?.region ?? 0] ?? 1)

  while (frontier.length > 0) {
    let index = random.below(frontier.length)
    for (let draw = 1; draw < APPETITE_DRAWS && !isHungry(index); draw++)
      index = random.below(frontier.length)
    const last = frontier.pop()
    if (last === undefined) break
    const picked = index < frontier.length ? frontier[index] : last
    if (picked === undefined) break
    if (index < frontier.length) frontier[index] = last
    if (regions[picked.cell] === UNCLAIMED) claim(picked.cell, picked.region)
  }

  return regions
}
