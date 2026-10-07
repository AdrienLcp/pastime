import {
  EAST,
  NORTH,
  openSidesOf,
  type Side,
  SOUTH,
  WEST
} from '../engine/pipes-grid'

/** A tile's side, in board units. */
export const TILE_UNITS = 40

/** The frame's line, outside the tiles: half of it hangs past the grid. */
export const FRAME_MARGIN = 3

const MIDDLE = TILE_UNITS / 2

const ARMS = {
  [EAST]: `M${MIDDLE} ${MIDDLE}H${TILE_UNITS}`,
  [NORTH]: `M${MIDDLE} ${MIDDLE}V0`,
  [SOUTH]: `M${MIDDLE} ${MIDDLE}V${TILE_UNITS}`,
  [WEST]: `M${MIDDLE} ${MIDDLE}H0`
} as const satisfies Record<Side, string>

/** The pipe's path in one tile: an arm from the middle to every open side. */
export const pipePathOf = (tile: number): string =>
  openSidesOf(tile)
    .map((side) => ARMS[side])
    .join('')

export const isDeadEnd = (tile: number): boolean =>
  openSidesOf(tile).length === 1

/** The thin lines between tiles, as one path. */
export const tileLinesOf = (size: number): string => {
  const span = size * TILE_UNITS
  let lines = ''
  for (let line = 1; line < size; line++) {
    const at = line * TILE_UNITS
    lines += `M${at} 0V${span}M0 ${at}H${span}`
  }
  return lines
}
