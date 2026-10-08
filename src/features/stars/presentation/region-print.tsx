import type React from 'react'
import { useMemo } from 'react'

import { columnOf, rowOf } from '../engine/stars-grid'
import type { StarsPuzzle } from '../engine/stars-level'
import { regionInksOf } from './region-colouring'
import { REGION_INKS, regionInkCss } from './region-inks'
import { CELL_UNITS, cellsOf, gridLinesOf } from './stars-drawing'

const INK_FILLS = REGION_INKS.map(regionInkCss)

/**
 * The printed page under the player's marks: each region in its own flat ink,
 * no two bordering regions alike, thin lines within a region, heavy ones
 * between two, and the outer frame.
 */
export const RegionPrint: React.FC<{ puzzle: StarsPuzzle }> = ({ puzzle }) => {
  const inks = useMemo(() => regionInksOf(puzzle), [puzzle])
  const lines = useMemo(() => gridLinesOf(puzzle), [puzzle])
  const { regions, size } = puzzle
  const span = size * CELL_UNITS

  return (
    <>
      <g className='regions'>
        {cellsOf(size).map((cell) => {
          const ink = inks[regions[cell] ?? 0] ?? 0
          return (
            <rect
              data-ink={REGION_INKS[ink]?.name}
              height={CELL_UNITS}
              key={cell}
              style={{ fill: INK_FILLS[ink] }}
              width={CELL_UNITS}
              x={columnOf({ cell, size }) * CELL_UNITS}
              y={rowOf({ cell, size }) * CELL_UNITS}
            />
          )
        })}
      </g>
      <path className='cell-lines' d={lines.thin} />
      <path className='region-lines' d={lines.heavy} />
      <rect className='frame' height={span} width={span} x='0' y='0' />
    </>
  )
}
