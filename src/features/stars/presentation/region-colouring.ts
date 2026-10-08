import type { StarsPuzzle } from '../engine/stars-level'
import { sideNeighboursOf } from '../generator/region-growth'
import { inkDistance, REGION_INKS } from './region-inks'

/** For each region, the regions it shares a side with. */
export const bordersOf = ({ regions, size }: StarsPuzzle): Set<number>[] => {
  const borders = Array.from({ length: size }, () => new Set<number>())
  for (const [cell, region] of regions.entries())
    for (const neighbour of sideNeighboursOf({ cell, size })) {
      const other = regions[neighbour]
      if (other !== undefined && other !== region) borders[region]?.add(other)
    }
  return borders
}

const INK_DISTANCES = REGION_INKS.map((first) =>
  REGION_INKS.map((second) => inkDistance(first, second))
)

const inkIndices = REGION_INKS.map((_, ink) => ink)

const distanceBetween = (first: number, second: number) =>
  INK_DISTANCES[first]?.[second] ?? 0

/**
 * Gives every region an ink, no two bordering regions the same: each region,
 * the most constrained first, takes an ink no other region holds when one is
 * left, the one that looks furthest from its painted neighbours. Backtracks
 * when a region has none left, so a map is always coloured — four inks are
 * enough for any map, and there are twelve.
 */
export const regionInksOf = (puzzle: StarsPuzzle): number[] => {
  const borders = bordersOf(puzzle)
  const inks: (number | undefined)[] = borders.map(() => undefined)

  const neighbourInksOf = (region: number) =>
    [...(borders[region] ?? [])].flatMap((neighbour) => {
      const ink = inks[neighbour]
      return ink === undefined ? [] : [ink]
    })

  const nextRegion = (): number | undefined => {
    let chosen: number | undefined
    let chosenWeight = -1
    for (const [region, neighbours] of borders.entries()) {
      if (inks[region] !== undefined) continue
      const weight =
        new Set(neighbourInksOf(region)).size * borders.length + neighbours.size
      if (weight > chosenWeight) {
        chosen = region
        chosenWeight = weight
      }
    }
    return chosen
  }

  const candidatesOf = (region: number): number[] => {
    const nearby = neighbourInksOf(region)
    const used = new Set(inks)
    const furthest = (ink: number) =>
      Math.min(...nearby.map((other) => distanceBetween(ink, other)))
    return inkIndices
      .filter((ink) => !nearby.includes(ink))
      .toSorted(
        (first, second) =>
          Number(used.has(first)) - Number(used.has(second)) ||
          furthest(second) - furthest(first) ||
          first - second
      )
  }

  const paint = (): boolean => {
    const region = nextRegion()
    if (region === undefined) return true
    for (const ink of candidatesOf(region)) {
      inks[region] = ink
      if (paint()) return true
    }
    inks[region] = undefined
    return false
  }

  paint()
  return inks.map((ink) => ink ?? 0)
}
