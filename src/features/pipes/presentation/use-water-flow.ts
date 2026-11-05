import { useState } from 'react'

type Flow = {
  readonly depths: ReadonlyMap<number, number>
  readonly delays: ReadonlyMap<number, number>
}

const flowAfter = (
  previous: Flow,
  depths: ReadonlyMap<number, number>
): Flow => {
  const joined = [...depths].filter(([cell]) => !previous.depths.has(cell))
  const nearest = Math.min(...joined.map(([, depth]) => depth))
  return {
    delays: new Map(joined.map(([cell, depth]) => [cell, depth - nearest])),
    depths
  }
}

/**
 * When a turn joins a branch to the water, the branch fills outward from the
 * join: each newly wet tile waits as many steps as it lies past the nearest
 * one. Tiles already wet, and tiles running dry, change at once.
 */
export const useWaterFlow = (
  depths: ReadonlyMap<number, number>
): ReadonlyMap<number, number> => {
  const [flow, setFlow] = useState<Flow>(() => ({ delays: new Map(), depths }))
  if (flow.depths === depths) return flow.delays
  const next = flowAfter(flow, depths)
  setFlow(next)
  return next.delays
}
