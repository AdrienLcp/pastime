/**
 * A tile is the set of its open sides, one bit per side: the pipe leaves the
 * tile through every side whose bit is set.
 */
export const SIDES = [1, 2, 4, 8] as const

export type Side = (typeof SIDES)[number]

export const NORTH = 1
export const EAST = 2
export const SOUTH = 4
export const WEST = 8

/** A quarter turn clockwise: north opens east, east opens south… */
export const turnClockwise = (tile: number): number =>
  ((tile << 1) | (tile >> 3)) & 0b1111

export const turnBy = ({
  quarterTurns,
  tile
}: {
  tile: number
  quarterTurns: number
}): number => {
  let turned = tile
  for (let turn = 0; turn < ((quarterTurns % 4) + 4) % 4; turn++)
    turned = turnClockwise(turned)
  return turned
}

export const oppositeOf = (side: Side): Side =>
  side === NORTH ? SOUTH : side === EAST ? WEST : side === SOUTH ? NORTH : EAST

export const openSidesOf = (tile: number): Side[] =>
  SIDES.filter((side) => (tile & side) !== 0)

/** The tile across `side`, or `null` past the grid's edge. */
export const neighbourOf = ({
  cell,
  side,
  size
}: {
  cell: number
  side: Side
  size: number
}): number | null => {
  const row = Math.floor(cell / size)
  const column = cell % size
  switch (side) {
    case NORTH:
      return row === 0 ? null : cell - size
    case SOUTH:
      return row === size - 1 ? null : cell + size
    case EAST:
      return column === size - 1 ? null : cell + 1
    case WEST:
      return column === 0 ? null : cell - 1
    default:
      return side satisfies never
  }
}

/** The water's source: the middle tile of an odd grid. */
export const centreOf = (size: number): number =>
  Math.floor(size / 2) * size + Math.floor(size / 2)

/** Every distinct way a tile can face: two for a straight, four otherwise. */
export const orientationsOf = (tile: number): number[] => [
  ...new Set([0, 1, 2, 3].map((quarterTurns) => turnBy({ quarterTurns, tile })))
]
