import type { SeededRandom } from '@/helpers/seeded-random'

import {
  neighbourOf,
  openSidesOf,
  oppositeOf,
  SIDES,
  type Side
} from '../engine/pipes-grid'
import { MOST_OPEN_SIDES } from './spanning-tree'

type Pipe = { readonly from: number; readonly side: Side; readonly to: number }

const hasRoomFor = (tile: number) => openSidesOf(tile).length < MOST_OPEN_SIDES

/** The pipes from `start` to `end` along the tree. */
const pathBetween = ({
  end,
  size,
  start,
  tiles
}: {
  start: number
  end: number
  size: number
  tiles: readonly number[]
}): Pipe[] => {
  const cameBy = new Map<number, Pipe>()
  const queue = [start]
  const seen = new Set([start])
  for (let cell = queue.shift(); cell !== undefined; cell = queue.shift()) {
    if (cell === end) break
    for (const side of openSidesOf(tiles[cell] ?? 0)) {
      const to = neighbourOf({ cell, side, size })
      if (to === null || seen.has(to)) continue
      seen.add(to)
      cameBy.set(to, { from: cell, side, to })
      queue.push(to)
    }
  }
  const path: Pipe[] = []
  for (
    let pipe = cameBy.get(end);
    pipe !== undefined;
    pipe = cameBy.get(pipe.from)
  )
    path.push(pipe)
  return path
}

/**
 * Where logic stalled, the tree is changed: a new pipe is laid from a stalled
 * tile, and one pipe on the loop it closes is taken out, near the stall when
 * possible. The result is a spanning tree again, and the ambiguity has moved
 * or gone — Simon Tatham's Net does the same.
 */
export const reshapeTree = ({
  random,
  size,
  stalled,
  tiles
}: {
  random: SeededRandom
  size: number
  tiles: readonly number[]
  stalled: readonly number[]
}): number[] | null => {
  const isStalled = new Set(stalled)
  for (const cell of random.shuffled(stalled)) {
    const tile = tiles[cell] ?? 0
    if (!hasRoomFor(tile)) continue
    const laid = random.shuffled(SIDES).find((side) => {
      const to = neighbourOf({ cell, side, size })
      return to !== null && (tile & side) === 0 && hasRoomFor(tiles[to] ?? 0)
    })
    if (laid === undefined) continue
    const to = neighbourOf({ cell, side: laid, size })
    if (to === null) continue
    const loop = pathBetween({ end: cell, size, start: to, tiles })
    const nearStall = loop.filter(
      (pipe) => isStalled.has(pipe.from) || isStalled.has(pipe.to)
    )
    const [first, ...rest] = nearStall.length > 0 ? nearStall : loop
    if (first === undefined) continue
    const removed = random.pick([first, ...rest])
    const reshaped = [...tiles]
    reshaped[cell] = (reshaped[cell] ?? 0) | laid
    reshaped[to] = (reshaped[to] ?? 0) | oppositeOf(laid)
    reshaped[removed.from] = (reshaped[removed.from] ?? 0) & ~removed.side
    reshaped[removed.to] =
      (reshaped[removed.to] ?? 0) & ~oppositeOf(removed.side)
    return reshaped
  }
  return null
}
