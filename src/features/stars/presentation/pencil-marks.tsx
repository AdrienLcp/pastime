import type React from 'react'

import type { StarsConflict } from '../engine/stars-conflicts'
import { columnOf, rowOf } from '../engine/stars-grid'
import type { StarsMark } from '../engine/stars-state'
import { pencilCross, pencilLoop, pencilStar } from './pencil-strokes'
import { pencilFilterOf } from './region-print'
import { CELL_UNITS, cellCentre, cellsOf } from './stars-drawing'

/** How far inside its cell the hint's dashed box is drawn. */
const HINT_INSET = 4

type Loop = { d: string; key: string; transform?: string }

/** A loop round both stars when they touch, tilted along them; one round each otherwise. */
const conflictLoops = ({
  conflict,
  index,
  size
}: {
  conflict: StarsConflict
  index: number
  size: number
}): Loop[] => {
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
    return [
      {
        d: pencilLoop({
          centre,
          height: CELL_UNITS * 1.1,
          seed: index,
          width: Math.hypot(to.x - from.x, to.y - from.y) + CELL_UNITS * 1.15
        }),
        key: `touching-${first}-${second}`,
        transform: `rotate(${tilt} ${centre.x} ${centre.y})`
      }
    ]
  }
  return conflict.cells.map((cell) => ({
    d: pencilLoop({
      centre: cellCentre({ cell, size }),
      height: CELL_UNITS * 0.95,
      seed: cell,
      width: CELL_UNITS
    }),
    key: `${conflict.kind}-${cell}`
  }))
}

/**
 * Everything written in pencil: the player's stars and crosses, the crosses
 * auto-cross adds (lighter), the loops round broken rules, and the hint's
 * dashed boxes. A mark keyed by its cell and kind draws itself in when it
 * appears.
 */
export const PencilMarks: React.FC<{
  idPrefix: string
  marks: readonly StarsMark[]
  ruledOut: ReadonlySet<number>
  conflicts: readonly StarsConflict[]
  hinted: readonly number[]
  size: number
}> = ({ conflicts, hinted, idPrefix, marks, ruledOut, size }) => (
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
    <g className='marks' filter={`url(#${pencilFilterOf(idPrefix)})`}>
      {cellsOf(size).map((cell) => {
        const mark = marks[cell]
        const centre = cellCentre({ cell, size })
        if (mark === 'star')
          return (
            <path
              className='mark star'
              d={pencilStar({ cell, centre, radius: CELL_UNITS * 0.34 })}
              key={`star-${cell}`}
              pathLength={1}
            />
          )
        const isCrossed = mark === 'cross' || ruledOut.has(cell)
        if (!isCrossed) return null
        return (
          <path
            className='mark cross'
            d={pencilCross({ cell, centre, reach: CELL_UNITS * 0.17 })}
            data-auto={mark === 'cross' ? undefined : true}
            key={`cross-${cell}`}
            pathLength={1}
          />
        )
      })}
    </g>
    <g className='conflicts' filter={`url(#${pencilFilterOf(idPrefix)})`}>
      {conflicts
        .flatMap((conflict, index) => conflictLoops({ conflict, index, size }))
        .map(({ d, key, transform }) => (
          <path
            className='mark loop'
            d={d}
            key={key}
            pathLength={1}
            transform={transform}
          />
        ))}
    </g>
  </>
)
