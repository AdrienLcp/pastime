import type { LightsBoard } from '../engine/lights-engine'

const flip = (lit: boolean[], size: number, cell: number): void => {
  const row = Math.floor(cell / size)
  const column = cell % size
  const toggle = (index: number) => {
    lit[index] = !lit[index]
  }
  toggle(cell)
  if (row > 0) toggle(cell - size)
  if (row < size - 1) toggle(cell + size)
  if (column > 0) toggle(cell - 1)
  if (column < size - 1) toggle(cell + 1)
}

/**
 * Light chasing: once the first row's presses are chosen, every lamp still lit
 * in a row can only be put out by the press below it. Each of the 2^size first
 * rows is tried; the board is solvable when one leaves the last row dark.
 *
 * @returns The fewest presses that solve the board, in reading order; `null`
 * when no sequence does.
 */
export const solveLights = (board: LightsBoard): number[] | null => {
  const { size } = board
  let best: number[] | null = null

  for (let firstRow = 0; firstRow < 2 ** size; firstRow++) {
    const lit = [...board.lit]
    const presses: number[] = []
    for (let column = 0; column < size; column++) {
      if ((firstRow >> column) & 1) {
        presses.push(column)
        flip(lit, size, column)
      }
    }
    for (let cell = size; cell < size * size; cell++) {
      if (lit[cell - size]) {
        presses.push(cell)
        flip(lit, size, cell)
      }
    }
    const isSolved = lit.every((isLit) => !isLit)
    if (isSolved && (best === null || presses.length < best.length)) {
      best = presses
    }
  }

  return best
}
