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
 * Random flood fill: one region per seed, each growing a cell at a time from a
 * random point of the frontier, until the grid is covered.
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

  while (frontier.length > 0) {
    const index = random.below(frontier.length)
    const last = frontier.pop()
    if (last === undefined) break
    const picked = index < frontier.length ? frontier[index] : last
    if (picked === undefined) break
    if (index < frontier.length) frontier[index] = last
    if (regions[picked.cell] === UNCLAIMED) claim(picked.cell, picked.region)
  }

  return regions
}

/**
 * Merges regions two by two, each with one it borders, so that every merged
 * region holds two seeds — how a 2★ grid gets its regions.
 *
 * @returns The merged region of every cell; `null` when no pairing exists.
 */
export const pairRegions = ({
  random,
  regions,
  size
}: {
  random: SeededRandom
  regions: readonly number[]
  size: number
}): number[] | null => {
  const count = Math.max(...regions) + 1
  const borders = Array.from({ length: count }, () => new Set<number>())
  for (const [cell, region] of regions.entries())
    for (const neighbour of sideNeighboursOf({ cell, size })) {
      const other = regions[neighbour]
      if (other !== undefined && other !== region) borders[region]?.add(other)
    }

  const partner = Array<number>(count).fill(UNCLAIMED)
  const pairFrom = (region: number): boolean => {
    if (region === count) return true
    if (partner[region] !== UNCLAIMED) return pairFrom(region + 1)
    const candidates = [...(borders[region] ?? [])].filter(
      (other) => partner[other] === UNCLAIMED
    )
    for (const other of random.shuffled(candidates)) {
      partner[region] = other
      partner[other] = region
      if (pairFrom(region + 1)) return true
      partner[region] = UNCLAIMED
      partner[other] = UNCLAIMED
    }
    return false
  }
  if (!pairFrom(0)) return null

  const merged = Array<number>(count).fill(UNCLAIMED)
  let next = 0
  for (let region = 0; region < count; region++) {
    if (merged[region] !== UNCLAIMED) continue
    merged[region] = next
    merged[partner[region] ?? region] = next
    next++
  }
  return regions.map((region) => merged[region] ?? UNCLAIMED)
}
