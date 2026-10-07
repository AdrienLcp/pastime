import { useRef } from 'react'

type Flow = {
  readonly depths: ReadonlyMap<number, number>
  readonly delays: ReadonlyMap<number, number>
}

/**
 * When a turn joins a branch to the water, the branch fills outward from the
 * join: each newly wet tile waits as many steps as it lies past the nearest
 * one. Tiles already wet, and tiles running dry, change at once.
 */
export const useWaterFlow = (
  depths: ReadonlyMap<number, number>
): ReadonlyMap<number, number> => {
  const flow = useRef<Flow | null>(null)
  const previous = flow.current
  if (previous === null) {
    flow.current = { delays: new Map(), depths }
  } else if (previous.depths !== depths) {
    const joined = [...depths].filter(([cell]) => !previous.depths.has(cell))
    const nearest = Math.min(...joined.map(([, depth]) => depth))
    flow.current = {
      delays: new Map(joined.map(([cell, depth]) => [cell, depth - nearest])),
      depths
    }
  }
  return flow.current?.delays ?? new Map()
}
