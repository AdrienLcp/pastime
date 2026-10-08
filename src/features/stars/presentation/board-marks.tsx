import type React from 'react'

import type { StarsConflict } from '../engine/stars-conflicts'
import { columnOf, rowOf } from '../engine/stars-grid'
import type { StarsMark } from '../engine/stars-state'
import {
  CELL_UNITS,
  cellCentre,
  cellsOf,
  crossPathOf,
  starPointsOf
} from './stars-drawing'

/** How far inside its cell the hint's dashed box is drawn. */
const HINT_INSET = 4

/** How far a conflict ring stands off its star, on each side. */
const RING_INSET = 3

type Ring = {
  key: string
  x: number
  y: number
  width: number
  height: number
  transform?: string
}

/** A capsule round both stars when they touch, tilted along them; a ring round each otherwise. */
const conflictRings = ({
  conflict,
  size
}: {
  conflict: StarsConflict
  size: number
}): Ring[] => {
  const side = CELL_UNITS - 2 * RING_INSET
  const [first, second] = conflict.cells
  if (
    conflict.kind === 'touching' &&
    first !== undefined &&
    second !== undefined
  ) {
    const from = cellCentre({ cell: first, size })
    const to = cellCentre({ cell: second, size })
    const centre = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 }
    const tilt = (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI
    const width = Math.hypot(to.x - from.x, to.y - from.y) + side
    return [
      {
        height: side,
        key: `touching-${first}-${second}`,
        transform: `rotate(${tilt} ${centre.x} ${centre.y})`,
        width,
        x: centre.x - width / 2,
        y: centre.y - side / 2
      }
    ]
  }
  return conflict.cells.map((cell) => {
    const { x, y } = cellCentre({ cell, size })
    return {
      height: side,
      key: `${conflict.kind}-${cell}`,
      width: side,
      x: x - side / 2,
      y: y - side / 2
    }
  })
}

/**
 * Everything over the print: the player's stars and crosses, the crosses
 * auto-cross adds (lighter), the rings round broken rules, and the hint's
 * dashed boxes. A mark keyed by its cell and kind pops in when it appears.
 */
export const BoardMarks: React.FC<{
  marks: readonly StarsMark[]
  ruledOut: ReadonlySet<number>
  conflicts: readonly StarsConflict[]
  hinted: readonly number[]
  size: number
}> = ({ conflicts, hinted, marks, ruledOut, size }) => (
  <>
    <g className='hint-boxes'>
      {hinted.map((cell) => (
        <rect
          height={CELL_UNITS - 2 * HINT_INSET}
          key={`hint-${cell}`}
          rx='6'
          width={CELL_UNITS - 2 * HINT_INSET}
          x={columnOf({ cell, size }) * CELL_UNITS + HINT_INSET}
          y={rowOf({ cell, size }) * CELL_UNITS + HINT_INSET}
        />
      ))}
    </g>
    <g className='marks'>
      {cellsOf(size).map((cell) => {
        const mark = marks[cell]
        const centre = cellCentre({ cell, size })
        if (mark === 'star')
          return (
            <polygon
              className='mark star'
              key={`star-${cell}`}
              points={starPointsOf({ centre, radius: CELL_UNITS * 0.36 })}
            />
          )
        const isCrossed = mark === 'cross' || ruledOut.has(cell)
        if (!isCrossed) return null
        return (
          <path
            className='mark cross'
            d={crossPathOf({ centre, reach: CELL_UNITS * 0.15 })}
            data-auto={mark === 'cross' ? undefined : true}
            key={`cross-${cell}`}
          />
        )
      })}
    </g>
    <g className='conflicts'>
      {conflicts
        .flatMap((conflict) => conflictRings({ conflict, size }))
        .map(({ key, ...ring }) => (
          <rect className='ring' key={key} rx={ring.height / 2} {...ring} />
        ))}
    </g>
  </>
)
