import type { ColorDotsLevel } from '../engine/color-dots-level'

/** One grid step, in board units. */
export const GRID_UNITS = 40

/** Room between the outermost nodes and the frame. */
const PAPER_MARGIN = 6

/** Half the frame's stroke: the print starts inside it. */
export const FRAME_MARGIN = 3

export type BoardPoint = { readonly x: number; readonly y: number }

/** The printed area inside the frame, sized on the level's own nodes. */
export const printAreaOf = (
  level: ColorDotsLevel
): { readonly width: number; readonly height: number } => ({
  height:
    (Math.max(...level.nodes.map(({ y }) => y)) + 1) * GRID_UNITS +
    2 * PAPER_MARGIN,
  width:
    (Math.max(...level.nodes.map(({ x }) => x)) + 1) * GRID_UNITS +
    2 * PAPER_MARGIN
})

/** Where a node's centre is printed, in board units. */
export const pointOf = (node: { x: number; y: number }): BoardPoint => ({
  x: PAPER_MARGIN + (node.x + 0.5) * GRID_UNITS,
  y: PAPER_MARGIN + (node.y + 0.5) * GRID_UNITS
})
