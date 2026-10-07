import {
  neighbourOf,
  orientationsOf,
  SIDES,
  type Side
} from '../engine/pipes-grid'

const UNKNOWN = 0
const OPEN = 1
const CLOSED = 2

/** What the solver is handed: the tiles, in any orientation. */
export type PipesPuzzle = {
  readonly size: number
  readonly tiles: readonly number[]
}

export type PipesSolution = {
  /** Every tile solved, by logic alone: the puzzle has this one solution. */
  readonly isSolved: boolean
  /** The way each tile must face, or `null` where logic stalled. */
  readonly tiles: readonly (number | null)[]
  /** The tiles in the order logic settled them, the given ones left out. */
  readonly order: readonly number[]
}

const sideIndexOf = (side: Side) => SIDES.indexOf(side)

/** A union-find over the tiles, for the pipes already known to be open. */
const createNetworks = (count: number) => {
  const parent = Array.from({ length: count }, (_, cell) => cell)
  const find = (cell: number): number => {
    let root = cell
    while ((parent[root] ?? root) !== root) root = parent[root] ?? root
    let walker = cell
    while (walker !== root) {
      const next = parent[walker] ?? root
      parent[walker] = root
      walker = next
    }
    return root
  }
  const join = (first: number, second: number) => {
    parent[find(first)] = find(second)
  }
  return { find, join }
}

/**
 * Settles tiles by logic alone, the way a player does, never by trying one
 * and backing out:
 *
 * - a pipe meets an open side and a wall or closed side meets a closed one;
 * - two tiles already joined by pipes cannot be joined again — a loop;
 * - a network cannot be closed off while tiles remain outside it.
 *
 * `given` fixes tiles the player locked, for a hint from where they stand.
 */
export const solvePipes = (
  { size, tiles }: PipesPuzzle,
  given: ReadonlyMap<number, number> = new Map()
): PipesSolution => {
  const count = size * size
  const sides = new Uint8Array(count * 4)
  const candidates = tiles.map((tile, cell) => {
    const fixed = given.get(cell)
    return fixed === undefined ? orientationsOf(tile) : [fixed]
  })
  const order: number[] = []

  const sideAt = (cell: number, side: Side) =>
    sides[cell * 4 + sideIndexOf(side)] ?? UNKNOWN

  const settleSide = (cell: number, side: Side, state: number) => {
    const neighbour = neighbourOf({ cell, side, size })
    sides[cell * 4 + sideIndexOf(side)] = state
    if (neighbour !== null)
      sides[neighbour * 4 + ((sideIndexOf(side) + 2) % 4)] = state
  }

  for (let cell = 0; cell < count; cell++)
    for (const side of SIDES)
      if (neighbourOf({ cell, side, size }) === null)
        settleSide(cell, side, CLOSED)

  const narrow = (cell: number, kept: number[]) => {
    candidates[cell] = kept
    if (kept.length === 1 && !given.has(cell)) order.push(cell)
  }

  /** Keeps the orientations that fit the known sides, then settles the sides they agree on. */
  const fitSides = (): boolean | 'contradiction' => {
    let changed = false
    for (let cell = 0; cell < count; cell++) {
      const current = candidates[cell] ?? []
      const kept = current.filter((tile) =>
        SIDES.every((side) => {
          const state = sideAt(cell, side)
          if (state === OPEN) return (tile & side) !== 0
          if (state === CLOSED) return (tile & side) === 0
          return true
        })
      )
      if (kept.length === 0) return 'contradiction'
      if (kept.length < current.length) {
        narrow(cell, kept)
        changed = true
      }
      for (const side of SIDES) {
        if (sideAt(cell, side) !== UNKNOWN) continue
        if (kept.every((tile) => (tile & side) !== 0)) {
          settleSide(cell, side, OPEN)
          changed = true
        } else if (kept.every((tile) => (tile & side) === 0)) {
          settleSide(cell, side, CLOSED)
          changed = true
        }
      }
    }
    return changed
  }

  /** Rules out loops and networks closed off too soon. */
  const keepNetworksOpen = (): boolean => {
    const networks = createNetworks(count)
    for (let cell = 0; cell < count; cell++)
      for (const side of SIDES) {
        const neighbour = neighbourOf({ cell, side, size })
        if (neighbour !== null && sideAt(cell, side) === OPEN)
          networks.join(cell, neighbour)
      }

    let changed = false
    const tilesIn = new Map<number, number>()
    const exitsOf = new Map<number, number>()
    for (let cell = 0; cell < count; cell++) {
      const root = networks.find(cell)
      tilesIn.set(root, (tilesIn.get(root) ?? 0) + 1)
      for (const side of SIDES) {
        if (sideAt(cell, side) !== UNKNOWN) continue
        const neighbour = neighbourOf({ cell, side, size })
        if (neighbour === null) continue
        if (networks.find(neighbour) === root) {
          settleSide(cell, side, CLOSED)
          changed = true
        } else exitsOf.set(root, (exitsOf.get(root) ?? 0) + 1)
      }
    }
    if (changed) return true

    /**
     * What turning `cell` to `tile` would leave: its network merged with the
     * ones its pipes reach. Unknown sides between two of those networks still
     * count as ways out, so a network is only ever ruled closed when it is.
     */
    const closesOff = (cell: number, tile: number) => {
      const merged = new Set([networks.find(cell)])
      const walled: number[] = []
      let spent = 0
      for (const side of SIDES) {
        if (sideAt(cell, side) !== UNKNOWN) continue
        const neighbour = neighbourOf({ cell, side, size })
        if (neighbour === null) continue
        const root = networks.find(neighbour)
        if ((tile & side) === 0) {
          walled.push(root)
          spent += 1
        } else if (merged.has(root)) return true
        else {
          merged.add(root)
          spent += 2
        }
      }
      for (const root of walled) if (merged.has(root)) spent += 1
      let exits = -spent
      let reached = 0
      for (const root of merged) {
        exits += exitsOf.get(root) ?? 0
        reached += tilesIn.get(root) ?? 0
      }
      return exits === 0 && reached < count
    }

    for (let cell = 0; cell < count; cell++) {
      const current = candidates[cell] ?? []
      if (current.length < 2) continue
      const kept = current.filter((tile) => !closesOff(cell, tile))
      if (kept.length < current.length && kept.length > 0) {
        narrow(cell, kept)
        changed = true
      }
    }
    return changed
  }

  for (;;) {
    const fitted = fitSides()
    if (fitted === 'contradiction') break
    if (fitted) continue
    if (!keepNetworksOpen()) break
  }

  const solved = candidates.map((kept) =>
    kept.length === 1 ? (kept[0] ?? null) : null
  )
  return {
    isSolved: solved.every((tile) => tile !== null),
    order,
    tiles: solved
  }
}
