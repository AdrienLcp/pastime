import type React from 'react'

import type { StarsConflict } from '../engine/stars-conflicts'
import { columnOf, rowOf } from '../engine/stars-grid'
import type { StarsMark } from '../engine/stars-state'
import { pencilFilterOf } from './region-print'
import {
  CELL_UNITS,
  cellCentre,
  cellsOf,
  pencilCrossPath,
  pencilLoopPath,
  pencilStarPath
} from './stars-drawing'

/** How far inside its cell the hint's dashed box is drawn. */
const HINT_INSET = 4

const conflictLoops = ({
  conflict,
  index,
  size
}: {
  conflict: StarsConflict
  index: number
  size: number
}): { d: string; key: string }[] => {
  const [first, second] = conflict.cells
  if (
    conflict.kind === 'touching' &&
    first !== undefined &&
    second !== undefined
  ) {
    const from = cellCentre({ cell: first, size })
    const to = cellCentre({ cell: second, size })
    const reach = Math.hypot(to.x - from.x, to.y - from.y)
    return [
      {
        d: pencilLoopPath({
          radiusX: reach / 2 + CELL_UNITS * 0.58,
          radiusY: CELL_UNITS * 0.56,
          seed: 11 + index,
          tilt: Math.atan2(to.y - from.y, to.x - from.x),
          x: (from.x + to.x) / 2,
          y: (from.y + to.y) / 2
        }),
        key: `touching-${first}-${second}`
      }
    ]
  }
  return conflict.cells.map((cell) => ({
    d: pencilLoopPath({
      radiusX: CELL_UNITS * 0.5,
      radiusY: CELL_UNITS * 0.48,
      seed: 20 + cell,
      tilt: 0.3,
      ...cellCentre({ cell, size })
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
              d={pencilStarPath({
                radius: CELL_UNITS * 0.34,
                seed: cell * 7 + 3,
                ...centre
              })}
              key={`star-${cell}`}
              pathLength={1}
            />
          )
        const isCrossed = mark === 'cross' || ruledOut.has(cell)
        if (!isCrossed) return null
        return (
          <path
            className='mark cross'
            d={pencilCrossPath({
              reach: CELL_UNITS * 0.17,
              seed: cell * 13 + 1,
              ...centre
            })}
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
        .map(({ d, key }) => (
          <path className='mark loop' d={d} key={key} pathLength={1} />
        ))}
    </g>
  </>
)
